import { describe, expect, it } from 'vitest';
import {
  deveUsarRolagemAtaqueAutoritativa,
  deveUsarRolagemPericiaAutoritativa,
  montarIntencaoRolagemAtaquePersonagem,
  montarIntencaoRolagemPericiaPersonagem,
  periciaPermiteAtaquePersonagem,
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

  it.each(['LUTA', 'PONTARIA', 'JUJUTSU'])(
    'reconhece %s como pericia de ataque',
    (periciaCodigo) => {
      expect(periciaPermiteAtaquePersonagem(periciaCodigo)).toBe(true);
    },
  );

  it('monta ataque autoritativo sem bonus ou resultado do cliente', () => {
    const ataque = {
      ...personagem,
      tipoRolagem: 'ATAQUE' as const,
      periciaCodigo: ' luta ',
      periciaNome: 'Luta',
    };

    expect(deveUsarRolagemAtaqueAutoritativa(ataque)).toBe(true);
    expect(deveUsarRolagemPericiaAutoritativa(ataque)).toBe(false);
    expect(
      montarIntencaoRolagemAtaquePersonagem(
        ataque,
        'PUBLICA',
        '6ff62ec2-a60e-4de8-99cf-6018cf83a68d',
      ),
    ).toEqual({
      tipo: 'ATAQUE_PERSONAGEM',
      personagemSessaoId: 31,
      periciaCodigo: 'LUTA',
      visibilidade: 'PUBLICA',
      clientRequestId: '6ff62ec2-a60e-4de8-99cf-6018cf83a68d',
    });
  });

  it('mantem Luta generica como pericia e ataque de NPC no legado', () => {
    const lutaGenerica = {
      ...personagem,
      periciaCodigo: 'LUTA',
      periciaNome: 'Luta',
    };
    expect(deveUsarRolagemPericiaAutoritativa(lutaGenerica)).toBe(true);
    expect(deveUsarRolagemAtaqueAutoritativa(lutaGenerica)).toBe(false);
    expect(
      deveUsarRolagemAtaqueAutoritativa({
        ...lutaGenerica,
        alvoTipo: 'NPC',
        tipoRolagem: 'ATAQUE',
      }),
    ).toBe(false);
  });

  it('rejeita pericia incompatível ao montar ataque autoritativo', () => {
    expect(() =>
      montarIntencaoRolagemAtaquePersonagem(
        { ...personagem, tipoRolagem: 'ATAQUE' },
        'PUBLICA',
        '6ff62ec2-a60e-4de8-99cf-6018cf83a68d',
      ),
    ).toThrow('Personagem ou pericia invalidos para o ataque.');
  });
});
