// lib/api/compendio.ts
/**
 * API do Compendio (regras, artigos, categorias)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/* ============================================================================ */
/* TIPOS (ALINHADOS COM SERVICE) */
/* ============================================================================ */

export interface CompendioCategoria {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  icone: string | null;
  cor: string | null;
  ordem: number;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
  subcategorias: Array<CompendioSubcategoriaComArtigo[]>;
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
  categoria: {
    id: number;
    codigo: string;
    nome: string;
    icone: string | null;
    cor: string | null;
  };
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

/* ============================================================================ */
/* HELPER DE ERRO */
/* ============================================================================ */

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
  // Keep compendio pages renderable when API is temporarily unavailable.
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

/* ============================================================================ */
/* FUNCOES DA API */
/* ============================================================================ */

/**
 * Lista todas as categorias com subcategorias (cache: 5min)
 */
export async function apiListarCategorias(): Promise<CompendioCategoria[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/compendio/categorias`, {
      cache: 'default',
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      const { message, body } = await parseApiError(
        res,
        'Falha ao carregar categorias',
      );
      throw new ApiError(message, res.status, body);
    }

    return res.json();
  } catch (error) {
    logCompendioWarning('Falha ao carregar categorias; usando lista vazia', error);
    return [];
  }
}

/**
 * Busca categoria especifica por codigo (cache: 1min)
 */
export async function apiBuscarCategoriaPorCodigo(
  codigo: string,
): Promise<CompendioCategoria | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/compendio/categorias/codigo/${codigo}`, {
      cache: 'default',
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      if (res.status === 404) return null;

      const { message, body } = await parseApiError(
        res,
        `Categoria "${codigo}" nao encontrada`,
      );
      throw new ApiError(message, res.status, body);
    }

    return res.json();
  } catch (error) {
    logCompendioWarning(
      `Falha ao buscar categoria "${codigo}"; retornando nulo`,
      error,
    );
    return null;
  }
}

/**
 * Lista subcategorias de uma categoria (cache: 5min)
 */
export async function apiListarSubcategorias(
  categoriaId: number,
): Promise<CompendioSubcategoriaComArtigo[]> {
  const res = await fetch(`${API_BASE_URL}/compendio/categorias/${categoriaId}/subcategorias`, {
    cache: 'default',
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const { message, body } = await parseApiError(
      res,
      'Falha ao carregar subcategorias',
    );
    throw new ApiError(message, res.status, body);
  }

  return res.json();
}

/**
 * Busca subcategoria por codigo (cache: 1min)
 */
export async function apiBuscarSubcategoriaPorCodigo(
  codigo: string,
): Promise<CompendioSubcategoriaComArtigo | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/compendio/subcategorias/codigo/${codigo}`, {
      cache: 'default',
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      if (res.status === 404) return null;

      const { message, body } = await parseApiError(
        res,
        `Subcategoria "${codigo}" nao encontrada`,
      );
      throw new ApiError(message, res.status, body);
    }

    return res.json();
  } catch (error) {
    logCompendioWarning(
      `Falha ao buscar subcategoria "${codigo}"; retornando nulo`,
      error,
    );
    return null;
  }
}

/**
 * Busca artigo completo por codigo (cache: 10min)
 */
export async function apiBuscarArtigoPorCodigo(
  codigo: string,
): Promise<CompendioArtigoCompleto | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/compendio/artigos/codigo/${codigo}`, {
      cache: 'default',
      next: { revalidate: 600 },
    });

    if (!res.ok) {
      if (res.status === 404) return null;

      const { message, body } = await parseApiError(
        res,
        `Artigo "${codigo}" nao encontrado`,
      );
      throw new ApiError(message, res.status, body);
    }

    return res.json();
  } catch (error) {
    logCompendioWarning(
      `Falha ao buscar artigo "${codigo}"; retornando nulo`,
      error,
    );
    return null;
  }
}

/**
 * Lista artigos em destaque (cache: 5min)
 */
export async function apiListarDestaques(): Promise<CompendioArtigoCompleto[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/compendio/destaques`, {
      cache: 'default',
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      const { message, body } = await parseApiError(
        res,
        'Falha ao carregar destaques',
      );
      throw new ApiError(message, res.status, body);
    }

    return res.json();
  } catch (error) {
    logCompendioWarning('Falha ao carregar destaques; usando lista vazia', error);
    return [];
  }
}

/**
 * Busca artigos por termo (no cache)
 */
export async function apiBuscarCompendio(query: string): Promise<CompendioArtigoCompleto[]> {
  if (!query || query.trim().length < 3) {
    return [];
  }

  try {
    const res = await fetch(`${API_BASE_URL}/compendio/buscar?q=${encodeURIComponent(query)}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      const { message, body } = await parseApiError(res, 'Falha na busca');
      throw new ApiError(message, res.status, body);
    }

    return res.json();
  } catch (error) {
    logCompendioWarning('Falha na busca do compendio; usando lista vazia', error);
    return [];
  }
}

/**
 * Lista TODOS os artigos (admin/seed - cache longo)
 */
export async function apiListarTodosArtigos(): Promise<CompendioArtigoCompleto[]> {
  const res = await fetch(`${API_BASE_URL}/compendio/artigos?todas=true`, {
    cache: 'default',
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const { message, body } = await parseApiError(res, 'Falha ao carregar artigos');
    throw new ApiError(message, res.status, body);
  }

  return res.json();
}

/* ============================================================================ */
/* HELPER OBJECT (compatibilidade) */
/* ============================================================================ */

export const compendioApi = {
  listarCategorias: apiListarCategorias,
  buscarCategoriaPorCodigo: apiBuscarCategoriaPorCodigo,
  listarSubcategorias: apiListarSubcategorias,
  buscarSubcategoriaPorCodigo: apiBuscarSubcategoriaPorCodigo,
  buscarArtigoPorCodigo: apiBuscarArtigoPorCodigo,
  listarDestaques: apiListarDestaques,
  buscar: apiBuscarCompendio,
  listarTodosArtigos: apiListarTodosArtigos,
};
