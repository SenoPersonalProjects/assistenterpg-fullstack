import { PrismaService } from '../prisma/prisma.service';
import { CreateHomebrewDto } from './dto/create-homebrew.dto';
import { UpdateHomebrewDto } from './dto/update-homebrew.dto';
import { FiltrarHomebrewsDto } from './dto/filtrar-homebrews.dto';
import { HomebrewDetalhadoDto } from './dto/homebrew-detalhado.dto';
export declare class HomebrewsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    listar(filtros: FiltrarHomebrewsDto, usuarioId?: number, isAdmin?: boolean): Promise<{
        dados: {
            usuario: {
                id: number;
                apelido: string;
            };
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            usuarioId: number;
            nome: string;
            descricao: string | null;
            status: import("@prisma/client").$Enums.StatusPublicacao;
            codigo: string;
            tipo: import("@prisma/client").$Enums.TipoHomebrewConteudo;
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
        usuarioId: number;
        nome: string;
        descricao: string | null;
        status: import("@prisma/client").$Enums.StatusPublicacao;
        codigo: string;
        tipo: import("@prisma/client").$Enums.TipoHomebrewConteudo;
        versao: string;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
        dados: import("@prisma/client/runtime/library").JsonValue;
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
        usuarioId: number;
        nome: string;
        descricao: string | null;
        status: import("@prisma/client").$Enums.StatusPublicacao;
        codigo: string;
        tipo: import("@prisma/client").$Enums.TipoHomebrewConteudo;
        versao: string;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
        dados: import("@prisma/client/runtime/library").JsonValue;
    }>;
    meus(usuarioId: number, filtros: FiltrarHomebrewsDto): Promise<{
        dados: {
            usuario: {
                id: number;
                apelido: string;
            };
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            usuarioId: number;
            nome: string;
            descricao: string | null;
            status: import("@prisma/client").$Enums.StatusPublicacao;
            codigo: string;
            tipo: import("@prisma/client").$Enums.TipoHomebrewConteudo;
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
    private gerarCodigo;
    private validarDadosCustomizados;
    private verificarPermissaoLeitura;
    private incrementarVersao;
    private mapDetalhado;
}
