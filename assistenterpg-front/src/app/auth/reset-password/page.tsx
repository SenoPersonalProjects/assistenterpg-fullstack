'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRateLimitCooldown } from '@/hooks/useRateLimitCooldown';
import { apiResetPassword } from '@/lib/api';
import { extrairMensagemErro } from '@/lib/api/error-handler';
import {
  PASSWORD_POLICY,
  PASSWORD_REQUIREMENTS_TEXT,
  validateNewPassword,
} from '@/lib/auth/password-policy';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const { requireLogin } = useAuth();
  const { showToast } = useToast();
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const {
    captureRateLimit,
    cooldownButtonLabel,
    isCoolingDown,
  } = useRateLimitCooldown();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      setErro('Token de recuperação ausente.');
      return;
    }

    const passwordError = validateNewPassword(novaSenha);
    if (passwordError) {
      setErro(passwordError);
      return;
    }

    if (novaSenha !== confirmacao) {
      setErro('As senhas não coincidem.');
      return;
    }

    setErro(null);
    setSubmitting(true);

    try {
      const resposta = await apiResetPassword(token, novaSenha);
      showToast(resposta.mensagem, 'success');
      requireLogin();
    } catch (error) {
      setErro(captureRateLimit(error) ?? extrairMensagemErro(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPageShell
      title="Redefinir senha"
      subtitle="Defina uma nova senha para acessar sua conta"
      footer={
        <p className="text-sm text-app-muted">
          Precisa de outro link?{' '}
          <Link
            href="/auth/forgot-password"
            className="text-app-secondary hover:text-app-secondary-hover font-semibold transition-colors"
          >
            Solicitar novamente
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          label="Nova senha"
          type={mostrarSenha ? 'text' : 'password'}
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          minLength={PASSWORD_POLICY.minCharacters}
          helperText={PASSWORD_REQUIREMENTS_TEXT}
          required
          rightIcon={mostrarSenha ? 'eyeOff' : 'eye'}
          rightIconLabel={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
          onRightIconClick={() => setMostrarSenha((value) => !value)}
        />

        <Input
          label="Confirmar nova senha"
          type={mostrarConfirmacao ? 'text' : 'password'}
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
          minLength={PASSWORD_POLICY.minCharacters}
          required
          rightIcon={mostrarConfirmacao ? 'eyeOff' : 'eye'}
          rightIconLabel={
            mostrarConfirmacao ? 'Ocultar confirmação' : 'Mostrar confirmação'
          }
          onRightIconClick={() => setMostrarConfirmacao((value) => !value)}
        />

        {erro ? <p className="text-sm text-red-600">{erro}</p> : null}

        <Button
          type="submit"
          disabled={submitting || !token || isCoolingDown}
        >
          {cooldownButtonLabel ??
            (submitting ? 'Salvando...' : 'Salvar nova senha')}
        </Button>
      </form>
    </AuthPageShell>
  );
}
