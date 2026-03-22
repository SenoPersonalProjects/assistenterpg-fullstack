import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { GrauTreinamentoDto } from '../dto/create-personagem-base.dto';
type PrismaLike = PrismaService | Prisma.TransactionClient;
export declare function validarGrausTreinamento(nivel: number, intelecto: number, grausTreinamento: GrauTreinamentoDto[] | undefined, periciasMap: Map<string, {
    grauTreinamento: number;
}>, prisma: PrismaLike): Promise<void>;
export declare function aplicarGrausTreinamento(grausTreinamento: GrauTreinamentoDto[] | undefined, periciasMap: Map<string, {
    periciaId: number;
    grauTreinamento: number;
    bonusExtra: number;
}>): void;
export {};
