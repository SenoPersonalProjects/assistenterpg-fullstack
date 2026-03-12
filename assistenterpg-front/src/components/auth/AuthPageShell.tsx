'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

type AuthPageShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  afterContent?: React.ReactNode;
};

export function AuthPageShell({
  title,
  subtitle,
  children,
  footer,
  afterContent,
}: AuthPageShellProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-overlay-subtle" />

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <Link href="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-cta flex items-center justify-center">
            <Icon name="sparkles" className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-app-fg">Assistente RPG</span>
        </Link>

        <div className="bg-app-card border border-app-border rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-app-fg mb-2">{title}</h1>
          <p className="text-app-muted mb-8">{subtitle}</p>

          {children}

          {footer ? <div className="mt-6 text-center">{footer}</div> : null}
          {afterContent ? (
            <div className="mt-8 pt-6 border-t border-app-border">{afterContent}</div>
          ) : null}
        </div>

        <Link
          href="/"
          className="flex items-center justify-center gap-2 mt-6 text-sm text-app-muted hover:text-app-fg transition-colors"
        >
          <Icon name="back" className="w-4 h-4" />
          Voltar para o inicio
        </Link>
      </div>
    </div>
  );
}
