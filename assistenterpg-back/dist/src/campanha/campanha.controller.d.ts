import { CampanhaService } from './campanha.service';
import { CreateCampanhaDto } from './dto/create-campanha.dto';
import { AddMembroDto } from './dto/add-membro.dto';
import { CreateConviteDto } from './dto/create-convite.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
export declare class CampanhaController {
    private readonly campanhaService;
    constructor(campanhaService: CampanhaService);
    criar(req: {
        user: {
            id: number;
        };
    }, dto: CreateCampanhaDto): Promise<{
        _count: {
            membros: number;
            personagens: number;
            sessoes: number;
        };
        dono: {
            id: number;
            email: string;
            apelido: string;
        };
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        donoId: number;
        nome: string;
        descricao: string | null;
        status: string;
    }>;
    listarMinhas(req: {
        user: {
            id: number;
        };
    }, paginacao: PaginationQueryDto): Promise<any[] | import("src/common/dto/pagination-query.dto").PaginatedResult<any>>;
    detalhar(id: number, req: {
        user: {
            id: number;
        };
    }): Promise<{
        _count: {
            personagens: number;
            sessoes: number;
        };
        membros: ({
            usuario: {
                id: number;
                apelido: string;
            };
        } & {
            id: number;
            usuarioId: number;
            campanhaId: number;
            papel: string;
            entrouEm: Date;
        })[];
        dono: {
            id: number;
            apelido: string;
        };
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        donoId: number;
        nome: string;
        descricao: string | null;
        status: string;
    }>;
    excluir(id: number, req: {
        user: {
            id: number;
        };
    }): Promise<{
        message: string;
        id: number;
    }>;
    listarMembros(id: number, req: {
        user: {
            id: number;
        };
    }): Promise<({
        usuario: {
            id: number;
            email: string;
            apelido: string;
        };
    } & {
        id: number;
        usuarioId: number;
        campanhaId: number;
        papel: string;
        entrouEm: Date;
    })[]>;
    adicionarMembro(id: number, req: {
        user: {
            id: number;
        };
    }, dto: AddMembroDto): Promise<{
        usuario: {
            id: number;
            email: string;
            apelido: string;
        };
    } & {
        id: number;
        usuarioId: number;
        campanhaId: number;
        papel: string;
        entrouEm: Date;
    }>;
    criarConvite(id: number, req: {
        user: {
            id: number;
        };
    }, dto: CreateConviteDto): Promise<{
        id: number;
        email: string;
        criadoEm: Date;
        status: string;
        codigo: string;
        campanhaId: number;
        respondidoEm: Date | null;
    }>;
    listarConvitesPendentes(req: {
        user: {
            id: number;
        };
    }): Promise<({
        campanha: {
            id: number;
            nome: string;
            dono: {
                apelido: string;
            };
        };
    } & {
        id: number;
        email: string;
        criadoEm: Date;
        status: string;
        codigo: string;
        campanhaId: number;
        respondidoEm: Date | null;
    })[]>;
    aceitarConvite(codigo: string, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: number;
        usuarioId: number;
        campanhaId: number;
        papel: string;
        entrouEm: Date;
    }>;
    recusarConvite(codigo: string, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: number;
        email: string;
        criadoEm: Date;
        status: string;
        codigo: string;
        campanhaId: number;
        respondidoEm: Date | null;
    }>;
}
