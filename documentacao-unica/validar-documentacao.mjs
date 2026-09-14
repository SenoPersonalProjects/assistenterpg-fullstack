import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, relative, resolve } from 'node:path';
import process from 'node:process';

const raiz = resolve(import.meta.dirname, '..');
const arquivosIgnorados = new Set([
  'documentacao-unica/PRIVATE-OPS.md',
  // O README monolítico é preservado como acervo de contratos legados. As
  // referências operacionais atuais ficam nos guias curtos, validados abaixo.
  'documentacao-unica/README.md',
]);
const pacotes = [
  JSON.parse(readFileSync(join(raiz, 'assistenterpg-back/package.json'), 'utf8')),
  JSON.parse(readFileSync(join(raiz, 'assistenterpg-front/package.json'), 'utf8')),
];

function listarMarkdown(diretorio) {
  return readdirSync(diretorio, { withFileTypes: true }).flatMap((entrada) => {
    const caminho = join(diretorio, entrada.name);
    if (entrada.isDirectory()) return listarMarkdown(caminho);
    return extname(entrada.name).toLowerCase() === '.md' ? [caminho] : [];
  });
}

function ehLinkLocal(destino) {
  return (
    destino.length > 0 &&
    !destino.startsWith('#') &&
    !destino.startsWith('/') &&
    !/^(https?:|mailto:|tel:|data:|javascript:)/i.test(destino)
  );
}

function validarLink(arquivo, destino, erros) {
  const semAncora = destino.split('#', 1)[0].replace(/^<|>$/g, '');
  if (!ehLinkLocal(semAncora)) return;

  const alvo = resolve(dirname(arquivo), semAncora);
  const relativo = relative(raiz, alvo);
  if (relativo.startsWith('..') || !existsSync(alvo)) {
    erros.push(`${relative(raiz, arquivo)}: link inexistente: ${destino}`);
  }
}

function validarScripts(arquivo, conteudo, erros) {
  const comandos = conteudo.matchAll(/npm\s+run\s+([^\s`]+)/g);
  for (const match of comandos) {
    const script = match[1];
    if (!pacotes.some((pacote) => pacote.scripts?.[script])) {
      erros.push(`${relative(raiz, arquivo)}: script inexistente: npm run ${script}`);
    }
  }
}

const erros = [];
const arquivos = [join(raiz, 'README.md'), ...listarMarkdown(join(raiz, 'documentacao-unica'))]
  .filter(
    (arquivo) =>
      !arquivosIgnorados.has(
        normalize(relative(raiz, arquivo)).replaceAll('\\', '/'),
      ),
  );

for (const arquivo of arquivos) {
  const conteudo = readFileSync(arquivo, 'utf8');
  for (const match of conteudo.matchAll(/\[[^\]]*\]\(([^)\s]+(?:\s+[^)]*)?)\)/g)) {
    validarLink(arquivo, match[1].trim(), erros);
  }
  validarScripts(arquivo, conteudo, erros);
}

if (erros.length > 0) {
  console.error('Falha na validação de documentação:');
  erros.forEach((erro) => console.error(`- ${erro}`));
  process.exitCode = 1;
} else {
  console.log(`Documentação validada: ${arquivos.length} arquivo(s), links e scripts locais.`);
}
