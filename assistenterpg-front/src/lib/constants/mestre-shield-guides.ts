export type MestreShieldFonte = 'BASE' | 'SUPLEMENTO';

export type MestreShieldOrigem = {
  livroCodigo: string;
  livroTitulo: string;
  categoriaCodigo: string;
  subcategoriaCodigo: string;
  artigoCodigo: string;
  artigoTitulo: string;
  href: string;
};

export type MestreShieldGuideSection = {
  id: string;
  titulo: string;
  fonte: MestreShieldFonte;
  referenciaCompendio: string;
  resumoMarkdown: string;
  detalhadoMarkdown: string;
  origens: MestreShieldOrigem[];
  avisos: string[];
};

export type MestreShieldGuidePayload = {
  secoes: MestreShieldGuideSection[];
  avisos: string[];
};

function normalizarBusca(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

export function filtrarMestreShieldGuides(
  secoes: MestreShieldGuideSection[],
  busca: string,
): MestreShieldGuideSection[] {
  const termo = normalizarBusca(busca);
  if (!termo) return secoes;

  return secoes.filter((secao) => {
    const origens = secao.origens
      .map((origem) => `${origem.livroTitulo} ${origem.artigoTitulo}`)
      .join(' ');
    const texto = normalizarBusca(
      [
        secao.titulo,
        secao.referenciaCompendio,
        secao.resumoMarkdown,
        secao.detalhadoMarkdown,
        origens,
      ].join(' '),
    );

    return texto.includes(termo);
  });
}
