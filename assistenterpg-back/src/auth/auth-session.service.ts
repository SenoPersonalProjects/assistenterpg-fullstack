import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Response, Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AUTH_ACCESS_COOKIE,
  AUTH_ACCESS_TOKEN_TTL_SECONDS,
  AUTH_CSRF_COOKIE,
  AUTH_REFRESH_COOKIE,
  AUTH_REFRESH_TOKEN_TTL_REMEMBER_SECONDS,
  AUTH_REFRESH_TOKEN_TTL_SESSION_SECONDS,
  getCookieValue,
  resolveAuthCookieOptions,
} from './auth-security.config';
import {
  compararHashesSeguros,
  gerarSegredoSessao,
  hashSegredoSessao,
} from './auth-session.util';

type UsuarioSessao = {
  id: number;
  email: string;
};

const REVOGACAO_ROTACAO = 'ROTACAO';
const REVOGACAO_LOGOUT = 'LOGOUT';
const REVOGACAO_REUSO_REFRESH = 'REUSO_REFRESH';
const REFRESH_ROTACAO_GRACE_MS = 30_000;

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async criarSessao(
    usuario: UsuarioSessao,
    rememberMe: boolean,
    request: Request,
    response: Response,
  ): Promise<{ csrfToken: string }> {
    const refreshToken = gerarSegredoSessao();
    const csrfToken = gerarSegredoSessao(32);
    const refreshTtl = rememberMe
      ? AUTH_REFRESH_TOKEN_TTL_REMEMBER_SECONDS
      : AUTH_REFRESH_TOKEN_TTL_SESSION_SECONDS;
    const expiraEm = new Date(Date.now() + refreshTtl * 1000);

    const sessao = await this.prisma.sessaoAutenticacao.create({
      data: {
        usuarioId: usuario.id,
        refreshTokenHash: hashSegredoSessao(refreshToken),
        csrfTokenHash: hashSegredoSessao(csrfToken),
        userAgent: request.get('user-agent') ?? null,
        ipHash: request.ip ? hashSegredoSessao(request.ip) : null,
        expiraEm,
        ultimoUsoEm: new Date(),
      },
    });

    const accessToken = await this.assinarAccessToken(usuario, sessao.id);
    this.definirCookies(response, {
      accessToken,
      refreshToken,
      csrfToken,
      refreshMaxAgeSeconds: refreshTtl,
    });

    return { csrfToken };
  }

  async renovarSessao(
    request: Request,
    response: Response,
  ): Promise<{ csrfToken: string }> {
    const refreshToken = this.obterRefreshToken(request);
    const sessao = await this.obterSessaoPorRefresh(refreshToken);
    if (!sessao || sessao.expiraEm <= new Date()) {
      throw new UnauthorizedException('Sessão expirada');
    }

    if (sessao.revogadaEm) {
      if (this.ehDuplicataBenignaDeRefresh(sessao, request)) {
        return this.emitirNovaSessaoAposRefresh(sessao, request, response);
      }

      await this.revogarTodasSessoesUsuario(
        sessao.usuarioId,
        REVOGACAO_REUSO_REFRESH,
      );
      throw new UnauthorizedException('Sessão expirada');
    }

    return this.emitirNovaSessaoAposRefresh(sessao, request, response);
  }

  private async emitirNovaSessaoAposRefresh(
    sessao: NonNullable<
      Awaited<ReturnType<AuthSessionService['obterSessaoPorRefresh']>>
    >,
    request: Request,
    response: Response,
  ): Promise<{ csrfToken: string }> {
    const novoRefreshToken = gerarSegredoSessao();
    const novoCsrfToken = gerarSegredoSessao(32);
    const segundosRestantes = Math.max(
      1,
      Math.floor((sessao.expiraEm.getTime() - Date.now()) / 1000),
    );

    const novaSessao = await this.prisma.$transaction(async (tx) => {
      if (!sessao.revogadaEm) {
        const agora = new Date();
        await tx.sessaoAutenticacao.update({
          where: { id: sessao.id },
          data: {
            revogadaEm: agora,
            revogacaoMotivo: REVOGACAO_ROTACAO,
            rotacionadaEm: agora,
            ultimoUsoEm: agora,
          },
        });
      }

      return tx.sessaoAutenticacao.create({
        data: {
          usuarioId: sessao.usuarioId,
          refreshTokenHash: hashSegredoSessao(novoRefreshToken),
          csrfTokenHash: hashSegredoSessao(novoCsrfToken),
          userAgent: request.get('user-agent') ?? sessao.userAgent,
          ipHash: request.ip ? hashSegredoSessao(request.ip) : sessao.ipHash,
          expiraEm: sessao.expiraEm,
          ultimoUsoEm: new Date(),
        },
      });
    });

    const accessToken = await this.assinarAccessToken(
      { id: sessao.usuario.id, email: sessao.usuario.email },
      novaSessao.id,
    );
    this.definirCookies(response, {
      accessToken,
      refreshToken: novoRefreshToken,
      csrfToken: novoCsrfToken,
      refreshMaxAgeSeconds: segundosRestantes,
    });

    return { csrfToken: novoCsrfToken };
  }

  async emitirCsrf(
    request: Request,
    response: Response,
  ): Promise<{ csrfToken: string }> {
    const refreshToken = this.obterRefreshToken(request);
    const sessao = await this.obterSessaoValidaPorRefresh(refreshToken);
    const csrfToken = gerarSegredoSessao(32);
    const segundosRestantes = Math.max(
      1,
      Math.floor((sessao.expiraEm.getTime() - Date.now()) / 1000),
    );

    await this.prisma.sessaoAutenticacao.update({
      where: { id: sessao.id },
      data: {
        csrfTokenHash: hashSegredoSessao(csrfToken),
        ultimoUsoEm: new Date(),
      },
    });

    response.cookie(
      AUTH_CSRF_COOKIE,
      csrfToken,
      resolveAuthCookieOptions(this.configService, false, segundosRestantes),
    );

    return { csrfToken };
  }

  async revogarSessao(request: Request, response: Response): Promise<void> {
    const refreshToken = getCookieValue(request, AUTH_REFRESH_COOKIE);
    if (refreshToken) {
      await this.prisma.sessaoAutenticacao.updateMany({
        where: {
          refreshTokenHash: hashSegredoSessao(refreshToken),
          revogadaEm: null,
        },
        data: {
          revogadaEm: new Date(),
          revogacaoMotivo: REVOGACAO_LOGOUT,
        },
      });
    }

    this.limparCookies(response);
  }

  async validarSessaoAccess(
    sessaoId: number,
    usuarioId: number,
  ): Promise<void> {
    const sessao = await this.prisma.sessaoAutenticacao.findFirst({
      where: {
        id: sessaoId,
        usuarioId,
        revogadaEm: null,
        expiraEm: { gt: new Date() },
      },
      select: { id: true },
    });

    if (!sessao) {
      throw new UnauthorizedException('Sessão inválida');
    }
  }

  async validarCsrf(request: Request, csrfHeader: string): Promise<boolean> {
    const refreshToken = getCookieValue(request, AUTH_REFRESH_COOKIE);
    const csrfCookie = getCookieValue(request, AUTH_CSRF_COOKIE);

    if (!refreshToken || !csrfCookie || csrfCookie !== csrfHeader) {
      return false;
    }

    const sessao = await this.prisma.sessaoAutenticacao.findUnique({
      where: {
        refreshTokenHash: hashSegredoSessao(refreshToken),
      },
      include: {
        usuario: {
          select: { id: true, email: true },
        },
      },
    });

    if (!sessao) return false;
    const sessaoAtiva = !sessao.revogadaEm && sessao.expiraEm > new Date();
    const duplicataRefresh =
      this.ehRotaRefresh(request) &&
      this.ehDuplicataBenignaDeRefresh(sessao, request);

    if (!sessaoAtiva && !duplicataRefresh) return false;

    return compararHashesSeguros(
      sessao.csrfTokenHash,
      hashSegredoSessao(csrfHeader),
    );
  }

  limparCookies(response: Response): void {
    response.clearCookie(
      AUTH_ACCESS_COOKIE,
      resolveAuthCookieOptions(this.configService, true),
    );
    response.clearCookie(
      AUTH_REFRESH_COOKIE,
      resolveAuthCookieOptions(this.configService, true),
    );
    response.clearCookie(
      AUTH_CSRF_COOKIE,
      resolveAuthCookieOptions(this.configService, false),
    );
  }

  private obterRefreshToken(request: Request): string {
    const refreshToken = getCookieValue(request, AUTH_REFRESH_COOKIE);
    if (!refreshToken) {
      throw new UnauthorizedException('Sessão expirada');
    }

    return refreshToken;
  }

  private async obterSessaoValidaPorRefresh(refreshToken: string) {
    const sessao = await this.obterSessaoPorRefresh(refreshToken);

    if (!sessao || sessao.revogadaEm || sessao.expiraEm <= new Date()) {
      throw new UnauthorizedException('Sessão expirada');
    }

    return sessao;
  }

  private async obterSessaoPorRefresh(refreshToken: string) {
    return this.prisma.sessaoAutenticacao.findUnique({
      where: {
        refreshTokenHash: hashSegredoSessao(refreshToken),
      },
      include: {
        usuario: {
          select: { id: true, email: true },
        },
      },
    });
  }

  private async revogarTodasSessoesUsuario(
    usuarioId: number,
    motivo: string,
  ): Promise<void> {
    await this.prisma.sessaoAutenticacao.updateMany({
      where: {
        usuarioId,
        revogadaEm: null,
      },
      data: {
        revogadaEm: new Date(),
        revogacaoMotivo: motivo,
      },
    });
  }

  private ehDuplicataBenignaDeRefresh(
    sessao: {
      revogadaEm: Date | null;
      revogacaoMotivo?: string | null;
      rotacionadaEm?: Date | null;
      userAgent?: string | null;
      ipHash?: string | null;
      expiraEm: Date;
    },
    request: Request,
  ): boolean {
    if (
      !sessao.revogadaEm ||
      sessao.revogacaoMotivo !== REVOGACAO_ROTACAO ||
      sessao.expiraEm <= new Date()
    ) {
      return false;
    }

    const rotacionadaEm = sessao.rotacionadaEm ?? sessao.revogadaEm;
    if (Date.now() - rotacionadaEm.getTime() > REFRESH_ROTACAO_GRACE_MS) {
      return false;
    }

    return this.contextoDaSessaoCompativel(sessao, request);
  }

  private contextoDaSessaoCompativel(
    sessao: { userAgent?: string | null; ipHash?: string | null },
    request: Request,
  ): boolean {
    const userAgentAtual = request.get('user-agent') ?? null;
    if (
      sessao.userAgent &&
      userAgentAtual &&
      sessao.userAgent !== userAgentAtual
    ) {
      return false;
    }

    // Em producao atras de proxies/CDNs, o IP observado pelo backend pode mudar
    // entre chamadas quase simultâneas. A janela curta de rotacao + user-agent
    // compativel e suficiente para tratar duplicatas legitimas sem derrubar o usuário.
    return true;
  }

  private ehRotaRefresh(request: Request): boolean {
    const path = request.path ?? request.originalUrl ?? request.url ?? '';
    return path.includes('/auth/refresh');
  }

  private async assinarAccessToken(usuario: UsuarioSessao, sessaoId: number) {
    return this.jwtService.signAsync(
      { sub: usuario.id, email: usuario.email, sid: sessaoId },
      { expiresIn: AUTH_ACCESS_TOKEN_TTL_SECONDS },
    );
  }

  private definirCookies(
    response: Response,
    tokens: {
      accessToken: string;
      refreshToken: string;
      csrfToken: string;
      refreshMaxAgeSeconds: number;
    },
  ): void {
    response.cookie(
      AUTH_ACCESS_COOKIE,
      tokens.accessToken,
      resolveAuthCookieOptions(
        this.configService,
        true,
        AUTH_ACCESS_TOKEN_TTL_SECONDS,
      ),
    );
    response.cookie(
      AUTH_REFRESH_COOKIE,
      tokens.refreshToken,
      resolveAuthCookieOptions(
        this.configService,
        true,
        tokens.refreshMaxAgeSeconds,
      ),
    );
    response.cookie(
      AUTH_CSRF_COOKIE,
      tokens.csrfToken,
      resolveAuthCookieOptions(
        this.configService,
        false,
        tokens.refreshMaxAgeSeconds,
      ),
    );
  }
}
