import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { PrismaService } from 'src/prisma/prisma.service';
import { GoogleCalendarService } from './google-calendar.service';
import { GOOGLE_CALENDAR_REAUTH_REQUIRED_MESSAGE } from './google-calendar-error';
import { GoogleTokenCryptoService } from './google-token-crypto.service';

jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        setCredentials: jest.fn(),
      })),
    },
    calendar: jest.fn(),
  },
}));

describe('GoogleCalendarService', () => {
  const eventsInsert = jest.fn();
  const prisma = {
    usuarioGoogleCredencial: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
  };
  const config = {
    get: jest.fn((key: string) => `${key}-value`),
  };
  const crypto = {
    decrypt: jest.fn(() => 'refresh-token'),
  };
  let service: GoogleCalendarService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.usuarioGoogleCredencial.findUnique.mockResolvedValue({
      refreshTokenCriptografado: 'encrypted-refresh-token',
      calendarAutorizadoEm: new Date('2026-06-26T00:00:00.000Z'),
      revogadoEm: null,
      scopes: ['https://www.googleapis.com/auth/calendar.events'],
    });
    (google.calendar as jest.Mock).mockReturnValue({
      events: { insert: eventsInsert },
    });
    service = new GoogleCalendarService(
      prisma as unknown as PrismaService,
      config as unknown as ConfigService,
      crypto as unknown as GoogleTokenCryptoService,
    );
  });

  it('marca reautoriza\u00e7\u00e3o quando refresh token expirou', async () => {
    eventsInsert.mockRejectedValue({
      response: {
        status: 400,
        data: { error: 'invalid_grant', error_description: 'Bad Request' },
      },
    });

    await expect(service.criarEvento(criarInput())).rejects.toThrow(
      GOOGLE_CALENDAR_REAUTH_REQUIRED_MESSAGE,
    );

    expect(prisma.usuarioGoogleCredencial.updateMany).toHaveBeenCalledWith({
      where: { usuarioId: 10 },
      data: {
        refreshTokenCriptografado: null,
        accessTokenCriptografado: null,
        accessTokenExpiraEm: null,
        revogadoEm: expect.any(Date),
        ultimoErro: GOOGLE_CALENDAR_REAUTH_REQUIRED_MESSAGE,
      },
    });
  });

  it('preserva credencial quando Google rejeita o payload', async () => {
    const error = {
      response: {
        status: 400,
        data: { error: { message: 'The specified time range is empty.' } },
      },
    };
    eventsInsert.mockRejectedValue(error);

    await expect(service.criarEvento(criarInput())).rejects.toBe(error);
    expect(prisma.usuarioGoogleCredencial.updateMany).not.toHaveBeenCalled();
  });
});

function criarInput() {
  return {
    usuarioId: 10,
    agendamentoId: 20,
    titulo: 'Sess\u00e3o teste',
    inicioEm: new Date('2030-01-01T20:00:00.000Z'),
    fimEm: new Date('2030-01-01T22:00:00.000Z'),
    timezone: 'America/Fortaleza',
    attendees: [],
    adicionarGoogleMeet: false,
  };
}
