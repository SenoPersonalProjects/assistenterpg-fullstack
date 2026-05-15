import { Injectable } from '@nestjs/common';
import { StatusPublicacao } from '@prisma/client';
import { PaginatedResult } from 'src/common/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { CreateSubcategoriaDto } from './dto/create-subcategoria.dto';
import { UpdateSubcategoriaDto } from './dto/update-subcategoria.dto';
import { CreateArtigoDto } from './dto/create-artigo.dto';
import { UpdateArtigoDto } from './dto/update-artigo.dto';
import {
  CompendioArtigoDuplicadoException,
  CompendioArtigoException,
  CompendioBuscaInvalidaException,
  CompendioCategoriaComSubcategoriasException,
  CompendioCategoriaDuplicadaException,
  CompendioCategoriaException,
  CompendioSubcategoriaComArtigosException,
  CompendioSubcategoriaDuplicadaException,
  CompendioSubcategoriaException,
} from 'src/common/exceptions/compendio.exception';

const LIVRO_PRINCIPAL_CODIGO = 'livro-principal';

@Injectable()
export class CompendioService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== INCLUDES ====================

  private artigoInclude() {
    return {
      subcategoria: {
        include: {
          categoria: {
            include: {
              livro: true,
            },
          },
        },
      },
    };
  }

  private subcategoriaInclude(apenasAtivos = true) {
    return {
      categoria: {
        include: {
          livro: true,
        },
      },
      artigos: {
        where: apenasAtivos ? { ativo: true } : undefined,
        orderBy: { ordem: 'asc' as const },
        include: this.artigoInclude(),
      },
    };
  }

  private categoriaInclude(apenasAtivos = true) {
    return {
      livro: true,
      subcategorias: {
        where: apenasAtivos ? { ativo: true } : undefined,
        orderBy: { ordem: 'asc' as const },
        include: this.subcategoriaInclude(apenasAtivos),
      },
    };
  }

  private livroInclude(apenasAtivos = true) {
    return {
      suplemento: true,
      categorias: {
        where: apenasAtivos ? { ativo: true } : undefined,
        orderBy: { ordem: 'asc' as const },
        include: this.categoriaInclude(apenasAtivos),
      },
    };
  }

  private async livroPrincipalId(): Promise<number> {
    const livro = await this.prisma.compendioLivro.upsert({
      where: { codigo: LIVRO_PRINCIPAL_CODIGO },
      update: {},
      create: {
        codigo: LIVRO_PRINCIPAL_CODIGO,
        titulo: 'Livro Principal',
        descricao: 'Regras principais do sistema Jujutsu Kaisen RPG.',
        icone: 'rules',
        cor: '#7c5cfc',
        ordem: 1,
        status: StatusPublicacao.PUBLICADO,
      },
      select: { id: true },
    });

    return livro.id;
  }

  // ==================== LIVROS ====================

  async listarLivros(todos = false) {
    return this.prisma.compendioLivro.findMany({
      where: todos ? undefined : { status: StatusPublicacao.PUBLICADO },
      orderBy: { ordem: 'asc' },
      include: this.livroInclude(true),
    });
  }

  async buscarLivroPorCodigo(codigo: string, todos = false) {
    const livro = await this.prisma.compendioLivro.findFirst({
      where: {
        codigo,
        ...(todos ? {} : { status: StatusPublicacao.PUBLICADO }),
      },
      include: this.livroInclude(true),
    });

    if (!livro) {
      throw new CompendioCategoriaException(codigo);
    }

    return livro;
  }

  // ==================== CATEGORIAS ====================

  async listarCategorias(
    apenasAtivas = true,
    page?: number,
    limit?: number,
  ): Promise<any[] | PaginatedResult<any>> {
    return this.listarCategoriasDoLivro(
      LIVRO_PRINCIPAL_CODIGO,
      apenasAtivas,
      page,
      limit,
    );
  }

  async listarCategoriasDoLivro(
    livroCodigo: string,
    apenasAtivas = true,
    page?: number,
    limit?: number,
  ): Promise<any[] | PaginatedResult<any>> {
    const where = {
      livro: { codigo: livroCodigo },
      ...(apenasAtivas && { ativo: true }),
    };

    if (!page || !limit) {
      return this.prisma.compendioCategoria.findMany({
        where,
        orderBy: { ordem: 'asc' },
        include: this.categoriaInclude(apenasAtivas),
      });
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.compendioCategoria.findMany({
        where,
        orderBy: { ordem: 'asc' },
        include: this.categoriaInclude(apenasAtivas),
        skip,
        take: limit,
      }),
      this.prisma.compendioCategoria.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async buscarCategoriaPorCodigo(codigo: string) {
    return this.buscarCategoriaDoLivroPorCodigo(
      LIVRO_PRINCIPAL_CODIGO,
      codigo,
    );
  }

  async buscarCategoriaDoLivroPorCodigo(
    livroCodigo: string,
    categoriaCodigo: string,
  ) {
    const categoria = await this.prisma.compendioCategoria.findFirst({
      where: {
        codigo: categoriaCodigo,
        livro: {
          codigo: livroCodigo,
          status: StatusPublicacao.PUBLICADO,
        },
      },
      include: this.categoriaInclude(true),
    });

    if (!categoria) {
      throw new CompendioCategoriaException(categoriaCodigo);
    }

    return categoria;
  }

  async criarCategoria(dto: CreateCategoriaDto) {
    const livroId = dto.livroId ?? (await this.livroPrincipalId());
    const livro = await this.prisma.compendioLivro.findUnique({
      where: { id: livroId },
    });

    if (!livro) {
      throw new CompendioCategoriaException(livroId);
    }

    const existe = await this.prisma.compendioCategoria.findFirst({
      where: { codigo: dto.codigo, livroId },
    });

    if (existe) {
      throw new CompendioCategoriaDuplicadaException(dto.codigo);
    }

    return this.prisma.compendioCategoria.create({
      data: {
        ...dto,
        livroId,
      },
      include: this.categoriaInclude(false),
    });
  }

  async atualizarCategoria(id: number, dto: UpdateCategoriaDto) {
    const existe = await this.prisma.compendioCategoria.findUnique({
      where: { id },
    });

    if (!existe) {
      throw new CompendioCategoriaException(id);
    }

    const livroId = dto.livroId ?? existe.livroId;
    if (dto.livroId) {
      const livro = await this.prisma.compendioLivro.findUnique({
        where: { id: dto.livroId },
      });

      if (!livro) {
        throw new CompendioCategoriaException(dto.livroId);
      }
    }

    if (dto.codigo && (dto.codigo !== existe.codigo || livroId !== existe.livroId)) {
      const outraComCodigo = await this.prisma.compendioCategoria.findFirst({
        where: { codigo: dto.codigo, livroId },
      });

      if (outraComCodigo) {
        throw new CompendioCategoriaDuplicadaException(dto.codigo);
      }
    }

    return this.prisma.compendioCategoria.update({
      where: { id },
      data: dto,
      include: this.categoriaInclude(false),
    });
  }

  async removerCategoria(id: number) {
    const existe = await this.prisma.compendioCategoria.findUnique({
      where: { id },
      include: { subcategorias: true },
    });

    if (!existe) {
      throw new CompendioCategoriaException(id);
    }

    if (existe.subcategorias.length > 0) {
      throw new CompendioCategoriaComSubcategoriasException(
        id,
        existe.subcategorias.length,
      );
    }

    await this.prisma.compendioCategoria.delete({ where: { id } });
    return { sucesso: true };
  }

  // ==================== SUBCATEGORIAS ====================

  async listarSubcategorias(
    categoriaId: number,
    apenasAtivas = true,
    page?: number,
    limit?: number,
  ): Promise<any[] | PaginatedResult<any>> {
    const where = {
      categoriaId,
      ...(apenasAtivas && { ativo: true }),
    };

    if (!page || !limit) {
      return this.prisma.compendioSubcategoria.findMany({
        where,
        orderBy: { ordem: 'asc' },
        include: this.subcategoriaInclude(apenasAtivas),
      });
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.compendioSubcategoria.findMany({
        where,
        orderBy: { ordem: 'asc' },
        include: this.subcategoriaInclude(apenasAtivas),
        skip,
        take: limit,
      }),
      this.prisma.compendioSubcategoria.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async buscarSubcategoriaPorCodigo(codigo: string) {
    const subcategoria = await this.prisma.compendioSubcategoria.findFirst({
      where: {
        codigo,
        categoria: {
          livro: {
            codigo: LIVRO_PRINCIPAL_CODIGO,
            status: StatusPublicacao.PUBLICADO,
          },
        },
      },
      include: this.subcategoriaInclude(true),
    });

    if (!subcategoria) {
      throw new CompendioSubcategoriaException(codigo);
    }

    return subcategoria;
  }

  async buscarSubcategoriaDoLivroPorCodigo(
    livroCodigo: string,
    categoriaCodigo: string,
    subcategoriaCodigo: string,
  ) {
    const subcategoria = await this.prisma.compendioSubcategoria.findFirst({
      where: {
        codigo: subcategoriaCodigo,
        categoria: {
          codigo: categoriaCodigo,
          livro: {
            codigo: livroCodigo,
            status: StatusPublicacao.PUBLICADO,
          },
        },
      },
      include: this.subcategoriaInclude(true),
    });

    if (!subcategoria) {
      throw new CompendioSubcategoriaException(subcategoriaCodigo);
    }

    return subcategoria;
  }

  async criarSubcategoria(dto: CreateSubcategoriaDto) {
    const categoria = await this.prisma.compendioCategoria.findUnique({
      where: { id: dto.categoriaId },
    });

    if (!categoria) {
      throw new CompendioCategoriaException(dto.categoriaId);
    }

    const existe = await this.prisma.compendioSubcategoria.findFirst({
      where: { codigo: dto.codigo, categoriaId: dto.categoriaId },
    });

    if (existe) {
      throw new CompendioSubcategoriaDuplicadaException(dto.codigo);
    }

    return this.prisma.compendioSubcategoria.create({
      data: dto,
      include: this.subcategoriaInclude(false),
    });
  }

  async atualizarSubcategoria(id: number, dto: UpdateSubcategoriaDto) {
    const existe = await this.prisma.compendioSubcategoria.findUnique({
      where: { id },
    });

    if (!existe) {
      throw new CompendioSubcategoriaException(id);
    }

    const categoriaId = dto.categoriaId ?? existe.categoriaId;
    if (dto.categoriaId) {
      const categoria = await this.prisma.compendioCategoria.findUnique({
        where: { id: dto.categoriaId },
      });

      if (!categoria) {
        throw new CompendioCategoriaException(dto.categoriaId);
      }
    }

    if (
      dto.codigo &&
      (dto.codigo !== existe.codigo || categoriaId !== existe.categoriaId)
    ) {
      const outraComCodigo = await this.prisma.compendioSubcategoria.findFirst({
        where: { codigo: dto.codigo, categoriaId },
      });

      if (outraComCodigo) {
        throw new CompendioSubcategoriaDuplicadaException(dto.codigo);
      }
    }

    return this.prisma.compendioSubcategoria.update({
      where: { id },
      data: dto,
      include: this.subcategoriaInclude(false),
    });
  }

  async removerSubcategoria(id: number) {
    const existe = await this.prisma.compendioSubcategoria.findUnique({
      where: { id },
      include: { artigos: true },
    });

    if (!existe) {
      throw new CompendioSubcategoriaException(id);
    }

    if (existe.artigos.length > 0) {
      throw new CompendioSubcategoriaComArtigosException(
        id,
        existe.artigos.length,
      );
    }

    await this.prisma.compendioSubcategoria.delete({ where: { id } });
    return { sucesso: true };
  }

  // ==================== ARTIGOS ====================

  async listarArtigos(
    subcategoriaId?: number,
    apenasAtivos = true,
    page?: number,
    limit?: number,
  ): Promise<any[] | PaginatedResult<any>> {
    const where = {
      ...(subcategoriaId && { subcategoriaId }),
      ...(apenasAtivos && { ativo: true }),
    };

    if (!page || !limit) {
      return this.prisma.compendioArtigo.findMany({
        where,
        orderBy: { ordem: 'asc' },
        include: this.artigoInclude(),
      });
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.compendioArtigo.findMany({
        where,
        orderBy: { ordem: 'asc' },
        include: this.artigoInclude(),
        skip,
        take: limit,
      }),
      this.prisma.compendioArtigo.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async buscarArtigoPorCodigo(codigo: string) {
    const artigo = await this.prisma.compendioArtigo.findFirst({
      where: {
        codigo,
        subcategoria: {
          categoria: {
            livro: {
              codigo: LIVRO_PRINCIPAL_CODIGO,
              status: StatusPublicacao.PUBLICADO,
            },
          },
        },
      },
      include: this.artigoInclude(),
    });

    if (!artigo) {
      throw new CompendioArtigoException(codigo);
    }

    return artigo;
  }

  async buscarArtigoDoLivroPorCodigo(
    livroCodigo: string,
    categoriaCodigo: string,
    subcategoriaCodigo: string,
    artigoCodigo: string,
  ) {
    const artigo = await this.prisma.compendioArtigo.findFirst({
      where: {
        codigo: artigoCodigo,
        subcategoria: {
          codigo: subcategoriaCodigo,
          categoria: {
            codigo: categoriaCodigo,
            livro: {
              codigo: livroCodigo,
              status: StatusPublicacao.PUBLICADO,
            },
          },
        },
      },
      include: this.artigoInclude(),
    });

    if (!artigo) {
      throw new CompendioArtigoException(artigoCodigo);
    }

    return artigo;
  }

  async criarArtigo(dto: CreateArtigoDto) {
    const subcategoria = await this.prisma.compendioSubcategoria.findUnique({
      where: { id: dto.subcategoriaId },
    });

    if (!subcategoria) {
      throw new CompendioSubcategoriaException(dto.subcategoriaId);
    }

    const existe = await this.prisma.compendioArtigo.findFirst({
      where: { codigo: dto.codigo, subcategoriaId: dto.subcategoriaId },
    });

    if (existe) {
      throw new CompendioArtigoDuplicadoException(dto.codigo);
    }

    return this.prisma.compendioArtigo.create({
      data: dto,
      include: this.artigoInclude(),
    });
  }

  async atualizarArtigo(id: number, dto: UpdateArtigoDto) {
    const existe = await this.prisma.compendioArtigo.findUnique({
      where: { id },
    });

    if (!existe) {
      throw new CompendioArtigoException(id);
    }

    const subcategoriaId = dto.subcategoriaId ?? existe.subcategoriaId;
    if (dto.subcategoriaId) {
      const subcategoria = await this.prisma.compendioSubcategoria.findUnique({
        where: { id: dto.subcategoriaId },
      });

      if (!subcategoria) {
        throw new CompendioSubcategoriaException(dto.subcategoriaId);
      }
    }

    if (
      dto.codigo &&
      (dto.codigo !== existe.codigo || subcategoriaId !== existe.subcategoriaId)
    ) {
      const outroComCodigo = await this.prisma.compendioArtigo.findFirst({
        where: { codigo: dto.codigo, subcategoriaId },
      });

      if (outroComCodigo) {
        throw new CompendioArtigoDuplicadoException(dto.codigo);
      }
    }

    return this.prisma.compendioArtigo.update({
      where: { id },
      data: dto,
      include: this.artigoInclude(),
    });
  }

  async removerArtigo(id: number) {
    const existe = await this.prisma.compendioArtigo.findUnique({
      where: { id },
    });

    if (!existe) {
      throw new CompendioArtigoException(id);
    }

    await this.prisma.compendioArtigo.delete({ where: { id } });
    return { sucesso: true };
  }

  // ==================== BUSCA & DESTAQUES ====================

  async buscar(query: string, livroCodigo?: string) {
    const queryTrimmed = query?.trim() || '';

    if (queryTrimmed.length < 3) {
      throw new CompendioBuscaInvalidaException(3, queryTrimmed.length);
    }

    const q = queryTrimmed.toLowerCase();

    return this.prisma.compendioArtigo.findMany({
      where: {
        ativo: true,
        subcategoria: {
          categoria: {
            livro: {
              status: StatusPublicacao.PUBLICADO,
              ...(livroCodigo ? { codigo: livroCodigo } : {}),
            },
          },
        },
        OR: [
          { titulo: { contains: q } },
          { resumo: { contains: q } },
          { palavrasChave: { contains: q } },
          { conteudo: { contains: q } },
        ],
      },
      include: this.artigoInclude(),
      orderBy: { ordem: 'asc' },
      take: 20,
    });
  }

  async listarDestaques(livroCodigo?: string) {
    return this.prisma.compendioArtigo.findMany({
      where: {
        ativo: true,
        destaque: true,
        subcategoria: {
          categoria: {
            livro: {
              status: StatusPublicacao.PUBLICADO,
              ...(livroCodigo ? { codigo: livroCodigo } : {}),
            },
          },
        },
      },
      orderBy: { ordem: 'asc' },
      include: this.artigoInclude(),
      take: 6,
    });
  }
}
