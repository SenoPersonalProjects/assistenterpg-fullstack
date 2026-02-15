import { CompendioService } from './compendio.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { CreateSubcategoriaDto } from './dto/create-subcategoria.dto';
import { UpdateSubcategoriaDto } from './dto/update-subcategoria.dto';
import { CreateArtigoDto } from './dto/create-artigo.dto';
import { UpdateArtigoDto } from './dto/update-artigo.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
export declare class CompendioController {
    private readonly compendioService;
    constructor(compendioService: CompendioService);
    listarCategorias(todas?: string, paginacao?: PaginationQueryDto): Promise<any[] | import("src/common/dto/pagination-query.dto").PaginatedResult<any>>;
    buscarCategoriaPorCodigo(codigo: string): Promise<{
        subcategorias: ({
            categoria: {
                id: number;
                criadoEm: Date;
                atualizadoEm: Date;
                nome: string;
                descricao: string | null;
                codigo: string;
                ordem: number;
                icone: string | null;
                cor: string | null;
                ativo: boolean;
            };
        } & {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string | null;
            codigo: string;
            ordem: number;
            ativo: boolean;
            categoriaId: number;
        })[];
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        nome: string;
        descricao: string | null;
        codigo: string;
        ordem: number;
        icone: string | null;
        cor: string | null;
        ativo: boolean;
    }>;
    criarCategoria(dto: CreateCategoriaDto): Promise<{
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        nome: string;
        descricao: string | null;
        codigo: string;
        ordem: number;
        icone: string | null;
        cor: string | null;
        ativo: boolean;
    }>;
    atualizarCategoria(id: number, dto: UpdateCategoriaDto): Promise<{
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        nome: string;
        descricao: string | null;
        codigo: string;
        ordem: number;
        icone: string | null;
        cor: string | null;
        ativo: boolean;
    }>;
    removerCategoria(id: number): Promise<{
        sucesso: boolean;
    }>;
    listarSubcategorias(categoriaId: number, todas?: string, paginacao?: PaginationQueryDto): Promise<any[] | import("src/common/dto/pagination-query.dto").PaginatedResult<any>>;
    buscarSubcategoriaPorCodigo(codigo: string): Promise<{
        categoria: {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string | null;
            codigo: string;
            ordem: number;
            icone: string | null;
            cor: string | null;
            ativo: boolean;
        };
        artigos: ({
            subcategoria: {
                id: number;
                criadoEm: Date;
                atualizadoEm: Date;
                nome: string;
                descricao: string | null;
                codigo: string;
                ordem: number;
                ativo: boolean;
                categoriaId: number;
            };
        } & {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            codigo: string;
            ordem: number;
            ativo: boolean;
            titulo: string;
            resumo: string | null;
            conteudo: string;
            subcategoriaId: number;
            tags: import("@prisma/client/runtime/library").JsonValue | null;
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
        ordem: number;
        ativo: boolean;
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
            ordem: number;
            icone: string | null;
            cor: string | null;
            ativo: boolean;
        };
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        nome: string;
        descricao: string | null;
        codigo: string;
        ordem: number;
        ativo: boolean;
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
            ordem: number;
            icone: string | null;
            cor: string | null;
            ativo: boolean;
        };
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        nome: string;
        descricao: string | null;
        codigo: string;
        ordem: number;
        ativo: boolean;
        categoriaId: number;
    }>;
    removerSubcategoria(id: number): Promise<{
        sucesso: boolean;
    }>;
    listarArtigos(subcategoriaId?: string, todas?: string, paginacao?: PaginationQueryDto): Promise<any[] | import("src/common/dto/pagination-query.dto").PaginatedResult<any>>;
    buscarArtigoPorCodigo(codigo: string): Promise<{
        subcategoria: {
            categoria: {
                id: number;
                criadoEm: Date;
                atualizadoEm: Date;
                nome: string;
                descricao: string | null;
                codigo: string;
                ordem: number;
                icone: string | null;
                cor: string | null;
                ativo: boolean;
            };
        } & {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string | null;
            codigo: string;
            ordem: number;
            ativo: boolean;
            categoriaId: number;
        };
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        codigo: string;
        ordem: number;
        ativo: boolean;
        titulo: string;
        resumo: string | null;
        conteudo: string;
        subcategoriaId: number;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
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
                ordem: number;
                icone: string | null;
                cor: string | null;
                ativo: boolean;
            };
        } & {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string | null;
            codigo: string;
            ordem: number;
            ativo: boolean;
            categoriaId: number;
        };
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        codigo: string;
        ordem: number;
        ativo: boolean;
        titulo: string;
        resumo: string | null;
        conteudo: string;
        subcategoriaId: number;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
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
                ordem: number;
                icone: string | null;
                cor: string | null;
                ativo: boolean;
            };
        } & {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string | null;
            codigo: string;
            ordem: number;
            ativo: boolean;
            categoriaId: number;
        };
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        codigo: string;
        ordem: number;
        ativo: boolean;
        titulo: string;
        resumo: string | null;
        conteudo: string;
        subcategoriaId: number;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
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
                ordem: number;
                icone: string | null;
                cor: string | null;
                ativo: boolean;
            };
        } & {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string | null;
            codigo: string;
            ordem: number;
            ativo: boolean;
            categoriaId: number;
        };
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        codigo: string;
        ordem: number;
        ativo: boolean;
        titulo: string;
        resumo: string | null;
        conteudo: string;
        subcategoriaId: number;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
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
                ordem: number;
                icone: string | null;
                cor: string | null;
                ativo: boolean;
            };
        } & {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string | null;
            codigo: string;
            ordem: number;
            ativo: boolean;
            categoriaId: number;
        };
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        codigo: string;
        ordem: number;
        ativo: boolean;
        titulo: string;
        resumo: string | null;
        conteudo: string;
        subcategoriaId: number;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
        palavrasChave: string | null;
        nivelDificuldade: string | null;
        artigosRelacionados: import("@prisma/client/runtime/library").JsonValue | null;
        destaque: boolean;
    })[]>;
}
