import { PrismaService } from '../../prisma/prisma.service';
import { AtributoBaseEA, Prisma } from '@prisma/client';
type PrismaLike = PrismaService | Prisma.TransactionClient;
export interface CalcularDerivadosParams {
    nivel: number;
    classeId: number;
    agilidade: number;
    forca: number;
    intelecto: number;
    presenca: number;
    vigor: number;
    atributoChaveEa: AtributoBaseEA;
    passivasAtributoIds?: number[];
}
export interface AtributosDerivados {
    pvMaximo: number;
    peMaximo: number;
    eaMaximo: number;
    sanMaximo: number;
    defesa: number;
    deslocamento: number;
    limitePeEaPorTurno: number;
    reacoesBasePorTurno: number;
    turnosMorrendo: number;
    turnosEnlouquecendo: number;
    bloqueio: number;
    esquiva: number;
}
export declare function calcularAtributosDerivados(params: CalcularDerivadosParams, prisma: PrismaLike): Promise<AtributosDerivados>;
export declare function calcularBloqueioEsquiva(params: {
    defesa: number;
    periciasMap: Map<string, {
        grauTreinamento: number;
        bonusExtra: number;
    }>;
}): {
    bloqueio: number;
    esquiva: number;
};
export {};
