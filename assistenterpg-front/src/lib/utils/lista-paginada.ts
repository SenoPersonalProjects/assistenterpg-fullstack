type ListaPaginada<T> = {
  items: T[];
  total: number;
  totalPages: number;
};

type AjustarPaginaResult = {
  acao: 'ajustar-pagina';
  pagina: number;
  totalPaginas: number;
};

type AplicarDadosResult<T> = {
  acao: 'aplicar-dados';
  items: T[];
  total: number;
  totalPaginas: number;
};

export type ResultadoListaPaginada<T> = AjustarPaginaResult | AplicarDadosResult<T>;

export function resolverListaPaginada<T>(
  paginaAtual: number,
  resposta: ListaPaginada<T>,
): ResultadoListaPaginada<T> {
  const totalPaginas = Math.max(1, resposta.totalPages);

  if (
    resposta.items.length === 0 &&
    paginaAtual > 1 &&
    totalPaginas < paginaAtual
  ) {
    return {
      acao: 'ajustar-pagina',
      pagina: totalPaginas,
      totalPaginas,
    };
  }

  return {
    acao: 'aplicar-dados',
    items: resposta.items,
    total: resposta.total,
    totalPaginas,
  };
}

