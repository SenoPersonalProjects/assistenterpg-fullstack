'use client';

import { Badge } from '@/components/ui/Badge';

type Props = {
  nome: string;
  donoApelido: string;
  criadoEm: string;
  totalPersonagens: number;
  totalSessoes: number;
  status: string;
};

export function CampaignHeader({
  nome,
  donoApelido,
  criadoEm,
  totalPersonagens,
  totalSessoes,
  status,
}: Props) {
  const corStatus =
    status === 'ATIVA' ? 'green' : status === 'PAUSADA' ? 'yellow' : 'red';

  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-app-fg">{nome}</h1>
        <p className="text-sm text-app-muted">Dono: {donoApelido}</p>
        <p className="text-sm text-app-muted">Criada em {criadoEm}</p>
        <p className="text-xs text-app-muted">
          Personagens: {totalPersonagens}
        </p>
        <p className="text-xs text-app-muted">Sessões: {totalSessoes}</p>
      </div>
      <Badge color={corStatus}>{status}</Badge>
    </header>
  );
}
