import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrigemDto } from './dto/create-origem.dto';
import { UpdateOrigemDto } from './dto/update-origem.dto';
import { HabilidadeCatalogoDto } from '../habilidades/dto/catalogo-habilidade.dto';
export declare class OrigensService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private tratarErroPrisma;
    private validarFonteSuplemento;
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
                id: number;
                nome: string;
                descricao: string | null;
                tipo: string;
                origem: string | null;
                fonte: import("@prisma/client").$Enums.TipoFonte;
                suplementoId: number | null;
                requisitos: Prisma.JsonValue | null;
                hereditaria: boolean;
                mecanicasEspeciais: Prisma.JsonValue | null;
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
        requisitosTexto: string | null;
        requerGrandeCla: boolean;
        requerTecnicaHeriditaria: boolean;
        bloqueiaTecnicaHeriditaria: boolean;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
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
                id: number;
                nome: string;
                descricao: string | null;
                tipo: string;
                origem: string | null;
                fonte: import("@prisma/client").$Enums.TipoFonte;
                suplementoId: number | null;
                requisitos: Prisma.JsonValue | null;
                hereditaria: boolean;
                mecanicasEspeciais: Prisma.JsonValue | null;
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
        requisitosTexto: string | null;
        requerGrandeCla: boolean;
        requerTecnicaHeriditaria: boolean;
        bloqueiaTecnicaHeriditaria: boolean;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
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
                id: number;
                nome: string;
                descricao: string | null;
                tipo: string;
                origem: string | null;
                fonte: import("@prisma/client").$Enums.TipoFonte;
                suplementoId: number | null;
                requisitos: Prisma.JsonValue | null;
                hereditaria: boolean;
                mecanicasEspeciais: Prisma.JsonValue | null;
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
        requisitosTexto: string | null;
        requerGrandeCla: boolean;
        requerTecnicaHeriditaria: boolean;
        bloqueiaTecnicaHeriditaria: boolean;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
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
                id: number;
                nome: string;
                descricao: string | null;
                tipo: string;
                origem: string | null;
                fonte: import("@prisma/client").$Enums.TipoFonte;
                suplementoId: number | null;
                requisitos: Prisma.JsonValue | null;
                hereditaria: boolean;
                mecanicasEspeciais: Prisma.JsonValue | null;
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
        requisitosTexto: string | null;
        requerGrandeCla: boolean;
        requerTecnicaHeriditaria: boolean;
        bloqueiaTecnicaHeriditaria: boolean;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
    } & {
        habilidadesIniciais: HabilidadeCatalogoDto[];
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
