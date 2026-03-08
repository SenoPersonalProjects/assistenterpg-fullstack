import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./axios-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from './axios-client';
import {
  apiDeleteCampanha,
  apiGetCampanhaById,
  apiInvalidateCampanhaDetalheCache,
} from './campanhas';

type AxiosLike = {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const mockedApiClient = apiClient as unknown as AxiosLike;

describe('campanhas api cache and dedupe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiInvalidateCampanhaDetalheCache();
  });

  it('dedupes in-flight request and serves from cache', async () => {
    let resolver: ((value: unknown) => void) | null = null;
    mockedApiClient.get.mockReturnValueOnce(
      new Promise((resolve) => {
        resolver = resolve;
      }),
    );

    const p1 = apiGetCampanhaById<{ id: number; nome: string }>(123);
    const p2 = apiGetCampanhaById<{ id: number; nome: string }>(123);

    expect(mockedApiClient.get).toHaveBeenCalledTimes(1);
    expect(mockedApiClient.get).toHaveBeenCalledWith('/campanhas/123');

    resolver?.({ data: { id: 123, nome: 'Campanha Alpha' } });
    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1).toEqual({ id: 123, nome: 'Campanha Alpha' });
    expect(r2).toEqual({ id: 123, nome: 'Campanha Alpha' });

    const r3 = await apiGetCampanhaById<{ id: number; nome: string }>(123);
    expect(r3).toEqual({ id: 123, nome: 'Campanha Alpha' });
    expect(mockedApiClient.get).toHaveBeenCalledTimes(1);
  });

  it('forces refresh when requested', async () => {
    mockedApiClient.get
      .mockResolvedValueOnce({ data: { id: 10, nome: 'Versao 1' } })
      .mockResolvedValueOnce({ data: { id: 10, nome: 'Versao 2' } });

    const primeiro = await apiGetCampanhaById<{ id: number; nome: string }>(10);
    const segundo = await apiGetCampanhaById<{ id: number; nome: string }>(10, {
      forceRefresh: true,
    });

    expect(primeiro.nome).toBe('Versao 1');
    expect(segundo.nome).toBe('Versao 2');
    expect(mockedApiClient.get).toHaveBeenCalledTimes(2);
  });

  it('invalidates cached detail after delete', async () => {
    mockedApiClient.get
      .mockResolvedValueOnce({ data: { id: 5, nome: 'Antes' } })
      .mockResolvedValueOnce({ data: { id: 5, nome: 'Depois' } });
    mockedApiClient.delete.mockResolvedValue(undefined);

    const antes = await apiGetCampanhaById<{ id: number; nome: string }>(5);
    expect(antes.nome).toBe('Antes');

    await apiDeleteCampanha(5);
    const depois = await apiGetCampanhaById<{ id: number; nome: string }>(5);

    expect(mockedApiClient.delete).toHaveBeenCalledWith('/campanhas/5');
    expect(mockedApiClient.get).toHaveBeenCalledTimes(2);
    expect(depois.nome).toBe('Depois');
  });
});

