export type ItemBuscaCatalogo = {
  label: string;
  description?: string | null;
  badges?: Array<{ text: string }>;
  searchTerms?: string[];
};

function normalizarBusca(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
}

export function filtrarItensCatalogo<T extends ItemBuscaCatalogo>(
  itens: readonly T[],
  consulta: string,
): T[] {
  const termos = normalizarBusca(consulta).trim().split(/\s+/).filter(Boolean);
  if (termos.length === 0) return [...itens];

  return itens.filter((item) => {
    const texto = normalizarBusca(
      [
        item.label,
        item.description ?? '',
        ...(item.badges?.map((badge) => badge.text) ?? []),
        ...(item.searchTerms ?? []),
      ].join(' '),
    );
    return termos.every((termo) => texto.includes(termo));
  });
}
