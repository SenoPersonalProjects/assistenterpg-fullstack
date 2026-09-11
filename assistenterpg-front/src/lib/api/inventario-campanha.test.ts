import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./axios-client', () => ({
  apiClient: { get: vi.fn() },
}));

import { apiClient } from './axios-client';
import { apiGetCatalogoInventarioCampanha } from './inventario-campanha';

describe('apiGetCatalogoInventarioCampanha', () => {
  beforeEach(() => vi.clearAllMocks());

  it('consulta o catálogo autorizado para a ficha da campanha', async () => {
    const get = apiClient.get as ReturnType<typeof vi.fn>;
    get.mockResolvedValue({ data: [{ id: 1, nome: 'Item permitido' }] });

    await expect(apiGetCatalogoInventarioCampanha(12, 34)).resolves.toEqual([
      { id: 1, nome: 'Item permitido' },
    ]);
    expect(get).toHaveBeenCalledWith(
      '/campanhas/12/personagens/34/inventario/catalogo',
    );
  });

  it('normaliza respostas inválidas como catálogo vazio', async () => {
    const get = apiClient.get as ReturnType<typeof vi.fn>;
    get.mockResolvedValue({ data: { items: [] } });

    await expect(apiGetCatalogoInventarioCampanha(12, 34)).resolves.toEqual([]);
  });
});
