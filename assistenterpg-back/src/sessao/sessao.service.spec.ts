import { Test, TestingModule } from '@nestjs/testing';
import { SessaoService } from './sessao.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  SessaoCampanhaNaoEncontradaException,
  SessaoEfeitosTurnoPendentesException,
  SessaoEncerradaException,
  SessaoEventoDesfazerNaoPermitidoException,
  SessaoTurnoIndisponivelEmCenaLivreException,
} from 'src/common/exceptions/campanha.exception';
import { BusinessException } from 'src/common/exceptions/business.exception';
import {
  EstadoEntidadeVinculadaPersonagem,
  ModoVinculadoTecnica,
  Prisma,
  TipoEntidadeVinculadaPersonagem,
  TipoFichaNpcAmeaca,
  TipoNpcAmeaca,
} from '@prisma/client';

describe('SessaoService', () => {
  let service: SessaoService;

  const prisma = {
    campanha: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  function configurarEventoEfeitosAutomaticos() {
    let dados: Record<string, unknown> = {
      efeitosAutomaticos: {
        versao: 2,
        status: 'PENDENTE',
        acao: 'AVANCAR',
        cenaId: 5,
        rodadaAnterior: 2,
        rodadaNova: 3,
        passos: [
          {
            chave: 'SUSTENTACOES_RODADA',
            tipo: 'SUSTENTACOES_RODADA',
            status: 'PENDENTE',
          },
        ],
        tentativas: 0,
        atualizadoEm: '2026-07-13T12:00:00.000Z',
      },
    };
    const lerEvento = jest.fn().mockImplementation(() =>
      Promise.resolve({
        id: 123,
        cenaId: 5,
        tipoEvento: 'TURNO_AVANCADO',
        dados,
      }),
    );
    (prisma as any).eventoSessao = {
      findUnique: lerEvento,
      findFirst: lerEvento,
      update: jest.fn().mockImplementation((args) => {
        dados = args.data.dados;
        return Promise.resolve({});
      }),
      create: jest.fn().mockResolvedValue({ id: 9001 }),
      findMany: jest.fn().mockResolvedValue([]),
    };
    (prisma as any).$queryRaw = jest.fn().mockResolvedValue([{ id: 21 }]);
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) =>
        callback(prisma),
    );

    return (prisma as any).eventoSessao;
  }

  function configurarTransacaoEfeitosAutomaticos<
    T extends {
      eventoSessao: {
        create: jest.Mock;
        findMany?: jest.Mock;
        findUnique?: jest.Mock;
        update?: jest.Mock;
      };
      $queryRaw?: jest.Mock;
    },
  >(tx: T) {
    let dadosEventoTurno: Record<string, unknown> | null = null;
    tx.$queryRaw = jest.fn().mockResolvedValue([{ id: 21 }]);
    tx.eventoSessao.findMany = jest.fn().mockResolvedValue([]);
    tx.eventoSessao.findUnique = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve(dadosEventoTurno ? { dados: dadosEventoTurno } : null),
      );
    tx.eventoSessao.update = jest.fn().mockImplementation((args) => {
      dadosEventoTurno = args.data.dados;
      return Promise.resolve({});
    });
    tx.eventoSessao.create.mockImplementation((args) => {
      if (
        typeof args.data.tipoEvento === 'string' &&
        (args.data.tipoEvento.startsWith('TURNO_') ||
          args.data.tipoEvento.startsWith('INICIATIVA_ALTERNADA_'))
      ) {
        dadosEventoTurno = args.data.dados;
      }
      return Promise.resolve({ id: 3001 });
    });
    prisma.$transaction.mockImplementation(
      async (callback: (txArg: T) => Promise<unknown>) => callback(tx),
    );
    return tx.eventoSessao;
  }

  function criarEventoTimeline(
    id: number,
    tipoEvento: string,
    dados: Record<string, unknown>,
  ) {
    return {
      id,
      sessaoId: 21,
      cenaId: 31,
      criadoEm: new Date(`2026-07-10T12:00:0${id}.000Z`),
      tipoEvento,
      personagemAtorId: null,
      personagemAlvoId: null,
      dados,
      personagemAtor: null,
    };
  }

  function mockAcessoTimeline(ehMestre: boolean) {
    jest.spyOn(service as any, 'obterSessaoComAcesso').mockResolvedValue({
      acesso: {
        ehMestre,
      },
      sessao: {
        status: 'EM_ANDAMENTO',
      },
    });
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    delete (prisma as any).inventarioItemCampanha;
    delete (prisma as any).eventoSessao;
    delete (prisma as any).personagemSessaoHabilidadeSustentada;
    delete (prisma as any).personagemCampanha;
    delete (prisma as any).condicaoPersonagemSessao;
    delete (prisma as any).condicao;
    delete (prisma as any).personagemSessao;
    delete (prisma as any).npcAmeacaSessao;
    delete (prisma as any).sessaoRegraOpcional;
    delete (prisma as any).sessaoIniciativaAlternada;
    (prisma as any).sessao = {
      findUnique: jest.fn().mockResolvedValue({
        id: 21,
        campanhaId: 7,
        status: 'EM_ANDAMENTO',
        cenaAtualTipo: 'COMBATE',
        rodadaAtual: 1,
      }),
    };
    (prisma as any).eventoSessao = {
      findMany: jest.fn().mockResolvedValue([]),
    };
    (prisma as any).$queryRaw = jest.fn().mockResolvedValue([{ id: 21 }]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessaoService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<SessaoService>(SessaoService);
  });

  it('bloqueia grupos representativos de mutações antes de efeitos colaterais', async () => {
    const erro = new SessaoEncerradaException(7, 21, 'mutação de teste');
    const guarda = jest
      .spyOn(service as any, 'obterSessaoMutavelComAcesso')
      .mockRejectedValue(erro);
    const mutacoes = [
      () =>
        service.atualizarRecursosPersonagemSessao(7, 21, 31, 10, {} as never),
      () => service.enviarMensagemChatSessao(7, 21, 10, { mensagem: '1d20' }),
      () =>
        service.criarRolagemFormulaSessao(7, 21, 10, {
          tipo: 'FORMULA',
          expressao: '1d20',
          clientRequestId: '9c871c5a-c103-4ab1-86d9-b7cdb20c5d77',
        }),
      () =>
        service.avancarTurnoSessao(7, 21, 10, {
          rodadaEsperada: 1,
          indiceTurnoEsperado: 0,
        }),
      () => service.atualizarCenaSessao(7, 21, 10, {} as never),
      () => service.adicionarNpcSimplesSessao(7, 21, 10, {} as never),
      () => service.invocarEntidadeVinculadaSessao(7, 21, 51, 10, {} as never),
      () => service.aplicarCondicaoSessao(7, 21, 10, {} as never),
      () => service.usarHabilidadeSessao(7, 21, 31, 10, {} as never),
      () => service.atualizarRegraOpcionalSessao(7, 21, 10, {} as never),
      () => service.atualizarEncontroSocialSessao(7, 21, 10, {} as never),
      () => service.consumirItemSessao(7, 21, 10, {} as never),
    ];

    for (const executar of mutacoes) {
      await expect(executar()).rejects.toMatchObject({
        code: 'SESSAO_ENCERRADA',
      });
    }

    expect(guarda).toHaveBeenCalledTimes(mutacoes.length);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('reutiliza mutacao idempotente sem executar efeitos novamente', async () => {
    const intencao = {
      tipo: 'CONSUMIR_ITEM',
      itemInventarioCampanhaId: 45,
      modo: 'NORMAL',
    };
    (prisma as any).eventoSessao.findFirst = jest.fn().mockResolvedValue({
      dados: {
        intencaoIdempotente: {
          modo: 'NORMAL',
          tipo: 'CONSUMIR_ITEM',
          itemInventarioCampanhaId: 45,
        },
      },
    });
    const operacao = jest.fn();

    await expect(
      (service as any).executarMutacaoIdempotenteSessao(
        {
          acao: 'consumir item em sessao',
          sessaoId: 21,
          usuarioId: 10,
          clientRequestId: 'c344ab8f-ebdb-481c-8fca-a1f88d83c183',
          intencao,
        },
        operacao,
      ),
    ).resolves.toBe(false);
    expect(operacao).not.toHaveBeenCalled();
  });

  it('rejeita UUID reutilizado em mutacao com intencao diferente', async () => {
    (prisma as any).eventoSessao.findFirst = jest.fn().mockResolvedValue({
      dados: {
        intencaoIdempotente: {
          tipo: 'APLICAR_CONDICAO',
          condicaoId: 4,
          personagemSessaoId: 31,
        },
      },
    });

    await expect(
      (service as any).executarMutacaoIdempotenteSessao(
        {
          acao: 'aplicar condicao em sessao',
          sessaoId: 21,
          usuarioId: 10,
          clientRequestId: '1dc52494-83e6-450a-b2b4-ae6534fabf57',
          intencao: {
            tipo: 'APLICAR_CONDICAO',
            condicaoId: 5,
            personagemSessaoId: 31,
          },
        },
        jest.fn(),
      ),
    ).rejects.toMatchObject({
      code: 'SESSAO_ROLAGEM_IDEMPOTENCIA_CONFLITO',
    });
  });

  it('registra rolagem legada sem consumir Perito ou conceder Inspiracao', async () => {
    jest
      .spyOn(service as any, 'obterSessaoMutavelComAcesso')
      .mockResolvedValue({
        acesso: { ehMestre: false },
        sessao: { status: 'EM_ANDAMENTO' },
      });
    jest
      .spyOn(service as any, 'assertSessaoMutavelTx')
      .mockResolvedValue(undefined);
    (prisma as any).personagemSessao = {
      findFirst: jest.fn().mockResolvedValue(null),
    };
    (prisma as any).usuario = {
      findUnique: jest.fn().mockResolvedValue({ apelido: 'Jogador' }),
    };
    const criarEvento = jest.fn().mockImplementation((input) =>
      Promise.resolve({
        id: 77,
        criadoEm: new Date('2026-07-15T12:00:00.000Z'),
        dados: input.data.dados,
        personagemAtor: null,
      }),
    );
    (prisma as any).eventoSessao.create = criarEvento;
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) =>
        callback(prisma),
    );

    const resultado = await service.enviarMensagemChatSessao(7, 21, 10, {
      mensagem: '1d20 forjado',
      dadosRolagem: {
        payloads: [{ faces: 20, rolagens: [20], modificador: 999 }],
      },
      contextoRolagem: {
        tipo: 'PERICIA',
        dt: 1000,
        efeitoPendenteId: 'perito-forjado',
      },
    });

    expect(resultado.dadosRolagem).toMatchObject({ origem: 'CLIENTE_LEGADO' });
    expect(criarEvento.mock.calls[0][0].data.dados).toMatchObject({
      ajustesAplicados: [],
      inspiracaoAutomatica: null,
    });
    expect((prisma as any).sessaoRegraOpcional).toBeUndefined();
  });

  it('usa gerador seguro injetavel no calculo de consumivel', () => {
    const gerarDado = jest.fn().mockReturnValueOnce(2).mockReturnValueOnce(5);
    const mathRandom = jest.spyOn(Math, 'random');

    const resultado = (service as any).resolverRolagemConsumo(
      {
        tipo: 'RECURSO',
        recurso: 'PV',
        dados: '2d6+1',
        bonus: 2,
      },
      false,
      gerarDado,
    );

    expect(resultado).toEqual({
      expressao: '2d6+1+2',
      rolagens: [2, 5],
      total: 10,
    });
    expect(gerarDado).toHaveBeenCalledTimes(2);
    expect(mathRandom).not.toHaveBeenCalled();
    mathRandom.mockRestore();
  });

  it('recusa ajuste manual de personagem baseado em snapshot obsoleto', async () => {
    jest
      .spyOn(service as any, 'obterSessaoMutavelComAcesso')
      .mockResolvedValue({
        acesso: { ehMestre: true },
        sessao: { status: 'EM_ANDAMENTO' },
      });
    jest
      .spyOn(service as any, 'assertSessaoMutavelTx')
      .mockResolvedValue(undefined);
    const base = {
      id: 31,
      cenaId: 5,
      personagemCampanha: {
        id: 41,
        campanhaId: 7,
        donoId: 10,
        nome: 'Yuji',
        pvAtual: 10,
        pvMax: 20,
        pvBarrasTotal: 1,
        pvBarrasRestantes: 1,
        peAtual: 8,
        peMax: 10,
        eaAtual: 6,
        eaMax: 10,
        sanAtual: 9,
        sanMax: 10,
      },
    };
    const atualizadoConcorrentemente = {
      ...base,
      personagemCampanha: { ...base.personagemCampanha, pvAtual: 7 },
    };
    (prisma as any).personagemSessao = {
      findFirst: jest
        .fn()
        .mockResolvedValueOnce(base)
        .mockResolvedValueOnce(atualizadoConcorrentemente),
    };
    (prisma as any).personagemCampanha = { update: jest.fn() };
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) =>
        callback(prisma),
    );

    await expect(
      service.atualizarRecursosPersonagemSessao(7, 21, 31, 10, {
        pvAtual: 9,
        pvAtualEsperado: 10,
      }),
    ).rejects.toMatchObject({ code: 'SESSAO_RECURSOS_DESATUALIZADOS' });
    expect((prisma as any).personagemCampanha.update).not.toHaveBeenCalled();
  });

  it('recusa ajuste manual de NPC baseado em snapshot obsoleto', async () => {
    jest
      .spyOn(service as any, 'obterSessaoMutavelComAcesso')
      .mockResolvedValue({
        acesso: { ehMestre: true },
        sessao: { status: 'EM_ANDAMENTO' },
      });
    const npcAtual = {
      id: 71,
      cenaId: 5,
      nomeExibicao: 'Maldição',
      pontosVidaAtual: 8,
      pontosVidaMax: 20,
      sanAtual: null,
      sanMax: null,
      eaAtual: null,
      eaMax: null,
    };
    (prisma as any).npcAmeacaSessao = {
      findFirst: jest.fn().mockResolvedValue(npcAtual),
      update: jest.fn(),
    };
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) =>
        callback(prisma),
    );

    await expect(
      service.atualizarNpcSessao(7, 21, 71, 99, {
        pontosVidaAtual: 7,
        pontosVidaAtualEsperado: 10,
      }),
    ).rejects.toMatchObject({ code: 'SESSAO_RECURSOS_DESATUALIZADOS' });
    expect((prisma as any).npcAmeacaSessao.update).not.toHaveBeenCalled();
  });

  function configurarRolagemAutoritativa(args?: {
    peritoPendente?: boolean;
    persistirEventoCriado?: boolean;
  }) {
    let eventoAtual: Record<string, unknown> | null = null;
    jest
      .spyOn(service as any, 'obterSessaoMutavelComAcesso')
      .mockResolvedValue({
        acesso: {
          ehMestre: false,
          campanha: {
            donoId: 99,
            dono: { apelido: 'Mestre' },
            membros: [
              {
                usuarioId: 10,
                papel: 'JOGADOR',
                usuario: { apelido: 'Jogador' },
              },
            ],
          },
        },
        sessao: { status: 'EM_ANDAMENTO' },
      });
    (prisma as any).personagemSessao = {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 31,
          personagemCampanhaId: 41,
        },
      ]),
    };
    (prisma as any).sessaoRegraOpcional = {
      findUnique: jest.fn().mockResolvedValue(
        args?.peritoPendente
          ? {
              estado: {
                pendentesRolagem: {
                  perito: {
                    id: 'perito-1',
                    eventoId: 70,
                    personagemSessaoId: 31,
                    personagemCampanhaId: 41,
                    habilidadeId: 80,
                    habilidadeNome: 'Perito',
                    dado: 'd8',
                    faces: 8,
                    criadoEm: '2026-07-13T12:00:00.000Z',
                  },
                },
              },
            }
          : null,
      ),
    };
    const buscarEvento = jest
      .fn()
      .mockImplementation(() => Promise.resolve(eventoAtual));
    const criarEvento = jest.fn().mockImplementation((input) => {
      const evento = {
        id: 55,
        criadoEm: new Date('2026-07-13T12:00:00.000Z'),
        dados: input.data.dados,
        personagemAtor: {
          personagemCampanha: {
            nome: 'Yuji',
            donoId: 10,
            dono: { apelido: 'Jogador' },
          },
        },
      };
      if (args?.persistirEventoCriado) eventoAtual = evento;
      return Promise.resolve(evento);
    });
    (prisma as any).eventoSessao.findFirst = buscarEvento;
    (prisma as any).eventoSessao.create = criarEvento;
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) =>
        callback(prisma),
    );
    return { buscarEvento, criarEvento };
  }

  function criarEventoRolagemPericiaTeste(
    dados: Record<string, unknown>,
    donoId = 10,
  ) {
    return {
      id: 56,
      criadoEm: new Date('2026-07-14T12:00:00.000Z'),
      dados,
      personagemAtor: {
        personagemCampanha: {
          nome: 'Yuji',
          donoId,
          dono: { apelido: donoId === 10 ? 'Jogador' : 'Outro jogador' },
        },
      },
    };
  }

  function configurarRolagemPericiaAutoritativa(args?: {
    ehMestre?: boolean;
    donoId?: number;
    periciaCodigo?: string;
    periciaNome?: string;
    atributoBase?: string;
    bonusEscalada?: number;
    eventoExistente?: ReturnType<typeof criarEventoRolagemPericiaTeste> | null;
    persistirEventoCriado?: boolean;
    erroCriarEvento?: Error;
    eventoVencedorAposErro?: ReturnType<typeof criarEventoRolagemPericiaTeste>;
  }) {
    const ehMestre = args?.ehMestre ?? false;
    const donoId = args?.donoId ?? 10;
    const periciaCodigo = args?.periciaCodigo ?? 'ATLETISMO';
    const periciaNome = args?.periciaNome ?? 'Atletismo';
    const atributoBase = args?.atributoBase ?? 'FOR';
    let eventoAtual = args?.eventoExistente ?? null;
    const acesso = {
      ehMestre,
      campanha: {
        donoId: 99,
        dono: { apelido: 'Mestre' },
        membros: [
          {
            usuarioId: 10,
            papel: 'JOGADOR',
            usuario: { apelido: 'Jogador' },
          },
        ],
      },
    };
    jest.spyOn(service as any, 'obterSessaoComAcesso').mockResolvedValue({
      acesso,
      sessao: { status: 'EM_ANDAMENTO' },
    });
    const validarMutabilidade = jest
      .spyOn(service as any, 'obterSessaoMutavelComAcesso')
      .mockResolvedValue({ acesso, sessao: { status: 'EM_ANDAMENTO' } });
    jest
      .spyOn(service as any, 'assertSessaoMutavelTx')
      .mockResolvedValue(undefined);

    const personagemCompleto = {
      personagemCampanhaId: 41,
      personagemCampanha: {
        id: 41,
        nome: 'Yuji',
        donoId,
        personagemBase: {
          agilidade: 1,
          forca: 2,
          intelecto: 3,
          presenca: 1,
          vigor: 2,
          pericias: [
            {
              grauTreinamento: 1,
              bonusExtra: 2,
              pericia: {
                codigo: periciaCodigo,
                nome: periciaNome,
                atributoBase,
              },
            },
          ],
          habilidadesBase: [
            {
              habilidade: {
                mecanicasEspeciais: {
                  periciasAtributoBase: { [periciaCodigo]: 'INT' },
                },
              },
            },
          ],
          poderesGenericos: [],
        },
        modificadores: [
          {
            campo: 'PERICIA_TREINAMENTO',
            valor: 1,
            periciaCodigo,
            tipoGrauCodigo: null,
          },
        ],
      },
    };
    (prisma as any).personagemSessao = {
      findFirst: jest
        .fn()
        .mockResolvedValueOnce({
          personagemCampanhaId: 41,
          personagemCampanha: { donoId },
        })
        .mockResolvedValue(personagemCompleto),
    };
    (prisma as any).personagemCampanha = {
      findFirst: jest.fn().mockResolvedValue({ id: 41 }),
    };
    (prisma as any).pericia = {
      findUnique: jest.fn().mockResolvedValue({
        codigo: periciaCodigo,
        nome: periciaNome,
        atributoBase,
      }),
    };
    (prisma as any).inventarioItemCampanha = {
      findMany: jest.fn().mockResolvedValue([
        {
          personagemCampanhaId: 41,
          quantidade: 1,
          estado: {},
          equipamento: {
            codigo: 'KIT_ATLETISMO',
            periciaBonificada: periciaCodigo,
            bonusPericia: 2,
          },
          modificacoes: [],
        },
      ]),
    };
    const criarEvento = jest.fn().mockImplementation((input) => {
      if (args?.erroCriarEvento) {
        eventoAtual = args.eventoVencedorAposErro ?? null;
        return Promise.reject(args.erroCriarEvento);
      }
      const evento = criarEventoRolagemPericiaTeste(input.data.dados, donoId);
      if (args?.persistirEventoCriado) eventoAtual = evento;
      return Promise.resolve(evento);
    });
    (prisma as any).eventoSessao = {
      findFirst: jest
        .fn()
        .mockImplementation(() => Promise.resolve(eventoAtual)),
      findMany: jest.fn().mockResolvedValue([]),
      create: criarEvento,
    };
    (prisma as any).$queryRaw = jest.fn().mockResolvedValue([{ id: 41 }]);
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) =>
        callback(prisma),
    );
    const consumirPerito = jest
      .spyOn(service as any, 'consumirPeritoAutoritativoTx')
      .mockResolvedValue({ bonusDado: null, ajustes: [] });
    const resolverInspiracao = jest
      .spyOn(service as any, 'resolverInspiracaoAutoritativaTx')
      .mockResolvedValue(null);
    const resolverEscalada = jest
      .spyOn(service as any, 'resolverEscaladaAtaqueAutoritativaTx')
      .mockResolvedValue({
        bonus: args?.bonusEscalada ?? 0,
        ajustes:
          (args?.bonusEscalada ?? 0) > 0
            ? [
                {
                  tipo: 'ESCALADA_DADOS',
                  valor: args?.bonusEscalada,
                  descricao: `Escalada de Dados +${args?.bonusEscalada}`,
                },
              ]
            : [],
      });

    return {
      criarEvento,
      consumirPerito,
      resolverInspiracao,
      resolverEscalada,
      validarMutabilidade,
    };
  }

  function configurarRolagemHabilidadeAutoritativa(args?: {
    ehMestre?: boolean;
    donoId?: number;
    persistirEventoCriado?: boolean;
    habilidade?: Record<string, unknown>;
    erroCriarEvento?: Error;
    eventoVencedorAposErro?: ReturnType<typeof criarEventoRolagemPericiaTeste>;
  }) {
    const donoId = args?.donoId ?? 10;
    const acesso = {
      ehMestre: args?.ehMestre ?? false,
      campanha: {
        donoId: 99,
        dono: { apelido: 'Mestre' },
        membros: [
          {
            usuarioId: 10,
            papel: 'JOGADOR',
            usuario: { apelido: 'Jogador' },
          },
        ],
      },
    };
    jest.spyOn(service as any, 'obterSessaoComAcesso').mockResolvedValue({
      acesso,
      sessao: { status: 'EM_ANDAMENTO' },
    });
    const validarMutabilidade = jest
      .spyOn(service as any, 'obterSessaoMutavelComAcesso')
      .mockResolvedValue({ acesso, sessao: { status: 'EM_ANDAMENTO' } });
    jest
      .spyOn(service as any, 'assertSessaoMutavelTx')
      .mockResolvedValue(undefined);

    (prisma as any).personagemSessao = {
      findFirst: jest.fn().mockResolvedValue({
        personagemCampanhaId: 41,
        personagemCampanha: { donoId },
      }),
    };
    (prisma as any).personagemCampanha = {
      findFirst: jest.fn().mockResolvedValue({ id: 41 }),
    };
    const habilidade = {
      id: 501,
      tecnicaId: 401,
      nome: 'Punho Divergente',
      testesExigidos: ['Luta com Jujutsu'],
      criticoValor: 19,
      criticoMultiplicador: 2,
      dadosDano: [{ quantidade: 2, dado: 'd8', tipo: 'IMPACTO' }],
      danoFlat: 3,
      danoFlatTipo: 'IMPACTO',
      escalonaPorGrau: true,
      acumulosMaximos: 4,
      escalonamentoDano: {
        quantidade: 1,
        dado: 'd8',
        tipo: 'IMPACTO',
      },
      variacoes: [
        {
          id: 601,
          nome: 'Liberação Superior',
          criticoValor: 18,
          criticoMultiplicador: 3,
          dadosDano: [{ quantidade: 3, dado: 'd10', tipo: 'ENERGIA' }],
          danoFlat: 5,
          danoFlatTipo: 'ENERGIA',
          escalonaPorGrau: true,
          acumulosMaximos: 4,
          escalonamentoDano: {
            quantidade: 1,
            dado: 'd10',
            tipo: 'ENERGIA',
          },
        },
      ],
      ...(args?.habilidade ?? {}),
    };
    const resolverFonte = jest
      .spyOn(service as any, 'resolverFonteHabilidadeAutoritativaTx')
      .mockResolvedValue({
        personagemCampanhaId: 41,
        personagemNome: 'Yuji',
        donoId,
        tecnica: { id: 401, nome: 'Divergência' },
        habilidade,
        grausMap: new Map([['TECNICA_AMALDICOADA', 4]]),
      });
    const resolverTeste = jest
      .spyOn(service as any, 'resolverTesteHabilidadeAutoritativoTx')
      .mockResolvedValue({
        periciasCodigos: ['LUTA', 'JUJUTSU'],
        periciaNome: 'Luta com Jujutsu',
        expressao: {
          quantidade: 2,
          faces: 20,
          modificador: 8,
          operador: '+',
          aplicarModificadorPorDado: false,
          keepMode: 'HIGHEST',
          label: 'Yuji · Punho Divergente',
        },
      });
    let eventoAtual: ReturnType<typeof criarEventoRolagemPericiaTeste> | null =
      null;
    const criarEvento = jest.fn().mockImplementation((input) => {
      if (args?.erroCriarEvento) {
        eventoAtual = args.eventoVencedorAposErro ?? null;
        return Promise.reject(args.erroCriarEvento);
      }
      const evento = criarEventoRolagemPericiaTeste(input.data.dados, donoId);
      if (args?.persistirEventoCriado) eventoAtual = evento;
      return Promise.resolve(evento);
    });
    (prisma as any).eventoSessao = {
      findFirst: jest
        .fn()
        .mockImplementation(() => Promise.resolve(eventoAtual)),
      findMany: jest.fn().mockResolvedValue([]),
      create: criarEvento,
    };
    (prisma as any).$queryRaw = jest.fn().mockResolvedValue([{ id: 41 }]);
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) =>
        callback(prisma),
    );
    const consumirPerito = jest.spyOn(
      service as any,
      'consumirPeritoAutoritativoTx',
    );
    const resolverInspiracao = jest.spyOn(
      service as any,
      'resolverInspiracaoAutoritativaTx',
    );
    const resolverEscalada = jest.spyOn(
      service as any,
      'resolverEscaladaAtaqueAutoritativaTx',
    );

    return {
      criarEvento,
      resolverFonte,
      resolverTeste,
      consumirPerito,
      resolverInspiracao,
      resolverEscalada,
      validarMutabilidade,
    };
  }

  function configurarRolagemNpcAutoritativa(args?: {
    ehMestre?: boolean;
    ocultoJogadores?: boolean;
    persistirEventoCriado?: boolean;
    periciasEspeciais?: Prisma.JsonValue;
    entidadeVinculadaId?: number | null;
    npcAmeacaId?: number | null;
    acoesGuia?: Prisma.JsonValue;
  }) {
    const acesso = {
      ehMestre: args?.ehMestre ?? true,
      campanha: {
        donoId: 99,
        dono: { apelido: 'Mestre' },
        membros: [
          {
            usuarioId: 10,
            papel: 'JOGADOR',
            usuario: { apelido: 'Jogador' },
          },
        ],
      },
    };
    jest.spyOn(service as any, 'obterSessaoComAcesso').mockResolvedValue({
      acesso,
      sessao: { status: 'EM_ANDAMENTO' },
    });
    const validarMutabilidade = jest
      .spyOn(service as any, 'obterSessaoMutavelComAcesso')
      .mockResolvedValue({ acesso, sessao: { status: 'EM_ANDAMENTO' } });
    jest
      .spyOn(service as any, 'assertSessaoMutavelTx')
      .mockResolvedValue(undefined);

    let eventoAtual: ReturnType<typeof criarEventoRolagemPericiaTeste> | null =
      null;
    const npc = {
      id: 71,
      nomeExibicao: 'Maldição de teste',
      npcAmeacaId: args?.npcAmeacaId === undefined ? 81 : args.npcAmeacaId,
      entidadeVinculadaId: args?.entidadeVinculadaId ?? null,
      ocultoJogadores: args?.ocultoJogadores ?? false,
      agilidade: 2,
      forca: 3,
      intelecto: 1,
      presenca: 2,
      vigor: 2,
      percepcao: 8,
      iniciativa: 7,
      fortitude: 6,
      reflexos: 5,
      vontade: 4,
      luta: 10,
      jujutsu: 9,
      acoesGuia: args?.acoesGuia ?? [
        {
          nome: 'Garra',
          teste: '2d20+10',
          dano: '9d100+999',
        },
      ],
      npcAmeaca: {
        agilidade: 2,
        forca: 3,
        intelecto: 1,
        presenca: 2,
        vigor: 2,
        percepcao: 8,
        iniciativa: 7,
        fortitude: 6,
        reflexos: 5,
        vontade: 4,
        luta: 10,
        jujutsu: 9,
        percepcaoDados: 2,
        iniciativaDados: 2,
        fortitudeDados: 2,
        reflexosDados: 2,
        vontadeDados: 2,
        lutaDados: 3,
        jujutsuDados: 1,
        periciasEspeciais: args?.periciasEspeciais ?? [],
      },
      entidadeVinculada:
        args?.entidadeVinculadaId == null
          ? null
          : { periciasEspeciais: args.periciasEspeciais ?? [] },
    };
    (prisma as any).npcAmeacaSessao = {
      findFirst: jest.fn().mockResolvedValue(npc),
    };
    (prisma as any).pericia = {
      findUnique: jest
        .fn()
        .mockImplementation(({ where }) =>
          Promise.resolve(
            where.codigo === 'PONTARIA'
              ? { nome: 'Pontaria', atributoBase: 'AGI' }
              : null,
          ),
        ),
    };
    const criarEvento = jest.fn().mockImplementation((input) => {
      const evento = {
        id: 96,
        criadoEm: new Date('2026-07-14T12:00:00.000Z'),
        dados: input.data.dados,
        personagemAtor: null,
      };
      if (args?.persistirEventoCriado) eventoAtual = evento as never;
      return Promise.resolve(evento);
    });
    (prisma as any).eventoSessao = {
      findFirst: jest
        .fn()
        .mockImplementation(() => Promise.resolve(eventoAtual)),
      findMany: jest.fn().mockResolvedValue([]),
      create: criarEvento,
    };
    (prisma as any).$queryRaw = jest.fn().mockResolvedValue([{ id: 71 }]);
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) =>
        callback(prisma),
    );

    return { criarEvento, validarMutabilidade };
  }

  it('resolve no servidor a pericia principal do NPC', async () => {
    const mocks = configurarRolagemNpcAutoritativa();

    const resultado = await service.criarRolagemSessao(7, 21, 99, {
      tipo: 'PERICIA_NPC',
      npcSessaoId: 71,
      periciaCodigo: 'percepcao',
      clientRequestId: '299b5238-7f29-48a4-983e-d43ea06cf792',
    });

    expect(resultado).toMatchObject({
      criadoAgora: true,
      dadosRolagem: {
        origem: 'SERVIDOR',
        tipo: 'PERICIA_NPC',
        npcSessaoId: 71,
        npcAmeacaId: 81,
        periciaCodigo: 'PERCEPCAO',
        bonusBase: 8,
      },
      contextoRolagem: {
        tipo: 'PERICIA',
        alvoTipo: 'NPC',
        npcSessaoId: 71,
      },
    });
    const dados = mocks.criarEvento.mock.calls[0][0].data.dados;
    expect(dados.dadosRolagem.payloads[0]).toMatchObject({
      quantidade: 2,
      faces: 20,
      modificador: 8,
    });
    expect(dados.ajustesAplicados).toEqual([]);
    expect(dados.inspiracaoAutomatica).toBeNull();
  });

  it('usa somente o teste persistido da acao e oculta a rolagem do NPC oculto', async () => {
    const mocks = configurarRolagemNpcAutoritativa({ ocultoJogadores: true });

    const resultado = await service.criarRolagemSessao(7, 21, 99, {
      tipo: 'ATAQUE_NPC',
      origemAtaque: 'ACAO',
      npcSessaoId: 71,
      acaoIndice: 0,
      visibilidade: 'PUBLICA',
      contexto: { dt: 25 },
      clientRequestId: '869f390e-8b10-4de7-b7db-f3b97bcb2375',
    });

    expect(resultado).toMatchObject({
      visibilidade: 'SECRETA_MESTRE',
      dadosRolagem: {
        tipo: 'ATAQUE_NPC',
        origemAtaque: 'ACAO',
        acaoIndice: 0,
        acaoNome: 'Garra',
        periciaCodigo: null,
      },
    });
    const dados = mocks.criarEvento.mock.calls[0][0].data.dados;
    expect(dados.dadosRolagem.payloads[0]).toMatchObject({
      quantidade: 2,
      faces: 20,
      modificador: 10,
    });
    expect(JSON.stringify(dados.dadosRolagem)).not.toContain('9d100');
  });

  it('rola dano persistido da acao sem alterar recursos ou aplicar ajustes', async () => {
    const mocks = configurarRolagemNpcAutoritativa({
      ocultoJogadores: true,
      acoesGuia: [
        {
          nome: 'Garra',
          teste: '2d20+10',
          dano: '3+2d8 corte',
        },
      ],
    });
    const resolverEscalada = jest.spyOn(
      service as any,
      'resolverEscaladaAtaqueAutoritativaTx',
    );
    const consumirPerito = jest.spyOn(
      service as any,
      'consumirPeritoAutoritativoTx',
    );
    const resolverInspiracao = jest.spyOn(
      service as any,
      'resolverInspiracaoAutoritativaTx',
    );

    const resultado = await service.criarRolagemSessao(7, 21, 99, {
      tipo: 'DANO_NPC',
      origemDano: 'ACAO',
      npcSessaoId: 71,
      acaoIndice: 0,
      visibilidade: 'PUBLICA',
      clientRequestId: '61a379d8-6eaf-4e96-bd9c-bd3c244cb28b',
    });

    expect(resultado).toMatchObject({
      visibilidade: 'SECRETA_MESTRE',
      criadoAgora: true,
      dadosRolagem: {
        origem: 'SERVIDOR',
        tipo: 'DANO_NPC',
        npcSessaoId: 71,
        npcAmeacaId: 81,
        origemDano: 'ACAO',
        acaoIndice: 0,
        acaoNome: 'Garra',
        formulaResolvida: expect.stringContaining('2d8+3'),
        resultado: { total: expect.any(Number) },
      },
      contextoRolagem: {
        tipo: 'DANO',
        npcSessaoId: 71,
        origemDano: 'ACAO',
      },
    });
    const dados = mocks.criarEvento.mock.calls[0][0].data.dados;
    expect(dados.dadosRolagem.payloads[0]).toMatchObject({
      quantidade: 2,
      faces: 8,
      modificador: 3,
    });
    expect(dados.ajustesAplicados).toEqual([]);
    expect(dados.inspiracaoAutomatica).toBeNull();
    expect(resolverEscalada).not.toHaveBeenCalled();
    expect(consumirPerito).not.toHaveBeenCalled();
    expect(resolverInspiracao).not.toHaveBeenCalled();
    expect((prisma as any).personagemCampanha).toBeUndefined();
  });

  it.each([
    {
      acoesGuia: [],
      codigo: 'SESSAO_NPC_ACAO_NAO_ENCONTRADA',
    },
    {
      acoesGuia: [{ nome: 'Rugido' }],
      codigo: 'SESSAO_NPC_ACAO_SEM_DANO',
    },
    {
      acoesGuia: [{ nome: 'Rugido', dano: 'dano narrativo' }],
      codigo: 'SESSAO_NPC_ACAO_DANO_INVALIDO',
    },
  ])('rejeita fonte de dano de NPC invalida: $codigo', async (caso) => {
    const mocks = configurarRolagemNpcAutoritativa({
      acoesGuia: caso.acoesGuia,
    });

    await expect(
      service.criarRolagemSessao(7, 21, 99, {
        tipo: 'DANO_NPC',
        origemDano: 'ACAO',
        npcSessaoId: 71,
        acaoIndice: 0,
        clientRequestId: 'ac2f2a10-7c2a-40f3-9f79-20df2e4f0c7c',
      }),
    ).rejects.toMatchObject({ code: caso.codigo });
    expect(mocks.criarEvento).not.toHaveBeenCalled();
  });

  it('bloqueia jogador comum ao rolar dano de NPC', async () => {
    configurarRolagemNpcAutoritativa({ ehMestre: false });

    await expect(
      service.criarRolagemSessao(7, 21, 10, {
        tipo: 'DANO_NPC',
        origemDano: 'ACAO',
        npcSessaoId: 71,
        acaoIndice: 0,
        clientRequestId: '4949bfb3-1a44-4ef8-99ce-65a7c42504e8',
      }),
    ).rejects.toMatchObject({ code: 'CAMPANHA_APENAS_MESTRE' });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('bloqueia jogador comum inclusive para entidade vinculada', async () => {
    configurarRolagemNpcAutoritativa({
      ehMestre: false,
      entidadeVinculadaId: 101,
      npcAmeacaId: null,
    });

    await expect(
      service.criarRolagemSessao(7, 21, 10, {
        tipo: 'PERICIA_NPC',
        npcSessaoId: 71,
        periciaCodigo: 'LUTA',
        clientRequestId: '940f50a7-f7f0-4127-a884-03b28efccbc0',
      }),
    ).rejects.toMatchObject({ code: 'CAMPANHA_APENAS_MESTRE' });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('restringe ataque de NPC as pericias permitidas', async () => {
    const mocks = configurarRolagemNpcAutoritativa();

    await expect(
      service.criarRolagemSessao(7, 21, 99, {
        tipo: 'ATAQUE_NPC',
        origemAtaque: 'PERICIA',
        npcSessaoId: 71,
        periciaCodigo: 'PERCEPCAO',
        clientRequestId: '05f26d37-4261-4a6f-8aab-108fc35f9568',
      }),
    ).rejects.toMatchObject({ code: 'SESSAO_NPC_PERICIA_ATAQUE_INVALIDA' });
    expect(mocks.criarEvento).not.toHaveBeenCalled();
  });

  it('resolve pericia especial de entidade vinculada sem Escalada ou Perito', async () => {
    const mocks = configurarRolagemNpcAutoritativa({
      npcAmeacaId: null,
      entidadeVinculadaId: 101,
      periciasEspeciais: { pontaria: 12 },
    });
    const resolverEscalada = jest.spyOn(
      service as any,
      'resolverEscaladaAtaqueAutoritativaTx',
    );
    const consumirPerito = jest.spyOn(
      service as any,
      'consumirPeritoAutoritativoTx',
    );
    const resolverInspiracao = jest.spyOn(
      service as any,
      'resolverInspiracaoAutoritativaTx',
    );

    const resultado = await service.criarRolagemSessao(7, 21, 99, {
      tipo: 'ATAQUE_NPC',
      origemAtaque: 'PERICIA',
      npcSessaoId: 71,
      periciaCodigo: 'PONTARIA',
      contexto: { dt: 18 },
      clientRequestId: 'eaab85a8-581e-4c29-b62e-d9f0b7f5e51b',
    });

    expect(resultado).toMatchObject({
      dadosRolagem: {
        entidadeVinculadaId: 101,
        periciaCodigo: 'PONTARIA',
        bonusBase: 12,
        resultado: { dt: 18, falhaCritica: false },
      },
    });
    expect(mocks.criarEvento).toHaveBeenCalledTimes(1);
    expect(resolverEscalada).not.toHaveBeenCalled();
    expect(consumirPerito).not.toHaveBeenCalled();
    expect(resolverInspiracao).not.toHaveBeenCalled();
  });

  it('rejeita acao de NPC sem teste autoritativo valido', async () => {
    const mocks = configurarRolagemNpcAutoritativa();
    (prisma as any).npcAmeacaSessao.findFirst.mockResolvedValue({
      ...(await (prisma as any).npcAmeacaSessao.findFirst()),
      acoesGuia: [{ nome: 'Rugido', efeito: 'Assusta o alvo' }],
    });

    await expect(
      service.criarRolagemSessao(7, 21, 99, {
        tipo: 'ATAQUE_NPC',
        origemAtaque: 'ACAO',
        npcSessaoId: 71,
        acaoIndice: 0,
        clientRequestId: '2031ecf4-9fc0-43b0-aec9-f23cbb96633e',
      }),
    ).rejects.toMatchObject({ code: 'SESSAO_NPC_ACAO_ROLAGEM_INVALIDA' });
    expect(mocks.criarEvento).not.toHaveBeenCalled();
  });

  it('bloqueia rolagem de NPC com efeitos de turno pendentes', async () => {
    const mocks = configurarRolagemNpcAutoritativa();
    mocks.validarMutabilidade.mockRejectedValue(
      new SessaoEfeitosTurnoPendentesException(7, 21, 900),
    );

    await expect(
      service.criarRolagemSessao(7, 21, 99, {
        tipo: 'PERICIA_NPC',
        npcSessaoId: 71,
        periciaCodigo: 'LUTA',
        clientRequestId: '8ec85fe7-b030-48d8-8896-76e054f1e27b',
      }),
    ).rejects.toMatchObject({ code: 'SESSAO_EFEITOS_TURNO_PENDENTES' });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejeita reutilizar UUID de NPC com outra intencao', async () => {
    const mocks = configurarRolagemNpcAutoritativa({
      persistirEventoCriado: true,
    });
    const clientRequestId = '50ba8b1f-b791-472a-8211-7a40c695e16d';
    await service.criarRolagemSessao(7, 21, 99, {
      tipo: 'PERICIA_NPC',
      npcSessaoId: 71,
      periciaCodigo: 'LUTA',
      clientRequestId,
    });

    await expect(
      service.criarRolagemSessao(7, 21, 99, {
        tipo: 'PERICIA_NPC',
        npcSessaoId: 71,
        periciaCodigo: 'JUJUTSU',
        clientRequestId,
      }),
    ).rejects.toMatchObject({
      code: 'SESSAO_ROLAGEM_IDEMPOTENCIA_CONFLITO',
    });
    expect(mocks.criarEvento).toHaveBeenCalledTimes(1);
  });

  it('reutiliza rolagem de NPC sem rerrolar ou criar novo evento', async () => {
    const mocks = configurarRolagemNpcAutoritativa({
      persistirEventoCriado: true,
    });
    const dto = {
      tipo: 'ATAQUE_NPC' as const,
      origemAtaque: 'PERICIA' as const,
      npcSessaoId: 71,
      periciaCodigo: 'LUTA',
      clientRequestId: '9f286dd6-c716-4f3e-a746-3a1487745b7b',
    };

    const primeiro = await service.criarRolagemSessao(7, 21, 99, dto);
    const repetido = await service.criarRolagemSessao(7, 21, 99, dto);

    expect(repetido.id).toBe(primeiro.id);
    expect(repetido.criadoAgora).toBe(false);
    expect(mocks.criarEvento).toHaveBeenCalledTimes(1);
  });

  it('reutiliza dano de NPC sem rerrolar ou criar novo evento', async () => {
    const mocks = configurarRolagemNpcAutoritativa({
      persistirEventoCriado: true,
      acoesGuia: [{ nome: 'Garra', dano: '2d8+3' }],
    });
    const dto = {
      tipo: 'DANO_NPC' as const,
      origemDano: 'ACAO' as const,
      npcSessaoId: 71,
      acaoIndice: 0,
      clientRequestId: '40dd015a-09e2-40fb-a91f-eeac1aa94bc8',
    };

    const primeiro = await service.criarRolagemSessao(7, 21, 99, dto);
    const repetido = await service.criarRolagemSessao(7, 21, 99, dto);

    expect(repetido.id).toBe(primeiro.id);
    expect(repetido.criadoAgora).toBe(false);
    expect(mocks.criarEvento).toHaveBeenCalledTimes(1);
  });

  it('resolve teste composto de habilidade no servidor sem ajustes mecanicos', async () => {
    const mocks = configurarRolagemHabilidadeAutoritativa();

    const resultado = await service.criarRolagemSessao(7, 21, 10, {
      tipo: 'TESTE_HABILIDADE_PERSONAGEM',
      personagemSessaoId: 31,
      habilidadeTecnicaId: 501,
      clientRequestId: '524ad211-f941-48b1-a382-c331ed74c683',
    });

    expect(resultado).toMatchObject({
      criadoAgora: true,
      dadosRolagem: {
        origem: 'SERVIDOR',
        tipo: 'TESTE_HABILIDADE_PERSONAGEM',
        personagemSessaoId: 31,
        personagemCampanhaId: 41,
        tecnicaId: 401,
        habilidadeTecnicaId: 501,
        periciasCodigos: ['LUTA', 'JUJUTSU'],
        formulaResolvida: expect.stringContaining('2d20+8'),
        resultado: { total: expect.any(Number) },
      },
      contextoRolagem: {
        tipo: 'PERICIA',
        origem: 'HABILIDADE_TECNICA',
      },
    });
    expect(mocks.criarEvento).toHaveBeenCalledTimes(1);
    expect(mocks.resolverTeste).toHaveBeenCalledTimes(1);
    expect(mocks.consumirPerito).not.toHaveBeenCalled();
    expect(mocks.resolverInspiracao).not.toHaveBeenCalled();
    expect(mocks.resolverEscalada).not.toHaveBeenCalled();
  });

  it('calcula dano tipado de variacao e acumulos sem aplicar efeitos', async () => {
    const mocks = configurarRolagemHabilidadeAutoritativa();

    const resultado = await service.criarRolagemSessao(7, 21, 10, {
      tipo: 'DANO_PERSONAGEM',
      origemDano: 'HABILIDADE_TECNICA',
      personagemSessaoId: 31,
      habilidadeTecnicaId: 501,
      variacaoHabilidadeId: 601,
      acumulos: 3,
      clientRequestId: '06a375c1-fb84-4d98-99cc-ec00e0a5bef4',
    });

    expect(resultado).toMatchObject({
      criadoAgora: true,
      dadosRolagem: {
        origem: 'SERVIDOR',
        tipo: 'DANO_PERSONAGEM',
        origemDano: 'HABILIDADE_TECNICA',
        habilidadeTecnicaId: 501,
        variacaoHabilidadeId: 601,
        acumulosAplicados: 3,
        formulaResolvida: expect.stringContaining('5d10+5'),
        resultado: { total: expect.any(Number) },
      },
      contextoRolagem: {
        tipo: 'DANO',
        origemDano: 'HABILIDADE_TECNICA',
        variacaoHabilidadeId: 601,
        acumulosAplicados: 3,
      },
    });
    const dados = mocks.criarEvento.mock.calls[0][0].data.dados;
    expect(dados.dadosRolagem.payloads).toEqual([
      expect.objectContaining({
        quantidade: 5,
        faces: 10,
        modificador: 5,
        label: 'ENERGIA',
      }),
    ]);
    expect(dados.ajustesAplicados).toEqual([]);
    expect(dados.inspiracaoAutomatica).toBeNull();
    expect(mocks.consumirPerito).not.toHaveBeenCalled();
    expect(mocks.resolverInspiracao).not.toHaveBeenCalled();
    expect(mocks.resolverEscalada).not.toHaveBeenCalled();
  });

  it('calcula critico de variacao multiplicando apenas os dados', async () => {
    const mocks = configurarRolagemHabilidadeAutoritativa();

    const resultado = await service.criarRolagemSessao(7, 21, 10, {
      tipo: 'CRITICO_PERSONAGEM',
      origemCritico: 'HABILIDADE_TECNICA',
      personagemSessaoId: 31,
      habilidadeTecnicaId: 501,
      variacaoHabilidadeId: 601,
      acumulos: 3,
      clientRequestId: '87e9188e-74fd-465c-91c4-c18ca855cad8',
    });

    expect(resultado).toMatchObject({
      criadoAgora: true,
      dadosRolagem: {
        origem: 'SERVIDOR',
        tipo: 'CRITICO_PERSONAGEM',
        origemCritico: 'HABILIDADE_TECNICA',
        habilidadeTecnicaId: 501,
        variacaoHabilidadeId: 601,
        acumulosAplicados: 3,
        criticoMultiplicador: 3,
        formulaBase: expect.stringContaining('5d10+5'),
        formulaCritica: expect.stringContaining('15d10+5'),
        resultado: { total: expect.any(Number) },
      },
      contextoRolagem: {
        tipo: 'CRITICO',
        origemCritico: 'HABILIDADE_TECNICA',
        variacaoHabilidadeId: 601,
        acumulosAplicados: 3,
      },
    });
    const dados = mocks.criarEvento.mock.calls[0][0].data.dados;
    expect(dados.dadosRolagem.payloads).toEqual([
      expect.objectContaining({
        quantidade: 15,
        faces: 10,
        modificador: 5,
        label: 'ENERGIA (Critico x3)',
      }),
    ]);
    expect(dados.ajustesAplicados).toEqual([]);
    expect(dados.inspiracaoAutomatica).toBeNull();
    expect(mocks.consumirPerito).not.toHaveBeenCalled();
    expect(mocks.resolverInspiracao).not.toHaveBeenCalled();
    expect(mocks.resolverEscalada).not.toHaveBeenCalled();
  });

  it('reutiliza critico sem rerrolar ou criar evento duplicado', async () => {
    const mocks = configurarRolagemHabilidadeAutoritativa({
      persistirEventoCriado: true,
    });
    const dto = {
      tipo: 'CRITICO_PERSONAGEM' as const,
      origemCritico: 'HABILIDADE_TECNICA' as const,
      personagemSessaoId: 31,
      habilidadeTecnicaId: 501,
      acumulos: 2,
      clientRequestId: 'bc6c2c72-b9ea-4cf7-aab5-12a039155a97',
    };

    const primeiro = await service.criarRolagemSessao(7, 21, 10, dto);
    const repetido = await service.criarRolagemSessao(7, 21, 10, dto);

    expect(repetido.id).toBe(primeiro.id);
    expect(repetido.criadoAgora).toBe(false);
    expect(mocks.criarEvento).toHaveBeenCalledTimes(1);
    expect(mocks.resolverFonte).toHaveBeenCalledTimes(1);
  });

  it('reutiliza critico quando o banco reordena as chaves da intencao', async () => {
    const clientRequestId = '70a7ee7a-5d23-4aaa-a421-9cb69cd95673';
    const eventoPersistido = criarEventoRolagemPericiaTeste({
      mensagem: 'resultado critico persistido',
      visibilidade: 'PUBLICA',
      intencaoAutoritativa: {
        tipo: 'CRITICO_PERSONAGEM',
        acumulos: null,
        origemDano: null,
        visibilidade: 'PUBLICA',
        origemCritico: 'HABILIDADE_TECNICA',
        personagemSessaoId: 31,
        habilidadeTecnicaId: 501,
        variacaoHabilidadeId: null,
      },
      dadosRolagem: {
        origem: 'SERVIDOR',
        tipo: 'CRITICO_PERSONAGEM',
        clientRequestId,
      },
    });
    const mocks = configurarRolagemHabilidadeAutoritativa();
    (prisma as any).eventoSessao.findFirst.mockResolvedValue(eventoPersistido);

    await expect(
      service.criarRolagemSessao(7, 21, 10, {
        tipo: 'CRITICO_PERSONAGEM',
        origemCritico: 'HABILIDADE_TECNICA',
        personagemSessaoId: 31,
        habilidadeTecnicaId: 501,
        clientRequestId,
      }),
    ).resolves.toMatchObject({
      id: eventoPersistido.id,
      criadoAgora: false,
    });
    expect(mocks.criarEvento).not.toHaveBeenCalled();
    expect(mocks.resolverFonte).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('repete critico quando Prisma sinaliza conflito P2034', async () => {
    configurarRolagemHabilidadeAutoritativa();
    const executarTransacao = prisma.$transaction.getMockImplementation();
    const erroP2034 = new Prisma.PrismaClientKnownRequestError(
      'Conflito de escrita',
      { code: 'P2034', clientVersion: 'test' },
    );
    prisma.$transaction
      .mockRejectedValueOnce(erroP2034)
      .mockImplementation(executarTransacao);

    await expect(
      service.criarRolagemSessao(7, 21, 10, {
        tipo: 'CRITICO_PERSONAGEM',
        origemCritico: 'HABILIDADE_TECNICA',
        personagemSessaoId: 31,
        habilidadeTecnicaId: 501,
        clientRequestId: 'f262552d-9392-45f2-9b7f-0a135d02e728',
      }),
    ).resolves.toMatchObject({ criadoAgora: true });
    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
  });

  it('converge para o critico vencedor quando o insert perde a corrida unica', async () => {
    const clientRequestId = '770965b4-2c32-4ce4-a751-81c644776db4';
    const vencedor = criarEventoRolagemPericiaTeste({
      mensagem: 'resultado critico vencedor',
      visibilidade: 'PUBLICA',
      intencaoAutoritativa: {
        tipo: 'CRITICO_PERSONAGEM',
        origemDano: null,
        origemCritico: 'HABILIDADE_TECNICA',
        personagemSessaoId: 31,
        habilidadeTecnicaId: 501,
        variacaoHabilidadeId: null,
        acumulos: null,
        visibilidade: 'PUBLICA',
      },
      dadosRolagem: {
        versao: 1,
        origem: 'SERVIDOR',
        tipo: 'CRITICO_PERSONAGEM',
        origemCritico: 'HABILIDADE_TECNICA',
        clientRequestId,
        personagemSessaoId: 31,
        personagemCampanhaId: 41,
        habilidadeTecnicaId: 501,
        variacaoHabilidadeId: null,
        acumulosAplicados: null,
        criticoMultiplicador: 2,
        formulaBase: '2d8+3',
        formulaCritica: '4d8+3',
        formulaResolvida: '4d8+3',
        formulasResolvidas: ['4d8+3'],
        payloads: [],
        resultado: { total: 19 },
      },
    });
    const erroP2002 = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: 'test',
        meta: {
          target: ['sessaoId', 'solicitanteUsuarioId', 'clientRequestId'],
        },
      },
    );
    const mocks = configurarRolagemHabilidadeAutoritativa({
      erroCriarEvento: erroP2002,
      eventoVencedorAposErro: vencedor,
    });

    await expect(
      service.criarRolagemSessao(7, 21, 10, {
        tipo: 'CRITICO_PERSONAGEM',
        origemCritico: 'HABILIDADE_TECNICA',
        personagemSessaoId: 31,
        habilidadeTecnicaId: 501,
        clientRequestId,
      }),
    ).resolves.toMatchObject({
      id: vencedor.id,
      mensagem: 'resultado critico vencedor',
      criadoAgora: false,
    });
    expect(mocks.criarEvento).toHaveBeenCalledTimes(1);
  });

  it.each([
    [new SessaoEncerradaException(7, 21, 'rolar critico'), 'SESSAO_ENCERRADA'],
    [
      new SessaoEfeitosTurnoPendentesException(7, 21, 900),
      'SESSAO_EFEITOS_TURNO_PENDENTES',
    ],
  ])(
    'bloqueia critico quando a sessao nao esta mutavel: %s',
    async (erro, code) => {
      const mocks = configurarRolagemHabilidadeAutoritativa();
      mocks.validarMutabilidade.mockRejectedValueOnce(erro);

      await expect(
        service.criarRolagemSessao(7, 21, 10, {
          tipo: 'CRITICO_PERSONAGEM',
          origemCritico: 'HABILIDADE_TECNICA',
          personagemSessaoId: 31,
          habilidadeTecnicaId: 501,
          clientRequestId: '2745da0d-54ee-472f-a695-7b33d4bcd633',
        }),
      ).rejects.toMatchObject({ code });
      expect(mocks.criarEvento).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    },
  );

  it('rejeita critico quando a habilidade nao possui dano estruturado', async () => {
    const mocks = configurarRolagemHabilidadeAutoritativa({
      habilidade: {
        dadosDano: [],
        danoFlat: null,
        escalonamentoDano: null,
      },
    });

    await expect(
      service.criarRolagemSessao(7, 21, 10, {
        tipo: 'CRITICO_PERSONAGEM',
        origemCritico: 'HABILIDADE_TECNICA',
        personagemSessaoId: 31,
        habilidadeTecnicaId: 501,
        clientRequestId: 'f9e650c1-550b-472b-9780-2701c5819076',
      }),
    ).rejects.toMatchObject({ code: 'SESSAO_ROLAGEM_INVALIDA' });
    expect(mocks.criarEvento).not.toHaveBeenCalled();
  });

  it('rola dano base sem exigir acumulo em habilidade nao escalonavel', async () => {
    const mocks = configurarRolagemHabilidadeAutoritativa({
      habilidade: {
        escalonaPorGrau: false,
        acumulosMaximos: 0,
        escalonamentoDano: null,
      },
    });

    await expect(
      service.criarRolagemSessao(7, 21, 10, {
        tipo: 'DANO_PERSONAGEM',
        origemDano: 'HABILIDADE_TECNICA',
        personagemSessaoId: 31,
        habilidadeTecnicaId: 501,
        clientRequestId: '51942ba0-d29b-4661-936d-7f7ad1a09430',
      }),
    ).resolves.toMatchObject({
      dadosRolagem: {
        tipo: 'DANO_PERSONAGEM',
        acumulosAplicados: 0,
      },
    });
    expect(mocks.criarEvento).toHaveBeenCalledTimes(1);
  });

  it('reutiliza rolagem de habilidade sem rerrolar ou criar evento duplicado', async () => {
    const mocks = configurarRolagemHabilidadeAutoritativa({
      persistirEventoCriado: true,
    });
    const dto = {
      tipo: 'DANO_PERSONAGEM' as const,
      origemDano: 'HABILIDADE_TECNICA' as const,
      personagemSessaoId: 31,
      habilidadeTecnicaId: 501,
      acumulos: 2,
      clientRequestId: '1c638b86-cc73-4575-94bd-cb676f6804ca',
    };

    const primeiro = await service.criarRolagemSessao(7, 21, 10, dto);
    const repetido = await service.criarRolagemSessao(7, 21, 10, dto);

    expect(repetido.id).toBe(primeiro.id);
    expect(repetido.criadoAgora).toBe(false);
    expect(mocks.criarEvento).toHaveBeenCalledTimes(1);
    expect(mocks.resolverFonte).toHaveBeenCalledTimes(1);
  });

  it('rejeita reutilizar UUID de habilidade com outra intencao', async () => {
    const mocks = configurarRolagemHabilidadeAutoritativa({
      persistirEventoCriado: true,
    });
    const clientRequestId = '2af72b58-cbb0-4da5-a128-050a28e931f8';
    await service.criarRolagemSessao(7, 21, 10, {
      tipo: 'TESTE_HABILIDADE_PERSONAGEM',
      personagemSessaoId: 31,
      habilidadeTecnicaId: 501,
      clientRequestId,
    });

    await expect(
      service.criarRolagemSessao(7, 21, 10, {
        tipo: 'DANO_PERSONAGEM',
        origemDano: 'HABILIDADE_TECNICA',
        personagemSessaoId: 31,
        habilidadeTecnicaId: 501,
        clientRequestId,
      }),
    ).rejects.toMatchObject({
      code: 'SESSAO_ROLAGEM_IDEMPOTENCIA_CONFLITO',
    });
    expect(mocks.criarEvento).toHaveBeenCalledTimes(1);
  });

  it('bloqueia jogador tentando rolar habilidade de outro personagem', async () => {
    const mocks = configurarRolagemHabilidadeAutoritativa({ donoId: 11 });

    await expect(
      service.criarRolagemSessao(7, 21, 10, {
        tipo: 'TESTE_HABILIDADE_PERSONAGEM',
        personagemSessaoId: 31,
        habilidadeTecnicaId: 501,
        clientRequestId: '8df8d89b-8bfb-4ecf-b9ee-272460ea49cc',
      }),
    ).rejects.toMatchObject({ code: 'CAMPANHA_PERSONAGEM_EDICAO_NEGADA' });
    expect(mocks.criarEvento).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('permite ao mestre rolar habilidade de qualquer personagem', async () => {
    const mocks = configurarRolagemHabilidadeAutoritativa({
      ehMestre: true,
      donoId: 11,
    });

    await expect(
      service.criarRolagemSessao(7, 21, 99, {
        tipo: 'TESTE_HABILIDADE_PERSONAGEM',
        personagemSessaoId: 31,
        habilidadeTecnicaId: 501,
        visibilidade: 'SECRETA_MESTRE',
        clientRequestId: '671c447c-2b35-47c7-af6b-2a03698dadbf',
      }),
    ).resolves.toMatchObject({
      criadoAgora: true,
      visibilidade: 'SECRETA_MESTRE',
    });
    expect(mocks.criarEvento).toHaveBeenCalledTimes(1);
  });

  it('rejeita variacao ausente, dano invalido e acumulos acima do limite', async () => {
    const variacao = configurarRolagemHabilidadeAutoritativa();
    await expect(
      service.criarRolagemSessao(7, 21, 10, {
        tipo: 'DANO_PERSONAGEM',
        origemDano: 'HABILIDADE_TECNICA',
        personagemSessaoId: 31,
        habilidadeTecnicaId: 501,
        variacaoHabilidadeId: 999,
        clientRequestId: 'ea653a4e-c317-44e9-8e40-7c808281a83a',
      }),
    ).rejects.toMatchObject({
      code: 'SESSAO_VARIACAO_HABILIDADE_NOT_FOUND',
    });
    expect(variacao.criarEvento).not.toHaveBeenCalled();

    jest.restoreAllMocks();
    const semDano = configurarRolagemHabilidadeAutoritativa({
      habilidade: {
        dadosDano: [],
        danoFlat: null,
        escalonamentoDano: null,
      },
    });
    await expect(
      service.criarRolagemSessao(7, 21, 10, {
        tipo: 'DANO_PERSONAGEM',
        origemDano: 'HABILIDADE_TECNICA',
        personagemSessaoId: 31,
        habilidadeTecnicaId: 501,
        clientRequestId: '66a136ab-9864-4617-b92d-c63d4989ec31',
      }),
    ).rejects.toMatchObject({ code: 'SESSAO_ROLAGEM_INVALIDA' });
    expect(semDano.criarEvento).not.toHaveBeenCalled();

    jest.restoreAllMocks();
    const acumulos = configurarRolagemHabilidadeAutoritativa();
    await expect(
      service.criarRolagemSessao(7, 21, 10, {
        tipo: 'DANO_PERSONAGEM',
        origemDano: 'HABILIDADE_TECNICA',
        personagemSessaoId: 31,
        habilidadeTecnicaId: 501,
        acumulos: 5,
        clientRequestId: 'ef5ead42-dafd-4af2-b05d-f0fe35fb5ffd',
      }),
    ).rejects.toMatchObject({ code: 'SESSAO_ACUMULO_EXCEDE_GRAU' });
    expect(acumulos.criarEvento).not.toHaveBeenCalled();
  });

  it('gera e persiste rolagem autoritativa sem aceitar resultados do cliente', async () => {
    configurarRolagemAutoritativa();

    const resultado = await service.criarRolagemFormulaSessao(7, 21, 10, {
      tipo: 'FORMULA',
      expressao: 'ataque:2d6+3',
      clientRequestId: '9c871c5a-c103-4ab1-86d9-b7cdb20c5d77',
    });

    expect(resultado.mensagem).toContain('[[dice:v3|');
    expect(resultado.dadosRolagem).toMatchObject({
      versao: 1,
      origem: 'SERVIDOR',
      clientRequestId: '9c871c5a-c103-4ab1-86d9-b7cdb20c5d77',
      expressaoOriginal: 'ataque:2d6+3',
    });
    const payload = (resultado.dadosRolagem as any).payloads[0];
    expect(payload.rolagens).toHaveLength(2);
    expect(
      payload.rolagens.every((valor: number) => valor >= 1 && valor <= 6),
    ).toBe(true);
    expect((prisma as any).eventoSessao.create).toHaveBeenCalledTimes(1);
  });

  it('mantem Perito pendente em formula narrativa com d20', async () => {
    configurarRolagemAutoritativa({ peritoPendente: true });

    const resultado = await service.criarRolagemFormulaSessao(7, 21, 10, {
      tipo: 'FORMULA',
      expressao: '2d20',
      clientRequestId: '9c871c5a-c103-4ab1-86d9-b7cdb20c5d77',
    });

    expect(resultado).toMatchObject({
      criadoAgora: true,
      dadosRolagem: { origem: 'SERVIDOR' },
    });
    expect((prisma as any).eventoSessao.create).toHaveBeenCalledTimes(1);
    expect(
      (prisma as any).sessaoRegraOpcional.findUnique,
    ).not.toHaveBeenCalled();
  });

  it('reutiliza FORMULA com o mesmo UUID sem rerrolar ou criar evento', async () => {
    const mocks = configurarRolagemAutoritativa({
      persistirEventoCriado: true,
    });
    const dto = {
      tipo: 'FORMULA' as const,
      expressao: '2d6+3',
      clientRequestId: 'ac7b8b6e-cf0a-48e2-81cf-b34701754f4f',
    };

    const primeira = await service.criarRolagemFormulaSessao(7, 21, 10, dto);
    const repetida = await service.criarRolagemFormulaSessao(7, 21, 10, dto);

    expect(repetida.id).toBe(primeira.id);
    expect(repetida.criadoAgora).toBe(false);
    expect(mocks.criarEvento).toHaveBeenCalledTimes(1);
  });

  it('resolve no servidor a pericia efetiva do personagem controlado', async () => {
    const mocks = configurarRolagemPericiaAutoritativa();

    const resultado = await service.criarRolagemSessao(7, 21, 10, {
      tipo: 'PERICIA_PERSONAGEM',
      personagemSessaoId: 31,
      periciaCodigo: 'atletismo',
      clientRequestId: '9c871c5a-c103-4ab1-86d9-b7cdb20c5d78',
    });

    expect(resultado).toMatchObject({
      criadoAgora: true,
      dadosRolagem: {
        origem: 'SERVIDOR',
        tipo: 'PERICIA_PERSONAGEM',
        personagemSessaoId: 31,
        personagemCampanhaId: 41,
        periciaCodigo: 'ATLETISMO',
      },
    });
    const dadosCriados = mocks.criarEvento.mock.calls[0][0].data.dados;
    const payload = dadosCriados.dadosRolagem.payloads[0];
    expect(payload).toMatchObject({
      quantidade: 3,
      faces: 20,
      modificador: 14,
      keepMode: 'HIGHEST',
    });
    expect(payload.rolagens).toHaveLength(3);
    expect(dadosCriados).toMatchObject({
      autorUsuarioId: 10,
      contextoRolagem: {
        tipo: 'PERICIA',
        personagemSessaoId: 31,
        personagemCampanhaId: 41,
        periciaCodigo: 'ATLETISMO',
      },
    });
    expect(mocks.consumirPerito).toHaveBeenCalledWith(
      prisma,
      21,
      31,
      41,
      'ATLETISMO',
      2,
    );
  });

  it('resolve ataque de personagem com Escalada sem consumir Perito', async () => {
    const mocks = configurarRolagemPericiaAutoritativa({
      periciaCodigo: 'LUTA',
      periciaNome: 'Luta',
      bonusEscalada: 3,
    });

    const resultado = await service.criarRolagemSessao(7, 21, 10, {
      tipo: 'ATAQUE_PERSONAGEM',
      personagemSessaoId: 31,
      periciaCodigo: 'luta',
      contexto: { dt: 30 },
      clientRequestId: '16e0afb1-0d86-4f7d-b05a-930dd508c5aa',
    });

    expect(resultado).toMatchObject({
      criadoAgora: true,
      dadosRolagem: {
        origem: 'SERVIDOR',
        tipo: 'ATAQUE_PERSONAGEM',
        periciaCodigo: 'LUTA',
        bonusBase: 14,
        bonusEscalada: 3,
      },
      contextoRolagem: {
        tipo: 'ATAQUE',
        periciaCodigo: 'LUTA',
        dt: 30,
      },
      ajustesAplicados: [
        expect.objectContaining({ tipo: 'ESCALADA_DADOS', valor: 3 }),
      ],
    });
    const payload =
      mocks.criarEvento.mock.calls[0][0].data.dados.dadosRolagem.payloads[0];
    expect(payload.modificador).toBe(17);
    expect(mocks.consumirPerito).not.toHaveBeenCalled();
    expect(mocks.resolverInspiracao).toHaveBeenCalledWith(
      prisma,
      21,
      41,
      30,
      expect.any(Object),
      expect.any(Number),
    );
  });

  it.each(['LUTA', 'PONTARIA', 'JUJUTSU'])(
    'aceita %s como pericia de ataque de personagem',
    async (periciaCodigo) => {
      configurarRolagemPericiaAutoritativa({ periciaCodigo });

      await expect(
        service.criarRolagemSessao(7, 21, 10, {
          tipo: 'ATAQUE_PERSONAGEM',
          personagemSessaoId: 31,
          periciaCodigo,
          clientRequestId: '84f3fd4a-cac5-47d2-82b1-2f829a5bbf31',
        }),
      ).resolves.toMatchObject({ criadoAgora: true });
    },
  );

  it('rejeita pericia incompatível com ataque de personagem', async () => {
    const mocks = configurarRolagemPericiaAutoritativa();

    await expect(
      service.criarRolagemSessao(7, 21, 10, {
        tipo: 'ATAQUE_PERSONAGEM',
        personagemSessaoId: 31,
        periciaCodigo: 'ATLETISMO',
        clientRequestId: 'b833f3c1-e0ed-45eb-b299-4ed6a1303dd8',
      }),
    ).rejects.toMatchObject({ code: 'SESSAO_PERICIA_ATAQUE_INVALIDA' });
    expect(mocks.criarEvento).not.toHaveBeenCalled();
    expect(mocks.consumirPerito).not.toHaveBeenCalled();
  });

  it('reutiliza ataque idempotente sem recalcular Escalada', async () => {
    const mocks = configurarRolagemPericiaAutoritativa({
      periciaCodigo: 'PONTARIA',
      bonusEscalada: 2,
      persistirEventoCriado: true,
    });
    const dto = {
      tipo: 'ATAQUE_PERSONAGEM' as const,
      personagemSessaoId: 31,
      periciaCodigo: 'PONTARIA',
      clientRequestId: 'c580c8ad-51ca-43ef-9229-376c68133222',
    };

    const primeiro = await service.criarRolagemSessao(7, 21, 10, dto);
    const repetido = await service.criarRolagemSessao(7, 21, 10, dto);

    expect(repetido.id).toBe(primeiro.id);
    expect(repetido.criadoAgora).toBe(false);
    expect(mocks.criarEvento).toHaveBeenCalledTimes(1);
    expect(mocks.resolverEscalada).toHaveBeenCalledTimes(1);
    expect(mocks.consumirPerito).not.toHaveBeenCalled();
  });

  it('impede jogador de atacar com personagem alheio e permite ao mestre', async () => {
    configurarRolagemPericiaAutoritativa({
      donoId: 11,
      periciaCodigo: 'LUTA',
    });
    const dto = {
      tipo: 'ATAQUE_PERSONAGEM' as const,
      personagemSessaoId: 31,
      periciaCodigo: 'LUTA',
      clientRequestId: '4a8f71d2-cd49-4f54-b300-43ec9c4d1699',
    };

    await expect(
      service.criarRolagemSessao(7, 21, 10, dto),
    ).rejects.toMatchObject({ code: 'CAMPANHA_PERSONAGEM_EDICAO_NEGADA' });

    jest.restoreAllMocks();
    configurarRolagemPericiaAutoritativa({
      ehMestre: true,
      donoId: 11,
      periciaCodigo: 'LUTA',
    });
    await expect(
      service.criarRolagemSessao(7, 21, 99, {
        ...dto,
        clientRequestId: '7b08fae7-aee6-46ae-bf75-260665712ddd',
      }),
    ).resolves.toMatchObject({ criadoAgora: true });
  });

  it('bloqueia ataque secreto de jogador e efeitos de turno pendentes', async () => {
    configurarRolagemPericiaAutoritativa({ periciaCodigo: 'PONTARIA' });
    const dto = {
      tipo: 'ATAQUE_PERSONAGEM' as const,
      personagemSessaoId: 31,
      periciaCodigo: 'PONTARIA',
      clientRequestId: '05662f37-69a8-462b-b53d-72c1dff1d4c7',
    };

    await expect(
      service.criarRolagemSessao(7, 21, 10, {
        ...dto,
        visibilidade: 'SECRETA_MESTRE',
      }),
    ).rejects.toMatchObject({ code: 'CAMPANHA_APENAS_MESTRE' });

    jest.restoreAllMocks();
    const mocks = configurarRolagemPericiaAutoritativa({
      periciaCodigo: 'PONTARIA',
    });
    mocks.validarMutabilidade.mockRejectedValue(
      new SessaoEfeitosTurnoPendentesException(7, 21, 900),
    );
    await expect(
      service.criarRolagemSessao(7, 21, 10, dto),
    ).rejects.toMatchObject({ code: 'SESSAO_EFEITOS_TURNO_PENDENTES' });
  });

  it('impede jogador de rolar pericia de personagem alheio', async () => {
    configurarRolagemPericiaAutoritativa({ donoId: 11 });

    await expect(
      service.criarRolagemSessao(7, 21, 10, {
        tipo: 'PERICIA_PERSONAGEM',
        personagemSessaoId: 31,
        periciaCodigo: 'ATLETISMO',
        clientRequestId: '9c871c5a-c103-4ab1-86d9-b7cdb20c5d79',
      }),
    ).rejects.toMatchObject({ code: 'CAMPANHA_PERSONAGEM_EDICAO_NEGADA' });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('permite ao mestre rolar pericia de qualquer personagem', async () => {
    const mocks = configurarRolagemPericiaAutoritativa({
      ehMestre: true,
      donoId: 11,
    });

    await expect(
      service.criarRolagemSessao(7, 21, 99, {
        tipo: 'PERICIA_PERSONAGEM',
        personagemSessaoId: 31,
        periciaCodigo: 'ATLETISMO',
        clientRequestId: '9c871c5a-c103-4ab1-86d9-b7cdb20c5d80',
      }),
    ).resolves.toMatchObject({ criadoAgora: true });
    expect(mocks.criarEvento).toHaveBeenCalledTimes(1);
  });

  it('bloqueia rolagem secreta de pericia para jogador', async () => {
    configurarRolagemPericiaAutoritativa();

    await expect(
      service.criarRolagemSessao(7, 21, 10, {
        tipo: 'PERICIA_PERSONAGEM',
        personagemSessaoId: 31,
        periciaCodigo: 'ATLETISMO',
        visibilidade: 'SECRETA_MESTRE',
        clientRequestId: '9c871c5a-c103-4ab1-86d9-b7cdb20c5d81',
      }),
    ).rejects.toMatchObject({ code: 'CAMPANHA_APENAS_MESTRE' });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('respeita a guarda de sessao mutavel antes da rolagem', async () => {
    const mocks = configurarRolagemPericiaAutoritativa();
    mocks.validarMutabilidade.mockRejectedValue(
      new SessaoEncerradaException(7, 21, 'realizar rolagem de pericia'),
    );

    await expect(
      service.criarRolagemSessao(7, 21, 10, {
        tipo: 'PERICIA_PERSONAGEM',
        personagemSessaoId: 31,
        periciaCodigo: 'ATLETISMO',
        clientRequestId: '9c871c5a-c103-4ab1-86d9-b7cdb20c5d82',
      }),
    ).rejects.toMatchObject({ code: 'SESSAO_ENCERRADA' });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('reutiliza o mesmo evento sem rerrolar ou consumir Perito', async () => {
    const mocks = configurarRolagemPericiaAutoritativa({
      persistirEventoCriado: true,
    });
    const dto = {
      tipo: 'PERICIA_PERSONAGEM' as const,
      personagemSessaoId: 31,
      periciaCodigo: 'ATLETISMO',
      clientRequestId: '9c871c5a-c103-4ab1-86d9-b7cdb20c5d83',
    };

    const primeiro = await service.criarRolagemSessao(7, 21, 10, dto);
    const repetido = await service.criarRolagemSessao(7, 21, 10, dto);

    expect(primeiro.id).toBe(repetido.id);
    expect(repetido.criadoAgora).toBe(false);
    expect(mocks.criarEvento).toHaveBeenCalledTimes(1);
    expect(mocks.consumirPerito).toHaveBeenCalledTimes(1);
    expect(mocks.resolverInspiracao).toHaveBeenCalledTimes(1);
  });

  it('converge para o evento vencedor quando o insert perde a corrida unica', async () => {
    const clientRequestId = '9c871c5a-c103-4ab1-86d9-b7cdb20c5d85';
    const intencaoAutoritativa = {
      tipo: 'PERICIA_PERSONAGEM',
      personagemSessaoId: 31,
      periciaCodigo: 'ATLETISMO',
      visibilidade: 'PUBLICA',
      dt: null,
    };
    const vencedor = criarEventoRolagemPericiaTeste({
      mensagem: 'resultado vencedor',
      visibilidade: 'PUBLICA',
      intencaoAutoritativa,
      dadosRolagem: {
        versao: 1,
        origem: 'SERVIDOR',
        tipo: 'PERICIA_PERSONAGEM',
        clientRequestId,
        personagemSessaoId: 31,
        personagemCampanhaId: 41,
        periciaCodigo: 'ATLETISMO',
        formulaResolvida: '3d20+14#',
        payloads: [],
        resultado: {
          total: 20,
          dt: null,
          sucesso: null,
          falhaCritica: false,
        },
      },
    });
    const erroP2002 = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: 'test',
        meta: {
          target: ['sessaoId', 'solicitanteUsuarioId', 'clientRequestId'],
        },
      },
    );
    const mocks = configurarRolagemPericiaAutoritativa({
      erroCriarEvento: erroP2002,
      eventoVencedorAposErro: vencedor,
    });

    await expect(
      service.criarRolagemSessao(7, 21, 10, {
        tipo: 'PERICIA_PERSONAGEM',
        personagemSessaoId: 31,
        periciaCodigo: 'ATLETISMO',
        clientRequestId,
      }),
    ).resolves.toMatchObject({
      id: vencedor.id,
      mensagem: 'resultado vencedor',
      criadoAgora: false,
    });
    expect(mocks.criarEvento).toHaveBeenCalledTimes(1);
  });

  it('repete a transacao quando Prisma sinaliza conflito P2034', async () => {
    configurarRolagemPericiaAutoritativa();
    const executarTransacao = prisma.$transaction.getMockImplementation();
    const erroP2034 = new Prisma.PrismaClientKnownRequestError(
      'Conflito de escrita',
      { code: 'P2034', clientVersion: 'test' },
    );
    prisma.$transaction
      .mockRejectedValueOnce(erroP2034)
      .mockImplementation(executarTransacao);

    await expect(
      service.criarRolagemSessao(7, 21, 10, {
        tipo: 'PERICIA_PERSONAGEM',
        personagemSessaoId: 31,
        periciaCodigo: 'ATLETISMO',
        clientRequestId: '9c871c5a-c103-4ab1-86d9-b7cdb20c5d86',
      }),
    ).resolves.toMatchObject({ criadoAgora: true });
    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
  });

  it('rejeita reutilizar UUID com outra intencao de rolagem', async () => {
    const clientRequestId = '9c871c5a-c103-4ab1-86d9-b7cdb20c5d84';
    configurarRolagemPericiaAutoritativa({
      eventoExistente: criarEventoRolagemPericiaTeste({
        mensagem: 'resultado anterior',
        visibilidade: 'PUBLICA',
        intencaoAutoritativa: {
          tipo: 'PERICIA_PERSONAGEM',
          personagemSessaoId: 31,
          periciaCodigo: 'ACROBACIA',
          visibilidade: 'PUBLICA',
          dt: null,
        },
      }),
    });

    await expect(
      service.criarRolagemSessao(7, 21, 10, {
        tipo: 'PERICIA_PERSONAGEM',
        personagemSessaoId: 31,
        periciaCodigo: 'ATLETISMO',
        clientRequestId,
      }),
    ).rejects.toMatchObject({
      code: 'SESSAO_ROLAGEM_IDEMPOTENCIA_CONFLITO',
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('consome o Perito mais antigo apenas em pericia compativel', async () => {
    let estado = {
      pendentesRolagem: {
        recente: {
          id: 'perito-recente',
          eventoId: 72,
          personagemSessaoId: 31,
          personagemCampanhaId: 41,
          habilidadeId: 80,
          habilidadeNome: 'Perito',
          dado: 'd8',
          faces: 8,
          criadoEm: '2026-07-14T12:00:00.000Z',
        },
        antigo: {
          id: 'perito-antigo',
          eventoId: 71,
          personagemSessaoId: 31,
          personagemCampanhaId: 41,
          habilidadeId: 80,
          habilidadeNome: 'Perito',
          dado: 'd6',
          faces: 6,
          criadoEm: '2026-07-13T12:00:00.000Z',
        },
      },
      aprimoramentosTemporarios: {},
    };
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: 1 }]),
      sessaoRegraOpcional: {
        findUnique: jest
          .fn()
          .mockImplementation(() => Promise.resolve({ id: 1, estado })),
        update: jest.fn().mockImplementation((input) => {
          estado = input.data.estado;
          return Promise.resolve({});
        }),
        create: jest.fn(),
      },
    };

    const resultado = await (service as any).consumirPeritoAutoritativoTx(
      tx,
      21,
      31,
      41,
      'ATLETISMO',
      1,
    );

    expect(resultado.bonusDado).toMatchObject({
      origem: 'PERITO',
      faces: 6,
      efeitoPendenteId: 'perito-antigo',
    });
    expect(resultado.bonusDado.rolagens[0]).toBeGreaterThanOrEqual(1);
    expect(resultado.bonusDado.rolagens[0]).toBeLessThanOrEqual(6);
    expect(estado.pendentesRolagem).toEqual({
      recente: expect.objectContaining({ id: 'perito-recente' }),
    });
  });

  it('concede Inspiracao apenas com falha critica calculada no servidor', async () => {
    const aplicar = jest
      .spyOn(service as any, 'aplicarInspiracaoAutomaticaTx')
      .mockResolvedValue(undefined);
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: 1 }]),
      sessaoRegraOpcional: {
        findUnique: jest.fn().mockResolvedValue({ ativo: true }),
      },
    };
    const payload = {
      quantidade: 2,
      faces: 20,
      modificador: 5,
      operador: '+',
      aplicarModificadorPorDado: false,
      keepMode: 'HIGHEST',
      rolagens: [1, 1],
    };

    await expect(
      (service as any).resolverInspiracaoAutoritativaTx(
        tx,
        21,
        41,
        20,
        payload,
        6,
      ),
    ).resolves.toMatchObject({ motivo: 'FALHA_CRITICA', dt: 20, total: 6 });
    expect(aplicar).toHaveBeenCalledTimes(1);

    await expect(
      (service as any).resolverInspiracaoAutoritativaTx(
        tx,
        21,
        41,
        undefined,
        payload,
        6,
      ),
    ).resolves.toBeNull();
    expect(aplicar).toHaveBeenCalledTimes(1);
  });

  it('resolve Escalada autoritativa apenas em combate com regra ativa', async () => {
    const tx = {
      sessao: {
        findUnique: jest.fn().mockResolvedValue({
          rodadaAtual: 5,
          cenaAtualTipo: 'COMBATE',
          regrasOpcionais: [
            {
              ativo: true,
              estado: {
                ativaNesteCombate: true,
                rodadaInicio: 2,
                bonusAtual: 3,
              },
            },
          ],
        }),
      },
    };

    await expect(
      (service as any).resolverEscaladaAtaqueAutoritativaTx(tx, 21),
    ).resolves.toEqual({
      bonus: 3,
      ajustes: [
        {
          tipo: 'ESCALADA_DADOS',
          valor: 3,
          descricao: 'Escalada de Dados +3',
        },
      ],
    });

    tx.sessao.findUnique.mockResolvedValueOnce({
      rodadaAtual: 5,
      cenaAtualTipo: 'LIVRE',
      regrasOpcionais: [
        { ativo: true, estado: { ativaNesteCombate: true, bonusAtual: 3 } },
      ],
    });
    await expect(
      (service as any).resolverEscaladaAtaqueAutoritativaTx(tx, 21),
    ).resolves.toEqual({ bonus: 0, ajustes: [] });

    tx.sessao.findUnique.mockResolvedValueOnce({
      rodadaAtual: 5,
      cenaAtualTipo: 'COMBATE',
      regrasOpcionais: [
        { ativo: false, estado: { ativaNesteCombate: true, bonusAtual: 3 } },
      ],
    });
    await expect(
      (service as any).resolverEscaladaAtaqueAutoritativaTx(tx, 21),
    ).resolves.toEqual({ bonus: 0, ajustes: [] });
  });

  it('usa keep lowest para atributo zero ou negativo', () => {
    expect((service as any).calcularDadosPadraoPericia(0)).toBe(2);
    expect((service as any).calcularDadosPadraoPericia(-2)).toBe(4);
  });

  it('marca payload de rolagem enviado pelo chat como cliente legado', () => {
    expect(
      (service as any).marcarRolagemClienteLegado('1d20 [[dice:v3|abc]]', {
        origem: 'SERVIDOR',
        payloads: [],
      }),
    ).toEqual({
      origem: 'CLIENTE_LEGADO',
      payloads: [],
    });
  });

  it('não sincroniza condições automáticas ao ler detalhe encerrado', async () => {
    jest.spyOn(service as any, 'obterSessaoComAcesso').mockResolvedValue({
      acesso: { ehMestre: true },
      sessao: { status: 'ENCERRADA' },
    });
    const sincronizar = jest.spyOn(
      service as any,
      'sincronizarCondicoesAutomaticasSessao',
    );
    (prisma as any).sessao = {
      findUnique: jest.fn().mockResolvedValue(null),
    };

    await expect(service.buscarDetalheSessao(7, 21, 10)).rejects.toBeInstanceOf(
      SessaoCampanhaNaoEncontradaException,
    );
    expect(sincronizar).not.toHaveBeenCalled();
  });

  it('valida campanha e sessão antes de sincronizar o detalhe', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 7,
      donoId: 10,
      membros: [],
    });
    (prisma as any).sessao = {
      findUnique: jest.fn().mockResolvedValue({
        id: 21,
        campanhaId: 8,
        status: 'EM_ANDAMENTO',
        cenaAtualTipo: 'COMBATE',
        rodadaAtual: 1,
      }),
    };
    const sincronizar = jest.spyOn(
      service as any,
      'sincronizarCondicoesAutomaticasSessao',
    );

    await expect(service.buscarDetalheSessao(7, 21, 10)).rejects.toBeInstanceOf(
      SessaoCampanhaNaoEncontradaException,
    );
    expect(sincronizar).not.toHaveBeenCalled();
  });

  it('lê iniciativa alternada persistida sem criar estado em sessão encerrada', async () => {
    jest.spyOn(service as any, 'obterSessaoComAcesso').mockResolvedValue({
      acesso: { ehMestre: true },
      sessao: {
        status: 'ENCERRADA',
        cenaAtualTipo: 'COMBATE',
      },
    });
    (prisma as any).sessaoRegraOpcional = {
      findUnique: jest.fn().mockResolvedValue({ ativo: true }),
    };
    (prisma as any).sessaoIniciativaAlternada = {
      findUnique: jest.fn().mockResolvedValue(null),
    };

    await expect(
      service.obterIniciativaAlternadaSessao(7, 21, 10),
    ).resolves.toEqual({ ativo: false, ladoAtualId: null, lados: [] });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('sincronizador automático retorna sem escrever em sessão encerrada', async () => {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: 21 }]),
      sessao: {
        findUnique: jest.fn().mockResolvedValue({
          id: 21,
          status: 'ENCERRADA',
          rodadaAtual: 1,
          cenas: [],
          personagens: [],
          npcs: [],
        }),
      },
      condicao: { findMany: jest.fn() },
      condicaoPersonagemSessao: { findMany: jest.fn() },
      eventoSessao: { create: jest.fn() },
    };

    await (service as any).sincronizarCondicoesAutomaticasSessaoTx(tx, 21);

    expect(tx.condicao.findMany).not.toHaveBeenCalled();
    expect(tx.condicaoPersonagemSessao.findMany).not.toHaveBeenCalled();
    expect(tx.eventoSessao.create).not.toHaveBeenCalled();
  });

  it('loga contexto quando o pós-processamento de efeitos automáticos falha', async () => {
    const eventoEfeitos = configurarEventoEfeitosAutomaticos();
    const falha = new Error('falha ao cobrar sustentacoes');
    const loggerError = jest
      .spyOn((service as any).logger, 'error')
      .mockImplementation(() => undefined);
    jest
      .spyOn(service as any, 'cobrarSustentacoesAtivasRodadaTx')
      .mockRejectedValue(falha);

    await expect(
      (service as any).processarEfeitosAutomaticosTurnoSessao({
        eventoId: 123,
        campanhaId: 7,
        sessaoId: 21,
        contexto: {
          versao: 2,
          status: 'PENDENTE',
          acao: 'AVANCAR',
          cenaId: 5,
          rodadaAnterior: 2,
          rodadaNova: 3,
          passos: [
            {
              chave: 'SUSTENTACOES_RODADA',
              tipo: 'SUSTENTACOES_RODADA',
              status: 'PENDENTE',
            },
          ],
          tentativas: 0,
          atualizadoEm: '2026-07-13T12:00:00.000Z',
        },
      }),
    ).resolves.toBe(false);

    const statusAtualizados = eventoEfeitos.update.mock.calls.map(
      ([call]) => call.data.dados.efeitosAutomaticos.status,
    );
    expect(statusAtualizados).toEqual(['ERRO']);
    expect(loggerError).toHaveBeenCalledWith(
      expect.stringContaining('"eventoId":123'),
      falha.stack,
    );
    expect(loggerError).toHaveBeenCalledWith(
      expect.stringContaining('"campanhaId":7'),
      falha.stack,
    );
  });

  it('processa cada checkpoint uma vez mesmo em retry do mesmo evento', async () => {
    const eventoEfeitos = configurarEventoEfeitosAutomaticos();
    const cobrar = jest
      .spyOn(service as any, 'cobrarSustentacoesAtivasRodadaTx')
      .mockResolvedValue(undefined);
    const processamento = {
      eventoId: 123,
      campanhaId: 7,
      sessaoId: 21,
      contexto: {
        versao: 2,
        status: 'PENDENTE',
        acao: 'AVANCAR',
        cenaId: 5,
        rodadaAnterior: 2,
        rodadaNova: 3,
        passos: [
          {
            chave: 'SUSTENTACOES_RODADA',
            tipo: 'SUSTENTACOES_RODADA',
            status: 'PENDENTE',
          },
        ],
        tentativas: 0,
        atualizadoEm: '2026-07-13T12:00:00.000Z',
      },
    };

    await expect(
      (service as any).processarEfeitosAutomaticosTurnoSessao(processamento),
    ).resolves.toBe(true);
    await expect(
      (service as any).processarEfeitosAutomaticosTurnoSessao(processamento),
    ).resolves.toBe(true);

    expect(cobrar).toHaveBeenCalledTimes(1);
    expect(
      eventoEfeitos.update.mock.calls.at(-1)?.[0].data.dados.efeitosAutomaticos
        .status,
    ).toBe('CONCLUIDO');
  });

  it('retoma somente checkpoint não concluído depois de falha', async () => {
    const eventoEfeitos = configurarEventoEfeitosAutomaticos();
    await eventoEfeitos.update({
      data: {
        dados: {
          efeitosAutomaticos: {
            versao: 2,
            status: 'PENDENTE',
            acao: 'AVANCAR',
            cenaId: 5,
            rodadaAnterior: 2,
            rodadaNova: 3,
            passos: [
              {
                chave: 'SUSTENTACOES_RODADA',
                tipo: 'SUSTENTACOES_RODADA',
                status: 'CONCLUIDO',
              },
              {
                chave: 'CONDICOES_RODADA',
                tipo: 'CONDICOES_RODADA',
                status: 'PENDENTE',
              },
            ],
            tentativas: 1,
            atualizadoEm: '2026-07-13T12:00:00.000Z',
          },
        },
      },
    });
    const cobrar = jest.spyOn(
      service as any,
      'cobrarSustentacoesAtivasRodadaTx',
    );
    const processarCondicoes = jest
      .spyOn(service as any, 'processarCondicoesNoAvancoTurnoTx')
      .mockRejectedValueOnce(new Error('falha temporaria'))
      .mockResolvedValue(undefined);
    const processamento = {
      eventoId: 123,
      campanhaId: 7,
      sessaoId: 21,
      contexto: {
        versao: 2,
        status: 'PENDENTE',
        acao: 'AVANCAR',
        cenaId: 5,
        rodadaAnterior: 2,
        rodadaNova: 3,
        passos: [],
        tentativas: 0,
        atualizadoEm: '2026-07-13T12:00:00.000Z',
      },
    };

    await expect(
      (service as any).processarEfeitosAutomaticosTurnoSessao(processamento),
    ).resolves.toBe(false);
    await expect(
      (service as any).processarEfeitosAutomaticosTurnoSessao({
        ...processamento,
        contexto: {
          ...processamento.contexto,
          passos: [{ chave: 'retry', tipo: 'CONDICOES_RODADA' }],
        },
      }),
    ).resolves.toBe(true);

    expect(cobrar).not.toHaveBeenCalled();
    expect(processarCondicoes).toHaveBeenCalledTimes(2);
    expect(
      eventoEfeitos.update.mock.calls.at(-1)?.[0].data.dados.efeitosAutomaticos
        .status,
    ).toBe('CONCLUIDO');
  });

  it('serializa duas execuções concorrentes do mesmo evento', async () => {
    configurarEventoEfeitosAutomaticos();
    let fila = Promise.resolve<unknown>(undefined);
    prisma.$transaction.mockImplementation(
      (callback: (tx: typeof prisma) => Promise<unknown>) => {
        const execucao = fila.then(() => callback(prisma));
        fila = execucao.catch(() => undefined);
        return execucao;
      },
    );
    const cobrar = jest
      .spyOn(service as any, 'cobrarSustentacoesAtivasRodadaTx')
      .mockResolvedValue(undefined);
    const processamento = {
      eventoId: 123,
      campanhaId: 7,
      sessaoId: 21,
      contexto: {
        versao: 2,
        status: 'PENDENTE',
        acao: 'AVANCAR',
        cenaId: 5,
        rodadaAnterior: 2,
        rodadaNova: 3,
        passos: [
          {
            chave: 'SUSTENTACOES_RODADA',
            tipo: 'SUSTENTACOES_RODADA',
            status: 'PENDENTE',
          },
        ],
        tentativas: 0,
        atualizadoEm: '2026-07-13T12:00:00.000Z',
      },
    };

    await expect(
      Promise.all([
        (service as any).processarEfeitosAutomaticosTurnoSessao(processamento),
        (service as any).processarEfeitosAutomaticosTurnoSessao(processamento),
      ]),
    ).resolves.toEqual([true, true]);
    expect(cobrar).toHaveBeenCalledTimes(1);
  });

  it('retoma contexto v2 legado marcado como EM_PROCESSAMENTO', async () => {
    const eventoEfeitos = configurarEventoEfeitosAutomaticos();
    await eventoEfeitos.update({
      data: {
        dados: {
          efeitosAutomaticos: {
            versao: 2,
            status: 'EM_PROCESSAMENTO',
            acao: 'AVANCAR',
            cenaId: 5,
            rodadaAnterior: 2,
            rodadaNova: 3,
            passos: [
              {
                chave: 'SUSTENTACOES_RODADA',
                tipo: 'SUSTENTACOES_RODADA',
                status: 'EM_PROCESSAMENTO',
              },
            ],
            tentativas: 1,
            atualizadoEm: '2026-07-13T12:00:00.000Z',
          },
        },
      },
    });
    const cobrar = jest
      .spyOn(service as any, 'cobrarSustentacoesAtivasRodadaTx')
      .mockResolvedValue(undefined);

    const processamento = await (
      service as any
    ).obterProcessamentoEfeitosTurnoPorEvento(7, 21, 123);
    await expect(
      (service as any).processarEfeitosAutomaticosTurnoSessao(processamento),
    ).resolves.toBe(true);
    expect(cobrar).toHaveBeenCalledTimes(1);
  });

  it('mantem evento legado incompleto visivel como erro seguro', async () => {
    (prisma as any).eventoSessao.findMany.mockResolvedValue([
      {
        id: 124,
        cenaId: 5,
        tipoEvento: 'INICIATIVA_ALTERNADA_LADO_AVANCADO',
        dados: {
          rodadaAnterior: 2,
          rodadaNova: 3,
          efeitosAutomaticos: {
            status: 'EM_PROCESSAMENTO',
            tentativas: 2,
          },
        },
      },
    ]);

    await expect(
      (service as any).obterEfeitosTurnoPendentesTx(prisma, 21),
    ).resolves.toEqual({
      eventoId: 124,
      status: 'ERRO',
      acao: 'AVANCAR',
      rodadaAnterior: 2,
      rodadaNova: 3,
      tentativas: 2,
    });
  });

  it('bloqueia mutação enquanto efeitos do turno estão pendentes', async () => {
    jest.spyOn(service as any, 'obterSessaoComAcesso').mockResolvedValue({
      acesso: { ehMestre: true },
      sessao: { status: 'EM_ANDAMENTO' },
    });
    (prisma as any).eventoSessao.findMany.mockResolvedValue([
      {
        id: 123,
        cenaId: 5,
        tipoEvento: 'TURNO_AVANCADO',
        dados: {
          efeitosAutomaticos: {
            versao: 2,
            status: 'PENDENTE',
            acao: 'AVANCAR',
            cenaId: 5,
            rodadaAnterior: 2,
            rodadaNova: 3,
            passos: [],
            tentativas: 0,
            atualizadoEm: '2026-07-13T12:00:00.000Z',
          },
        },
      },
    ]);

    await expect(
      service.atualizarCenaSessao(7, 21, 10, {} as never),
    ).rejects.toMatchObject({ code: 'SESSAO_EFEITOS_TURNO_PENDENTES' });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejeita avanço com precondição de turno desatualizada', async () => {
    jest
      .spyOn(service as any, 'obterSessaoMutavelComAcesso')
      .mockResolvedValue({
        acesso: { ehMestre: true },
      });
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: 21 }]),
      sessao: {
        findUnique: jest.fn().mockResolvedValue({
          id: 21,
          campanhaId: 7,
          status: 'EM_ANDAMENTO',
          cenaAtualTipo: 'COMBATE',
          rodadaAtual: 3,
          indiceTurnoAtual: 0,
        }),
      },
      eventoSessao: { findMany: jest.fn().mockResolvedValue([]) },
    };
    prisma.$transaction.mockImplementation(
      async (callback: (txArg: typeof tx) => Promise<unknown>) => callback(tx),
    );

    await expect(
      service.avancarTurnoSessao(7, 21, 10, {
        rodadaEsperada: 2,
        indiceTurnoEsperado: 0,
      }),
    ).rejects.toMatchObject({ code: 'SESSAO_TURNO_DESATUALIZADO' });
  });

  it('mantem NPCs ocultos no detalhe do mestre', () => {
    const npcs = [
      { id: 1, nome: 'Visivel', ocultoJogadores: false },
      { id: 2, nome: 'Oculto', ocultoJogadores: true },
    ];

    expect((service as any).filtrarNpcsVisiveisCenaAtual(npcs, true)).toEqual(
      npcs,
    );
  });

  it('remove NPCs ocultos do detalhe de jogadores', () => {
    const npcs = [
      { id: 1, nome: 'Visivel', ocultoJogadores: false },
      { id: 2, nome: 'Oculto', ocultoJogadores: true },
    ];

    expect((service as any).filtrarNpcsVisiveisCenaAtual(npcs, false)).toEqual([
      { id: 1, nome: 'Visivel', ocultoJogadores: false },
    ]);
  });

  it('mantem eventos de NPC oculto na timeline do mestre', async () => {
    mockAcessoTimeline(true);
    jest
      .spyOn(service as any, 'obterUltimoEventoReversivelDisponivel')
      .mockResolvedValue(null);
    (prisma as any).eventoSessao = {
      findMany: jest.fn().mockResolvedValue([
        criarEventoTimeline(1, 'NPC_ADICIONADO', {
          npcSessaoId: 601,
          nome: 'Ameaca oculta',
        }),
      ]),
    };

    const eventos = await service.listarEventosSessao(7, 21, 10, {
      limit: 80,
    } as never);

    expect(eventos).toHaveLength(1);
    expect(eventos[0].descricao).toContain('Ameaca oculta');
  });

  it('não oferece desfazer evento na timeline de sessão encerrada', async () => {
    jest.spyOn(service as any, 'obterSessaoComAcesso').mockResolvedValue({
      acesso: { ehMestre: true },
      sessao: { status: 'ENCERRADA' },
    });
    const obterUltimo = jest.spyOn(
      service as any,
      'obterUltimoEventoReversivelDisponivel',
    );
    (prisma as any).eventoSessao = {
      findMany: jest.fn().mockResolvedValue([
        criarEventoTimeline(1, 'CENA_ATUALIZADA', {
          tipoNovo: 'COMBATE',
        }),
      ]),
    };

    const eventos = await service.listarEventosSessao(7, 21, 10, {
      limit: 80,
    } as never);

    expect(obterUltimo).not.toHaveBeenCalled();
    expect(eventos[0].podeDesfazer).toBe(false);
  });

  it('filtra eventos de NPC oculto na timeline de jogadores', async () => {
    mockAcessoTimeline(false);
    (prisma as any).npcAmeacaSessao = {
      findMany: jest.fn().mockResolvedValue([{ id: 601 }]),
    };
    (prisma as any).eventoSessao = {
      findMany: jest.fn().mockResolvedValue([
        criarEventoTimeline(1, 'NPC_ADICIONADO', {
          npcSessaoId: 601,
          nome: 'Ameaca oculta',
        }),
        criarEventoTimeline(2, 'NPC_ADICIONADO', {
          npcSessaoId: 602,
          nome: 'Aliado visivel',
        }),
        criarEventoTimeline(3, 'CENA_ATUALIZADA', {
          tipoNovo: 'COMBATE',
        }),
      ]),
    };

    const eventos = await service.listarEventosSessao(7, 21, 10, {
      limit: 80,
    } as never);

    expect(eventos.map((evento) => evento.id)).toEqual([2, 3]);
    expect(eventos[0].descricao).toContain('Aliado visivel');
    expect(eventos[1].descricao).toContain('Cena atualizada');
  });

  it('filtra eventos de NPC oculto por campos equivalentes de alvo ou origem', async () => {
    mockAcessoTimeline(false);
    (prisma as any).npcAmeacaSessao = {
      findMany: jest.fn().mockResolvedValue([{ id: 601 }, { id: 603 }]),
    };
    (prisma as any).eventoSessao = {
      findMany: jest.fn().mockResolvedValue([
        criarEventoTimeline(1, 'CONDICAO_APLICADA', {
          alvoNpcSessaoId: 601,
          condicaoNome: 'Morrendo',
        }),
        criarEventoTimeline(2, 'HABILIDADE_USADA', {
          origemNpcSessaoId: 603,
          habilidadeNome: 'Emboscada',
        }),
        criarEventoTimeline(3, 'CONDICAO_APLICADA', {
          alvoNpcSessaoId: 602,
          condicaoNome: 'Caido',
        }),
      ]),
    };

    const eventos = await service.listarEventosSessao(7, 21, 10, {
      limit: 80,
    } as never);

    expect(eventos.map((evento) => evento.id)).toEqual([3]);
  });

  it('filtra evento com snapshot de NPC oculto mesmo sem registro atual', async () => {
    mockAcessoTimeline(false);
    (prisma as any).npcAmeacaSessao = {
      findMany: jest.fn().mockResolvedValue([]),
    };
    (prisma as any).eventoSessao = {
      findMany: jest.fn().mockResolvedValue([
        criarEventoTimeline(1, 'NPC_REMOVIDO', {
          npcSessaoId: 601,
          nome: 'Ameaca removida',
          snapshot: {
            ocultoJogadores: true,
          },
        }),
        criarEventoTimeline(2, 'CENA_ATUALIZADA', {
          tipoNovo: 'LIVRE',
        }),
      ]),
    };

    const eventos = await service.listarEventosSessao(7, 21, 10, {
      limit: 80,
    } as never);

    expect(eventos.map((evento) => evento.id)).toEqual([2]);
  });

  it('deve bloquear avancar turno quando cena atual e LIVRE', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 7,
      donoId: 10,
      membros: [],
    });

    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: 21 }]),
      sessao: {
        findUnique: jest.fn().mockResolvedValue({
          id: 21,
          campanhaId: 7,
          cenaAtualTipo: 'LIVRE',
          indiceTurnoAtual: 0,
          rodadaAtual: 1,
        }),
      },
      personagemSessao: {
        findMany: jest.fn(),
      },
      eventoSessao: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn(),
      },
    };

    prisma.$transaction.mockImplementation(
      async (callback: (txArg: typeof tx) => Promise<unknown>) => callback(tx),
    );

    await expect(
      service.avancarTurnoSessao(7, 21, 10, {
        rodadaEsperada: 1,
        indiceTurnoEsperado: 0,
      }),
    ).rejects.toBeInstanceOf(SessaoTurnoIndisponivelEmCenaLivreException);
    expect(tx.personagemSessao.findMany).not.toHaveBeenCalled();
  });

  it('deve bloquear voltar turno quando cena atual e LIVRE', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 7,
      donoId: 10,
      membros: [],
    });

    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: 21 }]),
      sessao: {
        findUnique: jest.fn().mockResolvedValue({
          id: 21,
          campanhaId: 7,
          cenaAtualTipo: 'LIVRE',
          indiceTurnoAtual: 0,
          rodadaAtual: 1,
        }),
      },
      personagemSessao: {
        findMany: jest.fn(),
      },
      eventoSessao: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn(),
      },
    };

    prisma.$transaction.mockImplementation(
      async (callback: (txArg: typeof tx) => Promise<unknown>) => callback(tx),
    );

    await expect(
      service.voltarTurnoSessao(7, 21, 10, {
        rodadaEsperada: 1,
        indiceTurnoEsperado: 0,
      }),
    ).rejects.toBeInstanceOf(SessaoTurnoIndisponivelEmCenaLivreException);
    expect(tx.personagemSessao.findMany).not.toHaveBeenCalled();
  });

  it('deve bloquear pular turno quando cena atual e LIVRE', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 7,
      donoId: 10,
      membros: [],
    });

    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: 21 }]),
      sessao: {
        findUnique: jest.fn().mockResolvedValue({
          id: 21,
          campanhaId: 7,
          cenaAtualTipo: 'LIVRE',
          indiceTurnoAtual: 0,
          rodadaAtual: 1,
        }),
      },
      personagemSessao: {
        findMany: jest.fn(),
      },
      eventoSessao: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn(),
      },
    };

    prisma.$transaction.mockImplementation(
      async (callback: (txArg: typeof tx) => Promise<unknown>) => callback(tx),
    );

    await expect(
      service.pularTurnoSessao(7, 21, 10, {
        rodadaEsperada: 1,
        indiceTurnoEsperado: 0,
      }),
    ).rejects.toBeInstanceOf(SessaoTurnoIndisponivelEmCenaLivreException);
    expect(tx.personagemSessao.findMany).not.toHaveBeenCalled();
  });

  it('deve encerrar sessão quando usuário for mestre', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 7,
      donoId: 10,
      membros: [],
    });

    const tx = {
      sessao: {
        findUnique: jest.fn().mockResolvedValue({
          id: 21,
          campanhaId: 7,
          titulo: 'Sessão teste',
          status: 'LOBBY',
          iniciadoEm: new Date('2026-05-19T10:00:00.000Z'),
          encerradoEm: new Date('2026-05-19T11:00:00.000Z'),
          cenas: [{ id: 81 }],
          personagens: [],
          eventos: [],
        }),
        update: jest.fn().mockResolvedValue({
          id: 21,
          status: 'ENCERRADA',
        }),
      },
      eventoSessao: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({ id: 301 }),
      },
      sessaoRegraOpcional: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      npcAmeacaSessao: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            { entidadeVinculadaId: 500 },
            { entidadeVinculadaId: 501 },
          ]),
      },
      personagemCampanhaEntidadeVinculada: {
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
      sessaoRelatorio: {
        upsert: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };

    prisma.$transaction.mockImplementation(
      async (callback: (txArg: typeof tx) => Promise<unknown>) => callback(tx),
    );

    const detalheEncerrada = { id: 21, status: 'ENCERRADA' };
    jest
      .spyOn(service, 'buscarDetalheSessao')
      .mockResolvedValue(detalheEncerrada as never);

    const resultado = await service.encerrarSessaoCampanha(7, 21, 10);

    expect(tx.sessao.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 21 },
        data: expect.objectContaining({
          status: 'ENCERRADA',
        }),
      }),
    );
    expect(tx.eventoSessao.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sessaoId: 21,
          tipoEvento: 'SESSAO_ENCERRADA',
        }),
      }),
    );
    expect(tx.sessaoRegraOpcional.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sessaoId: 21, chave: 'INSPIRACAO' },
      }),
    );
    expect(
      tx.personagemCampanhaEntidadeVinculada.updateMany,
    ).toHaveBeenCalledWith({
      where: {
        id: { in: [500, 501] },
        estado: EstadoEntidadeVinculadaPersonagem.ATIVO,
      },
      data: { estado: EstadoEntidadeVinculadaPersonagem.DISPONIVEL },
    });
    expect(resultado).toEqual(detalheEncerrada);
  });

  it('libera vinculados ativos ao encerrar sem alterar estados finais', async () => {
    const tx = {
      npcAmeacaSessao: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            { entidadeVinculadaId: 500 },
            { entidadeVinculadaId: 500 },
            { entidadeVinculadaId: 501 },
            { entidadeVinculadaId: null },
          ]),
      },
      personagemCampanhaEntidadeVinculada: {
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };

    await (service as any).liberarEntidadesVinculadasAtivasSessaoTx(tx, 21);

    expect(
      tx.personagemCampanhaEntidadeVinculada.updateMany,
    ).toHaveBeenCalledWith({
      where: {
        id: { in: [500, 501] },
        estado: EstadoEntidadeVinculadaPersonagem.ATIVO,
      },
      data: { estado: EstadoEntidadeVinculadaPersonagem.DISPONIVEL },
    });
  });

  it('permite primeiro shikigami e bloqueia segundo ativo na sessao', async () => {
    const tx = {
      npcAmeacaSessao: {
        findMany: jest
          .fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([
            { entidadeVinculadaId: 501, entidadeVinculada: { id: 501 } },
          ]),
      },
    };
    const entidade = {
      id: 500,
      tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
      personagemCampanhaId: 20,
      vagasOcupadas: 1,
      limites: null,
      personagemCampanha: { nivel: 1 },
    };

    await expect(
      (service as any).validarLimiteEntidadeVinculadaAtivaTx(tx, 21, entidade),
    ).resolves.toBeUndefined();
    await expect(
      (service as any).validarLimiteEntidadeVinculadaAtivaTx(tx, 21, entidade),
    ).rejects.toMatchObject({
      code: 'ENTIDADE_SHIKIGAMI_LIMITE_ATIVO',
    });
  });

  it('permite mais de um shikigami quando limite ativo foi configurado', async () => {
    const tx = {
      npcAmeacaSessao: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            { entidadeVinculadaId: 501, entidadeVinculada: { id: 501 } },
          ]),
      },
    };

    await expect(
      (service as any).validarLimiteEntidadeVinculadaAtivaTx(tx, 21, {
        id: 500,
        tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
        personagemCampanhaId: 20,
        vagasOcupadas: 1,
        limites: { limiteAtivo: 2 },
        overrideMestre: true,
        personagemCampanha: { nivel: 1 },
      }),
    ).resolves.toBeUndefined();
  });

  it('usa limite ativo declarado pela tecnica do shikigami', async () => {
    const tx = {
      tecnicaVinculadoConfig: {
        findFirst: jest.fn().mockResolvedValue({
          id: 80,
          tecnicaId: 90,
          tipoVinculado: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
          modo: ModoVinculadoTecnica.HIBRIDO,
          limitesJson: {
            cadastro: { tipo: 'QUANTIDADE', valor: 3 },
            ativo: { tipo: 'QUANTIDADE', valor: 2 },
          },
          regrasJson: { permiteCriarNovos: true, usaTemplates: true },
          calculoJson: { regra: 'SHIKIGAMI_V1', versao: '1.0.0' },
          tecnica: { codigo: 'SHIKIGAMI_HIBRIDO', nome: 'Hibrido' },
        }),
      },
      npcAmeacaSessao: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            { entidadeVinculadaId: 501, entidadeVinculada: { id: 501 } },
          ]),
      },
    };

    await expect(
      (service as any).validarLimiteEntidadeVinculadaAtivaTx(tx, 21, {
        id: 500,
        tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
        personagemCampanhaId: 20,
        tecnicaOrigemId: 90,
        vagasOcupadas: 1,
        limites: null,
        overrideMestre: false,
        personagemCampanha: { nivel: 5 },
      }),
    ).resolves.toBeUndefined();
    expect(tx.tecnicaVinculadoConfig.findFirst).toHaveBeenCalled();
  });

  it('respeita vagas de corpo pesado pelo nivel do personagem', async () => {
    const tx = {
      npcAmeacaSessao: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    const corpoPesado = {
      id: 500,
      tipo: TipoEntidadeVinculadaPersonagem.CORPO_AMALDICOADO,
      personagemCampanhaId: 20,
      vagasOcupadas: 2,
      limites: null,
      personagemCampanha: { nivel: 1 },
    };

    await expect(
      (service as any).validarLimiteEntidadeVinculadaAtivaTx(
        tx,
        21,
        corpoPesado,
      ),
    ).rejects.toMatchObject({ code: 'ENTIDADE_CORPO_LIMITE_VAGAS' });

    await expect(
      (service as any).validarLimiteEntidadeVinculadaAtivaTx(tx, 21, {
        ...corpoPesado,
        personagemCampanha: { nivel: 5 },
      }),
    ).resolves.toBeUndefined();
  });

  it('nao aplica limite automatico a maldicao controlada', async () => {
    const tx = {
      npcAmeacaSessao: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    await expect(
      (service as any).validarLimiteEntidadeVinculadaAtivaTx(tx, 21, {
        id: 500,
        tipo: TipoEntidadeVinculadaPersonagem.MALDICAO_CONTROLADA,
        personagemCampanhaId: 20,
        vagasOcupadas: 1,
        limites: null,
        personagemCampanha: { nivel: 1 },
      }),
    ).resolves.toBeUndefined();
    expect(tx.npcAmeacaSessao.findMany).toHaveBeenCalled();
  });

  it('nao permite duplicar a mesma entidade mesmo com override do mestre', async () => {
    const tx = {
      npcAmeacaSessao: {
        findMany: jest.fn().mockResolvedValue([
          {
            entidadeVinculadaId: 500,
            entidadeVinculada: { id: 500, vagasOcupadas: 1 },
          },
        ]),
      },
    };

    await expect(
      (service as any).validarLimiteEntidadeVinculadaAtivaTx(
        tx,
        21,
        {
          id: 500,
          tipo: TipoEntidadeVinculadaPersonagem.MALDICAO_CONTROLADA,
          personagemCampanhaId: 20,
          tecnicaOrigemId: null,
          vagasOcupadas: 1,
          limites: null,
          overrideMestre: true,
          personagemCampanha: { nivel: 1 },
        },
        true,
      ),
    ).rejects.toMatchObject({ code: 'ENTIDADE_JA_ATIVA' });
  });

  it('desinvoca vinculado e retorna estado para disponivel', async () => {
    jest.spyOn(service as any, 'obterSessaoComAcesso').mockResolvedValue({
      acesso: { ehMestre: false },
      sessao: { status: 'EM_ANDAMENTO' },
    });
    jest
      .spyOn(service, 'buscarDetalheSessao')
      .mockResolvedValue({ id: 21 } as never);
    const npcSessao = {
      id: 700,
      sessaoId: 21,
      cenaId: 31,
      npcAmeacaId: null,
      entidadeVinculadaId: 500,
      personagemDonoId: 20,
      tipoVinculo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
      nomeExibicao: 'Cao Divino',
      fichaTipo: TipoFichaNpcAmeaca.NPC,
      tipo: TipoNpcAmeaca.OUTRO,
      vd: 0,
      iniciativaValor: null,
      defesa: 12,
      pontosVidaAtual: 10,
      pontosVidaMax: 10,
      sanAtual: null,
      sanMax: null,
      eaAtual: null,
      eaMax: null,
      machucado: null,
      deslocamentoMetros: 6,
      passivasGuia: null,
      acoesGuia: null,
      notasCena: null,
      ocultoJogadores: false,
      entidadeVinculada: {
        personagemCampanha: { id: 20, donoId: 10 },
      },
    };
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: 20 }]),
      sessao: {
        findUnique: jest.fn().mockResolvedValue({
          id: 21,
          campanhaId: 7,
          status: 'EM_ANDAMENTO',
        }),
      },
      npcAmeacaSessao: {
        findFirst: jest.fn().mockResolvedValue(npcSessao),
        delete: jest.fn().mockResolvedValue({}),
      },
      personagemCampanhaEntidadeVinculada: {
        update: jest.fn().mockResolvedValue({}),
      },
      eventoSessao: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };
    prisma.$transaction.mockImplementation(
      async (callback: (txArg: typeof tx) => Promise<unknown>) => callback(tx),
    );

    await service.desinvocarEntidadeVinculadaSessao(7, 21, 700, 10);

    expect(tx.npcAmeacaSessao.delete).toHaveBeenCalledWith({
      where: { id: 700 },
    });
    expect(tx.personagemCampanhaEntidadeVinculada.update).toHaveBeenCalledWith({
      where: { id: 500 },
      data: { estado: EstadoEntidadeVinculadaPersonagem.DISPONIVEL },
    });
  });

  it('bloqueia jogador tentando invocar vinculado de outro personagem', async () => {
    jest.spyOn(service as any, 'obterSessaoComAcesso').mockResolvedValue({
      acesso: { ehMestre: false },
      sessao: { status: 'EM_ANDAMENTO' },
    });
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: 20 }]),
      sessao: {
        findUnique: jest.fn().mockResolvedValue({
          id: 21,
          campanhaId: 7,
          status: 'EM_ANDAMENTO',
        }),
      },
      personagemCampanhaEntidadeVinculada: {
        findFirst: jest.fn().mockResolvedValue({
          id: 500,
          campanhaId: 7,
          estado: EstadoEntidadeVinculadaPersonagem.DISPONIVEL,
          personagemCampanha: { id: 20, nome: 'Outro', donoId: 99, nivel: 1 },
        }),
      },
    };
    prisma.$transaction.mockImplementation(
      async (callback: (txArg: typeof tx) => Promise<unknown>) => callback(tx),
    );

    await expect(
      service.invocarEntidadeVinculadaSessao(7, 21, 500, 10, {}),
    ).rejects.toMatchObject({ code: 'ENTIDADE_ACESSO_NEGADO' });
  });

  it('permite mestre invocar vinculado e cria instancia de NPC da sessao', async () => {
    jest.spyOn(service as any, 'obterSessaoComAcesso').mockResolvedValue({
      acesso: { ehMestre: true },
      sessao: { status: 'EM_ANDAMENTO' },
    });
    jest
      .spyOn(service as any, 'obterCenaAtualSessaoTx')
      .mockResolvedValue({ id: 31 });
    jest
      .spyOn(service as any, 'validarLimiteEntidadeVinculadaAtivaTx')
      .mockResolvedValue(undefined);
    jest
      .spyOn(service, 'buscarDetalheSessao')
      .mockResolvedValue({ id: 21 } as never);
    const entidade = {
      id: 500,
      campanhaId: 7,
      personagemCampanhaId: 20,
      tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
      estado: EstadoEntidadeVinculadaPersonagem.DISPONIVEL,
      nome: 'Cao Divino',
      descricao: null,
      conceito: 'lobo branco',
      fichaTipo: TipoFichaNpcAmeaca.NPC,
      tipoNpc: TipoNpcAmeaca.OUTRO,
      tamanho: 'MEDIO',
      vd: 0,
      defesa: 12,
      pontosVidaAtual: 10,
      pontosVidaMax: 10,
      cargasAtual: null,
      cargasMax: null,
      deslocamentoMetros: 6,
      agilidade: 1,
      forca: 1,
      intelecto: 0,
      presenca: 0,
      vigor: 1,
      percepcao: 0,
      iniciativa: 0,
      fortitude: 0,
      reflexos: 0,
      vontade: 0,
      luta: 0,
      jujutsu: 0,
      passivas: null,
      acoes: null,
      personagemCampanha: { id: 20, nome: 'Dono', donoId: 99, nivel: 1 },
    };
    const npcSessao = {
      id: 700,
      npcAmeacaId: null,
      nomeExibicao: 'Cao Divino',
      fichaTipo: TipoFichaNpcAmeaca.NPC,
      tipo: TipoNpcAmeaca.OUTRO,
      vd: 0,
      iniciativaValor: null,
      defesa: 12,
      pontosVidaAtual: 10,
      pontosVidaMax: 10,
      sanAtual: null,
      sanMax: null,
      eaAtual: null,
      eaMax: null,
      machucado: null,
      deslocamentoMetros: 6,
      passivasGuia: null,
      acoesGuia: null,
      notasCena: null,
      ocultoJogadores: true,
      cenaId: 31,
    };
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: 20 }]),
      sessao: {
        findUnique: jest.fn().mockResolvedValue({
          id: 21,
          campanhaId: 7,
          status: 'EM_ANDAMENTO',
        }),
      },
      personagemCampanhaEntidadeVinculada: {
        findFirst: jest.fn().mockResolvedValue(entidade),
        update: jest.fn().mockResolvedValue({}),
      },
      personagemSessao: {
        findFirst: jest.fn().mockResolvedValue({ id: 300 }),
      },
      npcAmeacaSessao: {
        create: jest.fn().mockResolvedValue(npcSessao),
      },
      eventoSessao: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };
    prisma.$transaction.mockImplementation(
      async (callback: (txArg: typeof tx) => Promise<unknown>) => callback(tx),
    );

    await service.invocarEntidadeVinculadaSessao(7, 21, 500, 10, {
      ocultoJogadores: true,
    });

    expect(tx.npcAmeacaSessao.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          entidadeVinculadaId: 500,
          personagemDonoId: 20,
          personagemControladorSessaoId: 300,
          ocultoJogadores: true,
        }),
      }),
    );
    expect(tx.personagemCampanhaEntidadeVinculada.update).toHaveBeenCalledWith({
      where: { id: 500 },
      data: { estado: EstadoEntidadeVinculadaPersonagem.ATIVO },
    });
  });

  it('serializa invocacoes concorrentes da mesma entidade', async () => {
    jest.spyOn(service as any, 'obterSessaoComAcesso').mockResolvedValue({
      acesso: { ehMestre: true },
      sessao: { status: 'EM_ANDAMENTO' },
    });
    jest
      .spyOn(service as any, 'obterCenaAtualSessaoTx')
      .mockResolvedValue({ id: 31 });
    jest
      .spyOn(service, 'buscarDetalheSessao')
      .mockResolvedValue({ id: 21 } as never);
    const entidade = {
      id: 500,
      campanhaId: 7,
      personagemCampanhaId: 20,
      tecnicaOrigemId: null,
      tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
      estado: EstadoEntidadeVinculadaPersonagem.DISPONIVEL,
      nome: 'Cao Divino',
      descricao: null,
      conceito: null,
      fichaTipo: TipoFichaNpcAmeaca.NPC,
      tipoNpc: TipoNpcAmeaca.OUTRO,
      tamanho: 'MEDIO',
      vd: 0,
      defesa: 12,
      pontosVidaAtual: 10,
      pontosVidaMax: 10,
      cargasAtual: null,
      cargasMax: null,
      deslocamentoMetros: 6,
      agilidade: 1,
      forca: 1,
      intelecto: 0,
      presenca: 0,
      vigor: 1,
      percepcao: 0,
      iniciativa: 0,
      fortitude: 0,
      reflexos: 0,
      vontade: 0,
      luta: 0,
      jujutsu: 0,
      passivas: null,
      acoes: null,
      vagasOcupadas: 1,
      limites: null,
      overrideMestre: false,
      personagemCampanha: { id: 20, nome: 'Dono', donoId: 99, nivel: 1 },
    };
    const ativos: Array<{
      entidadeVinculadaId: number;
      entidadeVinculada: { id: number; vagasOcupadas: number };
    }> = [];
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: 20 }]),
      sessao: {
        findUnique: jest.fn().mockResolvedValue({
          id: 21,
          campanhaId: 7,
          status: 'EM_ANDAMENTO',
        }),
      },
      personagemCampanhaEntidadeVinculada: {
        findFirst: jest.fn().mockResolvedValue(entidade),
        update: jest.fn().mockResolvedValue({}),
      },
      personagemSessao: {
        findFirst: jest.fn().mockResolvedValue({ id: 300 }),
      },
      tecnicaVinculadoConfig: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      npcAmeacaSessao: {
        findMany: jest
          .fn()
          .mockImplementation(() => Promise.resolve([...ativos])),
        create: jest
          .fn()
          .mockImplementation(({ data }: { data: Record<string, unknown> }) => {
            ativos.push({
              entidadeVinculadaId: 500,
              entidadeVinculada: { id: 500, vagasOcupadas: 1 },
            });
            return Promise.resolve({ id: 700, ...data });
          }),
      },
      eventoSessao: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };
    let fila = Promise.resolve<unknown>(undefined);
    prisma.$transaction.mockImplementation(
      (callback: (txArg: typeof tx) => Promise<unknown>) => {
        const resultado = fila.then(() => callback(tx));
        fila = resultado.then(
          () => undefined,
          () => undefined,
        );
        return resultado;
      },
    );

    const resultados = await Promise.allSettled([
      service.invocarEntidadeVinculadaSessao(7, 21, 500, 10, {}),
      service.invocarEntidadeVinculadaSessao(7, 21, 500, 10, {}),
    ]);

    expect(
      resultados.filter((item) => item.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(resultados.filter((item) => item.status === 'rejected')).toEqual([
      expect.objectContaining({
        reason: expect.objectContaining({ code: 'ENTIDADE_JA_ATIVA' }),
      }),
    ]);
    expect(tx.npcAmeacaSessao.create).toHaveBeenCalledTimes(1);
    expect(tx.eventoSessao.create).toHaveBeenCalledTimes(1);
    expect(tx.$queryRaw).toHaveBeenCalledTimes(2);
  });

  it('deve bloquear desfazer quando evento não for o ultimo reversivel', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 7,
      donoId: 10,
      membros: [],
    });

    const tx = {
      sessao: {
        findUnique: jest.fn().mockResolvedValue({
          id: 21,
          campanhaId: 7,
          status: 'LOBBY',
        }),
      },
      eventoSessao: {
        findFirst: jest.fn().mockResolvedValue({
          id: 100,
          sessaoId: 21,
          tipoEvento: 'TURNO_AVANCADO',
          dados: {
            indiceAnterior: 0,
            indiceNovo: 1,
            rodadaAnterior: 1,
            rodadaNova: 1,
          },
        }),
        findMany: jest.fn().mockResolvedValue([
          {
            id: 200,
            sessaoId: 21,
            tipoEvento: 'NPC_ATUALIZADO',
            dados: {},
          },
          {
            id: 100,
            sessaoId: 21,
            tipoEvento: 'TURNO_AVANCADO',
            dados: {},
          },
        ]),
        create: jest.fn(),
        update: jest.fn(),
      },
      cena: {
        findFirst: jest.fn(),
      },
      personagemSessao: {
        updateMany: jest.fn(),
      },
      npcAmeacaSessao: {
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };

    prisma.$transaction.mockImplementation(
      async (callback: (txArg: typeof tx) => Promise<unknown>) => callback(tx),
    );

    await expect(
      service.desfazerEventoSessao(7, 21, 100, 10, 'corrigir fluxo'),
    ).rejects.toBeInstanceOf(SessaoEventoDesfazerNaoPermitidoException);
    expect(tx.eventoSessao.create).not.toHaveBeenCalled();
    expect(tx.eventoSessao.update).not.toHaveBeenCalled();
  });

  it('deve aplicar acúmulos no custo respeitando grau da técnica', () => {
    const habilidade = {
      id: 999,
      tecnicaId: 77,
      codigo: 'REVESTIMENTO_OFENSIVO',
      nome: 'Revestimento Ofensivo',
      descricao: '',
      requisitos: null,
      execucao: 'Ação padrão',
      area: null,
      alcance: 'Pessoal',
      alvo: 'Você',
      duracao: 'Sustentada',
      custoPE: 0,
      custoEA: 2,
      custoSustentacaoEA: null,
      escalonaPorGrau: true,
      grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
      acumulosMaximos: 3,
      escalonamentoCustoEA: 1,
      escalonamentoDano: null,
      danoFlat: null,
      danoFlatTipo: null,
      efeito: '',
      ordem: 1,
      variacoes: [],
    };

    const custoBase = (service as any).resolverCustoUsoHabilidade(
      habilidade,
      new Map([['TECNICA_AMALDICOADA', 3]]),
      undefined,
      1,
    );
    const custo = (service as any).resolverCustoUsoHabilidade(
      habilidade,
      new Map([['TECNICA_AMALDICOADA', 3]]),
      undefined,
      2,
    );

    expect(custoBase.custoEA).toBe(2);
    expect(custoBase.acumulosAplicados).toBe(1);
    expect(custoBase.isUsoBaseSemEscalonamento).toBe(true);
    expect(custo.custoEA).toBe(3);
    expect(custo.acumulosAplicados).toBe(2);
    expect(custo.acumulosMaximos).toBe(3);
    expect(custo.isUsoBaseSemEscalonamento).toBe(false);
  });

  it('deve bloquear acúmulos acima do grau permitido', () => {
    const habilidade = {
      id: 1000,
      tecnicaId: 77,
      codigo: 'REVESTIMENTO_DEFENSIVO',
      nome: 'Revestimento Defensivo',
      descricao: '',
      requisitos: null,
      execucao: 'Ação padrão',
      area: null,
      alcance: 'Pessoal',
      alvo: 'Você',
      duracao: 'Sustentada',
      custoPE: 0,
      custoEA: 2,
      custoSustentacaoEA: null,
      escalonaPorGrau: true,
      grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
      acumulosMaximos: 1,
      escalonamentoCustoEA: 1,
      escalonamentoDano: null,
      danoFlat: null,
      danoFlatTipo: null,
      efeito: '',
      ordem: 1,
      variacoes: [],
    };

    expect(() =>
      (service as any).resolverCustoUsoHabilidade(
        habilidade,
        new Map([['TECNICA_AMALDICOADA', 1]]),
        undefined,
        2,
      ),
    ).toThrow(BusinessException);

    try {
      (service as any).resolverCustoUsoHabilidade(
        habilidade,
        new Map([['TECNICA_AMALDICOADA', 1]]),
        undefined,
        2,
      );
    } catch (error) {
      const businessError = error as BusinessException;
      expect(businessError.code).toBe('SESSAO_ACUMULO_EXCEDE_GRAU');
    }
  });

  it('deve considerar Aprimorado temporario para liberar tecnica nao inata', () => {
    const personagem = {
      id: 51,
      tecnicaInata: null,
      tecnicaInataPropria: null,
      tecnicasAprendidas: [],
      grausAprimoramento: [
        { valor: 0, tipoGrau: { codigo: 'TECNICA_REVERSA' } },
      ],
      personagemBase: {
        grausAprimoramento: [],
        tecnicasAprendidas: [],
      },
    };
    const tecnicaReversa = {
      id: 10,
      codigo: 'NAOINATA_TECNICA_REVERSA',
      nome: 'Tecnica Reversa',
      descricao: '',
      tipo: 'NAO_INATA',
      requisitos: null,
      habilidades: [
        {
          id: 1001,
          tecnicaId: 10,
          codigo: 'CURA_REVERSA',
          nome: 'Cura Reversa',
          descricao: '',
          requisitos: {
            graus: [{ tipoGrauCodigo: 'TECNICA_REVERSA', valorMinimo: 1 }],
          },
          habilitada: true,
          execucao: 'Acao padrao',
          area: null,
          alcance: 'Toque',
          alvo: 'Criatura',
          duracao: 'Instantanea',
          testesExigidos: null,
          criticoValor: null,
          criticoMultiplicador: null,
          dadosDano: null,
          custoPE: 0,
          custoEA: 2,
          custoSustentacaoEA: null,
          custoSustentacaoPE: null,
          escalonaPorGrau: true,
          grauTipoGrauCodigo: 'TECNICA_REVERSA',
          acumulosMaximos: null,
          escalonamentoCustoEA: 2,
          escalonamentoCustoPE: 0,
          escalonamentoTipo: 'CURA',
          escalonamentoEfeito: null,
          escalonamentoDano: null,
          danoFlat: null,
          danoFlatTipo: null,
          efeito: '',
          ordem: 1,
          variacoes: [],
        },
      ],
    };

    const semAprimorado = (service as any).resolverTecnicasSessaoPersonagem(
      personagem,
      [tecnicaReversa],
    );
    const comAprimorado = (service as any).resolverTecnicasSessaoPersonagem(
      personagem,
      [tecnicaReversa],
      new Map([['TECNICA_REVERSA', 1]]),
    );

    expect(semAprimorado.tecnicasNaoInatas).toHaveLength(0);
    expect(comAprimorado.tecnicasNaoInatas).toHaveLength(1);
    expect(comAprimorado.tecnicasNaoInatas[0].habilidades[0]).toMatchObject({
      id: 1001,
      acumulosMaximos: 1,
    });
  });

  it('deve calcular custo e acumulos com grau efetivo do Aprimorado', () => {
    const personagem = {
      id: 51,
      grausAprimoramento: [
        { valor: 2, tipoGrau: { codigo: 'TECNICA_AMALDICOADA' } },
      ],
      personagemBase: { grausAprimoramento: [] },
    };
    const habilidade = {
      id: 1002,
      tecnicaId: 77,
      codigo: 'REVESTIMENTO_OFENSIVO',
      nome: 'Revestimento Ofensivo',
      descricao: '',
      requisitos: null,
      execucao: 'Acao padrao',
      area: null,
      alcance: 'Pessoal',
      alvo: 'Voce',
      duracao: 'Instantanea',
      custoPE: 0,
      custoEA: 2,
      custoSustentacaoEA: null,
      custoSustentacaoPE: null,
      escalonaPorGrau: true,
      grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
      acumulosMaximos: 3,
      escalonamentoCustoEA: 1,
      escalonamentoCustoPE: 0,
      escalonamentoTipo: 'DANO',
      escalonamentoEfeito: null,
      escalonamentoDano: null,
      danoFlat: null,
      danoFlatTipo: null,
      efeito: '',
      ordem: 1,
      variacoes: [],
    };

    const grausMapEfetivo = (service as any).montarMapaGrausPersonagemSessao(
      personagem,
      new Map([['TECNICA_AMALDICOADA', 1]]),
    );
    const custo = (service as any).resolverCustoUsoHabilidade(
      habilidade,
      grausMapEfetivo,
      undefined,
      3,
    );

    expect(grausMapEfetivo.get('TECNICA_AMALDICOADA')).toBe(3);
    expect(custo.acumulosAplicados).toBe(3);
    expect(custo.acumulosMaximos).toBe(3);
    expect(custo.custoEA).toBe(4);
  });

  it('deve ignorar Aprimorado temporario de outra cena', () => {
    const estado = {
      pendentesRolagem: {},
      aprimoramentosTemporarios: {
        51: [
          {
            id: 'aprimorado:outra-cena',
            eventoId: 1,
            personagemSessaoId: 41,
            personagemCampanhaId: 51,
            tecnicaId: 10,
            tecnicaNome: 'Tecnica Reversa',
            tipoGrauCodigo: 'TECNICA_REVERSA',
            graus: 1,
            cenaId: 8,
            criadoEm: new Date().toISOString(),
          },
        ],
      },
    };

    const ativos = (service as any).listarAprimoramentosTemporariosAtivos(
      estado,
      51,
      7,
    );
    const bonus = (service as any).montarBonusGrausAprimoramentoTemporario(
      ativos,
    );

    expect(ativos).toHaveLength(0);
    expect(bonus.get('TECNICA_REVERSA')).toBeUndefined();
  });

  it('deve listar apenas Aprimorado temporario da cena atual', () => {
    const estado = {
      pendentesRolagem: {},
      aprimoramentosTemporarios: {
        51: [
          {
            id: 'aprimorado:atual',
            eventoId: 1,
            personagemSessaoId: 41,
            personagemCampanhaId: 51,
            tecnicaId: 10,
            tecnicaNome: 'Tecnica Reversa',
            tipoGrauCodigo: 'TECNICA_REVERSA',
            graus: 1,
            cenaId: 8,
            criadoEm: new Date().toISOString(),
          },
          {
            id: 'aprimorado:antigo',
            eventoId: 2,
            personagemSessaoId: 41,
            personagemCampanhaId: 51,
            tecnicaId: 11,
            tecnicaNome: 'Barreira',
            tipoGrauCodigo: 'BARREIRA',
            graus: 2,
            cenaId: 7,
            criadoEm: new Date().toISOString(),
          },
        ],
      },
    };

    const ativos = (service as any).listarAprimoramentosTemporariosAtivos(
      estado,
      51,
      8,
    );

    expect(ativos).toHaveLength(1);
    expect(ativos[0]).toMatchObject({ id: 'aprimorado:atual', cenaId: 8 });
  });

  function criarTxLimpezaAprimorado(estado: Record<string, unknown> | null) {
    return {
      sessaoRegraOpcional: {
        findUnique: jest
          .fn()
          .mockResolvedValue(estado ? { id: 77, estado } : null),
        update: jest.fn().mockResolvedValue({}),
      },
    };
  }

  it('deve limpar Aprimorados expirados preservando cena atual e Perito', async () => {
    const pendentePerito = criarPendentePeritoTeste();
    const estado = {
      pendentesRolagem: {
        '51:9': pendentePerito,
      },
      aprimoramentosTemporarios: {
        51: [
          {
            id: 'aprimorado:atual',
            eventoId: 1,
            personagemSessaoId: 41,
            personagemCampanhaId: 51,
            tecnicaId: 10,
            tecnicaNome: 'Tecnica Reversa',
            tipoGrauCodigo: 'TECNICA_REVERSA',
            graus: 1,
            cenaId: 8,
            criadoEm: new Date().toISOString(),
          },
          {
            id: 'aprimorado:antigo',
            eventoId: 2,
            personagemSessaoId: 41,
            personagemCampanhaId: 51,
            tecnicaId: 11,
            tecnicaNome: 'Barreira',
            tipoGrauCodigo: 'BARREIRA',
            graus: 2,
            cenaId: 7,
            criadoEm: new Date().toISOString(),
          },
        ],
        52: [
          {
            id: 'aprimorado:outro-personagem',
            eventoId: 3,
            personagemSessaoId: 42,
            personagemCampanhaId: 52,
            tecnicaId: 12,
            tecnicaNome: 'Dominio',
            tipoGrauCodigo: 'DOMINIO',
            graus: 1,
            cenaId: 7,
            criadoEm: new Date().toISOString(),
          },
        ],
      },
    };
    const tx = criarTxLimpezaAprimorado(estado);

    await (service as any).limparAprimoramentosTemporariosExpiradosTx(
      tx,
      21,
      8,
    );

    expect(tx.sessaoRegraOpcional.update).toHaveBeenCalledTimes(1);
    const estadoSalvo = tx.sessaoRegraOpcional.update.mock.calls[0][0].data
      .estado as Record<string, unknown>;
    expect(JSON.stringify(estadoSalvo)).toContain('aprimorado:atual');
    expect(JSON.stringify(estadoSalvo)).not.toContain('aprimorado:antigo');
    expect(JSON.stringify(estadoSalvo)).not.toContain(
      'aprimorado:outro-personagem',
    );
    expect(JSON.stringify(estadoSalvo)).toContain(pendentePerito.id);
  });

  it('nao deve criar estado vazio ao limpar Aprimorado sem regra interna', async () => {
    const tx = criarTxLimpezaAprimorado(null);

    await (service as any).limparAprimoramentosTemporariosExpiradosTx(
      tx,
      21,
      8,
    );

    expect(tx.sessaoRegraOpcional.update).not.toHaveBeenCalled();
  });

  it('deve ser idempotente quando so existem Aprimorados da cena atual', async () => {
    const estado = {
      pendentesRolagem: {},
      aprimoramentosTemporarios: {
        51: [
          {
            id: 'aprimorado:atual',
            eventoId: 1,
            personagemSessaoId: 41,
            personagemCampanhaId: 51,
            tecnicaId: 10,
            tecnicaNome: 'Tecnica Reversa',
            tipoGrauCodigo: 'TECNICA_REVERSA',
            graus: 1,
            cenaId: 8,
            criadoEm: new Date().toISOString(),
          },
        ],
      },
    };
    const tx = criarTxLimpezaAprimorado(estado);

    await (service as any).limparAprimoramentosTemporariosExpiradosTx(
      tx,
      21,
      8,
    );

    expect(tx.sessaoRegraOpcional.update).not.toHaveBeenCalled();
  });

  it('deve recuperar EA por Produção Acelerada usando acúmulos', async () => {
    const tx = {
      condicao: {
        findMany: jest.fn().mockResolvedValue([
          { id: 10, nome: 'Produção Acelerada' },
          { id: 11, nome: 'Produção Acelerada' },
          { id: 12, nome: 'Cura Acelerada' },
        ]),
      },
      condicaoPersonagemSessao: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 501,
            condicaoId: 10,
            acumulos: 2,
            fonteCodigo: null,
            limiteFonte: null,
            condicao: { nome: 'Produção Acelerada' },
          },
        ]),
      },
      personagemCampanha: {
        update: jest.fn().mockResolvedValue({}),
      },
      eventoSessao: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    await (service as any).processarCondicoesAceleradasPersonagemTurnoTx(tx, {
      sessaoId: 21,
      cenaId: 31,
      personagemSessaoId: 41,
      personagemCampanha: {
        id: 51,
        pvAtual: 20,
        pvMax: 30,
        eaAtual: 3,
        eaMax: 8,
      },
    });

    expect(tx.personagemCampanha.update).toHaveBeenCalledWith({
      where: { id: 51 },
      data: { eaAtual: 5 },
    });
    expect(tx.eventoSessao.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tipoEvento: 'CONDICAO_RECUPERACAO_AUTOMATICA',
          dados: expect.objectContaining({
            recurso: 'EA',
            acumulos: 2,
            valorRecuperado: 2,
            valorAntes: 3,
            valorDepois: 5,
          }),
        }),
      }),
    );
  });

  it('deve recuperar PV por Cura Acelerada usando acúmulos sem exceder o maximo', async () => {
    const tx = {
      condicao: {
        findMany: jest.fn().mockResolvedValue([
          { id: 10, nome: 'Produção Acelerada' },
          { id: 12, nome: 'Cura Acelerada' },
        ]),
      },
      condicaoPersonagemSessao: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 502,
            condicaoId: 12,
            acumulos: 3,
            fonteCodigo: null,
            limiteFonte: null,
            condicao: { nome: 'Cura Acelerada' },
          },
        ]),
      },
      personagemCampanha: {
        update: jest.fn().mockResolvedValue({}),
      },
      eventoSessao: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    await (service as any).processarCondicoesAceleradasPersonagemTurnoTx(tx, {
      sessaoId: 21,
      cenaId: 31,
      personagemSessaoId: 41,
      personagemCampanha: {
        id: 51,
        pvAtual: 28,
        pvMax: 30,
        eaAtual: 3,
        eaMax: 8,
      },
    });

    expect(tx.personagemCampanha.update).toHaveBeenCalledWith({
      where: { id: 51 },
      data: { pvAtual: 30 },
    });
    expect(tx.eventoSessao.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          dados: expect.objectContaining({
            recurso: 'PV',
            acumulos: 3,
            valorRecuperado: 2,
            valorAntes: 28,
            valorDepois: 30,
          }),
        }),
      }),
    );
  });

  it('deve recuperar EA de NPC com alias legado Produção Acelerada', async () => {
    const tx = {
      condicao: {
        findMany: jest.fn().mockResolvedValue([
          { id: 11, nome: 'Produção Acelerada' },
          { id: 12, nome: 'Cura Acelerada' },
        ]),
      },
      npcAmeacaSessao: {
        findFirst: jest.fn().mockResolvedValue({
          id: 61,
          pontosVidaAtual: 10,
          pontosVidaMax: 20,
          eaAtual: 1,
          eaMax: 4,
        }),
        update: jest.fn().mockResolvedValue({}),
      },
      condicaoPersonagemSessao: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 503,
            condicaoId: 11,
            acumulos: 5,
            fonteCodigo: null,
            limiteFonte: null,
            condicao: { nome: 'Produção Acelerada' },
          },
        ]),
      },
      eventoSessao: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    await (service as any).processarCondicoesAceleradasNpcTurnoTx(tx, {
      sessaoId: 21,
      cenaId: 31,
      npcSessaoId: 61,
    });

    expect(tx.npcAmeacaSessao.update).toHaveBeenCalledWith({
      where: { id: 61 },
      data: { eaAtual: 4 },
    });
    expect(tx.eventoSessao.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          dados: expect.objectContaining({
            recurso: 'EA',
            acumulos: 5,
            valorRecuperado: 3,
            valorAntes: 1,
            valorDepois: 4,
          }),
        }),
      }),
    );
  });

  it('deve considerar uso base no somatorio de limite por turno', async () => {
    const tx = {
      eventoSessao: {
        findMany: jest.fn().mockResolvedValue([
          {
            dados: {
              turnoReferencia: '3:2',
              custoEA: 2,
              custoPE: 0,
              usoBaseSemEscalonamento: true,
            },
          },
          {
            dados: {
              turnoReferencia: '3:2',
              custoEA: 3,
              custoPE: 1,
              usoBaseSemEscalonamento: false,
            },
          },
        ]),
      },
    };

    const gasto = await (service as any).calcularGastoPeEaNoTurnoAtual(
      tx,
      1,
      10,
      '3:2',
    );

    expect(gasto).toBe(6);
    expect(tx.eventoSessao.findMany).toHaveBeenCalled();
  });

  it('deve permitir estourar limite apenas no primeiro uso base sem escalonamento', () => {
    const bloqueado = (service as any).deveBloquearPorLimitePeEaTurno(
      1,
      0,
      2,
      true,
    );

    expect(bloqueado).toBe(false);
  });

  it('deve bloquear novo uso quando já houve gasto no turno, mesmo sendo uso base sem escalonamento', () => {
    const bloqueado = (service as any).deveBloquearPorLimitePeEaTurno(
      1,
      2,
      1,
      true,
    );

    expect(bloqueado).toBe(true);
  });

  it('deve bloquear uso não-base ao exceder limite por turno', () => {
    const bloqueado = (service as any).deveBloquearPorLimitePeEaTurno(
      5,
      4,
      2,
      false,
    );

    expect(bloqueado).toBe(true);
  });

  it('deve cobrar sustentacao em EA e PE ao avancar para nova rodada', async () => {
    const acessoMestre = {
      campanha: {
        id: 7,
        donoId: 10,
        dono: { id: 10, apelido: 'Mestre' },
        membros: [],
      },
      ehDono: true,
      ehMestre: true,
    };

    const participantes = [
      {
        tipoParticipante: 'PERSONAGEM',
        token: 'PERSONAGEM:501',
        personagemSessaoId: 501,
        npcSessaoId: null,
        personagemCampanhaId: 900,
        donoId: 10,
        nomeJogador: 'Mestre',
        nomePersonagem: 'Heroi',
        podeEditar: true,
      },
    ];

    jest
      .spyOn(service as any, 'obterAcessoCampanha')
      .mockResolvedValue(acessoMestre);
    jest
      .spyOn(service as any, 'obterCenaAtualSessaoTx')
      .mockResolvedValue({ id: 111 });
    jest
      .spyOn(service as any, 'carregarParticipantesIniciativa')
      .mockResolvedValue(participantes);
    jest
      .spyOn(service as any, 'obterOrdemIniciativaPersistida')
      .mockResolvedValue([]);
    jest
      .spyOn(service as any, 'aplicarOrdemIniciativaPersistida')
      .mockReturnValue(participantes);
    jest
      .spyOn(service, 'buscarDetalheSessao')
      .mockResolvedValue({ id: 21 } as never);
    jest
      .spyOn(service as any, 'processarCondicoesNoAvancoTurnoTx')
      .mockResolvedValue(undefined);

    const tx = {
      sessao: {
        findUnique: jest.fn().mockResolvedValue({
          id: 21,
          campanhaId: 7,
          cenaAtualTipo: 'COMBATE',
          indiceTurnoAtual: 0,
          rodadaAtual: 3,
        }),
        update: jest.fn().mockResolvedValue({ id: 21 }),
      },
      personagemSessaoHabilidadeSustentada: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 1001,
            sessaoId: 21,
            personagemSessaoId: 501,
            nomeHabilidade: 'Disparo Concentrado',
            nomeVariacao: null,
            custoSustentacaoEA: 2,
            custoSustentacaoPE: 3,
            ultimaCobrancaRodada: 3,
            habilidadeTecnicaId: 700,
            variacaoHabilidadeId: null,
            personagemSessao: {
              personagemCampanha: {
                id: 900,
                eaAtual: 10,
                peAtual: 9,
              },
            },
          },
        ]),
        update: jest.fn().mockResolvedValue({ id: 1001 }),
      },
      personagemCampanha: {
        update: jest.fn().mockResolvedValue({ id: 900 }),
      },
      eventoSessao: {
        create: jest.fn().mockResolvedValue({ id: 3001 }),
      },
    };

    const eventoEfeitos = configurarTransacaoEfeitosAutomaticos(tx);

    await service.avancarTurnoSessao(7, 21, 10, {
      rodadaEsperada: 3,
      indiceTurnoEsperado: 0,
    });

    expect(tx.sessao.update).toHaveBeenCalledWith({
      where: { id: 21 },
      data: {
        indiceTurnoAtual: 0,
        rodadaAtual: 4,
      },
    });
    expect(tx.personagemCampanha.update).toHaveBeenCalledWith({
      where: { id: 900 },
      data: {
        eaAtual: 8,
        peAtual: 6,
      },
    });
    expect(tx.personagemSessaoHabilidadeSustentada.update).toHaveBeenCalledWith(
      {
        where: { id: 1001 },
        data: {
          ultimaCobrancaRodada: 4,
        },
      },
    );

    const tiposEvento = [
      ...tx.eventoSessao.create.mock.calls,
      ...eventoEfeitos.create.mock.calls,
    ].map(([call]) => call.data.tipoEvento);
    expect(tiposEvento).toContain('HABILIDADE_SUSTENTADA_COBRADA');
    expect(tiposEvento).toContain('TURNO_AVANCADO');

    const eventoCobranca = eventoEfeitos.create.mock.calls.find(
      ([call]) => call.data.tipoEvento === 'HABILIDADE_SUSTENTADA_COBRADA',
    )?.[0];
    expect(eventoCobranca).toBeDefined();
    expect(eventoCobranca?.data?.dados).toEqual(
      expect.objectContaining({
        custoEA: 2,
        custoPE: 3,
        rodada: 4,
      }),
    );
  });

  it('deve cobrar sustentacao e processar todo lado ao virar rodada na iniciativa alternada', async () => {
    const acessoMestre = {
      campanha: {
        id: 7,
        donoId: 10,
        dono: { id: 10, apelido: 'Mestre' },
        membros: [],
      },
      ehDono: true,
      ehMestre: true,
    };
    const participantes = [
      {
        tipoParticipante: 'PERSONAGEM' as const,
        token: 'PERSONAGEM:501',
        personagemSessaoId: 501,
        npcSessaoId: null,
        personagemCampanhaId: 900,
        donoId: 10,
        nomeJogador: 'Mestre',
        nomePersonagem: 'Heroi',
        podeEditar: true,
      },
      {
        tipoParticipante: 'NPC' as const,
        token: 'NPC:601',
        personagemSessaoId: null,
        npcSessaoId: 601,
        personagemCampanhaId: null,
        donoId: null,
        nomeJogador: null,
        nomePersonagem: 'Ameaca',
        podeEditar: true,
      },
    ];
    type SessaoServiceInternals = {
      obterAcessoCampanha: (
        campanhaId: number,
        usuarioId: number,
      ) => Promise<typeof acessoMestre>;
      obterCenaAtualSessaoTx: (
        txArg: unknown,
        sessaoId: number,
      ) => Promise<{ id: number }>;
      carregarParticipantesIniciativa: (
        txArg: unknown,
        sessaoId: number,
        cenaAtualId: number,
        ehMestre: boolean,
        usuarioId: number,
      ) => Promise<typeof participantes>;
      obterOuCriarIniciativaAlternadaTx: (
        txArg: unknown,
        sessaoId: number,
        participantesArg: typeof participantes,
      ) => Promise<unknown>;
      processarCondicoesNoAvancoTurnoTx: (
        txArg: unknown,
        args: {
          sessaoId: number;
          cenaId: number;
          rodadaAnterior: number;
          rodadaNova: number;
          participanteTurnoNovo: (typeof participantes)[number] | null;
          processarDuracoesPorRodada?: boolean;
        },
      ) => Promise<void>;
    };
    const internals = service as unknown as SessaoServiceInternals;

    jest
      .spyOn(internals, 'obterAcessoCampanha')
      .mockResolvedValue(acessoMestre);
    jest
      .spyOn(internals, 'obterCenaAtualSessaoTx')
      .mockResolvedValue({ id: 111 });
    jest
      .spyOn(internals, 'carregarParticipantesIniciativa')
      .mockResolvedValue(participantes);
    jest
      .spyOn(internals, 'obterOuCriarIniciativaAlternadaTx')
      .mockResolvedValue({
        ativo: true,
        ladoAtualId: 20,
        lados: [],
      });
    const processarCondicoesSpy = jest
      .spyOn(internals, 'processarCondicoesNoAvancoTurnoTx')
      .mockResolvedValue(undefined);
    jest
      .spyOn(service, 'buscarDetalheSessao')
      .mockResolvedValue({ id: 21 } as never);
    jest
      .spyOn(service as any, 'processarCondicoesNoAvancoTurnoTx')
      .mockResolvedValue(undefined);

    const tx = {
      sessao: {
        findUnique: jest.fn().mockResolvedValue({
          id: 21,
          campanhaId: 7,
          cenaAtualTipo: 'COMBATE',
          indiceTurnoAtual: 0,
          rodadaAtual: 3,
        }),
        update: jest.fn().mockResolvedValue({ id: 21 }),
      },
      sessaoRegraOpcional: {
        findUnique: jest.fn().mockResolvedValue({ ativo: true }),
      },
      sessaoIniciativaAlternada: {
        findUnique: jest.fn().mockResolvedValue({
          id: 44,
          sessaoId: 21,
          ladoAtualId: 10,
          lados: [
            {
              id: 20,
              nome: 'Oposicao',
              ordem: 0,
              participantes: [
                { participanteToken: 'PERSONAGEM:501', ordem: 0 },
                { participanteToken: 'NPC:601', ordem: 1 },
              ],
            },
            {
              id: 10,
              nome: 'Jogadores',
              ordem: 1,
              participantes: [],
            },
          ],
        }),
        update: jest.fn().mockResolvedValue({ id: 44 }),
      },
      sessaoIniciativaAlternadaParticipante: {
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
      personagemSessaoHabilidadeSustentada: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 1001,
            sessaoId: 21,
            personagemSessaoId: 501,
            nomeHabilidade: 'Barreira',
            nomeVariacao: null,
            custoSustentacaoEA: 2,
            custoSustentacaoPE: 1,
            acumulos: 1,
            ultimaCobrancaRodada: 3,
            habilidadeTecnicaId: 700,
            variacaoHabilidadeId: null,
            personagemSessao: {
              personagemCampanha: {
                id: 900,
                eaAtual: 5,
                peAtual: 3,
              },
            },
          },
        ]),
        update: jest.fn().mockResolvedValue({ id: 1001 }),
      },
      personagemCampanha: {
        update: jest.fn().mockResolvedValue({ id: 900 }),
      },
      eventoSessao: {
        create: jest.fn().mockResolvedValue({ id: 3001 }),
      },
    };

    const eventoEfeitos = configurarTransacaoEfeitosAutomaticos(tx);

    await service.avancarTurnoSessao(7, 21, 10, {
      rodadaEsperada: 3,
      ladoAtualIdEsperado: 10,
    });

    expect(tx.sessao.update).toHaveBeenCalledWith({
      where: { id: 21 },
      data: {
        rodadaAtual: 4,
      },
    });
    expect(tx.personagemCampanha.update).toHaveBeenCalledWith({
      where: { id: 900 },
      data: {
        eaAtual: 3,
        peAtual: 2,
      },
    });
    expect(processarCondicoesSpy).toHaveBeenCalledTimes(3);
    expect(processarCondicoesSpy).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      expect.objectContaining({
        rodadaAnterior: 3,
        rodadaNova: 4,
        participanteTurnoNovo: null,
      }),
    );
    expect(processarCondicoesSpy).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      expect.objectContaining({
        rodadaAnterior: 3,
        rodadaNova: 4,
        participanteTurnoNovo: expect.objectContaining({
          tipoParticipante: 'PERSONAGEM',
          personagemSessaoId: 501,
        }),
        processarDuracoesPorRodada: false,
      }),
    );
    expect(processarCondicoesSpy).toHaveBeenNthCalledWith(
      3,
      expect.anything(),
      expect.objectContaining({
        rodadaAnterior: 3,
        rodadaNova: 4,
        participanteTurnoNovo: expect.objectContaining({
          tipoParticipante: 'NPC',
          npcSessaoId: 601,
        }),
        processarDuracoesPorRodada: false,
      }),
    );
    const tiposEvento = [
      ...tx.eventoSessao.create.mock.calls,
      ...eventoEfeitos.create.mock.calls,
    ].map(([call]) => call.data.tipoEvento);
    expect(tiposEvento).toContain('HABILIDADE_SUSTENTADA_COBRADA');
    expect(tiposEvento).toContain('INICIATIVA_ALTERNADA_AVANCADA');
  });

  it('deve encerrar sustentacao automaticamente quando faltar PE na rodada', async () => {
    const acessoMestre = {
      campanha: {
        id: 7,
        donoId: 10,
        dono: { id: 10, apelido: 'Mestre' },
        membros: [],
      },
      ehDono: true,
      ehMestre: true,
    };

    const participantes = [
      {
        tipoParticipante: 'PERSONAGEM',
        token: 'PERSONAGEM:501',
        personagemSessaoId: 501,
        npcSessaoId: null,
        personagemCampanhaId: 900,
        donoId: 10,
        nomeJogador: 'Mestre',
        nomePersonagem: 'Heroi',
        podeEditar: true,
      },
    ];

    jest
      .spyOn(service as any, 'obterAcessoCampanha')
      .mockResolvedValue(acessoMestre);
    jest
      .spyOn(service as any, 'obterCenaAtualSessaoTx')
      .mockResolvedValue({ id: 111 });
    jest
      .spyOn(service as any, 'carregarParticipantesIniciativa')
      .mockResolvedValue(participantes);
    jest
      .spyOn(service as any, 'obterOrdemIniciativaPersistida')
      .mockResolvedValue([]);
    jest
      .spyOn(service as any, 'aplicarOrdemIniciativaPersistida')
      .mockReturnValue(participantes);
    jest
      .spyOn(service, 'buscarDetalheSessao')
      .mockResolvedValue({ id: 21 } as never);
    jest
      .spyOn(service as any, 'processarCondicoesNoAvancoTurnoTx')
      .mockResolvedValue(undefined);

    const tx = {
      sessao: {
        findUnique: jest.fn().mockResolvedValue({
          id: 21,
          campanhaId: 7,
          cenaAtualTipo: 'COMBATE',
          indiceTurnoAtual: 0,
          rodadaAtual: 5,
        }),
        update: jest.fn().mockResolvedValue({ id: 21 }),
      },
      personagemSessaoHabilidadeSustentada: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 1002,
            sessaoId: 21,
            personagemSessaoId: 501,
            nomeHabilidade: 'Disparo Concentrado',
            nomeVariacao: null,
            custoSustentacaoEA: 2,
            custoSustentacaoPE: 3,
            ultimaCobrancaRodada: 5,
            habilidadeTecnicaId: 700,
            variacaoHabilidadeId: null,
            personagemSessao: {
              personagemCampanha: {
                id: 900,
                eaAtual: 10,
                peAtual: 2,
              },
            },
          },
        ]),
        update: jest.fn().mockResolvedValue({ id: 1002 }),
      },
      personagemCampanha: {
        update: jest.fn().mockResolvedValue({ id: 900 }),
      },
      eventoSessao: {
        create: jest.fn().mockResolvedValue({ id: 3002 }),
      },
    };

    const eventoEfeitos = configurarTransacaoEfeitosAutomaticos(tx);

    await service.avancarTurnoSessao(7, 21, 10, {
      rodadaEsperada: 5,
      indiceTurnoEsperado: 0,
    });

    expect(tx.personagemCampanha.update).not.toHaveBeenCalled();
    expect(tx.personagemSessaoHabilidadeSustentada.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1002 },
        data: expect.objectContaining({
          ativa: false,
          desativadaPorUsuarioId: null,
          motivoDesativacao: expect.stringContaining('PE insuficiente'),
        }),
      }),
    );

    const tiposEvento = [
      ...tx.eventoSessao.create.mock.calls,
      ...eventoEfeitos.create.mock.calls,
    ].map(([call]) => call.data.tipoEvento);
    expect(tiposEvento).toContain('HABILIDADE_SUSTENTADA_ENCERRADA');
    expect(tiposEvento).toContain('TURNO_AVANCADO');

    const eventoEncerrada = eventoEfeitos.create.mock.calls.find(
      ([call]) => call.data.tipoEvento === 'HABILIDADE_SUSTENTADA_ENCERRADA',
    )?.[0];
    expect(eventoEncerrada).toBeDefined();
    expect(eventoEncerrada?.data?.dados).toEqual(
      expect.objectContaining({
        rodada: 6,
        motivoSistema: expect.stringContaining('PE insuficiente'),
      }),
    );
  });

  it('deve encerrar sustentacao automaticamente quando faltar EA e PE na rodada', async () => {
    const acessoMestre = {
      campanha: {
        id: 7,
        donoId: 10,
        dono: { id: 10, apelido: 'Mestre' },
        membros: [],
      },
      ehDono: true,
      ehMestre: true,
    };

    const participantes = [
      {
        tipoParticipante: 'PERSONAGEM',
        token: 'PERSONAGEM:501',
        personagemSessaoId: 501,
        npcSessaoId: null,
        personagemCampanhaId: 900,
        donoId: 10,
        nomeJogador: 'Mestre',
        nomePersonagem: 'Heroi',
        podeEditar: true,
      },
    ];

    jest
      .spyOn(service as any, 'obterAcessoCampanha')
      .mockResolvedValue(acessoMestre);
    jest
      .spyOn(service as any, 'obterCenaAtualSessaoTx')
      .mockResolvedValue({ id: 111 });
    jest
      .spyOn(service as any, 'carregarParticipantesIniciativa')
      .mockResolvedValue(participantes);
    jest
      .spyOn(service as any, 'obterOrdemIniciativaPersistida')
      .mockResolvedValue([]);
    jest
      .spyOn(service as any, 'aplicarOrdemIniciativaPersistida')
      .mockReturnValue(participantes);
    jest
      .spyOn(service, 'buscarDetalheSessao')
      .mockResolvedValue({ id: 21 } as never);
    jest
      .spyOn(service as any, 'processarCondicoesNoAvancoTurnoTx')
      .mockResolvedValue(undefined);

    const tx = {
      sessao: {
        findUnique: jest.fn().mockResolvedValue({
          id: 21,
          campanhaId: 7,
          cenaAtualTipo: 'COMBATE',
          indiceTurnoAtual: 0,
          rodadaAtual: 8,
        }),
        update: jest.fn().mockResolvedValue({ id: 21 }),
      },
      personagemSessaoHabilidadeSustentada: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 1003,
            sessaoId: 21,
            personagemSessaoId: 501,
            nomeHabilidade: 'Disparo Concentrado',
            nomeVariacao: null,
            custoSustentacaoEA: 2,
            custoSustentacaoPE: 3,
            ultimaCobrancaRodada: 8,
            habilidadeTecnicaId: 700,
            variacaoHabilidadeId: null,
            personagemSessao: {
              personagemCampanha: {
                id: 900,
                eaAtual: 1,
                peAtual: 1,
              },
            },
          },
        ]),
        update: jest.fn().mockResolvedValue({ id: 1003 }),
      },
      personagemCampanha: {
        update: jest.fn().mockResolvedValue({ id: 900 }),
      },
      eventoSessao: {
        create: jest.fn().mockResolvedValue({ id: 3003 }),
      },
    };

    const eventoEfeitos = configurarTransacaoEfeitosAutomaticos(tx);

    await service.avancarTurnoSessao(7, 21, 10, {
      rodadaEsperada: 8,
      indiceTurnoEsperado: 0,
    });

    expect(tx.personagemCampanha.update).not.toHaveBeenCalled();
    expect(tx.personagemSessaoHabilidadeSustentada.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1003 },
        data: expect.objectContaining({
          ativa: false,
          desativadaPorUsuarioId: null,
          motivoDesativacao: expect.stringContaining('EA e PE insuficiente'),
        }),
      }),
    );

    const eventoEncerrada = eventoEfeitos.create.mock.calls.find(
      ([call]) => call.data.tipoEvento === 'HABILIDADE_SUSTENTADA_ENCERRADA',
    )?.[0];
    expect(eventoEncerrada).toBeDefined();
    expect(eventoEncerrada?.data?.dados).toEqual(
      expect.objectContaining({
        rodada: 9,
        motivoSistema: expect.stringContaining('EA e PE insuficiente'),
      }),
    );
  });

  it('deve descrever cobranca de sustentacao mista na timeline (EA + PE)', () => {
    const descricao = (service as any).descreverEventoSessao(
      'HABILIDADE_SUSTENTADA_COBRADA',
      {
        habilidadeNome: 'Disparo Concentrado',
        custoEA: 2,
        custoPE: 3,
      },
    );

    expect(descricao).toBe(
      'Sustentação cobrada: Disparo Concentrado (EA -2 | PE -3)',
    );
  });

  it('deve descrever cobranca de sustentacao na timeline apenas com EA', () => {
    const descricao = (service as any).descreverEventoSessao(
      'HABILIDADE_SUSTENTADA_COBRADA',
      {
        habilidadeNome: 'Revestimento Defensivo',
        custoEA: 1,
        custoPE: 0,
      },
    );

    expect(descricao).toBe(
      'Sustentação cobrada: Revestimento Defensivo (EA -1)',
    );
  });

  it('deve descrever cobranca de sustentacao na timeline apenas com PE', () => {
    const descricao = (service as any).descreverEventoSessao(
      'HABILIDADE_SUSTENTADA_COBRADA',
      {
        habilidadeNome: 'Disparo Concentrado',
        custoEA: 0,
        custoPE: 2,
      },
    );

    expect(descricao).toBe('Sustentação cobrada: Disparo Concentrado (PE -2)');
  });

  it('deve descrever cobranca de sustentacao na timeline sem sufixo de custo quando EA/PE forem 0', () => {
    const descricao = (service as any).descreverEventoSessao(
      'HABILIDADE_SUSTENTADA_COBRADA',
      {
        habilidadeNome: 'Barreira Simples',
        custoEA: 0,
        custoPE: 0,
      },
    );

    expect(descricao).toBe('Sustentação cobrada: Barreira Simples');
  });

  it('deve aplicar bônus de item personalizado na perícia escolhida com modificacoes', async () => {
    (prisma as any).inventarioItemCampanha = {
      findMany: jest.fn().mockResolvedValue([
        {
          personagemCampanhaId: 77,
          quantidade: 1,
          estado: { periciaCodigo: 'percepcao' },
          equipamento: {
            codigo: 'UTENSILIO_PERSONALIZADO',
            periciaBonificada: null,
            bonusPericia: 2,
          },
          modificacoes: [
            {
              modificacao: {
                efeitosMecanicos: { bonusPericia: 5 },
              },
            },
          ],
        },
        {
          personagemCampanhaId: 77,
          quantidade: 1,
          estado: { periciaCodigo: 'medicina' },
          equipamento: {
            codigo: 'KIT_PERICIA_PERSONALIZADO',
            periciaBonificada: null,
            bonusPericia: 0,
          },
          modificacoes: [
            {
              modificacao: {
                efeitosMecanicos: { bonusPericia: 3 },
              },
            },
          ],
        },
      ]),
    };

    const resultado = await (service as any).calcularBonusEquipamentoPericias(
      [77],
      new Map<string, string>([
        ['percepcao', 'PERCEPCAO'],
        ['medicina', 'MEDICINA'],
      ]),
    );

    expect(
      (prisma as any).inventarioItemCampanha.findMany,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          personagemCampanhaId: { in: [77] },
          equipado: true,
        },
      }),
    );
    expect(resultado.get(77)?.get('PERCEPCAO')).toBe(7);
    expect(resultado.get(77)?.get('MEDICINA')).toBe(3);
  });

  it('deve reconhecer payload de rolagem com bonus pendente do Perito', () => {
    const pendente = {
      id: 'perito:123',
      eventoId: 123,
      personagemSessaoId: 41,
      personagemCampanhaId: 51,
      habilidadeId: 9,
      habilidadeNome: 'Perito',
      dado: '1d8',
      faces: 8,
      criadoEm: new Date().toISOString(),
    };

    const contem = (service as any).payloadRolagemContemBonusPerito(
      {
        payloads: [
          {
            rolagens: [12],
            bonusDados: [
              {
                origem: 'PERITO',
                efeitoPendenteId: 'perito:123',
                faces: 8,
                rolagens: [5],
              },
            ],
          },
        ],
      },
      pendente,
    );

    expect(contem).toBe(true);
  });

  function criarPendentePeritoTeste() {
    return {
      id: 'perito:123',
      eventoId: 123,
      personagemSessaoId: 41,
      personagemCampanhaId: 51,
      habilidadeId: 9,
      habilidadeNome: 'Perito',
      dado: '1d8',
      faces: 8,
      criadoEm: new Date().toISOString(),
    };
  }

  function criarDadosRolagemPeritoTeste() {
    return {
      payloads: [
        {
          quantidade: 1,
          faces: 20,
          modificador: 0,
          aplicarModificadorPorDado: false,
          rolagens: [12],
          bonusDados: [
            {
              origem: 'PERITO',
              efeitoPendenteId: 'perito:123',
              quantidade: 1,
              faces: 8,
              rolagens: [5],
            },
          ],
        },
      ],
    };
  }

  function criarDadosRolagemChatLivreTeste(params?: {
    faces?: number;
    rolagens?: number[];
    incluirBonus?: boolean;
    bonusFaces?: number;
    bonusRolagens?: number[];
    efeitoPendenteId?: string;
  }) {
    const faces = params?.faces ?? 20;
    const rolagens = params?.rolagens ?? [12];
    const payload: Record<string, unknown> = {
      quantidade: rolagens.length,
      faces,
      modificador: 0,
      aplicarModificadorPorDado: false,
      rolagens,
    };
    if (params?.incluirBonus) {
      payload.bonusDados = [
        {
          origem: 'PERITO',
          efeitoPendenteId: params.efeitoPendenteId ?? 'perito:123',
          quantidade: 1,
          faces: params.bonusFaces ?? 8,
          rolagens: params.bonusRolagens ?? [5],
        },
      ];
    }
    return { payloads: [payload] };
  }

  function criarDadosRolagemCompostaChatLivreTeste(params?: {
    incluirD20?: boolean;
    incluirBonus?: boolean;
    termoMalformado?: boolean;
    incluirTerceiroGrupo?: boolean;
    d20NoTerceiroGrupo?: boolean;
  }) {
    const termoD20 = {
      quantidade: 4,
      faces: 20,
      aplicarModificadorPorDado: true,
      keepMode: 'HIGHEST',
      rolagens: [3, 19, 7, 12],
    };
    const termoD8 = {
      quantidade: 3,
      faces: 8,
      aplicarModificadorPorDado: true,
      keepMode: 'HIGHEST',
      rolagens: [1, 8, 4],
    };
    const segundoTermo =
      params?.d20NoTerceiroGrupo || params?.incluirD20 === false
        ? termoD8
        : termoD20;
    const termos: unknown[] = [
      {
        quantidade: 2,
        faces: 6,
        aplicarModificadorPorDado: false,
        keepMode: 'SUM',
        rolagens: [2, 5],
      },
      segundoTermo,
    ];
    if (params?.incluirTerceiroGrupo) {
      termos.push(params.d20NoTerceiroGrupo ? termoD20 : termoD8);
    }
    if (params?.termoMalformado) {
      termos.push(null);
    }
    const payload: Record<string, unknown> = {
      quantidade: 2,
      faces: 6,
      modificador: 0,
      operador: '+',
      aplicarModificadorPorDado: false,
      rolagens: [2, 5],
      termos,
    };
    if (params?.incluirBonus) {
      payload.bonusDados = [
        {
          origem: 'PERITO',
          efeitoPendenteId: 'perito:123',
          quantidade: 1,
          faces: 8,
          rolagens: [5],
        },
      ];
    }
    return { payloads: [payload] };
  }

  function criarTxPeritoTeste(grauTreinamento = 1) {
    const estado = {
      pendentesRolagem: {
        '51:9': criarPendentePeritoTeste(),
      },
      aprimoramentosTemporarios: {},
    };

    return {
      $queryRaw: jest.fn().mockResolvedValue([{ id: 77 }]),
      sessaoRegraOpcional: {
        findUnique: jest.fn().mockResolvedValue({ id: 77, estado }),
        update: jest.fn().mockResolvedValue({}),
        create: jest.fn().mockResolvedValue({}),
      },
      personagemSessao: {
        findFirst: jest.fn().mockResolvedValue({
          personagemCampanha: {
            personagemBase: {
              pericias:
                grauTreinamento > 0
                  ? [
                      {
                        grauTreinamento,
                        bonusExtra: 0,
                        pericia: {
                          codigo: 'MEDICINA',
                          nome: 'Medicina',
                          atributoBase: 'INTELECTO',
                        },
                      },
                    ]
                  : [],
            },
          },
        }),
      },
    };
  }

  it('deve aplicar e consumir Perito com pericia treinada valida', async () => {
    const tx = criarTxPeritoTeste();

    const ajustes = await (service as any).consumirBonusPeritoPendenteTx(
      tx,
      21,
      41,
      51,
      {
        tipo: 'PERICIA',
        periciaCodigo: 'MEDICINA',
        efeitoPendenteId: 'perito:123',
      },
      criarDadosRolagemPeritoTeste(),
    );

    expect(ajustes).toEqual([
      expect.objectContaining({
        tipo: 'PERITO',
        efeitoPendenteId: 'perito:123',
        faces: 8,
      }),
    ]);
    expect(tx.sessaoRegraOpcional.update).toHaveBeenCalled();
    expect(
      JSON.stringify(
        tx.sessaoRegraOpcional.update.mock.calls[0][0].data.estado,
      ),
    ).not.toContain('perito:123');
  });

  it('deve aplicar e consumir Perito no chat livre com d20 e bonus valido', async () => {
    const tx = criarTxPeritoTeste();

    const ajustes = await (service as any).consumirBonusPeritoPendenteTx(
      tx,
      21,
      41,
      51,
      { tipo: 'OUTRO', efeitoPendenteId: 'perito:123' },
      criarDadosRolagemChatLivreTeste({ incluirBonus: true }),
    );

    expect(ajustes).toEqual([
      expect.objectContaining({
        tipo: 'PERITO',
        efeitoPendenteId: 'perito:123',
        faces: 8,
      }),
    ]);
    expect(tx.personagemSessao.findFirst).not.toHaveBeenCalled();
    expect(tx.sessaoRegraOpcional.update).toHaveBeenCalled();
  });

  it('deve aplicar e consumir Perito no chat livre com d20 em rolagem composta', async () => {
    const tx = criarTxPeritoTeste();

    const ajustes = await (service as any).consumirBonusPeritoPendenteTx(
      tx,
      21,
      41,
      51,
      { tipo: 'OUTRO', efeitoPendenteId: 'perito:123' },
      criarDadosRolagemCompostaChatLivreTeste({ incluirBonus: true }),
    );

    expect(ajustes).toEqual([
      expect.objectContaining({
        tipo: 'PERITO',
        efeitoPendenteId: 'perito:123',
      }),
    ]);
    expect(tx.personagemSessao.findFirst).not.toHaveBeenCalled();
    expect(tx.sessaoRegraOpcional.update).toHaveBeenCalled();
  });

  it('deve detectar d20 no terceiro grupo composto para consumir Perito', async () => {
    const tx = criarTxPeritoTeste();

    const ajustes = await (service as any).consumirBonusPeritoPendenteTx(
      tx,
      21,
      41,
      51,
      { tipo: 'OUTRO', efeitoPendenteId: 'perito:123' },
      criarDadosRolagemCompostaChatLivreTeste({
        incluirBonus: true,
        incluirTerceiroGrupo: true,
        d20NoTerceiroGrupo: true,
      }),
    );

    expect(ajustes).toEqual([
      expect.objectContaining({
        tipo: 'PERITO',
        efeitoPendenteId: 'perito:123',
      }),
    ]);
    expect(tx.personagemSessao.findFirst).not.toHaveBeenCalled();
    expect(tx.sessaoRegraOpcional.update).toHaveBeenCalled();
  });

  it('deve manter Perito pendente no chat livre quando a rolagem nao tem d20', async () => {
    const tx = criarTxPeritoTeste();

    const ajustes = await (service as any).consumirBonusPeritoPendenteTx(
      tx,
      21,
      41,
      51,
      { tipo: 'OUTRO', efeitoPendenteId: 'perito:123' },
      criarDadosRolagemChatLivreTeste({ faces: 6, rolagens: [4] }),
    );

    expect(ajustes).toEqual([]);
    expect(tx.personagemSessao.findFirst).not.toHaveBeenCalled();
    expect(tx.sessaoRegraOpcional.update).not.toHaveBeenCalled();
  });

  it('deve manter Perito pendente em tres grupos compostos sem d20', async () => {
    const tx = criarTxPeritoTeste();

    const ajustes = await (service as any).consumirBonusPeritoPendenteTx(
      tx,
      21,
      41,
      51,
      { tipo: 'OUTRO', efeitoPendenteId: 'perito:123' },
      criarDadosRolagemCompostaChatLivreTeste({
        incluirD20: false,
        incluirTerceiroGrupo: true,
      }),
    );

    expect(ajustes).toEqual([]);
    expect(tx.personagemSessao.findFirst).not.toHaveBeenCalled();
    expect(tx.sessaoRegraOpcional.update).not.toHaveBeenCalled();
  });

  it('deve manter Perito pendente em rolagem composta sem d20', async () => {
    const tx = criarTxPeritoTeste();

    const ajustes = await (service as any).consumirBonusPeritoPendenteTx(
      tx,
      21,
      41,
      51,
      { tipo: 'OUTRO', efeitoPendenteId: 'perito:123' },
      criarDadosRolagemCompostaChatLivreTeste({ incluirD20: false }),
    );

    expect(ajustes).toEqual([]);
    expect(tx.personagemSessao.findFirst).not.toHaveBeenCalled();
    expect(tx.sessaoRegraOpcional.update).not.toHaveBeenCalled();
  });

  it('deve rejeitar tentativa de bonus Perito sem d20 no chat livre', async () => {
    const tx = criarTxPeritoTeste();

    await expect(
      (service as any).consumirBonusPeritoPendenteTx(
        tx,
        21,
        41,
        51,
        { tipo: 'OUTRO', efeitoPendenteId: 'perito:123' },
        criarDadosRolagemChatLivreTeste({
          faces: 6,
          rolagens: [4],
          incluirBonus: true,
        }),
      ),
    ).rejects.toMatchObject({
      code: 'SESSAO_PERITO_PAYLOAD_INVALIDO',
    });
    expect(tx.personagemSessao.findFirst).not.toHaveBeenCalled();
    expect(tx.sessaoRegraOpcional.update).not.toHaveBeenCalled();
  });

  it('deve rejeitar bonus Perito malformado no chat livre sem consumir', async () => {
    const tx = criarTxPeritoTeste();

    await expect(
      (service as any).consumirBonusPeritoPendenteTx(
        tx,
        21,
        41,
        51,
        { tipo: 'OUTRO', efeitoPendenteId: 'perito:123' },
        criarDadosRolagemChatLivreTeste({
          incluirBonus: true,
          bonusFaces: 6,
        }),
      ),
    ).rejects.toMatchObject({
      code: 'SESSAO_PERITO_PAYLOAD_INVALIDO',
    });
    expect(tx.personagemSessao.findFirst).not.toHaveBeenCalled();
    expect(tx.sessaoRegraOpcional.update).not.toHaveBeenCalled();
  });

  it('deve rejeitar bonus Perito em rolagem composta malformada sem consumir', async () => {
    const tx = criarTxPeritoTeste();

    await expect(
      (service as any).consumirBonusPeritoPendenteTx(
        tx,
        21,
        41,
        51,
        { tipo: 'OUTRO', efeitoPendenteId: 'perito:123' },
        criarDadosRolagemCompostaChatLivreTeste({
          incluirBonus: true,
          termoMalformado: true,
        }),
      ),
    ).rejects.toMatchObject({
      code: 'SESSAO_PERITO_PAYLOAD_INVALIDO',
    });
    expect(tx.personagemSessao.findFirst).not.toHaveBeenCalled();
    expect(tx.sessaoRegraOpcional.update).not.toHaveBeenCalled();
  });

  it('deve calcular total de rolagem composta com melhores termos e modificador final', () => {
    const dados = criarDadosRolagemCompostaChatLivreTeste();
    const payload = dados.payloads[0];
    payload.modificador = 3;

    expect((service as any).calcularTotalPayloadRolagem(payload)).toBe(29);
  });

  it('deve calcular total de tres grupos compostos com modificador final', () => {
    const dados = criarDadosRolagemCompostaChatLivreTeste({
      incluirTerceiroGrupo: true,
    });
    const payload = dados.payloads[0];
    payload.modificador = 3;

    expect((service as any).calcularTotalPayloadRolagem(payload)).toBe(37);
  });

  it('deve rejeitar tentativa de exibir Perito sem pendente compativel', async () => {
    const tx = criarTxPeritoTeste();

    await expect(
      (service as any).consumirBonusPeritoPendenteTx(
        tx,
        21,
        41,
        51,
        { tipo: 'OUTRO', efeitoPendenteId: 'perito:999' },
        criarDadosRolagemChatLivreTeste({
          incluirBonus: true,
          efeitoPendenteId: 'perito:999',
        }),
      ),
    ).rejects.toMatchObject({
      code: 'SESSAO_PERITO_PENDENTE_NAO_ENCONTRADO',
    });
    expect(tx.personagemSessao.findFirst).not.toHaveBeenCalled();
    expect(tx.sessaoRegraOpcional.update).not.toHaveBeenCalled();
  });

  it('deve impedir consumo duplicado do mesmo Perito pendente', async () => {
    const tx = criarTxPeritoTeste();

    await (service as any).consumirBonusPeritoPendenteTx(
      tx,
      21,
      41,
      51,
      { tipo: 'OUTRO', efeitoPendenteId: 'perito:123' },
      criarDadosRolagemChatLivreTeste({ incluirBonus: true }),
    );
    const txSemPendente = criarTxPeritoTeste();
    txSemPendente.sessaoRegraOpcional.findUnique.mockResolvedValue({
      id: 77,
      estado: {
        pendentesRolagem: {},
        aprimoramentosTemporarios: {},
      },
    });

    await expect(
      (service as any).consumirBonusPeritoPendenteTx(
        txSemPendente,
        21,
        41,
        51,
        { tipo: 'OUTRO', efeitoPendenteId: 'perito:123' },
        criarDadosRolagemChatLivreTeste({ incluirBonus: true }),
      ),
    ).rejects.toMatchObject({
      code: 'SESSAO_PERITO_PENDENTE_NAO_ENCONTRADO',
    });
  });

  it.each(['LUTA', 'PONTARIA'])(
    'deve bloquear Perito em %s sem consumir pendente',
    async (periciaCodigo) => {
      const tx = criarTxPeritoTeste();

      await expect(
        (service as any).consumirBonusPeritoPendenteTx(
          tx,
          21,
          41,
          51,
          {
            tipo: 'PERICIA',
            periciaCodigo,
            efeitoPendenteId: 'perito:123',
          },
          criarDadosRolagemPeritoTeste(),
        ),
      ).rejects.toMatchObject({
        code: 'SESSAO_PERITO_PERICIA_INVALIDA',
      });
      expect(tx.sessaoRegraOpcional.update).not.toHaveBeenCalled();
    },
  );

  it('deve bloquear Perito em pericia nao treinada sem consumir pendente', async () => {
    const tx = criarTxPeritoTeste(0);

    await expect(
      (service as any).consumirBonusPeritoPendenteTx(
        tx,
        21,
        41,
        51,
        {
          tipo: 'PERICIA',
          periciaCodigo: 'MEDICINA',
          efeitoPendenteId: 'perito:123',
        },
        criarDadosRolagemPeritoTeste(),
      ),
    ).rejects.toMatchObject({
      code: 'SESSAO_PERITO_PERICIA_NAO_TREINADA',
    });
    expect(tx.sessaoRegraOpcional.update).not.toHaveBeenCalled();
  });

  it('deve manter Ataque Especial como PE-only e custo-only', () => {
    const versoes = (service as any).obterVersoesHabilidadeClasse(
      'ATAQUE_ESPECIAL',
    );

    expect(
      versoes.map((versao: { custoPE: number }) => versao.custoPE),
    ).toEqual([2, 3, 4, 5]);
    expect(versoes.map((versao: { bonus: number }) => versao.bonus)).toEqual([
      5, 10, 15, 20,
    ]);
    expect(
      versoes.every((versao: { dadoFaces?: number }) => !versao.dadoFaces),
    ).toBe(true);
    expect(versoes.every((versao: { graus?: number }) => !versao.graus)).toBe(
      true,
    );
  });

  it('deve bloquear Aprimorado acima do limite temporario por tecnica', () => {
    const estado = {
      pendentesRolagem: {},
      aprimoramentosTemporarios: {
        51: [
          {
            id: 'aprimorado:1',
            eventoId: 1,
            personagemSessaoId: 41,
            personagemCampanhaId: 51,
            tecnicaId: 10,
            tecnicaNome: 'Tecnica Reversa',
            tipoGrauCodigo: 'TECNICA_REVERSA',
            graus: 1,
            cenaId: 7,
            criadoEm: new Date().toISOString(),
          },
        ],
      },
    };

    expect(() =>
      (service as any).validarAprimoramentoClasseSessao(
        { id: 51, grausAprimoramento: [] },
        {
          habilidadeId: 3,
          versaoNivel: 5,
          aprimoramentos: [
            {
              tecnicaId: 10,
              tipoGrauCodigo: 'TECNICA_REVERSA',
              graus: 2,
            },
          ],
        },
        { nivel: 5, custoPE: 3, graus: 2 },
        estado,
        7,
        [
          {
            id: 10,
            codigo: 'NAOINATA_TECNICA_REVERSA',
            nome: 'Tecnica Reversa',
            descricao: '',
            tipo: 'NAO_INATA',
            requisitos: null,
            habilidades: [],
          },
        ],
      ),
    ).toThrow(BusinessException);
  });
});
