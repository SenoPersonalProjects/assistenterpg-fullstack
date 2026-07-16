import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC_DIR = join(process.cwd(), 'src');
const API_CAMPANHAS = join(SRC_DIR, 'lib', 'api', 'campanhas.ts');
const HOOK_CHAT = join(SRC_DIR, 'hooks', 'useSessaoChat.ts');
const HELPER_LEGADO = 'apiEnviarMensagemChatSessaoCampanha';
const HELPER_TEXTUAL = 'apiEnviarMensagemTextoSessaoCampanha';
const ENDPOINT_CHAT = '/sessoes/${sessaoId}/chat';

function listarArquivosProdutivos(diretorio: string): string[] {
  return readdirSync(diretorio, { withFileTypes: true }).flatMap((entrada) => {
    const caminho = join(diretorio, entrada.name);
    if (entrada.isDirectory()) return listarArquivosProdutivos(caminho);
    if (!/\.(ts|tsx)$/.test(entrada.name)) return [];
    if (/\.(test|spec)\.(ts|tsx)$/.test(entrada.name)) return [];
    return [caminho];
  });
}

describe('guardas arquiteturais do chat de sessao', () => {
  const apiSource = readFileSync(API_CAMPANHAS, 'utf8');
  const hookSource = readFileSync(HOOK_CHAT, 'utf8');
  const demaisFontes = listarArquivosProdutivos(SRC_DIR).filter(
    (arquivo) => arquivo !== API_CAMPANHAS,
  );

  it('mantem o helper legado deprecated e fora dos fluxos produtivos', () => {
    const declaracao = apiSource.indexOf(
      `export async function ${HELPER_LEGADO}`,
    );
    expect(declaracao).toBeGreaterThan(0);
    expect(apiSource.slice(Math.max(0, declaracao - 400), declaracao)).toContain(
      '@deprecated',
    );

    const usosIndevidos = demaisFontes
      .filter((arquivo) => readFileSync(arquivo, 'utf8').includes(HELPER_LEGADO))
      .map((arquivo) => relative(SRC_DIR, arquivo));
    expect(usosIndevidos).toEqual([]);
  });

  it('reserva o chat oficial ao helper textual', () => {
    expect(hookSource).toContain(HELPER_TEXTUAL);
    expect(hookSource).not.toContain(HELPER_LEGADO);

    const postsDiretos = demaisFontes
      .filter((arquivo) => readFileSync(arquivo, 'utf8').includes(ENDPOINT_CHAT))
      .map((arquivo) => relative(SRC_DIR, arquivo));
    expect(postsDiretos).toEqual([]);
  });
});
