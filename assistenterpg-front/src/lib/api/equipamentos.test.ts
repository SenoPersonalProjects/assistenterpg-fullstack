import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./axios-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

import { apiClient } from './axios-client';
import { apiGetTodosEquipamentos } from './equipamentos';

type AxiosLike = {
  get: ReturnType<typeof vi.fn>;
};

const mockedApiClient = apiClient as unknown as AxiosLike;

describe('apiGetTodosEquipamentos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads all pages and concatenates items in order', async () => {
    mockedApiClient.get.mockImplementation((url: string) => {
      const parsed = new URL(`http://localhost${url}`);
      const pagina = Number(parsed.searchParams.get('pagina') || '1');
      const limite = Number(parsed.searchParams.get('limite') || '100');

      return Promise.resolve({
        data: {
          items: [
            {
              id: pagina,
              codigo: `EQ_${pagina}`,
              nome: `Equipamento ${pagina}`,
              tipo: 'ARMA',
              categoria: '1',
              espacos: 1,
            },
          ],
          total: 3,
          page: pagina,
          limit: limite,
          totalPages: 3,
        },
      });
    });

    const itens = await apiGetTodosEquipamentos({ limitePorPagina: 2 });

    expect(itens.map((item) => item.id)).toEqual([1, 2, 3]);
    expect(mockedApiClient.get).toHaveBeenCalledTimes(3);
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      1,
      '/equipamentos?pagina=1&limite=2',
    );
  });

  it('avoids extra requests when there is only one page', async () => {
    mockedApiClient.get.mockResolvedValue({
      data: {
        items: [
          {
            id: 10,
            codigo: 'EQ_10',
            nome: 'Equipamento 10',
            tipo: 'ARMA',
            categoria: '1',
            espacos: 1,
          },
        ],
        total: 1,
        page: 1,
        limit: 100,
        totalPages: 1,
      },
    });

    const itens = await apiGetTodosEquipamentos();

    expect(itens).toHaveLength(1);
    expect(itens[0]?.id).toBe(10);
    expect(mockedApiClient.get).toHaveBeenCalledTimes(1);
  });
});
