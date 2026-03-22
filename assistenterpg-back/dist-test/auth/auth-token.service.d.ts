import { TipoTokenAuth } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class AuthTokenService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    gerarToken(usuarioId: number, tipo: TipoTokenAuth, tempoDeVidaMinutos: number): Promise<{
        token: string;
        expiraEm: Date;
    }>;
    consumirToken(token: string, tipo: TipoTokenAuth): Promise<{
        id: number;
        usuarioId: number;
        expiraEm: Date;
    }>;
    invalidarTokensAtivos(usuarioId: number, tipo: TipoTokenAuth): Promise<void>;
    private hashToken;
}
