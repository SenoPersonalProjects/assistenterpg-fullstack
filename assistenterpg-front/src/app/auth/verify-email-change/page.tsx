'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { apiVerifyEmailChange } from '@/lib/api';
import { criarErroLocalUsuario, criarErroUsuario } from '@/lib/api/error-handler';
import type { UserErrorState } from '@/lib/types';

export default function VerifyEmailChangePage() {
  const searchParams = useSearchParams();
  const { requireLogin } = useAuth();
  const { showToast } = useToast();
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<UserErrorState | null>(null);

  useEffect(() => {
    let active = true;

    async function verifyEmailChange() {
      if (!token) {
        if (active) {
          setError(criarErroLocalUsuario('Token de alteração de email ausente.'));
          setLoading(false);
        }
        return;
      }

      try {
        const response = await apiVerifyEmailChange(token);
        if (!active) return;
        showToast(response.mensagem, 'success');
        requireLogin();
      } catch (requestError) {
        if (active) {
          setError(criarErroUsuario(requestError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void verifyEmailChange();
    return () => {
      active = false;
    };
  }, [requireLogin, showToast, token]);

  return (
    <AuthPageShell
      title="Confirmar novo email"
      subtitle="Estamos validando o novo endereço da sua conta"
      footer={
        <Link
          href="/auth/login"
          className="text-sm font-semibold text-app-secondary hover:text-app-secondary-hover"
        >
          Ir para o login
        </Link>
      }
    >
      <div className="flex flex-col gap-3">
        {loading ? (
          <p className="text-sm text-app-muted">Validando token...</p>
        ) : null}
        {error ? <ErrorAlert message={error} /> : null}
      </div>
    </AuthPageShell>
  );
}
