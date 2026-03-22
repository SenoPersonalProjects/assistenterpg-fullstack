import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
type PrismaLike = PrismaService | Prisma.TransactionClient;
export declare function validarOrigemClaTecnica(claId: number, origemId: number, tecnicaInataId: number | null | undefined, prisma: PrismaLike): Promise<void>;
export {};
