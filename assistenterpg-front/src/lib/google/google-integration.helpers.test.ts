import { describe, expect, it } from 'vitest';
import type { GoogleIntegrationStatus } from '@/lib/api/usuarios';
import {
  obterMensagemStatusCalendar,
  resolverAcaoPrincipalGoogleCalendar,
} from './google-integration.helpers';

const baseStatus: GoogleIntegrationStatus = {
  conectado: true,
  email: 'mestre@gmail.com',
  nome: 'Mestre',
  avatarUrl: null,
  emailVerificado: true,
  ultimoLoginEm: null,
  atualizadoEm: null,
  calendarAutorizado: false,
  calendarAutorizadoEm: null,
  calendarScopes: [],
  calendarErro: null,
  precisaReautorizarCalendar: false,
  ultimoErro: null,
  scopes: [],
  googleOAuthEnabled: true,
};

describe('google integration helpers', () => {
  it('mostra conectar Google quando ainda não há vínculo', () => {
    expect(
      resolverAcaoPrincipalGoogleCalendar({
        ...baseStatus,
        conectado: false,
      }),
    ).toBe('connect-google');
  });

  it('esconde autorizar e mostra desautorizar quando Calendar está autorizado', () => {
    const status = {
      ...baseStatus,
      calendarAutorizado: true,
      calendarAutorizadoEm: '2026-01-01T00:00:00.000Z',
    };

    expect(resolverAcaoPrincipalGoogleCalendar(status)).toBe(
      'deauthorize-calendar',
    );
    expect(obterMensagemStatusCalendar(status)).toBe('Calendar autorizado');
  });

  it('mostra reautorizar quando Calendar precisa reconectar', () => {
    const status = {
      ...baseStatus,
      precisaReautorizarCalendar: true,
      calendarErro: 'token revogado',
    };

    expect(resolverAcaoPrincipalGoogleCalendar(status)).toBe(
      'reauthorize-calendar',
    );
    expect(obterMensagemStatusCalendar(status)).toBe(
      'Calendar precisa reconectar',
    );
  });
});
