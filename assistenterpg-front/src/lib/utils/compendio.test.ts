import {
  apiBuscarArtigoPorCodigo,
  apiBuscarCategoriaPorCodigo,
  apiBuscarCompendio,
  apiBuscarSubcategoriaPorCodigo,
  apiListarCategorias,
  apiListarDestaques,
} from './compendio';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('compendio api fallbacks', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    warnSpy.mockRestore();
  });

  it('returns empty categories on network failure', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    const categorias = await apiListarCategorias();

    expect(categorias).toEqual([]);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('returns empty highlights on backend error', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: 'erro interno' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const destaques = await apiListarDestaques();

    expect(destaques).toEqual([]);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('returns null when category by code is not found', async () => {
    fetchMock.mockResolvedValue(new Response('not found', { status: 404 }));

    const categoria = await apiBuscarCategoriaPorCodigo('categoria-inexistente');

    expect(categoria).toBeNull();
  });

  it('returns null when subcategory by code is not found', async () => {
    fetchMock.mockResolvedValue(new Response('not found', { status: 404 }));

    const subcategoria = await apiBuscarSubcategoriaPorCodigo(
      'subcategoria-inexistente',
    );

    expect(subcategoria).toBeNull();
  });

  it('returns null when article by code is not found', async () => {
    fetchMock.mockResolvedValue(new Response('not found', { status: 404 }));

    const artigo = await apiBuscarArtigoPorCodigo('artigo-inexistente');

    expect(artigo).toBeNull();
  });

  it('does not call fetch for short compendio search terms', async () => {
    const resultados = await apiBuscarCompendio('ab');

    expect(resultados).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns empty search results when fetch fails', async () => {
    fetchMock.mockRejectedValue(new Error('timeout'));

    const resultados = await apiBuscarCompendio('energia');

    expect(resultados).toEqual([]);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
