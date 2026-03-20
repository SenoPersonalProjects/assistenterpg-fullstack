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
      title="Encerrar sessao"
      description="Encerrar a sessao vai bloquear operacoes de combate e atualizacoes de cena."
      confirmLabel="Encerrar sessao"
      cancelLabel="Cancelar"
      variant="danger"
      confirmDisabled={sessaoEncerrada}
      confirmLoading={encerrandoSessao}
    />
  );
}
