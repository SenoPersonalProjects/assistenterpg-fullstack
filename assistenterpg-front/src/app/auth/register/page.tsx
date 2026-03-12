'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AuthPageShell } from '@/components/auth/AuthPageShell';

export default function RegisterPage() {
  return (
    <AuthPageShell
      title="Criar conta"
      subtitle="Comece sua jornada gratuitamente"
      footer={
        <p className="text-sm text-app-muted">
          Ja tem conta?{' '}
          <Link
            href="/auth/login"
            className="text-app-secondary hover:text-app-secondary-hover font-semibold transition-colors"
          >
            Entrar
          </Link>
        </p>
      }
      afterContent={
        <>
          <p className="text-xs text-app-muted mb-3">Ao criar conta, voce ganha:</p>
          <div className="space-y-2">
            {[
              'Criacao ilimitada de personagens',
              'Inventario completo',
              'Suporte a campanhas',
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-xs text-app-muted">
                <Icon name="success" className="w-4 h-4 text-app-success" />
                {benefit}
              </div>
            ))}
          </div>
        </>
      }
    >
      <RegisterForm />
    </AuthPageShell>
  );
}
