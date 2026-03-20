'use client';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { NpcSessaoCampanha } from '@/lib/types';

type ConfirmNpcRemovalModalProps = {
  npc: NpcSessaoCampanha | null;
  onClose: () => void;
  onConfirm: (npcSessaoId: number) => void;
  removendoNpcId: number | null;
  sessaoEncerrada: boolean;
  textoSeguro: (value: string | null | undefined) => string;
};

export function ConfirmNpcRemovalModal({
  npc,
  onClose,
  onConfirm,
  removendoNpcId,
  sessaoEncerrada,
  textoSeguro,
}: ConfirmNpcRemovalModalProps) {
  const removendo = Boolean(npc && removendoNpcId === npc.npcSessaoId);

  return (
    <ConfirmDialog
      isOpen={Boolean(npc)}
      onClose={onClose}
      onConfirm={() => (npc ? onConfirm(npc.npcSessaoId) : undefined)}
      title="Remover aliado ou ameaca"
      description={
        npc ? `Remover "${textoSeguro(npc.nome)}" da cena atual?` : 'Remover da cena?'
      }
      confirmLabel="Remover"
      cancelLabel="Cancelar"
      variant="danger"
      confirmDisabled={sessaoEncerrada}
      confirmLoading={removendo}
    />
  );
}
