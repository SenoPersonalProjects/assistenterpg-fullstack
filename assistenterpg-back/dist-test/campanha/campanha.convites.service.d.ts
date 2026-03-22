import { PrismaService } from '../prisma/prisma.service';
import { PapelCampanha } from './engine/campanha.engine.types';
export declare class CampanhaConvitesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    criarConvitePorEmail(campanhaId: number, donoId: number, email: string, papel: PapelCampanha): Promise<{
        id: number;
        email: string;
        criadoEm: Date;
        status: string;
        codigo: string;
        campanhaId: number;
        papel: string;
        respondidoEm: Date | null;
    }>;
    listarConvitesPendentesPorUsuario(usuarioId: number): Promise<({
        campanha: {
            id: number;
            nome: string;
            dono: {
                apelido: string;
            };
        };
    } & {
        id: number;
        email: string;
        criadoEm: Date;
        status: string;
        codigo: string;
        campanhaId: number;
        papel: string;
        respondidoEm: Date | null;
    })[]>;
    aceitarConvite(codigo: string, usuarioId: number): Promise<{
        id: number;
        usuarioId: number;
        campanhaId: number;
        papel: string;
        entrouEm: Date;
    }>;
    recusarConvite(codigo: string, usuarioId: number): Promise<{
        id: number;
        email: string;
        criadoEm: Date;
        status: string;
        codigo: string;
        campanhaId: number;
        papel: string;
        respondidoEm: Date | null;
    }>;
}
