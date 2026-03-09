import { PrismaService } from '../prisma/prisma.service';
import { CreateClaDto } from './dto/create-cla.dto';
import { UpdateClaDto } from './dto/update-cla.dto';
export declare class ClasService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private validarFonteSuplemento;
    create(dto: CreateClaDto): Promise<{
        tecnicasHereditarias: ({
            tecnica: {
                id: number;
                nome: string;
                descricao: string;
                tipo: import("@prisma/client").$Enums.TipoTecnicaAmaldicoada;
                codigo: string;
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
        grandeCla: boolean;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
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
                tipo: import("@prisma/client").$Enums.TipoTecnicaAmaldicoada;
                codigo: string;
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
        grandeCla: boolean;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
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
                tipo: import("@prisma/client").$Enums.TipoTecnicaAmaldicoada;
                codigo: string;
                requisitos: import("@prisma/client/runtime/library").JsonValue;
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
        grandeCla: boolean;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
    }>;
    update(id: number, dto: UpdateClaDto): Promise<{
        tecnicasHereditarias: ({
            tecnica: {
                id: number;
                nome: string;
                descricao: string;
                tipo: import("@prisma/client").$Enums.TipoTecnicaAmaldicoada;
                codigo: string;
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
        grandeCla: boolean;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
