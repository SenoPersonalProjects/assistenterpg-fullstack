// src/components/layout/LayoutWrapper.tsx

'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loading } from '@/components/ui/Loading';

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register'];

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading } = useAuth();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // ✅ Loading durante verificação de autenticação inicial
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <Loading />
      </div>
    );
  }

  // ✅ Middleware já cuida dos redirects, aqui só adiciona padding
  return <div className={!isPublicRoute ? 'pt-16' : ''}>{children}</div>;
}
