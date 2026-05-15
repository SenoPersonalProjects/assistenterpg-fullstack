const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export type CompendioStatusPublicacao = 'RASCUNHO' | 'PUBLICADO' | 'ARQUIVADO';

export interface CompendioLivro {
  id: number;
  codigo: string;
  titulo: string;
  descricao: string | null;
  icone: string | null;
  cor: string | null;
  ordem: number;
  status: CompendioStatusPublicacao;
  suplementoId: number | null;
  criadoEm: string;
  atualizadoEm: string;
  categorias: CompendioCategoria[];
}

export interface CompendioCategoria {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  icone: string | null;
  cor: string | null;
  livroId: number;
  ordem: number;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
  livro?: Omit<CompendioLivro, 'categorias'>;
  subcategorias: CompendioSubcategoriaComArtigo[];
}

export interface CompendioSubcategoria {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  categoriaId: number;
  ordem: number;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
  categoria: CompendioCategoria;
}

export interface CompendioSubcategoriaComArtigo extends CompendioSubcategoria {
  artigos: CompendioArtigoResumido[];
}

export interface CompendioArtigoResumido {
  id: number;
  codigo: string;
  titulo: string;
  resumo: string | null;
  ordem: number;
  destaque: boolean;
  ativo: boolean;
}

export interface CompendioArtigoCompleto extends CompendioArtigoResumido {
  conteudo: string;
  tags: string[] | null;
  palavrasChave: string | null;
  nivelDificuldade: string | null;
  artigosRelacionados: string[] | null;
  subcategoria: CompendioSubcategoria;
}

type ApiErrorBody = {
  message?: string | string[];
  [key: string]: unknown;
};

class ApiError extends Error {
  status: number;
  body: ApiErrorBody | null;

  constructor(message: string, status: number, body: ApiErrorBody | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function logCompendioWarning(context: string, error: unknown): void {
  console.warn(`[compendio] ${context}: ${errorMessage(error)}`);
}

async function parseApiError(
  res: Response,
  fallback: string,
): Promise<{ message: string; body: ApiErrorBody | null }> {
  const body = (await res.json().catch(() => null)) as ApiErrorBody | null;

  if (body && typeof body === 'object' && 'message' in body) {
    const msg = body.message;
    const message = Array.isArray(msg) ? msg.join(' ') : String(msg);
    return { message, body };
  }

  return { message: fallback, body };
}

async function fetchJson<T>(
  path: string,
  fallbackMessage: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, init);

  if (!res.ok) {
    const { message, body } = await parseApiError(res, fallbackMessage);
    throw new ApiError(message, res.status, body);
  }

  return res.json();
}

function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

export async function apiListarLivros(): Promise<CompendioLivro[]> {
  try {
    return await fetchJson<CompendioLivro[]>('/compendio/livros', 'Falha ao carregar livros', {
      cache: 'default',
      next: { revalidate: 300 },
    });
  } catch (error) {
    logCompendioWarning('Falha ao carregar livros; usando lista vazia', error);
    return [];
  }
}

export async function apiBuscarLivroPorCodigo(
  livroCodigo: string,
): Promise<CompendioLivro | null> {
  try {
    return await fetchJson<CompendioLivro>(
      `/compendio/livros/${livroCodigo}`,
      `Livro "${livroCodigo}" nao encontrado`,
      {
        cache: 'default',
        next: { revalidate: 300 },
      },
    );
  } catch (error) {
    if (isNotFound(error)) return null;
    logCompendioWarning(`Falha ao buscar livro "${livroCodigo}"; retornando nulo`, error);
    return null;
  }
}

export async function apiBuscarCategoriaDoLivroPorCodigo(
  livroCodigo: string,
  categoriaCodigo: string,
): Promise<CompendioCategoria | null> {
  try {
    return await fetchJson<CompendioCategoria>(
      `/compendio/livros/${livroCodigo}/categorias/${categoriaCodigo}`,
      `Categoria "${categoriaCodigo}" nao encontrada`,
      {
        cache: 'default',
        next: { revalidate: 60 },
      },
    );
  } catch (error) {
    if (isNotFound(error)) return null;
    logCompendioWarning(
      `Falha ao buscar categoria "${categoriaCodigo}" do livro "${livroCodigo}"; retornando nulo`,
      error,
    );
    return null;
  }
}

export async function apiBuscarSubcategoriaDoLivroPorCodigo(
  livroCodigo: string,
  categoriaCodigo: string,
  subcategoriaCodigo: string,
): Promise<CompendioSubcategoriaComArtigo | null> {
  try {
    return await fetchJson<CompendioSubcategoriaComArtigo>(
      `/compendio/livros/${livroCodigo}/categorias/${categoriaCodigo}/subcategorias/${subcategoriaCodigo}`,
      `Subcategoria "${subcategoriaCodigo}" nao encontrada`,
      {
        cache: 'default',
        next: { revalidate: 60 },
      },
    );
  } catch (error) {
    if (isNotFound(error)) return null;
    logCompendioWarning(
      `Falha ao buscar subcategoria "${subcategoriaCodigo}" do livro "${livroCodigo}"; retornando nulo`,
      error,
    );
    return null;
  }
}

export async function apiBuscarArtigoDoLivroPorCodigo(
  livroCodigo: string,
  categoriaCodigo: string,
  subcategoriaCodigo: string,
  artigoCodigo: string,
): Promise<CompendioArtigoCompleto | null> {
  try {
    return await fetchJson<CompendioArtigoCompleto>(
      `/compendio/livros/${livroCodigo}/categorias/${categoriaCodigo}/subcategorias/${subcategoriaCodigo}/artigos/${artigoCodigo}`,
      `Artigo "${artigoCodigo}" nao encontrado`,
      {
        cache: 'default',
        next: { revalidate: 600 },
      },
    );
  } catch (error) {
    if (isNotFound(error)) return null;
    logCompendioWarning(
      `Falha ao buscar artigo "${artigoCodigo}" do livro "${livroCodigo}"; retornando nulo`,
      error,
    );
    return null;
  }
}

export async function apiListarCategorias(): Promise<CompendioCategoria[]> {
  try {
    return await fetchJson<CompendioCategoria[]>(
      '/compendio/categorias',
      'Falha ao carregar categorias',
      {
        cache: 'default',
        next: { revalidate: 300 },
      },
    );
  } catch (error) {
    logCompendioWarning('Falha ao carregar categorias; usando lista vazia', error);
    return [];
  }
}

export async function apiBuscarCategoriaPorCodigo(
  codigo: string,
): Promise<CompendioCategoria | null> {
  try {
    return await fetchJson<CompendioCategoria>(
      `/compendio/categorias/codigo/${codigo}`,
      `Categoria "${codigo}" nao encontrada`,
      {
        cache: 'default',
        next: { revalidate: 60 },
      },
    );
  } catch (error) {
    if (isNotFound(error)) return null;
    logCompendioWarning(`Falha ao buscar categoria "${codigo}"; retornando nulo`, error);
    return null;
  }
}

export async function apiListarSubcategorias(
  categoriaId: number,
): Promise<CompendioSubcategoriaComArtigo[]> {
  return fetchJson<CompendioSubcategoriaComArtigo[]>(
    `/compendio/categorias/${categoriaId}/subcategorias`,
    'Falha ao carregar subcategorias',
    {
      cache: 'default',
      next: { revalidate: 300 },
    },
  );
}

export async function apiBuscarSubcategoriaPorCodigo(
  codigo: string,
): Promise<CompendioSubcategoriaComArtigo | null> {
  try {
    return await fetchJson<CompendioSubcategoriaComArtigo>(
      `/compendio/subcategorias/codigo/${codigo}`,
      `Subcategoria "${codigo}" nao encontrada`,
      {
        cache: 'default',
        next: { revalidate: 60 },
      },
    );
  } catch (error) {
    if (isNotFound(error)) return null;
    logCompendioWarning(`Falha ao buscar subcategoria "${codigo}"; retornando nulo`, error);
    return null;
  }
}

export async function apiBuscarArtigoPorCodigo(
  codigo: string,
): Promise<CompendioArtigoCompleto | null> {
  try {
    return await fetchJson<CompendioArtigoCompleto>(
      `/compendio/artigos/codigo/${codigo}`,
      `Artigo "${codigo}" nao encontrado`,
      {
        cache: 'default',
        next: { revalidate: 600 },
      },
    );
  } catch (error) {
    if (isNotFound(error)) return null;
    logCompendioWarning(`Falha ao buscar artigo "${codigo}"; retornando nulo`, error);
    return null;
  }
}

export async function apiListarDestaques(
  livroCodigo?: string,
): Promise<CompendioArtigoCompleto[]> {
  try {
    const params = livroCodigo ? `?livroCodigo=${encodeURIComponent(livroCodigo)}` : '';
    return await fetchJson<CompendioArtigoCompleto[]>(
      `/compendio/destaques${params}`,
      'Falha ao carregar destaques',
      {
        cache: 'default',
        next: { revalidate: 300 },
      },
    );
  } catch (error) {
    logCompendioWarning('Falha ao carregar destaques; usando lista vazia', error);
    return [];
  }
}

export async function apiBuscarCompendio(
  query: string,
  livroCodigo?: string,
): Promise<CompendioArtigoCompleto[]> {
  if (!query || query.trim().length < 3) {
    return [];
  }

  try {
    const params = new URLSearchParams({ q: query });
    if (livroCodigo) params.set('livroCodigo', livroCodigo);

    return await fetchJson<CompendioArtigoCompleto[]>(
      `/compendio/buscar?${params.toString()}`,
      'Falha na busca',
      { cache: 'no-store' },
    );
  } catch (error) {
    logCompendioWarning('Falha na busca do compendio; usando lista vazia', error);
    return [];
  }
}

export async function apiListarTodosArtigos(): Promise<CompendioArtigoCompleto[]> {
  return fetchJson<CompendioArtigoCompleto[]>(
    '/compendio/artigos?todas=true',
    'Falha ao carregar artigos',
    {
      cache: 'default',
      next: { revalidate: 3600 },
    },
  );
}

export const compendioApi = {
  listarLivros: apiListarLivros,
  buscarLivroPorCodigo: apiBuscarLivroPorCodigo,
  buscarCategoriaDoLivroPorCodigo: apiBuscarCategoriaDoLivroPorCodigo,
  buscarSubcategoriaDoLivroPorCodigo: apiBuscarSubcategoriaDoLivroPorCodigo,
  buscarArtigoDoLivroPorCodigo: apiBuscarArtigoDoLivroPorCodigo,
  listarCategorias: apiListarCategorias,
  buscarCategoriaPorCodigo: apiBuscarCategoriaPorCodigo,
  listarSubcategorias: apiListarSubcategorias,
  buscarSubcategoriaPorCodigo: apiBuscarSubcategoriaPorCodigo,
  buscarArtigoPorCodigo: apiBuscarArtigoPorCodigo,
  listarDestaques: apiListarDestaques,
  buscar: apiBuscarCompendio,
  listarTodosArtigos: apiListarTodosArtigos,
};
