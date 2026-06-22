'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Input } from '@/components/ui/Input';
import { apiResendVerificationEmail } from '@/lib/api';
import { criarErroUsuario } from '@/lib/api/error-handler';
import { useRateLimitCooldown } from '@/hooks/useRateLimitCooldown';
import type { UserErrorState } from '@/lib/types';

export default function ResendVerificationPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<UserErrorState | null>(null);
  const {
    captureRateLimit,
    cooldownButtonLabel,
    isCoolingDown,
  } = useRateLimitCooldown();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setMensagem(null);
    setSubmitting(true);

    try {
      const resposta = await apiResendVerificationEmail(email);
      setMensagem(resposta.mensagem);
    } catch (error) {
      captureRateLimit(error);
      setErro(criarErroUsuario(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPageShell
      title="Reenviar verificação"
      subtitle="Solicite um novo link para confirmar seu email"
      footer={
        <p className="text-sm text-app-muted">
          Ja verificou?{' '}
          <Link
            href="/auth/login"
            className="text-app-secondary hover:text-app-secondary-hover font-semibold transition-colors"
          >
            Ir para o login
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {mensagem ? (
          <p className="text-sm text-app-success bg-app-surface border border-app-border rounded px-3 py-2">
            {mensagem}
          </p>
        ) : null}

        {erro ? <ErrorAlert message={erro} /> : null}

        <Button type="submit" disabled={submitting || isCoolingDown}>
          {cooldownButtonLabel ??
            (submitting ? 'Enviando...' : 'Reenviar verificação')}
        </Button>
      </form>
    </AuthPageShell>
  );
}
