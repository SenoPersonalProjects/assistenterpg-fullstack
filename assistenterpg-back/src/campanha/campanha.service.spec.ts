import { Test, TestingModule } from '@nestjs/testing';
import { StatusAmizade } from '@prisma/client';

import { CampanhaService } from './campanha.service';
import { CampanhaMapper } from './campanha.mapper';
import { CampanhaPersistence } from './campanha.persistence';
import { CampanhaAccessService } from './campanha.access.service';
import { CampanhaContextoService } from './campanha.contexto.service';
import { CampanhaPersonagensService } from './campanha.personagens.service';
import { CampanhaModificadoresService } from './campanha.modificadores.service';
import { CampanhaConvitesService } from './campanha.convites.service';
import { CampanhaInventarioService } from './campanha.inventario.service';
import { CampanhaItensSessaoService } from './campanha.itens-sessao.service';
import { CampanhaVinculadosService } from './campanha.vinculados.service';
import { PresencaService } from 'src/amizades/presenca.service';
import { TecnicaInataPropriaService } from '../tecnicas-amaldicoadas/tecnica-inata-propria.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CampanhaApenasDonoException,
  CampanhaPersonagemAssociacaoNegadaException,
  CampanhaPersonagemLimiteUsuarioException,
  ConviteCodigoIndisponivelException,
  ConvitePendenteDuplicadoException,
  UsuarioJaMembroCampanhaException,
} from 'src/common/exceptions/campanha.exception';
import { AmizadeNaoEncontradaException } from 'src/common/exceptions/amizade.exception';
import { UsuarioEmailNaoEncontradoException } from 'src/common/exceptions/usuario.exception';

type PrismaMock = {
  campanha: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    count: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
  };
  conviteCampanha: {
    findMany: jest.Mock;
    create: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  usuario: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
  };
  membroCampanha: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
  amizade: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
  };
  personagemBase: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
  };
  personagemCampanha: {
    findMany: jest.Mock;
    findFirst: jest.Mock;
    findUnique: jest.Mock;
    findUniqueOrThrow: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  pericia: {
    findUnique: jest.Mock;
  };
  tipoGrau: {
    findUnique: jest.Mock;
  };
  personagemSessao: {
    findFirst: jest.Mock;
  };
  personagemCampanhaResistencia: {
    createMany: jest.Mock;
  };
  personagemCampanhaHistorico: {
    findMany: jest.Mock;
    create: jest.Mock;
  };
  personagemCampanhaModificador: {
    findMany: jest.Mock;
    findFirst: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  sessao: {
    findFirst: jest.Mock;
  };
  cena: {
    findFirst: jest.Mock;
  };
  $transaction: jest.Mock;
};

describe('CampanhaService', () => {
  let service: CampanhaService;
  let prisma: PrismaMock;
  let presenca: { estaOnline: jest.Mock };

  beforeEach(async () => {
    prisma = {
      campanha: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      conviteCampanha: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      usuario: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      membroCampanha: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      amizade: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      personagemBase: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      personagemCampanha: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      pericia: {
        findUnique: jest.fn(),
      },
      tipoGrau: {
        findUnique: jest.fn(),
      },
      personagemSessao: {
        findFirst: jest.fn(),
      },
      personagemCampanhaResistencia: {
        createMany: jest.fn(),
      },
      personagemCampanhaHistorico: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      personagemCampanhaModificador: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      sessao: {
        findFirst: jest.fn(),
      },
      cena: {
        findFirst: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    presenca = { estaOnline: jest.fn().mockReturnValue(false) };
    prisma.usuario.findUnique.mockImplementation(
      ({ where }: { where?: { email?: unknown } }) =>
        Promise.resolve({
          email:
            typeof where?.email === 'string'
              ? where.email
              : 'usuario@teste.com',
        }),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampanhaService,
        CampanhaMapper,
        CampanhaPersistence,
        CampanhaAccessService,
        CampanhaContextoService,
        CampanhaPersonagensService,
        CampanhaModificadoresService,
        CampanhaConvitesService,
        {
          provide: CampanhaInventarioService,
          useValue: {
            recalcularEstadoInventarioCampanha: jest.fn(),
          },
        },
        {
          provide: CampanhaItensSessaoService,
          useValue: {},
        },
        {
          provide: CampanhaVinculadosService,
          useValue: {},
        },
        {
          provide: TecnicaInataPropriaService,
          useValue: {
            garantirTecnicaPropriaPersonagemBase: jest
              .fn()
              .mockResolvedValue(null),
            clonarTecnicaInata: jest.fn(),
            removerTecnicaClonada: jest.fn(),
          },
        },
        {
          provide: PresencaService,
          useValue: presenca,
        },
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<CampanhaService>(CampanhaService);
  });

  const montarPersonagemCampanhaMinimo = () => ({
    id: 5,
    campanhaId: 7,
    donoId: 3,
    pvMax: 100,
    pvAtual: 80,
    peMax: 50,
    peAtual: 40,
    eaMax: 100,
    eaAtual: 95,
    sanMax: 30,
    sanAtual: 25,
    defesaBase: 10,
    defesaEquipamento: 0,
    defesaOutros: 0,
    esquiva: 0,
    bloqueio: 0,
    deslocamento: 9,
    limitePeEaPorTurno: 2,
    prestigioGeral: 0,
    prestigioCla: null,
  });

  const montarPersonagemCampanhaDetalhe = (
    overrides: Record<string, unknown> = {},
  ) => ({
    ...montarPersonagemCampanhaMinimo(),
    personagemBaseId: 42,
    nome: 'Yuta',
    nivel: 5,
    pvBarrasTotal: 1,
    pvBarrasRestantes: 1,
    nucleoAmaldicoadoAtivo: null,
    nucleosDisponiveis: null,
    turnosMorrendo: 3,
    turnosEnlouquecendo: 3,
    personagemBase: {
      id: 42,
      nome: 'Yuta',
      pericias: [],
      grausAprimoramento: [],
    },
    dono: { id: 3, apelido: 'Jogador' },
    grausAprimoramento: [],
    modificadores: [],
    ...overrides,
  });

  it('deve criar convite após colisão de código com retry', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 1,
      donoId: 10,
      dono: { id: 10, email: 'dono@teste.com' },
      membros: [],
    });
    prisma.conviteCampanha.findMany.mockResolvedValue([]);

    prisma.conviteCampanha.create
      .mockRejectedValueOnce({ code: 'P2002', meta: { target: ['codigo'] } })
      .mockResolvedValueOnce({
        id: 99,
        campanhaId: 1,
        email: 'jogador@teste.com',
        codigo: 'ABCD1234',
        papel: 'JOGADOR',
        status: 'PENDENTE',
      });

    const convite = await service.criarConvitePorEmail(
      1,
      10,
      'jogador@teste.com',
      'JOGADOR',
    );

    expect(convite.id).toBe(99);
    expect(prisma.conviteCampanha.create).toHaveBeenCalledTimes(2);
  });

  it('deve criar convite usando usuarioId de amigo', async () => {
    prisma.amizade.findUnique.mockResolvedValue({
      id: 7,
      status: StatusAmizade.ACEITA,
    });
    prisma.usuario.findUnique.mockResolvedValue({ email: 'amigo@teste.com' });
    prisma.campanha.findUnique.mockResolvedValue({
      id: 1,
      donoId: 10,
      dono: { id: 10, email: 'dono@teste.com' },
      membros: [],
    });
    prisma.conviteCampanha.findMany.mockResolvedValue([]);
    prisma.conviteCampanha.create.mockResolvedValue({
      id: 77,
      email: 'amigo@teste.com',
    });

    const convite = await service.criarConvite(
      1,
      10,
      { usuarioId: 44 },
      'JOGADOR',
    );

    expect(prisma.usuario.findUnique).toHaveBeenNthCalledWith(1, {
      where: {
        id: 44,
        AND: [
          expect.objectContaining({
            emailVerificadoEm: { not: null },
            status: 'ATIVA',
          }),
        ],
      },
      select: { email: true },
    });
    expect(prisma.amizade.findUnique).toHaveBeenCalledWith({
      where: {
        usuarioAId_usuarioBId: {
          usuarioAId: 10,
          usuarioBId: 44,
        },
      },
      select: { status: true },
    });
    expect(prisma.conviteCampanha.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        campanhaId: 1,
        email: 'amigo@teste.com',
        papel: 'JOGADOR',
        status: 'PENDENTE',
      }),
    });
    expect(convite.id).toBe(77);
  });

  it('deve bloquear convite por usuarioId quando não for amigo aceito', async () => {
    prisma.amizade.findUnique.mockResolvedValue(null);

    await expect(
      service.criarConvite(1, 10, { usuarioId: 44 }, 'JOGADOR'),
    ).rejects.toBeInstanceOf(AmizadeNaoEncontradaException);

    expect(prisma.usuario.findUnique).not.toHaveBeenCalled();
    expect(prisma.conviteCampanha.create).not.toHaveBeenCalled();
  });

  it('deve bloquear convite por email para conta não ativa ou não verificada', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 1,
      donoId: 10,
      dono: { id: 10, email: 'dono@teste.com' },
      membros: [],
    });
    prisma.usuario.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.criarConvitePorEmail(1, 10, 'inativa@teste.com', 'JOGADOR'),
    ).rejects.toBeInstanceOf(UsuarioEmailNaoEncontradoException);

    expect(prisma.conviteCampanha.create).not.toHaveBeenCalled();
  });

  it('deve falhar ao criar convite quando código unico não pode ser gerado', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 1,
      donoId: 10,
      dono: { id: 10, email: 'dono@teste.com' },
      membros: [],
    });
    prisma.conviteCampanha.findMany.mockResolvedValue([]);
    prisma.conviteCampanha.create.mockRejectedValue({
      code: 'P2002',
      meta: { target: ['codigo'] },
    });

    await expect(
      service.criarConvitePorEmail(1, 10, 'jogador@teste.com', 'JOGADOR'),
    ).rejects.toBeInstanceOf(ConviteCodigoIndisponivelException);

    expect(prisma.conviteCampanha.create).toHaveBeenCalledTimes(5);
  });

  it('deve bloquear convite pendente duplicado por campanha e email', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 1,
      donoId: 10,
      dono: { id: 10, email: 'dono@teste.com' },
      membros: [],
    });
    prisma.conviteCampanha.findMany.mockResolvedValue([
      { email: 'JOGADOR@TESTE.COM' },
    ]);

    await expect(
      service.criarConvitePorEmail(1, 10, 'jogador@teste.com', 'JOGADOR'),
    ).rejects.toBeInstanceOf(ConvitePendenteDuplicadoException);

    expect(prisma.conviteCampanha.create).not.toHaveBeenCalled();
  });

  it('deve bloquear convite para dono da campanha', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 1,
      donoId: 10,
      dono: { id: 10, email: 'dono@teste.com' },
      membros: [],
    });

    await expect(
      service.criarConvitePorEmail(1, 10, 'DONO@TESTE.COM', 'MESTRE'),
    ).rejects.toBeInstanceOf(UsuarioJaMembroCampanhaException);

    expect(prisma.conviteCampanha.findMany).not.toHaveBeenCalled();
    expect(prisma.conviteCampanha.create).not.toHaveBeenCalled();
  });

  it('deve bloquear convite para usuário que já e membro', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 1,
      donoId: 10,
      dono: { id: 10, email: 'dono@teste.com' },
      membros: [
        {
          usuarioId: 33,
          usuario: { email: 'jogador@teste.com' },
        },
      ],
    });

    await expect(
      service.criarConvitePorEmail(1, 10, 'jogador@teste.com', 'JOGADOR'),
    ).rejects.toBeInstanceOf(UsuarioJaMembroCampanhaException);

    expect(prisma.conviteCampanha.findMany).not.toHaveBeenCalled();
    expect(prisma.conviteCampanha.create).not.toHaveBeenCalled();
  });

  it('deve listar amigos convidaveis com membro e convite pendente', async () => {
    presenca.estaOnline.mockImplementation(
      (usuarioId: number) => usuarioId === 22,
    );
    prisma.campanha.findUnique.mockResolvedValue({
      donoId: 10,
      membros: [{ usuarioId: 33 }],
      convites: [{ email: 'pendente@teste.com' }],
    });
    prisma.amizade.findMany.mockResolvedValue([
      {
        usuarioAId: 10,
        usuarioBId: 22,
        usuarioA: { id: 10, apelido: 'Dono', email: 'dono@teste.com' },
        usuarioB: {
          id: 22,
          apelido: 'Amigo Online',
          email: 'online@teste.com',
        },
      },
      {
        usuarioAId: 10,
        usuarioBId: 33,
        usuarioA: { id: 10, apelido: 'Dono', email: 'dono@teste.com' },
        usuarioB: { id: 33, apelido: 'Já Membro', email: 'membro@teste.com' },
      },
      {
        usuarioAId: 10,
        usuarioBId: 44,
        usuarioA: { id: 10, apelido: 'Dono', email: 'dono@teste.com' },
        usuarioB: { id: 44, apelido: 'Pendente', email: 'pendente@teste.com' },
      },
    ]);

    const amigos = await service.listarAmigosConvidaveis(1, 10);

    expect(amigos).toEqual([
      {
        id: 22,
        apelido: 'Amigo Online',
        online: true,
        jaMembro: false,
        convitePendente: false,
      },
      {
        id: 33,
        apelido: 'Já Membro',
        online: false,
        jaMembro: true,
        convitePendente: false,
      },
      {
        id: 44,
        apelido: 'Pendente',
        online: false,
        jaMembro: false,
        convitePendente: true,
      },
    ]);
    expect(prisma.amizade.findMany).toHaveBeenCalledWith({
      where: {
        status: StatusAmizade.ACEITA,
        OR: [
          {
            usuarioAId: 10,
            usuarioB: expect.objectContaining({
              emailVerificadoEm: { not: null },
              status: 'ATIVA',
            }),
          },
          {
            usuarioBId: 10,
            usuarioA: expect.objectContaining({
              emailVerificadoEm: { not: null },
              status: 'ATIVA',
            }),
          },
        ],
      },
      include: expect.any(Object),
    });
  });

  it('deve aceitar convite em transacao e atualizar status', async () => {
    const tx = {
      conviteCampanha: {
        findUnique: jest.fn().mockResolvedValue({
          id: 20,
          campanhaId: 7,
          email: 'invite@teste.com',
          papel: 'OBSERVADOR',
          status: 'PENDENTE',
        }),
        update: jest.fn().mockResolvedValue({ id: 20, status: 'ACEITO' }),
      },
      usuario: {
        findUnique: jest.fn().mockResolvedValue({ email: 'INVITE@TESTE.COM' }),
      },
      membroCampanha: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 50,
          campanhaId: 7,
          usuarioId: 4,
          papel: 'OBSERVADOR',
        }),
      },
    };

    prisma.$transaction.mockImplementation(
      async (callback: (txArg: typeof tx) => Promise<unknown>) => {
        return callback(tx);
      },
    );

    const membro = await service.aceitarConvite('COD123', 4);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.membroCampanha.create).toHaveBeenCalledWith({
      data: {
        campanhaId: 7,
        usuarioId: 4,
        papel: 'OBSERVADOR',
      },
    });
    expect(tx.conviteCampanha.update).toHaveBeenCalledWith({
      where: { id: 20 },
      data: {
        status: 'ACEITO',
        respondidoEm: expect.any(Date),
      },
    });
    expect(membro).toEqual({
      id: 50,
      campanhaId: 7,
      usuarioId: 4,
      papel: 'OBSERVADOR',
    });
  });

  it('deve mapear conflito de membro durante aceite para regra de negocio', async () => {
    const tx = {
      conviteCampanha: {
        findUnique: jest.fn().mockResolvedValue({
          id: 20,
          campanhaId: 7,
          email: 'invite@teste.com',
          papel: 'JOGADOR',
          status: 'PENDENTE',
        }),
        update: jest.fn(),
      },
      usuario: {
        findUnique: jest.fn().mockResolvedValue({ email: 'invite@teste.com' }),
      },
      membroCampanha: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockRejectedValue({
          code: 'P2002',
          meta: { target: ['campanhaId', 'usuarioId'] },
        }),
      },
    };

    prisma.$transaction.mockImplementation(
      async (callback: (txArg: typeof tx) => Promise<unknown>) => {
        return callback(tx);
      },
    );

    await expect(service.aceitarConvite('COD123', 4)).rejects.toBeInstanceOf(
      UsuarioJaMembroCampanhaException,
    );

    expect(tx.conviteCampanha.update).not.toHaveBeenCalled();
  });

  it('deve recusar convite pendente com email correspondente', async () => {
    prisma.conviteCampanha.findUnique.mockResolvedValue({
      id: 90,
      campanhaId: 7,
      email: 'jogador@teste.com',
      status: 'PENDENTE',
    });
    prisma.usuario.findUnique.mockResolvedValue({
      id: 4,
      email: 'JOGADOR@TESTE.COM',
    });
    prisma.conviteCampanha.update.mockResolvedValue({
      id: 90,
      status: 'RECUSADO',
    });

    const resultado = await service.recusarConvite('ABC', 4);

    expect(prisma.conviteCampanha.update).toHaveBeenCalledWith({
      where: { id: 90 },
      data: {
        status: 'RECUSADO',
        respondidoEm: expect.any(Date),
      },
    });
    expect(resultado).toEqual({ id: 90, status: 'RECUSADO' });
  });

  it('deve vincular personagem-base na campanha com historico e resistencias', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 7,
      donoId: 1,
      membros: [{ usuarioId: 3, papel: 'JOGADOR' }],
    });
    prisma.personagemBase.findUnique.mockResolvedValue({
      id: 42,
      donoId: 3,
      nome: 'Yuta',
      nivel: 5,
      claId: 1,
      origemId: 2,
      classeId: 3,
      trilhaId: null,
      caminhoId: null,
      pvMaximo: 120,
      peMaximo: 50,
      eaMaximo: 100,
      sanMaximo: 30,
      limitePeEaPorTurno: 2,
      prestigioBase: 0,
      prestigioClaBase: null,
      defesaBase: 16,
      defesaEquipamento: 2,
      defesaOutros: 0,
      esquiva: 3,
      bloqueio: 4,
      deslocamento: 9,
      turnosMorrendo: 3,
      turnosEnlouquecendo: 3,
      espacosInventarioBase: 10,
      espacosInventarioExtra: 0,
      espacosOcupados: 5,
      sobrecarregado: false,
      tecnicaInataId: null,
      resistencias: [{ resistenciaTipoId: 11, valor: 2 }],
    });
    prisma.personagemCampanha.findFirst.mockResolvedValue(null);

    const tx = {
      personagemCampanha: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 501 }),
      },
      inventarioItemBase: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      inventarioItemCampanha: {
        create: jest.fn().mockResolvedValue({ id: 701 }),
      },
      inventarioItemCampanhaModificacao: {
        createMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      personagemCampanhaResistencia: {
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      personagemCampanhaHistorico: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };

    prisma.$transaction.mockImplementation(
      async (callback: (txArg: typeof tx) => Promise<number>) => callback(tx),
    );
    prisma.personagemCampanha.findUnique.mockResolvedValue({
      id: 501,
      campanhaId: 7,
      personagemBaseId: 42,
      donoId: 3,
      nome: 'Yuta',
      nivel: 5,
      pvMax: 120,
      pvAtual: 120,
      peMax: 50,
      peAtual: 50,
      eaMax: 100,
      eaAtual: 100,
      sanMax: 30,
      sanAtual: 30,
      limitePeEaPorTurno: 2,
      prestigioGeral: 0,
      prestigioCla: null,
      defesaBase: 16,
      defesaEquipamento: 2,
      defesaOutros: 0,
      esquiva: 3,
      bloqueio: 4,
      deslocamento: 9,
      turnosMorrendo: 3,
      turnosEnlouquecendo: 3,
      personagemBase: { id: 42, nome: 'Yuta' },
      dono: { id: 3, apelido: 'Jogador' },
      modificadores: [],
    });

    const personagem = await service.vincularPersonagemBase(7, 3, 42);

    expect(tx.personagemCampanha.create).toHaveBeenCalled();
    expect(tx.personagemCampanhaResistencia.createMany).toHaveBeenCalled();
    expect(tx.personagemCampanhaHistorico.create).toHaveBeenCalled();
    expect(personagem.id).toBe(501);
    expect(personagem.recursos.eaMax).toBe(100);
  });

  it('deve listar personagens-base disponíveis apenas do próprio usuário quando não mestre', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 7,
      donoId: 1,
      membros: [
        { usuarioId: 3, papel: 'JOGADOR' },
        { usuarioId: 4, papel: 'JOGADOR' },
      ],
    });
    prisma.personagemCampanha.findMany.mockResolvedValue([
      { personagemBaseId: 30 },
    ]);
    prisma.personagemBase.findMany.mockResolvedValue([
      {
        id: 31,
        nome: 'Yuji',
        nivel: 4,
        donoId: 3,
        dono: { id: 3, apelido: 'Jogador' },
      },
    ]);

    const resultado =
      await service.listarPersonagensBaseDisponiveisParaAssociacao(7, 3);

    expect(prisma.personagemBase.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          donoId: { in: [3] },
          id: { notIn: [30] },
        }),
      }),
    );
    expect(resultado).toEqual([
      {
        id: 31,
        nome: 'Yuji',
        nivel: 4,
        donoId: 3,
        dono: { id: 3, apelido: 'Jogador' },
      },
    ]);
  });

  it('deve listar personagens-base disponíveis de todos participantes para mestre', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 7,
      donoId: 1,
      membros: [
        { usuarioId: 3, papel: 'JOGADOR' },
        { usuarioId: 4, papel: 'OBSERVADOR' },
      ],
    });
    prisma.personagemCampanha.findMany.mockResolvedValue([]);
    prisma.personagemBase.findMany.mockResolvedValue([
      {
        id: 11,
        nome: 'Gojo',
        nivel: 10,
        donoId: 1,
        dono: { id: 1, apelido: 'Mestre' },
      },
      {
        id: 32,
        nome: 'Megumi',
        nivel: 5,
        donoId: 3,
        dono: { id: 3, apelido: 'Jogador' },
      },
    ]);

    await service.listarPersonagensBaseDisponiveisParaAssociacao(7, 1);

    expect(prisma.personagemBase.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          donoId: { in: [1, 3, 4] },
        }),
      }),
    );
  });

  it('deve impedir que jogador associe personagem-base de outro usuário', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 7,
      donoId: 1,
      membros: [
        { usuarioId: 3, papel: 'JOGADOR' },
        { usuarioId: 9, papel: 'JOGADOR' },
      ],
    });
    prisma.personagemBase.findUnique.mockResolvedValue({
      id: 77,
      donoId: 9,
      nome: 'Outro',
      nivel: 1,
      claId: 1,
      origemId: 1,
      classeId: 1,
      trilhaId: null,
      caminhoId: null,
      pvMaximo: 1,
      peMaximo: 1,
      eaMaximo: 1,
      sanMaximo: 1,
      limitePeEaPorTurno: 1,
      prestigioBase: 0,
      prestigioClaBase: null,
      defesaBase: 10,
      defesaEquipamento: 0,
      defesaOutros: 0,
      esquiva: 0,
      bloqueio: 0,
      deslocamento: 9,
      turnosMorrendo: 3,
      turnosEnlouquecendo: 3,
      espacosInventarioBase: 0,
      espacosInventarioExtra: 0,
      espacosOcupados: 0,
      sobrecarregado: false,
      tecnicaInataId: null,
      resistencias: [],
    });

    await expect(
      service.vincularPersonagemBase(7, 3, 77),
    ).rejects.toBeInstanceOf(CampanhaPersonagemAssociacaoNegadaException);
  });

  it('deve desassociar personagem de campanha quando usuário tem permissão', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 7,
      donoId: 1,
      membros: [{ usuarioId: 3, papel: 'JOGADOR' }],
    });
    prisma.personagemCampanha.findUnique.mockResolvedValue({
      id: 901,
      campanhaId: 7,
      personagemBaseId: 42,
      donoId: 3,
      tecnicaInataPropriaId: null,
    });
    const tx = {
      personagemSessao: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      transferenciaItemSessaoCampanha: {
        deleteMany: jest.fn(),
      },
      itemSessaoCampanha: {
        updateMany: jest.fn(),
      },
      personagemCampanha: {
        delete: jest.fn().mockResolvedValue({ id: 901 }),
      },
    };
    prisma.$transaction.mockImplementation(
      async (callback: (txArg: typeof tx) => Promise<unknown>) => callback(tx),
    );

    const resposta = await service.desassociarPersonagemCampanha(7, 901, 3);

    expect(tx.personagemCampanha.delete).toHaveBeenCalledWith({
      where: { id: 901 },
    });
    expect(resposta).toEqual({
      id: 901,
      campanhaId: 7,
      personagemBaseId: 42,
      message: 'Personagem desassociado com sucesso',
    });
  });

  it('deve limpar vinculos de sessão ao desassociar personagem', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 7,
      donoId: 1,
      membros: [{ usuarioId: 3, papel: 'JOGADOR' }],
    });
    prisma.personagemCampanha.findUnique.mockResolvedValue({
      id: 901,
      campanhaId: 7,
      personagemBaseId: 42,
      donoId: 3,
      tecnicaInataPropriaId: null,
    });
    const tx = {
      personagemSessao: {
        findMany: jest.fn().mockResolvedValue([{ id: 15 }]),
        deleteMany: jest.fn(),
      },
      transferenciaItemSessaoCampanha: {
        deleteMany: jest.fn(),
      },
      itemSessaoCampanha: {
        updateMany: jest.fn(),
      },
      eventoSessao: {
        deleteMany: jest.fn(),
      },
      condicaoPersonagemSessao: {
        deleteMany: jest.fn(),
      },
      personagemSessaoHabilidadeSustentada: {
        deleteMany: jest.fn(),
      },
      personagemCampanha: {
        delete: jest.fn().mockResolvedValue({ id: 901 }),
      },
    };
    prisma.$transaction.mockImplementation(
      async (callback: (txArg: typeof tx) => Promise<unknown>) => callback(tx),
    );

    const resposta = await service.desassociarPersonagemCampanha(7, 901, 3);

    expect(tx.personagemSessao.findMany).toHaveBeenCalledWith({
      where: { personagemCampanhaId: 901 },
      select: { id: true },
    });
    expect(tx.eventoSessao.deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { personagemAtorId: { in: [15] } },
          { personagemAlvoId: { in: [15] } },
        ],
      },
    });
    expect(tx.personagemSessao.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: [15] } },
    });
    expect(tx.personagemCampanha.delete).toHaveBeenCalledWith({
      where: { id: 901 },
    });
    expect(resposta).toEqual({
      id: 901,
      campanhaId: 7,
      personagemBaseId: 42,
      message: 'Personagem desassociado com sucesso',
    });
  });

  it('deve manter limite de 1 personagem por campanha para jogador', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 7,
      donoId: 1,
      membros: [{ usuarioId: 3, papel: 'JOGADOR' }],
    });
    prisma.personagemBase.findUnique.mockResolvedValue({
      id: 42,
      donoId: 3,
      nome: 'Yuta',
      nivel: 5,
      claId: 1,
      origemId: 2,
      classeId: 3,
      trilhaId: null,
      caminhoId: null,
      pvMaximo: 120,
      peMaximo: 50,
      eaMaximo: 100,
      sanMaximo: 30,
      limitePeEaPorTurno: 2,
      prestigioBase: 0,
      prestigioClaBase: null,
      defesaBase: 16,
      defesaEquipamento: 2,
      defesaOutros: 0,
      esquiva: 3,
      bloqueio: 4,
      deslocamento: 9,
      turnosMorrendo: 3,
      turnosEnlouquecendo: 3,
      espacosInventarioBase: 10,
      espacosInventarioExtra: 0,
      espacosOcupados: 5,
      sobrecarregado: false,
      tecnicaInataId: null,
      resistencias: [],
    });
    prisma.personagemCampanha.findFirst.mockResolvedValue({ id: 88 });

    await expect(
      service.vincularPersonagemBase(7, 3, 42),
    ).rejects.toBeInstanceOf(CampanhaPersonagemLimiteUsuarioException);
  });

  it('deve permitir multiplos personagens para mestre na mesma campanha', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 7,
      donoId: 1,
      membros: [{ usuarioId: 3, papel: 'JOGADOR' }],
    });
    prisma.personagemBase.findUnique.mockResolvedValue({
      id: 42,
      donoId: 1,
      nome: 'Gojo',
      nivel: 10,
      claId: 1,
      origemId: 2,
      classeId: 3,
      trilhaId: null,
      caminhoId: null,
      pvMaximo: 220,
      peMaximo: 90,
      eaMaximo: 200,
      sanMaximo: 40,
      limitePeEaPorTurno: 4,
      prestigioBase: 2,
      prestigioClaBase: 1,
      defesaBase: 20,
      defesaEquipamento: 4,
      defesaOutros: 2,
      esquiva: 5,
      bloqueio: 6,
      deslocamento: 9,
      turnosMorrendo: 3,
      turnosEnlouquecendo: 3,
      espacosInventarioBase: 10,
      espacosInventarioExtra: 5,
      espacosOcupados: 8,
      sobrecarregado: false,
      tecnicaInataId: null,
      resistencias: [],
    });

    const tx = {
      personagemCampanha: {
        findFirst: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 900 }),
      },
      inventarioItemBase: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      inventarioItemCampanha: {
        create: jest.fn().mockResolvedValue({ id: 702 }),
      },
      inventarioItemCampanhaModificacao: {
        createMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      personagemCampanhaResistencia: {
        createMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      personagemCampanhaHistorico: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };

    prisma.$transaction.mockImplementation(
      async (callback: (txArg: typeof tx) => Promise<number>) => callback(tx),
    );

    prisma.personagemCampanha.findUnique.mockResolvedValue({
      id: 900,
      campanhaId: 7,
      personagemBaseId: 42,
      donoId: 1,
      nome: 'Gojo',
      nivel: 10,
      pvMax: 220,
      pvAtual: 220,
      peMax: 90,
      peAtual: 90,
      eaMax: 200,
      eaAtual: 200,
      sanMax: 40,
      sanAtual: 40,
      limitePeEaPorTurno: 4,
      prestigioGeral: 2,
      prestigioCla: 1,
      defesaBase: 20,
      defesaEquipamento: 4,
      defesaOutros: 2,
      esquiva: 5,
      bloqueio: 6,
      deslocamento: 9,
      turnosMorrendo: 3,
      turnosEnlouquecendo: 3,
      personagemBase: { id: 42, nome: 'Gojo' },
      dono: { id: 1, apelido: 'Mestre' },
      modificadores: [],
    });

    const personagem = await service.vincularPersonagemBase(7, 1, 42);

    expect(prisma.personagemCampanha.findFirst).not.toHaveBeenCalled();
    expect(tx.personagemCampanha.findFirst).not.toHaveBeenCalled();
    expect(tx.personagemCampanha.create).toHaveBeenCalledTimes(1);
    expect(personagem.id).toBe(900);
  });

  it('deve aplicar modificador e ajustar recurso atual quando maximo reduz', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 7,
      donoId: 1,
      membros: [{ usuarioId: 3, papel: 'JOGADOR' }],
    });
    prisma.personagemCampanha.findUnique.mockResolvedValue({
      id: 5,
      campanhaId: 7,
      donoId: 3,
      pvMax: 100,
      pvAtual: 80,
      peMax: 50,
      peAtual: 40,
      eaMax: 100,
      eaAtual: 95,
      sanMax: 30,
      sanAtual: 25,
      defesaBase: 10,
      defesaEquipamento: 0,
      defesaOutros: 0,
      esquiva: 0,
      bloqueio: 0,
      deslocamento: 9,
      limitePeEaPorTurno: 2,
      prestigioGeral: 0,
      prestigioCla: null,
    });

    const tx = {
      personagemCampanhaModificador: {
        create: jest.fn().mockResolvedValue({
          id: 80,
          campanhaId: 7,
          personagemCampanhaId: 5,
          campo: 'EA_MAX',
          valor: -20,
          nome: 'Maldição',
        }),
      },
      personagemCampanha: {
        update: jest.fn().mockResolvedValue({
          id: 5,
          campanhaId: 7,
          personagemBaseId: 42,
          donoId: 3,
          nome: 'Yuta',
          nivel: 5,
          pvMax: 100,
          pvAtual: 80,
          peMax: 50,
          peAtual: 40,
          eaMax: 80,
          eaAtual: 80,
          sanMax: 30,
          sanAtual: 25,
          limitePeEaPorTurno: 2,
          prestigioGeral: 0,
          prestigioCla: null,
          defesaBase: 10,
          defesaEquipamento: 0,
          defesaOutros: 0,
          esquiva: 0,
          bloqueio: 0,
          deslocamento: 9,
          turnosMorrendo: 3,
          turnosEnlouquecendo: 3,
          personagemBase: { id: 42, nome: 'Yuta' },
          dono: { id: 3, apelido: 'Jogador' },
          modificadores: [],
        }),
      },
      personagemCampanhaHistorico: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };

    prisma.$transaction.mockImplementation(
      async (
        callback: (txArg: typeof tx) => Promise<{
          modificador: { id: number };
          personagem: unknown;
        }>,
      ) => callback(tx),
    );

    const resultado = await service.aplicarModificadorPersonagemCampanha(
      7,
      5,
      3,
      { campo: 'EA_MAX', valor: -20, nome: 'Maldição' },
    );

    expect(tx.personagemCampanha.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eaMax: 80,
          eaAtual: 80,
        }),
      }),
    );
    expect(resultado.personagem.recursos.eaMax).toBe(80);
    expect(resultado.personagem.recursos.eaAtual).toBe(80);
  });

  it('deve aplicar modificador com contexto de sessão e cena válidos', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 7,
      donoId: 1,
      membros: [{ usuarioId: 3, papel: 'JOGADOR' }],
    });
    prisma.personagemCampanha.findUnique.mockResolvedValue({
      id: 5,
      campanhaId: 7,
      donoId: 3,
      pvMax: 100,
      pvAtual: 80,
      peMax: 50,
      peAtual: 40,
      eaMax: 100,
      eaAtual: 95,
      sanMax: 30,
      sanAtual: 25,
      defesaBase: 10,
      defesaEquipamento: 0,
      defesaOutros: 0,
      esquiva: 0,
      bloqueio: 0,
      deslocamento: 9,
      limitePeEaPorTurno: 2,
      prestigioGeral: 0,
      prestigioCla: null,
    });
    prisma.sessao.findFirst.mockResolvedValue({ id: 33 });
    prisma.cena.findFirst.mockResolvedValue({ id: 44 });

    const tx = {
      personagemCampanhaModificador: {
        create: jest.fn().mockResolvedValue({
          id: 81,
          campanhaId: 7,
          personagemCampanhaId: 5,
          sessaoId: 33,
          cenaId: 44,
          campo: 'EA_MAX',
          valor: -10,
          nome: 'Exaustao',
        }),
      },
      personagemCampanha: {
        update: jest.fn().mockResolvedValue({
          id: 5,
          campanhaId: 7,
          personagemBaseId: 42,
          donoId: 3,
          nome: 'Yuta',
          nivel: 5,
          pvMax: 100,
          pvAtual: 80,
          peMax: 50,
          peAtual: 40,
          eaMax: 90,
          eaAtual: 90,
          sanMax: 30,
          sanAtual: 25,
          limitePeEaPorTurno: 2,
          prestigioGeral: 0,
          prestigioCla: null,
          defesaBase: 10,
          defesaEquipamento: 0,
          defesaOutros: 0,
          esquiva: 0,
          bloqueio: 0,
          deslocamento: 9,
          turnosMorrendo: 3,
          turnosEnlouquecendo: 3,
          personagemBase: { id: 42, nome: 'Yuta' },
          dono: { id: 3, apelido: 'Jogador' },
          modificadores: [],
        }),
      },
      personagemCampanhaHistorico: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };

    prisma.$transaction.mockImplementation(
      async (
        callback: (txArg: typeof tx) => Promise<{
          modificador: { id: number; sessaoId: number; cenaId: number };
          personagem: unknown;
        }>,
      ) => callback(tx),
    );

    await service.aplicarModificadorPersonagemCampanha(7, 5, 3, {
      campo: 'EA_MAX',
      valor: -10,
      nome: 'Exaustao',
      sessaoId: 33,
      cenaId: 44,
    });

    expect(prisma.sessao.findFirst).toHaveBeenCalledWith({
      where: {
        id: 33,
        campanhaId: 7,
      },
      select: { id: true },
    });
    expect(prisma.cena.findFirst).toHaveBeenCalledWith({
      where: {
        id: 44,
        sessaoId: 33,
      },
      select: { id: true },
    });
    expect(tx.personagemCampanhaModificador.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sessaoId: 33,
          cenaId: 44,
        }),
      }),
    );
  });

  it('deve aplicar modificador narrativo de treinamento em perícia sem alterar ficha base', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 7,
      donoId: 1,
      membros: [{ usuarioId: 3, papel: 'JOGADOR' }],
    });
    prisma.personagemCampanha.findUnique.mockResolvedValue(
      montarPersonagemCampanhaMinimo(),
    );
    prisma.pericia.findUnique.mockResolvedValue({ codigo: 'OCULTISMO' });
    prisma.personagemCampanha.findUniqueOrThrow.mockResolvedValueOnce({
      personagemBase: {
        pericias: [
          {
            grauTreinamento: 0,
            bonusExtra: 0,
            pericia: {
              codigo: 'OCULTISMO',
              nome: 'Ocultismo',
              atributoBase: 'INTELECTO',
            },
          },
        ],
      },
      modificadores: [],
    });

    const tx = {
      personagemCampanhaModificador: {
        create: jest.fn().mockResolvedValue({
          id: 82,
          campanhaId: 7,
          personagemCampanhaId: 5,
          campo: 'PERICIA_TREINAMENTO',
          periciaCodigo: 'OCULTISMO',
          tipoGrauCodigo: null,
          valor: 1,
          nome: 'Treino intensivo',
          pericia: { codigo: 'OCULTISMO', nome: 'Ocultismo' },
          tipoGrau: null,
        }),
      },
      personagemCampanha: {
        findUniqueOrThrow: jest.fn().mockResolvedValue(
          montarPersonagemCampanhaDetalhe({
            personagemBase: {
              id: 42,
              nome: 'Yuta',
              pericias: [
                {
                  grauTreinamento: 0,
                  bonusExtra: 0,
                  pericia: {
                    codigo: 'OCULTISMO',
                    nome: 'Ocultismo',
                    atributoBase: 'INTELECTO',
                  },
                },
              ],
              grausAprimoramento: [],
            },
            modificadores: [
              {
                campo: 'PERICIA_TREINAMENTO',
                valor: 1,
                periciaCodigo: 'OCULTISMO',
                tipoGrauCodigo: null,
              },
            ],
          }),
        ),
      },
      personagemCampanhaHistorico: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };

    prisma.$transaction.mockImplementation(
      async (
        callback: (txArg: typeof tx) => Promise<{
          modificador: { id: number };
          personagem: unknown;
        }>,
      ) => callback(tx),
    );

    const resultado = await service.aplicarModificadorPersonagemCampanha(
      7,
      5,
      3,
      {
        campo: 'PERICIA_TREINAMENTO',
        periciaCodigo: 'OCULTISMO',
        valor: 1,
        nome: 'Treino intensivo',
      },
    );

    expect(tx.personagemCampanhaModificador.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          campo: 'PERICIA_TREINAMENTO',
          periciaCodigo: 'OCULTISMO',
          tipoGrauCodigo: null,
          valor: 1,
        }),
      }),
    );
    expect(resultado.personagem.pericias).toEqual([
      expect.objectContaining({
        codigo: 'OCULTISMO',
        grauTreinamento: 1,
        bonusTreinamento: 5,
        bonusTotal: 5,
      }),
    ]);
  });

  it('deve aplicar modificador narrativo de grau de aprimoramento no retorno efetivo', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 7,
      donoId: 1,
      membros: [{ usuarioId: 3, papel: 'JOGADOR' }],
    });
    prisma.personagemCampanha.findUnique.mockResolvedValue(
      montarPersonagemCampanhaMinimo(),
    );
    prisma.tipoGrau.findUnique.mockResolvedValue({
      codigo: 'TECNICA_REVERSA',
    });
    prisma.personagemCampanha.findUniqueOrThrow.mockResolvedValueOnce({
      grausAprimoramento: [
        {
          valor: 1,
          tipoGrau: {
            codigo: 'TECNICA_REVERSA',
            nome: 'Técnica Reversa',
          },
        },
      ],
      personagemBase: { grausAprimoramento: [] },
      modificadores: [],
    });

    const tx = {
      personagemCampanhaModificador: {
        create: jest.fn().mockResolvedValue({
          id: 83,
          campanhaId: 7,
          personagemCampanhaId: 5,
          campo: 'GRAU_APRIMORAMENTO',
          periciaCodigo: null,
          tipoGrauCodigo: 'TECNICA_REVERSA',
          valor: 1,
          nome: 'Treinamento reverso',
          pericia: null,
          tipoGrau: { codigo: 'TECNICA_REVERSA', nome: 'Técnica Reversa' },
        }),
      },
      personagemCampanha: {
        findUniqueOrThrow: jest.fn().mockResolvedValue(
          montarPersonagemCampanhaDetalhe({
            grausAprimoramento: [
              {
                valor: 1,
                tipoGrau: {
                  codigo: 'TECNICA_REVERSA',
                  nome: 'Técnica Reversa',
                },
              },
            ],
            modificadores: [
              {
                campo: 'GRAU_APRIMORAMENTO',
                valor: 1,
                periciaCodigo: null,
                tipoGrauCodigo: 'TECNICA_REVERSA',
              },
            ],
          }),
        ),
      },
      personagemCampanhaHistorico: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };

    prisma.$transaction.mockImplementation(
      async (
        callback: (txArg: typeof tx) => Promise<{
          modificador: { id: number };
          personagem: unknown;
        }>,
      ) => callback(tx),
    );

    const resultado = await service.aplicarModificadorPersonagemCampanha(
      7,
      5,
      3,
      {
        campo: 'GRAU_APRIMORAMENTO',
        tipoGrauCodigo: 'TECNICA_REVERSA',
        valor: 1,
        nome: 'Treinamento reverso',
      },
    );

    expect(tx.personagemCampanhaModificador.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          campo: 'GRAU_APRIMORAMENTO',
          periciaCodigo: null,
          tipoGrauCodigo: 'TECNICA_REVERSA',
          valor: 1,
        }),
      }),
    );
    expect(resultado.personagem.grausAprimoramento).toEqual([
      expect.objectContaining({
        tipoGrauCodigo: 'TECNICA_REVERSA',
        valor: 2,
      }),
    ]);
  });

  it('deve rejeitar modificador numérico com alvo estruturado', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 7,
      donoId: 1,
      membros: [{ usuarioId: 3, papel: 'JOGADOR' }],
    });
    prisma.personagemCampanha.findUnique.mockResolvedValue(
      montarPersonagemCampanhaMinimo(),
    );

    await expect(
      service.aplicarModificadorPersonagemCampanha(7, 5, 3, {
        campo: 'EA_MAX',
        periciaCodigo: 'OCULTISMO',
        valor: -5,
        nome: 'Alvo inválido',
      }),
    ).rejects.toMatchObject({ code: 'CAMPANHA_MODIFICADOR_INVALIDO' });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('deve impedir criação de convite por usuário que não e dono', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 1,
      donoId: 20,
      dono: { id: 20, email: 'dono@teste.com' },
      membros: [],
    });

    await expect(
      service.criarConvitePorEmail(1, 10, 'jogador@teste.com', 'JOGADOR'),
    ).rejects.toBeInstanceOf(CampanhaApenasDonoException);
  });
});
