'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

type Membro = {
  id: number;
  papel: string;
  usuarioId: number;
  usuario: { id: number; apelido: string };
};

type Props = {
  membros: Membro[];
  donoId: number;
};

export function CampaignMembersSection({ membros, donoId }: Props) {
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-app-muted">
          Total: {membros.length} membro(s)
        </p>
      </div>

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
                <Badge color={corPapel} size="sm">
                  {papel}
                </Badge>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
