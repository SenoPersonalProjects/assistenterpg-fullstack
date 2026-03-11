import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
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
  tipo:
    | 'CHAT_NOVA'
    | 'CENA_ATUALIZADA'
    | 'TURNO_AVANCADO'
    | 'NPC_ATUALIZADO'
    | 'SESSAO_ENCERRADA';
  em: string;
};

type MetaSalaSessao = {
  campanhaId: number;
  sessaoId: number;
};

type EventoSessaoPresenca = {
  campanhaId: number;
  sessaoId: number;
  onlineUsuarioIds: number[];
  em: string;
};

function resolverCorsOrigins(): string[] | boolean {
  const bruto = process.env.CORS_ORIGINS;
  if (!bruto) return true;

  const origens = bruto
    .split(',')
    .map((origem) => origem.trim())
    .filter(Boolean);

  return origens.length > 0 ? origens : true;
}

@WebSocketGateway({
  namespace: '/sessoes',
  cors: {
    origin: resolverCorsOrigins(),
    credentials: true,
  },
})
export class SessaoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SessaoGateway.name);
  private readonly salasPorSocket = new Map<string, Set<string>>();
  private readonly usuariosPorSala = new Map<string, Map<number, number>>();
  private readonly metaPorSala = new Map<string, MetaSalaSessao>();

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly sessaoService: SessaoService,
    private readonly jwtService: JwtService,
  ) {}

  handleConnection(client: SocketAutenticado): void {
    const token = this.extrairToken(client);
    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = this.jwtService.verify<{ sub: number }>(token);
      client.data.usuarioId = payload.sub;
    } catch {
      this.logger.warn(`Socket desconectado por token invalido: ${client.id}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: SocketAutenticado): void {
    this.removerPresencaSocket(client);
  }

  @SubscribeMessage('sessao:join')
  async handleJoinSala(
    @ConnectedSocket() client: SocketAutenticado,
    @MessageBody() body: { campanhaId?: number; sessaoId?: number },
  ) {
    const campanhaId = Number(body?.campanhaId);
    const sessaoId = Number(body?.sessaoId);
    const usuarioId = client.data.usuarioId;

    if (!usuarioId || !Number.isInteger(campanhaId) || !Number.isInteger(sessaoId)) {
      client.emit('sessao:erro', {
        code: 'JOIN_INVALIDO',
      });
      return { ok: false };
    }

    try {
      await this.sessaoService.validarAcessoSessao(campanhaId, sessaoId, usuarioId);
      const chaveSala = this.chaveSala(campanhaId, sessaoId);
      await client.join(chaveSala);
      this.registrarPresenca(chaveSala, campanhaId, sessaoId, usuarioId, client.id);
      client.emit('sessao:joined', { campanhaId, sessaoId });
      this.emitirPresencaPorChave(chaveSala);
      return { ok: true };
    } catch {
      client.emit('sessao:erro', {
        code: 'ACESSO_NEGADO',
      });
      return { ok: false };
    }
  }

  emitirSessaoAtualizada(
    campanhaId: number,
    sessaoId: number,
    tipo: EventoSessaoAtualizada['tipo'],
  ): void {
    if (!this.server) return;

    const payload: EventoSessaoAtualizada = {
      campanhaId,
      sessaoId,
      tipo,
      em: new Date().toISOString(),
    };

    this.server.to(this.chaveSala(campanhaId, sessaoId)).emit('sessao:atualizada', payload);
  }

  private chaveSala(campanhaId: number, sessaoId: number): string {
    return `sessao:${campanhaId}:${sessaoId}`;
  }

  private registrarPresenca(
    chaveSala: string,
    campanhaId: number,
    sessaoId: number,
    usuarioId: number,
    socketId: string,
  ): void {
    let salasSocket = this.salasPorSocket.get(socketId);
    if (!salasSocket) {
      salasSocket = new Set<string>();
      this.salasPorSocket.set(socketId, salasSocket);
    }

    if (salasSocket.has(chaveSala)) return;

    salasSocket.add(chaveSala);
    this.metaPorSala.set(chaveSala, { campanhaId, sessaoId });

    let usuariosSala = this.usuariosPorSala.get(chaveSala);
    if (!usuariosSala) {
      usuariosSala = new Map<number, number>();
      this.usuariosPorSala.set(chaveSala, usuariosSala);
    }

    usuariosSala.set(usuarioId, (usuariosSala.get(usuarioId) ?? 0) + 1);
  }

  private removerPresencaSocket(client: SocketAutenticado): void {
    const socketId = client.id;
    const usuarioId = client.data.usuarioId;
    const salasSocket = this.salasPorSocket.get(socketId);

    if (!salasSocket || !usuarioId) {
      this.salasPorSocket.delete(socketId);
      return;
    }

    for (const chaveSala of salasSocket) {
      const usuariosSala = this.usuariosPorSala.get(chaveSala);
      if (!usuariosSala) continue;

      const conexoesUsuario = usuariosSala.get(usuarioId) ?? 0;
      if (conexoesUsuario <= 1) {
        usuariosSala.delete(usuarioId);
      } else {
        usuariosSala.set(usuarioId, conexoesUsuario - 1);
      }

      if (usuariosSala.size === 0) {
        this.usuariosPorSala.delete(chaveSala);
        this.metaPorSala.delete(chaveSala);
      }

      this.emitirPresencaPorChave(chaveSala);
    }

    this.salasPorSocket.delete(socketId);
  }

  private emitirPresencaPorChave(chaveSala: string): void {
    if (!this.server) return;

    const meta = this.metaPorSala.get(chaveSala);
    if (!meta) return;

    const usuariosSala = this.usuariosPorSala.get(chaveSala);
    const onlineUsuarioIds = usuariosSala
      ? Array.from(usuariosSala.keys()).sort((a, b) => a - b)
      : [];

    const payload: EventoSessaoPresenca = {
      campanhaId: meta.campanhaId,
      sessaoId: meta.sessaoId,
      onlineUsuarioIds,
      em: new Date().toISOString(),
    };

    this.server.to(chaveSala).emit('sessao:presenca', payload);
  }

  private extrairToken(client: SocketAutenticado): string | null {
    const authHeader = client.handshake.headers.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7).trim();
    }

    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.trim() !== '') {
      return authToken.startsWith('Bearer ')
        ? authToken.slice(7).trim()
        : authToken.trim();
    }

    const queryToken = client.handshake.query?.token;
    if (typeof queryToken === 'string' && queryToken.trim() !== '') {
      return queryToken.startsWith('Bearer ')
        ? queryToken.slice(7).trim()
        : queryToken.trim();
    }

    return null;
  }
}
