import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const OPERACOES_DELEGATE = new Set([
  'aggregate',
  'count',
  'create',
  'createMany',
  'delete',
  'deleteMany',
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'findUnique',
  'findUniqueOrThrow',
  'groupBy',
  'update',
  'updateMany',
  'upsert',
]);
const LEITURAS_PROTEGIDAS = new Set([
  'aggregate',
  'count',
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'findUnique',
  'findUniqueOrThrow',
  'groupBy',
]);
const ALLOWLIST_AWAIT_EM_LOOP = new Set<string>();

type Violacao = {
  arquivo: string;
  contexto: string;
  linhaTransacao: number;
  linhaLoop: number;
  operacao: string;
};

function listarArquivosTypeScript(diretorio: string): string[] {
  return readdirSync(diretorio, { withFileTypes: true }).flatMap((entrada) => {
    const caminho = path.join(diretorio, entrada.name);
    if (entrada.isDirectory()) return listarArquivosTypeScript(caminho);
    if (
      !entrada.isFile() ||
      !entrada.name.endsWith('.ts') ||
      entrada.name.endsWith('.spec.ts')
    ) {
      return [];
    }
    return [caminho];
  });
}

function nomePropriedade(node: ts.Expression): string | null {
  if (ts.isPropertyAccessExpression(node)) return node.name.text;
  if (
    ts.isElementAccessExpression(node) &&
    ts.isStringLiteral(node.argumentExpression)
  ) {
    return node.argumentExpression.text;
  }
  return null;
}

function ehLoop(node: ts.Node): boolean {
  return (
    ts.isForStatement(node) ||
    ts.isForInStatement(node) ||
    ts.isForOfStatement(node) ||
    ts.isWhileStatement(node) ||
    ts.isDoStatement(node)
  );
}

function linha(source: ts.SourceFile, node: ts.Node): number {
  return source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
}

function formatarViolacao(violacao: Violacao): string {
  return `${violacao.arquivo}:${violacao.contexto}:${violacao.operacao}`;
}

function obterContexto(node: ts.Node): string {
  let atual: ts.Node | undefined = node;
  while (atual) {
    if (
      (ts.isMethodDeclaration(atual) ||
        ts.isFunctionDeclaration(atual) ||
        ts.isFunctionExpression(atual)) &&
      atual.name &&
      ts.isIdentifier(atual.name)
    ) {
      return atual.name.text;
    }
    atual = atual.parent;
  }
  return '<anonimo>';
}

function coletarViolacoesAwaitEmLoop(
  source: ts.SourceFile,
  arquivo: string,
): Violacao[] {
  const violacoes: Violacao[] = [];

  const visitar = (node: ts.Node) => {
    if (!ts.isCallExpression(node)) {
      ts.forEachChild(node, visitar);
      return;
    }

    const nome = nomePropriedade(node.expression);
    if (nome !== '$transaction' && nome !== 'executarTransacao') {
      ts.forEachChild(node, visitar);
      return;
    }

    const callback = node.arguments[nome === 'executarTransacao' ? 1 : 0];
    if (
      !callback ||
      (!ts.isArrowFunction(callback) && !ts.isFunctionExpression(callback))
    ) {
      ts.forEachChild(node, visitar);
      return;
    }
    const parametroTx = callback.parameters[0]?.name;
    if (!parametroTx || !ts.isIdentifier(parametroTx)) {
      ts.forEachChild(node, visitar);
      return;
    }

    const visitarCallback = (atual: ts.Node, loops: ts.Node[]) => {
      const proximosLoops = ehLoop(atual) ? [...loops, atual] : loops;
      if (
        proximosLoops.length > 0 &&
        ts.isAwaitExpression(atual) &&
        ts.isCallExpression(atual.expression)
      ) {
        const operacao = nomePropriedade(atual.expression.expression);
        const delegateExpression = ts.isPropertyAccessExpression(
          atual.expression.expression,
        )
          ? atual.expression.expression.expression
          : null;
        const raizTx =
          delegateExpression &&
          ts.isPropertyAccessExpression(delegateExpression) &&
          ts.isIdentifier(delegateExpression.expression)
            ? delegateExpression.expression.text
            : null;

        if (
          operacao &&
          OPERACOES_DELEGATE.has(operacao) &&
          raizTx === parametroTx.text
        ) {
          violacoes.push({
            arquivo,
            contexto: obterContexto(node),
            linhaTransacao: linha(source, node),
            linhaLoop: linha(source, proximosLoops.at(-1)!),
            operacao,
          });
        }
      }
      ts.forEachChild(atual, (filho) => visitarCallback(filho, proximosLoops));
    };

    visitarCallback(callback.body, []);
    ts.forEachChild(node, visitar);
  };

  visitar(source);
  return violacoes;
}

function coletarLeiturasProtegidasEmLote(
  source: ts.SourceFile,
  arquivo: string,
): string[] {
  const violacoes: string[] = [];

  const visitar = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      nomePropriedade(node.expression) === '$transaction' &&
      node.arguments[0] &&
      ts.isArrayLiteralExpression(node.arguments[0])
    ) {
      for (const operacao of node.arguments[0].elements) {
        if (
          ts.isCallExpression(operacao) &&
          LEITURAS_PROTEGIDAS.has(nomePropriedade(operacao.expression) ?? '')
        ) {
          violacoes.push(
            `${arquivo}:${linha(source, operacao)}:${nomePropriedade(operacao.expression)}`,
          );
        }
      }
    }
    ts.forEachChild(node, visitar);
  };

  visitar(source);
  return violacoes;
}

describe('politica estatica de transacoes Prisma', () => {
  const diretorioSrc = path.resolve(__dirname, '..');
  const fontes = listarArquivosTypeScript(diretorioSrc).map((arquivo) => ({
    absoluto: arquivo,
    relativo: path.relative(diretorioSrc, arquivo).replaceAll('\\', '/'),
    source: ts.createSourceFile(
      arquivo,
      readFileSync(arquivo, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    ),
  }));

  it('nao introduz await sequencial de delegate em loops transacionais', () => {
    const violacoes = fontes
      .flatMap(({ relativo, source }) =>
        coletarViolacoesAwaitEmLoop(source, relativo),
      )
      .map(formatarViolacao);

    expect(
      violacoes.filter((violacao) => !ALLOWLIST_AWAIT_EM_LOOP.has(violacao)),
    ).toEqual([]);
    expect(
      [...ALLOWLIST_AWAIT_EM_LOOP].filter(
        (excecao) => !violacoes.includes(excecao),
      ),
    ).toEqual([]);
  });

  it('nao permite leituras com retry dentro de transaction em lote', () => {
    const violacoes = fontes.flatMap(({ relativo, source }) =>
      coletarLeiturasProtegidasEmLote(source, relativo),
    );

    expect(violacoes).toEqual([]);
  });
});
