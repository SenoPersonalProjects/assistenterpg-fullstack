import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SecurityRateLimitGuard } from './security-rate-limit.guard';
import { SecurityRateLimitService } from './security-rate-limit.service';

describe('SecurityRateLimitGuard', () => {
  let reflector: { getAllAndOverride: jest.Mock };
  let rateLimitService: { consumir: jest.Mock };
  let guard: SecurityRateLimitGuard;
  let request: Record<string, unknown>;
  let response: { setHeader: jest.Mock };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    };
    rateLimitService = {
      consumir: jest
        .fn()
        .mockResolvedValue({ allowed: true, retryAfterSeconds: 0 }),
    };
    request = {
      ip: '203.0.113.10',
      body: {},
      socket: {},
    };
    response = {
      setHeader: jest.fn(),
    };
    guard = new SecurityRateLimitGuard(
      reflector as unknown as Reflector,
      rateLimitService as unknown as SecurityRateLimitService,
    );
  });

  function criarContexto() {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ExecutionContext;
  }

  it('consome dimensoes de IP e email normalizado da politica', async () => {
    reflector.getAllAndOverride.mockReturnValue('login');
    request.body = { email: ' Usuario@Example.COM ' };

    await expect(guard.canActivate(criarContexto())).resolves.toBe(true);

    expect(rateLimitService.consumir).toHaveBeenNthCalledWith(1, {
      action: 'login',
      dimension: 'ip',
      value: '203.0.113.10',
      limit: 60,
      windowMs: 15 * 60_000,
    });
    expect(rateLimitService.consumir).toHaveBeenNthCalledWith(2, {
      action: 'login',
      dimension: 'email',
      value: 'usuario@example.com',
      limit: 5,
      windowMs: 15 * 60_000,
    });
  });

  it('consome usuario autenticado como dimensao de acao sensivel', async () => {
    reflector.getAllAndOverride.mockReturnValue('deleteAccount');
    request.user = { id: 42 };

    await expect(guard.canActivate(criarContexto())).resolves.toBe(true);

    expect(rateLimitService.consumir).toHaveBeenNthCalledWith(2, {
      action: 'delete-account',
      dimension: 'usuario',
      value: '42',
      limit: 5,
      windowMs: 15 * 60_000,
    });
  });

  it('retorna 429 com Retry-After ao bloquear qualquer dimensao', async () => {
    reflector.getAllAndOverride.mockReturnValue('resetPassword');
    request.body = { token: 'token-reset' };
    rateLimitService.consumir
      .mockResolvedValueOnce({ allowed: true, retryAfterSeconds: 0 })
      .mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 37 });

    let exception: HttpException | undefined;
    try {
      await guard.canActivate(criarContexto());
    } catch (error) {
      exception = error as HttpException;
    }

    expect(exception).toBeInstanceOf(HttpException);
    expect(exception?.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect(exception?.getResponse()).toEqual({
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Muitas tentativas. Aguarde antes de tentar novamente.',
      retryAfterSeconds: 37,
    });
    expect(response.setHeader).toHaveBeenCalledWith('Retry-After', '37');
  });
});
