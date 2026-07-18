import { Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
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
import { CampanhaAccessService } from './campanha.access.service';

type IdentidadeCampanhaSocket = { sessaoId: number; usuarioId: number };
type CampanhaSocket = Socket & {
  data: { sessaoId?: number; usuarioId?: number };
};

const REVALIDACAO_PADRAO_SEGUNDOS = 30;

@WebSocketGateway({ namespace: '/campanhas', cors: createCorsOptions() })
export class CampanhaGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleDestroy
{
  private readonly logger = new Logger(CampanhaGateway.name);
  private readonly clientes = new Map<string, CampanhaSocket>();
  private readonly campanhasPorSocket = new Map<string, Set<number>>();
  private revalidacao?: NodeJS.Timeout;

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly accessService: CampanhaAccessService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  afterInit(): void {
    this.revalidacao = setInterval(
      () => void this.revalidarTodos(),
      this.intervaloRevalidacaoMs(),
    );
    this.revalidacao.unref();
  }

  onModuleDestroy(): void {
    if (this.revalidacao) clearInterval(this.revalidacao);
  }

  async handleConnection(client: CampanhaSocket): Promise<void> {
    const token = this.extrairToken(client);
    if (!token) return this.desconectar(client, 'AUTH_AUSENTE');
    try {
      const payload = this.jwtService.verify<{ sub?: unknown; sid?: unknown }>(
        token,
      );
      if (
        typeof payload.sub !== 'number' ||
        !Number.isInteger(payload.sub) ||
        typeof payload.sid !== 'number' ||
        !Number.isInteger(payload.sid)
      ) {
        return this.desconectar(client, 'AUTH_INVALIDA');
      }
      await this.authSessionService.validarSessaoAccess(
        payload.sid,
        payload.sub,
      );
      const data = client.data as {
        usuarioId?: number;
        sessaoId?: number;
      };
      data.usuarioId = payload.sub;
      data.sessaoId = payload.sid;
      this.clientes.set(client.id, client);
    } catch {
      this.desconectar(client, 'AUTH_INVALIDA');
    }
  }

  handleDisconnect(client: CampanhaSocket): void {
    this.clientes.delete(client.id);
    this.campanhasPorSocket.delete(client.id);
  }

  @SubscribeMessage('campanha:join')
  async entrar(
    @ConnectedSocket() client: CampanhaSocket,
    @MessageBody() body: { campanhaId?: number },
  ) {
    return this.entrarOuSincronizar(client, body);
  }

  @SubscribeMessage('campanha:sync')
  async sincronizar(
    @ConnectedSocket() client: CampanhaSocket,
    @MessageBody() body: { campanhaId?: number },
  ) {
    return this.entrarOuSincronizar(client, body);
  }

  private async entrarOuSincronizar(
    client: CampanhaSocket,
    body: { campanhaId?: number },
  ) {
    const identidade = await this.revalidarIdentidade(client);
    if (!identidade) return { ok: false, fatal: true };
    const campanhaId = Number(body?.campanhaId);
    if (!Number.isInteger(campanhaId) || campanhaId <= 0) {
      this.emitirErro(client, 'JOIN_INVALIDO');
      return { ok: false, fatal: true };
    }
    try {
      await this.accessService.garantirAcesso(campanhaId, identidade.usuarioId);
      await client.join(this.sala(campanhaId));
      const campanhas =
        this.campanhasPorSocket.get(client.id) ?? new Set<number>();
      campanhas.add(campanhaId);
      this.campanhasPorSocket.set(client.id, campanhas);
      return { ok: true, campanhaId };
    } catch {
      this.desconectar(client, 'ACESSO_NEGADO');
      return { ok: false, fatal: true };
    }
  }

  emitirRoletaAtualizada(campanhaId: number, motivo: string): void {
    if (!this.server) return;
    this.server.to(this.sala(campanhaId)).emit('campanha:roleta-atualizada', {
      campanhaId,
      motivo,
      em: new Date().toISOString(),
    });
  }

  emitirGiro(campanhaId: number, dados: unknown): void {
    if (!this.server) return;
    this.server.to(this.sala(campanhaId)).emit('campanha:roleta-giro', {
      campanhaId,
      dados,
      em: new Date().toISOString(),
    });
  }

  private sala(campanhaId: number): string {
    return `campanha:${campanhaId}`;
  }

  private async revalidarTodos(): Promise<void> {
    await Promise.all(
      [...this.clientes.values()].map(async (client) => {
        const identidade = await this.revalidarIdentidade(client);
        if (!identidade) return;
        const campanhas = this.campanhasPorSocket.get(client.id) ?? [];
        for (const campanhaId of campanhas) {
          try {
            await this.accessService.garantirAcesso(
              campanhaId,
              identidade.usuarioId,
            );
          } catch {
            this.desconectar(client, 'ACESSO_NEGADO');
            return;
          }
        }
      }),
    );
  }

  private identidade(client: CampanhaSocket): IdentidadeCampanhaSocket | null {
    const { sessaoId, usuarioId } = client.data as {
      sessaoId?: unknown;
      usuarioId?: unknown;
    };
    return typeof sessaoId === 'number' && typeof usuarioId === 'number'
      ? { sessaoId, usuarioId }
      : null;
  }

  private async revalidarIdentidade(
    client: CampanhaSocket,
  ): Promise<IdentidadeCampanhaSocket | null> {
    const identidade = this.identidade(client);
    if (!identidade) {
      this.desconectar(client, 'SESSAO_INVALIDA');
      return null;
    }
    try {
      await this.authSessionService.validarSessaoAccess(
        identidade.sessaoId,
        identidade.usuarioId,
      );
      return identidade;
    } catch {
      this.desconectar(client, 'SESSAO_INVALIDA');
      return null;
    }
  }

  private desconectar(client: CampanhaSocket, code: string): void {
    this.emitirErro(client, code);
    this.clientes.delete(client.id);
    this.campanhasPorSocket.delete(client.id);
    this.logger.warn(`Socket de campanha desconectado: ${code}`);
    client.disconnect(true);
  }

  private emitirErro(client: CampanhaSocket, code: string): void {
    client.emit('campanha:erro', {
      code,
      fatal: true,
      em: new Date().toISOString(),
    });
  }

  private intervaloRevalidacaoMs(): number {
    const configurado = Number(
      this.configService.get<string>('AUTH_WS_SESSION_RECHECK_SECONDS'),
    );
    return (
      (Number.isFinite(configurado) && configurado > 0
        ? configurado
        : REVALIDACAO_PADRAO_SEGUNDOS) * 1000
    );
  }

  private extrairToken(client: CampanhaSocket): string | null {
    const cookies = parseCookieHeader(client.handshake.headers.cookie);
    const cookie = cookies[AUTH_ACCESS_COOKIE];
    if (cookie) return cookie;
    if (!isBearerFallbackEnabled(this.configService)) return null;
    const authorization = client.handshake.headers.authorization;
    if (
      typeof authorization === 'string' &&
      authorization.startsWith('Bearer ')
    ) {
      return authorization.slice(7).trim();
    }
    const auth = client.handshake.auth as { token?: unknown } | undefined;
    if (typeof auth?.token === 'string')
      return auth.token.replace(/^Bearer /, '').trim();
    return null;
  }
}
