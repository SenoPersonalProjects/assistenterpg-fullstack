import { PrismaService } from 'src/prisma/prisma.service';
export declare class AlinhamentosService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        nome: string;
        descricao: string | null;
    }[]>;
}
