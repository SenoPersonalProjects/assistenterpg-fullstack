import {
  erroGoogleExigeReautorizacao,
  GOOGLE_CALENDAR_REAUTH_REQUIRED_MESSAGE,
  GoogleCalendarReauthRequiredError,
} from './google-calendar-error';

describe('google-calendar-error', () => {
  it.each([
    {
      response: {
        status: 400,
        data: { error: 'invalid_grant', error_description: 'Bad Request' },
      },
    },
    { code: 'invalid_grant', message: 'Token has been expired or revoked.' },
    {
      response: {
        status: 401,
        data: {
          error: {
            code: 401,
            message: 'Invalid Credentials',
            status: 'UNAUTHENTICATED',
          },
        },
      },
    },
    {
      response: {
        status: 401,
        data: { error: { errors: [{ reason: 'authError' }] } },
      },
    },
  ])('reconhece erro que exige nova autoriza\u00e7\u00e3o', (error) => {
    expect(erroGoogleExigeReautorizacao(error)).toBe(true);
  });

  it.each([
    { response: { status: 400, data: { error: 'timeRangeEmpty' } } },
    { response: { status: 403, data: { error: 'rateLimitExceeded' } } },
    new Error('Falha tempor\u00e1ria de rede'),
  ])('n\u00e3o invalida credencial por erro operacional', (error) => {
    expect(erroGoogleExigeReautorizacao(error)).toBe(false);
  });

  it('fornece mensagem segura e acion\u00e1vel', () => {
    expect(new GoogleCalendarReauthRequiredError().message).toBe(
      GOOGLE_CALENDAR_REAUTH_REQUIRED_MESSAGE,
    );
  });
});
