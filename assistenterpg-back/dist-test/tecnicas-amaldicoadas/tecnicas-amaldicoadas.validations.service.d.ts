import { TipoFonte } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class TecnicasAmaldicoadasValidationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    validarFonteSuplemento(fonte: TipoFonte, suplementoId: number | null): Promise<void>;
}
