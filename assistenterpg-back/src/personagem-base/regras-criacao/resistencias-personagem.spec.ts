import { somarMapasResistencias } from './resistencias-personagem';

describe('resistencias consolidadas do personagem', () => {
  it('preserva resistencia isolada de habilidade', () => {
    expect(somarMapasResistencias(new Map([['DANO', 3]]), new Map())).toEqual(
      new Map([['DANO', 3]]),
    );
  });

  it('preserva resistencia isolada de equipamento', () => {
    expect(
      somarMapasResistencias(new Map(), new Map([['BALISTICO', 2]])),
    ).toEqual(new Map([['BALISTICO', 2]]));
  });

  it('soma as origens somente na consolidacao final', () => {
    expect(
      somarMapasResistencias(
        new Map([
          ['DANO', 3],
          ['ENERGIA_AMALDICOADA', 1],
        ]),
        new Map([
          ['DANO', 2],
          ['BALISTICO', 4],
        ]),
      ),
    ).toEqual(
      new Map([
        ['DANO', 5],
        ['ENERGIA_AMALDICOADA', 1],
        ['BALISTICO', 4],
      ]),
    );
  });
});
