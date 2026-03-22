import { PrismaService } from '../prisma/prisma.service';
export declare class TecnicasAmaldicoadasClasService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    vincularClas(tecnicaId: number, claNomes: string[]): Promise<void>;
}
