import { StatusPublicacao } from '@prisma/client';
import { CompendioService } from './compendio.service';

describe('CompendioService', () => {
  const prisma = {
    compendioLivro: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    compendioCategoria: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    compendioSubcategoria: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    compendioArtigo: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    suplemento: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  let service: CompendioService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CompendioService(prisma as never);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('lists only published books by default', async () => {
    prisma.compendioLivro.findMany.mockResolvedValue([]);

    await service.listarLivros();

    expect(prisma.compendioLivro.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: StatusPublicacao.PUBLICADO },
        orderBy: { ordem: 'asc' },
      }),
    );
  });

  it('looks up scoped article routes inside the requested book tree', async () => {
    prisma.compendioArtigo.findFirst.mockResolvedValue({ id: 1 });

    await service.buscarArtigoDoLivroPorCodigo(
      'sobrevivendo-ao-jujutsu',
      'equipamentos',
      'equipamentos-do-suplemento',
      'visao-geral-dos-equipamentos',
    );

    expect(prisma.compendioArtigo.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          codigo: 'visao-geral-dos-equipamentos',
          subcategoria: expect.objectContaining({
            codigo: 'equipamentos-do-suplemento',
            categoria: expect.objectContaining({
              codigo: 'equipamentos',
              livro: expect.objectContaining({
                codigo: 'sobrevivendo-ao-jujutsu',
                status: StatusPublicacao.PUBLICADO,
              }),
            }),
          }),
        }),
      }),
    );
  });

  it('keeps legacy article lookup scoped to the main book', async () => {
    prisma.compendioArtigo.findFirst.mockResolvedValue({ id: 1 });

    await service.buscarArtigoPorCodigo('atributos');

    expect(prisma.compendioArtigo.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          codigo: 'atributos',
          subcategoria: expect.objectContaining({
            categoria: expect.objectContaining({
              livro: expect.objectContaining({
                codigo: 'livro-principal',
                status: StatusPublicacao.PUBLICADO,
              }),
            }),
          }),
        }),
      }),
    );
  });

  it('applies book filter to search when provided', async () => {
    prisma.compendioArtigo.findMany.mockResolvedValue([]);

    await service.buscar('energia', 'livro-principal');

    expect(prisma.compendioArtigo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          subcategoria: expect.objectContaining({
            categoria: expect.objectContaining({
              livro: expect.objectContaining({
                codigo: 'livro-principal',
                status: StatusPublicacao.PUBLICADO,
              }),
            }),
          }),
        }),
      }),
    );
  });

  it('exports current compendium seed from database rows', async () => {
    prisma.compendioLivro.findMany.mockResolvedValue([
      {
        codigo: 'livro-principal',
        titulo: 'Livro Principal',
        descricao: 'Regras principais',
        icone: 'rules',
        cor: '#7c5cfc',
        ordem: 1,
        status: StatusPublicacao.PUBLICADO,
        suplemento: null,
        categorias: [
          {
            codigo: 'regras-basicas',
            nome: 'Regras Basicas',
            descricao: null,
            icone: 'dice',
            cor: '#22d3ee',
            ordem: 1,
            ativo: true,
            subcategorias: [
              {
                codigo: 'atributos',
                nome: 'Atributos',
                descricao: null,
                ordem: 1,
                ativo: true,
                artigos: [
                  {
                    codigo: 'atributos',
                    titulo: 'Atributos',
                    resumo: 'Resumo',
                    conteudo: '# Atributos',
                    ordem: 1,
                    tags: ['livro-principal'],
                    palavrasChave: 'atributos',
                    nivelDificuldade: 'iniciante',
                    artigosRelacionados: [],
                    ativo: true,
                    destaque: true,
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);

    const result = await service.exportarSeedCompendio();

    expect(result).toEqual(
      expect.objectContaining({
        version: 1,
        source: 'database',
        exportedAt: expect.any(String),
        livros: [
          expect.objectContaining({
            codigo: 'livro-principal',
            categorias: [
              expect.objectContaining({
                codigo: 'regras-basicas',
                subcategorias: [
                  expect.objectContaining({
                    codigo: 'atributos',
                    artigos: [
                      expect.objectContaining({
                        codigo: 'atributos',
                        conteudo: '# Atributos',
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    );
    expect(prisma.compendioLivro.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { ordem: 'asc' },
      }),
    );
  });

  it('creates draft books with generated code', async () => {
    prisma.compendioLivro.findUnique.mockResolvedValue(null);
    prisma.compendioLivro.create.mockResolvedValue({
      id: 20,
      codigo: 'novo-livro',
    });

    await service.criarLivro({ titulo: 'Novo Livro' });

    expect(prisma.compendioLivro.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          codigo: 'novo-livro',
          titulo: 'Novo Livro',
          status: StatusPublicacao.RASCUNHO,
        }),
      }),
    );
  });

  it('updates book publication status', async () => {
    prisma.compendioLivro.findUnique.mockResolvedValue({
      id: 20,
      codigo: 'novo-livro',
    });
    prisma.compendioLivro.update.mockResolvedValue({
      id: 20,
      status: StatusPublicacao.PUBLICADO,
    });

    await service.atualizarLivro(20, { status: StatusPublicacao.PUBLICADO });

    expect(prisma.compendioLivro.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 20 },
        data: expect.objectContaining({
          status: StatusPublicacao.PUBLICADO,
        }),
      }),
    );
  });

  it('reorders compendium articles', async () => {
    prisma.$transaction.mockResolvedValue([]);

    await service.reordenar({ tipo: 'artigo', ids: [3, 1, 2] });

    expect(prisma.compendioArtigo.update).toHaveBeenCalledTimes(3);
    expect(prisma.compendioArtigo.update).toHaveBeenNthCalledWith(1, {
      where: { id: 3 },
      data: { ordem: 1 },
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
