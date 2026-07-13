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
import { SessaoService } from './sessao.service';

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

type EventoSessaoAtualizada = {
  campanhaId: number;
  sessaoId: number;
  tipo:
    | 'CHAT_NOVA'
    | 'CENA_ATUALIZADA'
    | 'TURNO_AVANCADO'
    | 'TURNO_RECUADO'
    | 'TURNO_PULADO'
    | 'ORDEM_INICIATIVA_ATUALIZADA'
    | 'INICIATIVA_VALOR_ATUALIZADO'
    | 'NPC_ATUALIZADO'
    | 'PERSONAGEM_ATUALIZADO'
    | 'SESSAO_ENCERRADA'
    | 'SESSAO_EVENTO_DESFEITO'
    | 'EFEITOS_TURNO_REPROCESSADOS'
    | 'HABILIDADE_USADA'
    | 'HABILIDADE_SUSTENTADA_ENCERRADA'
    | 'CONDICAO_APLICADA'
    | 'CONDICAO_REMOVIDA'
    | 'RECURSO_AJUSTADO'
    | 'REGRA_OPCIONAL_ATUALIZADA'
    | 'INSPIRACAO_AJUSTADA'
    | 'INSPIRACAO_GASTA'
    | 'ENCONTRO_SOCIAL_ATUALIZADO'
    | 'ESCALADA_DADOS_ATUALIZADA'
    | 'INICIATIVA_ALTERNADA_ATUALIZADA'
    | 'CONSUMIVEL_USADO';
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

type EventoSessaoJoined = {
  campanhaId: number;
  sessaoId: number;
  presenca: EventoSessaoPresenca;
};

type EventoSessaoErroCode =
  | 'ACESSO_NEGADO'
  | 'AUTH_AUSENTE'
  | 'AUTH_INVALIDA'
  | 'JOIN_INVALIDO'
  | 'SESSAO_INVALIDA';

type EventoSessaoErro = {
  code: EventoSessaoErroCode;
  fatal: true;
  em: string;
};

@WebSocketGateway({
  namespace: '/sessoes',
  cors: createCorsOptions(),
})
export class SessaoGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleDestroy
{
  private readonly logger = new Logger(SessaoGateway.name);
  private readonly clientesAutenticados = new Map<string, SocketAutenticado>();
  private readonly salasPorSocket = new Map<string, Set<string>>();
  private readonly usuariosPorSala = new Map<string, Map<number, number>>();
  private readonly metaPorSala = new Map<string, MetaSalaSessao>();
  private revalidacaoPeriodicaEmAndamento = false;
  private revalidacaoPeriodicaInterval?: NodeJS.Timeout;

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly sessaoService: SessaoService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authSessionService: AuthSessionService,
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
      this.emitirErroFatalSessao(client, 'AUTH_AUSENTE');
      client.disconnect(true);
      return;
    }

    try {
      const payload = this.jwtService.verify<{ sub?: unknown; sid?: unknown }>(
        token,
      );
      const identidade = this.extrairIdentidadePayload(payload);
      try {
        await this.validarIdentidade(identidade);
      } catch {
        this.emitirErroFatalSessao(client, 'SESSAO_INVALIDA');
        this.logger.warn(
          `Socket desconectado por sessão inválida: ${client.id}`,
        );
        client.disconnect(true);
        return;
      }
      this.definirIdentidade(client, identidade);
      this.clientesAutenticados.set(client.id, client);
    } catch {
      this.emitirErroFatalSessao(client, 'AUTH_INVALIDA');
      this.logger.warn(`Socket desconectado por token invalido: ${client.id}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: SocketAutenticado): void {
    this.clientesAutenticados.delete(client.id);
    this.removerPresencaSocket(client);
  }

  @SubscribeMessage('sessao:join')
  async handleJoinSala(
    @ConnectedSocket() client: SocketAutenticado,
    @MessageBody() body: { campanhaId?: number; sessaoId?: number },
  ) {
    const campanhaId = Number(body?.campanhaId);
    const sessaoId = Number(body?.sessaoId);
    const identidade = await this.revalidarEvento(client);
    if (!identidade) return { ok: false, code: 'SESSAO_INVALIDA', fatal: true };
    const usuarioId = identidade.usuarioId;

    if (!Number.isInteger(campanhaId) || !Number.isInteger(sessaoId)) {
      const erro = this.emitirErroFatalSessao(client, 'JOIN_INVALIDO');
      return { ok: false, code: erro.code, fatal: erro.fatal };
    }

    try {
      await this.sessaoService.validarAcessoSessao(
        campanhaId,
        sessaoId,
        usuarioId,
      );
      const chaveSala = this.chaveSala(campanhaId, sessaoId);
      await client.join(chaveSala);
      this.registrarPresenca(
        chaveSala,
        campanhaId,
        sessaoId,
        usuarioId,
        client.id,
      );
      const presenca = this.criarSnapshotPresencaPorChave(chaveSala);
      if (!presenca) return { ok: false };

      const joined: EventoSessaoJoined = { campanhaId, sessaoId, presenca };
      client.emit('sessao:joined', joined);
      this.emitirPresencaPorChave(chaveSala);
      return { ok: true, presenca };
    } catch {
      const erro = this.emitirErroFatalSessao(client, 'ACESSO_NEGADO');
      return { ok: false, code: erro.code, fatal: erro.fatal };
    }
  }

  @SubscribeMessage('sessao:sync')
  async handleSyncSala(
    @ConnectedSocket() client: SocketAutenticado,
    @MessageBody() body: { campanhaId?: number; sessaoId?: number },
  ) {
    const campanhaId = Number(body?.campanhaId);
    const sessaoId = Number(body?.sessaoId);
    const identidade = await this.revalidarEvento(client);
    if (!identidade) return { ok: false, code: 'SESSAO_INVALIDA', fatal: true };
    const usuarioId = identidade.usuarioId;

    if (!Number.isInteger(campanhaId) || !Number.isInteger(sessaoId)) {
      const erro = this.emitirErroFatalSessao(client, 'JOIN_INVALIDO');
      return { ok: false, code: erro.code, fatal: erro.fatal };
    }

    try {
      await this.sessaoService.validarAcessoSessao(
        campanhaId,
        sessaoId,
        usuarioId,
      );
      const chaveSala = this.chaveSala(campanhaId, sessaoId);
      await client.join(chaveSala);
      this.registrarPresenca(
        chaveSala,
        campanhaId,
        sessaoId,
        usuarioId,
        client.id,
      );
      const presenca = this.emitirPresencaPorChave(chaveSala);
      return { ok: true, presenca };
    } catch {
      const erro = this.emitirErroFatalSessao(client, 'ACESSO_NEGADO');
      return { ok: false, code: erro.code, fatal: erro.fatal };
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

    this.server
      .to(this.chaveSala(campanhaId, sessaoId))
      .emit('sessao:atualizada', payload);
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
    const usuarioId = this.obterUsuarioId(client);
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

  private criarSnapshotPresencaPorChave(
    chaveSala: string,
  ): EventoSessaoPresenca | null {
    const meta = this.metaPorSala.get(chaveSala);
    if (!meta) return null;

    const usuariosSala = this.usuariosPorSala.get(chaveSala);
    const onlineUsuarioIds = usuariosSala
      ? Array.from(usuariosSala.keys()).sort((a, b) => a - b)
      : [];

    return {
      campanhaId: meta.campanhaId,
      sessaoId: meta.sessaoId,
      onlineUsuarioIds,
      em: new Date().toISOString(),
    };
  }

  private emitirPresencaPorChave(
    chaveSala: string,
  ): EventoSessaoPresenca | null {
    const payload = this.criarSnapshotPresencaPorChave(chaveSala);
    if (!payload) return null;

    if (!this.server) return payload;

    this.server.to(chaveSala).emit('sessao:presenca', payload);
    return payload;
  }

  private emitirErroFatalSessao(
    client: SocketAutenticado,
    code: EventoSessaoErroCode,
  ): EventoSessaoErro {
    const erro: EventoSessaoErro = {
      code,
      fatal: true,
      em: new Date().toISOString(),
    };
    client.emit('sessao:erro', erro);
    return erro;
  }

  private obterUsuarioId(client: Socket): number | undefined {
    const data = client.data as { usuarioId?: unknown };
    return typeof data.usuarioId === 'number' ? data.usuarioId : undefined;
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
    this.removerPresencaSocket(client);
    this.emitirErroFatalSessao(client, 'SESSAO_INVALIDA');
    this.logger.warn(`Socket desconectado por sessão inválida: ${client.id}`);
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
