'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { apiVerifyEmail } from '@/lib/api';
import { criarErroLocalUsuario, criarErroUsuario } from '@/lib/api/error-handler';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { UserErrorState } from '@/lib/types';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);
  const { requireLogin } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<UserErrorState | null>(null);

  useEffect(() => {
    let ativo = true;

    async function verificar() {
      if (!token) {
        if (ativo) {
          setErro(criarErroLocalUsuario('Token de verificação ausente.'));
          setLoading(false);
        }
        return;
      }

      try {
        const resposta = await apiVerifyEmail(token);
        if (ativo) {
          showToast(resposta.mensagem, 'success');
          requireLogin();
        }
      } catch (error) {
        if (ativo) {
          setErro(criarErroUsuario(error));
        }
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    void verificar();

    return () => {
      ativo = false;
    };
  }, [requireLogin, showToast, token]);

  return (
    <AuthPageShell
      title="Verificar email"
      subtitle="Estamos validando seu link de confirmação"
      footer={
        <p className="text-sm text-app-muted">
          Não recebeu email?{' '}
          <Link
            href="/auth/resend-verification"
            className="text-app-secondary hover:text-app-secondary-hover font-semibold transition-colors"
          >
            Reenviar verificação
          </Link>
        </p>
      }
    >
      <div className="flex flex-col gap-3">
        {loading ? (
          <p className="text-sm text-app-muted">Validando token...</p>
        ) : null}

        {erro ? <ErrorAlert message={erro} /> : null}

        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center rounded bg-app-primary text-app-fg hover:bg-app-primary-hover px-4 py-2 text-sm font-medium transition-colors"
        >
          Ir para login
        </Link>
      </div>
    </AuthPageShell>
  );
}
