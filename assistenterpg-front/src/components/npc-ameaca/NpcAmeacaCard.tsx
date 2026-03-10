'use client';

import type { NpcAmeacaResumo } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';

type NpcAmeacaCardProps = {
  npcAmeaca: NpcAmeacaResumo;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
};

function traduzirFichaTipo(valor: NpcAmeacaResumo['fichaTipo']): string {
  return valor === 'NPC' ? 'NPC' : 'Ameaca';
}

function traduzirTipo(valor: NpcAmeacaResumo['tipo']): string {
  const mapa: Record<NpcAmeacaResumo['tipo'], string> = {
    HUMANO: 'Humano',
    FEITICEIRO: 'Feiticeiro',
    MALDICAO: 'Maldicao',
    ANIMAL: 'Animal',
    HIBRIDO: 'Hibrido',
    OUTRO: 'Outro',
  };
  return mapa[valor];
}

function traduzirTamanho(valor: NpcAmeacaResumo['tamanho']): string {
  const mapa: Record<NpcAmeacaResumo['tamanho'], string> = {
    MINUSCULO: 'Minusculo',
    PEQUENO: 'Pequeno',
    MEDIO: 'Medio',
    GRANDE: 'Grande',
    ENORME: 'Enorme',
    COLOSSAL: 'Colossal',
  };
  return mapa[valor];
}

export function NpcAmeacaCard({
  npcAmeaca,
  onView,
  onEdit,
  onDelete,
  deleting = false,
}: NpcAmeacaCardProps) {
  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-app-fg">{npcAmeaca.nome}</h3>
          <p className="text-xs text-app-muted">
            {traduzirTipo(npcAmeaca.tipo)} | Tamanho {traduzirTamanho(npcAmeaca.tamanho)}
          </p>
        </div>
        <Badge color={npcAmeaca.fichaTipo === 'NPC' ? 'blue' : 'red'} size="sm">
          {traduzirFichaTipo(npcAmeaca.fichaTipo)}
        </Badge>
      </div>

      {npcAmeaca.descricao && (
        <p className="line-clamp-2 text-sm text-app-muted">{npcAmeaca.descricao}</p>
      )}

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="rounded border border-app-border bg-app-base px-2 py-1">
          <span className="text-app-muted">VD</span>
          <p className="font-semibold text-app-fg">{npcAmeaca.vd}</p>
        </div>
        <div className="rounded border border-app-border bg-app-base px-2 py-1">
          <span className="text-app-muted">Defesa</span>
          <p className="font-semibold text-app-fg">{npcAmeaca.defesa}</p>
        </div>
        <div className="rounded border border-app-border bg-app-base px-2 py-1">
          <span className="text-app-muted">PV</span>
          <p className="font-semibold text-app-fg">{npcAmeaca.pontosVida}</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onView}>
          <Icon name="eye" className="w-4 h-4 mr-1" />
          Ver
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onEdit}>
          <Icon name="edit" className="w-4 h-4 mr-1" />
          Editar
        </Button>
        <Button type="button" size="sm" onClick={onDelete} disabled={deleting}>
          <Icon name="delete" className="w-4 h-4 mr-1" />
          {deleting ? 'Excluindo...' : 'Excluir'}
        </Button>
      </div>
    </Card>
  );
}
