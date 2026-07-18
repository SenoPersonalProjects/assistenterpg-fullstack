import { readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

const DIRETORIOS_INTERFACE = ['app', 'components', 'hooks'].map((diretorio) =>
  join(process.cwd(), 'src', diretorio),
);
const EXTENSOES_CODIGO = new Set(['.ts', '.tsx', '.js', '.jsx']);

function listarArquivos(diretorio: string): string[] {
  return readdirSync(diretorio, { withFileTypes: true }).flatMap((entrada) => {
    const caminho = join(diretorio, entrada.name);
    if (entrada.isDirectory()) return listarArquivos(caminho);
    if (!EXTENSOES_CODIGO.has(extname(entrada.name))) return [];
    if (/\.(?:test|spec)\.[jt]sx?$/.test(entrada.name)) return [];
    return [caminho];
  });
}

describe('dialogos da interface', () => {
  it('nao usa alertas, prompts ou confirmacoes nativas do navegador', () => {
    const infracoes = DIRETORIOS_INTERFACE.flatMap(listarArquivos).flatMap(
      (arquivo) => {
        const conteudo = readFileSync(arquivo, 'utf8');
        const linhas = conteudo.split(/\r?\n/);
        return linhas.flatMap((linha, indice) => {
          const usaDialogoExplicito =
            /\b(?:window|globalThis|self)\.(?:alert|confirm|prompt)\s*\(/.test(
              linha,
            );
          const usaAlertOuPromptGlobal =
            /(?<![\w.])(?:alert|prompt)\s*\(/.test(linha);
          const usaConfirmacaoGlobal =
            /(?<![\w.])confirm\s*\((?!\s*\{)/.test(linha);
          return usaDialogoExplicito || usaAlertOuPromptGlobal || usaConfirmacaoGlobal
            ? [`${arquivo}:${indice + 1}`]
            : [];
        });
      },
    );

    expect(infracoes).toEqual([]);
  });
});
