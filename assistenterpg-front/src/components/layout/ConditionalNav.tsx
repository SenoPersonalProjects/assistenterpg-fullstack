// components/layout/ConditionalNav.tsx

'use client';

import { usePathname } from 'next/navigation';
import { NavigationBar } from './NavigationBar';

export function ConditionalNav() {
  const pathname = usePathname();
  
  // ✅ Esconder nav na landing page e nas páginas de auth
  const isPublicPage = pathname === '/' || pathname.startsWith('/auth');

  if (isPublicPage) return null;

  return <NavigationBar />;
}
