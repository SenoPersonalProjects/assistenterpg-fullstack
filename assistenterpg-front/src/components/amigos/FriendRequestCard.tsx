'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EntityActionsMenu } from '@/components/ui/EntityActionsMenu';
import { Icon } from '@/components/ui/Icon';
import type { SolicitacaoAmizadeResumo } from '@/lib/types';

type Props = {
  solicitacao: SolicitacaoAmizadeResumo;
  tipo: 'recebida' | 'enviada';
  loading?: boolean;
  onAccept?: (id: number) => void;
  onReject?: (id: number) => void;
  onCancel?: (id: number) => void;
};

export function FriendRequestCard({
  solicitacao,
  tipo,
  loading = false,
  onAccept,
  onReject,
  onCancel,
}: Props) {
  const data = new Date(solicitacao.criadoEm).toLocaleDateString('pt-BR');
  const isRecebida = tipo === 'recebida';

  return (
    <article className="flex min-w-0 flex-col gap-3 rounded-xl border border-white/5 bg-app-surface/55 p-4 shadow-sm shadow-black/5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-app-secondary/10 text-app-secondary">
          <Icon name="user" className="h-4 w-4" />
        </span>

        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p className="truncate text-sm font-black text-app-fg">
              {solicitacao.usuario.apelido}
            </p>
            <Badge color="purple" size="xs" variant="subtle">
              Pendente
            </Badge>
          </div>
          <p className="mt-0.5 truncate text-xs font-medium text-app-muted">
            {isRecebida ? 'Solicitou amizade' : 'Solicitação enviada'} em {data}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2">
        {isRecebida ? (
          <Button
            type="button"
            size="sm"
            disabled={loading}
            onClick={() => onAccept?.(solicitacao.id)}
          >
            Aceitar
          </Button>
        ) : null}

        <EntityActionsMenu
          ariaLabel={`Ações da solicitação de ${solicitacao.usuario.apelido}`}
          items={[
            {
              id: 'reject',
              label: loading ? 'Recusando...' : 'Recusar',
              icon: 'close',
              destructive: true,
              disabled: loading,
              hidden: !isRecebida,
              onSelect: () => onReject?.(solicitacao.id),
            },
            {
              id: 'cancel',
              label: loading ? 'Cancelando...' : 'Cancelar solicitação',
              icon: 'close',
              destructive: true,
              disabled: loading,
              hidden: isRecebida,
              onSelect: () => onCancel?.(solicitacao.id),
            },
          ]}
        />
      </div>
    </article>
  );
}
