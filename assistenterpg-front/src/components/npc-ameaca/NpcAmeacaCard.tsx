'use client';

import type { NpcAmeacaResumo } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
    <Card className="library-item-card space-y-3 border transition-all duration-200 hover:-translate-y-0.5 hover:border-app-secondary/40">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-app-fg">{npcAmeaca.nome}</h3>
          <p className="text-xs text-app-muted">
            {labelTipoNpc(npcAmeaca.tipo)} | Tamanho {labelTamanhoNpc(npcAmeaca.tamanho)}
          </p>
        </div>
        <Badge color={corBadgeFichaTipo(npcAmeaca.fichaTipo)} size="sm">
          {labelFichaTipo(npcAmeaca.fichaTipo)}
        </Badge>
      </div>

      {npcAmeaca.descricao && (
        <p className="line-clamp-2 text-sm text-app-muted">{npcAmeaca.descricao}</p>
      )}

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-xl border border-white/6 bg-white/4 px-2 py-1">
          <span className="text-app-muted">VD</span>
          <p className="font-semibold text-app-fg">{npcAmeaca.vd}</p>
        </div>
        <div className="rounded-xl border border-white/6 bg-white/4 px-2 py-1">
          <span className="text-app-muted">Defesa</span>
          <p className="font-semibold text-app-fg">{npcAmeaca.defesa}</p>
        </div>
        <div className="rounded-xl border border-white/6 bg-white/4 px-2 py-1">
          <span className="text-app-muted">PV</span>
          <p className="font-semibold text-app-fg">{npcAmeaca.pontosVida}</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-white/6 pt-3">
        {onExport ? (
          <Button type="button" variant="secondary" size="sm" onClick={onExport} className="library-ghost-button">
            <Icon name="download" className="w-4 h-4 mr-1" />
            JSON
          </Button>
        ) : null}
        <Button type="button" variant="secondary" size="sm" onClick={onView} className="library-ghost-button">
          <Icon name="eye" className="w-4 h-4 mr-1" />
          Ver
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onEdit} className="library-ghost-button">
          <Icon name="edit" className="w-4 h-4 mr-1" />
          Editar
        </Button>
        <Button type="button" size="sm" onClick={onDelete} disabled={deleting} className="!bg-app-danger/10 !text-app-danger hover:!bg-app-danger/20">
          <Icon name="delete" className="w-4 h-4 mr-1" />
          {deleting ? 'Excluindo...' : 'Excluir'}
        </Button>
      </div>
    </Card>
  );
}
