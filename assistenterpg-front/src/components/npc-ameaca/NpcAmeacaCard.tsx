'use client';

import type { NpcAmeacaResumo } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EntityActionsMenu } from '@/components/ui/EntityActionsMenu';
import { Icon } from '@/components/ui/Icon';
import {
  corBadgeFichaTipo,
  labelFichaTipo,
  labelTamanhoNpc,
  labelTipoNpc,
} from './npcAmeacaUi';

type NpcAmeacaCardProps = {
  npcAmeaca: NpcAmeacaResumo;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onExport?: () => void;
  deleting?: boolean;
};

export function NpcAmeacaCard({
  npcAmeaca,
  onView,
  onEdit,
  onDelete,
  onExport,
  deleting = false,
}: NpcAmeacaCardProps) {
  return (
    <Card
      variant="flat"
      className="flex h-full flex-col gap-3 border-white/5 bg-app-surface/45 !p-4 shadow-sm shadow-black/5 hover:border-app-primary/25 hover:bg-app-surface/70"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-black text-app-fg">
            {npcAmeaca.nome}
          </h3>
          <p className="mt-1 truncate text-xs font-semibold text-app-muted">
            {labelTipoNpc(npcAmeaca.tipo)} / Tamanho {labelTamanhoNpc(npcAmeaca.tamanho)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Badge color={corBadgeFichaTipo(npcAmeaca.fichaTipo)} size="sm" variant="subtle">
            {labelFichaTipo(npcAmeaca.fichaTipo)}
          </Badge>
          <EntityActionsMenu
            ariaLabel={`Ações da ficha ${npcAmeaca.nome}`}
            items={[
              {
                id: 'edit',
                label: 'Editar',
                icon: 'edit',
                onSelect: onEdit,
                disabled: deleting,
              },
              {
                id: 'export',
                label: 'Exportar JSON',
                icon: 'download',
                onSelect: onExport,
                hidden: !onExport,
                disabled: deleting,
              },
              {
                id: 'delete',
                label: deleting ? 'Excluindo...' : 'Excluir',
                icon: 'delete',
                onSelect: onDelete,
                destructive: true,
                disabled: deleting,
              },
            ]}
          />
        </div>
      </div>

      {npcAmeaca.descricao ? (
        <p className="line-clamp-2 text-sm leading-relaxed text-app-muted">
          {npcAmeaca.descricao}
        </p>
      ) : (
        <p className="text-sm leading-relaxed text-app-muted">Sem descrição informada.</p>
      )}

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'VD', value: npcAmeaca.vd },
          { label: 'Defesa', value: npcAmeaca.defesa },
          { label: 'PV', value: npcAmeaca.pontosVida },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-white/5 bg-app-bg/45 px-3 py-2"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-app-muted">
              {metric.label}
            </p>
            <p className="mt-1 truncate text-xl font-black leading-none text-app-fg">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-1">
        <Button type="button" size="sm" onClick={onView} className="w-full gap-2">
          <Icon name="eye" className="h-4 w-4" />
          Ver ficha
        </Button>
      </div>
    </Card>
  );
}
