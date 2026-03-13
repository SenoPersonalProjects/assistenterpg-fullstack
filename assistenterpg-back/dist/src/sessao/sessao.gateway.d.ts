import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { SessaoService } from './sessao.service';
type SocketAutenticado = Socket & {
    data: {
        usuarioId?: number;
    };
};
type EventoSessaoAtualizada = {
    campanhaId: number;
    sessaoId: number;
    tipo: 'CHAT_NOVA' | 'CENA_ATUALIZADA' | 'TURNO_AVANCADO' | 'TURNO_RECUADO' | 'TURNO_PULADO' | 'ORDEM_INICIATIVA_ATUALIZADA' | 'NPC_ATUALIZADO' | 'SESSAO_ENCERRADA' | 'SESSAO_EVENTO_DESFEITO' | 'HABILIDADE_USADA' | 'HABILIDADE_SUSTENTADA_ENCERRADA' | 'CONDICAO_APLICADA' | 'CONDICAO_REMOVIDA';
    em: string;
};
export declare class SessaoGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly sessaoService;
    private readonly jwtService;
    private readonly logger;
    private readonly salasPorSocket;
    private readonly usuariosPorSala;
    private readonly metaPorSala;
    server: Server;
    constructor(sessaoService: SessaoService, jwtService: JwtService);
    handleConnection(client: SocketAutenticado): void;
    handleDisconnect(client: SocketAutenticado): void;
    handleJoinSala(client: SocketAutenticado, body: {
        campanhaId?: number;
        sessaoId?: number;
    }): Promise<{
        ok: boolean;
    }>;
    emitirSessaoAtualizada(campanhaId: number, sessaoId: number, tipo: EventoSessaoAtualizada['tipo']): void;
    private chaveSala;
    private registrarPresenca;
    private removerPresencaSocket;
    private emitirPresencaPorChave;
    private extrairToken;
}
export {};
