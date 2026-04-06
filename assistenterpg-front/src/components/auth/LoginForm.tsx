'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { useAuth } from '@/context/AuthContext';
import { extrairMensagemErro } from '@/lib/api/error-handler';

export function LoginForm() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSubmitting(true);

    try {
      await login(email, senha, lembrar);
    } catch (error) {
      setErro(extrairMensagemErro(error));
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
      {erro && <p className="text-sm text-red-600">{erro}</p>}

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
          Reenviar verificacao
        </Link>
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
}
