import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHomebrewDto } from './dto/create-homebrew.dto';
import { UpdateHomebrewDto } from './dto/update-homebrew.dto';
import { FiltrarHomebrewsDto } from './dto/filtrar-homebrews.dto';
import { HomebrewDetalhadoDto } from './dto/homebrew-detalhado.dto';
export declare class HomebrewsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private tratarErroPrisma;
    private extrairMensagensValidacao;
    private normalizarJsonParaPersistir;
    private mapearTags;
    listar(filtros: FiltrarHomebrewsDto, usuarioId?: number, isAdmin?: boolean): Promise<{
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
            tags: Prisma.JsonValue;
        }[];
        paginacao: {
            pagina: number;
            limite: number;
            total: number;
            totalPaginas: number;
        };
    }>;
    buscarPorId(id: number, usuarioId?: number, isAdmin?: boolean): Promise<HomebrewDetalhadoDto>;
    buscarPorCodigo(codigo: string, usuarioId?: number, isAdmin?: boolean): Promise<HomebrewDetalhadoDto>;
    criar(createHomebrewDto: CreateHomebrewDto, usuarioId: number): Promise<HomebrewDetalhadoDto>;
    atualizar(id: number, updateHomebrewDto: UpdateHomebrewDto, usuarioId: number, isAdmin?: boolean): Promise<HomebrewDetalhadoDto>;
    deletar(id: number, usuarioId: number, isAdmin?: boolean): Promise<void>;
    publicar(id: number, usuarioId: number, isAdmin?: boolean): Promise<{
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
        dados: Prisma.JsonValue;
        tipo: import("@prisma/client").$Enums.TipoHomebrewConteudo;
        codigo: string;
        versao: string;
        tags: Prisma.JsonValue | null;
    }>;
    arquivar(id: number, usuarioId: number, isAdmin?: boolean): Promise<{
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
        dados: Prisma.JsonValue;
        tipo: import("@prisma/client").$Enums.TipoHomebrewConteudo;
        codigo: string;
        versao: string;
        tags: Prisma.JsonValue | null;
    }>;
    meus(usuarioId: number, filtros: FiltrarHomebrewsDto): Promise<{
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
            tags: Prisma.JsonValue;
        }[];
        paginacao: {
            pagina: number;
            limite: number;
            total: number;
            totalPaginas: number;
        };
    }>;
    private gerarCodigo;
    private validarDadosCustomizados;
    private verificarPermissaoLeitura;
    private incrementarVersao;
    private mapDetalhado;
}
