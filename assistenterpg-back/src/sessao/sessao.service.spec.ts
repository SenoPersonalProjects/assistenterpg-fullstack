import { Test, TestingModule } from '@nestjs/testing';
import { SessaoService } from './sessao.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SessaoTurnoIndisponivelEmCenaLivreException } from 'src/common/exceptions/campanha.exception';

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
});
