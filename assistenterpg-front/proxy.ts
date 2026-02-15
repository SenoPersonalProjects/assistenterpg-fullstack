// proxy.ts (NA RAIZ DO PROJETO)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOKEN_KEY = 'assistenterpg_token';
const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register'];

// ✅ MUDANÇA: função agora se chama "proxy" (não "middleware")
export function proxy(request: NextRequest) {
  const token = request.cookies.get(TOKEN_KEY)?.value;
  const pathname = request.nextUrl.pathname;

  // ✅ PROTEÇÃO 1: Usuário logado tentando acessar landing page → redirecionar para home
  if (token && pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // ✅ PROTEÇÃO 2: Usuário logado tentando acessar páginas de auth → redirecionar para home
  if (token && (pathname === '/auth/login' || pathname === '/auth/register')) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // ✅ PROTEÇÃO 3: Usuário NÃO logado tentando acessar rota privada → redirecionar para login
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // ✅ Permitir acesso
  return NextResponse.next();
}

// ✅ Configurar rotas onde o proxy deve rodar
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
