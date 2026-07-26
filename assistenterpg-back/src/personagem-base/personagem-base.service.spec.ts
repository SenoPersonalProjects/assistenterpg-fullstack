import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';

import { PersonagemBaseService } from './personagem-base.service';
import { PrismaService } from '../prisma/prisma.service';
import { PersonagemBaseMapper } from './personagem-base.mapper';
import { PersonagemBasePersistence } from './personagem-base.persistence';
import { InventarioService } from '../inventario/inventario.service';
import { TecnicaInataPropriaService } from '../tecnicas-amaldicoadas/tecnica-inata-propria.service';
import { CreatePersonagemBaseDto } from './dto/create-personagem-base.dto';
import { ImportarPersonagemBaseDto } from './dto/importar-personagem-base.dto';

describe('PersonagemBaseService', () => {
  let service: PersonagemBaseService;

  const substituirInventarioBasePreparadoMock = jest.fn();
  const inventarioServiceMock = {
    substituirInventarioBasePreparado: substituirInventarioBasePreparadoMock,
  };

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
        {
          provide: TecnicaInataPropriaService,
          useValue: {
            clonarTecnicaInata: jest.fn(),
            garantirTecnicaPropriaPersonagemBase: jest.fn(),
            removerTecnicaClonada: jest.fn(),
            sincronizarCampanhasComTecnicaBase: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PersonagemBaseService>(PersonagemBaseService);
  });

  it('mantem inventario intacto quando itensInventario nao foi informado', async () => {
    const serviceInterno = service as unknown as {
      persistirInventarioSeInformado: (
        personagemBaseId: number,
        itensPreparados: undefined,
        espacosInventarioExtraBase: number,
        tx: Prisma.TransactionClient,
      ) => Promise<void>;
    };

    await serviceInterno.persistirInventarioSeInformado(
      1,
      undefined,
      0,
      {} as Prisma.TransactionClient,
    );

    expect(substituirInventarioBasePreparadoMock).not.toHaveBeenCalled();
  });

  it('deve reconstruir graus livres removendo bônus fixo de habilidades no update parcial', async () => {
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

  it('encaminha a importacao da Jiwa Kasumi com os 14 itens em um unico create', async () => {
    const idsEquipamentos = [
      133, 165, 168, 87, 69, 169, 170, 72, 183, 64, 49, 173, 3, 93,
    ];
    const personagem = {
      nome: 'Jiwa Kasumi',
      nivel: 4,
      classeId: 3,
      intelecto: 4,
      periciasLivresCodigos: Array.from(
        { length: 12 },
        (_, index) => `PERICIA_${index + 1}`,
      ),
      itensInventario: idsEquipamentos.map((equipamentoId) => ({
        equipamentoId,
        quantidade: equipamentoId === 93 ? 2 : 1,
        equipado: equipamentoId === 133,
        modificacoesIds:
          equipamentoId === 165 ? [7] : equipamentoId === 173 ? [20] : [],
        estado: {},
      })),
    } as unknown as CreatePersonagemBaseDto;
    const importacao = {
      schema: 'assistenterpg.personagem-base.v1',
      schemaVersion: 1,
      personagem,
    } as ImportarPersonagemBaseDto;
    const serviceInterno = service as unknown as {
      montarDtoParaImportacao: (
        dto: ImportarPersonagemBaseDto,
      ) => Promise<CreatePersonagemBaseDto>;
    };
    jest
      .spyOn(serviceInterno, 'montarDtoParaImportacao')
      .mockResolvedValue(personagem);
    const criarSpy = jest.spyOn(service, 'criar').mockResolvedValue({
      id: 1,
      nome: 'Jiwa Kasumi',
      nivel: 4,
      cla: 'Kasumi',
      origem: 'Operário',
      classe: 'Especialista',
      trilha: 'Técnico',
      caminho: null,
    });

    const resultado = await service.importar(9, importacao);

    expect(criarSpy).toHaveBeenCalledTimes(1);
    expect(criarSpy).toHaveBeenCalledWith(
      9,
      expect.objectContaining({
        nome: 'Jiwa Kasumi',
        itensInventario: expect.arrayContaining([
          expect.objectContaining({ equipamentoId: 133, equipado: true }),
          expect.objectContaining({
            equipamentoId: 165,
            modificacoesIds: [7],
          }),
          expect.objectContaining({
            equipamentoId: 173,
            modificacoesIds: [20],
          }),
        ]),
      }),
    );
    expect(personagem.itensInventario).toHaveLength(14);
    expect(resultado).toEqual(
      expect.objectContaining({
        id: 1,
        importado: true,
        schema: 'assistenterpg.personagem-base.v1',
        schemaVersion: 1,
      }),
    );
  });
});
