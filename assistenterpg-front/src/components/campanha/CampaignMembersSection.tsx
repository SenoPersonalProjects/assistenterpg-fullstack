'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import { resolverEstadoAmizadeParticipante } from '@/lib/campanha/amizade-participantes';
import type { UserErrorState } from '@/lib/types';

type Membro = {
  id: number;
  papel: string;
  usuarioId: number;
  usuario: { id: number; apelido: string };
};

type Props = {
  membros: Membro[];
  donoId: number;
  usuarioAtualId?: number | null;
  amigoIds?: Set<number>;
  solicitacoesEnviadasIds?: Set<number>;
  solicitacoesRecebidasIds?: Set<number>;
  carregandoAmizades?: boolean;
  amizadeAcaoUsuarioId?: number | null;
  erroAmizades?: UserErrorState | null;
  onEnviarSolicitacao?: (usuarioId: number) => void;
};

export function CampaignMembersSection({
  membros,
  donoId,
  usuarioAtualId = null,
  amigoIds = new Set<number>(),
  solicitacoesEnviadasIds = new Set<number>(),
  solicitacoesRecebidasIds = new Set<number>(),
  carregandoAmizades = false,
  amizadeAcaoUsuarioId = null,
  erroAmizades,
  onEnviarSolicitacao,
}: Props) {
  return (
    <section className="space-y-3 rounded-xl border border-white/5 bg-app-surface/45 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-app-muted">
          Total: {membros.length} membro(s)
        </p>
      </div>

      {erroAmizades ? <ErrorAlert message={erroAmizades} /> : null}

      {membros.length === 0 ? (
        <EmptyState
          variant="plain"
          icon="characters"
          title="Nenhum membro ainda"
          description="Convide jogadores ou observadores para participarem da campanha."
          size="sm"
        />
      ) : (
        <ul className="divide-y divide-app-border/70 text-sm">
          {membros.map((m) => {
            const isOwner = m.usuarioId === donoId;
            const papel = isOwner ? 'MESTRE' : m.papel;
            const corPapel =
              papel === 'MESTRE'
                ? 'purple'
                : papel === 'JOGADOR'
                ? 'blue'
                : 'gray';
            const inicial = (m.usuario.apelido || '?').slice(0, 1).toUpperCase();
            const estadoAmizade = resolverEstadoAmizadeParticipante({
              participanteUsuarioId: m.usuarioId,
              usuarioAtualId,
              amigoIds,
              solicitacoesEnviadasIds,
              solicitacoesRecebidasIds,
            });
            const acaoPendente = amizadeAcaoUsuarioId === m.usuarioId;
            const podeEnviarSolicitacao =
              estadoAmizade === 'adicionavel' && Boolean(onEnviarSolicitacao);

            return (
              <li
                key={m.id}
                className="flex items-center justify-between gap-3 py-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-app-primary/10 text-xs font-semibold text-app-primary">
                    {inicial}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-app-fg">
                      {m.usuario.apelido}
                    </p>
                    {isOwner && (
                      <p className="text-xs text-app-muted">Dono da campanha</p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                  {estadoAmizade === 'amigo' ? (
                    <span className="rounded-full bg-app-success/10 px-2 py-0.5 text-xs font-semibold text-app-success">
                      Amigo
                    </span>
                  ) : null}
                  {estadoAmizade === 'solicitacao-enviada' ? (
                    <span className="rounded-full bg-app-primary/10 px-2 py-0.5 text-xs font-semibold text-app-primary">
                      Solicitação enviada
                    </span>
                  ) : null}
                  {estadoAmizade === 'solicitacao-recebida' ? (
                    <span className="rounded-full bg-app-warning/10 px-2 py-0.5 text-xs font-semibold text-app-warning">
                      Solicitação recebida
                    </span>
                  ) : null}
                  {podeEnviarSolicitacao ? (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => onEnviarSolicitacao?.(m.usuarioId)}
                      disabled={carregandoAmizades || acaoPendente}
                      title={`Enviar solicitação para ${m.usuario.apelido}`}
                    >
                      <Icon name="add" className="h-3 w-3" />
                      {acaoPendente ? 'Enviando...' : 'Adicionar'}
                    </Button>
                  ) : null}
                  <Badge color={corPapel} size="sm">
                    {papel}
                  </Badge>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
