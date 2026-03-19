// components/campanha/CampaignCard.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import type { CampanhaResumo } from '@/lib/api';

type Props = {
  campanha: CampanhaResumo;
  onDelete?: () => void;
  onView?: () => void;
};

type StatusStyle = {
  badge: 'green' | 'yellow' | 'red';
  bar: string;
};

function obterEstiloStatus(status: string): StatusStyle {
  if (status === 'ATIVA') return { badge: 'green', bar: 'bg-app-success' };
  if (status === 'PAUSADA') return { badge: 'yellow', bar: 'bg-app-warning' };
  return { badge: 'red', bar: 'bg-app-danger' };
}

export function CampaignCard({ campanha, onDelete, onView }: Props) {
  const router = useRouter();
  const { badge, bar } = obterEstiloStatus(campanha.status);
  const dataCriacao = new Date(campanha.criadoEm).toLocaleDateString('pt-BR');

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onDelete) {
      onDelete();
    }
  };

  const handlePreview = () => {
    if (onView) {
      onView();
      return;
    }
    router.push(`/campanhas/${campanha.id}`);
  };

  const handleOpen = () => {
    router.push(`/campanhas/${campanha.id}`);
  };

  return (
    <Card className="relative flex flex-col gap-3 overflow-hidden transition hover:shadow-md hover:border-app-primary/30">
      <div className={`absolute inset-x-0 top-0 h-1 ${bar}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-app-fg">
            {campanha.nome}
          </h3>
          <p className="text-xs text-app-muted">
            Dono: {campanha.dono.apelido} • Criada em {dataCriacao}
          </p>
        </div>
        <Badge color={badge} size="sm">
          {campanha.status}
        </Badge>
      </div>

      {campanha.descricao ? (
        <p className="text-sm text-app-muted line-clamp-3">
          {campanha.descricao}
        </p>
      ) : (
        <p className="text-sm text-app-muted">Sem descrição informada.</p>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-app-muted">
        <span className="inline-flex items-center gap-1 rounded-full border border-app-border px-2 py-0.5">
          <Icon name="characters" className="h-3.5 w-3.5" />
          {campanha._count.membros} membros
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-app-border px-2 py-0.5">
          <Icon name="id" className="h-3.5 w-3.5" />
          {campanha._count.personagens} personagens
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-app-border px-2 py-0.5">
          <Icon name="scroll" className="h-3.5 w-3.5" />
          {campanha._count.sessoes} sessões
        </span>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" onClick={handlePreview}>
          <Icon name="eye" className="w-4 h-4 mr-1" />
          Prévia
        </Button>
        <Button size="sm" onClick={handleOpen} className="flex-1">
          Abrir campanha
        </Button>

        {onDelete && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDelete}
            className="text-app-danger hover:bg-app-danger/10"
            title="Excluir campanha"
          >
            <Icon name="delete" className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
