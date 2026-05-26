'use client';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

type ConfirmEndSessionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  encerrandoSessao: boolean;
  sessaoEncerrada: boolean;
};

export function ConfirmEndSessionModal({
  isOpen,
  onClose,
  onConfirm,
  encerrandoSessao,
  sessaoEncerrada,
}: ConfirmEndSessionModalProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Encerrar sessão"
      description="Encerrar a sessão vai bloquear operações de combate e atualizações de cena."
      confirmLabel="Encerrar sessão"
      cancelLabel="Cancelar"
      variant="danger"
      confirmDisabled={sessaoEncerrada}
      confirmLoading={encerrandoSessao}
    />
  );
}
