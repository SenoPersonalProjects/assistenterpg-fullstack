import { Request as ExpressRequest } from 'express';
import { RoleUsuario } from '@prisma/client';
import { HomebrewsService } from './homebrews.service';
import { CreateHomebrewDto } from './dto/create-homebrew.dto';
import { UpdateHomebrewDto } from './dto/update-homebrew.dto';
import { FiltrarHomebrewsDto } from './dto/filtrar-homebrews.dto';
type UsuarioAutenticado = {
    id: number;
    role: RoleUsuario;
};
type AuthenticatedRequest = ExpressRequest & {
    user: UsuarioAutenticado;
};
export declare class HomebrewsController {
    private readonly homebrewsService;
    constructor(homebrewsService: HomebrewsService);
    private getUserContext;
    meus(req: AuthenticatedRequest, filtros: FiltrarHomebrewsDto): Promise<{
        dados: {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string | null;
            status: import("@prisma/client").$Enums.StatusPublicacao;
            usuarioId: number;
            tipo: import("@prisma/client").$Enums.TipoHomebrewConteudo;
            codigo: string;
            usuario: {
                id: number;
                apelido: string;
            };
            versao: string;
            tags: import("@prisma/client/runtime/library").JsonValue;
        }[];
        paginacao: {
            pagina: number;
            limite: number;
            total: number;
            totalPaginas: number;
        };
    }>;
    buscarPorCodigo(codigo: string, req: AuthenticatedRequest): Promise<import("./dto/homebrew-detalhado.dto").HomebrewDetalhadoDto>;
    listar(filtros: FiltrarHomebrewsDto, req: AuthenticatedRequest): Promise<{
        dados: {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string | null;
            status: import("@prisma/client").$Enums.StatusPublicacao;
            usuarioId: number;
            tipo: import("@prisma/client").$Enums.TipoHomebrewConteudo;
            codigo: string;
            usuario: {
                id: number;
                apelido: string;
            };
            versao: string;
            tags: import("@prisma/client/runtime/library").JsonValue;
        }[];
        paginacao: {
            pagina: number;
            limite: number;
            total: number;
            totalPaginas: number;
        };
    }>;
    buscarPorId(id: number, req: AuthenticatedRequest): Promise<import("./dto/homebrew-detalhado.dto").HomebrewDetalhadoDto>;
    criar(createHomebrewDto: CreateHomebrewDto, req: AuthenticatedRequest): Promise<import("./dto/homebrew-detalhado.dto").HomebrewDetalhadoDto>;
    atualizar(id: number, updateHomebrewDto: UpdateHomebrewDto, req: AuthenticatedRequest): Promise<import("./dto/homebrew-detalhado.dto").HomebrewDetalhadoDto>;
    deletar(id: number, req: AuthenticatedRequest): Promise<void>;
    publicar(id: number, req: AuthenticatedRequest): Promise<{
        usuario: {
            id: number;
            apelido: string;
        };
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        nome: string;
        descricao: string | null;
        status: import("@prisma/client").$Enums.StatusPublicacao;
        usuarioId: number;
        dados: import("@prisma/client/runtime/library").JsonValue;
        tipo: import("@prisma/client").$Enums.TipoHomebrewConteudo;
        codigo: string;
        versao: string;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    arquivar(id: number, req: AuthenticatedRequest): Promise<{
        usuario: {
            id: number;
            apelido: string;
        };
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        nome: string;
        descricao: string | null;
        status: import("@prisma/client").$Enums.StatusPublicacao;
        usuarioId: number;
        dados: import("@prisma/client/runtime/library").JsonValue;
        tipo: import("@prisma/client").$Enums.TipoHomebrewConteudo;
        codigo: string;
        versao: string;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
export {};
