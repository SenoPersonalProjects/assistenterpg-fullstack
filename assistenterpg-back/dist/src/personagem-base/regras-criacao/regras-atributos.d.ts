import { AtributoBase, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare function calcularTotalAtributosEsperado(nivel: number): number;
export declare function validarAtributos(params: {
    nivel: number;
    agilidade: number;
    forca: number;
    intelecto: number;
    presenca: number;
    vigor: number;
}): void;
export type AtributosValores = {
    agilidade: number;
    forca: number;
    intelecto: number;
    presenca: number;
    vigor: number;
};
type PrismaLike = PrismaService | Prisma.TransactionClient;
export declare function listarAtributosElegiveisPassivas(atributos: AtributosValores): AtributoBase[];
export type PassivaIntelectoConfig = {
    periciasCodigos?: string[];
    proficienciasCodigos?: string[];
    periciaCodigoTreino?: string;
    tipoGrauCodigoAprimoramento?: string;
};
export type PassivasAtributoConfig = {
    INT_I?: PassivaIntelectoConfig;
    INT_II?: PassivaIntelectoConfig;
};
export type ResolverPassivasResult = {
    elegiveis: AtributoBase[];
    ativos: AtributoBase[];
    passivaIds: number[];
    passivaCodigos: string[];
    needsChoice: boolean;
};
type ResolverPassivasParams = {
    atributos: AtributosValores;
    prisma: PrismaLike;
    passivasAtributosAtivos?: unknown;
    strict?: boolean;
};
export declare function resolverPassivasAtributos(params: ResolverPassivasParams): Promise<ResolverPassivasResult>;
interface ValidarPassivasParams {
    passivasIds: number[];
    atributos: AtributosValores;
    prisma: PrismaLike;
}
export declare function validarPassivasAtributos({ passivasIds, atributos, prisma, }: ValidarPassivasParams): Promise<void>;
export declare function calcularEfeitosPassivas(passivas: Array<{
    efeitos: Prisma.JsonValue | null;
}>): {
    deslocamentoExtra: number;
    reacoesExtra: number;
    peExtra: number;
    eaExtra: number;
    limitePeEaExtra: number;
    pvExtraLimitePeEa: boolean;
    rodadasMorrendoExtra: number;
    rodadasEnlouquecendoExtra: number;
    passosDanoCorpoACorpo: number;
    dadosDanoCorpoACorpo: number;
    periciasExtras: number;
    proficienciasExtras: number;
    grauTreinamentoExtra: number;
    grauAprimoramentoExtra: number;
};
export declare function aplicarEfeitosPassivasIntelectoEmPericiasEProficiencias(params: {
    passivasAtivasCodigos: string[];
    passivasConfig: PassivasAtributoConfig | null | undefined;
    periciasMap: Map<string, {
        grauTreinamento: number;
        periciaId: number;
        bonusExtra: number;
    }>;
    profsExtrasPayload: string[];
}): {
    profsExtrasFinal: string[];
    periciasLivresExtras: number;
};
export declare function aplicarIntelectoEmGraus(params: {
    passivasAtivasCodigos: string[];
    passivasConfig: PassivasAtributoConfig | null | undefined;
    graus: {
        tipoGrauCodigo: string;
        valor: number;
    }[];
}): {
    tipoGrauCodigo: string;
    valor: number;
}[];
export {};
