import { describe, expect, it } from 'vitest';
import { agruparRepeticoesRoleta } from './campaign-roulette.helpers';

describe('campaign roulette helpers', () => {
  it('preserva repeticoes e agrega nomes sem diferenciar caixa', () => {
    expect(agruparRepeticoesRoleta('Zenin; Kamo; zenin; Zenin')).toEqual([
      { nome: 'Zenin', quantidade: 3 },
    ]);
  });

  it('nao sinaliza itens sem repeticao', () => {
    expect(agruparRepeticoesRoleta('Zenin; Kamo')).toEqual([]);
  });
});
