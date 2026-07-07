'use client';

import { Badge } from '@/components/ui/Badge';
import { EntityActionsMenu } from '@/components/ui/EntityActionsMenu';
import { Icon } from '@/components/ui/Icon';
import type { AmigoResumo } from '@/lib/types';

type Props = {
  amigo: AmigoResumo;
  onRemove?: (usuarioId: number) => void;
  removing?: boolean;
};

export function FriendCard({ amigo, onRemove, removing = false }: Props) {
  const desde = new Date(amigo.desde).toLocaleDateString('pt-BR');

  return (
    <article className="flex min-w-0 flex-col gap-3 rounded-xl border border-white/5 bg-app-surface/55 p-4 shadow-sm shadow-black/5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-app-primary/10 text-app-primary">
          <Icon name="user" className="h-4 w-4" />
        </span>

        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p className="truncate text-sm font-black text-app-fg">{amigo.apelido}</p>
            <Badge color={amigo.online ? 'green' : 'gray'} size="xs" variant="subtle">
              {amigo.online ? 'Online' : 'Offline'}
            </Badge>
          </div>
          <p className="mt-0.5 truncate text-xs font-medium text-app-muted">
            Desde {desde}
          </p>
        </div>
      </div>

      {onRemove ? (
        <EntityActionsMenu
          ariaLabel={`Ações de ${amigo.apelido}`}
          items={[
            {
              id: 'remove',
              label: removing ? 'Removendo...' : 'Remover amigo',
              icon: 'delete',
              destructive: true,
              disabled: removing,
              onSelect: () => onRemove(amigo.id),
            },
          ]}
        />
      ) : null}
    </article>
  );
}
