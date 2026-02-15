import { PaginatedResult } from 'src/common/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class CampanhaService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    criarCampanha(donoId: number, dto: {
        nome: string;
        descricao?: string;
    }): Promise<{
        _count: {
            membros: number;
            personagens: number;
            sessoes: number;
        };
        dono: {
            id: number;
            email: string;
            apelido: string;
        };
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        donoId: number;
        nome: string;
        descricao: string | null;
        status: string;
    }>;
    listarMinhasCampanhas(usuarioId: number, page?: number, limit?: number): Promise<any[] | PaginatedResult<any>>;
    buscarPorIdParaUsuario(id: number, usuarioId: number): Promise<{
        _count: {
            personagens: number;
            sessoes: number;
        };
        membros: ({
            usuario: {
                id: number;
                apelido: string;
            };
        } & {
            id: number;
            usuarioId: number;
            campanhaId: number;
            papel: string;
            entrouEm: Date;
        })[];
        dono: {
            id: number;
            apelido: string;
        };
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        donoId: number;
        nome: string;
        descricao: string | null;
        status: string;
    }>;
    excluirCampanha(campanhaId: number, usuarioId: number): Promise<{
        message: string;
        id: number;
    }>;
    listarMembros(campanhaId: number, usuarioId: number): Promise<({
        usuario: {
            id: number;
            email: string;
            apelido: string;
        };
    } & {
        id: number;
        usuarioId: number;
        campanhaId: number;
        papel: string;
        entrouEm: Date;
    })[]>;
    adicionarMembro(campanhaId: number, solicitanteId: number, dados: {
        usuarioId: number;
        papel: 'MESTRE' | 'JOGADOR' | 'OBSERVADOR';
    }): Promise<{
        usuario: {
            id: number;
            email: string;
            apelido: string;
        };
    } & {
        id: number;
        usuarioId: number;
        campanhaId: number;
        papel: string;
        entrouEm: Date;
    }>;
    private garantirAcesso;
    private gerarCodigoConvite;
    criarConvitePorEmail(campanhaId: number, donoId: number, email: string, papel: 'MESTRE' | 'JOGADOR' | 'OBSERVADOR'): Promise<{
        id: number;
        email: string;
        criadoEm: Date;
        status: string;
        codigo: string;
        campanhaId: number;
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
        respondidoEm: Date | null;
    }>;
}
