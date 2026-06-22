import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./axios-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

import { apiClient } from './axios-client';
import { apiGetGuiaImportacaoHomebrewJson } from './homebrews';
import { apiGetGuiaImportacaoNpcAmeacaJson } from './npcs-ameacas';
import { apiGetGuiaImportacaoPersonagemBaseJson } from './personagens-base';
import { apiAdminGetGuiaImportacaoTecnicasJson } from './suplemento-conteudos';

type AxiosLike = {
  get: ReturnType<typeof vi.fn>;
};

const mockedApiClient = apiClient as unknown as AxiosLike;

const guia = {
  schema: 'teste',
  schemaVersion: 1,
  descricao: 'Guia teste',
  regras: [],
  exportTypes: [],
  campos: [],
  exemplos: { minimo: {}, completo: {} },
  referencias: [],
};

describe('json import guide api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApiClient.get.mockResolvedValue({ data: guia });
  });

  it('fetches personagem-base import guide', async () => {
    await expect(apiGetGuiaImportacaoPersonagemBaseJson()).resolves.toBe(guia);
    expect(mockedApiClient.get).toHaveBeenCalledWith(
      '/personagens-base/importar-json/guia',
    );
  });

  it('fetches npc/ameaca import guide', async () => {
    await expect(apiGetGuiaImportacaoNpcAmeacaJson()).resolves.toBe(guia);
    expect(mockedApiClient.get).toHaveBeenCalledWith(
      '/npcs-ameacas/importar-json/guia',
    );
  });

  it('fetches homebrew import guide', async () => {
    await expect(apiGetGuiaImportacaoHomebrewJson()).resolves.toBe(guia);
    expect(mockedApiClient.get).toHaveBeenCalledWith(
      '/homebrews/importar-json/guia',
    );
  });

  it('fetches tecnica import guide', async () => {
    await expect(apiAdminGetGuiaImportacaoTecnicasJson()).resolves.toBe(guia);
    expect(mockedApiClient.get).toHaveBeenCalledWith(
      '/tecnicas-amaldicoadas/importar-json/guia',
    );
  });
});
