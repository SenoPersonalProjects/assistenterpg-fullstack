import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
type PrismaLike = PrismaService | Prisma.TransactionClient;
export type PoderGenericoInstanciaInput = {
    habilidadeId: number;
    config?: any;
};
export declare function calcularSlotsPoderesGenericos(nivel: number): number;
export declare function buscarPoderesGenericosDisponiveis(prisma: PrismaLike): Promise<Array<{
    id: number;
    nome: string;
    descricao: string | null;
    requisitos: Prisma.JsonValue | null;
    mecanicasEspeciais?: Prisma.JsonValue | null;
}>>;
export declare function validarPoderesGenericos(params: {
    nivel: number;
    poderes: PoderGenericoInstanciaInput[];
    pericias: Array<{
        codigo: string;
        grauTreinamento: number;
    }>;
    atributos: {
        agilidade: number;
        forca: number;
        intelecto: number;
        presenca: number;
        vigor: number;
    };
    graus: Array<{
        tipoGrauCodigo: string;
        valor: number;
    }>;
}, prisma: PrismaLike): Promise<void>;
export {};
