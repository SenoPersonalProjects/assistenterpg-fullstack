'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiForgotPassword } from '@/lib/api';
import { extrairMensagemErro } from '@/lib/api/error-handler';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setMensagem(null);
    setSubmitting(true);

    try {
      const resposta = await apiForgotPassword(email);
      setMensagem(resposta.mensagem);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPageShell
      title="Recuperar senha"
      subtitle="Enviaremos um link de redefinicao para seu email"
      footer={
        <p className="text-sm text-app-muted">
          Lembrou a senha?{' '}
          <Link
            href="/auth/login"
            className="text-app-secondary hover:text-app-secondary-hover font-semibold transition-colors"
          >
            Voltar ao login
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

        {erro ? <p className="text-sm text-red-600">{erro}</p> : null}

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Enviando...' : 'Enviar link'}
        </Button>
      </form>
    </AuthPageShell>
  );
}
