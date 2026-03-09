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

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <Loading />
      </div>
    );
  }

  return <div className="pt-16">{children}</div>;
}
