import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const OPERACOES_RAW = new Set([
  '$executeRaw',
  '$executeRawUnsafe',
  '$queryRaw',
  '$queryRawUnsafe',
]);

type MapeamentoTabela = {
  modelo: string;
  tabelaFisica: string;
};

type ViolacaoTabelaRaw = {
  arquivo: string;
  linha: number;
  modelo: string;
  tabelaFisica: string;
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

function escaparRegex(valor: string): string {
  return valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extrairMapeamentosTabelas(schema: string): MapeamentoTabela[] {
  const mapeamentos: MapeamentoTabela[] = [];
  const modelos = schema.matchAll(
    /model\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{([\s\S]*?)\r?\n\}/g,
  );

  for (const correspondencia of modelos) {
    const modelo = correspondencia[1];
    const corpo = correspondencia[2];
    const tabelaFisica = corpo.match(/@@map\("([^"]+)"\)/)?.[1];
    if (tabelaFisica && tabelaFisica !== modelo) {
      mapeamentos.push({ modelo, tabelaFisica });
    }
  }

  return mapeamentos;
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

function obterTextoSql(node: ts.Expression): string | null {
  if (ts.isTaggedTemplateExpression(node)) {
    return node.template.getText();
  }
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  return null;
}

function encontrarModeloLogicoNoSql(
  sql: string,
  mapeamentos: MapeamentoTabela[],
): MapeamentoTabela | null {
  for (const mapeamento of mapeamentos) {
    const modelo = escaparRegex(mapeamento.modelo);
    const referenciaTabela = new RegExp(
      String.raw`\b(?:FROM|JOIN|UPDATE|INSERT\s+INTO|DELETE\s+FROM)\s+\`?${modelo}\`?\b`,
      'i',
    );
    if (referenciaTabela.test(sql)) return mapeamento;
  }
  return null;
}

function coletarViolacoesTabelaRaw(
  source: ts.SourceFile,
  arquivo: string,
  mapeamentos: MapeamentoTabela[],
): ViolacaoTabelaRaw[] {
  const violacoes: ViolacaoTabelaRaw[] = [];

  const registrar = (node: ts.Node, sql: string | null) => {
    if (!sql) return;
    const mapeamento = encontrarModeloLogicoNoSql(sql, mapeamentos);
    if (!mapeamento) return;
    violacoes.push({
      arquivo,
      linha:
        source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
      ...mapeamento,
    });
  };

  const visitar = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      OPERACOES_RAW.has(nomePropriedade(node.expression) ?? '')
    ) {
      registrar(
        node,
        node.arguments[0] ? obterTextoSql(node.arguments[0]) : null,
      );
    }

    if (
      ts.isTaggedTemplateExpression(node) &&
      OPERACOES_RAW.has(nomePropriedade(node.tag) ?? '')
    ) {
      registrar(node, node.template.getText());
    }

    ts.forEachChild(node, visitar);
  };

  visitar(source);
  return violacoes;
}

describe('politica de nomes fisicos em SQL raw Prisma', () => {
  const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma');
  const mapeamentos = extrairMapeamentosTabelas(
    readFileSync(schemaPath, 'utf8'),
  );

  it('identifica nome logico de model mapeado e aceita o nome fisico', () => {
    const fixture = extrairMapeamentosTabelas(`
model InventarioItemBase {
  id Int @id
  @@map("inventario_item_base")
}
`);

    expect(
      encontrarModeloLogicoNoSql(
        'UPDATE InventarioItemBase SET id = 1',
        fixture,
      ),
    ).toEqual({
      modelo: 'InventarioItemBase',
      tabelaFisica: 'inventario_item_base',
    });
    expect(
      encontrarModeloLogicoNoSql(
        'UPDATE `inventario_item_base` SET id = 1',
        fixture,
      ),
    ).toBeNull();
  });

  it('nao permite nomes logicos de models com @@map em SQL raw de producao', () => {
    const diretorioSrc = path.resolve(__dirname, '..');
    const violacoes = listarArquivosTypeScript(diretorioSrc).flatMap(
      (arquivo) => {
        const source = ts.createSourceFile(
          arquivo,
          readFileSync(arquivo, 'utf8'),
          ts.ScriptTarget.Latest,
          true,
          ts.ScriptKind.TS,
        );
        return coletarViolacoesTabelaRaw(
          source,
          path.relative(diretorioSrc, arquivo).replaceAll('\\', '/'),
          mapeamentos,
        );
      },
    );

    expect(
      violacoes.map(
        ({ arquivo, linha, modelo, tabelaFisica }) =>
          `${arquivo}:${linha}: ${modelo} deve usar ${tabelaFisica}`,
      ),
    ).toEqual([]);
  });
});
