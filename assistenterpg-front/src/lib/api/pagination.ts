export type ListResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type PaginationLike = {
  total?: number;
  page?: number;
  pagina?: number;
  limit?: number;
  limite?: number;
  totalPages?: number;
  totalPaginas?: number;
};

type ListEnvelope<T> =
  | T[]
  | {
      items?: T[];
      dados?: T[];
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
      paginacao?: PaginationLike;
    };

const toNumberOrFallback = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return fallback;
};

export function normalizeListResult<T>(payload: ListEnvelope<T> | unknown): ListResult<T> {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      total: payload.length,
      page: 1,
      limit: payload.length,
      totalPages: 1,
    };
  }

  const safe = (payload ?? {}) as {
    items?: unknown;
    dados?: unknown;
    total?: unknown;
    page?: unknown;
    limit?: unknown;
    totalPages?: unknown;
    paginacao?: PaginationLike;
  };

  const items = Array.isArray(safe.items)
    ? (safe.items as T[])
    : Array.isArray(safe.dados)
      ? (safe.dados as T[])
      : [];

  const page = toNumberOrFallback(safe.page ?? safe.paginacao?.pagina, 1);
  const limit = toNumberOrFallback(
    safe.limit ?? safe.paginacao?.limite,
    Math.max(items.length, 1),
  );
  const total = toNumberOrFallback(safe.total ?? safe.paginacao?.total, items.length);

  const inferredTotalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  const totalPages = toNumberOrFallback(
    safe.totalPages ?? safe.paginacao?.totalPaginas,
    inferredTotalPages,
  );

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}
