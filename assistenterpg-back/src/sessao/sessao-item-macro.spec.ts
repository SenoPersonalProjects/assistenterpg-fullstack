import {
  normalizarEmpunhadurasMacroArma,
  resolverAjustesAutomaticosMacroArma,
  resolverAjustesAutomaticosAtaque,
  resolverPericiaMacroArma,
} from './sessao-item-macro';

describe('macros de arma da sessao', () => {
  it('normaliza empunhaduras serializadas pelo catalogo', () => {
    expect(normalizarEmpunhadurasMacroArma('["UMA_MAO", "DUAS_MAOS"]')).toEqual(
      ['UMA_MAO', 'DUAS_MAOS'],
    );
  });

  it('deriva a pericia somente dos tipos de arma suportados', () => {
    expect(resolverPericiaMacroArma('CORPO_A_CORPO')).toBe('LUTA');
    expect(resolverPericiaMacroArma('A_DISTANCIA')).toBe('PONTARIA');
    expect(resolverPericiaMacroArma('OUTRA')).toBeNull();
  });

  it('mantem a maior penalidade da cadeia abalado/apavorado e evita duplicar fraco/fadigado', () => {
    expect(
      resolverAjustesAutomaticosMacroArma(
        [
          { nome: 'Abalado' },
          { nome: 'Apavorado' },
          { nome: 'Fraco' },
          { nome: 'Fatigado' },
        ],
        'CORPO_A_CORPO',
        'FOR',
      ),
    ).toEqual([
      expect.objectContaining({ condicao: 'Apavorado', dados: -2 }),
      expect.objectContaining({ condicao: 'Fraco', dados: -1 }),
    ]);
  });

  it('aplica caido apenas a armas corpo a corpo', () => {
    expect(
      resolverAjustesAutomaticosMacroArma(
        [{ nome: 'Caído' }],
        'A_DISTANCIA',
        'AGI',
      ),
    ).toEqual([]);
  });

  it('generaliza condicoes para ataques personalizados sem duplicar cadeias', () => {
    expect(
      resolverAjustesAutomaticosAtaque({
        condicoes: [
          { nome: 'Fatigado' },
          { nome: 'Fraco' },
          { nome: 'Ofuscado' },
        ],
        periciaCodigo: 'JUJUTSU',
        atributoBase: 'VIG',
        categoriaAtaque: 'OUTRO',
      }),
    ).toEqual([
      expect.objectContaining({ condicao: 'Ofuscado', dados: -1 }),
      expect.objectContaining({ condicao: 'Fraco', dados: -1 }),
    ]);
  });
});
