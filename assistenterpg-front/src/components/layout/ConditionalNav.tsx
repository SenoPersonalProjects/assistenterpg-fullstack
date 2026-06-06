// components/layout/ConditionalNav.tsx

'use client';

import { usePathname } from 'next/navigation';
import { NavigationBar } from './NavigationBar';
import { isPublicAuthPagePath } from '@/lib/auth/routes';

export function ConditionalNav() {
  const pathname = usePathname();
  
  // ✅ Esconder nav na landing page e nas páginas de auth
  const isPublicPage = isPublicAuthPagePath(pathname);

  if (isPublicPage) return null;

  return <NavigationBar />;
}
