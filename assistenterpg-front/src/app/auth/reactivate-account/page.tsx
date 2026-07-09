'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Input } from '@/components/ui/Input';
import { useRateLimitCooldown } from '@/hooks/useRateLimitCooldown';
import { apiReactivateAccount } from '@/lib/api';
import { criarErroUsuario } from '@/lib/api/error-handler';
import type { UserErrorState } from '@/lib/types';

export default function ReactivateAccountPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<UserErrorState | null>(null);
  const {
    captureRateLimit,
    cooldownButtonLabel,
    isCoolingDown,
  } = useRateLimitCooldown();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setSubmitting(true);

    try {
      const response = await apiReactivateAccount(email, senha);
      setMessage(response.mensagem);
      setSenha('');
    } catch (requestError) {
      captureRateLimit(requestError);
      setError(criarErroUsuario(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPageShell
      title="Reativar conta"
      subtitle="Recupere o acesso de uma conta desativada ou com exclusão agendada"
      footer={
        <Link
          href="/auth/login"
          className="text-sm font-semibold text-app-secondary hover:text-app-secondary-hover"
        >
          Voltar ao login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Input
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          required
          rightIcon={showPassword ? 'eyeOff' : 'eye'}
          rightIconLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          onRightIconClick={() => setShowPassword((value) => !value)}
        />

        {message ? (
          <p className="rounded border border-app-border bg-app-surface px-3 py-2 text-sm text-app-success">
            {message}
          </p>
        ) : null}
        {error ? <ErrorAlert message={error} /> : null}

        <Button type="submit" disabled={submitting || isCoolingDown}>
          {cooldownButtonLabel ??
            (submitting ? 'Reativando...' : 'Reativar conta')}
        </Button>
      </form>
    </AuthPageShell>
  );
}
