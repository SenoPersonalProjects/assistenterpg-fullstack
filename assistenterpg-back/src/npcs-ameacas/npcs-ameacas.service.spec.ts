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
    npcAmeacaGrupo: {
      create: jest.Mock;
    };
    pericia: {
      findMany: jest.Mock;
    };
    executarTransacao: jest.Mock;
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
      npcAmeacaGrupo: {
        create: jest.fn(),
      },
      pericia: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      executarTransacao: jest.fn(),
    };
    prisma.executarTransacao.mockImplementation(
      (
        _contexto: string,
        callback: (tx: {
          npcAmeacaGrupo: typeof prisma.npcAmeacaGrupo;
        }) => Promise<unknown>,
      ) => callback({ npcAmeacaGrupo: prisma.npcAmeacaGrupo }),
    );

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

  it('busca NPC/ameaça sempre escopado pelo dono autenticado', async () => {
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

  it('não atualiza NPC/ameaça de outro usuário', async () => {
    prisma.npcAmeaca.findFirst.mockResolvedValue(null);

    await expect(
      service.atualizar(7, 42, { nome: 'Novo nome' }),
    ).rejects.toBeInstanceOf(NpcAmeacaNaoEncontradaException);

    expect(prisma.npcAmeaca.update).not.toHaveBeenCalled();
  });

  it('não remove NPC/ameaça de outro usuário', async () => {
    prisma.npcAmeaca.findFirst.mockResolvedValue(null);

    await expect(service.remover(7, 42)).rejects.toBeInstanceOf(
      NpcAmeacaNaoEncontradaException,
    );

    expect(prisma.npcAmeaca.delete).not.toHaveBeenCalled();
  });

  it('importa 100 NPCs com catalogo e escrita em lote constantes', async () => {
    const itens = Array.from({ length: 100 }, (_, indice) => ({
      nome: `NPC ${indice}`,
    }));
    jest
      .spyOn(service as never, 'normalizarNpcImportado')
      .mockImplementation((item) => item);
    jest
      .spyOn(service as never, 'prepararDadosNpcAmeaca')
      .mockImplementation((_usuarioId, item) => Promise.resolve(item));
    jest
      .spyOn(service as never, 'mapearDetalhe')
      .mockImplementation((item) => item);
    prisma.npcAmeacaGrupo.create.mockResolvedValue({
      id: 88,
      nome: 'Grupo volume',
      itens: itens.map((item, indice) => ({
        npcAmeaca: { id: indice + 1, ...item },
      })),
    });

    const resultado = await service.importarNpcAmeacaJson(7, {
      schemaVersion: 1,
      exportType: 'npc-ameaca-group',
      group: { nome: 'Grupo volume' },
      items: itens,
    } as never);

    expect(prisma.pericia.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.executarTransacao).toHaveBeenCalledWith(
      'npcAmeaca.importarGrupo',
      expect.any(Function),
    );
    expect(prisma.npcAmeacaGrupo.create).toHaveBeenCalledTimes(1);
    expect(
      prisma.npcAmeacaGrupo.create.mock.calls[0][0].data.itens.create,
    ).toHaveLength(100);
    expect(resultado.importedCount).toBe(100);
  });

  it('propaga falha da arvore do grupo de NPCs para rollback atomico', async () => {
    const item = { nome: 'NPC atomico' };
    jest
      .spyOn(service as never, 'normalizarNpcImportado')
      .mockReturnValue(item);
    jest
      .spyOn(service as never, 'prepararDadosNpcAmeaca')
      .mockResolvedValue(item);
    const falha = new Error('falha intermediaria');
    prisma.npcAmeacaGrupo.create.mockRejectedValue(falha);

    await expect(
      service.importarNpcAmeacaJson(7, {
        schemaVersion: 1,
        exportType: 'npc-ameaca-group',
        group: { nome: 'Grupo atomico' },
        items: [{}],
      } as never),
    ).rejects.toBe(falha);
    expect(prisma.npcAmeacaGrupo.create).toHaveBeenCalledTimes(1);
  });
});
