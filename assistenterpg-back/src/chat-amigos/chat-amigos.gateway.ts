import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { PresencaGateway } from 'src/amizades/presenca.gateway';
import { PresencaService } from 'src/amizades/presenca.service';
import {
  AUTH_ACCESS_COOKIE,
  isBearerFallbackEnabled,
  parseCookieHeader,
} from 'src/auth/auth-security.config';
import { AuthSessionService } from 'src/auth/auth-session.service';
import { createCorsOptions } from 'src/common/config/security.config';

type SocketAutenticado = Socket & {
  data: {
    usuarioId?: number;
  };
};

type MensagemChatPayload = {
  id: number;
  conversaId: number;
  autorId: number;
  destinatarioId: number;
  conteudo: string;
  criadoEm: Date | string;
};

type LeituraChatPayload = {
  usuarioId: number;
  amigoId: number;
  conversaId: number | null;
  lidaAteMensagemId: number | null;
};

@WebSocketGateway({
  namespace: '/chat-amigos',
  cors: createCorsOptions(),
})
export class ChatAmigosGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatAmigosGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authSessionService: AuthSessionService,
    private readonly presencaService: PresencaService,
    private readonly presencaGateway: PresencaGateway,
  ) {}

  async handleConnection(client: SocketAutenticado): Promise<void> {
    const token = this.extrairToken(client);
    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = this.jwtService.verify<{ sub: number; sid?: number }>(
        token,
      );
      if (typeof payload.sid === 'number') {
        await this.authSessionService.validarSessaoAccess(
          payload.sid,
          payload.sub,
        );
      }
      this.definirUsuarioId(client, payload.sub);
      await client.join(this.salaUsuario(payload.sub));

      const mudouStatus = this.presencaService.registrarConexao(
        payload.sub,
        this.presencaSocketId(client),
      );
      if (mudouStatus) {
        await this.presencaGateway.emitirSnapshotsParaUsuarioEAmigos(
          payload.sub,
        );
      }
    } catch {
      this.logger.warn(
        `Socket de chat desconectado por token inválido: ${client.id}`,
      );
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: SocketAutenticado): Promise<void> {
    const remocao = this.presencaService.removerConexao(
      this.presencaSocketId(client),
    );
    if (remocao.usuarioId && remocao.mudouStatus) {
      await this.presencaGateway.emitirSnapshotsParaUsuarioEAmigos(
        remocao.usuarioId,
      );
    }
  }

  @SubscribeMessage('chat:sync')
  handleSync(@ConnectedSocket() client: SocketAutenticado) {
    return { ok: Boolean(this.obterUsuarioId(client)) };
  }

  emitirMensagem(payload: MensagemChatPayload): void {
    if (!this.server) return;
    const evento = {
      ...payload,
      criadoEm:
        payload.criadoEm instanceof Date
          ? payload.criadoEm.toISOString()
          : payload.criadoEm,
    };
    this.server
      .to(this.salaUsuario(payload.autorId))
      .emit('chat:mensagem', evento);
    this.server
      .to(this.salaUsuario(payload.destinatarioId))
      .emit('chat:mensagem', evento);
  }

  emitirLeitura(payload: LeituraChatPayload): void {
    if (!this.server) return;
    this.server
      .to(this.salaUsuario(payload.usuarioId))
      .emit('chat:leitura', payload);
    this.server
      .to(this.salaUsuario(payload.amigoId))
      .emit('chat:leitura', payload);
  }

  private salaUsuario(usuarioId: number): string {
    return `usuario:${usuarioId}`;
  }

  private presencaSocketId(client: Socket): string {
    return `chat-amigos:${client.id}`;
  }

  private obterUsuarioId(client: Socket): number | undefined {
    const data = client.data as { usuarioId?: unknown };
    return typeof data.usuarioId === 'number' ? data.usuarioId : undefined;
  }

  private definirUsuarioId(client: Socket, usuarioId: number): void {
    const data = client.data as { usuarioId?: number };
    data.usuarioId = usuarioId;
  }

  private extrairToken(client: SocketAutenticado): string | null {
    const cookies = parseCookieHeader(client.handshake.headers.cookie);
    const cookieToken = cookies[AUTH_ACCESS_COOKIE];
    if (cookieToken) return cookieToken;

    if (!isBearerFallbackEnabled(this.configService)) {
      return null;
    }

    const authHeader = client.handshake.headers.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7).trim();
    }

    const authPayload = client.handshake.auth as
      | { token?: unknown }
      | undefined;
    const authToken = authPayload?.token;
    if (typeof authToken === 'string' && authToken.trim() !== '') {
      return authToken.startsWith('Bearer ')
        ? authToken.slice(7).trim()
        : authToken.trim();
    }

    return null;
  }
}
