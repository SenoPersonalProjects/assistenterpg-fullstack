import { describe, expect, it } from 'vitest';
import {
  arredondarParaProximoBloco,
  formatarDateTimePickerValue,
  gerarDiasCalendarioMes,
  gerarHorariosDia,
  isDateBeforeMinDateTime,
  isDateTimeBeforeMin,
  montarDateTimeLocalValue,
  resolverProximoInicioPermitido,
  splitDateTimeLocalValue,
} from './date-time-picker.helpers';

describe('date-time-picker helpers', () => {
  it('formata data e hora local para exibicao amigavel', () => {
    expect(formatarDateTimePickerValue('2026-06-27T16:00')).toBe(
      '27/06/2026 às 16:00',
    );
    expect(formatarDateTimePickerValue('valor-invalido')).toBe(
      'Selecione data e hora',
    );
  });

  it('gera dias do mes com espacos vazios da primeira semana', () => {
    const dias = gerarDiasCalendarioMes(2026, 5);

    expect(dias).toHaveLength(35);
    expect(dias[0]).toEqual(
      expect.objectContaining({ dateValue: null, dayNumber: null }),
    );
    expect(dias[1]).toEqual(
      expect.objectContaining({ dateValue: '2026-06-01', dayNumber: 1 }),
    );
    expect(dias[30]).toEqual(
      expect.objectContaining({ dateValue: '2026-06-30', dayNumber: 30 }),
    );
  });

  it('gera horarios do dia no intervalo configurado', () => {
    const horarios = gerarHorariosDia(30);

    expect(horarios[0]).toBe('00:00');
    expect(horarios[1]).toBe('00:30');
    expect(horarios.at(-1)).toBe('23:30');
    expect(horarios).toHaveLength(48);
  });

  it('monta e separa o valor local preservando formato atual', () => {
    const value = montarDateTimeLocalValue('2026-06-27', '16:00');

    expect(value).toBe('2026-06-27T16:00');
    expect(splitDateTimeLocalValue(value)).toEqual({
      dateValue: '2026-06-27',
      timeValue: '16:00',
    });
    expect(() => montarDateTimeLocalValue('2026-13-27', '16:00')).toThrow();
  });

  it('arredonda horario inicial para o proximo bloco de 30 minutos', () => {
    expect(
      arredondarParaProximoBloco(new Date(2026, 5, 27, 16, 10), 30).getMinutes(),
    ).toBe(30);
    expect(
      arredondarParaProximoBloco(new Date(2026, 5, 27, 16, 30), 30).getMinutes(),
    ).toBe(30);
    expect(
      resolverProximoInicioPermitido(
        new Date(2026, 5, 27, 16, 10),
        30,
        '2026-06-27T17:20',
      ),
    ).toBe('2026-06-27T17:30');
  });

  it('identifica datas e horarios antes do minimo permitido', () => {
    const min = '2026-06-27T16:00';

    expect(isDateBeforeMinDateTime('2026-06-26', min)).toBe(true);
    expect(isDateBeforeMinDateTime('2026-06-27', min)).toBe(false);
    expect(isDateTimeBeforeMin('2026-06-27T15:30', min)).toBe(true);
    expect(isDateTimeBeforeMin('2026-06-27T16:00', min)).toBe(false);
  });
});
