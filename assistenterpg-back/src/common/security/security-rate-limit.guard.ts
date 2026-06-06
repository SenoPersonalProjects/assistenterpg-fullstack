import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { SECURITY_RATE_LIMIT_POLICY_KEY } from './security-rate-limit.decorator';
import {
  SECURITY_RATE_LIMIT_POLICIES,
  type SecurityRateLimitDimension,
  type SecurityRateLimitPolicyName,
} from './security-rate-limit.policies';
import { SecurityRateLimitService } from './security-rate-limit.service';

type AuthenticatedRequest = Request & {
  user?: { id?: number };
};

@Injectable()
export class SecurityRateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimitService: SecurityRateLimitService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyName = this.reflector.getAllAndOverride<
      SecurityRateLimitPolicyName | undefined
    >(SECURITY_RATE_LIMIT_POLICY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!policyName) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const response = context.switchToHttp().getResponse<Response>();
    const policy = SECURITY_RATE_LIMIT_POLICIES[policyName];

    for (const dimensionPolicy of policy.dimensions) {
      const value = this.extractDimensionValue(
        request,
        dimensionPolicy.dimension,
      );
      if (!value) continue;

      const result = await this.rateLimitService.consumir({
        action: policy.action,
        dimension: dimensionPolicy.dimension,
        value,
        limit: dimensionPolicy.limit,
        windowMs: dimensionPolicy.windowMs,
      });

      if (!result.allowed) {
        response.setHeader('Retry-After', String(result.retryAfterSeconds));
        throw new HttpException(
          {
            code: 'AUTH_RATE_LIMIT_EXCEEDED',
            message: 'Muitas tentativas. Aguarde antes de tentar novamente.',
            retryAfterSeconds: result.retryAfterSeconds,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    return true;
  }

  private extractDimensionValue(
    request: AuthenticatedRequest,
    dimension: SecurityRateLimitDimension,
  ): string | null {
    if (dimension === 'ip') {
      return request.ip || request.socket?.remoteAddress || null;
    }
    if (dimension === 'usuario') {
      return typeof request.user?.id === 'number'
        ? String(request.user.id)
        : null;
    }

    const body = this.toRecord(request.body);
    if (dimension === 'token') {
      return this.normalizedString(body.token);
    }

    return (
      this.normalizedString(body.email ?? body.novoEmail)?.toLowerCase() ?? null
    );
  }

  private toRecord(value: unknown): Record<string, unknown> {
    return typeof value === 'object' && value !== null
      ? (value as Record<string, unknown>)
      : {};
  }

  private normalizedString(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }
}
