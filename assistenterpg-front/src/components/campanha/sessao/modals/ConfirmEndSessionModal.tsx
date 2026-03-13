'use client';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Encerrar sessao"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={encerrandoSessao}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={encerrandoSessao || sessaoEncerrada}
          >
            {encerrandoSessao ? 'Encerrando...' : 'Encerrar sessao'}
          </Button>
        </>
      }
    >
      <p className="text-sm text-app-fg">
        Encerrar a sessao vai bloquear operacoes de combate e atualizacoes de cena.
      </p>
    </Modal>
  );
}
