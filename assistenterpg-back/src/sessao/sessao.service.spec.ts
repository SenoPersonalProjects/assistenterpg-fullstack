import { Test, TestingModule } from '@nestjs/testing';
import { SessaoService } from './sessao.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  SessaoEventoDesfazerNaoPermitidoException,
  SessaoTurnoIndisponivelEmCenaLivreException,
} from 'src/common/exceptions/campanha.exception';
import { BusinessException } from 'src/common/exceptions/business.exception';

describe('SessaoService', () => {
  let service: SessaoService;

  const prisma = {
    campanha: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  function configurarEventoEfeitosAutomaticos() {
    (prisma as any).eventoSessao = {
      findUnique: jest.fn().mockResolvedValue({
        dados: {
          efeitosAutomaticos: {
            status: 'PENDENTE',
          },
        },
      }),
      update: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({ id: 9001 }),
      findMany: jest.fn().mockResolvedValue([]),
    };

    return (prisma as any).eventoSessao;
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
        cenaId: 5,
        rodadaAnterior: 2,
        rodadaNova: 3,
        acao: 'AVANCAR',
        participantesTurnoNovos: [],
        processarCondicoes: false,
        cobrarSustentacoes: true,
      }),
    ).rejects.toThrow('falha ao cobrar sustentacoes');

    const statusAtualizados = eventoEfeitos.update.mock.calls.map(
      ([call]) => call.data.dados.efeitosAutomaticos.status,
    );
    expect(statusAtualizados).toEqual(['EM_PROCESSAMENTO', 'ERRO']);
    expect(loggerError).toHaveBeenCalledWith(
      expect.stringContaining('"eventoId":123'),
      falha.stack,
    );
    expect(loggerError).toHaveBeenCalledWith(
      expect.stringContaining('"campanhaId":7'),
      falha.stack,
    );
  });

  it('deve bloquear avancar turno quando cena atual e LIVRE', async () => {
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
          cenaAtualTipo: 'LIVRE',
          indiceTurnoAtual: 0,
          rodadaAtual: 1,
        }),
      },
      personagemSessao: {
        findMany: jest.fn(),
      },
      eventoSessao: {
        create: jest.fn(),
      },
    };

    prisma.$transaction.mockImplementation(
      async (callback: (txArg: typeof tx) => Promise<unknown>) => callback(tx),
    );

    await expect(service.avancarTurnoSessao(7, 21, 10)).rejects.toBeInstanceOf(
      SessaoTurnoIndisponivelEmCenaLivreException,
    );
    expect(tx.personagemSessao.findMany).not.toHaveBeenCalled();
  });

  it('deve bloquear voltar turno quando cena atual e LIVRE', async () => {
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
          cenaAtualTipo: 'LIVRE',
          indiceTurnoAtual: 0,
          rodadaAtual: 1,
        }),
      },
      personagemSessao: {
        findMany: jest.fn(),
      },
      eventoSessao: {
        create: jest.fn(),
      },
    };

    prisma.$transaction.mockImplementation(
      async (callback: (txArg: typeof tx) => Promise<unknown>) => callback(tx),
    );

    await expect(service.voltarTurnoSessao(7, 21, 10)).rejects.toBeInstanceOf(
      SessaoTurnoIndisponivelEmCenaLivreException,
    );
    expect(tx.personagemSessao.findMany).not.toHaveBeenCalled();
  });

  it('deve bloquear pular turno quando cena atual e LIVRE', async () => {
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
          cenaAtualTipo: 'LIVRE',
          indiceTurnoAtual: 0,
          rodadaAtual: 1,
        }),
      },
      personagemSessao: {
        findMany: jest.fn(),
      },
      eventoSessao: {
        create: jest.fn(),
      },
    };

    prisma.$transaction.mockImplementation(
      async (callback: (txArg: typeof tx) => Promise<unknown>) => callback(tx),
    );

    await expect(service.pularTurnoSessao(7, 21, 10)).rejects.toBeInstanceOf(
      SessaoTurnoIndisponivelEmCenaLivreException,
    );
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
        create: jest.fn().mockResolvedValue({ id: 301 }),
      },
      sessaoRegraOpcional: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
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
    expect(resultado).toEqual(detalheEncerrada);
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

    prisma.$transaction.mockImplementation(
      async (callback: (txArg: typeof tx) => Promise<unknown>) => callback(tx),
    );
    const eventoEfeitos = configurarEventoEfeitosAutomaticos();
    (prisma as any).personagemSessaoHabilidadeSustentada =
      tx.personagemSessaoHabilidadeSustentada;
    (prisma as any).personagemCampanha = tx.personagemCampanha;

    await service.avancarTurnoSessao(7, 21, 10);

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

    prisma.$transaction.mockImplementation(
      async (callback: (txArg: typeof tx) => Promise<unknown>) => callback(tx),
    );
    const eventoEfeitos = configurarEventoEfeitosAutomaticos();
    (prisma as any).personagemSessaoHabilidadeSustentada =
      tx.personagemSessaoHabilidadeSustentada;
    (prisma as any).personagemCampanha = tx.personagemCampanha;

    await service.avancarTurnoSessao(7, 21, 10);

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
    expect(processarCondicoesSpy).toHaveBeenCalledTimes(2);
    expect(processarCondicoesSpy).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      expect.objectContaining({
        rodadaAnterior: 3,
        rodadaNova: 4,
        participanteTurnoNovo: participantes[0],
        processarDuracoesPorRodada: true,
      }),
    );
    expect(processarCondicoesSpy).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      expect.objectContaining({
        rodadaAnterior: 3,
        rodadaNova: 4,
        participanteTurnoNovo: participantes[1],
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

    prisma.$transaction.mockImplementation(
      async (callback: (txArg: typeof tx) => Promise<unknown>) => callback(tx),
    );
    const eventoEfeitos = configurarEventoEfeitosAutomaticos();
    (prisma as any).personagemSessaoHabilidadeSustentada =
      tx.personagemSessaoHabilidadeSustentada;
    (prisma as any).personagemCampanha = tx.personagemCampanha;

    await service.avancarTurnoSessao(7, 21, 10);

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

    prisma.$transaction.mockImplementation(
      async (callback: (txArg: typeof tx) => Promise<unknown>) => callback(tx),
    );
    const eventoEfeitos = configurarEventoEfeitosAutomaticos();
    (prisma as any).personagemSessaoHabilidadeSustentada =
      tx.personagemSessaoHabilidadeSustentada;
    (prisma as any).personagemCampanha = tx.personagemCampanha;

    await service.avancarTurnoSessao(7, 21, 10);

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

  function criarTxPeritoTeste(grauTreinamento = 1) {
    const estado = {
      pendentesRolagem: {
        '51:9': criarPendentePeritoTeste(),
      },
      aprimoramentosTemporarios: {},
    };

    return {
      sessaoRegraOpcional: {
        findUnique: jest.fn().mockResolvedValue({ id: 77, estado }),
        update: jest.fn().mockResolvedValue({}),
        create: jest.fn().mockResolvedValue({}),
      },
      personagemSessao: {
        findFirst: jest.fn().mockResolvedValue({
          personagemCampanha: {
            personagemBase: {
              pericias: grauTreinamento > 0 ? [{ grauTreinamento }] : [],
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
