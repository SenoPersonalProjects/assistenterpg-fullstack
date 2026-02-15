import { PrismaService } from '../prisma/prisma.service';
import { CreateOrigemDto } from './dto/create-origem.dto';
import { UpdateOrigemDto } from './dto/update-origem.dto';
import { HabilidadeCatalogoDto } from '../habilidades/dto/catalogo-habilidade.dto';
export declare class OrigensService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private addHabilidadesIniciais;
    create(dto: CreateOrigemDto): Promise<{
        pericias: ({
            pericia: {
                id: number;
                nome: string;
                descricao: string;
                codigo: string;
                atributoBase: import("@prisma/client").$Enums.AtributoBase;
                somenteTreinada: boolean;
                penalizaPorCarga: boolean;
                precisaKit: boolean;
            };
        } & {
            id: number;
            origemId: number;
            tipo: string;
            periciaId: number;
            grupoEscolha: number | null;
        })[];
        habilidadesOrigem: ({
            habilidade: {
                origem: string | null;
                id: number;
                nome: string;
                descricao: string | null;
                fonte: import("@prisma/client").$Enums.TipoFonte;
                suplementoId: number | null;
                requisitos: import("@prisma/client/runtime/library").JsonValue | null;
                tipo: string;
                hereditaria: boolean;
                mecanicasEspeciais: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: number;
            origemId: number;
            habilidadeId: number;
        })[];
    } & {
        id: number;
        nome: string;
        descricao: string | null;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
        requisitosTexto: string | null;
        requerGrandeCla: boolean;
        requerTecnicaHeriditaria: boolean;
        bloqueiaTecnicaHeriditaria: boolean;
    } & {
        habilidadesIniciais: HabilidadeCatalogoDto[];
    }>;
    findAll(): Promise<({
        _count: {
            personagensBase: number;
            personagensCampanha: number;
        };
        pericias: ({
            pericia: {
                id: number;
                nome: string;
                descricao: string;
                codigo: string;
                atributoBase: import("@prisma/client").$Enums.AtributoBase;
                somenteTreinada: boolean;
                penalizaPorCarga: boolean;
                precisaKit: boolean;
            };
        } & {
            id: number;
            origemId: number;
            tipo: string;
            periciaId: number;
            grupoEscolha: number | null;
        })[];
        habilidadesOrigem: ({
            habilidade: {
                origem: string | null;
                id: number;
                nome: string;
                descricao: string | null;
                fonte: import("@prisma/client").$Enums.TipoFonte;
                suplementoId: number | null;
                requisitos: import("@prisma/client/runtime/library").JsonValue | null;
                tipo: string;
                hereditaria: boolean;
                mecanicasEspeciais: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: number;
            origemId: number;
            habilidadeId: number;
        })[];
    } & {
        id: number;
        nome: string;
        descricao: string | null;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
        requisitosTexto: string | null;
        requerGrandeCla: boolean;
        requerTecnicaHeriditaria: boolean;
        bloqueiaTecnicaHeriditaria: boolean;
    } & {
        habilidadesIniciais: HabilidadeCatalogoDto[];
    })[]>;
    findOne(id: number): Promise<{
        _count: {
            personagensBase: number;
            personagensCampanha: number;
        };
        pericias: ({
            pericia: {
                id: number;
                nome: string;
                descricao: string;
                codigo: string;
                atributoBase: import("@prisma/client").$Enums.AtributoBase;
                somenteTreinada: boolean;
                penalizaPorCarga: boolean;
                precisaKit: boolean;
            };
        } & {
            id: number;
            origemId: number;
            tipo: string;
            periciaId: number;
            grupoEscolha: number | null;
        })[];
        habilidadesOrigem: ({
            habilidade: {
                origem: string | null;
                id: number;
                nome: string;
                descricao: string | null;
                fonte: import("@prisma/client").$Enums.TipoFonte;
                suplementoId: number | null;
                requisitos: import("@prisma/client/runtime/library").JsonValue | null;
                tipo: string;
                hereditaria: boolean;
                mecanicasEspeciais: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: number;
            origemId: number;
            habilidadeId: number;
        })[];
    } & {
        id: number;
        nome: string;
        descricao: string | null;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
        requisitosTexto: string | null;
        requerGrandeCla: boolean;
        requerTecnicaHeriditaria: boolean;
        bloqueiaTecnicaHeriditaria: boolean;
    } & {
        habilidadesIniciais: HabilidadeCatalogoDto[];
    }>;
    update(id: number, dto: UpdateOrigemDto): Promise<{
        pericias: ({
            pericia: {
                id: number;
                nome: string;
                descricao: string;
                codigo: string;
                atributoBase: import("@prisma/client").$Enums.AtributoBase;
                somenteTreinada: boolean;
                penalizaPorCarga: boolean;
                precisaKit: boolean;
            };
        } & {
            id: number;
            origemId: number;
            tipo: string;
            periciaId: number;
            grupoEscolha: number | null;
        })[];
        habilidadesOrigem: ({
            habilidade: {
                origem: string | null;
                id: number;
                nome: string;
                descricao: string | null;
                fonte: import("@prisma/client").$Enums.TipoFonte;
                suplementoId: number | null;
                requisitos: import("@prisma/client/runtime/library").JsonValue | null;
                tipo: string;
                hereditaria: boolean;
                mecanicasEspeciais: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: number;
            origemId: number;
            habilidadeId: number;
        })[];
    } & {
        id: number;
        nome: string;
        descricao: string | null;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
        requisitosTexto: string | null;
        requerGrandeCla: boolean;
        requerTecnicaHeriditaria: boolean;
        bloqueiaTecnicaHeriditaria: boolean;
    } & {
        habilidadesIniciais: HabilidadeCatalogoDto[];
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
