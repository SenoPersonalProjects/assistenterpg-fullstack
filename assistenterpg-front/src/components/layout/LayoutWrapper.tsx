// src/components/layout/LayoutWrapper.tsx

'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loading } from '@/components/ui/Loading';
import { isPublicAuthPagePath } from '@/lib/auth/routes';
import { AppShell } from './AppShell';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading } = useAuth();

  const isPublicRoute = isPublicAuthPagePath(pathname);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg p-8">
        <Loading variant="dice" size="lg" message="Entoando encantamentos..." />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
