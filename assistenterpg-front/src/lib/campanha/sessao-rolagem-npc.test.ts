import { describe, expect, it } from 'vitest';
import {
  deveUsarRolagemAtaqueNpcAutoritativa,
  deveUsarRolagemPericiaNpcAutoritativa,
  montarIntencaoRolagemAtaqueNpcAcao,
  montarIntencaoRolagemAtaqueNpcPericia,
  montarIntencaoRolagemPericiaNpc,
} from './sessao-rolagem-npc';

const periciaNpc = {
  alvoTipo: 'NPC' as const,
  tipoRolagem: 'PERICIA' as const,
  alvoNome: 'Maldição',
  npcSessaoId: 71,
  periciaCodigo: ' percepcao ',
  periciaNome: 'Percepção',
  atributoBase: 'PRE',
  dados: 2,
  bonus: 8,
  keepMode: 'HIGHEST' as const,
};

describe('sessao-rolagem-npc', () => {
  it('monta intencao de pericia sem valores calculados', () => {
    expect(
      montarIntencaoRolagemPericiaNpc(
        periciaNpc,
        'PUBLICA',
        '299b5238-7f29-48a4-983e-d43ea06cf792',
      ),
    ).toEqual({
      tipo: 'PERICIA_NPC',
      npcSessaoId: 71,
      periciaCodigo: 'PERCEPCAO',
      visibilidade: 'PUBLICA',
      clientRequestId: '299b5238-7f29-48a4-983e-d43ea06cf792',
    });
    expect(deveUsarRolagemPericiaNpcAutoritativa(periciaNpc)).toBe(true);
  });

  it('monta ataque por pericia somente para codigo permitido', () => {
    const ataque = {
      ...periciaNpc,
      tipoRolagem: 'ATAQUE' as const,
      periciaCodigo: ' luta ',
      periciaNome: 'Luta',
    };

    expect(deveUsarRolagemAtaqueNpcAutoritativa(ataque)).toBe(true);
    expect(
      montarIntencaoRolagemAtaqueNpcPericia(
        ataque,
        'PUBLICA',
        '9f286dd6-c716-4f3e-a746-3a1487745b7b',
      ),
    ).toEqual({
      tipo: 'ATAQUE_NPC',
      origemAtaque: 'PERICIA',
      npcSessaoId: 71,
      periciaCodigo: 'LUTA',
      visibilidade: 'PUBLICA',
      clientRequestId: '9f286dd6-c716-4f3e-a746-3a1487745b7b',
    });
  });

  it('monta ataque por acao sem enviar formula de preview', () => {
    const intencao = montarIntencaoRolagemAtaqueNpcAcao(
      {
        alvoTipo: 'NPC',
        alvoNome: 'Maldição',
        npcSessaoId: 71,
        acaoIndice: 0,
        acaoNome: 'Garra',
        expressaoPreview: '2d20+10',
      },
      'SECRETA_MESTRE',
      '869f390e-8b10-4de7-b7db-f3b97bcb2375',
    );

    expect(intencao).toEqual({
      tipo: 'ATAQUE_NPC',
      origemAtaque: 'ACAO',
      npcSessaoId: 71,
      acaoIndice: 0,
      visibilidade: 'SECRETA_MESTRE',
      clientRequestId: '869f390e-8b10-4de7-b7db-f3b97bcb2375',
    });
    expect(intencao).not.toHaveProperty('expressaoPreview');
    expect(intencao).not.toHaveProperty('expressao');
  });

  it('mantem personagem e ataque invalido fora do transporte de NPC', () => {
    expect(
      deveUsarRolagemPericiaNpcAutoritativa({
        ...periciaNpc,
        alvoTipo: 'PERSONAGEM',
      }),
    ).toBe(false);
    expect(
      deveUsarRolagemAtaqueNpcAutoritativa({
        ...periciaNpc,
        tipoRolagem: 'ATAQUE',
      }),
    ).toBe(false);
  });
});
