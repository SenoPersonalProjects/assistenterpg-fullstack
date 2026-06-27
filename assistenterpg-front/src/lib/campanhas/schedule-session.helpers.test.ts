import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_SESSION_DURATION_MINUTES,
  CUSTOM_DURATION_VALUE,
  SCHEDULE_SESSION_INVALID_DURATION_MESSAGE,
  SCHEDULE_SESSION_INVALID_START_MESSAGE,
  chaveRascunhoAgendamento,
  criarConsultaConflitosAgendamento,
  criarFormAgendamentoPadrao,
  criarPayloadAgendamento,
  detectarTimezone,
  duracaoCustomizadaValida,
  restaurarRascunhoAgendamento,
  resolverDuracaoPreset,
  serializarRascunhoAgendamento,
} from './schedule-session.helpers';

const FORM_BASE = {
  titulo: 'Missao',
  descricao: '',
  inicioLocal: '2030-01-01T20:00',
  duracaoMinutos: 120,
  duracaoPreset: '120',
  timezone: 'America/Fortaleza',
  timezoneFallback: false,
  adicionarAoGoogleCalendar: false,
  adicionarGoogleMeet: false,
};

describe('schedule session helpers', () => {
  it('cria formulario padrao com duracao de 2 horas', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:10:00.000Z'));

    const form = criarFormAgendamentoPadrao();

    expect(form.duracaoMinutos).toBe(DEFAULT_SESSION_DURATION_MINUTES);
    expect(form.duracaoPreset).toBe(String(DEFAULT_SESSION_DURATION_MINUTES));

    vi.useRealTimers();
  });

  it('monta payload com timezone detectado e duracao em minutos', () => {
    const payload = criarPayloadAgendamento({
      ...FORM_BASE,
      titulo: '  Missao de Kyoto  ',
      descricao: '  briefing  ',
      adicionarAoGoogleCalendar: true,
      adicionarGoogleMeet: true,
    });

    expect(payload).toEqual(
      expect.objectContaining({
        titulo: 'Missao de Kyoto',
        descricao: 'briefing',
        duracaoMinutos: 120,
        timezone: 'America/Fortaleza',
        adicionarAoGoogleCalendar: true,
        adicionarGoogleMeet: false,
      }),
    );
  });

  it('rejeita inicio vazio com erro controlado', () => {
    let error: unknown;

    try {
      criarPayloadAgendamento({ ...FORM_BASE, inicioLocal: '' });
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(RangeError);
    expect((error as Error).message).toBe(SCHEDULE_SESSION_INVALID_START_MESSAGE);
  });

  it('rejeita inicio invalido com erro controlado', () => {
    expect(() =>
      criarConsultaConflitosAgendamento({
        inicioLocal: 'data-quebrada',
        duracaoMinutos: 120,
        timezone: 'America/Fortaleza',
        incluirGoogle: false,
      }),
    ).toThrow(SCHEDULE_SESSION_INVALID_START_MESSAGE);
  });

  it('rejeita duracao invalida antes de montar intervalo', () => {
    expect(() =>
      criarPayloadAgendamento({ ...FORM_BASE, duracaoMinutos: 0 }),
    ).toThrow(SCHEDULE_SESSION_INVALID_DURATION_MESSAGE);
  });

  it('resolve duracao personalizada e valida limites', () => {
    expect(resolverDuracaoPreset(95)).toBe(CUSTOM_DURATION_VALUE);
    expect(duracaoCustomizadaValida(15)).toBe(true);
    expect(duracaoCustomizadaValida(24 * 60)).toBe(true);
    expect(duracaoCustomizadaValida(14)).toBe(false);
    expect(duracaoCustomizadaValida(24 * 60 + 1)).toBe(false);
  });

  it('monta consulta de conflitos apenas com campos de intervalo e Google', () => {
    const consulta = criarConsultaConflitosAgendamento({
      inicioLocal: '2030-01-01T20:00',
      duracaoMinutos: 120,
      timezone: 'America/Fortaleza',
      incluirGoogle: true,
    });

    expect(consulta).toEqual(
      expect.objectContaining({
        timezone: 'America/Fortaleza',
        incluirGoogle: true,
      }),
    );
    expect(Object.keys(consulta)).not.toContain('titulo');
    expect(Object.keys(consulta)).not.toContain('descricao');
  });

  it('serializa e restaura rascunho sem dados sensiveis', () => {
    const form = {
      titulo: 'Missao',
      descricao: 'Notas',
      inicioLocal: '2030-01-01T20:00',
      duracaoMinutos: 120,
      duracaoPreset: '120',
      timezone: 'America/Fortaleza',
      timezoneFallback: false,
      adicionarAoGoogleCalendar: true,
      adicionarGoogleMeet: false,
    };

    const raw = serializarRascunhoAgendamento(form);

    expect(chaveRascunhoAgendamento(7)).toBe(
      'assistenterpg:sessao-agendada:7',
    );
    expect(raw).not.toContain('token');
    expect(restaurarRascunhoAgendamento(raw)).toEqual(form);
    expect(restaurarRascunhoAgendamento('{"version":0}')).toBeNull();
    expect(restaurarRascunhoAgendamento('invalido')).toBeNull();
  });

  it('marca fallback quando timezone nao pode ser detectado', () => {
    expect(detectarTimezone(() => undefined)).toEqual({
      timezone: 'America/Fortaleza',
      timezoneFallback: true,
    });
    expect(
      detectarTimezone(() => {
        throw new Error('sem Intl');
      }),
    ).toEqual({
      timezone: 'America/Fortaleza',
      timezoneFallback: true,
    });
  });
});
