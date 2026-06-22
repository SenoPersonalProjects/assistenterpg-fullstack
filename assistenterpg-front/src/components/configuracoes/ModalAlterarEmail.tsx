'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useRateLimitCooldown } from '@/hooks/useRateLimitCooldown';
import { criarErroUsuario } from '@/lib/api/error-handler';
import type { UserErrorState } from '@/lib/types';

type ModalAlterarEmailProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (novoEmail: string, senhaAtual: string) => Promise<void>;
};

export function ModalAlterarEmail({
  isOpen,
  onClose,
  onConfirm,
}: ModalAlterarEmailProps) {
  const [novoEmail, setNovoEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
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
    setNovoEmail('');
    setSenhaAtual('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      setLoading(true);
      await onConfirm(novoEmail, senhaAtual);
      setNovoEmail('');
      setSenhaAtual('');
      onClose();
    } catch (requestError) {
      captureRateLimit(requestError);
      setError(criarErroUsuario(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Alterar email" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-app-muted">
          Enviaremos um link de confirmação para o novo endereço. A alteração
          só será aplicada após a verificação.
        </p>

        <Input
          type="email"
          label="Novo email"
          value={novoEmail}
          onChange={(event) => setNovoEmail(event.target.value)}
          disabled={loading}
          required
        />

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
            disabled={loading || isCoolingDown}
            className="flex-1"
          >
            {cooldownButtonLabel ??
              (loading ? 'Solicitando...' : 'Enviar confirmação')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
