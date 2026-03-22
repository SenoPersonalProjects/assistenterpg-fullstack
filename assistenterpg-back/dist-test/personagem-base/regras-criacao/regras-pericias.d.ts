import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreatePersonagemBaseDto } from '../dto/create-personagem-base.dto';
type PrismaLike = PrismaService | Prisma.TransactionClient;
export declare function montarPericiasPersonagem(dto: CreatePersonagemBaseDto, prisma: PrismaLike): Promise<{
    periciaId: number;
    grauTreinamento: number;
    bonusExtra: number;
}[]>;
export {};
