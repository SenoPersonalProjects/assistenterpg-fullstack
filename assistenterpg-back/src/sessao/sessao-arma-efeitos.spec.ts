import { resolverEfeitosArma } from './sessao-arma-efeitos';
describe('Dadao Negro', () => {
  const mods = [
    { modificacao: { efeitosMecanicos: { bonusDano: 2 } } },
    { modificacao: { efeitosMecanicos: { margemAmeacaAdicional: 2 } } },
  ];
  it('resolve a arma de Takaramono sem duplicar Cruel ou Perigosa', () => {
    expect(
      resolverEfeitosArma({
        habilidadeEspecial: 'SABRE_DO_PRODIGIO',
        criticoValor: 19,
        modificacoes: mods,
        origemNome: 'Prodígio do Clã',
        forca: 2,
      }),
    ).toEqual({
      bonusAtaque: 0,
      bonusDano: 4,
      bonusDados: 1,
      criticoValor: 17,
    });
  });
  it('não concede o dado do vínculo a outra origem', () => {
    expect(
      resolverEfeitosArma({
        habilidadeEspecial: 'SABRE_DO_PRODIGIO',
        origemNome: 'Outra',
        forca: 2,
      }).bonusDados,
    ).toBe(0);
  });
  it('preserva armas sem efeitos especiais ou modificações', () => {
    expect(resolverEfeitosArma({ forca: 4, criticoValor: 20 })).toEqual({
      bonusAtaque: 0,
      bonusDano: 0,
      bonusDados: 0,
      criticoValor: 20,
    });
  });
});
