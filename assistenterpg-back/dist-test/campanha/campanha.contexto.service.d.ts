import { PrismaService } from '../prisma/prisma.service';
export declare class CampanhaContextoService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    validarContextoSessaoCena(campanhaId: number, sessaoId?: number, cenaId?: number): Promise<{
        sessaoId: number | null;
        cenaId: number | null;
    }>;
}
