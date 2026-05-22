import { Test, TestingModule } from '@nestjs/testing';
import { StatusPublicacao, TipoHomebrewConteudo } from '@prisma/client';
import { HomebrewsService } from './homebrews.service';
import { PrismaService } from '../prisma/prisma.service';
import { HomebrewSemPermissaoException } from 'src/common/exceptions/homebrew.exception';

describe('HomebrewsService', () => {
  let service: HomebrewsService;
  let prisma: {
    homebrew: {
      count: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      homebrew: {
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomebrewsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<HomebrewsService>(HomebrewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('permite que usuario comum liste homebrews publicadas no catalogo', async () => {
    prisma.homebrew.findMany.mockResolvedValue([
      {
        id: 10,
        codigo: 'HB_PUBLICADA',
        nome: 'Homebrew Publicada',
        descricao: null,
        tipo: TipoHomebrewConteudo.EQUIPAMENTO,
        status: StatusPublicacao.PUBLICADO,
        tags: [],
        versao: '1.0.0',
        criadoEm: new Date('2026-04-20T00:00:00.000Z'),
        atualizadoEm: new Date('2026-04-20T00:00:00.000Z'),
        usuarioId: 7,
        usuario: { id: 7, apelido: 'Criador' },
      },
    ]);

    const resultado = await service.listar(
      { apenasPublicados: true },
      7,
      false,
    );

    expect(prisma.homebrew.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: StatusPublicacao.PUBLICADO,
        }),
      }),
    );
    expect(resultado.dados).toHaveLength(1);
    expect(resultado.dados[0]?.id).toBe(10);
  });

  it('garante que meus inclui homebrews publicadas do proprio usuario', async () => {
    prisma.homebrew.findMany.mockResolvedValue([
      {
        id: 15,
        codigo: 'HB_MINHA_PUBLICADA',
        nome: 'Minha Publicada',
        descricao: null,
        tipo: TipoHomebrewConteudo.TECNICA_AMALDICOADA,
        status: StatusPublicacao.PUBLICADO,
        tags: [],
        versao: '1.0.0',
        criadoEm: new Date('2026-04-20T00:00:00.000Z'),
        atualizadoEm: new Date('2026-04-20T00:00:00.000Z'),
        usuarioId: 22,
        usuario: { id: 22, apelido: 'Jogador' },
      },
    ]);

    const resultado = await service.meus(22, {
      status: StatusPublicacao.PUBLICADO,
    });

    expect(prisma.homebrew.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          usuarioId: 22,
          status: StatusPublicacao.PUBLICADO,
        }),
      }),
    );
    expect(resultado.dados).toHaveLength(1);
    expect(resultado.dados[0]?.id).toBe(15);
  });

  it('bloqueia leitura de rascunho de outro usuario', async () => {
    prisma.homebrew.findUnique.mockResolvedValue({
      id: 50,
      codigo: 'HB_RASCUNHO',
      nome: 'Rascunho privado',
      descricao: null,
      tipo: TipoHomebrewConteudo.EQUIPAMENTO,
      status: StatusPublicacao.RASCUNHO,
      dados: {},
      tags: [],
      versao: '1.0.0',
      criadoEm: new Date('2026-04-20T00:00:00.000Z'),
      atualizadoEm: new Date('2026-04-20T00:00:00.000Z'),
      usuarioId: 99,
      usuario: { id: 99, apelido: 'Criador' },
    });

    await expect(service.buscarPorId(50, 7, false)).rejects.toBeInstanceOf(
      HomebrewSemPermissaoException,
    );
  });

  it('bloqueia edicao de homebrew de outro usuario', async () => {
    prisma.homebrew.findUnique.mockResolvedValue({
      id: 50,
      tipo: TipoHomebrewConteudo.EQUIPAMENTO,
      status: StatusPublicacao.RASCUNHO,
      dados: {},
      versao: '1.0.0',
      usuarioId: 99,
    });

    await expect(
      service.atualizar(50, { nome: 'Novo nome' }, 7, false),
    ).rejects.toBeInstanceOf(HomebrewSemPermissaoException);

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('bloqueia exclusao de homebrew de outro usuario', async () => {
    prisma.homebrew.findUnique.mockResolvedValue({
      id: 50,
      codigo: 'HB_PRIVADA',
      usuarioId: 99,
    });

    await expect(service.deletar(50, 7, false)).rejects.toBeInstanceOf(
      HomebrewSemPermissaoException,
    );

    expect(prisma.homebrew.delete).not.toHaveBeenCalled();
  });
});
