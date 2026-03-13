'use client';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
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
    <Modal
      isOpen={Boolean(npc)}
      onClose={onClose}
      title="Remover aliado ou ameaca"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={removendo}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => (npc ? onConfirm(npc.npcSessaoId) : undefined)}
            disabled={removendo || sessaoEncerrada}
          >
            {removendo ? 'Removendo...' : 'Remover'}
          </Button>
        </>
      }
    >
      <p className="text-sm text-app-fg">
        Remover &quot;{textoSeguro(npc?.nome ?? '')}&quot; da cena atual?
      </p>
    </Modal>
  );
}
