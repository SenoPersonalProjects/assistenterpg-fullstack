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

  function artigoEscudo(params: {
    codigo: string;
    titulo: string;
    categoriaCodigo: string;
    subcategoriaCodigo: string;
    conteudo?: string;
    resumo?: string | null;
    livroCodigo?: string;
    livroTitulo?: string;
  }) {
    return {
      codigo: params.codigo,
      titulo: params.titulo,
      resumo: params.resumo ?? `Resumo de ${params.titulo}`,
      conteudo: params.conteudo ?? `# ${params.titulo}\n\nConteúdo oficial.`,
      subcategoria: {
        codigo: params.subcategoriaCodigo,
        nome: params.subcategoriaCodigo,
        categoria: {
          codigo: params.categoriaCodigo,
          nome: params.categoriaCodigo,
          livro: {
            codigo: params.livroCodigo ?? 'livro-principal',
            titulo: params.livroTitulo ?? 'Livro Principal',
          },
        },
      },
    };
  }

  function artigosEscudoBase() {
    return [
      artigoEscudo({
        codigo: 'basico',
        titulo: 'BÁSICO',
        categoriaCodigo: 'introducao-ao-sistema-jujutsu-kaisen-rpg',
        subcategoriaCodigo: 'basico',
      }),
      artigoEscudo({
        codigo: 'testes-e-habilidades',
        titulo: 'TESTES E HABILIDADES',
        categoriaCodigo: 'regras-gerais',
        subcategoriaCodigo: 'testes-e-habilidades',
      }),
      artigoEscudo({
        codigo: 'cenas-rodadas-e-turnos-parte-1',
        titulo: 'CENAS, RODADAS E TURNOS - Parte 1/2',
        categoriaCodigo: 'regras-gerais',
        subcategoriaCodigo: 'cenas-rodadas-e-turnos',
        conteudo:
          '# Cenas\n\n#### ***10.3.1.11. Ferimentos E Morte***\nQuando você sofre dano, seus PV são reduzidos.\n\n#### Outro trecho\nTexto posterior.',
      }),
      artigoEscudo({
        codigo: 'cenas-rodadas-e-turnos-parte-2',
        titulo: 'CENAS, RODADAS E TURNOS - Parte 2/2',
        categoriaCodigo: 'regras-gerais',
        subcategoriaCodigo: 'cenas-rodadas-e-turnos',
      }),
      artigoEscudo({
        codigo: 'pericias',
        titulo: 'PERÍCIAS',
        categoriaCodigo:
          'introducao-as-regras-basicas-na-criacao-do-personagem',
        subcategoriaCodigo: 'pericias',
      }),
      artigoEscudo({
        codigo: 'conteudo',
        titulo: 'CONDIÇÕES',
        categoriaCodigo: 'condicoes',
        subcategoriaCodigo: 'conteudo',
      }),
      artigoEscudo({
        codigo: 'mecanica-de-expansao-de-dominio',
        titulo: 'MECÂNICA DE EXPANSÃO DE DOMÍNIO',
        categoriaCodigo: 'tecnicas-amaldicoadas',
        subcategoriaCodigo: 'mecanica-de-expansao-de-dominio',
      }),
      artigoEscudo({
        codigo: 'armas',
        titulo: 'ARMAS',
        categoriaCodigo: 'equipamentos',
        subcategoriaCodigo: 'armas',
      }),
    ];
  }

  function livroSobrevivendo() {
    return {
      codigo: 'sobrevivendo-ao-jujutsu',
      titulo: 'Sobrevivendo ao Jujutsu',
      descricao: 'Primeiro suplemento oficial.',
      suplementoId: 10,
      categorias: [
        {
          codigo: 'apresentacao',
          nome: 'Apresentação',
          descricao: 'Resumo do suplemento.',
          subcategorias: [
            {
              codigo: 'inicio',
              nome: 'Início',
              artigos: [
                {
                  codigo: 'apresentacao',
                  titulo: 'Apresentação',
                  resumo: 'Resumo inicial.',
                },
              ],
            },
          ],
        },
        {
          codigo: 'origens',
          nome: 'Origens',
          descricao: 'Novas origens.',
          subcategorias: [],
        },
      ],
    };
  }

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

  it('builds the master shield from published compendium content', async () => {
    prisma.compendioArtigo.findMany.mockResolvedValue(artigosEscudoBase());
    prisma.compendioLivro.findMany.mockResolvedValue([livroSobrevivendo()]);

    const result = await service.buscarEscudoMestre();

    expect(result.secoes.map((secao) => secao.id)).toEqual([
      'regras-principais',
      'pericias',
      'condicoes',
      'dominios',
      'ferimentos-morte',
      'tipos-dano',
      'tipos-acoes',
      'suplementos-oficiais',
      'sobrevivendo-ao-jujutsu',
    ]);
    expect(result.avisos).toEqual([]);
    expect(result.secoes.find((secao) => secao.id === 'pericias')).toEqual(
      expect.objectContaining({
        fonte: 'BASE',
        referenciaCompendio: 'Livro Principal',
        origens: [
          expect.objectContaining({
            livroCodigo: 'livro-principal',
            artigoCodigo: 'pericias',
            href: expect.stringContaining('/compendio/livros/livro-principal/'),
          }),
        ],
      }),
    );
  });

  it('normalizes Ferimentos e Morte from the official article excerpt', async () => {
    prisma.compendioArtigo.findMany.mockResolvedValue(artigosEscudoBase());
    prisma.compendioLivro.findMany.mockResolvedValue([livroSobrevivendo()]);

    const result = await service.buscarEscudoMestre();
    const secao = result.secoes.find((item) => item.id === 'ferimentos-morte');

    expect(secao?.titulo).toBe('Ferimentos e Morte');
    expect(secao?.detalhadoMarkdown).toContain('Ferimentos e Morte');
    expect(secao?.detalhadoMarkdown).not.toContain('Ferimentos E Morte');
    expect(secao?.detalhadoMarkdown).toContain('Quando você sofre dano');
    expect(secao?.detalhadoMarkdown).not.toContain('Outro trecho');
  });

  it('includes official supplements and Sobrevivendo ao Jujutsu when published', async () => {
    prisma.compendioArtigo.findMany.mockResolvedValue(artigosEscudoBase());
    prisma.compendioLivro.findMany.mockResolvedValue([livroSobrevivendo()]);

    const result = await service.buscarEscudoMestre();
    const suplementos = result.secoes.find(
      (secao) => secao.id === 'suplementos-oficiais',
    );
    const sobrevivendo = result.secoes.find(
      (secao) => secao.id === 'sobrevivendo-ao-jujutsu',
    );

    expect(suplementos?.resumoMarkdown).toContain('Sobrevivendo ao Jujutsu');
    expect(sobrevivendo?.resumoMarkdown).toContain(
      '/compendio/livros/sobrevivendo-ao-jujutsu',
    );
    expect(sobrevivendo?.detalhadoMarkdown).toContain('Origens');
  });

  it('returns controlled warnings when optional compendium references are missing', async () => {
    prisma.compendioArtigo.findMany.mockResolvedValue([]);
    prisma.compendioLivro.findMany.mockResolvedValue([]);

    const result = await service.buscarEscudoMestre();

    expect(result.secoes).toHaveLength(9);
    expect(result.avisos.length).toBeGreaterThan(0);
    expect(result.secoes.find((secao) => secao.id === 'pericias')).toEqual(
      expect.objectContaining({
        resumoMarkdown: expect.stringContaining('Nenhum conteúdo publicado'),
      }),
    );
    expect(
      result.secoes.find((secao) => secao.id === 'sobrevivendo-ao-jujutsu')
        ?.avisos,
    ).toEqual([
      'Livro do suplemento "Sobrevivendo ao Jujutsu" não encontrado no compêndio publicado.',
    ]);
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
            nome: 'Regras Básicas',
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
