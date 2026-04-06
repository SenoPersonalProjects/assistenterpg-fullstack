'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiResetPassword } from '@/lib/api';
import { extrairMensagemErro } from '@/lib/api/error-handler';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      setErro('Token de recuperacao ausente.');
      return;
    }

    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmacao) {
      setErro('As senhas nao coincidem.');
      return;
    }

    setErro(null);
    setMensagem(null);
    setSubmitting(true);

    try {
      const resposta = await apiResetPassword(token, novaSenha);
      setMensagem(resposta.mensagem);
      setTimeout(() => {
        router.push('/auth/login');
      }, 1200);
    } catch (error) {
      setErro(extrairMensagemErro(error));
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
          minLength={6}
          required
          rightIcon={mostrarSenha ? 'eyeOff' : 'eye'}
          rightIconLabel={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
          onRightIconClick={() => setMostrarSenha((v) => !v)}
        />

        <Input
          label="Confirmar nova senha"
          type={mostrarConfirmacao ? 'text' : 'password'}
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
          minLength={6}
          required
          rightIcon={mostrarConfirmacao ? 'eyeOff' : 'eye'}
          rightIconLabel={
            mostrarConfirmacao ? 'Ocultar confirmacao' : 'Mostrar confirmacao'
          }
          onRightIconClick={() => setMostrarConfirmacao((v) => !v)}
        />

        {mensagem ? (
          <p className="text-sm text-app-success bg-app-surface border border-app-border rounded px-3 py-2">
            {mensagem}
          </p>
        ) : null}

        {erro ? <p className="text-sm text-red-600">{erro}</p> : null}

        <Button type="submit" disabled={submitting || !token}>
          {submitting ? 'Salvando...' : 'Salvar nova senha'}
        </Button>
      </form>
    </AuthPageShell>
  );
}
