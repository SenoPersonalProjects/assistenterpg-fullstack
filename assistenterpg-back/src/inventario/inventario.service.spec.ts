import { InventarioService } from './inventario.service';
import { PrismaService } from '../prisma/prisma.service';
import { InventarioEngine } from './engine/inventario.engine';
import { InventarioMapper } from './inventario.mapper';
import { InventarioSemPermissaoException } from 'src/common/exceptions/inventario.exception';
import {
  CategoriaEquipamento,
  ComplexidadeMaldicao,
  Prisma,
  TipoEquipamento,
  TipoModificacao,
} from '@prisma/client';

type PrismaMock = {
  $executeRaw: jest.Mock;
  executarTransacao: jest.Mock;
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
    update: jest.Mock;
  };
  equipamentoCatalogo: {
    findMany: jest.Mock;
  };
  modificacaoEquipamento: {
    findMany: jest.Mock;
  };
  equipamentoModificacaoAplicavel: {
    findMany: jest.Mock;
  };
  pericia: {
    findMany: jest.Mock;
  };
  grauFeiticeiroLimite: {
    findFirst: jest.Mock;
  };
};

describe('InventarioService', () => {
  let service: InventarioService;
  let prisma: PrismaMock;

  beforeEach(() => {
    prisma = {
      $executeRaw: jest.fn(),
      executarTransacao: jest.fn(),
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
        update: jest.fn(),
      },
      equipamentoCatalogo: {
        findMany: jest.fn(),
      },
      modificacaoEquipamento: {
        findMany: jest.fn(),
      },
      equipamentoModificacaoAplicavel: {
        findMany: jest.fn(),
      },
      pericia: {
        findMany: jest.fn(),
      },
      grauFeiticeiroLimite: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };
    prisma.executarTransacao.mockImplementation(
      (
        _contexto: string,
        operacao: (tx: Prisma.TransactionClient) => Promise<unknown>,
      ) => operacao(prisma as unknown as Prisma.TransactionClient),
    );

    service = new InventarioService(
      prisma as unknown as PrismaService,
      new InventarioEngine(),
      {} as InventarioMapper,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.each([
    [
      'adicao',
      'inventario.adicionar',
      () =>
        service.adicionarItem(12, {
          personagemBaseId: 77,
          equipamentoId: 5,
          quantidade: 1,
          equipado: false,
        }),
    ],
    [
      'atualizacao',
      'inventario.atualizar',
      () => service.atualizarItem(12, 5, { quantidade: 2 }),
    ],
    ['remocao', 'inventario.remover', () => service.removerItem(12, 5)],
    [
      'aplicacao de modificacao',
      'inventario.aplicar_modificacao',
      () => service.aplicarModificacao(12, 5, { modificacaoId: 9 }),
    ],
    [
      'remocao de modificacao',
      'inventario.remover_modificacao',
      () => service.removerModificacao(12, 5, { modificacaoId: 9 }),
    ],
  ])('executa %s em transacao instrumentada', async (_nome, contexto, acao) => {
    prisma.inventarioItemBase.findUnique.mockResolvedValue(null);
    prisma.personagemBase.findFirst.mockResolvedValue(null);

    await expect(acao()).rejects.toBeDefined();

    expect(prisma.executarTransacao).toHaveBeenCalledWith(
      contexto,
      expect.any(Function),
    );
  });

  it('usa a tabela fisica mapeada ao atualizar o cache em lote', async () => {
    prisma.$executeRaw.mockResolvedValue(1);
    const serviceInterno = service as unknown as {
      atualizarCacheItensInventario: (
        itens: unknown[],
        cliente: Prisma.TransactionClient,
      ) => Promise<void>;
    };

    await serviceInterno.atualizarCacheItensInventario(
      [
        {
          id: 10,
          quantidade: 1,
          categoriaCalculada: CategoriaEquipamento.CATEGORIA_1,
          reduzirItensLeves: false,
          equipamento: { espacos: 2 },
          modificacoes: [],
        },
      ],
      prisma as unknown as Prisma.TransactionClient,
    );

    const consulta = prisma.$executeRaw.mock.calls[0][0] as Prisma.Sql;
    expect(consulta.sql).toContain('UPDATE `inventario_item_base`');
    expect(consulta.sql).not.toContain('UPDATE InventarioItemBase');
  });

  it('encaminha escritas e recalculo pelo mesmo tx quando o recalculo falha', async () => {
    const falhaRecalculo = new Error('falha no recalculo');
    const tx = {
      inventarioItemBase: {
        findUnique: jest.fn().mockResolvedValue({
          id: 5,
          personagemBaseId: 77,
          personagemBase: { id: 77 },
        }),
        delete: jest.fn().mockResolvedValue({ id: 5 }),
      },
      inventarioItemBaseModificacao: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      personagemBase: {
        findFirst: jest.fn().mockResolvedValue({ id: 77 }),
      },
    };
    prisma.executarTransacao.mockImplementation(
      (
        _contexto: string,
        operacao: (cliente: Prisma.TransactionClient) => Promise<unknown>,
      ) => operacao(tx as unknown as Prisma.TransactionClient),
    );
    const serviceInterno = service as unknown as {
      atualizarEstadoInventario: (
        personagemBaseId: number,
        cliente: Prisma.TransactionClient,
      ) => Promise<void>;
    };
    const recalcular = jest
      .spyOn(serviceInterno, 'atualizarEstadoInventario')
      .mockRejectedValue(falhaRecalculo);

    await expect(service.removerItem(12, 5)).rejects.toBe(falhaRecalculo);

    expect(tx.inventarioItemBaseModificacao.deleteMany).toHaveBeenCalledTimes(
      1,
    );
    expect(tx.inventarioItemBase.delete).toHaveBeenCalledTimes(1);
    expect(recalcular).toHaveBeenCalledWith(
      77,
      tx as unknown as Prisma.TransactionClient,
    );
    expect(prisma.inventarioItemBase.delete).not.toHaveBeenCalled();
  });

  it('reutiliza tx recebido sem abrir transacao aninhada', async () => {
    const tx = {
      equipamentoCatalogo: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };

    await expect(
      service.adicionarItem(
        12,
        {
          personagemBaseId: 77,
          equipamentoId: 5,
          quantidade: 1,
          equipado: false,
        },
        {
          tx: tx as unknown as Prisma.TransactionClient,
          skipOwnershipCheck: true,
        },
      ),
    ).rejects.toBeDefined();

    expect(tx.equipamentoCatalogo.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.executarTransacao).not.toHaveBeenCalled();
  });

  it('usa mecanicas persistidas no preview identificado e ignora flags forjadas', async () => {
    prisma.personagemBase.findFirst.mockResolvedValue({
      forca: 0,
      intelecto: 4,
      prestigioBase: 30,
      habilidadesBase: [
        {
          habilidade: {
            mecanicasEspeciais: {
              inventario: { somarIntelecto: true },
            },
          },
        },
      ],
      poderesGenericos: [],
    });
    prisma.equipamentoCatalogo.findMany.mockResolvedValue([]);
    prisma.modificacaoEquipamento.findMany.mockResolvedValue([]);

    const resultado = (await service.previewItensInventario(
      {
        personagemBaseId: 1,
        forca: 99,
        intelecto: 0,
        somarIntelecto: false,
        reduzirItensLeves: false,
        prestigioBase: 0,
        itens: [],
      },
      { donoId: 7 },
    )) as {
      capacidade: { base: number; formula: { intelectoAplicado: number } };
    };

    expect(resultado.capacidade).toMatchObject({
      base: 20,
      formula: { intelectoAplicado: 4 },
    });
    expect(prisma.personagemBase.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1, donoId: 7 },
      }),
    );
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

  it('substitui por lista vazia em uma escrita e executa um unico recalculo', async () => {
    const serviceInterno = service as unknown as {
      atualizarEstadoInventario: (
        personagemBaseId: number,
        prisma: Prisma.TransactionClient,
        espacosInventarioExtraBase: number,
      ) => Promise<void>;
    };
    const recalcularSpy = jest
      .spyOn(serviceInterno, 'atualizarEstadoInventario')
      .mockResolvedValue();

    await service.substituirInventarioBasePreparado(
      42,
      [],
      prisma as unknown as Prisma.TransactionClient,
    );

    expect(prisma.personagemBase.update).toHaveBeenCalledTimes(1);
    expect(prisma.personagemBase.update).toHaveBeenCalledWith({
      where: { id: 42 },
      data: {
        inventarioItens: {
          deleteMany: {},
        },
      },
    });
    expect(recalcularSpy).toHaveBeenCalledTimes(1);
  });

  it('prepara e persiste os 14 itens da Jiwa em lote', async () => {
    const idsEquipamentos = [
      133, 165, 168, 87, 69, 169, 170, 72, 183, 64, 49, 173, 3, 93,
    ];
    const itensJiwa = idsEquipamentos.map((equipamentoId) => ({
      equipamentoId,
      quantidade: equipamentoId === 93 ? 2 : 1,
      equipado: equipamentoId === 133,
      modificacoesIds:
        equipamentoId === 165 ? [7] : equipamentoId === 173 ? [20] : [],
      nomeCustomizado:
        equipamentoId === 133
          ? 'Uniforme Jujutsu'
          : equipamentoId === 173
            ? 'Coleção do Paboru Maçaru'
            : null,
      notas: null,
      estado: {},
    }));
    prisma.equipamentoCatalogo.findMany.mockResolvedValue(
      idsEquipamentos.map((id) => ({
        id,
        codigo: `EQUIPAMENTO_${id}`,
        nome: `Equipamento ${id}`,
        tipo: TipoEquipamento.GENERICO,
        categoria: CategoriaEquipamento.CATEGORIA_0,
        espacos: 0.5,
        complexidadeMaldicao: ComplexidadeMaldicao.NENHUMA,
        tipoArma: null,
        bonusDefesa: 0,
        penalidadeCarga: 0,
        tipoAcessorio: null,
        descricao: null,
        efeito: null,
        periciaBonificada: null,
        danos: [],
        reducesDano: [],
        protecaoAmaldicoada: null,
      })),
    );
    prisma.modificacaoEquipamento.findMany.mockResolvedValue(
      [7, 20].map((id) => ({
        id,
        codigo: `MODIFICACAO_${id}`,
        nome: `Modificação ${id}`,
        descricao: null,
        tipo: TipoModificacao.ACESSORIO,
        incrementoEspacos: 0.5,
        efeitosMecanicos: null,
      })),
    );
    prisma.equipamentoModificacaoAplicavel.findMany.mockResolvedValue([
      { equipamentoId: 165, modificacaoId: 7 },
      { equipamentoId: 173, modificacaoId: 20 },
    ]);
    prisma.pericia.findMany.mockResolvedValue([]);

    const preparados = await service.prepararSubstituicaoInventarioBase(
      itensJiwa,
      {
        espacosInventarioBase: 20,
        espacosInventarioExtraBase: 0,
        reduzirItensLeves: false,
        reduzirCategoriaEm: 0,
        reduzirCategoriaExcetoTipos: [],
      },
    );

    expect(preparados).toHaveLength(14);
    expect(prisma.equipamentoCatalogo.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.modificacaoEquipamento.findMany).toHaveBeenCalledTimes(1);
    expect(
      prisma.equipamentoModificacaoAplicavel.findMany,
    ).toHaveBeenCalledTimes(1);
    expect(preparados).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          equipamentoId: 133,
          equipado: true,
          categoriaCalculada: CategoriaEquipamento.CATEGORIA_0,
          espacosCalculados: 0.5,
        }),
        expect.objectContaining({
          equipamentoId: 165,
          modificacoesIds: [7],
          espacosCalculados: 1,
        }),
        expect.objectContaining({
          equipamentoId: 173,
          modificacoesIds: [20],
          nomeCustomizado: 'Coleção do Paboru Maçaru',
        }),
      ]),
    );

    const serviceInterno = service as unknown as {
      atualizarEstadoInventario: (
        personagemBaseId: number,
        prisma: Prisma.TransactionClient,
        espacosInventarioExtraBase: number,
      ) => Promise<void>;
    };
    const recalcularSpy = jest
      .spyOn(serviceInterno, 'atualizarEstadoInventario')
      .mockResolvedValue();
    await service.substituirInventarioBasePreparado(
      1,
      preparados,
      prisma as unknown as Prisma.TransactionClient,
    );

    expect(prisma.personagemBase.update).toHaveBeenCalledTimes(1);
    const escrita = prisma.personagemBase.update.mock.calls[0][0];
    expect(escrita.data.inventarioItens.deleteMany).toEqual({});
    expect(escrita.data.inventarioItens.create).toHaveLength(14);
    expect(recalcularSpy).toHaveBeenCalledTimes(1);
  });

  it('remover equipamento preserva resistencia proveniente de habilidade', async () => {
    const db = {
      inventarioItemBase: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      habilidadePersonagemBase: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      poderGenericoPersonagemBase: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      personagemBase: {
        findUnique: jest.fn().mockResolvedValue({
          agilidade: 1,
          forca: 2,
          intelecto: 4,
          presenca: 3,
          vigor: 2,
          espacosInventarioBase: 10,
          defesaBase: 10,
          defesaEquipamento: 0,
          defesaOutros: 0,
          esquiva: 10,
          bloqueio: 10,
          pericias: [],
          habilidadesBase: [
            {
              habilidade: {
                mecanicasEspeciais: {
                  resistencias: { DANO: 3 },
                },
              },
            },
          ],
          poderesGenericos: [],
        }),
        update: jest.fn().mockResolvedValue({ id: 42 }),
      },
      personagemCampanha: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      personagemBaseResistencia: {
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      resistenciaTipo: {
        findMany: jest.fn().mockResolvedValue([{ id: 5, codigo: 'DANO' }]),
      },
    };
    const serviceInterno = service as unknown as {
      atualizarEstadoInventario: (
        personagemBaseId: number,
        cliente: Prisma.TransactionClient,
      ) => Promise<void>;
    };

    await serviceInterno.atualizarEstadoInventario(
      42,
      db as unknown as Prisma.TransactionClient,
    );

    expect(db.personagemBaseResistencia.deleteMany).toHaveBeenCalledTimes(1);
    expect(db.personagemBaseResistencia.createMany).toHaveBeenCalledWith({
      data: [
        {
          personagemBaseId: 42,
          resistenciaTipoId: 5,
          valor: 3,
        },
      ],
    });
  });
});
