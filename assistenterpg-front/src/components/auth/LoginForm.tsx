'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { useAuth } from '@/context/AuthContext';
import { criarErroUsuario } from '@/lib/api/error-handler';
import { useRateLimitCooldown } from '@/hooks/useRateLimitCooldown';
import type { UserErrorState } from '@/lib/types';

export function LoginForm() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(true);
  const [erro, setErro] = useState<UserErrorState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const {
    captureRateLimit,
    cooldownButtonLabel,
    isCoolingDown,
  } = useRateLimitCooldown();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSubmitting(true);

    try {
      await login(email, senha, lembrar);
    } catch (error) {
      captureRateLimit(error);
      setErro(criarErroUsuario(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold mb-2">Login</h1>
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="Senha"
        type={mostrarSenha ? 'text' : 'password'}
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
        rightIcon={mostrarSenha ? 'eyeOff' : 'eye'}
        rightIconLabel={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
        onRightIconClick={() => setMostrarSenha((valor) => !valor)}
      />
      <label className="flex items-center gap-2 text-xs text-app-muted">
        <Checkbox
          checked={lembrar}
          onChange={(e) => setLembrar(e.target.checked)}
        />
        Lembrar de mim
      </label>
      {erro ? <ErrorAlert message={erro} /> : null}

      <div className="flex items-center justify-between text-sm">
        <Link
          href="/auth/forgot-password"
          className="text-app-secondary hover:text-app-secondary-hover transition-colors"
        >
          Esqueci minha senha
        </Link>
        <Link
          href="/auth/resend-verification"
          className="text-app-muted hover:text-app-fg transition-colors"
        >
          Reenviar verificação
        </Link>
      </div>

      <Link
        href="/auth/reactivate-account"
        className="text-center text-xs text-app-muted hover:text-app-fg transition-colors"
      >
        Reativar uma conta desativada
      </Link>

      <Button type="submit" disabled={submitting || isCoolingDown}>
        {cooldownButtonLabel ?? (submitting ? 'Entrando...' : 'Entrar')}
      </Button>
    </form>
  );
}
