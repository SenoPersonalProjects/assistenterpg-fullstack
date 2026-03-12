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

  beforeEach(async () => {
    jest.clearAllMocks();

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

  it('deve encerrar sessao quando usuario for mestre', async () => {
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
          cenas: [{ id: 81 }],
        }),
        update: jest.fn().mockResolvedValue({
          id: 21,
          status: 'ENCERRADA',
        }),
      },
      eventoSessao: {
        create: jest.fn().mockResolvedValue({ id: 301 }),
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
    expect(resultado).toEqual(detalheEncerrada);
  });

  it('deve bloquear desfazer quando evento nao for o ultimo reversivel', async () => {
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

  it('deve aplicar acumulos no custo respeitando grau da tecnica', () => {
    const habilidade = {
      id: 999,
      tecnicaId: 77,
      codigo: 'REVESTIMENTO_OFENSIVO',
      nome: 'Revestimento Ofensivo',
      descricao: '',
      requisitos: null,
      execucao: 'Acao padrao',
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

    const custo = (service as any).resolverCustoUsoHabilidade(
      habilidade,
      new Map([['TECNICA_AMALDICOADA', 3]]),
      undefined,
      2,
    );

    expect(custo.custoEA).toBe(4);
    expect(custo.acumulosAplicados).toBe(2);
    expect(custo.acumulosMaximos).toBe(3);
    expect(custo.isUsoBaseSemEscalonamento).toBe(false);
  });

  it('deve bloquear acumulos acima do grau permitido', () => {
    const habilidade = {
      id: 1000,
      tecnicaId: 77,
      codigo: 'REVESTIMENTO_DEFENSIVO',
      nome: 'Revestimento Defensivo',
      descricao: '',
      requisitos: null,
      execucao: 'Acao padrao',
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
    jest.spyOn(service, 'buscarDetalheSessao').mockResolvedValue({ id: 21 } as never);

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
    expect(tx.personagemSessaoHabilidadeSustentada.update).toHaveBeenCalledWith({
      where: { id: 1001 },
      data: {
        ultimaCobrancaRodada: 4,
      },
    });

    const tiposEvento = tx.eventoSessao.create.mock.calls.map(
      ([call]) => call.data.tipoEvento,
    );
    expect(tiposEvento).toContain('HABILIDADE_SUSTENTADA_COBRADA');
    expect(tiposEvento).toContain('TURNO_AVANCADO');

    const eventoCobranca = tx.eventoSessao.create.mock.calls.find(
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
    jest.spyOn(service, 'buscarDetalheSessao').mockResolvedValue({ id: 21 } as never);

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

    const tiposEvento = tx.eventoSessao.create.mock.calls.map(
      ([call]) => call.data.tipoEvento,
    );
    expect(tiposEvento).toContain('HABILIDADE_SUSTENTADA_ENCERRADA');
    expect(tiposEvento).toContain('TURNO_AVANCADO');

    const eventoEncerrada = tx.eventoSessao.create.mock.calls.find(
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
    jest.spyOn(service, 'buscarDetalheSessao').mockResolvedValue({ id: 21 } as never);

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

    const eventoEncerrada = tx.eventoSessao.create.mock.calls.find(
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
      'Sustentacao cobrada: Disparo Concentrado (EA -2 | PE -3)',
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
      'Sustentacao cobrada: Revestimento Defensivo (EA -1)',
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

    expect(descricao).toBe(
      'Sustentacao cobrada: Disparo Concentrado (PE -2)',
    );
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

    expect(descricao).toBe('Sustentacao cobrada: Barreira Simples');
  });
});
