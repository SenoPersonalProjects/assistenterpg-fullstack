import { Test, TestingModule } from '@nestjs/testing';
import { CampanhaAccessService } from './campanha.access.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CampanhaAcessoNegadoException,
  CampanhaPersonagemEdicaoNegadaException,
  PersonagemCampanhaNaoEncontradoException,
} from 'src/common/exceptions/campanha.exception';

describe('CampanhaAccessService', () => {
  let service: CampanhaAccessService;
  let prisma: {
    campanha: { findUnique: jest.Mock };
    personagemCampanha: { findUnique: jest.Mock };
    personagemSessao: { findFirst: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      campanha: { findUnique: jest.fn() },
      personagemCampanha: { findUnique: jest.fn() },
      personagemSessao: { findFirst: jest.fn().mockResolvedValue(null) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampanhaAccessService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get(CampanhaAccessService);
  });

  it('bloqueia acesso de usuário que não e dono nem membro', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 10,
      donoId: 1,
      membros: [{ usuarioId: 2, papel: 'JOGADOR' }],
    });

    await expect(service.garantirAcesso(10, 99)).rejects.toBeInstanceOf(
      CampanhaAcessoNegadoException,
    );
  });

  it('bloqueia personagem que pertence a outra campanha', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 10,
      donoId: 1,
      membros: [],
    });
    prisma.personagemCampanha.findUnique.mockResolvedValue({
      id: 50,
      campanhaId: 999,
      donoId: 1,
    });

    await expect(
      service.obterPersonagemCampanhaComPermissao(10, 50, 1, false),
    ).rejects.toBeInstanceOf(PersonagemCampanhaNaoEncontradoException);
  });

  it('bloqueia edição de personagem por membro que não e mestre nem dono da ficha', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 10,
      donoId: 1,
      membros: [{ usuarioId: 2, papel: 'JOGADOR' }],
    });
    prisma.personagemCampanha.findUnique.mockResolvedValue({
      id: 50,
      campanhaId: 10,
      donoId: 3,
    });

    await expect(
      service.obterPersonagemCampanhaComPermissao(10, 50, 2, true),
    ).rejects.toBeInstanceOf(CampanhaPersonagemEdicaoNegadaException);
  });
  it('permite editar a campanha durante delegação e revoga o acesso quando ela termina', async () => {
    prisma.campanha.findUnique.mockResolvedValue({
      id: 10,
      donoId: 1,
      membros: [{ usuarioId: 2, papel: 'JOGADOR' }],
    });
    prisma.personagemCampanha.findUnique.mockResolvedValue({
      id: 50,
      campanhaId: 10,
      donoId: 1,
    });
    prisma.personagemSessao.findFirst
      .mockResolvedValueOnce({ id: 70 })
      .mockResolvedValueOnce(null);
    await expect(
      service.obterPersonagemCampanhaComPermissao(10, 50, 2, true),
    ).resolves.toMatchObject({ controleDelegado: true });
    expect(prisma.personagemSessao.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          personagemCampanhaId: 50,
          controladorUsuarioId: 2,
          sessao: { campanhaId: 10, status: { not: 'ENCERRADA' } },
        }),
      }),
    );
    await expect(
      service.obterPersonagemCampanhaComPermissao(10, 50, 2, true),
    ).rejects.toBeInstanceOf(CampanhaPersonagemEdicaoNegadaException);
  });
});
