import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
type PrismaLike = Pick<PrismaService, 'habilidade' | 'proficiencia'>;
type PoderGenericoInstanciaInput = {
    habilidadeId: number;
    config?: unknown;
};
type PericiaState = {
    grauTreinamento: number;
    periciaId: number;
    bonusExtra: number;
};
type GrauLivre = {
    tipoGrauCodigo: string;
    valor: number;
};
export declare function aplicarEfeitosPoderesEmPericias(params: {
    nivel: number;
    poderes: PoderGenericoInstanciaInput[] | undefined;
    periciasMap: Map<string, PericiaState>;
}, prisma: PrismaLike): Promise<void>;
export declare function aplicarEfeitosPoderesEmGraus(params: {
    poderes: PoderGenericoInstanciaInput[] | undefined;
    grausLivres: GrauLivre[];
}, prisma: PrismaLike): Promise<GrauLivre[]>;
export declare function extrairProficienciasDeHabilidades(habilidades: Array<{
    habilidade: {
        mecanicasEspeciais?: Prisma.JsonValue | null;
        nome?: string;
    };
}>, prisma: PrismaLike): Promise<string[]>;
export declare function aplicarEfeitosPoderesEmProficiencias(params: {
    nivel: number;
    poderes: PoderGenericoInstanciaInput[] | undefined;
    profsExistentes: string[];
}, prisma: PrismaLike): Promise<string[]>;
export declare function extrairResistenciasDeHabilidades(habilidades: Array<{
    habilidade: {
        mecanicasEspeciais?: Prisma.JsonValue | null;
        nome?: string;
    };
}>): Map<string, number>;
export {};
