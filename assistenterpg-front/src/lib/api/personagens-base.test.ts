import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./axios-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from './axios-client';
import {
  apiDeletePersonagemBase,
  apiGetPersonagemBase,
  apiInvalidatePersonagemBaseCache,
  apiInvalidatePersonagemBasePreviewCache,
  apiPreviewPersonagemBase,
  apiUpdatePersonagemBase,
} from './personagens-base';

type AxiosLike = {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const mockedApiClient = apiClient as unknown as AxiosLike;

describe('personagens-base api cache and invalidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiInvalidatePersonagemBaseCache();
    apiInvalidatePersonagemBasePreviewCache();
  });

  it('dedupes in-flight request for same key', async () => {
    let resolver: ((value: unknown) => void) | null = null;
    mockedApiClient.get.mockReturnValueOnce(
      new Promise((resolve) => {
        resolver = resolve;
      }),
    );

    const p1 = apiGetPersonagemBase(77, true);
    const p2 = apiGetPersonagemBase(77, true);

    expect(mockedApiClient.get).toHaveBeenCalledTimes(1);
    expect(mockedApiClient.get).toHaveBeenCalledWith(
      '/personagens-base/77?incluirInventario=true',
    );

    resolver?.({ data: { id: 77, nome: 'Kento', nivel: 3 } });
    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1).toEqual({ id: 77, nome: 'Kento', nivel: 3 });
    expect(r2).toEqual({ id: 77, nome: 'Kento', nivel: 3 });
  });

  it('keeps separate cache keys for incluirInventario', async () => {
    mockedApiClient.get
      .mockResolvedValueOnce({ data: { id: 12, inventario: true } })
      .mockResolvedValueOnce({ data: { id: 12, inventario: false } });

    const withInventory = await apiGetPersonagemBase(12, true);
    const withoutInventory = await apiGetPersonagemBase(12, false);

    expect(withInventory).toEqual({ id: 12, inventario: true });
    expect(withoutInventory).toEqual({ id: 12, inventario: false });
    expect(mockedApiClient.get).toHaveBeenCalledTimes(2);
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      1,
      '/personagens-base/12?incluirInventario=true',
    );
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(2, '/personagens-base/12');
  });

  it('invalidates cache after update and delete', async () => {
    mockedApiClient.get
      .mockResolvedValueOnce({ data: { id: 99, nome: 'Antes' } })
      .mockResolvedValueOnce({ data: { id: 99, nome: 'Depois Update' } })
      .mockResolvedValueOnce({ data: { id: 99, nome: 'Depois Delete' } });
    mockedApiClient.patch.mockResolvedValue({ data: { id: 99, nome: 'Depois Update' } });
    mockedApiClient.delete.mockResolvedValue(undefined);

    await apiGetPersonagemBase(99, true);

    await apiUpdatePersonagemBase(99, {
      nome: 'Alterado',
    });
    const afterUpdate = await apiGetPersonagemBase(99, true);
    expect(afterUpdate).toEqual({ id: 99, nome: 'Depois Update' });

    await apiDeletePersonagemBase(99);
    const afterDelete = await apiGetPersonagemBase(99, true);
    expect(afterDelete).toEqual({ id: 99, nome: 'Depois Delete' });

    expect(mockedApiClient.patch).toHaveBeenCalledWith('/personagens-base/99', {
      nome: 'Alterado',
    });
    expect(mockedApiClient.delete).toHaveBeenCalledWith('/personagens-base/99');
    expect(mockedApiClient.get).toHaveBeenCalledTimes(3);
  });

  it('dedupes in-flight preview request and serves from cache', async () => {
    const payload = {
      nome: 'Preview',
      nivel: 3,
      claId: 1,
      origemId: 2,
      classeId: 3,
      trilhaId: null,
      caminhoId: null,
      agilidade: 2,
      forca: 2,
      intelecto: 2,
      presenca: 2,
      vigor: 1,
      estudouEscolaTecnica: false,
      tecnicaInataId: null,
      atributoChaveEa: 'INT' as const,
      prestigioBase: 0,
      prestigioClaBase: null,
      idade: null,
      alinhamentoId: null,
      background: null,
      periciasClasseEscolhidasCodigos: [],
      periciasOrigemEscolhidasCodigos: [],
      periciasLivresCodigos: [],
      grausAprimoramento: [],
      proficienciasCodigos: [],
      grausTreinamento: [],
      itensInventario: [],
    };

    let resolver: ((value: unknown) => void) | null = null;
    mockedApiClient.post.mockReturnValueOnce(
      new Promise((resolve) => {
        resolver = resolve;
      }),
    );

    const p1 = apiPreviewPersonagemBase(payload);
    const p2 = apiPreviewPersonagemBase(payload);

    expect(mockedApiClient.post).toHaveBeenCalledTimes(1);
    expect(mockedApiClient.post).toHaveBeenCalledWith('/personagens-base/preview', payload);

    resolver?.({ data: { resumo: 'ok' } });
    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1).toEqual({ resumo: 'ok' });
    expect(r2).toEqual({ resumo: 'ok' });

    const r3 = await apiPreviewPersonagemBase(payload);
    expect(r3).toEqual({ resumo: 'ok' });
    expect(mockedApiClient.post).toHaveBeenCalledTimes(1);
  });

  it('forces preview refresh when requested', async () => {
    const payload = {
      nome: 'Preview2',
      nivel: 2,
      claId: 1,
      origemId: 2,
      classeId: 3,
      trilhaId: null,
      caminhoId: null,
      agilidade: 2,
      forca: 2,
      intelecto: 2,
      presenca: 2,
      vigor: 1,
      estudouEscolaTecnica: false,
      tecnicaInataId: null,
      atributoChaveEa: 'INT' as const,
      prestigioBase: 0,
      prestigioClaBase: null,
      idade: null,
      alinhamentoId: null,
      background: null,
      periciasClasseEscolhidasCodigos: [],
      periciasOrigemEscolhidasCodigos: [],
      periciasLivresCodigos: [],
      grausAprimoramento: [],
      proficienciasCodigos: [],
      grausTreinamento: [],
      itensInventario: [],
    };

    mockedApiClient.post
      .mockResolvedValueOnce({ data: { resumo: 'v1' } })
      .mockResolvedValueOnce({ data: { resumo: 'v2' } });

    const primeiro = await apiPreviewPersonagemBase(payload);
    const segundo = await apiPreviewPersonagemBase(payload, { forceRefresh: true });

    expect(primeiro).toEqual({ resumo: 'v1' });
    expect(segundo).toEqual({ resumo: 'v2' });
    expect(mockedApiClient.post).toHaveBeenCalledTimes(2);
  });
});
