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
      throw new UnauthorizedException('Sessao expirada');
    }

    if (sessao.revogadaEm) {
      await this.revogarTodasSessoesUsuario(sessao.usuarioId);
      throw new UnauthorizedException('Sessao expirada');
    }

    const novoRefreshToken = gerarSegredoSessao();
    const novoCsrfToken = gerarSegredoSessao(32);
    const segundosRestantes = Math.max(
      1,
      Math.floor((sessao.expiraEm.getTime() - Date.now()) / 1000),
    );

    const novaSessao = await this.prisma.$transaction(async (tx) => {
      await tx.sessaoAutenticacao.update({
        where: { id: sessao.id },
        data: {
          revogadaEm: new Date(),
          ultimoUsoEm: new Date(),
        },
      });

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
        data: { revogadaEm: new Date() },
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
      throw new UnauthorizedException('Sessao invalida');
    }
  }

  async validarCsrf(request: Request, csrfHeader: string): Promise<boolean> {
    const refreshToken = getCookieValue(request, AUTH_REFRESH_COOKIE);
    const csrfCookie = getCookieValue(request, AUTH_CSRF_COOKIE);

    if (!refreshToken || !csrfCookie || csrfCookie !== csrfHeader) {
      return false;
    }

    const sessao = await this.prisma.sessaoAutenticacao.findFirst({
      where: {
        refreshTokenHash: hashSegredoSessao(refreshToken),
        revogadaEm: null,
        expiraEm: { gt: new Date() },
      },
      select: { csrfTokenHash: true },
    });

    if (!sessao) return false;
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
      throw new UnauthorizedException('Sessao expirada');
    }

    return refreshToken;
  }

  private async obterSessaoValidaPorRefresh(refreshToken: string) {
    const sessao = await this.obterSessaoPorRefresh(refreshToken);

    if (!sessao || sessao.revogadaEm || sessao.expiraEm <= new Date()) {
      throw new UnauthorizedException('Sessao expirada');
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

  private async revogarTodasSessoesUsuario(usuarioId: number): Promise<void> {
    await this.prisma.sessaoAutenticacao.updateMany({
      where: {
        usuarioId,
        revogadaEm: null,
      },
      data: { revogadaEm: new Date() },
    });
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
