import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./axios-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

import { apiClient } from './axios-client';
import { apiGetTodasModificacoes } from './modificacoes';

type AxiosLike = {
  get: ReturnType<typeof vi.fn>;
};

const mockedApiClient = apiClient as unknown as AxiosLike;

describe('apiGetTodasModificacoes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads all pages and keeps mapped payload fields', async () => {
    mockedApiClient.get.mockImplementation((url: string) => {
      const parsed = new URL(`http://localhost${url}`);
      const pagina = Number(parsed.searchParams.get('pagina') || '1');
      const limite = Number(parsed.searchParams.get('limite') || '100');

      return Promise.resolve({
        data: {
          items: [
            {
              id: pagina,
              codigo: `MOD_${pagina}`,
              nome: `Modificacao ${pagina}`,
              tipo: 'ARMA',
              descricao: null,
              incrementoEspacos: pagina,
              restricoes: {
                apenasAmaldicoados: pagina % 2 === 0,
                complexidadeMinima: pagina === 3 ? 'MEDIO' : null,
              },
            },
          ],
          total: 3,
          page: pagina,
          limit: limite,
          totalPages: 3,
        },
      });
    });

    const itens = await apiGetTodasModificacoes({ limitePorPagina: 2 });

    expect(itens.map((item) => item.codigo)).toEqual(['MOD_1', 'MOD_2', 'MOD_3']);
    expect(itens[1]?.apenasAmaldicoadas).toBe(true);
    expect(itens[2]?.requerComplexidade).toBe('MEDIO');
    expect(mockedApiClient.get).toHaveBeenCalledTimes(3);
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      1,
      '/modificacoes?pagina=1&limite=2',
    );
  });

  it('avoids extra requests when first page already has all data', async () => {
    mockedApiClient.get.mockResolvedValue({
      data: {
        items: [
          {
            id: 20,
            codigo: 'MOD_20',
            nome: 'Modificacao 20',
            tipo: 'ARMA',
            incrementoEspacos: 0,
          },
        ],
        total: 1,
        page: 1,
        limit: 100,
        totalPages: 1,
      },
    });

    const itens = await apiGetTodasModificacoes();

    expect(itens).toHaveLength(1);
    expect(itens[0]?.codigo).toBe('MOD_20');
    expect(mockedApiClient.get).toHaveBeenCalledTimes(1);
  });
});
