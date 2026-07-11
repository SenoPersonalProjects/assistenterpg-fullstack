import { describe, expect, it } from 'vitest';
import {
  filtrarMestreShieldGuides,
  type MestreShieldGuideSection,
} from './mestre-shield-guides';

describe('mestre-shield-guides', () => {
  const secoes: MestreShieldGuideSection[] = [
    {
      id: 'ferimentos-morte',
      titulo: 'Ferimentos e Morte',
      fonte: 'BASE',
      referenciaCompendio: 'Livro Principal',
      resumoMarkdown: 'Quando você sofre dano, seus PV são reduzidos.',
      detalhadoMarkdown: '## Ferimentos e Morte',
      origens: [
        {
          livroCodigo: 'livro-principal',
          livroTitulo: 'Livro Principal',
          categoriaCodigo: 'regras-gerais',
          subcategoriaCodigo: 'cenas-rodadas-e-turnos',
          artigoCodigo: 'cenas-rodadas-e-turnos-parte-1',
          artigoTitulo: 'Cenas, Rodadas e Turnos',
          href: '/compendio/livros/livro-principal/regras-gerais/cenas-rodadas-e-turnos/cenas-rodadas-e-turnos-parte-1',
        },
      ],
      avisos: [],
    },
    {
      id: 'sobrevivendo-ao-jujutsu',
      titulo: 'Sobrevivendo ao Jujutsu',
      fonte: 'SUPLEMENTO',
      referenciaCompendio: 'Sobrevivendo ao Jujutsu',
      resumoMarkdown: 'Primeiro suplemento oficial.',
      detalhadoMarkdown: '## Conteúdos',
      origens: [],
      avisos: [],
    },
  ];

  it('filtra seções recebidas da API por titulo e origem', () => {
    expect(filtrarMestreShieldGuides(secoes, 'morte')).toEqual([secoes[0]]);
    expect(filtrarMestreShieldGuides(secoes, 'livro principal')).toEqual([
      secoes[0],
    ]);
  });

  it('mantém acentos opcionais na busca e não carrega conteúdo legado local', () => {
    expect(filtrarMestreShieldGuides(secoes, 'jujutsu')).toEqual([secoes[1]]);
    expect(JSON.stringify(secoes)).not.toContain('Ferimentos é morte');
  });
});
