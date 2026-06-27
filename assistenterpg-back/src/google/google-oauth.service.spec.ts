import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  GOOGLE_CALENDAR_EVENTS_SCOPE,
  GoogleOAuthService,
} from './google-oauth.service';
import { GoogleTokenCryptoService } from './google-token-crypto.service';

type PrismaMock = {
  usuarioOAuthIdentidade: {
    findFirst: jest.Mock;
  };
  usuarioGoogleCredencial: {
    findUnique: jest.Mock;
    updateMany: jest.Mock;
  };
};

describe('GoogleOAuthService', () => {
  let prisma: PrismaMock;
  let service: GoogleOAuthService;
  let originalFetch: typeof global.fetch;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    originalFetch = global.fetch;
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true }) as unknown as typeof fetch;
    prisma = {
      usuarioOAuthIdentidade: {
        findFirst: jest.fn(),
      },
      usuarioGoogleCredencial: {
        findUnique: jest.fn(),
        updateMany: jest.fn(),
      },
    };
    service = new GoogleOAuthService(
      prisma as unknown as PrismaService,
      {
        get: jest.fn().mockReturnValue('true'),
      } as unknown as ConfigService,
      {
        decrypt: jest.fn().mockReturnValue('google-token'),
        encrypt: jest.fn(),
      } as unknown as GoogleTokenCryptoService,
    );
  });

  afterEach(() => {
    global.fetch = originalFetch;
    warnSpy.mockRestore();
  });

  it('marca Calendar autorizado somente com refresh token, scope e credencial ativa', async () => {
    prisma.usuarioOAuthIdentidade.findFirst.mockResolvedValue({
      email: 'mestre@gmail.com',
      nome: 'Mestre',
      avatarUrl: null,
      emailVerificado: true,
      ultimoLoginEm: null,
      atualizadoEm: new Date('2026-01-01T00:00:00.000Z'),
    });
    prisma.usuarioGoogleCredencial.findUnique.mockResolvedValue({
      refreshTokenCriptografado: 'token',
      calendarAutorizadoEm: new Date('2026-01-01T00:00:00.000Z'),
      revogadoEm: null,
      ultimoErro: null,
      scopes: ['openid', GOOGLE_CALENDAR_EVENTS_SCOPE],
    });

    const status = await service.obterStatus(10);

    expect(status.calendarAutorizado).toBe(true);
    expect(status.precisaReautorizarCalendar).toBe(false);
    expect(status.calendarScopes).toContain(GOOGLE_CALENDAR_EVENTS_SCOPE);
  });

  it('pede reautorizacao quando falta scope ou refresh token', async () => {
    prisma.usuarioOAuthIdentidade.findFirst.mockResolvedValue({
      email: 'mestre@gmail.com',
      nome: 'Mestre',
      avatarUrl: null,
      emailVerificado: true,
      ultimoLoginEm: null,
      atualizadoEm: null,
    });
    prisma.usuarioGoogleCredencial.findUnique.mockResolvedValue({
      refreshTokenCriptografado: null,
      calendarAutorizadoEm: new Date('2026-01-01T00:00:00.000Z'),
      revogadoEm: null,
      ultimoErro: 'token ausente',
      scopes: ['openid'],
    });

    const status = await service.obterStatus(10);

    expect(status.calendarAutorizado).toBe(false);
    expect(status.precisaReautorizarCalendar).toBe(true);
    expect(status.calendarErro).toBe('token ausente');
  });

  it('desautoriza Calendar sem remover identidade Google', async () => {
    prisma.usuarioGoogleCredencial.findUnique.mockResolvedValue({
      refreshTokenCriptografado: 'refresh-token',
      accessTokenCriptografado: 'access-token',
      scopes: ['openid', GOOGLE_CALENDAR_EVENTS_SCOPE, 'email'],
    });

    await service.desautorizarCalendar(10);

    expect(prisma.usuarioOAuthIdentidade.findFirst).not.toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      'https://oauth2.googleapis.com/revoke',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(prisma.usuarioGoogleCredencial.updateMany).toHaveBeenCalledWith({
      where: { usuarioId: 10 },
      data: expect.objectContaining({
        refreshTokenCriptografado: null,
        accessTokenCriptografado: null,
        calendarAutorizadoEm: null,
        scopes: ['openid', 'email'],
      }),
    });
  });

  it('limpa credencial local mesmo quando revoke remoto falha', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(
        new Error('falha de rede com google-token'),
      ) as unknown as typeof fetch;
    prisma.usuarioGoogleCredencial.findUnique.mockResolvedValue({
      refreshTokenCriptografado: 'refresh-token',
      accessTokenCriptografado: 'access-token',
      scopes: ['openid', GOOGLE_CALENDAR_EVENTS_SCOPE, 'email'],
    });

    const resposta = await service.desautorizarCalendar(10);

    expect(resposta.mensagem).not.toContain('google-token');
    expect(prisma.usuarioOAuthIdentidade.findFirst).not.toHaveBeenCalled();
    expect(prisma.usuarioGoogleCredencial.updateMany).toHaveBeenCalledWith({
      where: { usuarioId: 10 },
      data: expect.objectContaining({
        refreshTokenCriptografado: null,
        accessTokenCriptografado: null,
        calendarAutorizadoEm: null,
        scopes: ['openid', 'email'],
        ultimoErro: 'Falha ao revogar permiss\u00e3o no Google.',
      }),
    });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Falha ao revogar permiss\u00e3o Calendar'),
    );
    expect(warnSpy.mock.calls.flat().join(' ')).not.toContain('google-token');
  });
});
