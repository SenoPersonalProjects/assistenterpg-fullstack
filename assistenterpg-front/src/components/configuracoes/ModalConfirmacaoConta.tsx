'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useRateLimitCooldown } from '@/hooks/useRateLimitCooldown';
import { criarErroLocalUsuario, criarErroUsuario } from '@/lib/api/error-handler';
import type { UserErrorState } from '@/lib/types';

type ModalConfirmacaoContaProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (senhaAtual: string) => Promise<void>;
  title: string;
  description: string;
  consequences: string[];
  confirmationWord: string;
  confirmLabel: string;
  loadingLabel: string;
};

export function ModalConfirmacaoConta({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  consequences,
  confirmationWord,
  confirmLabel,
  loadingLabel,
}: ModalConfirmacaoContaProps) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UserErrorState | null>(null);
  const {
    captureRateLimit,
    cooldownButtonLabel,
    isCoolingDown,
  } = useRateLimitCooldown();

  const handleClose = () => {
    if (loading) return;
    setSenhaAtual('');
    setConfirmation('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!senhaAtual) {
      setError(criarErroLocalUsuario('Digite sua senha para confirmar.'));
      return;
    }

    if (confirmation !== confirmationWord) {
      setError(criarErroLocalUsuario(`Digite "${confirmationWord}" para confirmar.`));
      return;
    }

    try {
      setLoading(true);
      await onConfirm(senhaAtual);
      setSenhaAtual('');
      setConfirmation('');
      onClose();
    } catch (requestError) {
      captureRateLimit(requestError);
      setError(criarErroUsuario(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="rounded-xl border border-app-danger/40 bg-app-danger/10 p-4">
          <p className="text-sm font-semibold text-app-danger">{description}</p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-xs text-app-danger">
            {consequences.map((consequence) => (
              <li key={consequence}>{consequence}</li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type={showPassword ? 'text' : 'password'}
            label="Senha atual"
            value={senhaAtual}
            onChange={(event) => setSenhaAtual(event.target.value)}
            disabled={loading}
            required
            rightIcon={showPassword ? 'eyeOff' : 'eye'}
            rightIconLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            onRightIconClick={() => setShowPassword((value) => !value)}
          />

          <Input
            label={`Digite "${confirmationWord}" para confirmar`}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            disabled={loading}
            required
          />

          {error ? <ErrorAlert message={error} /> : null}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={loading || isCoolingDown}
              className="flex-1"
            >
              {cooldownButtonLabel ?? (loading ? loadingLabel : confirmLabel)}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
