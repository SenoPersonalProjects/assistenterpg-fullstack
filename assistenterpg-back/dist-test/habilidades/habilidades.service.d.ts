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
            valor: number;
            tipoGrauCodigo: string;
            habilidadeId: number;
            escalonamentoPorNivel: Prisma.JsonValue | null;
        })[];
    } & {
        origem: string | null;
        id: number;
        nome: string;
        descricao: string | null;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
        requisitos: Prisma.JsonValue | null;
        codigo: string | null;
        tipo: string;
        hereditaria: boolean;
        mecanicasEspeciais: Prisma.JsonValue | null;
    }>;
    findAll(filtros: FilterHabilidadeDto): Promise<{
        dados: ({
            _count: {
                personagensBase: number;
                personagensCampanha: number;
                habilidadesClasse: number;
                habilidadesTrilha: number;
                habilidadesOrigem: number;
            };
            efeitosGrau: ({
                tipoGrau: {
                    nome: string;
                    codigo: string;
                };
            } & {
                id: number;
                valor: number;
                tipoGrauCodigo: string;
                habilidadeId: number;
                escalonamentoPorNivel: Prisma.JsonValue | null;
            })[];
        } & {
            origem: string | null;
            id: number;
            nome: string;
            descricao: string | null;
            fonte: import("@prisma/client").$Enums.TipoFonte;
            suplementoId: number | null;
            requisitos: Prisma.JsonValue | null;
            codigo: string | null;
            tipo: string;
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
        efeitosGrau: ({
            tipoGrau: {
                nome: string;
                descricao: string | null;
                codigo: string;
            };
        } & {
            id: number;
            valor: number;
            tipoGrauCodigo: string;
            habilidadeId: number;
            escalonamentoPorNivel: Prisma.JsonValue | null;
        })[];
    } & {
        origem: string | null;
        id: number;
        nome: string;
        descricao: string | null;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
        requisitos: Prisma.JsonValue | null;
        codigo: string | null;
        tipo: string;
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
            valor: number;
            tipoGrauCodigo: string;
            habilidadeId: number;
            escalonamentoPorNivel: Prisma.JsonValue | null;
        })[];
    } & {
        origem: string | null;
        id: number;
        nome: string;
        descricao: string | null;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
        requisitos: Prisma.JsonValue | null;
        codigo: string | null;
        tipo: string;
        hereditaria: boolean;
        mecanicasEspeciais: Prisma.JsonValue | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
