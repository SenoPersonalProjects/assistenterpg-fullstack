import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrilhaDto } from './dto/create-trilha.dto';
import { UpdateTrilhaDto } from './dto/update-trilha.dto';
import { CreateCaminhoDto } from './dto/create-caminho.dto';
import { UpdateCaminhoDto } from './dto/update-caminho.dto';
export declare class TrilhasService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private tratarErroPrisma;
    private normalizarJsonParaPersistir;
    private validarFonteSuplemento;
    private ensureTrilha;
    private ensureCaminho;
    create(createDto: CreateTrilhaDto): Promise<{
        classe: {
            id: number;
            nome: string;
        };
        caminhos: {
            id: number;
            nome: string;
        }[];
        habilidadesTrilha: ({
            caminho: {
                id: number;
                nome: string;
            } | null;
            habilidade: {
                id: number;
                nome: string;
                descricao: string | null;
            };
        } & {
            id: number;
            trilhaId: number;
            caminhoId: number | null;
            habilidadeId: number;
            nivelConcedido: number;
        })[];
    } & {
        id: number;
        nome: string;
        classeId: number;
        descricao: string | null;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
        requisitos: Prisma.JsonValue | null;
    }>;
    findAll(classeId?: number): Promise<({
        classe: {
            id: number;
            nome: string;
        };
        _count: {
            personagensBase: number;
            personagensCampanha: number;
            habilidadesTrilha: number;
        };
        caminhos: {
            id: number;
            nome: string;
        }[];
    } & {
        id: number;
        nome: string;
        classeId: number;
        descricao: string | null;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
        requisitos: Prisma.JsonValue | null;
    })[]>;
    findOne(id: number): Promise<{
        classe: {
            id: number;
            nome: string;
        };
        _count: {
            personagensBase: number;
            personagensCampanha: number;
        };
        caminhos: {
            id: number;
            nome: string;
            descricao: string | null;
        }[];
        habilidadesTrilha: ({
            caminho: {
                id: number;
                nome: string;
            } | null;
            habilidade: {
                id: number;
                nome: string;
                descricao: string | null;
                tipo: string;
            };
        } & {
            id: number;
            trilhaId: number;
            caminhoId: number | null;
            habilidadeId: number;
            nivelConcedido: number;
        })[];
    } & {
        id: number;
        nome: string;
        classeId: number;
        descricao: string | null;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
        requisitos: Prisma.JsonValue | null;
    }>;
    update(id: number, updateDto: UpdateTrilhaDto): Promise<{
        classe: {
            id: number;
            nome: string;
        };
        caminhos: {
            id: number;
            nome: string;
        }[];
        habilidadesTrilha: ({
            caminho: {
                id: number;
                nome: string;
            } | null;
            habilidade: {
                id: number;
                nome: string;
                descricao: string | null;
            };
        } & {
            id: number;
            trilhaId: number;
            caminhoId: number | null;
            habilidadeId: number;
            nivelConcedido: number;
        })[];
    } & {
        id: number;
        nome: string;
        classeId: number;
        descricao: string | null;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
        requisitos: Prisma.JsonValue | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
    createCaminho(createDto: CreateCaminhoDto): Promise<{
        trilha: {
            id: number;
            nome: string;
        };
        habilidadesTrilha: ({
            habilidade: {
                id: number;
                nome: string;
                descricao: string | null;
            };
        } & {
            id: number;
            trilhaId: number;
            caminhoId: number | null;
            habilidadeId: number;
            nivelConcedido: number;
        })[];
    } & {
        id: number;
        nome: string;
        trilhaId: number;
        descricao: string | null;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
    }>;
    updateCaminho(id: number, updateDto: UpdateCaminhoDto): Promise<{
        trilha: {
            id: number;
            nome: string;
        };
        habilidadesTrilha: ({
            habilidade: {
                id: number;
                nome: string;
                descricao: string | null;
            };
        } & {
            id: number;
            trilhaId: number;
            caminhoId: number | null;
            habilidadeId: number;
            nivelConcedido: number;
        })[];
    } & {
        id: number;
        nome: string;
        trilhaId: number;
        descricao: string | null;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
    }>;
    removeCaminho(id: number): Promise<{
        message: string;
    }>;
    findCaminhos(trilhaId: number): Promise<{
        id: number;
        nome: string;
        descricao: string | null;
        trilhaId: number;
    }[]>;
    findHabilidades(trilhaId: number): Promise<{
        id: number;
        nivelConcedido: number;
        habilidadeId: number;
        habilidadeNome: string;
        habilidadeDescricao: string | null;
        caminhoId: number | null;
        caminhoNome: string | null;
    }[]>;
}
