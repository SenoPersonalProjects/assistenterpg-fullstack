import { ClasService } from './clas.service';
import { CreateClaDto } from './dto/create-cla.dto';
import { UpdateClaDto } from './dto/update-cla.dto';
export declare class ClasController {
    private readonly claService;
    constructor(claService: ClasService);
    create(dto: CreateClaDto): Promise<{
        tecnicasHereditarias: ({
            tecnica: {
                id: number;
                nome: string;
                descricao: string;
                codigo: string;
                tipo: import("@prisma/client").$Enums.TipoTecnicaAmaldicoada;
            };
        } & {
            id: number;
            claId: number;
            tecnicaId: number;
        })[];
    } & {
        id: number;
        nome: string;
        descricao: string | null;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
        grandeCla: boolean;
    }>;
    findAll(): Promise<({
        _count: {
            personagensBase: number;
            personagensCampanha: number;
        };
        tecnicasHereditarias: ({
            tecnica: {
                id: number;
                nome: string;
                descricao: string;
                codigo: string;
                tipo: import("@prisma/client").$Enums.TipoTecnicaAmaldicoada;
            };
        } & {
            id: number;
            claId: number;
            tecnicaId: number;
        })[];
    } & {
        id: number;
        nome: string;
        descricao: string | null;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
        grandeCla: boolean;
    })[]>;
    findOne(id: number): Promise<{
        _count: {
            personagensBase: number;
            personagensCampanha: number;
        };
        tecnicasHereditarias: ({
            tecnica: {
                id: number;
                nome: string;
                descricao: string;
                requisitos: import("@prisma/client/runtime/library").JsonValue;
                codigo: string;
                tipo: import("@prisma/client").$Enums.TipoTecnicaAmaldicoada;
            };
        } & {
            id: number;
            claId: number;
            tecnicaId: number;
        })[];
    } & {
        id: number;
        nome: string;
        descricao: string | null;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
        grandeCla: boolean;
    }>;
    update(id: number, dto: UpdateClaDto): Promise<{
        tecnicasHereditarias: ({
            tecnica: {
                id: number;
                nome: string;
                descricao: string;
                codigo: string;
                tipo: import("@prisma/client").$Enums.TipoTecnicaAmaldicoada;
            };
        } & {
            id: number;
            claId: number;
            tecnicaId: number;
        })[];
    } & {
        id: number;
        nome: string;
        descricao: string | null;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
        grandeCla: boolean;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
