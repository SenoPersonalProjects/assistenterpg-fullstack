export type StatusPassoEfeitosTurno = 'PENDENTE' | 'ERRO' | 'CONCLUIDO';

export type TipoPassoEfeitosTurno =
  | 'SUSTENTACOES_RODADA'
  | 'CONDICOES_RODADA'
  | 'CONDICOES_PARTICIPANTE';

export type PassoEfeitosTurnoSessao = {
  chave: string;
  tipo: TipoPassoEfeitosTurno;
  status: StatusPassoEfeitosTurno;
  tipoParticipante?: 'PERSONAGEM' | 'NPC';
  personagemSessaoId?: number | null;
  npcSessaoId?: number | null;
};

export type ContextoEfeitosTurnoSessao = {
  versao: 2;
  status: StatusPassoEfeitosTurno;
  acao: 'AVANCAR' | 'VOLTAR' | 'PULAR';
  cenaId: number;
  rodadaAnterior: number;
  rodadaNova: number;
  passos: PassoEfeitosTurnoSessao[];
  tentativas: number;
  atualizadoEm: string;
  ultimaFalhaEm?: string;
};

type ParticipanteEfeitosTurno = {
  tipoParticipante: 'PERSONAGEM' | 'NPC';
  personagemSessaoId: number | null;
  npcSessaoId: number | null;
};

type CriarContextoEfeitosTurnoArgs = {
  acao: ContextoEfeitosTurnoSessao['acao'];
  cenaId: number;
  rodadaAnterior: number;
  rodadaNova: number;
  participantesTurnoNovos: readonly ParticipanteEfeitosTurno[];
  processarCondicoes: boolean;
  cobrarSustentacoes: boolean;
  atualizadoEm?: string;
};

/**
 * Produz a fila determinística de efeitos automáticos que acompanha uma
 * alteração de turno. A persistência e a execução dos passos continuam sob
 * responsabilidade do serviço de sessão.
 */
export function criarContextoEfeitosTurno(
  args: CriarContextoEfeitosTurnoArgs,
): ContextoEfeitosTurnoSessao {
  const passos: PassoEfeitosTurnoSessao[] = [];
  if (args.cobrarSustentacoes) {
    passos.push({
      chave: 'SUSTENTACOES_RODADA',
      tipo: 'SUSTENTACOES_RODADA',
      status: 'PENDENTE',
    });
  }
  if (args.processarCondicoes) {
    passos.push({
      chave: 'CONDICOES_RODADA',
      tipo: 'CONDICOES_RODADA',
      status: 'PENDENTE',
    });
    for (const participante of args.participantesTurnoNovos) {
      const id =
        participante.tipoParticipante === 'PERSONAGEM'
          ? participante.personagemSessaoId
          : participante.npcSessaoId;
      if (!id) continue;
      passos.push({
        chave: `CONDICOES_PARTICIPANTE:${participante.tipoParticipante}:${id}`,
        tipo: 'CONDICOES_PARTICIPANTE',
        status: 'PENDENTE',
        tipoParticipante: participante.tipoParticipante,
        personagemSessaoId: participante.personagemSessaoId,
        npcSessaoId: participante.npcSessaoId,
      });
    }
  }

  return {
    versao: 2,
    status: passos.length > 0 ? 'PENDENTE' : 'CONCLUIDO',
    acao: args.acao,
    cenaId: args.cenaId,
    rodadaAnterior: args.rodadaAnterior,
    rodadaNova: args.rodadaNova,
    passos,
    tentativas: 0,
    atualizadoEm: args.atualizadoEm ?? new Date().toISOString(),
  };
}
