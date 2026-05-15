import {
  apiBuscarArtigoDoLivroPorCodigo,
  apiBuscarArtigoPorCodigo,
  apiBuscarCategoriaPorCodigo,
  apiBuscarCompendio,
  apiBuscarLivroPorCodigo,
  apiBuscarSubcategoriaPorCodigo,
  apiListarCategorias,
  apiListarDestaques,
  apiListarLivros,
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

  it('returns empty books on network failure', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    const livros = await apiListarLivros();

    expect(livros).toEqual([]);
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

  it('returns null when book by code is not found', async () => {
    fetchMock.mockResolvedValue(new Response('not found', { status: 404 }));

    const livro = await apiBuscarLivroPorCodigo('livro-inexistente');

    expect(livro).toBeNull();
  });

  it('uses scoped book article route', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          codigo: 'atributos',
          titulo: 'Atributos',
          resumo: null,
          ordem: 1,
          destaque: false,
          ativo: true,
          conteudo: '# Atributos',
          tags: [],
          palavrasChave: null,
          nivelDificuldade: null,
          artigosRelacionados: null,
          subcategoria: {},
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    await apiBuscarArtigoDoLivroPorCodigo(
      'livro-principal',
      'regras-basicas',
      'fundamentos',
      'atributos',
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/compendio/livros/livro-principal/categorias/regras-basicas/subcategorias/fundamentos/artigos/atributos',
      expect.any(Object),
    );
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

  it('passes book code to compendio search when provided', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await apiBuscarCompendio('energia', 'livro-principal');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/compendio/buscar?q=energia&livroCodigo=livro-principal',
      { cache: 'no-store' },
    );
  });
});
