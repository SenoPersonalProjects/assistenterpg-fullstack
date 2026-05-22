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
import {
  AUTH_ACCESS_COOKIE,
  isBearerFallbackEnabled,
  parseCookieHeader,
} from 'src/auth/auth-security.config';
import { AuthSessionService } from 'src/auth/auth-session.service';
import { createCorsOptions } from 'src/common/config/security.config';
import { AmizadesService } from './amizades.service';
import { PresencaService } from './presenca.service';

type SocketAutenticado = Socket & {
  data: {
    usuarioId?: number;
  };
};

type EventoPresencaAmigos = {
  onlineUsuarioIds: number[];
  em: string;
};

@WebSocketGateway({
  namespace: '/presenca',
  cors: createCorsOptions(),
})
export class PresencaGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(PresencaGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly amizadesService: AmizadesService,
    private readonly presencaService: PresencaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authSessionService: AuthSessionService,
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
        client.id,
      );

      await this.emitirSnapshotParaUsuario(payload.sub);
      if (mudouStatus) {
        await this.emitirSnapshotsParaAmigos(payload.sub);
      }
    } catch {
      this.logger.warn(
        `Socket de presenca desconectado por token invalido: ${client.id}`,
      );
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: SocketAutenticado): Promise<void> {
    const remocao = this.presencaService.removerConexao(client.id);
    if (remocao.usuarioId && remocao.mudouStatus) {
      await this.emitirSnapshotsParaAmigos(remocao.usuarioId);
    }
  }

  @SubscribeMessage('presenca:sync')
  async handleSync(@ConnectedSocket() client: SocketAutenticado) {
    const usuarioId = this.obterUsuarioId(client);
    if (!usuarioId) return { ok: false };

    await this.emitirSnapshotParaUsuario(usuarioId);
    return { ok: true };
  }

  private async emitirSnapshotParaUsuario(usuarioId: number): Promise<void> {
    if (!this.server) return;

    const amigoIds = await this.amizadesService.listarAmigoIds(usuarioId);
    const payload: EventoPresencaAmigos = {
      onlineUsuarioIds: this.presencaService.filtrarOnline(amigoIds),
      em: new Date().toISOString(),
    };

    this.server
      .to(this.salaUsuario(usuarioId))
      .emit('presenca:amigos', payload);
  }

  private async emitirSnapshotsParaAmigos(usuarioId: number): Promise<void> {
    const amigoIds = await this.amizadesService.listarAmigoIds(usuarioId);
    await Promise.all(
      amigoIds.map((amigoId) => this.emitirSnapshotParaUsuario(amigoId)),
    );
  }

  private salaUsuario(usuarioId: number): string {
    return `usuario:${usuarioId}`;
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

    const queryPayload = client.handshake.query as
      | { token?: unknown }
      | undefined;
    const queryToken = queryPayload?.token;
    if (typeof queryToken === 'string' && queryToken.trim() !== '') {
      return queryToken.startsWith('Bearer ')
        ? queryToken.slice(7).trim()
        : queryToken.trim();
    }

    return null;
  }
}
