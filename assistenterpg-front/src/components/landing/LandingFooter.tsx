// components/landing/LandingFooter.tsx - CORRIGIDO

import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

export function LandingFooter() {
  return (
    <footer className="py-12 px-4 border-t border-app-border bg-app-surface">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-cta flex items-center justify-center">
              <Icon name="sparkles" className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-app-fg">Assistente RPG</div>
              <div className="text-xs text-app-muted">Jujutsu Kaisen System</div>
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-8 text-sm text-app-muted">
            <Link href="/auth/login" className="hover:text-app-fg transition-colors">
              Login
            </Link>
            <Link href="/auth/register" className="hover:text-app-fg transition-colors">
              Registrar
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-sm text-app-muted">© 2026 Assistente RPG. Todos os direitos reservados.</div>
        </div>
      </div>
    </footer>
  );
}
