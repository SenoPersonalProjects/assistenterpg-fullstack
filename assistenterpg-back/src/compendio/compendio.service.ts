// src/compendio/compendio.service.ts - REFATORADO COM EXCEÇÕES CUSTOMIZADAS
// ✅ CORRIGIDO - Remove TODOS os 'select' conflitantes com 'include'

import { Injectable } from '@nestjs/common';
import { PaginatedResult } from 'src/common/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { CreateSubcategoriaDto } from './dto/create-subcategoria.dto';
import { UpdateSubcategoriaDto } from './dto/update-subcategoria.dto';
import { CreateArtigoDto } from './dto/create-artigo.dto';
import { UpdateArtigoDto } from './dto/update-artigo.dto';

// ✅ IMPORTAR EXCEÇÕES CUSTOMIZADAS
import {
  CompendioCategoriaException,
  CompendioCategoriaDuplicadaException,
  CompendioCategoriaComSubcategoriasException,
  CompendioSubcategoriaException,
  CompendioSubcategoriaDuplicadaException,
  CompendioSubcategoriaComArtigosException,
  CompendioArtigoException,
  CompendioArtigoDuplicadoException,
  CompendioBuscaInvalidaException,
} from 'src/common/exceptions/compendio.exception';

@Injectable()
export class CompendioService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== CATEGORIAS ====================

  async listarCategorias(
    apenasAtivas = true,
    page?: number,
    limit?: number,
  ): Promise<any[] | PaginatedResult<any>> {
    const where = apenasAtivas ? { ativo: true } : undefined;

    const include = {
      subcategorias: {
        where: apenasAtivas ? { ativo: true } : undefined,
        orderBy: { ordem: 'asc' as const },
        include: {
          categoria: true,
        },
      },
    };

    if (!page || !limit) {
      return this.prisma.compendioCategoria.findMany({
        where,
        orderBy: { ordem: 'asc' },
        include,
      });
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.compendioCategoria.findMany({
        where,
        orderBy: { ordem: 'asc' },
        include,
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
    const categoria = await this.prisma.compendioCategoria.findUnique({
      where: { codigo },
      include: {
        subcategorias: {
          where: { ativo: true },
          orderBy: { ordem: 'asc' },
          include: {
            categoria: true, // ✅ REMOVIDO 'select'
          },
        },
      },
    });

    if (!categoria) {
      throw new CompendioCategoriaException(codigo);
    }

    return categoria;
  }

  async criarCategoria(dto: CreateCategoriaDto) {
    const existe = await this.prisma.compendioCategoria.findUnique({
      where: { codigo: dto.codigo },
    });

    if (existe) {
      throw new CompendioCategoriaDuplicadaException(dto.codigo);
    }

    return this.prisma.compendioCategoria.create({ data: dto });
  }

  async atualizarCategoria(id: number, dto: UpdateCategoriaDto) {
    const existe = await this.prisma.compendioCategoria.findUnique({
      where: { id },
    });

    if (!existe) {
      throw new CompendioCategoriaException(id);
    }

    if (dto.codigo && dto.codigo !== existe.codigo) {
      const outraComCodigo = await this.prisma.compendioCategoria.findUnique({
        where: { codigo: dto.codigo },
      });

      if (outraComCodigo) {
        throw new CompendioCategoriaDuplicadaException(dto.codigo);
      }
    }

    return this.prisma.compendioCategoria.update({ where: { id }, data: dto });
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

    const include = {
      categoria: true,
      artigos: {
        where: apenasAtivas ? { ativo: true } : undefined,
        orderBy: { ordem: 'asc' as const },
        include: {
          subcategoria: true,
        },
      },
    };

    if (!page || !limit) {
      return this.prisma.compendioSubcategoria.findMany({
        where,
        orderBy: { ordem: 'asc' },
        include,
      });
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.compendioSubcategoria.findMany({
        where,
        orderBy: { ordem: 'asc' },
        include,
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
    const subcategoria = await this.prisma.compendioSubcategoria.findUnique({
      where: { codigo },
      include: {
        categoria: true, // ✅ SIMPLES
        artigos: {
          where: { ativo: true },
          orderBy: { ordem: 'asc' },
          include: {
            subcategoria: true,
          },
        },
      },
    });

    if (!subcategoria) {
      throw new CompendioSubcategoriaException(codigo);
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

    const existe = await this.prisma.compendioSubcategoria.findUnique({
      where: { codigo: dto.codigo },
    });

    if (existe) {
      throw new CompendioSubcategoriaDuplicadaException(dto.codigo);
    }

    return this.prisma.compendioSubcategoria.create({
      data: dto,
      include: { categoria: true },
    });
  }

  async atualizarSubcategoria(id: number, dto: UpdateSubcategoriaDto) {
    const existe = await this.prisma.compendioSubcategoria.findUnique({
      where: { id },
    });

    if (!existe) {
      throw new CompendioSubcategoriaException(id);
    }

    if (dto.codigo && dto.codigo !== existe.codigo) {
      const outraComCodigo = await this.prisma.compendioSubcategoria.findUnique(
        {
          where: { codigo: dto.codigo },
        },
      );

      if (outraComCodigo) {
        throw new CompendioSubcategoriaDuplicadaException(dto.codigo);
      }
    }

    return this.prisma.compendioSubcategoria.update({
      where: { id },
      data: dto,
      include: { categoria: true },
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

    const include = {
      subcategoria: {
        include: {
          categoria: true,
        },
      },
    };

    if (!page || !limit) {
      return this.prisma.compendioArtigo.findMany({
        where,
        orderBy: { ordem: 'asc' },
        include,
      });
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.compendioArtigo.findMany({
        where,
        orderBy: { ordem: 'asc' },
        include,
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
    const artigo = await this.prisma.compendioArtigo.findUnique({
      where: { codigo },
      include: {
        subcategoria: {
          include: {
            categoria: true,
          },
        },
      },
    });

    if (!artigo) {
      throw new CompendioArtigoException(codigo);
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

    const existe = await this.prisma.compendioArtigo.findUnique({
      where: { codigo: dto.codigo },
    });

    if (existe) {
      throw new CompendioArtigoDuplicadoException(dto.codigo);
    }

    return this.prisma.compendioArtigo.create({
      data: dto,
      include: {
        subcategoria: {
          include: { categoria: true },
        },
      },
    });
  }

  async atualizarArtigo(id: number, dto: UpdateArtigoDto) {
    const existe = await this.prisma.compendioArtigo.findUnique({
      where: { id },
    });

    if (!existe) {
      throw new CompendioArtigoException(id);
    }

    if (dto.codigo && dto.codigo !== existe.codigo) {
      const outroComCodigo = await this.prisma.compendioArtigo.findUnique({
        where: { codigo: dto.codigo },
      });

      if (outroComCodigo) {
        throw new CompendioArtigoDuplicadoException(dto.codigo);
      }
    }

    return this.prisma.compendioArtigo.update({
      where: { id },
      data: dto,
      include: {
        subcategoria: {
          include: { categoria: true },
        },
      },
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

  // ==================== BUSCA ====================

  async buscar(query: string) {
    const queryTrimmed = query?.trim() || '';

    if (queryTrimmed.length < 3) {
      throw new CompendioBuscaInvalidaException(3, queryTrimmed.length);
    }

    const q = queryTrimmed.toLowerCase();

    return this.prisma.compendioArtigo.findMany({
      where: {
        ativo: true,
        OR: [
          { titulo: { contains: q } },
          { resumo: { contains: q } },
          { palavrasChave: { contains: q } },
          { conteudo: { contains: q } },
        ],
      },
      include: {
        subcategoria: {
          include: {
            categoria: true,
          },
        },
      },
      take: 20,
    });
  }

  // ==================== DESTAQUES ====================

  async listarDestaques() {
    return this.prisma.compendioArtigo.findMany({
      where: {
        ativo: true,
        destaque: true,
      },
      orderBy: { ordem: 'asc' },
      include: {
        subcategoria: {
          include: {
            categoria: true,
          },
        },
      },
      take: 6,
    });
  }
}
