import { StatusPublicacao } from '@prisma/client';
import { CompendioService } from './compendio.service';

describe('CompendioService', () => {
  const prisma = {
    compendioLivro: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
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
});
