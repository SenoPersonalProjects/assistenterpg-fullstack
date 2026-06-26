import { ConfigService } from '@nestjs/config';
import { StatusContaUsuario } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SecurityCleanupService } from './security-cleanup.service';

describe('SecurityCleanupService', () => {
  it('remove artefatos expirados e retidos em uma unica transacao', async () => {
    const deleteMany = () =>
      jest.fn().mockReturnValue(Promise.resolve({ count: 1 }));
    const prisma = {
      registroPendenteUsuario: { deleteMany: deleteMany() },
      alteracaoEmailPendente: { deleteMany: deleteMany() },
      authToken: { deleteMany: deleteMany() },
      sessaoAutenticacao: { deleteMany: deleteMany() },
      limiteRequisicaoSeguranca: { deleteMany: deleteMany() },
      oAuthState: { deleteMany: deleteMany() },
      usuario: {
        findMany: jest.fn().mockResolvedValue([{ id: 42 }]),
        updateMany: jest.fn().mockReturnValue(Promise.resolve({ count: 1 })),
      },
      $transaction: jest.fn().mockResolvedValue([]),
    };
    const config = {
      get: jest.fn((key: string) =>
        key === 'AUTH_SECURITY_RETENTION_DAYS' ? '7' : undefined,
      ),
    };
    const service = new SecurityCleanupService(
      prisma as unknown as PrismaService,
      config as unknown as ConfigService,
    );

    await service.executar();

    expect(prisma.usuario.findMany).toHaveBeenCalledWith({
      where: {
        status: StatusContaUsuario.PENDENTE_EXCLUSAO,
        exclusaoAgendadaPara: { lte: expect.any(Date) },
      },
      select: { id: true },
    });
    expect(prisma.registroPendenteUsuario.deleteMany).toHaveBeenCalledWith({
      where: { expiraEm: { lte: expect.any(Date) } },
    });
    expect(prisma.authToken.deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { expiraEm: { lte: expect.any(Date) } },
          { usadoEm: { not: null, lte: expect.any(Date) } },
        ],
      },
    });
    expect(prisma.sessaoAutenticacao.deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { expiraEm: { lte: expect.any(Date) } },
          { revogadaEm: { not: null, lte: expect.any(Date) } },
        ],
      },
    });
    expect(prisma.limiteRequisicaoSeguranca.deleteMany).toHaveBeenCalledWith({
      where: { expiraEm: { lte: expect.any(Date) } },
    });
    expect(prisma.oAuthState.deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { expiraEm: { lte: expect.any(Date) } },
          { consumidoEm: { not: null, lte: expect.any(Date) } },
        ],
      },
    });
    expect(prisma.usuario.updateMany).toHaveBeenCalledWith({
      where: {
        id: 42,
        status: StatusContaUsuario.PENDENTE_EXCLUSAO,
        exclusaoAgendadaPara: { lte: expect.any(Date) },
      },
      data: expect.objectContaining({
        apelido: 'Conta excluida 42',
        email: 'excluido-42@anonimo.invalid',
        senhaHash: 'conta-excluida-42',
        emailVerificadoEm: null,
        status: StatusContaUsuario.EXCLUIDA,
        desativadoEm: null,
        exclusaoAgendadaPara: null,
        excluidoEm: expect.any(Date),
      }),
    });
    expect(prisma.$transaction).toHaveBeenCalledWith([
      expect.any(Promise),
      expect.any(Promise),
      expect.any(Promise),
      expect.any(Promise),
      expect.any(Promise),
      expect.any(Promise),
      expect.any(Promise),
    ]);
  });
});
