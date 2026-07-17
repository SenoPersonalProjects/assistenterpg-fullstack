import { describe, expect, it } from 'vitest';
import { montarIntencaoRolagemMacroPersonalizada } from './sessao-rolagem-macro';

describe('montarIntencaoRolagemMacroPersonalizada', () => {
  it('envia somente macroId e ajustes efemeros no ataque', () => {
    expect(
      montarIntencaoRolagemMacroPersonalizada(
        {
          acao: 'ATAQUE',
          personagemSessaoId: 12,
          macroId: 44,
          ajusteFlatSessao: 5,
          ajusteDadosSessao: -2,
          dt: 21,
        },
        'PUBLICA',
        '9e31cace-9200-450a-b228-d0e5b7084c1f',
      ),
    ).toEqual({
      tipo: 'ATAQUE_MACRO_PERSONAGEM',
      personagemSessaoId: 12,
      macroId: 44,
      ajusteFlatSessao: 5,
      ajusteDadosSessao: -2,
      contexto: { dt: 21 },
      visibilidade: 'PUBLICA',
      clientRequestId: '9e31cace-9200-450a-b228-d0e5b7084c1f',
    });
  });

  it('nao transporta formula, pericia, faces ou resultado', () => {
    const intencao = montarIntencaoRolagemMacroPersonalizada(
      { acao: 'DANO', personagemSessaoId: 12, macroId: 44 },
      'SECRETA_MESTRE',
      '6576e9d7-982c-4c5b-b38b-284588eb6d2c',
    );
    expect(intencao).toEqual({
      tipo: 'DANO_MACRO_PERSONAGEM',
      personagemSessaoId: 12,
      macroId: 44,
      visibilidade: 'SECRETA_MESTRE',
      clientRequestId: '6576e9d7-982c-4c5b-b38b-284588eb6d2c',
    });
    expect(intencao).not.toHaveProperty('formula');
    expect(intencao).not.toHaveProperty('periciaCodigo');
    expect(intencao).not.toHaveProperty('faces');
    expect(intencao).not.toHaveProperty('resultado');
  });

  it('rejeita ajustes fora dos limites', () => {
    expect(() =>
      montarIntencaoRolagemMacroPersonalizada(
        { acao: 'ATAQUE', personagemSessaoId: 12, macroId: 44, ajusteDadosSessao: 11 },
        'PUBLICA',
        '6576e9d7-982c-4c5b-b38b-284588eb6d2c',
      ),
    ).toThrow('Ajustes da macro fora dos limites permitidos.');
  });
});
