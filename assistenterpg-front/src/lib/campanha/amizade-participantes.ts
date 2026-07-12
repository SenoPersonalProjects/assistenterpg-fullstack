export type EstadoAmizadeParticipante =
  | 'proprio'
  | 'amigo'
  | 'solicitacao-enviada'
  | 'solicitacao-recebida'
  | 'adicionavel';

type ResolverEstadoAmizadeParticipanteParams = {
  participanteUsuarioId: number;
  usuarioAtualId?: number | null;
  amigoIds?: ReadonlySet<number>;
  solicitacoesEnviadasIds?: ReadonlySet<number>;
  solicitacoesRecebidasIds?: ReadonlySet<number>;
};

export function resolverEstadoAmizadeParticipante({
  participanteUsuarioId,
  usuarioAtualId,
  amigoIds,
  solicitacoesEnviadasIds,
  solicitacoesRecebidasIds,
}: ResolverEstadoAmizadeParticipanteParams): EstadoAmizadeParticipante {
  if (usuarioAtualId === participanteUsuarioId) return 'proprio';
  if (amigoIds?.has(participanteUsuarioId)) return 'amigo';
  if (solicitacoesEnviadasIds?.has(participanteUsuarioId)) {
    return 'solicitacao-enviada';
  }
  if (solicitacoesRecebidasIds?.has(participanteUsuarioId)) {
    return 'solicitacao-recebida';
  }
  return 'adicionavel';
}
