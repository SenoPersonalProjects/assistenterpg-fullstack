'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

type InitiativeValueModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  salvando: boolean;
  nomeParticipante: string;
  valor: string;
  onValorChange: (value: string) => void;
};

export function InitiativeValueModal({
  isOpen,
  onClose,
  onConfirm,
  salvando,
  nomeParticipante,
  valor,
  onValorChange,
}: InitiativeValueModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar iniciativa"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-xs text-app-muted">
          Ajuste a iniciativa de <strong className="text-app-fg">{nomeParticipante}</strong>.
        </p>
        <Input
          type="number"
          label="Iniciativa (inteiro)"
          value={valor}
          onChange={(event) => onValorChange(event.target.value)}
          placeholder="Ex.: 12"
        />
      </div>
    </Modal>
  );
}
