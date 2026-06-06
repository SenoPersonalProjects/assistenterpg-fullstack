import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  isPublicAuthPagePath,
  isVisitorOnlyPagePath,
} from './src/lib/auth/routes';

const AUTH_HINT_COOKIE = 'assistenterpg_auth_hint';

export function proxy(request: NextRequest) {
  const authHint = request.cookies.get(AUTH_HINT_COOKIE)?.value === '1';
  const pathname = request.nextUrl.pathname;

  if (authHint && isVisitorOnlyPagePath(pathname)) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  const isPublicRoute = isPublicAuthPagePath(pathname);
  if (!authHint && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
