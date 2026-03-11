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
  onDelete?: () => void; // ✅ Simplificado: apenas chama a função
  onView?: () => void;
};

export function CampaignCard({ campanha, onDelete, onView }: Props) {
  const router = useRouter();

  const corStatus =
    campanha.status === 'ATIVA'
      ? 'green'
      : campanha.status === 'PAUSADA'
      ? 'yellow'
      : 'red';

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onDelete) {
      onDelete();
    }
  };

  const handleView = () => {
    if (onView) {
      onView();
      return;
    }

    router.push(`/campanhas/${campanha.id}`);
  };

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-app-fg">{campanha.nome}</h3>
        <Badge color={corStatus}>{campanha.status}</Badge>
      </div>
      
      {campanha.descricao && (
        <p className="text-sm text-app-muted line-clamp-3">
          {campanha.descricao}
        </p>
      )}
      
      <p className="text-xs text-app-muted">
        Dono: {campanha.dono.apelido} · Membros: {campanha._count.membros} · Sessões:{' '}
        {campanha._count.sessoes}
      </p>

      <div className="flex gap-2 mt-1">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1"
          onClick={handleView}
        >
          {onView ? 'Ver resumo' : 'Abrir campanha'}
        </Button>

        {/* ✅ Botão de excluir (só aparece se onDelete foi passado) */}
        {onDelete && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDelete}
            className="text-app-danger hover:bg-app-danger/10"
          >
            <Icon name="delete" className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
