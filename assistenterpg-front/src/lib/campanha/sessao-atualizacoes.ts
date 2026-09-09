import type {
  AtualizacaoIncrementalSessaoCampanha,
  AtualizacaoRecursosSessaoCampanha,
  CampoRecursoSessaoCampanha,
  SessaoCampanhaDetalhe,
} from '@/lib/types';

/**
 * Compatibiliza snapshots parciais de sessão com o contrato consumido pela UI.
 * Listas de condições vazias são semanticamente equivalentes à ausência do
 * campo, mas impedem que uma resposta legada interrompa a renderização.
 */
export function normalizarDetalheSessao(
  detalhe: SessaoCampanhaDetalhe,
): SessaoCampanhaDetalhe {
  const cards = Array.isArray(detalhe.cards) ? detalhe.cards : [];
  const npcs = Array.isArray(detalhe.npcs) ? detalhe.npcs : [];
  const cardsNormalizados = cards.some(
    (card) => !Array.isArray(card.condicoesAtivas),
  )
    ? cards.map((card) => ({
        ...card,
        condicoesAtivas: Array.isArray(card.condicoesAtivas)
          ? card.condicoesAtivas
          : [],
      }))
    : cards;
  const npcsNormalizados = npcs.some(
    (npc) => !Array.isArray(npc.condicoesAtivas),
  )
    ? npcs.map((npc) => ({
        ...npc,
        condicoesAtivas: Array.isArray(npc.condicoesAtivas)
          ? npc.condicoesAtivas
          : [],
      }))
    : npcs;

  return {
    ...detalhe,
    cards: cardsNormalizados,
    npcs: npcsNormalizados,
  };
}

export function aplicarAtualizacaoIncrementalSessao(
  detalhe: SessaoCampanhaDetalhe,
  atualizacao: AtualizacaoIncrementalSessaoCampanha,
): SessaoCampanhaDetalhe {
  const detalheNormalizado = normalizarDetalheSessao(detalhe);
  if (atualizacao.tipo === 'RECURSO_AJUSTADO') {
    return {
      ...detalheNormalizado,
      cards: detalheNormalizado.cards.map((card) => {
        if (
          card.personagemSessaoId !== atualizacao.personagemSessaoId ||
          !card.recursos
        ) {
          return card;
        }
        return {
          ...card,
          recursos: {
            ...card.recursos,
            ...atualizacao.valores,
          },
          ...(atualizacao.condicoesAtivas
            ? { condicoesAtivas: atualizacao.condicoesAtivas }
            : {}),
        };
      }),
    };
  }

  const regraInspiracao = detalheNormalizado.regrasOpcionais?.INSPIRACAO;
  if (!regraInspiracao || !detalheNormalizado.regrasOpcionais) {
    return detalheNormalizado;
  }
  return {
    ...detalheNormalizado,
    regrasOpcionais: {
      ...detalheNormalizado.regrasOpcionais,
      INSPIRACAO: {
        ...regraInspiracao,
        estado: {
          ...regraInspiracao.estado,
          pontosPorPersonagem: {
            ...regraInspiracao.estado.pontosPorPersonagem,
            [String(atualizacao.personagemCampanhaId)]:
              atualizacao.pontosInspiracao,
          },
        },
      },
    },
  };
}

export function chavesOrdenacaoAtualizacaoSessao(
  atualizacao: AtualizacaoIncrementalSessaoCampanha,
): string[] {
  if (atualizacao.tipo !== 'RECURSO_AJUSTADO') {
    return [`inspiracao:${atualizacao.personagemCampanhaId}`];
  }
  return (
    Object.keys(atualizacao.valores) as CampoRecursoSessaoCampanha[]
  ).map(
    (campo) =>
      `recurso:${atualizacao.personagemSessaoId}:${campo}`,
  );
}

export function criarAtualizacaoOtimistaRecurso(
  args: {
    campanhaId: number;
    sessaoId: number;
    personagemSessaoId: number;
    personagemCampanhaId: number;
    mutacaoId: string;
    campo: CampoRecursoSessaoCampanha;
    valor: number;
  },
): AtualizacaoRecursosSessaoCampanha {
  return {
    tipo: 'RECURSO_AJUSTADO',
    mutacaoId: args.mutacaoId,
    eventoId: null,
    campanhaId: args.campanhaId,
    sessaoId: args.sessaoId,
    personagemSessaoId: args.personagemSessaoId,
    personagemCampanhaId: args.personagemCampanhaId,
    valores: { [args.campo]: args.valor },
    em: new Date().toISOString(),
  };
}
