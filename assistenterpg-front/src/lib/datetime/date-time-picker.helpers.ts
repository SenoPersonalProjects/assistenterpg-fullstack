export type CalendarDayCell = {
  key: string;
  dateValue: string | null;
  dayNumber: number | null;
};

const DATE_TIME_LOCAL_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
const DATE_VALUE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_VALUE_PATTERN = /^(\d{2}):(\d{2})$/;

export function parseDateTimeLocalValue(value: string): Date | null {
  const match = DATE_TIME_LOCAL_PATTERN.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    0,
    0,
  );
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day) ||
    date.getHours() !== Number(hour) ||
    date.getMinutes() !== Number(minute)
  ) {
    return null;
  }
  return date;
}

export function parseDateValue(value: string): Date | null {
  const match = DATE_VALUE_PATTERN.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0);
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }
  return date;
}

export function dateToDateValue(date: Date): string {
  return [
    date.getFullYear(),
    pad2(date.getMonth() + 1),
    pad2(date.getDate()),
  ].join('-');
}

export function dateToTimeValue(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function dateToDateTimeLocalValue(date: Date): string {
  return `${dateToDateValue(date)}T${dateToTimeValue(date)}`;
}

export function splitDateTimeLocalValue(value: string): {
  dateValue: string;
  timeValue: string;
} | null {
  const date = parseDateTimeLocalValue(value);
  if (!date) return null;
  return {
    dateValue: dateToDateValue(date),
    timeValue: dateToTimeValue(date),
  };
}

export function formatarDateTimePickerValue(value: string): string {
  const date = parseDateTimeLocalValue(value);
  if (!date) return 'Selecione data e hora';
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()} às ${dateToTimeValue(date)}`;
}

export function gerarDiasCalendarioMes(
  year: number,
  monthIndex: number,
): CalendarDayCell[] {
  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: CalendarDayCell[] = [];

  for (let index = 0; index < firstDay.getDay(); index += 1) {
    cells.push({
      key: `empty-start-${year}-${monthIndex}-${index}`,
      dateValue: null,
      dayNumber: null,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, monthIndex, day);
    cells.push({
      key: dateToDateValue(date),
      dateValue: dateToDateValue(date),
      dayNumber: day,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      key: `empty-end-${year}-${monthIndex}-${cells.length}`,
      dateValue: null,
      dayNumber: null,
    });
  }

  return cells;
}

export function gerarHorariosDia(minuteStep = 30): string[] {
  const step = normalizarMinuteStep(minuteStep);
  const slots: string[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += step) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    slots.push(`${pad2(hour)}:${pad2(minute)}`);
  }
  return slots;
}

export function montarDateTimeLocalValue(
  dateValue: string,
  timeValue: string,
): string {
  if (!parseDateValue(dateValue) || !TIME_VALUE_PATTERN.test(timeValue)) {
    throw new Error('Data ou horário inválido.');
  }
  return `${dateValue}T${timeValue}`;
}

export function arredondarParaProximoBloco(
  date: Date,
  minuteStep = 30,
): Date {
  const step = normalizarMinuteStep(minuteStep);
  const rounded = new Date(date);
  rounded.setSeconds(0, 0);
  const remainder = rounded.getMinutes() % step;
  if (remainder > 0) {
    rounded.setMinutes(rounded.getMinutes() + (step - remainder));
  }
  return rounded;
}

export function resolverProximoInicioPermitido(
  now: Date,
  minuteStep = 30,
  minDateTime?: string,
): string {
  const roundedNow = arredondarParaProximoBloco(now, minuteStep);
  const minDate = minDateTime ? parseDateTimeLocalValue(minDateTime) : null;
  const base =
    minDate && minDate.getTime() > roundedNow.getTime() ? minDate : roundedNow;
  return dateToDateTimeLocalValue(arredondarParaProximoBloco(base, minuteStep));
}

export function isDateTimeBeforeMin(
  dateTimeValue: string,
  minDateTime?: string,
): boolean {
  if (!minDateTime) return false;
  const valueDate = parseDateTimeLocalValue(dateTimeValue);
  const minDate = parseDateTimeLocalValue(minDateTime);
  if (!valueDate || !minDate) return false;
  return valueDate.getTime() < minDate.getTime();
}

export function isDateBeforeMinDateTime(
  dateValue: string,
  minDateTime?: string,
): boolean {
  if (!minDateTime) return false;
  const date = parseDateValue(dateValue);
  const minDate = parseDateTimeLocalValue(minDateTime);
  if (!date || !minDate) return false;
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.getTime() < minDate.getTime();
}

function normalizarMinuteStep(minuteStep: number): number {
  return Number.isInteger(minuteStep) && minuteStep > 0 && minuteStep <= 60
    ? minuteStep
    : 30;
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}
