'use client';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';

type Props = {
  donoApelido: string;
  criadoEm: string;
  totalMembros: number;
  totalPersonagens: number;
  totalSessoes: number;
  status: string;
};

export function CampaignHeader({
  donoApelido,
  criadoEm,
  totalMembros,
  totalPersonagens,
  totalSessoes,
  status,
}: Props) {
  const corStatus =
    status === 'ATIVA' ? 'green' : status === 'PAUSADA' ? 'yellow' : 'red';

  return (
    <Card className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-app-muted">
            Resumo da campanha
          </p>
          <p className="text-sm text-app-muted">
            Dono: {donoApelido} | Criada em {criadoEm}
          </p>
        </div>
        <Badge color={corStatus} size="lg">
          {status}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border border-app-border bg-app-surface p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-app-primary/10 text-app-primary">
            <Icon name="characters" className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-app-muted">Membros</p>
            <p className="text-lg font-semibold text-app-fg">{totalMembros}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-app-border bg-app-surface p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-app-secondary/10 text-app-secondary">
            <Icon name="id" className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-app-muted">Personagens</p>
            <p className="text-lg font-semibold text-app-fg">{totalPersonagens}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-app-border bg-app-surface p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-app-info/10 text-app-info">
            <Icon name="scroll" className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-app-muted">Sessões</p>
            <p className="text-lg font-semibold text-app-fg">{totalSessoes}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
