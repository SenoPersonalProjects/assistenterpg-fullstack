import type {
  AtualizacaoIncrementalSessaoCampanha,
  AtualizacaoRecursosSessaoCampanha,
  CampoRecursoSessaoCampanha,
  SessaoCampanhaDetalhe,
} from '@/lib/types';

export function aplicarAtualizacaoIncrementalSessao(
  detalhe: SessaoCampanhaDetalhe,
  atualizacao: AtualizacaoIncrementalSessaoCampanha,
): SessaoCampanhaDetalhe {
  if (atualizacao.tipo === 'RECURSO_AJUSTADO') {
    return {
      ...detalhe,
      cards: detalhe.cards.map((card) => {
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

  const regraInspiracao = detalhe.regrasOpcionais?.INSPIRACAO;
  if (!regraInspiracao || !detalhe.regrasOpcionais) return detalhe;
  return {
    ...detalhe,
    regrasOpcionais: {
      ...detalhe.regrasOpcionais,
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
