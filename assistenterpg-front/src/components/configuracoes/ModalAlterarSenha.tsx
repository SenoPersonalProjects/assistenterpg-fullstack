// components/configuracoes/ModalAlterarSenha.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';
import { criarErroLocalUsuario, criarErroUsuario } from '@/lib/api/error-handler';
import {
  PASSWORD_POLICY,
  PASSWORD_REQUIREMENTS_TEXT,
  validateNewPassword,
} from '@/lib/auth/password-policy';
import { useRateLimitCooldown } from '@/hooks/useRateLimitCooldown';
import type { UserErrorState } from '@/lib/types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (senhaAtual: string, novaSenha: string) => Promise<void>;
};

export function ModalAlterarSenha({ isOpen, onClose, onConfirm }: Props) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<UserErrorState | null>(null);
  const {
    captureRateLimit,
    cooldownButtonLabel,
    isCoolingDown,
  } = useRateLimitCooldown();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    // Validações
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setErro(criarErroLocalUsuario('Preencha todos os campos'));
      return;
    }

    const passwordError = validateNewPassword(novaSenha);
    if (passwordError) {
      setErro(criarErroLocalUsuario(passwordError));
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro(criarErroLocalUsuario('As senhas não coincidem'));
      return;
    }

    try {
      setLoading(true);
      await onConfirm(senhaAtual, novaSenha);
      
      // Limpar campos e fechar
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      onClose();
    } catch (error) {
      captureRateLimit(error);
      setErro(criarErroUsuario(error));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
    setErro(null);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-app-surface border border-app-border rounded-lg p-6 max-w-md w-full shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-app-fg flex items-center gap-2">
              <Icon name="edit" className="w-5 h-5" />
              Alterar Senha
            </h2>
            <button
              onClick={handleClose}
              className="text-app-muted hover:text-app-fg transition-colors"
              disabled={loading}
            >
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type={mostrarSenhaAtual ? 'text' : 'password'}
              label="Senha Atual"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              placeholder="Digite sua senha atual"
              disabled={loading}
              rightIcon={mostrarSenhaAtual ? 'eyeOff' : 'eye'}
              rightIconLabel={mostrarSenhaAtual ? 'Ocultar senha' : 'Mostrar senha'}
              onRightIconClick={() => setMostrarSenhaAtual((v) => !v)}
            />

            <Input
              type={mostrarNovaSenha ? 'text' : 'password'}
              label="Nova Senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Digite a nova senha"
              disabled={loading}
              minLength={PASSWORD_POLICY.minCharacters}
              helperText={PASSWORD_REQUIREMENTS_TEXT}
              rightIcon={mostrarNovaSenha ? 'eyeOff' : 'eye'}
              rightIconLabel={mostrarNovaSenha ? 'Ocultar senha' : 'Mostrar senha'}
              onRightIconClick={() => setMostrarNovaSenha((v) => !v)}
            />

            <Input
              type={mostrarConfirmacao ? 'text' : 'password'}
              label="Confirmar Nova Senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Confirme a nova senha"
              disabled={loading}
              minLength={PASSWORD_POLICY.minCharacters}
              rightIcon={mostrarConfirmacao ? 'eyeOff' : 'eye'}
              rightIconLabel={
                mostrarConfirmacao ? 'Ocultar confirmação' : 'Mostrar confirmação'
              }
              onRightIconClick={() => setMostrarConfirmacao((v) => !v)}
            />

            {erro ? <ErrorAlert message={erro} /> : null}

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
                variant="primary"
                disabled={loading || isCoolingDown}
                className="flex-1"
              >
                {cooldownButtonLabel ??
                  (loading ? 'Alterando...' : 'Alterar Senha')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
