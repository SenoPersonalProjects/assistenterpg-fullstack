import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';

import { PersonagemBaseService } from './personagem-base.service';
import { PrismaService } from '../prisma/prisma.service';
import { PersonagemBaseMapper } from './personagem-base.mapper';
import { PersonagemBasePersistence } from './personagem-base.persistence';
import { InventarioService } from '../inventario/inventario.service';

describe('PersonagemBaseService', () => {
  let service: PersonagemBaseService;

  const adicionarItemMock = jest.fn();
  const deleteModsMock = jest.fn();
  const deleteItensMock = jest.fn();
  const updatePersonagemMock = jest.fn();

  const inventarioServiceMock = {
    adicionarItem: adicionarItemMock,
  };

  const txMock = {
    inventarioItemBaseModificacao: {
      deleteMany: deleteModsMock,
    },
    inventarioItemBase: {
      deleteMany: deleteItensMock,
    },
    personagemBase: {
      update: updatePersonagemMock,
    },
  } as unknown as Prisma.TransactionClient;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonagemBaseService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: PersonagemBaseMapper,
          useValue: {},
        },
        {
          provide: PersonagemBasePersistence,
          useValue: {},
        },
        {
          provide: InventarioService,
          useValue: inventarioServiceMock,
        },
      ],
    }).compile();

    service = module.get<PersonagemBaseService>(PersonagemBaseService);
  });

  it('nao deve sincronizar inventario quando itensInventario nao for enviado', async () => {
    await (
      service as unknown as {
        sincronizarItensInventarioNoUpdate: (
          donoId: number,
          personagemBaseId: number,
          itensInventario: unknown,
          tx: Prisma.TransactionClient,
        ) => Promise<void>;
      }
    ).sincronizarItensInventarioNoUpdate(1, 10, undefined, txMock);

    expect(deleteModsMock).not.toHaveBeenCalled();
    expect(deleteItensMock).not.toHaveBeenCalled();
    expect(updatePersonagemMock).not.toHaveBeenCalled();
    expect(adicionarItemMock).not.toHaveBeenCalled();
  });

  it('deve limpar inventario e zerar ocupacao quando receber lista vazia', async () => {
    await (
      service as unknown as {
        sincronizarItensInventarioNoUpdate: (
          donoId: number,
          personagemBaseId: number,
          itensInventario: unknown[],
          tx: Prisma.TransactionClient,
        ) => Promise<void>;
      }
    ).sincronizarItensInventarioNoUpdate(5, 42, [], txMock);

    expect(deleteModsMock).toHaveBeenCalledWith({
      where: {
        item: {
          personagemBaseId: 42,
        },
      },
    });
    expect(deleteItensMock).toHaveBeenCalledWith({
      where: {
        personagemBaseId: 42,
      },
    });
    expect(updatePersonagemMock).toHaveBeenCalledWith({
      where: { id: 42 },
      data: {
        espacosOcupados: 0,
        sobrecarregado: false,
      },
    });
    expect(adicionarItemMock).not.toHaveBeenCalled();
  });

  it('deve reconstruir graus livres removendo bonus fixo de habilidades no update parcial', async () => {
    const prismaMock = {
      habilidadePersonagemBase: {
        findMany: jest.fn().mockResolvedValue([
          {
            habilidadeId: 10,
            habilidade: {
              nome: 'Escolha do Mestre de Barreiras',
              efeitosGrau: [
                {
                  tipoGrauCodigo: 'TECNICA_BARREIRA',
                  valor: 1,
                  escalonamentoPorNivel: null,
                },
              ],
              mecanicasEspeciais: null,
            },
          },
        ]),
      },
      poderGenericoPersonagemBase: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    } as unknown as PrismaService;

    const existe = {
      id: 1,
      grausAprimoramento: [
        {
          valor: 3,
          tipoGrau: { codigo: 'TECNICA_AMALDICOADA' },
        },
        {
          valor: 1,
          tipoGrau: { codigo: 'TECNICA_BARREIRA' },
        },
      ],
    };

    const grausLivres = await (
      service as unknown as {
        montarGrausAprimoramentoLivresExistentes: (
          existe: unknown,
          nivel: number,
          prisma: PrismaService,
        ) => Promise<unknown>;
      }
    ).montarGrausAprimoramentoLivresExistentes(existe, 16, prismaMock);

    expect(grausLivres).toEqual([
      {
        tipoGrauCodigo: 'TECNICA_AMALDICOADA',
        valor: 3,
      },
    ]);
  });

  it('deve recriar itens do inventario via InventarioService quando receber lista no update', async () => {
    const itens = [
      {
        equipamentoId: 100,
        quantidade: 2,
        equipado: true,
        modificacoesIds: [7, 8],
        nomeCustomizado: 'Arma principal',
        notas: 'Com mira',
      },
      {
        equipamentoId: 200,
        quantidade: 1,
        equipado: false,
      },
    ];

    await (
      service as unknown as {
        sincronizarItensInventarioNoUpdate: (
          donoId: number,
          personagemBaseId: number,
          itensInventario: typeof itens,
          tx: Prisma.TransactionClient,
        ) => Promise<void>;
      }
    ).sincronizarItensInventarioNoUpdate(3, 77, itens, txMock);

    expect(deleteModsMock).toHaveBeenCalledTimes(1);
    expect(deleteItensMock).toHaveBeenCalledTimes(1);
    expect(updatePersonagemMock).not.toHaveBeenCalled();

    expect(adicionarItemMock).toHaveBeenCalledTimes(2);
    expect(adicionarItemMock).toHaveBeenNthCalledWith(
      1,
      3,
      {
        personagemBaseId: 77,
        equipamentoId: 100,
        quantidade: 2,
        equipado: true,
        modificacoes: [7, 8],
        nomeCustomizado: 'Arma principal',
        notas: 'Com mira',
      },
      {
        tx: txMock,
        skipOwnershipCheck: true,
      },
    );
    expect(adicionarItemMock).toHaveBeenNthCalledWith(
      2,
      3,
      {
        personagemBaseId: 77,
        equipamentoId: 200,
        quantidade: 1,
        equipado: false,
        modificacoes: [],
        nomeCustomizado: undefined,
        notas: undefined,
      },
      {
        tx: txMock,
        skipOwnershipCheck: true,
      },
    );
  });
});
