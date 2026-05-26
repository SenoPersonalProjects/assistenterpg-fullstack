import { InventarioService } from './inventario.service';
import { PrismaService } from '../prisma/prisma.service';
import { InventarioEngine } from './engine/inventario.engine';
import { InventarioMapper } from './inventario.mapper';
import { InventarioSemPermissaoException } from 'src/common/exceptions/inventario.exception';

type PrismaMock = {
  inventarioItemBase: {
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  inventarioItemBaseModificacao: {
    create: jest.Mock;
    deleteMany: jest.Mock;
  };
  personagemBase: {
    findFirst: jest.Mock;
  };
};

describe('InventarioService', () => {
  let service: InventarioService;
  let prisma: PrismaMock;

  beforeEach(() => {
    prisma = {
      inventarioItemBase: {
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      inventarioItemBaseModificacao: {
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
      personagemBase: {
        findFirst: jest.fn(),
      },
    };

    service = new InventarioService(
      prisma as unknown as PrismaService,
      {} as InventarioEngine,
      {} as InventarioMapper,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('bloqueia atualizacao de item de personagem de outro usuário', async () => {
    prisma.inventarioItemBase.findUnique.mockResolvedValue({
      id: 5,
      personagemBaseId: 77,
      quantidade: 1,
      equipamento: {},
      modificacoes: [],
    });
    prisma.personagemBase.findFirst.mockResolvedValue(null);

    await expect(
      service.atualizarItem(12, 5, { quantidade: 2 }),
    ).rejects.toBeInstanceOf(InventarioSemPermissaoException);

    expect(prisma.personagemBase.findFirst).toHaveBeenCalledWith({
      where: { id: 77, donoId: 12 },
    });
    expect(prisma.inventarioItemBase.update).not.toHaveBeenCalled();
  });

  it('bloqueia remocao de item de personagem de outro usuário', async () => {
    prisma.inventarioItemBase.findUnique.mockResolvedValue({
      id: 5,
      personagemBaseId: 77,
      personagemBase: { id: 77 },
    });
    prisma.personagemBase.findFirst.mockResolvedValue(null);

    await expect(service.removerItem(12, 5)).rejects.toBeInstanceOf(
      InventarioSemPermissaoException,
    );

    expect(
      prisma.inventarioItemBaseModificacao.deleteMany,
    ).not.toHaveBeenCalled();
    expect(prisma.inventarioItemBase.delete).not.toHaveBeenCalled();
  });

  it('bloqueia aplicar modificação em item de personagem de outro usuário', async () => {
    prisma.inventarioItemBase.findUnique.mockResolvedValue({
      id: 5,
      personagemBaseId: 77,
      equipamento: {},
      modificacoes: [],
    });
    prisma.personagemBase.findFirst.mockResolvedValue(null);

    await expect(
      service.aplicarModificacao(12, 5, { modificacaoId: 9 }),
    ).rejects.toBeInstanceOf(InventarioSemPermissaoException);

    expect(prisma.inventarioItemBaseModificacao.create).not.toHaveBeenCalled();
  });
});
