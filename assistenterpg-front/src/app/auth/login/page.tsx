'use client';

import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthPageShell } from '@/components/auth/AuthPageShell';

export default function LoginPage() {
  return (
    <AuthPageShell
      title="Bem-vindo de volta"
      subtitle="Entre para continuar sua jornada"
      footer={
        <p className="text-sm text-app-muted">
          Nao tem conta?{' '}
          <Link
            href="/auth/register"
            className="text-app-secondary hover:text-app-secondary-hover font-semibold transition-colors"
          >
            Criar conta gratis
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthPageShell>
  );
}
