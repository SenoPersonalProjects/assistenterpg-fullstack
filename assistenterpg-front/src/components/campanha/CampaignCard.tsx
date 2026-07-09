// components/campanha/CampaignCard.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EntityActionsMenu } from '@/components/ui/EntityActionsMenu';
import { Icon } from '@/components/ui/Icon';
import type { CampanhaResumo } from '@/lib/api';

type Props = {
  campanha: CampanhaResumo;
  onDelete?: () => void;
  onView?: () => void;
};

type StatusStyle = {
  badge: 'green' | 'yellow' | 'red';
  dot: string;
};

function obterEstiloStatus(status: string): StatusStyle {
  if (status === 'ATIVA') return { badge: 'green', dot: 'bg-app-success' };
  if (status === 'PAUSADA') return { badge: 'yellow', dot: 'bg-app-warning' };
  return { badge: 'red', dot: 'bg-app-danger' };
}

function formatarStatus(status: string): string {
  return status
    .toLowerCase()
    .split('_')
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(' ');
}

export function CampaignCard({ campanha, onDelete, onView }: Props) {
  const router = useRouter();
  const { badge, dot } = obterEstiloStatus(campanha.status);
  const dataCriacao = new Date(campanha.criadoEm).toLocaleDateString('pt-BR');

  const handlePreview = () => {
    if (onView) {
      onView();
    }
  };

  const handleOpen = () => {
    router.push(`/campanhas/${campanha.id}`);
  };

  return (
    <Card
      variant="flat"
      className="flex h-full flex-col gap-3 border-white/5 bg-app-surface/45 !p-4 shadow-sm shadow-black/5 hover:border-app-primary/25 hover:bg-app-surface/70"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-black text-app-fg">
            {campanha.nome}
          </h3>
          <p className="mt-1 truncate text-xs font-semibold text-app-muted">
            {campanha.dono.apelido} / Criada em {dataCriacao}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge color={badge} size="sm" variant="subtle">
            <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${dot}`} />
            {formatarStatus(campanha.status)}
          </Badge>
          <EntityActionsMenu
            ariaLabel={`Ações da campanha ${campanha.nome}`}
            items={[
              {
                id: 'preview',
                label: 'Prévia',
                icon: 'eye',
                onSelect: handlePreview,
                hidden: !onView,
              },
              {
                id: 'delete',
                label: 'Excluir',
                icon: 'delete',
                onSelect: () => onDelete?.(),
                destructive: true,
                hidden: !onDelete,
              },
            ]}
          />
        </div>
      </div>

      {campanha.descricao ? (
        <p className="line-clamp-2 text-sm leading-relaxed text-app-muted">
          {campanha.descricao}
        </p>
      ) : (
        <p className="text-sm leading-relaxed text-app-muted">
          Sem descrição informada.
        </p>
      )}

      <div className="flex flex-wrap gap-2 text-xs font-semibold text-app-muted">
        <span className="inline-flex items-center gap-1 rounded-lg border border-white/5 bg-app-bg/45 px-2 py-1">
          <Icon name="characters" className="h-3.5 w-3.5 text-app-muted" />
          {campanha._count.membros} membros
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg border border-white/5 bg-app-bg/45 px-2 py-1">
          <Icon name="id" className="h-3.5 w-3.5 text-app-muted" />
          {campanha._count.personagens} personagens
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg border border-white/5 bg-app-bg/45 px-2 py-1">
          <Icon name="scroll" className="h-3.5 w-3.5 text-app-muted" />
          {campanha._count.sessoes} sessões
        </span>
      </div>

      <div className="mt-auto pt-1">
        <Button size="sm" onClick={handleOpen} className="w-full gap-2">
          <Icon name="campaign" className="h-4 w-4" />
          Abrir
        </Button>
      </div>
    </Card>
  );
}
