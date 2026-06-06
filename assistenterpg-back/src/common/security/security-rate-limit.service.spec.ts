import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SecurityRateLimitService } from './security-rate-limit.service';

describe('SecurityRateLimitService', () => {
  let prisma: {
    $executeRaw: jest.Mock;
    limiteRequisicaoSeguranca: { findUnique: jest.Mock };
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-05T12:00:00.000Z'));
    prisma = {
      $executeRaw: jest.fn().mockResolvedValue(1),
      limiteRequisicaoSeguranca: {
        findUnique: jest.fn(),
      },
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function criarService(values: Record<string, string | undefined>) {
    const config = {
      get: jest.fn((key: string) => values[key]),
    };
    return new SecurityRateLimitService(
      prisma as unknown as PrismaService,
      config as unknown as ConfigService,
    );
  }

  it('exige segredo HMAC forte em producao', () => {
    expect(() =>
      criarService({ NODE_ENV: 'production', AUTH_RATE_LIMIT_HASH_SECRET: '' }),
    ).toThrow('AUTH_RATE_LIMIT_HASH_SECRET');
    expect(() =>
      criarService({
        NODE_ENV: 'production',
        AUTH_RATE_LIMIT_HASH_SECRET: 'curto',
      }),
    ).toThrow('32 caracteres');
  });

  it('persiste e consulta somente chave HMAC, nunca identificador cru', async () => {
    const secret = 's'.repeat(32);
    const service = criarService({
      NODE_ENV: 'test',
      AUTH_RATE_LIMIT_HASH_SECRET: secret,
    });
    const expectedHash = createHmac('sha256', secret)
      .update('login:email:usuario@example.com')
      .digest('hex');
    prisma.limiteRequisicaoSeguranca.findUnique.mockResolvedValue({
      contador: 1,
      janelaIniciaEm: new Date(),
      bloqueadoAte: null,
    });

    await service.consumir({
      action: 'login',
      dimension: 'email',
      value: 'usuario@example.com',
      limit: 5,
      windowMs: 15 * 60_000,
    });

    expect(prisma.limiteRequisicaoSeguranca.findUnique).toHaveBeenCalledWith({
      where: { chaveHash: expectedHash },
      select: {
        contador: true,
        janelaIniciaEm: true,
        bloqueadoAte: true,
      },
    });
    expect(expectedHash).not.toContain('usuario@example.com');
  });

  it('calcula Retry-After do bucket bloqueado', async () => {
    const service = criarService({ NODE_ENV: 'test' });
    prisma.limiteRequisicaoSeguranca.findUnique.mockResolvedValue({
      contador: 6,
      janelaIniciaEm: new Date('2026-06-05T12:00:00.000Z'),
      bloqueadoAte: new Date('2026-06-05T12:15:00.000Z'),
    });

    await expect(
      service.consumir({
        action: 'login',
        dimension: 'email',
        value: 'usuario@example.com',
        limit: 5,
        windowMs: 15 * 60_000,
      }),
    ).resolves.toEqual({
      allowed: false,
      retryAfterSeconds: 15 * 60,
    });
  });
});
