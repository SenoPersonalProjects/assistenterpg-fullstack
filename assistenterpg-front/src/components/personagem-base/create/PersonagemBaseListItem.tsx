// components/personagem-base/PersonagemBaseListItem.tsx
'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EntityActionsMenu } from '@/components/ui/EntityActionsMenu';
import { Icon } from '@/components/ui/Icon';
import type { PersonagemBaseResumo } from '@/lib/api';

type Props = {
  personagem: PersonagemBaseResumo;
  onClick?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
};

export function PersonagemBaseListItem({
  personagem,
  onClick,
  onDelete,
  onExport,
}: Props) {
  return (
    <Card
      variant="flat"
      className="flex h-full flex-col gap-3 border-white/5 bg-app-surface/45 !p-4 shadow-sm shadow-black/5 hover:border-app-secondary/25 hover:bg-app-surface/70"
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-black text-app-fg">
            {personagem.nome}
          </h3>
          <p className="mt-1 truncate text-xs font-semibold text-app-muted">
            {personagem.cla} / {personagem.classe}
          </p>
        </div>

        <EntityActionsMenu
          ariaLabel={`Ações do personagem ${personagem.nome}`}
          items={[
            {
              id: 'preview',
              label: 'Prévia',
              icon: 'eye',
              onSelect: onClick,
              hidden: !onClick,
            },
            {
              id: 'export',
              label: 'Exportar JSON',
              icon: 'download',
              onSelect: onExport,
              hidden: !onExport,
            },
            {
              id: 'delete',
              label: 'Excluir',
              icon: 'delete',
              onSelect: onDelete,
              destructive: true,
              hidden: !onDelete,
            },
          ]}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge color="purple" variant="subtle" size="sm">
          Nv. {personagem.nivel}
        </Badge>
        <Badge color="gray" variant="outline" size="sm">
          Personagem-base
        </Badge>
      </div>

      <div className="mt-auto pt-1">
        <Button type="button" size="sm" onClick={onClick} className="w-full gap-2">
          <Icon name="character-gojo" className="h-4 w-4" />
          Abrir ficha
        </Button>
      </div>
    </Card>
  );
}
