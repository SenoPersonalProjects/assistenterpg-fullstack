'use client';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { NpcSessaoCampanhaCompleto } from '@/lib/types';

type ConfirmNpcRemovalModalProps = {
  npc: NpcSessaoCampanhaCompleto | null;
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
      title="Remover aliado ou ameaça"
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
