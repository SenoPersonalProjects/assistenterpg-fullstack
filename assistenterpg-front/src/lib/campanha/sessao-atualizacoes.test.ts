import { describe, expect, it } from 'vitest';
import type { SessaoCampanhaDetalhe } from '@/lib/types';
import {
  aplicarAtualizacaoIncrementalSessao,
  chavesOrdenacaoAtualizacaoSessao,
} from './sessao-atualizacoes';

function detalheBase(): SessaoCampanhaDetalhe {
  return {
    campanhaId: 7,
    sessaoId: 21,
    cards: [
      {
        personagemSessaoId: 31,
        personagemCampanhaId: 41,
        recursos: {
          pvAtual: 10,
          pvMax: 20,
          peAtual: 8,
          peMax: 10,
          eaAtual: 6,
          eaMax: 10,
          sanAtual: 9,
          sanMax: 10,
        },
        condicoesAtivas: [],
      },
    ],
    regrasOpcionais: {
      INSPIRACAO: {
        chave: 'INSPIRACAO',
        ativo: true,
        config: {},
        estado: { pontosPorPersonagem: { '41': 1 } },
      },
    },
  } as SessaoCampanhaDetalhe;
}

describe('atualizações incrementais de sessão', () => {
  it('aplica somente o recurso e as condições do personagem alvo', () => {
    const detalhe = detalheBase();
    const condicao = {
      id: 1,
      condicaoId: 2,
      nome: 'Machucado',
      descricao: 'PV reduzido',
      icone: null,
      automatica: true,
      chaveAutomacao: 'MACHUCADO',
      duracaoModo: 'ATE_REMOVER',
      duracaoValor: null,
      restanteDuracao: null,
      contadorTurnos: 0,
      acumulos: 1,
      fonteCodigo: null,
      limiteFonte: null,
      origemDescricao: 'Automática',
      observacao: null,
      turnoAplicacao: 1,
    };

    const atualizado = aplicarAtualizacaoIncrementalSessao(detalhe, {
      tipo: 'RECURSO_AJUSTADO',
      mutacaoId: 'recurso-1',
      eventoId: 55,
      campanhaId: 7,
      sessaoId: 21,
      personagemSessaoId: 31,
      personagemCampanhaId: 41,
      valores: { pvAtual: 4 },
      condicoesAtivas: [condicao],
      em: '2026-07-26T12:00:00.000Z',
    });

    expect(atualizado.cards[0].recursos?.pvAtual).toBe(4);
    expect(atualizado.cards[0].recursos?.peAtual).toBe(8);
    expect(atualizado.cards[0].condicoesAtivas).toEqual([condicao]);
    expect(detalhe.cards[0].recursos?.pvAtual).toBe(10);
  });

  it('aplica inspiração sem alterar cards', () => {
    const detalhe = detalheBase();
    const atualizado = aplicarAtualizacaoIncrementalSessao(detalhe, {
      tipo: 'INSPIRACAO_GASTA',
      mutacaoId: 'inspiracao-1',
      eventoId: 56,
      campanhaId: 7,
      sessaoId: 21,
      personagemCampanhaId: 41,
      pontosInspiracao: 0,
      em: '2026-07-26T12:00:01.000Z',
    });

    expect(
      atualizado.regrasOpcionais?.INSPIRACAO.estado.pontosPorPersonagem['41'],
    ).toBe(0);
    expect(atualizado.cards).toBe(detalhe.cards);
  });

  it('gera chaves independentes para ordenação por campo e inspiração', () => {
    expect(
      chavesOrdenacaoAtualizacaoSessao({
        tipo: 'RECURSO_AJUSTADO',
        mutacaoId: 'recurso-2',
        eventoId: 57,
        campanhaId: 7,
        sessaoId: 21,
        personagemSessaoId: 31,
        personagemCampanhaId: 41,
        valores: { pvAtual: 3, sanAtual: 2 },
        em: '2026-07-26T12:00:02.000Z',
      }),
    ).toEqual(['recurso:31:pvAtual', 'recurso:31:sanAtual']);

    expect(
      chavesOrdenacaoAtualizacaoSessao({
        tipo: 'INSPIRACAO_AJUSTADA',
        mutacaoId: 'inspiracao-2',
        eventoId: 58,
        campanhaId: 7,
        sessaoId: 21,
        personagemCampanhaId: 41,
        pontosInspiracao: 2,
        em: '2026-07-26T12:00:03.000Z',
      }),
    ).toEqual(['inspiracao:41']);
  });
});
