import { describe, expect, it } from 'vitest';
import { normalizeListResult } from './pagination';

describe('normalizeListResult', () => {
  it('normalizes raw array payloads', () => {
    const result = normalizeListResult([{ id: 1 }, { id: 2 }]);

    expect(result).toEqual({
      items: [{ id: 1 }, { id: 2 }],
      total: 2,
      page: 1,
      limit: 2,
      totalPages: 1,
    });
  });

  it('keeps canonical envelope fields', () => {
    const result = normalizeListResult({
      items: [{ id: 10 }],
      total: 10,
      page: 2,
      limit: 5,
      totalPages: 2,
    });

    expect(result).toEqual({
      items: [{ id: 10 }],
      total: 10,
      page: 2,
      limit: 5,
      totalPages: 2,
    });
  });

  it('normalizes pt-BR envelope with dados/paginacao', () => {
    const result = normalizeListResult({
      dados: [{ id: 1 }, { id: 2 }, { id: 3 }],
      paginacao: {
        pagina: 3,
        limite: 3,
        total: 9,
        totalPaginas: 3,
      },
    });

    expect(result).toEqual({
      items: [{ id: 1 }, { id: 2 }, { id: 3 }],
      total: 9,
      page: 3,
      limit: 3,
      totalPages: 3,
    });
  });

  it('infers totalPages when backend does not provide it', () => {
    const result = normalizeListResult({
      items: [{ id: 1 }, { id: 2 }],
      total: 7,
      page: 1,
      limit: 2,
    });

    expect(result.totalPages).toBe(4);
  });

  it('falls back safely for malformed values', () => {
    const result = normalizeListResult({
      items: 'invalido',
      total: 'x',
      page: -1,
      limit: 0,
      totalPages: null,
    });

    expect(result).toEqual({
      items: [],
      total: 0,
      page: -1,
      limit: 0,
      totalPages: 1,
    });
  });
});
