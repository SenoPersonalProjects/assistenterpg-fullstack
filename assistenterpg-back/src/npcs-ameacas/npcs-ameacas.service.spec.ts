import { Test, TestingModule } from '@nestjs/testing';
import { NpcsAmeacasService } from './npcs-ameacas.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NpcAmeacaNaoEncontradaException } from 'src/common/exceptions/npc-ameaca.exception';

describe('NpcsAmeacasService', () => {
  let service: NpcsAmeacasService;
  let prisma: {
    npcAmeaca: {
      count: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      npcAmeaca: {
        count: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NpcsAmeacasService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<NpcsAmeacasService>(NpcsAmeacasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('busca NPC/ameaca sempre escopado pelo dono autenticado', async () => {
    prisma.npcAmeaca.findFirst.mockResolvedValue(null);

    await expect(service.buscarPorId(7, 42)).rejects.toBeInstanceOf(
      NpcAmeacaNaoEncontradaException,
    );

    expect(prisma.npcAmeaca.findFirst).toHaveBeenCalledWith({
      where: {
        id: 42,
        donoId: 7,
      },
    });
  });

  it('nao atualiza NPC/ameaca de outro usuario', async () => {
    prisma.npcAmeaca.findFirst.mockResolvedValue(null);

    await expect(
      service.atualizar(7, 42, { nome: 'Novo nome' }),
    ).rejects.toBeInstanceOf(NpcAmeacaNaoEncontradaException);

    expect(prisma.npcAmeaca.update).not.toHaveBeenCalled();
  });

  it('nao remove NPC/ameaca de outro usuario', async () => {
    prisma.npcAmeaca.findFirst.mockResolvedValue(null);

    await expect(service.remover(7, 42)).rejects.toBeInstanceOf(
      NpcAmeacaNaoEncontradaException,
    );

    expect(prisma.npcAmeaca.delete).not.toHaveBeenCalled();
  });
});
