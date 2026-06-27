import type { GoogleIntegrationStatus } from '@/lib/api/usuarios';

export type GoogleCalendarPrimaryAction =
  | 'connect-google'
  | 'authorize-calendar'
  | 'reauthorize-calendar'
  | 'deauthorize-calendar'
  | 'none';

export function resolverAcaoPrincipalGoogleCalendar(
  status: GoogleIntegrationStatus | null,
): GoogleCalendarPrimaryAction {
  if (!status?.googleOAuthEnabled) return 'none';
  if (!status.conectado) return 'connect-google';
  if (status.calendarAutorizado) return 'deauthorize-calendar';
  if (status.precisaReautorizarCalendar || status.calendarErro) {
    return 'reauthorize-calendar';
  }
  return 'authorize-calendar';
}

export function obterMensagemStatusCalendar(
  status: GoogleIntegrationStatus | null,
): string {
  if (!status?.conectado) return 'Calendar indispon\u00edvel';
  if (status.calendarAutorizado) return 'Calendar autorizado';
  if (status.precisaReautorizarCalendar || status.calendarErro) {
    return 'Calendar precisa reconectar';
  }
  return 'Calendar pendente';
}
