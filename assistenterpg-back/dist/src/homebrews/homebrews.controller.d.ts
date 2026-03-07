import { HomebrewsService } from './homebrews.service';
import { CreateHomebrewDto } from './dto/create-homebrew.dto';
import { UpdateHomebrewDto } from './dto/update-homebrew.dto';
import { FiltrarHomebrewsDto } from './dto/filtrar-homebrews.dto';
export declare class HomebrewsController {
    private readonly homebrewsService;
    constructor(homebrewsService: HomebrewsService);
    meus(req: any, filtros: FiltrarHomebrewsDto): Promise<{
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
    buscarPorCodigo(codigo: string, req: any): Promise<import("./dto/homebrew-detalhado.dto").HomebrewDetalhadoDto>;
    listar(filtros: FiltrarHomebrewsDto, req: any): Promise<{
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
    buscarPorId(id: number, req: any): Promise<import("./dto/homebrew-detalhado.dto").HomebrewDetalhadoDto>;
    criar(createHomebrewDto: CreateHomebrewDto, req: any): Promise<import("./dto/homebrew-detalhado.dto").HomebrewDetalhadoDto>;
    atualizar(id: number, updateHomebrewDto: UpdateHomebrewDto, req: any): Promise<import("./dto/homebrew-detalhado.dto").HomebrewDetalhadoDto>;
    deletar(id: number, req: any): Promise<void>;
    publicar(id: number, req: any): Promise<{
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
    arquivar(id: number, req: any): Promise<{
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
}
