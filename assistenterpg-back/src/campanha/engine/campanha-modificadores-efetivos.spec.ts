import {
  calcularBonusDtFeiticosNarrativo,
  calcularBonusPorAtributoNarrativos,
  calcularBonusPorResistenciaNarrativos,
  resolverGrausAprimoramentoEfetivosCampanha,
  resolverPericiasEfetivasCampanha,
} from './campanha-modificadores-efetivos';

describe('campanha-modificadores-efetivos', () => {
  it('compõe bônus permanentes de atributo, resistência e DT', () => {
    const modificadores = [
      { campo: 'ATRIBUTO' as const, atributoCodigo: 'AGILIDADE', valor: -1 },
      { campo: 'RESISTENCIA' as const, resistenciaTipoId: 3, valor: 2 },
      { campo: 'BONUS_DT_FEITICOS' as const, valor: 1 },
    ];

    expect(calcularBonusPorAtributoNarrativos(modificadores).get('AGILIDADE')).toBe(-1);
    expect(calcularBonusPorResistenciaNarrativos(modificadores).get(3)).toBe(2);
    expect(calcularBonusDtFeiticosNarrativo(modificadores)).toBe(1);
  });

  it('aplica treinamento narrativo em perícias e converte cada nível em +5', () => {
    const pericias = resolverPericiasEfetivasCampanha(
      [
        {
          grauTreinamento: 0,
          bonusExtra: 0,
          pericia: {
            codigo: 'OCULTISMO',
            nome: 'Ocultismo',
            atributoBase: 'INTELECTO',
          },
        },
      ],
      [
        {
          campo: 'PERICIA_TREINAMENTO',
          valor: 1,
          periciaCodigo: 'OCULTISMO',
        },
      ],
    );

    expect(pericias).toEqual([
      expect.objectContaining({
        codigo: 'OCULTISMO',
        grauTreinamento: 1,
        bonusTreinamento: 5,
        bonusTotal: 5,
      }),
    ]);
  });

  it('limita reduções de treinamento para não ficarem abaixo de zero', () => {
    const pericias = resolverPericiasEfetivasCampanha(
      [
        {
          grauTreinamento: 1,
          bonusExtra: 0,
          pericia: {
            codigo: 'LUTA',
            nome: 'Luta',
            atributoBase: 'FORCA',
          },
        },
      ],
      [
        {
          campo: 'PERICIA_TREINAMENTO',
          valor: -3,
          periciaCodigo: 'LUTA',
        },
      ],
    );

    expect(pericias[0]).toEqual(
      expect.objectContaining({
        codigo: 'LUTA',
        grauTreinamento: 0,
        bonusTreinamento: 0,
      }),
    );
  });

  it('soma bônus numéricos de perícia sem alterar o grau de treinamento', () => {
    const [pericia] = resolverPericiasEfetivasCampanha(
      [
        {
          grauTreinamento: 1,
          bonusExtra: 1,
          pericia: {
            codigo: 'OCULTISMO',
            nome: 'Ocultismo',
            atributoBase: 'INTELECTO',
          },
        },
      ],
      [
        {
          campo: 'PERICIA_BONUS',
          valor: 2,
          periciaCodigo: 'OCULTISMO',
        },
      ],
    );

    expect(pericia).toEqual(
      expect.objectContaining({
        grauTreinamento: 1,
        bonusOutros: 3,
        bonusTotal: 8,
      }),
    );
  });

  it('aplica modificadores narrativos em graus sem alterar valores base', () => {
    const graus = resolverGrausAprimoramentoEfetivosCampanha(
      [
        {
          valor: 1,
          tipoGrau: {
            codigo: 'TECNICA_REVERSA',
            nome: 'Técnica Reversa',
          },
        },
      ],
      [
        {
          campo: 'GRAU_APRIMORAMENTO',
          valor: 2,
          tipoGrauCodigo: 'TECNICA_REVERSA',
        },
      ],
    );

    expect(graus).toEqual([
      expect.objectContaining({
        tipoGrauCodigo: 'TECNICA_REVERSA',
        tipoGrauNome: 'Técnica Reversa',
        valor: 3,
      }),
    ]);
  });

  it('limita reduções de grau para não ficarem negativas', () => {
    const graus = resolverGrausAprimoramentoEfetivosCampanha(
      [
        {
          valor: 1,
          tipoGrau: {
            codigo: 'BARREIRA',
            nome: 'Barreira',
          },
        },
      ],
      [
        {
          campo: 'GRAU_APRIMORAMENTO',
          valor: -5,
          tipoGrauCodigo: 'BARREIRA',
        },
      ],
    );

    expect(graus[0]).toEqual(
      expect.objectContaining({
        tipoGrauCodigo: 'BARREIRA',
        valor: 0,
      }),
    );
  });
});
