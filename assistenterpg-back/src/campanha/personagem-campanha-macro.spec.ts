import {
  contarDadosExpressaoMacro,
  MacroPersonalizadaConfigError,
  normalizarConfigMacroPersonalizada,
  normalizarFormulaDanoMacro,
} from './personagem-campanha-macro';

describe('configuracao de macro personalizada', () => {
  it('normaliza os tres tipos persistidos na versao 1', () => {
    expect(
      normalizarConfigMacroPersonalizada('ATAQUE_PERICIA', {
        periciaCodigo: ' luta ',
        categoriaAtaque: 'CORPO_A_CORPO',
        ajusteFlatPadrao: 5,
        ajusteDadosPadrao: -1,
        atributoBase: 'FOR',
      }),
    ).toEqual({
      periciaCodigo: 'LUTA',
      categoriaAtaque: 'CORPO_A_CORPO',
      ajusteFlatPadrao: 5,
      ajusteDadosPadrao: -1,
      atributoBase: 'FOR',
    });
    expect(
      normalizarConfigMacroPersonalizada('DANO_FORMULA', {
        formulaBase: ' 2D8 + 4 ',
        tipoDano: ' impacto ',
        ajusteFlatPadrao: 2,
        criticoMultiplicador: 3,
      }),
    ).toMatchObject({
      formulaBase: '2d8+4',
      tipoDano: 'impacto',
      ajusteFlatPadrao: 2,
      criticoMultiplicador: 3,
    });
    expect(
      normalizarConfigMacroPersonalizada('FORMULA_LIVRE', {
        formula: '2d6+3; 1d4',
      }),
    ).toEqual({ formula: '2d6+3;1d4' });
  });

  it('rejeita campos extras, limites e formula de dano composta', () => {
    expect(() =>
      normalizarConfigMacroPersonalizada('ATAQUE_PERICIA', {
        periciaCodigo: 'LUTA',
        categoriaAtaque: 'CORPO_A_CORPO',
        ajusteFlatPadrao: 0,
        ajusteDadosPadrao: 0,
        total: 99,
      }),
    ).toThrow(MacroPersonalizadaConfigError);
    expect(() =>
      normalizarConfigMacroPersonalizada('DANO_FORMULA', {
        formulaBase: '2d8;1d6',
        ajusteFlatPadrao: 0,
      }),
    ).toThrow(MacroPersonalizadaConfigError);
    expect(() =>
      normalizarConfigMacroPersonalizada('FORMULA_LIVRE', {
        formula: '1d6;1d6;1d6;1d6;1d6',
      }),
    ).toThrow(MacroPersonalizadaConfigError);
  });

  it('limita dados e preserva o flat da formula separadamente', () => {
    const dano = normalizarFormulaDanoMacro('4d10+7');
    expect(contarDadosExpressaoMacro(dano.expressao)).toBe(4);
    expect(dano.formula).toBe('4d10+7');
    expect(() => normalizarFormulaDanoMacro('31d6')).toThrow(
      MacroPersonalizadaConfigError,
    );
  });
});
