import { describe, expect, it } from 'vitest';
import { resolverListaPaginada } from './lista-paginada';

describe('resolverListaPaginada', () => {
  it('applies list data when page is within range', () => {
    const result = resolverListaPaginada(2, {
      items: [{ id: 1 }, { id: 2 }],
      total: 20,
      totalPages: 10,
    });

    expect(result).toEqual({
      acao: 'aplicar-dados',
      items: [{ id: 1 }, { id: 2 }],
      total: 20,
      totalPaginas: 10,
    });
  });

  it('adjusts page when current page is out of range and list is empty', () => {
    const result = resolverListaPaginada(5, {
      items: [],
      total: 40,
      totalPages: 4,
    });

    expect(result).toEqual({
      acao: 'ajustar-pagina',
      pagina: 4,
      totalPaginas: 4,
    });
  });

  it('does not adjust when empty list is on first page', () => {
    const result = resolverListaPaginada(1, {
      items: [],
      total: 0,
      totalPages: 0,
    });

    expect(result).toEqual({
      acao: 'aplicar-dados',
      items: [],
      total: 0,
      totalPaginas: 1,
    });
  });

  it('normalizes totalPages minimum to 1', () => {
    const result = resolverListaPaginada(3, {
      items: [],
      total: 0,
      totalPages: 0,
    });

    expect(result).toEqual({
      acao: 'ajustar-pagina',
      pagina: 1,
      totalPaginas: 1,
    });
  });
});

