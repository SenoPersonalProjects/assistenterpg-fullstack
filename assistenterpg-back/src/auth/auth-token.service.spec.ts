import { TipoTokenAuth } from '@prisma/client';
import { AuthTokenInvalidoOuExpiradoException } from 'src/common/exceptions/auth.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthTokenService } from './auth-token.service';

type PrismaAuthTokenMock = {
  authToken: {
    findFirst: jest.Mock;
    updateMany: jest.Mock;
    create: jest.Mock;
  };
};

describe('AuthTokenService', () => {
  let service: AuthTokenService;
  let prisma: PrismaAuthTokenMock;

  beforeEach(() => {
    prisma = {
      authToken: {
        findFirst: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn(),
      },
    };

    service = new AuthTokenService(prisma as unknown as PrismaService);
  });

  it('rejeita token inexistente, expirado ou ja usado', async () => {
    prisma.authToken.findFirst.mockResolvedValueOnce(null);

    await expect(
      service.consumirToken('token', TipoTokenAuth.RECUPERACAO_SENHA),
    ).rejects.toBeInstanceOf(AuthTokenInvalidoOuExpiradoException);
  });

  it('rejeita reutilizacao concorrente de token', async () => {
    prisma.authToken.findFirst.mockResolvedValueOnce({
      id: 1,
      usuarioId: 10,
      expiraEm: new Date(Date.now() + 60_000),
    });
    prisma.authToken.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(
      service.consumirToken('token', TipoTokenAuth.RECUPERACAO_SENHA),
    ).rejects.toBeInstanceOf(AuthTokenInvalidoOuExpiradoException);
  });

  it('consome token valido apenas uma vez', async () => {
    prisma.authToken.findFirst.mockResolvedValueOnce({
      id: 1,
      usuarioId: 10,
      expiraEm: new Date(Date.now() + 60_000),
    });
    prisma.authToken.updateMany.mockResolvedValueOnce({ count: 1 });

    await expect(
      service.consumirToken('token', TipoTokenAuth.RECUPERACAO_SENHA),
    ).resolves.toEqual({
      id: 1,
      usuarioId: 10,
      expiraEm: expect.any(Date),
    });
  });
});
