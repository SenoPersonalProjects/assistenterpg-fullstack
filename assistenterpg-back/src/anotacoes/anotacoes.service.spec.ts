import { AnotacoesService } from './anotacoes.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AnotacaoSemPermissaoException } from 'src/common/exceptions/anotacao.exception';

type PrismaMock = {
  anotacao: {
    count: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  $transaction: jest.Mock;
};

describe('AnotacoesService', () => {
  let prisma: PrismaMock;
  let service: AnotacoesService;

  beforeEach(() => {
    prisma = {
      anotacao: {
        count: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    service = new AnotacoesService(prisma as unknown as PrismaService);
  });

  it('lista apenas anotacoes do usuario autenticado', async () => {
    prisma.anotacao.count.mockResolvedValue(0);
    prisma.anotacao.findMany.mockResolvedValue([]);
    prisma.$transaction.mockResolvedValue([0, []]);

    await service.listar(7, {});

    expect(prisma.anotacao.count).toHaveBeenCalledWith({
      where: {
        usuarioId: 7,
        campanhaId: undefined,
        sessaoId: undefined,
      },
    });
    expect(prisma.anotacao.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          usuarioId: 7,
          campanhaId: undefined,
          sessaoId: undefined,
        },
      }),
    );
  });

  it('bloqueia edicao de anotacao de outro usuario', async () => {
    prisma.anotacao.findUnique.mockResolvedValue({
      id: 12,
      usuarioId: 99,
      campanhaId: null,
      sessaoId: null,
    });

    await expect(
      service.atualizar(12, 7, { titulo: 'Novo titulo' }),
    ).rejects.toBeInstanceOf(AnotacaoSemPermissaoException);

    expect(prisma.anotacao.update).not.toHaveBeenCalled();
  });

  it('bloqueia remocao de anotacao de outro usuario', async () => {
    prisma.anotacao.findUnique.mockResolvedValue({
      id: 12,
      usuarioId: 99,
    });

    await expect(service.remover(12, 7)).rejects.toBeInstanceOf(
      AnotacaoSemPermissaoException,
    );

    expect(prisma.anotacao.delete).not.toHaveBeenCalled();
  });
});
