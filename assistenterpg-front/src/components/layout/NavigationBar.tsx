// components/layout/NavigationBar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { UserMenu } from './UserMenu';
import { useAuth } from '@/context/AuthContext';

type NavItem = {
  href: string;
  label: string;
  icon: any;
};

const navItems: NavItem[] = [
  { href: '/home', label: 'Início', icon: 'home' },
  { href: '/campanhas', label: 'Campanhas', icon: 'campaign' },
  { href: '/personagens-base', label: 'Personagens', icon: 'characters' },
  { href: '/homebrews', label: 'Homebrews', icon: 'sparkles' },
  { href: '/suplementos', label: 'Suplementos', icon: 'book' },
  { href: '/compendio', label: 'Compêndio', icon: 'rules' },
  // ✅ FUTURO: { href: '/marketplace', label: 'Marketplace', icon: 'store' },
];

export function NavigationBar() {
  const pathname = usePathname();
  const { usuario } = useAuth();
  
  const isAdmin = usuario?.role === 'ADMIN';

  const isActive = (href: string) => {
    if (href === '/home') return pathname === '/home';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={`
        sticky top-0 z-50 bg-app-surface border-b shadow-sm
        ${isAdmin ? 'border-2 border-red-500/50' : 'border-app-border'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link href="/home" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <span className="text-white font-bold text-xl">JK</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-app-fg">Assistente RPG</span>
              <span className="block text-xs text-app-muted">Jujutsu Kaisen</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  transition-colors
                  ${
                    isActive(item.href)
                      ? 'bg-app-primary/10 text-app-primary'
                      : 'text-app-muted hover:text-app-fg hover:bg-app-bg'
                  }
                `}
              >
                <Icon name={item.icon} className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side: Settings + User Menu (SEM NOTIFICAÇÕES) */}
          <div className="flex items-center gap-3">
            <Link href="/configuracoes">
              <button
                className={`
                  p-2 rounded-lg transition-colors
                  ${
                    pathname === '/configuracoes'
                      ? 'bg-app-primary/10 text-app-primary'
                      : 'text-app-muted hover:text-app-fg hover:bg-app-bg'
                  }
                `}
                title="Configurações"
              >
                <Icon name="settings" className="w-6 h-6" />
              </button>
            </Link>

            <UserMenu />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
                whitespace-nowrap transition-colors
                ${
                  isActive(item.href)
                    ? 'bg-app-primary/10 text-app-primary'
                    : 'text-app-muted hover:text-app-fg hover:bg-app-bg'
                }
              `}
            >
              <Icon name={item.icon} className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
