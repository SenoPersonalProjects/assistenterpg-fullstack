'use client';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import { resolverEstadoAmizadeParticipante } from '@/lib/campanha/amizade-participantes';
import { labelPapelParticipante, textoSeguro } from '@/lib/campanha/sessao-formatters';
import type { UserErrorState } from '@/lib/types';

type ParticipanteItem = {
  usuarioId: number;
  apelido: string;
  papel: string;
  ehDono: boolean;
};

type ParticipantsPanelProps = {
  participantes: ParticipanteItem[];
  onlineSet: Set<number>;
  usuarioAtualId?: number | null;
  amigoIds?: Set<number>;
  solicitacoesEnviadasIds?: Set<number>;
  solicitacoesRecebidasIds?: Set<number>;
  carregandoAmizades?: boolean;
  amizadeAcaoUsuarioId?: number | null;
  erroAmizades?: UserErrorState | null;
  onEnviarSolicitacao?: (usuarioId: number) => void;
};

export function ParticipantsPanel({
  participantes,
  onlineSet,
  usuarioAtualId = null,
  amigoIds = new Set<number>(),
  solicitacoesEnviadasIds = new Set<number>(),
  solicitacoesRecebidasIds = new Set<number>(),
  carregandoAmizades = false,
  amizadeAcaoUsuarioId = null,
  erroAmizades,
  onEnviarSolicitacao,
}: ParticipantsPanelProps) {
  if (participantes.length === 0) {
    return (
      <EmptyState
        variant="session"
        size="sm"
        icon="characters"
        title="Sem participantes"
        description="Nenhum participante carregado para esta campanha."
      />
    );
  }

  return (
    <div className="space-y-1.5">
      {erroAmizades ? <ErrorAlert message={erroAmizades} /> : null}
      {participantes.map((participante) => {
        const online = onlineSet.has(participante.usuarioId);
        const estadoAmizade = resolverEstadoAmizadeParticipante({
          participanteUsuarioId: participante.usuarioId,
          usuarioAtualId,
          amigoIds,
          solicitacoesEnviadasIds,
          solicitacoesRecebidasIds,
        });
        const ehUsuarioAtual = estadoAmizade === 'proprio';
        const ehAmigo = estadoAmizade === 'amigo';
        const solicitacaoEnviada = estadoAmizade === 'solicitacao-enviada';
        const solicitacaoRecebida = estadoAmizade === 'solicitacao-recebida';
        const acaoPendente = amizadeAcaoUsuarioId === participante.usuarioId;
        const podeEnviarSolicitacao =
          estadoAmizade === 'adicionavel' &&
          Boolean(onEnviarSolicitacao);

        return (
          <div
            key={participante.usuarioId}
            className="flex items-center justify-between gap-2 rounded border border-app-border bg-app-surface px-2 py-1.5"
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold text-app-fg">
                {textoSeguro(participante.apelido)}
                {participante.ehDono ? ' (Dono)' : ''}
              </p>
              <p className="session-text-xxs text-app-muted">
                {labelPapelParticipante(participante.papel)}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
              {!ehUsuarioAtual && ehAmigo ? (
                <span className="session-text-xxs rounded-full bg-app-success/10 px-2 py-0.5 font-semibold text-app-success">
                  Amigo
                </span>
              ) : null}
              {!ehUsuarioAtual && solicitacaoEnviada ? (
                <span className="session-text-xxs rounded-full bg-app-primary/10 px-2 py-0.5 font-semibold text-app-primary">
                  Solicitação enviada
                </span>
              ) : null}
              {!ehUsuarioAtual && solicitacaoRecebida ? (
                <span className="session-text-xxs rounded-full bg-app-warning/10 px-2 py-0.5 font-semibold text-app-warning">
                  Solicitação recebida
                </span>
              ) : null}
              {podeEnviarSolicitacao ? (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => onEnviarSolicitacao?.(participante.usuarioId)}
                  disabled={carregandoAmizades || acaoPendente}
                  title={`Enviar solicitação para ${textoSeguro(participante.apelido)}`}
                >
                  <Icon name="add" className="h-3 w-3" />
                  {acaoPendente ? 'Enviando...' : 'Adicionar'}
                </Button>
              ) : null}
              <span
                className={
                  online
                    ? 'session-text-xxs font-medium text-emerald-300'
                    : 'session-text-xxs font-medium text-app-muted'
                }
              >
                {online ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
