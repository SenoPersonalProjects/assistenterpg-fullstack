import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateHabilidadeDto } from './dto/create-habilidade.dto';
import { UpdateHabilidadeDto } from './dto/update-habilidade.dto';
import { FilterHabilidadeDto } from './dto/filter-habilidade.dto';
export declare class HabilidadesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private toNullableInputJson;
    private validarFonteSuplemento;
    findPoderesGenericos(): Promise<{
        id: number;
        nome: string;
        descricao: string | null;
        requisitos: Prisma.JsonValue | null;
        mecanicasEspeciais?: Prisma.JsonValue | null;
    }[]>;
    create(createDto: CreateHabilidadeDto): Promise<{
        efeitosGrau: ({
            tipoGrau: {
                nome: string;
                codigo: string;
            };
        } & {
            id: number;
            habilidadeId: number;
            valor: number;
            tipoGrauCodigo: string;
            escalonamentoPorNivel: Prisma.JsonValue | null;
        })[];
    } & {
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
    }>;
    findAll(filtros: FilterHabilidadeDto): Promise<{
        dados: ({
            _count: {
                personagensBase: number;
                personagensCampanha: number;
                habilidadesOrigem: number;
                habilidadesClasse: number;
                habilidadesTrilha: number;
            };
            efeitosGrau: ({
                tipoGrau: {
                    nome: string;
                    codigo: string;
                };
            } & {
                id: number;
                habilidadeId: number;
                valor: number;
                tipoGrauCodigo: string;
                escalonamentoPorNivel: Prisma.JsonValue | null;
            })[];
        } & {
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
        })[];
        paginacao: {
            pagina: number;
            limite: number;
            total: number;
            totalPaginas: number;
        };
    }>;
    findOne(id: number): Promise<{
        _count: {
            personagensBase: number;
            personagensCampanha: number;
        };
        habilidadesOrigem: ({
            origem: {
                id: number;
                nome: string;
            };
        } & {
            id: number;
            origemId: number;
            habilidadeId: number;
        })[];
        habilidadesClasse: ({
            classe: {
                id: number;
                nome: string;
            };
        } & {
            id: number;
            classeId: number;
            habilidadeId: number;
            nivelConcedido: number;
        })[];
        habilidadesTrilha: ({
            trilha: {
                id: number;
                nome: string;
            };
            caminho: {
                id: number;
                nome: string;
            } | null;
        } & {
            id: number;
            trilhaId: number;
            caminhoId: number | null;
            habilidadeId: number;
            nivelConcedido: number;
        })[];
        efeitosGrau: ({
            tipoGrau: {
                nome: string;
                descricao: string | null;
                codigo: string;
            };
        } & {
            id: number;
            habilidadeId: number;
            valor: number;
            tipoGrauCodigo: string;
            escalonamentoPorNivel: Prisma.JsonValue | null;
        })[];
    } & {
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
    }>;
    update(id: number, updateDto: UpdateHabilidadeDto): Promise<{
        efeitosGrau: ({
            tipoGrau: {
                nome: string;
                codigo: string;
            };
        } & {
            id: number;
            habilidadeId: number;
            valor: number;
            tipoGrauCodigo: string;
            escalonamentoPorNivel: Prisma.JsonValue | null;
        })[];
    } & {
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
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
