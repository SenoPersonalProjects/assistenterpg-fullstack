//src/components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export function LoginForm() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSubmitting(true);
    try {
      await login(email, senha);
    } catch {
      setErro('Email ou senha inválidos');
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
        onChange={e => setEmail(e.target.value)}
      />
      <Input
        label="Senha"
        type="password"
        value={senha}
        onChange={e => setSenha(e.target.value)}
      />
      {erro && <p className="text-sm text-red-600">{erro}</p>}
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
}
