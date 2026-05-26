import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
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
  ) {
    return {
      cookies,
      ip,
      get: jest.fn((header: string) =>
        header.toLowerCase() === 'user-agent' ? 'vitest' : undefined,
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

  it('cria sessão, armazena hashes e emite cookies HttpOnly para access/refresh', async () => {
    sessaoAutenticacao.create.mockResolvedValue({ id: 10 });
    const { response, cookieMock } = criarResponse();

    await service.criarSessao(
      { id: 1, email: 'usuário@example.com' },
      true,
      criarRequest(),
      response,
    );

    expect(sessaoAutenticacao.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          usuarioId: 1,
          refreshTokenHash: expect.any(String),
          csrfTokenHash: expect.any(String),
          userAgent: 'vitest',
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

  it('rotaciona refresh criando nova sessão e revogando a anterior', async () => {
    const refreshToken = 'refresh-atual';
    sessaoAutenticacao.findUnique.mockResolvedValue({
      id: 10,
      usuarioId: 1,
      refreshTokenHash: hashSegredoSessao(refreshToken),
      csrfTokenHash: hashSegredoSessao('csrf-atual'),
      userAgent: 'vitest',
      ipHash: hashSegredoSessao('127.0.0.1'),
      expiraEm: new Date(Date.now() + 60_000),
      revogadaEm: null,
      revogacaoMotivo: null,
      rotacionadaEm: null,
      usuario: { id: 1, email: 'usuário@example.com' },
    });
    sessaoAutenticacao.create.mockResolvedValue({ id: 11 });

    await service.renovarSessao(
      criarRequest({ [AUTH_REFRESH_COOKIE]: refreshToken }),
      criarResponse().response,
    );

    expect(sessaoAutenticacao.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: expect.objectContaining({ revogadaEm: expect.any(Date) }),
    });
    expect(sessaoAutenticacao.update.mock.calls[0][0].data).toEqual(
      expect.objectContaining({
        revogacaoMotivo: 'ROTACAO',
        rotacionadaEm: expect.any(Date),
      }),
    );
    expect(sessaoAutenticacao.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          usuarioId: 1,
          refreshTokenHash: expect.any(String),
          csrfTokenHash: expect.any(String),
        }),
      }),
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      { sub: 1, email: 'usuário@example.com', sid: 11 },
      { expiresIn: 900 },
    );
  });

  it('revoga sessões ativas do usuário quando refresh antigo e reutilizado', async () => {
    sessaoAutenticacao.findUnique.mockResolvedValue({
      id: 10,
      usuarioId: 1,
      expiraEm: new Date(Date.now() + 60_000),
      revogadaEm: new Date(),
      revogacaoMotivo: 'ROTACAO',
      rotacionadaEm: new Date(Date.now() - 60_000),
      usuario: { id: 1, email: 'usuário@example.com' },
    });

    await expect(
      service.renovarSessao(
        criarRequest({ [AUTH_REFRESH_COOKIE]: 'refresh-antigo' }),
        criarResponse().response,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(sessaoAutenticacao.updateMany).toHaveBeenCalledWith({
      where: { usuarioId: 1, revogadaEm: null },
      data: {
        revogadaEm: expect.any(Date),
        revogacaoMotivo: 'REUSO_REFRESH',
      },
    });
  });

  it('aceita duplicata recente de refresh rotacionado sem revogar sessões', async () => {
    const refreshToken = 'refresh-recente';
    sessaoAutenticacao.findUnique.mockResolvedValue({
      id: 10,
      usuarioId: 1,
      refreshTokenHash: hashSegredoSessao(refreshToken),
      csrfTokenHash: hashSegredoSessao('csrf-atual'),
      userAgent: 'vitest',
      ipHash: hashSegredoSessao('127.0.0.1'),
      expiraEm: new Date(Date.now() + 60_000),
      revogadaEm: new Date(),
      revogacaoMotivo: 'ROTACAO',
      rotacionadaEm: new Date(),
      usuario: { id: 1, email: 'usuário@example.com' },
    });
    sessaoAutenticacao.create.mockResolvedValue({ id: 12 });

    await service.renovarSessao(
      criarRequest({ [AUTH_REFRESH_COOKIE]: refreshToken }),
      criarResponse().response,
    );

    expect(sessaoAutenticacao.updateMany).not.toHaveBeenCalled();
    expect(sessaoAutenticacao.update).not.toHaveBeenCalled();
    expect(sessaoAutenticacao.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ usuarioId: 1 }),
      }),
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      { sub: 1, email: 'usuário@example.com', sid: 12 },
      { expiresIn: 900 },
    );
  });

  it('aceita duplicata recente mesmo quando proxy muda o IP observado', async () => {
    const refreshToken = 'refresh-recente';
    sessaoAutenticacao.findUnique.mockResolvedValue({
      id: 10,
      usuarioId: 1,
      refreshTokenHash: hashSegredoSessao(refreshToken),
      csrfTokenHash: hashSegredoSessao('csrf-atual'),
      userAgent: 'vitest',
      ipHash: hashSegredoSessao('127.0.0.1'),
      expiraEm: new Date(Date.now() + 60_000),
      revogadaEm: new Date(),
      revogacaoMotivo: 'ROTACAO',
      rotacionadaEm: new Date(),
      usuario: { id: 1, email: 'usuário@example.com' },
    });
    sessaoAutenticacao.create.mockResolvedValue({ id: 12 });

    await service.renovarSessao(
      criarRequest({ [AUTH_REFRESH_COOKIE]: refreshToken }, '10.0.0.2'),
      criarResponse().response,
    );

    expect(sessaoAutenticacao.updateMany).not.toHaveBeenCalled();
    expect(sessaoAutenticacao.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ usuarioId: 1 }),
      }),
    );
  });

  it('valida csrf pelo cookie, header e hash persistido', async () => {
    sessaoAutenticacao.findFirst.mockResolvedValue({
      csrfTokenHash: hashSegredoSessao('csrf-token'),
    });
    sessaoAutenticacao.findUnique.mockResolvedValue({
      csrfTokenHash: hashSegredoSessao('csrf-token'),
      expiraEm: new Date(Date.now() + 60_000),
      revogadaEm: null,
    });

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
