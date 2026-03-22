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
  apiInvalidatePreviewItensInventarioCache,
  apiPreviewItensInventario,
} from './inventario';

type AxiosLike = {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const mockedApiClient = apiClient as unknown as AxiosLike;

const payload = {
  forca: 2,
  prestigioBase: 0,
  itens: [
    {
      equipamentoId: 1,
      quantidade: 1,
      equipado: false,
      modificacoesIds: [],
      nomeCustomizado: null,
      notas: null,
    },
  ],
};

const payloadSanitizado = {
  forca: 2,
  prestigioBase: 0,
  itens: [
    {
      equipamentoId: 1,
      quantidade: 1,
      equipado: false,
      modificacoes: [],
      nomeCustomizado: undefined,
    },
  ],
};

function buildPreviewResponse(suffix: string) {
  return {
    itens: [
      {
        equipamentoId: 1,
        quantidade: 1,
        equipado: false,
        categoriaCalculada: '0',
        espacosCalculados: 1,
        nomeCustomizado: `Item-${suffix}`,
        modificacoes: [],
        equipamento: {
          id: 1,
          nome: `Equipamento ${suffix}`,
          codigo: `EQ-${suffix}`,
          tipo: 'ARMA',
          categoria: '0',
          espacos: 1,
        },
      },
    ],
    espacosBase: 10,
    espacosExtra: 0,
    espacosTotal: 10,
    espacosOcupados: 1,
    sobrecarregado: false,
    grauXama: {
      grau: 'INICIANTE',
      limitesPorCategoria: { '0': 99 },
    },
    itensPorCategoria: { '0': 1 },
  };
}

describe('inventario api preview cache and dedupe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiInvalidatePreviewItensInventarioCache();
  });

  it('dedupes in-flight preview request and serves from cache', async () => {
    type PreviewResponse = { data: ReturnType<typeof buildPreviewResponse> };
    let resolver!: (value: PreviewResponse) => void;
    mockedApiClient.post.mockReturnValueOnce(
      new Promise<PreviewResponse>((resolve) => {
        resolver = resolve;
      }),
    );

    const p1 = apiPreviewItensInventario(payload);
    const p2 = apiPreviewItensInventario(payload);

    expect(mockedApiClient.post).toHaveBeenCalledTimes(1);
    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/inventario/preview',
      payloadSanitizado,
    );

    resolver({ data: buildPreviewResponse('A') });

    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1.itens[0]?.nomeCustomizado).toBe('Item-A');
    expect(r2.itens[0]?.nomeCustomizado).toBe('Item-A');

    const r3 = await apiPreviewItensInventario(payload);

    expect(r3.itens[0]?.nomeCustomizado).toBe('Item-A');
    expect(mockedApiClient.post).toHaveBeenCalledTimes(1);
  });

  it('forces preview refresh when requested', async () => {
    mockedApiClient.post
      .mockResolvedValueOnce({ data: buildPreviewResponse('A') })
      .mockResolvedValueOnce({ data: buildPreviewResponse('B') });

    const primeiro = await apiPreviewItensInventario(payload);
    const segundo = await apiPreviewItensInventario(payload, { forceRefresh: true });

    expect(primeiro.itens[0]?.nomeCustomizado).toBe('Item-A');
    expect(segundo.itens[0]?.nomeCustomizado).toBe('Item-B');
    expect(mockedApiClient.post).toHaveBeenCalledTimes(2);
  });

  it('invalidates cache explicitly', async () => {
    mockedApiClient.post
      .mockResolvedValueOnce({ data: buildPreviewResponse('A') })
      .mockResolvedValueOnce({ data: buildPreviewResponse('C') });

    await apiPreviewItensInventario(payload);
    apiInvalidatePreviewItensInventarioCache();
    const refreshed = await apiPreviewItensInventario(payload);

    expect(refreshed.itens[0]?.nomeCustomizado).toBe('Item-C');
    expect(mockedApiClient.post).toHaveBeenCalledTimes(2);
  });
});
