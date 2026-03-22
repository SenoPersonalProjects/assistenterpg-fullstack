import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
type PrismaLike = PrismaService | Prisma.TransactionClient;
export declare class CampanhaPersistence {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listarPersonagensCampanha(campanhaId: number, prisma?: PrismaLike): Promise<{
        personagemBase: {
            id: number;
            nome: string;
        };
        id: number;
        donoId: number;
        nome: string;
        nivel: number;
        defesaBase: number;
        defesaEquipamento: number;
        defesaOutros: number;
        deslocamento: number;
        limitePeEaPorTurno: number;
        turnosMorrendo: number;
        turnosEnlouquecendo: number;
        bloqueio: number;
        esquiva: number;
        dono: {
            id: number;
            apelido: string;
        };
        campanhaId: number;
        pvAtual: number;
        peAtual: number;
        eaAtual: number;
        sanAtual: number;
        pvMax: number;
        peMax: number;
        eaMax: number;
        sanMax: number;
        prestigioGeral: number;
        prestigioCla: number | null;
        personagemBaseId: number;
        modificadores: {
            id: number;
            criadoEm: Date;
            nome: string;
            descricao: string | null;
            campo: import("@prisma/client").$Enums.CampoModificadorPersonagemCampanha;
            valor: number;
            criadoPorId: number;
        }[];
    }[]>;
    buscarPersonagemCampanhaDetalhe(personagemCampanhaId: number, prisma?: PrismaLike): Promise<{
        personagemBase: {
            id: number;
            nome: string;
        };
        id: number;
        donoId: number;
        nome: string;
        nivel: number;
        defesaBase: number;
        defesaEquipamento: number;
        defesaOutros: number;
        deslocamento: number;
        limitePeEaPorTurno: number;
        turnosMorrendo: number;
        turnosEnlouquecendo: number;
        bloqueio: number;
        esquiva: number;
        dono: {
            id: number;
            apelido: string;
        };
        campanhaId: number;
        pvAtual: number;
        peAtual: number;
        eaAtual: number;
        sanAtual: number;
        pvMax: number;
        peMax: number;
        eaMax: number;
        sanMax: number;
        prestigioGeral: number;
        prestigioCla: number | null;
        personagemBaseId: number;
        modificadores: {
            id: number;
            criadoEm: Date;
            nome: string;
            descricao: string | null;
            campo: import("@prisma/client").$Enums.CampoModificadorPersonagemCampanha;
            valor: number;
            criadoPorId: number;
        }[];
    } | null>;
}
export {};
