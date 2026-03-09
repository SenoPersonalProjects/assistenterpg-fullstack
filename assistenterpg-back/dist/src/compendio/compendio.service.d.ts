import { PaginatedResult } from 'src/common/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { CreateSubcategoriaDto } from './dto/create-subcategoria.dto';
import { UpdateSubcategoriaDto } from './dto/update-subcategoria.dto';
import { CreateArtigoDto } from './dto/create-artigo.dto';
import { UpdateArtigoDto } from './dto/update-artigo.dto';
export declare class CompendioService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listarCategorias(apenasAtivas?: boolean, page?: number, limit?: number): Promise<any[] | PaginatedResult<any>>;
    buscarCategoriaPorCodigo(codigo: string): Promise<{
        subcategorias: ({
            categoria: {
                id: number;
                criadoEm: Date;
                atualizadoEm: Date;
                nome: string;
                descricao: string | null;
                codigo: string;
                ativo: boolean;
                ordem: number;
                icone: string | null;
                cor: string | null;
            };
        } & {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string | null;
            codigo: string;
            ativo: boolean;
            ordem: number;
            categoriaId: number;
        })[];
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        nome: string;
        descricao: string | null;
        codigo: string;
        ativo: boolean;
        ordem: number;
        icone: string | null;
        cor: string | null;
    }>;
    criarCategoria(dto: CreateCategoriaDto): Promise<{
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        nome: string;
        descricao: string | null;
        codigo: string;
        ativo: boolean;
        ordem: number;
        icone: string | null;
        cor: string | null;
    }>;
    atualizarCategoria(id: number, dto: UpdateCategoriaDto): Promise<{
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        nome: string;
        descricao: string | null;
        codigo: string;
        ativo: boolean;
        ordem: number;
        icone: string | null;
        cor: string | null;
    }>;
    removerCategoria(id: number): Promise<{
        sucesso: boolean;
    }>;
    listarSubcategorias(categoriaId: number, apenasAtivas?: boolean, page?: number, limit?: number): Promise<any[] | PaginatedResult<any>>;
    buscarSubcategoriaPorCodigo(codigo: string): Promise<{
        categoria: {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string | null;
            codigo: string;
            ativo: boolean;
            ordem: number;
            icone: string | null;
            cor: string | null;
        };
        artigos: ({
            subcategoria: {
                id: number;
                criadoEm: Date;
                atualizadoEm: Date;
                nome: string;
                descricao: string | null;
                codigo: string;
                ativo: boolean;
                ordem: number;
                categoriaId: number;
            };
        } & {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            titulo: string;
            codigo: string;
            ativo: boolean;
            ordem: number;
            tags: import("@prisma/client/runtime/library").JsonValue | null;
            resumo: string | null;
            conteudo: string;
            subcategoriaId: number;
            palavrasChave: string | null;
            nivelDificuldade: string | null;
            artigosRelacionados: import("@prisma/client/runtime/library").JsonValue | null;
            destaque: boolean;
        })[];
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        nome: string;
        descricao: string | null;
        codigo: string;
        ativo: boolean;
        ordem: number;
        categoriaId: number;
    }>;
    criarSubcategoria(dto: CreateSubcategoriaDto): Promise<{
        categoria: {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string | null;
            codigo: string;
            ativo: boolean;
            ordem: number;
            icone: string | null;
            cor: string | null;
        };
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        nome: string;
        descricao: string | null;
        codigo: string;
        ativo: boolean;
        ordem: number;
        categoriaId: number;
    }>;
    atualizarSubcategoria(id: number, dto: UpdateSubcategoriaDto): Promise<{
        categoria: {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string | null;
            codigo: string;
            ativo: boolean;
            ordem: number;
            icone: string | null;
            cor: string | null;
        };
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        nome: string;
        descricao: string | null;
        codigo: string;
        ativo: boolean;
        ordem: number;
        categoriaId: number;
    }>;
    removerSubcategoria(id: number): Promise<{
        sucesso: boolean;
    }>;
    listarArtigos(subcategoriaId?: number, apenasAtivos?: boolean, page?: number, limit?: number): Promise<any[] | PaginatedResult<any>>;
    buscarArtigoPorCodigo(codigo: string): Promise<{
        subcategoria: {
            categoria: {
                id: number;
                criadoEm: Date;
                atualizadoEm: Date;
                nome: string;
                descricao: string | null;
                codigo: string;
                ativo: boolean;
                ordem: number;
                icone: string | null;
                cor: string | null;
            };
        } & {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string | null;
            codigo: string;
            ativo: boolean;
            ordem: number;
            categoriaId: number;
        };
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        titulo: string;
        codigo: string;
        ativo: boolean;
        ordem: number;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
        resumo: string | null;
        conteudo: string;
        subcategoriaId: number;
        palavrasChave: string | null;
        nivelDificuldade: string | null;
        artigosRelacionados: import("@prisma/client/runtime/library").JsonValue | null;
        destaque: boolean;
    }>;
    criarArtigo(dto: CreateArtigoDto): Promise<{
        subcategoria: {
            categoria: {
                id: number;
                criadoEm: Date;
                atualizadoEm: Date;
                nome: string;
                descricao: string | null;
                codigo: string;
                ativo: boolean;
                ordem: number;
                icone: string | null;
                cor: string | null;
            };
        } & {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string | null;
            codigo: string;
            ativo: boolean;
            ordem: number;
            categoriaId: number;
        };
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        titulo: string;
        codigo: string;
        ativo: boolean;
        ordem: number;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
        resumo: string | null;
        conteudo: string;
        subcategoriaId: number;
        palavrasChave: string | null;
        nivelDificuldade: string | null;
        artigosRelacionados: import("@prisma/client/runtime/library").JsonValue | null;
        destaque: boolean;
    }>;
    atualizarArtigo(id: number, dto: UpdateArtigoDto): Promise<{
        subcategoria: {
            categoria: {
                id: number;
                criadoEm: Date;
                atualizadoEm: Date;
                nome: string;
                descricao: string | null;
                codigo: string;
                ativo: boolean;
                ordem: number;
                icone: string | null;
                cor: string | null;
            };
        } & {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string | null;
            codigo: string;
            ativo: boolean;
            ordem: number;
            categoriaId: number;
        };
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        titulo: string;
        codigo: string;
        ativo: boolean;
        ordem: number;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
        resumo: string | null;
        conteudo: string;
        subcategoriaId: number;
        palavrasChave: string | null;
        nivelDificuldade: string | null;
        artigosRelacionados: import("@prisma/client/runtime/library").JsonValue | null;
        destaque: boolean;
    }>;
    removerArtigo(id: number): Promise<{
        sucesso: boolean;
    }>;
    buscar(query: string): Promise<({
        subcategoria: {
            categoria: {
                id: number;
                criadoEm: Date;
                atualizadoEm: Date;
                nome: string;
                descricao: string | null;
                codigo: string;
                ativo: boolean;
                ordem: number;
                icone: string | null;
                cor: string | null;
            };
        } & {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string | null;
            codigo: string;
            ativo: boolean;
            ordem: number;
            categoriaId: number;
        };
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        titulo: string;
        codigo: string;
        ativo: boolean;
        ordem: number;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
        resumo: string | null;
        conteudo: string;
        subcategoriaId: number;
        palavrasChave: string | null;
        nivelDificuldade: string | null;
        artigosRelacionados: import("@prisma/client/runtime/library").JsonValue | null;
        destaque: boolean;
    })[]>;
    listarDestaques(): Promise<({
        subcategoria: {
            categoria: {
                id: number;
                criadoEm: Date;
                atualizadoEm: Date;
                nome: string;
                descricao: string | null;
                codigo: string;
                ativo: boolean;
                ordem: number;
                icone: string | null;
                cor: string | null;
            };
        } & {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string | null;
            codigo: string;
            ativo: boolean;
            ordem: number;
            categoriaId: number;
        };
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        titulo: string;
        codigo: string;
        ativo: boolean;
        ordem: number;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
        resumo: string | null;
        conteudo: string;
        subcategoriaId: number;
        palavrasChave: string | null;
        nivelDificuldade: string | null;
        artigosRelacionados: import("@prisma/client/runtime/library").JsonValue | null;
        destaque: boolean;
    })[]>;
}
