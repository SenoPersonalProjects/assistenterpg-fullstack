import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, type calendar_v3 } from 'googleapis';
import { PrismaService } from 'src/prisma/prisma.service';
import { GOOGLE_CALENDAR_EVENTS_SCOPE } from './google-oauth.service';
import { GoogleTokenCryptoService } from './google-token-crypto.service';

export type GoogleCalendarEventInput = {
  usuarioId: number;
  agendamentoId: number;
  titulo: string;
  descricao?: string | null;
  inicioEm: Date;
  fimEm: Date;
  timezone: string;
  attendees: string[];
  adicionarGoogleMeet: boolean;
};

export type GoogleCalendarEventResult = {
  eventId: string | null;
  htmlLink: string | null;
  iCalUID: string | null;
  meetLink: string | null;
};

export type GoogleCalendarConflict = {
  id: string | null;
  titulo: string;
  inicioEm: string | null;
  fimEm: string | null;
  htmlLink: string | null;
};

@Injectable()
export class GoogleCalendarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly tokenCrypto: GoogleTokenCryptoService,
  ) {}

  async criarEvento(
    input: GoogleCalendarEventInput,
  ): Promise<GoogleCalendarEventResult> {
    const calendar = await this.criarCalendarClient(input.usuarioId);
    const response = await calendar.events.insert({
      calendarId: 'primary',
      sendUpdates: 'all',
      conferenceDataVersion: input.adicionarGoogleMeet ? 1 : 0,
      requestBody: this.montarEvento(input),
    });
    return this.mapearEvento(response.data);
  }

  async atualizarEvento(
    eventId: string,
    input: GoogleCalendarEventInput,
  ): Promise<GoogleCalendarEventResult> {
    const calendar = await this.criarCalendarClient(input.usuarioId);
    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all',
      conferenceDataVersion: input.adicionarGoogleMeet ? 1 : 0,
      requestBody: this.montarEvento(input),
    });
    return this.mapearEvento(response.data);
  }

  async cancelarEvento(usuarioId: number, eventId: string): Promise<void> {
    const calendar = await this.criarCalendarClient(usuarioId);
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all',
    });
  }

  async possuiAutorizacaoCalendar(usuarioId: number): Promise<boolean> {
    const credencial = await this.prisma.usuarioGoogleCredencial.findUnique({
      where: { usuarioId },
      select: {
        refreshTokenCriptografado: true,
        calendarAutorizadoEm: true,
        revogadoEm: true,
        scopes: true,
      },
    });

    return this.credencialPodeUsarCalendar(credencial);
  }

  async listarConflitos(
    usuarioId: number,
    inicioEm: Date,
    fimEm: Date,
  ): Promise<GoogleCalendarConflict[]> {
    const calendar = await this.criarCalendarClient(usuarioId);
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: inicioEm.toISOString(),
      timeMax: fimEm.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      // Preview leve para o modal de agendamento; não é auditoria completa da agenda.
      maxResults: 20,
    });

    return (response.data.items ?? [])
      .filter((evento) => evento.status !== 'cancelled')
      .map((evento) => ({
        id: evento.id ?? null,
        titulo: evento.summary ?? 'Evento sem t\u00edtulo',
        inicioEm: evento.start?.dateTime ?? evento.start?.date ?? null,
        fimEm: evento.end?.dateTime ?? evento.end?.date ?? null,
        htmlLink: evento.htmlLink ?? null,
      }));
  }

  private async criarCalendarClient(
    usuarioId: number,
  ): Promise<calendar_v3.Calendar> {
    const credencial = await this.prisma.usuarioGoogleCredencial.findUnique({
      where: { usuarioId },
      select: {
        refreshTokenCriptografado: true,
        calendarAutorizadoEm: true,
        revogadoEm: true,
        scopes: true,
      },
    });

    if (!this.credencialPodeUsarCalendar(credencial)) {
      throw new BadRequestException({
        code: 'GOOGLE_CALENDAR_NOT_CONNECTED',
        message: 'Conecte o Google Calendar antes de sincronizar eventos.',
      });
    }

    const client = new google.auth.OAuth2(
      this.obterConfigObrigatoria('GOOGLE_OAUTH_CLIENT_ID'),
      this.obterConfigObrigatoria('GOOGLE_OAUTH_CLIENT_SECRET'),
      this.obterConfigObrigatoria('GOOGLE_OAUTH_CALLBACK_URL'),
    );
    client.setCredentials({
      refresh_token: this.tokenCrypto.decrypt(
        credencial.refreshTokenCriptografado,
      ),
    });

    return google.calendar({ version: 'v3', auth: client });
  }

  private credencialPodeUsarCalendar(
    credencial: {
      refreshTokenCriptografado: string | null;
      calendarAutorizadoEm: Date | null;
      revogadoEm: Date | null;
      scopes: unknown;
    } | null,
  ): credencial is {
    refreshTokenCriptografado: string;
    calendarAutorizadoEm: Date;
    revogadoEm: null;
    scopes: unknown;
  } {
    const scopes = Array.isArray(credencial?.scopes)
      ? credencial.scopes.filter(
          (scope): scope is string => typeof scope === 'string',
        )
      : [];
    return Boolean(
      credencial?.refreshTokenCriptografado &&
      credencial.calendarAutorizadoEm &&
      !credencial.revogadoEm &&
      scopes.includes(GOOGLE_CALENDAR_EVENTS_SCOPE),
    );
  }

  private montarEvento(
    input: GoogleCalendarEventInput,
  ): calendar_v3.Schema$Event {
    const attendees = [
      ...new Set(input.attendees.map((email) => email.trim().toLowerCase())),
    ]
      .filter(Boolean)
      .map((email) => ({ email }));

    return {
      summary: input.titulo,
      description: input.descricao ?? undefined,
      start: {
        dateTime: input.inicioEm.toISOString(),
        timeZone: input.timezone,
      },
      end: {
        dateTime: input.fimEm.toISOString(),
        timeZone: input.timezone,
      },
      attendees,
      ...(input.adicionarGoogleMeet
        ? {
            conferenceData: {
              createRequest: {
                requestId: `assistenterpg-agendamento-${input.agendamentoId}`,
              },
            },
          }
        : {}),
    };
  }

  private mapearEvento(
    evento: calendar_v3.Schema$Event,
  ): GoogleCalendarEventResult {
    return {
      eventId: evento.id ?? null,
      htmlLink: evento.htmlLink ?? null,
      iCalUID: evento.iCalUID ?? null,
      meetLink:
        evento.hangoutLink ??
        evento.conferenceData?.entryPoints?.find(
          (entry) => entry.entryPointType === 'video',
        )?.uri ??
        null,
    };
  }

  private obterConfigObrigatoria(key: string): string {
    const value = this.configService.get<string>(key)?.trim();
    if (!value) {
      throw new BadRequestException({
        code: 'GOOGLE_OAUTH_CONFIG_MISSING',
        message: `Configuração ${key} ausente.`,
      });
    }
    return value;
  }
}
