import {
  apiAdminAtualizarArtigo,
  apiAdminAtualizarLivro,
  apiAdminCriarArtigo,
  apiAdminCriarCategoria,
  apiAdminCriarLivro,
  apiAdminCriarSubcategoria,
  apiAdminExportarSeedCompendio,
  apiAdminListarLivros,
  apiAdminReordenarCompendio,
  apiBuscarEscudoMestre,
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
    vi.useRealTimers();
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

  it('returns empty books when the public compendio fetch times out', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation((_url: string, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(init.signal?.reason ?? new Error('aborted'));
        });
      });
    });

    const livrosPromise = apiListarLivros();

    await vi.advanceTimersByTimeAsync(5_100);

    await expect(livrosPromise).resolves.toEqual([]);
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

  it('loads the dynamic master shield from the compendium endpoint', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          secoes: [
            {
              id: 'ferimentos-morte',
              titulo: 'Ferimentos e Morte',
              fonte: 'BASE',
              referenciaCompendio: 'Livro Principal',
              resumoMarkdown: 'Resumo oficial',
              detalhadoMarkdown: 'Detalhe oficial',
              origens: [],
              avisos: [],
            },
          ],
          avisos: [],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    const escudo = await apiBuscarEscudoMestre();

    expect(escudo?.secoes[0]).toEqual(
      expect.objectContaining({
        id: 'ferimentos-morte',
        titulo: 'Ferimentos e Morte',
      }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/compendio/escudo-mestre',
      expect.objectContaining({
        cache: 'default',
        credentials: 'include',
      }),
    );
  });

  it('returns null when the dynamic master shield fails to load', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    const escudo = await apiBuscarEscudoMestre();

    expect(escudo).toBeNull();
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
      { cache: 'no-store', credentials: 'include' },
    );
  });

  it('updates compendio articles through the admin route', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 10,
          codigo: 'poderes-especiais',
          titulo: 'Poderes Especiais',
          resumo: null,
          ordem: 1,
          destaque: false,
          ativo: true,
          conteudo: '# Poderes Especiais',
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

    await apiAdminAtualizarArtigo(10, {
      titulo: 'Poderes Especiais',
      conteudo: '# Poderes Especiais',
      ativo: true,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/compendio/artigos/10',
      expect.objectContaining({
        method: 'PUT',
        cache: 'no-store',
        body: JSON.stringify({
          titulo: 'Poderes Especiais',
          conteudo: '# Poderes Especiais',
          ativo: true,
        }),
      }),
    );
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.headers).toBeInstanceOf(Headers);
    expect((init.headers as Headers).get('Content-Type')).toBe('application/json');
  });

  it('lists all books through the admin route', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await apiAdminListarLivros();

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/compendio/admin/livros',
      expect.objectContaining({
        method: 'GET',
        cache: 'no-store',
      }),
    );
  });

  it('creates and updates compendium books through admin routes', async () => {
    const livro = {
      id: 1,
      codigo: 'novo-livro',
      titulo: 'Novo livro',
      descricao: null,
      icone: null,
      cor: null,
      ordem: 0,
      status: 'RASCUNHO',
      suplementoId: null,
      criadoEm: '2026-05-24T00:00:00.000Z',
      atualizadoEm: '2026-05-24T00:00:00.000Z',
      categorias: [],
    };
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify(livro), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ...livro, status: 'PUBLICADO' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    await apiAdminCriarLivro({ titulo: 'Novo livro', status: 'RASCUNHO' });
    await apiAdminAtualizarLivro(1, { status: 'PUBLICADO' });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://localhost:3000/compendio/admin/livros',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ titulo: 'Novo livro', status: 'RASCUNHO' }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://localhost:3000/compendio/admin/livros/1',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ status: 'PUBLICADO' }),
      }),
    );
  });

  it('creates compendium tree nodes through admin write routes', async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 1 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 2 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 3 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    await apiAdminCriarCategoria({ nome: 'Capitulo', livroId: 1 });
    await apiAdminCriarSubcategoria({ nome: 'Topico', categoriaId: 2 });
    await apiAdminCriarArtigo({
      titulo: 'Artigo',
      conteudo: '# Artigo',
      subcategoriaId: 3,
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://localhost:3000/compendio/categorias',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://localhost:3000/compendio/subcategorias',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'http://localhost:3000/compendio/artigos',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('reorders compendium nodes through the admin route', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ sucesso: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await apiAdminReordenarCompendio({ tipo: 'artigo', ids: [3, 1, 2] });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/compendio/admin/reordenar',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ tipo: 'artigo', ids: [3, 1, 2] }),
      }),
    );
  });

  it('exports the compendium seed through the admin route', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          version: 1,
          source: 'database',
          exportedAt: '2026-05-15T15:30:00.000Z',
          livros: [],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    const seed = await apiAdminExportarSeedCompendio();

    expect(seed).toEqual({
      version: 1,
      source: 'database',
      exportedAt: '2026-05-15T15:30:00.000Z',
      livros: [],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/compendio/admin/exportar-seed',
      expect.objectContaining({
        method: 'GET',
        cache: 'no-store',
      }),
    );
  });
});
