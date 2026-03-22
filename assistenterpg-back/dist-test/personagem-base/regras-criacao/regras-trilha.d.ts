import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
type PrismaLike = PrismaService | Prisma.TransactionClient;
export declare function validarRequisitosTrilha(requisitos: {
    pericias?: Array<{
        codigo: string;
        treinada: boolean;
    }>;
} | null, periciasPersonagem: Array<{
    codigo: string;
    grauTreinamento: number;
}>): {
    valido: boolean;
    mensagemErro?: string;
};
export declare function validarTrilhaECaminho(classeId: number, trilhaId: number | null | undefined, caminhoId: number | null | undefined, periciasPersonagem: Array<{
    codigo: string;
    grauTreinamento: number;
}> | undefined, prisma: PrismaLike): Promise<void>;
export {};
