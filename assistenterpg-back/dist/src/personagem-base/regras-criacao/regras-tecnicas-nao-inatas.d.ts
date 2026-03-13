import { Prisma } from '@prisma/client';
export type GrauAtual = {
    tipoGrauCodigo: string;
    valor: number;
};
type RequisitoGrau = {
    tipoGrauCodigo: string;
    valorMinimo: number;
};
export declare function extrairRequisitosGraus(requisitos: Prisma.JsonValue | null | undefined): RequisitoGrau[];
export declare function montarMapaGraus(graus: Array<{
    tipoGrauCodigo: string;
    valor: number;
}>): Map<string, number>;
export declare function atendeRequisitosGraus(requisitos: Prisma.JsonValue | null | undefined, grausMap: Map<string, number>): boolean;
export declare function atendeRequisitoBaseTecnicaNaoInata(tecnicaCodigo: string | null | undefined, grausMap: Map<string, number>): boolean;
export {};
