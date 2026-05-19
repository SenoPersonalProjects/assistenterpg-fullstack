'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import type { AmigoResumo } from '@/lib/types';

type Props = {
  amigo: AmigoResumo;
  onRemove?: (usuarioId: number) => void;
  removing?: boolean;
};

export function FriendCard({ amigo, onRemove, removing = false }: Props) {
  return (
    <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-app-surface/60 border-app-border/50 shadow-sm hover:shadow transition-shadow duration-200">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-app-primary/10 text-app-primary">
          <Icon name="user" className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-app-fg">{amigo.apelido}</p>
          <Badge color={amigo.online ? 'green' : 'gray'} size="sm">
            {amigo.online ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </div>

      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={removing}
          onClick={() => onRemove(amigo.id)}
        >
          <Icon name="delete" className="mr-2 h-4 w-4" />
          Remover
        </Button>
      )}
    </Card>
  );
}
