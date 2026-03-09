import { OrigensService } from './origens.service';
import { CreateOrigemDto } from './dto/create-origem.dto';
import { UpdateOrigemDto } from './dto/update-origem.dto';
export declare class OrigensController {
    private readonly origensService;
    constructor(origensService: OrigensService);
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
                requisitos: import("@prisma/client/runtime/library").JsonValue | null;
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
        requisitosTexto: string | null;
        requerGrandeCla: boolean;
        requerTecnicaHeriditaria: boolean;
        bloqueiaTecnicaHeriditaria: boolean;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
    } & {
        habilidadesIniciais: import("../habilidades/dto/catalogo-habilidade.dto").HabilidadeCatalogoDto[];
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
                requisitos: import("@prisma/client/runtime/library").JsonValue | null;
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
        requisitosTexto: string | null;
        requerGrandeCla: boolean;
        requerTecnicaHeriditaria: boolean;
        bloqueiaTecnicaHeriditaria: boolean;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
    } & {
        habilidadesIniciais: import("../habilidades/dto/catalogo-habilidade.dto").HabilidadeCatalogoDto[];
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
                requisitos: import("@prisma/client/runtime/library").JsonValue | null;
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
        requisitosTexto: string | null;
        requerGrandeCla: boolean;
        requerTecnicaHeriditaria: boolean;
        bloqueiaTecnicaHeriditaria: boolean;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
    } & {
        habilidadesIniciais: import("../habilidades/dto/catalogo-habilidade.dto").HabilidadeCatalogoDto[];
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
                requisitos: import("@prisma/client/runtime/library").JsonValue | null;
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
        requisitosTexto: string | null;
        requerGrandeCla: boolean;
        requerTecnicaHeriditaria: boolean;
        bloqueiaTecnicaHeriditaria: boolean;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
    } & {
        habilidadesIniciais: import("../habilidades/dto/catalogo-habilidade.dto").HabilidadeCatalogoDto[];
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
