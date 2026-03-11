import { Test, TestingModule } from '@nestjs/testing';
import { SessaoService } from './sessao.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  SessaoEventoDesfazerNaoPermitidoException,
  SessaoTurnoIndisponivelEmCenaLivreException,
} from 'src/common/exceptions/campanha.exception';

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
});
