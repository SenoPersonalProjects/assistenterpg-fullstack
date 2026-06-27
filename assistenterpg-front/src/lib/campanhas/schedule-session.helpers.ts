import type {
  CriarSessaoAgendadaPayload,
  SessaoAgendadaResumo,
} from '@/lib/types';

export const DEFAULT_SESSION_DURATION_MINUTES = 120;
export const CUSTOM_DURATION_VALUE = 'custom';

export const SESSION_DURATION_OPTIONS = [
  { label: '1h', value: 60 },
  { label: '1h30', value: 90 },
  { label: '2h', value: 120 },
  { label: '2h30', value: 150 },
  { label: '3h', value: 180 },
  { label: '4h', value: 240 },
] as const;

export type ScheduleSessionFormState = {
  titulo: string;
  descricao: string;
  inicioLocal: string;
  duracaoMinutos: number;
  duracaoPreset: string;
  timezone: string;
  timezoneFallback: boolean;
  adicionarAoGoogleCalendar: boolean;
  adicionarGoogleMeet: boolean;
};

export type ScheduleConflictQueryInput = {
  inicioLocal: string;
  duracaoMinutos: number;
  timezone: string;
  incluirGoogle: boolean;
};

export type ScheduleConflictQuery = {
  inicioEm: string;
  fimEm: string;
  timezone: string;
  incluirGoogle: boolean;
};

const SCHEDULE_DRAFT_VERSION = 1;

export function detectarTimezone(
  resolver: () => string | undefined = () =>
    Intl.DateTimeFormat().resolvedOptions().timeZone,
): {
  timezone: string;
  timezoneFallback: boolean;
} {
  try {
    const timezone = resolver();
    if (timezone) return { timezone, timezoneFallback: false };
  } catch {
    // Sem uma biblioteca de timezone, o fallback informa a referencia enviada ao backend.
  }
  return { timezone: 'America/Fortaleza', timezoneFallback: true };
}

export function agoraLocalInput(): string {
  const date = new Date(Date.now() + 60 * 60_000);
  date.setMinutes(0, 0, 0);
  return dateToDateTimeLocal(date);
}

export function dateToDateTimeLocal(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function isoToDateTimeLocal(iso: string): string {
  return dateToDateTimeLocal(new Date(iso));
}

export function resolverDuracaoPreset(duracaoMinutos: number): string {
  return SESSION_DURATION_OPTIONS.some((option) => option.value === duracaoMinutos)
    ? String(duracaoMinutos)
    : CUSTOM_DURATION_VALUE;
}

export function calcularDuracaoMinutos(inicioIso: string, fimIso: string): number {
  const duracao = Math.round(
    (new Date(fimIso).getTime() - new Date(inicioIso).getTime()) / 60_000,
  );
  return Math.max(15, duracao);
}

export function criarFormAgendamentoPadrao(): ScheduleSessionFormState {
  const timezone = detectarTimezone();
  return {
    titulo: '',
    descricao: '',
    inicioLocal: agoraLocalInput(),
    duracaoMinutos: DEFAULT_SESSION_DURATION_MINUTES,
    duracaoPreset: String(DEFAULT_SESSION_DURATION_MINUTES),
    timezone: timezone.timezone,
    timezoneFallback: timezone.timezoneFallback,
    adicionarAoGoogleCalendar: false,
    adicionarGoogleMeet: false,
  };
}

export function criarFormAgendamentoEdicao(
  agendamento: SessaoAgendadaResumo,
): ScheduleSessionFormState {
  const duracaoMinutos = calcularDuracaoMinutos(
    agendamento.inicioEm,
    agendamento.fimEm,
  );
  return {
    titulo: agendamento.titulo,
    descricao: agendamento.descricao ?? '',
    inicioLocal: isoToDateTimeLocal(agendamento.inicioEm),
    duracaoMinutos,
    duracaoPreset: resolverDuracaoPreset(duracaoMinutos),
    timezone: agendamento.timezone,
    timezoneFallback: false,
    adicionarAoGoogleCalendar: agendamento.adicionarAoGoogleCalendar,
    adicionarGoogleMeet: agendamento.adicionarGoogleMeet,
  };
}

export function calcularIntervaloAgendamento(form: ScheduleSessionFormState): {
  inicioEm: string;
  fimEm: string;
} {
  const inicio = new Date(form.inicioLocal);
  const fim = new Date(
    inicio.getTime() + form.duracaoMinutos * 60_000,
  );
  return {
    inicioEm: inicio.toISOString(),
    fimEm: fim.toISOString(),
  };
}

export function criarConsultaConflitosAgendamento(
  input: ScheduleConflictQueryInput,
): ScheduleConflictQuery {
  const inicio = new Date(input.inicioLocal);
  const fim = new Date(inicio.getTime() + input.duracaoMinutos * 60_000);
  return {
    inicioEm: inicio.toISOString(),
    fimEm: fim.toISOString(),
    timezone: input.timezone,
    incluirGoogle: input.incluirGoogle,
  };
}

export function criarPayloadAgendamento(
  form: ScheduleSessionFormState,
): CriarSessaoAgendadaPayload {
  const intervalo = calcularIntervaloAgendamento(form);
  return {
    titulo: form.titulo.trim(),
    descricao: form.descricao.trim() || undefined,
    inicioEm: intervalo.inicioEm,
    duracaoMinutos: form.duracaoMinutos,
    timezone: form.timezone,
    adicionarAoGoogleCalendar: form.adicionarAoGoogleCalendar,
    adicionarGoogleMeet:
      form.adicionarAoGoogleCalendar && form.adicionarGoogleMeet,
  };
}

export function duracaoCustomizadaValida(duracaoMinutos: number): boolean {
  return (
    Number.isInteger(duracaoMinutos) &&
    duracaoMinutos >= 15 &&
    duracaoMinutos <= 24 * 60
  );
}

export function chaveRascunhoAgendamento(campanhaId: number): string {
  return `assistenterpg:sessao-agendada:${campanhaId}`;
}

export function serializarRascunhoAgendamento(
  form: ScheduleSessionFormState,
): string {
  return JSON.stringify({
    version: SCHEDULE_DRAFT_VERSION,
    form,
  });
}

export function restaurarRascunhoAgendamento(
  raw: string | null,
): ScheduleSessionFormState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || parsed.version !== SCHEDULE_DRAFT_VERSION) {
      return null;
    }
    const form = parsed.form;
    if (!isScheduleSessionFormState(form)) return null;
    return form;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isScheduleSessionFormState(
  value: unknown,
): value is ScheduleSessionFormState {
  if (!isRecord(value)) return false;
  return (
    typeof value.titulo === 'string' &&
    typeof value.descricao === 'string' &&
    typeof value.inicioLocal === 'string' &&
    typeof value.duracaoMinutos === 'number' &&
    typeof value.duracaoPreset === 'string' &&
    typeof value.timezone === 'string' &&
    typeof value.timezoneFallback === 'boolean' &&
    typeof value.adicionarAoGoogleCalendar === 'boolean' &&
    typeof value.adicionarGoogleMeet === 'boolean'
  );
}
