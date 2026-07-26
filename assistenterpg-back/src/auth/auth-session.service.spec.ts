import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { StatusContaUsuario } from '@prisma/client';
import type { Request, Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AUTH_ACCESS_COOKIE,
  AUTH_CSRF_COOKIE,
  AUTH_REFRESH_COOKIE,
} from './auth-security.config';
import { AuthSessionService } from './auth-session.service';
import { hashSegredoSessao } from './auth-session.util';

type PrismaSessaoMock = {
  create: jest.Mock;
  findFirst: jest.Mock;
  findUnique: jest.Mock;
  update: jest.Mock;
  updateMany: jest.Mock;
};

const USUARIO_ATIVO = {
  id: 1,
  email: 'usuario@example.com',
  status: StatusContaUsuario.ATIVA,
  emailVerificadoEm: new Date('2026-01-01T00:00:00.000Z'),
};

describe('AuthSessionService', () => {
  let service: AuthSessionService;
  let sessaoAutenticacao: PrismaSessaoMock;
  let prisma: PrismaService;
  let jwtService: Pick<JwtService, 'signAsync'>;
  let configService: Pick<ConfigService, 'get'>;

  beforeEach(() => {
    sessaoAutenticacao = {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    };
    prisma = {
      sessaoAutenticacao,
      executarLeituraComRetry: jest.fn((operacao: () => Promise<unknown>) =>
        operacao(),
      ),
      $transaction: jest.fn((callback) =>
        callback({
          sessaoAutenticacao,
        }),
      ),
    } as unknown as PrismaService;
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('access.jwt'),
    };
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'NODE_ENV') return 'test';
        if (key === 'JWT_SECRET') return 'test-secret-with-enough-length';
        return undefined;
      }),
    };

    service = new AuthSessionService(
      prisma,
      jwtService as JwtService,
      configService as ConfigService,
    );
  });

  function criarRequest(
    cookies: Record<string, string> = {},
    ip = '127.0.0.1',
    path = '/',
  ) {
    return {
      cookies,
      ip,
      path,
      get: jest.fn((header: string) =>
        header.toLowerCase() === 'user-agent' ? 'jest' : undefined,
      ),
    } as unknown as Request;
  }

  function criarResponse() {
    const response = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };
    return {
      response: response as unknown as Response,
      cookieMock: response.cookie,
      clearCookieMock: response.clearCookie,
    };
  }

  function criarSessaoPersistida(
    refreshToken: string,
    overrides: Record<string, unknown> = {},
  ) {
    return {
      id: 10,
      usuarioId: 1,
      familiaId: 'familia-1',
      refreshTokenHash: hashSegredoSessao(refreshToken),
      csrfTokenHash: hashSegredoSessao('csrf-atual'),
      userAgent: 'jest',
      ipHash: hashSegredoSessao('127.0.0.1'),
      expiraEm: new Date(Date.now() + 60_000),
      revogadaEm: null,
      revogacaoMotivo: null,
      rotacionadaEm: null,
      usuario: USUARIO_ATIVO,
      ...overrides,
    };
  }

  it('cria familia, armazena hashes e emite cookies HttpOnly', async () => {
    sessaoAutenticacao.create.mockResolvedValue({ id: 10 });
    const { response, cookieMock } = criarResponse();

    await service.criarSessao(
      { id: 1, email: 'usuario@example.com' },
      true,
      criarRequest(),
      response,
    );

    expect(sessaoAutenticacao.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          usuarioId: 1,
          familiaId: expect.any(String),
          refreshTokenHash: expect.any(String),
          csrfTokenHash: expect.any(String),
          userAgent: 'jest',
        }),
      }),
    );
    const createData = sessaoAutenticacao.create.mock.calls[0][0].data;
    expect(createData.refreshTokenHash).toHaveLength(64);
    expect(createData.csrfTokenHash).toHaveLength(64);
    expect(cookieMock).toHaveBeenCalledWith(
      AUTH_ACCESS_COOKIE,
      'access.jwt',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(cookieMock).toHaveBeenCalledWith(
      AUTH_REFRESH_COOKIE,
      expect.any(String),
      expect.objectContaining({ httpOnly: true }),
    );
    expect(cookieMock).toHaveBeenCalledWith(
      AUTH_CSRF_COOKIE,
      expect.any(String),
      expect.objectContaining({ httpOnly: false }),
    );
  });

  it('rotaciona refresh condicionalmente e preserva familiaId', async () => {
    const refreshToken = 'refresh-atual';
    sessaoAutenticacao.findUnique.mockResolvedValue(
      criarSessaoPersistida(refreshToken),
    );
    sessaoAutenticacao.updateMany.mockResolvedValue({ count: 1 });
    sessaoAutenticacao.create.mockResolvedValue({ id: 11 });

    await service.renovarSessao(
      criarRequest({ [AUTH_REFRESH_COOKIE]: refreshToken }),
      criarResponse().response,
    );

    expect(sessaoAutenticacao.updateMany).toHaveBeenCalledWith({
      where: { id: 10, revogadaEm: null },
      data: expect.objectContaining({
        revogacaoMotivo: 'ROTACAO',
        revogadaEm: expect.any(Date),
        rotacionadaEm: expect.any(Date),
      }),
    });
    expect(sessaoAutenticacao.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          usuarioId: 1,
          familiaId: 'familia-1',
          refreshTokenHash: expect.any(String),
          csrfTokenHash: expect.any(String),
        }),
      }),
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      { sub: 1, email: 'usuario@example.com', sid: 11 },
      { expiresIn: 900 },
    );
  });

  it('nao cria sucessora para duplicata recente do mesmo refresh', async () => {
    const refreshToken = 'refresh-recente';
    sessaoAutenticacao.findUnique.mockResolvedValue(
      criarSessaoPersistida(refreshToken, {
        revogadaEm: new Date(),
        revogacaoMotivo: 'ROTACAO',
        rotacionadaEm: new Date(),
      }),
    );

    await expect(
      service.renovarSessao(
        criarRequest({ [AUTH_REFRESH_COOKIE]: refreshToken }),
        criarResponse().response,
      ),
    ).rejects.toThrow(/Refresh/);

    expect(sessaoAutenticacao.updateMany).not.toHaveBeenCalled();
    expect(sessaoAutenticacao.create).not.toHaveBeenCalled();
  });

  it('revoga toda a familia quando refresh antigo e reutilizado', async () => {
    sessaoAutenticacao.findUnique.mockResolvedValue(
      criarSessaoPersistida('refresh-antigo', {
        revogadaEm: new Date(),
        revogacaoMotivo: 'ROTACAO',
        rotacionadaEm: new Date(Date.now() - 60_000),
      }),
    );

    await expect(
      service.renovarSessao(
        criarRequest({ [AUTH_REFRESH_COOKIE]: 'refresh-antigo' }),
        criarResponse().response,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(sessaoAutenticacao.updateMany).toHaveBeenCalledWith({
      where: { familiaId: 'familia-1', revogadaEm: null },
      data: {
        revogadaEm: expect.any(Date),
        revogacaoMotivo: 'REUSO_REFRESH',
      },
    });
  });

  it('rejeita refresh de conta inativa e revoga todas as sessoes', async () => {
    sessaoAutenticacao.findUnique.mockResolvedValue(
      criarSessaoPersistida('refresh-inativo', {
        usuario: {
          ...USUARIO_ATIVO,
          status: StatusContaUsuario.DESATIVADA,
        },
      }),
    );

    await expect(
      service.renovarSessao(
        criarRequest({ [AUTH_REFRESH_COOKIE]: 'refresh-inativo' }),
        criarResponse().response,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(sessaoAutenticacao.updateMany).toHaveBeenCalledWith({
      where: { usuarioId: 1, revogadaEm: null },
      data: {
        revogadaEm: expect.any(Date),
        revogacaoMotivo: 'CONTA_INATIVA',
      },
    });
  });

  it('logout revoga a familia atual e limpa cookies', async () => {
    sessaoAutenticacao.findUnique.mockResolvedValue({
      familiaId: 'familia-logout',
    });
    const { response, clearCookieMock } = criarResponse();

    await service.revogarSessao(
      criarRequest({ [AUTH_REFRESH_COOKIE]: 'refresh-logout' }),
      response,
    );

    expect(sessaoAutenticacao.updateMany).toHaveBeenCalledWith({
      where: { familiaId: 'familia-logout', revogadaEm: null },
      data: {
        revogadaEm: expect.any(Date),
        revogacaoMotivo: 'LOGOUT',
      },
    });
    expect(clearCookieMock).toHaveBeenCalledTimes(3);
  });

  it('valida access apenas para sessao ativa de usuario ativo e verificado', async () => {
    sessaoAutenticacao.findFirst.mockResolvedValue({ id: 10 });

    await expect(service.validarSessaoAccess(10, 1)).resolves.toBeUndefined();

    expect(sessaoAutenticacao.findFirst).toHaveBeenCalledWith({
      where: {
        id: 10,
        usuarioId: 1,
        revogadaEm: null,
        expiraEm: { gt: expect.any(Date) },
        usuario: {
          status: StatusContaUsuario.ATIVA,
          emailVerificadoEm: { not: null },
        },
      },
      select: { id: true },
    });
  });

  it('valida csrf pelo cookie, header, estado da conta e hash persistido', async () => {
    sessaoAutenticacao.findUnique.mockResolvedValue(
      criarSessaoPersistida('refresh-token', {
        csrfTokenHash: hashSegredoSessao('csrf-token'),
      }),
    );

    await expect(
      service.validarCsrf(
        criarRequest({
          [AUTH_REFRESH_COOKIE]: 'refresh-token',
          [AUTH_CSRF_COOKIE]: 'csrf-token',
        }),
        'csrf-token',
      ),
    ).resolves.toBe(true);
  });
});
