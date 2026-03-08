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
});

