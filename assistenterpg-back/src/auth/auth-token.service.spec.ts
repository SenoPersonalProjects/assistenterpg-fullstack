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
  $transaction: jest.Mock;
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
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    service = new AuthTokenService(prisma as unknown as PrismaService);
  });

  it('persiste apenas o hash do token gerado', async () => {
    prisma.authToken.create.mockResolvedValue({ id: 1 });

    const resultado = await service.gerarToken(
      10,
      TipoTokenAuth.RECUPERACAO_SENHA,
      30,
    );

    const data = prisma.authToken.create.mock.calls[0][0].data;
    expect(resultado.token).toHaveLength(64);
    expect(data.tokenHash).toHaveLength(64);
    expect(data.tokenHash).not.toBe(resultado.token);
    expect(data).not.toHaveProperty('token');
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

  it('consome token valido uma unica vez dentro de transacao', async () => {
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
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.authToken.updateMany).toHaveBeenCalledWith({
      where: { id: 1, usadoEm: null },
      data: { usadoEm: expect.any(Date) },
    });
  });

  it('invalida tokens irmaos ainda ativos', async () => {
    prisma.authToken.updateMany.mockResolvedValue({ count: 2 });

    await service.invalidarTokensAtivos(10, TipoTokenAuth.VERIFICACAO_EMAIL);

    expect(prisma.authToken.updateMany).toHaveBeenCalledWith({
      where: {
        usuarioId: 10,
        tipo: TipoTokenAuth.VERIFICACAO_EMAIL,
        usadoEm: null,
      },
      data: { usadoEm: expect.any(Date) },
    });
  });
});
