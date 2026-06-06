import { Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
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
    sessaoId?: number;
    usuarioId?: number;
  };
};

type IdentidadeSocket = {
  sessaoId: number;
  usuarioId: number;
};

const DEFAULT_WS_SESSION_RECHECK_SECONDS = 30;

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
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleDestroy
{
  private readonly logger = new Logger(ChatAmigosGateway.name);
  private readonly clientesAutenticados = new Map<string, SocketAutenticado>();
  private revalidacaoPeriodicaEmAndamento = false;
  private revalidacaoPeriodicaInterval?: NodeJS.Timeout;

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authSessionService: AuthSessionService,
    private readonly presencaService: PresencaService,
    private readonly presencaGateway: PresencaGateway,
  ) {}

  afterInit(): void {
    this.revalidacaoPeriodicaInterval = setInterval(
      () => void this.revalidarClientesConectados(),
      this.obterIntervaloRevalidacaoMs(),
    );
    this.revalidacaoPeriodicaInterval.unref();
  }

  onModuleDestroy(): void {
    if (this.revalidacaoPeriodicaInterval) {
      clearInterval(this.revalidacaoPeriodicaInterval);
    }
  }

  async handleConnection(client: SocketAutenticado): Promise<void> {
    const token = this.extrairToken(client);
    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = this.jwtService.verify<{ sub?: unknown; sid?: unknown }>(
        token,
      );
      const identidade = this.extrairIdentidadePayload(payload);
      await this.validarIdentidade(identidade);
      this.definirIdentidade(client, identidade);
      await client.join(this.salaUsuario(identidade.usuarioId));

      const mudouStatus = this.presencaService.registrarConexao(
        identidade.usuarioId,
        this.presencaSocketId(client),
      );
      this.clientesAutenticados.set(client.id, client);
      if (mudouStatus) {
        await this.presencaGateway.emitirSnapshotsParaUsuarioEAmigos(
          identidade.usuarioId,
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
    this.clientesAutenticados.delete(client.id);
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
  async handleSync(@ConnectedSocket() client: SocketAutenticado) {
    return { ok: Boolean(await this.revalidarEvento(client)) };
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

  private obterIdentidade(client: Socket): IdentidadeSocket | null {
    const data = client.data as {
      sessaoId?: unknown;
      usuarioId?: unknown;
    };
    if (
      typeof data.sessaoId !== 'number' ||
      !Number.isInteger(data.sessaoId) ||
      typeof data.usuarioId !== 'number' ||
      !Number.isInteger(data.usuarioId)
    ) {
      return null;
    }

    return { sessaoId: data.sessaoId, usuarioId: data.usuarioId };
  }

  private definirIdentidade(
    client: Socket,
    identidade: IdentidadeSocket,
  ): void {
    const data = client.data as {
      sessaoId?: number;
      usuarioId?: number;
    };
    data.sessaoId = identidade.sessaoId;
    data.usuarioId = identidade.usuarioId;
  }

  private extrairIdentidadePayload(payload: {
    sub?: unknown;
    sid?: unknown;
  }): IdentidadeSocket {
    if (
      typeof payload.sub !== 'number' ||
      !Number.isInteger(payload.sub) ||
      typeof payload.sid !== 'number' ||
      !Number.isInteger(payload.sid)
    ) {
      throw new Error('JWT WebSocket sem identidade de sessão válida');
    }

    return { sessaoId: payload.sid, usuarioId: payload.sub };
  }

  private async validarIdentidade(identidade: IdentidadeSocket): Promise<void> {
    // Contrato central: deve rejeitar sessão revogada e usuário inativo/não verificado.
    await this.authSessionService.validarSessaoAccess(
      identidade.sessaoId,
      identidade.usuarioId,
    );
  }

  private async revalidarEvento(
    client: SocketAutenticado,
  ): Promise<IdentidadeSocket | null> {
    const identidade = this.obterIdentidade(client);
    if (!identidade) {
      this.desconectarSessaoInvalida(client);
      return null;
    }

    try {
      await this.validarIdentidade(identidade);
      return identidade;
    } catch {
      this.desconectarSessaoInvalida(client);
      return null;
    }
  }

  private async revalidarClientesConectados(): Promise<void> {
    if (this.revalidacaoPeriodicaEmAndamento) return;

    this.revalidacaoPeriodicaEmAndamento = true;
    try {
      await Promise.all(
        Array.from(this.clientesAutenticados.values(), (client) =>
          this.revalidarEvento(client),
        ),
      );
    } finally {
      this.revalidacaoPeriodicaEmAndamento = false;
    }
  }

  private desconectarSessaoInvalida(client: SocketAutenticado): void {
    this.clientesAutenticados.delete(client.id);
    this.logger.warn(
      `Socket de chat desconectado por sessão inválida: ${client.id}`,
    );
    client.disconnect(true);
  }

  private obterIntervaloRevalidacaoMs(): number {
    const segundosConfigurados = Number(
      this.configService.get<string>('AUTH_WS_SESSION_RECHECK_SECONDS'),
    );
    const segundos =
      Number.isFinite(segundosConfigurados) && segundosConfigurados > 0
        ? segundosConfigurados
        : DEFAULT_WS_SESSION_RECHECK_SECONDS;

    return segundos * 1000;
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
