import { describe, expect, it } from 'vitest';
import { filtrarItensCatalogo } from './catalog-search';

const itens = [
  {
    label: 'Ritual Predileto',
    description: 'Reduz o custo de energia de uma habilidade escolhida.',
    badges: [{ text: 'Poder genérico' }],
    searchTerms: ['Sistema-base'],
  },
  {
    label: 'Névoa Lilás',
    description: 'Técnica que obscurece a visão.',
    badges: [{ text: 'Homebrew' }],
  },
];

describe('filtrarItensCatalogo', () => {
  it('busca por nome, descrição, badge e fonte adicional', () => {
    expect(filtrarItensCatalogo(itens, 'predileto')).toHaveLength(1);
    expect(filtrarItensCatalogo(itens, 'energia')).toHaveLength(1);
    expect(filtrarItensCatalogo(itens, 'homebrew')).toHaveLength(1);
    expect(filtrarItensCatalogo(itens, 'sistema base')).toHaveLength(1);
  });

  it('ignora caixa e acentuação e exige todos os termos informados', () => {
    expect(filtrarItensCatalogo(itens, 'NEVOA LILAS')).toHaveLength(1);
    expect(filtrarItensCatalogo(itens, 'ritual visão')).toHaveLength(0);
  });
});
