import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthSessionService } from '../auth-session.service';
import {
  AUTH_ACCESS_COOKIE,
  AUTH_CSRF_HEADER,
  AUTH_REFRESH_COOKIE,
  getCookieValue,
} from '../auth-security.config';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const PUBLIC_AUTH_PATHS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/verify-email-change',
  '/auth/reactivate-account',
  '/auth/resend-verification-email',
]);
const COOKIE_SESSION_AUTH_PATHS = new Set(['/auth/refresh', '/auth/logout']);

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly authSessionService: AuthSessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method.toUpperCase();
    const path = this.normalizarPath(request);

    if (SAFE_METHODS.has(method) || PUBLIC_AUTH_PATHS.has(path)) {
      return true;
    }

    const hasCookieSession =
      Boolean(getCookieValue(request, AUTH_ACCESS_COOKIE)) ||
      Boolean(getCookieValue(request, AUTH_REFRESH_COOKIE));

    if (!hasCookieSession && !COOKIE_SESSION_AUTH_PATHS.has(path)) {
      return true;
    }

    const csrfHeader = request.get(AUTH_CSRF_HEADER);
    if (!csrfHeader) {
      throw new ForbiddenException('CSRF token ausente');
    }

    const valido = await this.authSessionService.validarCsrf(
      request,
      csrfHeader,
    );
    if (!valido) {
      throw new ForbiddenException('CSRF token inválido');
    }

    return true;
  }

  private normalizarPath(request: Request): string {
    const baseUrl = request.baseUrl ?? '';
    const path = request.path ?? request.url.split('?')[0] ?? '';
    return `${baseUrl}${path}`.replace(/\/+$/, '') || '/';
  }
}
