// app/auth/register/page.tsx - CORRIGIDO

'use client';

import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Icon } from '@/components/ui/Icon';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-hero relative overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-overlay-subtle" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-cta flex items-center justify-center">
            <Icon name="sparkles" className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-app-fg">Assistente RPG</span>
        </Link>

        {/* Card */}
        <div className="bg-app-card border border-app-border rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-app-fg mb-2">Criar conta</h1>
          <p className="text-app-muted mb-8">Comece sua jornada gratuitamente</p>

          <RegisterForm />

          <div className="mt-6 text-center">
            <p className="text-sm text-app-muted">
              Já tem conta?{' '}
              <Link
                href="/auth/login"
                className="text-app-secondary hover:text-app-secondary-hover font-semibold transition-colors"
              >
                Entrar
              </Link>
            </p>
          </div>

          {/* Benefits */}
          <div className="mt-8 pt-6 border-t border-app-border">
            <p className="text-xs text-app-muted mb-3">Ao criar conta, você ganha:</p>
            <div className="space-y-2">
              {['Criação ilimitada de personagens', 'Inventário completo', 'Suporte a campanhas'].map(
                (benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-app-muted">
                    <Icon name="success" className="w-4 h-4 text-app-success" />
                    {benefit}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Back to home */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 mt-6 text-sm text-app-muted hover:text-app-fg transition-colors"
        >
          <Icon name="back" className="w-4 h-4" />
          Voltar para o início
        </Link>
      </div>
    </div>
  );
}
