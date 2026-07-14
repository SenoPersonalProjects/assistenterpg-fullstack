import { describe, expect, it } from 'vitest';
import {
  deveUsarRolagemPericiaAutoritativa,
  montarIntencaoRolagemPericiaPersonagem,
} from './sessao-rolagem-pericia';

const personagem = {
  alvoTipo: 'PERSONAGEM' as const,
  alvoNome: 'Yuji',
  personagemSessaoId: 31,
  personagemCampanhaId: 41,
  periciaCodigo: ' ocultismo ',
  periciaNome: 'Ocultismo',
  atributoBase: 'INT',
  dados: 3,
  bonus: 10,
  keepMode: 'HIGHEST' as const,
};

describe('sessao-rolagem-pericia', () => {
  it('monta intencao sem valores calculados pelo cliente', () => {
    expect(
      montarIntencaoRolagemPericiaPersonagem(
        personagem,
        'PUBLICA',
        '7fe183a4-c5f4-4fd8-9da6-f9adabbbe0ca',
      ),
    ).toEqual({
      tipo: 'PERICIA_PERSONAGEM',
      personagemSessaoId: 31,
      periciaCodigo: 'OCULTISMO',
      visibilidade: 'PUBLICA',
      clientRequestId: '7fe183a4-c5f4-4fd8-9da6-f9adabbbe0ca',
    });
  });

  it('seleciona transporte autoritativo apenas para personagem identificado', () => {
    expect(deveUsarRolagemPericiaAutoritativa(personagem)).toBe(true);
  });

  it('preserva o transporte legado para NPC', () => {
    expect(
      deveUsarRolagemPericiaAutoritativa({
        ...personagem,
        alvoTipo: 'NPC',
        personagemSessaoId: undefined,
      }),
    ).toBe(false);
  });
});
