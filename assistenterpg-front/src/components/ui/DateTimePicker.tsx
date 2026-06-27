'use client';

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { Icon } from '@/components/ui/Icon';
import {
  dateToDateValue,
  formatarDateTimePickerValue,
  gerarDiasCalendarioMes,
  gerarHorariosDia,
  isDateBeforeMinDateTime,
  isDateTimeBeforeMin,
  montarDateTimeLocalValue,
  parseDateTimeLocalValue,
  resolverProximoInicioPermitido,
  splitDateTimeLocalValue,
} from '@/lib/datetime/date-time-picker.helpers';

type DateTimePickerProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  minDateTime?: string;
  minuteStep?: number;
  allowClear?: boolean;
  className?: string;
};

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function DateTimePicker({
  label,
  value,
  onChange,
  disabled = false,
  error,
  helperText,
  minDateTime,
  minuteStep = 30,
  allowClear = false,
  className = '',
}: DateTimePickerProps) {
  const inputId = useId();
  const helperId = useId();
  const errorId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [pendingDate, setPendingDate] = useState('');
  const [pendingTime, setPendingTime] = useState('');
  const [visibleMonth, setVisibleMonth] = useState(() =>
    primeiroDiaMes(value ? parseDateTimeLocalValue(value) : new Date()),
  );

  const monthCells = useMemo(
    () => gerarDiasCalendarioMes(visibleMonth.getFullYear(), visibleMonth.getMonth()),
    [visibleMonth],
  );
  const timeSlots = useMemo(() => gerarHorariosDia(minuteStep), [minuteStep]);
  const describedBy = error ? errorId : helperText ? helperId : undefined;
  const displayValue = formatarDateTimePickerValue(value);
  const monthLabel = visibleMonth.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  const selectedDateTime =
    pendingDate && pendingTime
      ? montarDateTimeLocalValue(pendingDate, pendingTime)
      : '';
  const confirmDisabled =
    !pendingDate ||
    !pendingTime ||
    isDateTimeBeforeMin(selectedDateTime, minDateTime);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    }

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [open]);

  function abrirPicker() {
    if (disabled) return;
    const initial = resolverValorInicial(value, minuteStep, minDateTime);
    setPendingDate(initial.dateValue);
    setPendingTime(initial.timeValue);
    setVisibleMonth(primeiroDiaMes(parseDateTimeLocalValue(initial.value)));
    setOpen(true);
  }

  function selecionarHoje() {
    const next = resolverProximoInicioPermitido(new Date(), minuteStep, minDateTime);
    const nextParts = splitDateTimeLocalValue(next);
    if (!nextParts) return;
    setPendingDate(nextParts.dateValue);
    setPendingTime(nextParts.timeValue);
    setVisibleMonth(primeiroDiaMes(parseDateTimeLocalValue(next)));
  }

  function confirmar() {
    if (confirmDisabled) return;
    onChange(montarDateTimeLocalValue(pendingDate, pendingTime));
    setOpen(false);
  }

  function limpar() {
    onChange('');
    setPendingDate('');
    setPendingTime('');
    setOpen(false);
  }

  function navegarMes(offset: number) {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== 'ArrowDown') return;
    event.preventDefault();
    abrirPicker();
  }

  return (
    <div ref={rootRef} className={`relative flex flex-col gap-1.5 ${className}`}>
      {label ? (
        <label
          htmlFor={inputId}
          className="ml-1 select-none text-sm font-semibold text-app-fg/90"
        >
          {label}
        </label>
      ) : null}

      <button
        id={inputId}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={describedBy}
        onClick={abrirPicker}
        onKeyDown={handleTriggerKeyDown}
        className={`group flex w-full items-center justify-between rounded-xl border bg-app-surface px-4 py-2.5 text-left text-sm ring-offset-app-bg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/40 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
          error
            ? 'border-app-danger focus-visible:ring-app-danger/40'
            : 'border-app-border hover:border-app-primary/30 focus-visible:border-app-primary'
        }`}
      >
        <span className="flex min-w-0 items-center gap-3">
          <Icon
            name="calendar"
            className="h-4 w-4 flex-shrink-0 text-app-muted transition-colors group-focus-visible:text-app-primary group-hover:text-app-primary"
          />
          <span className={value ? 'truncate text-app-fg' : 'truncate text-app-muted'}>
            {displayValue}
          </span>
        </span>
        <Icon name="chevron-down" className="h-4 w-4 flex-shrink-0 text-app-muted" />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={label ?? 'Selecionar data e hora'}
          className="absolute left-0 top-full z-[60] mt-2 w-full min-w-[19rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-app-primary/30 bg-app-surface p-4 shadow-2xl shadow-black/40 sm:w-[30rem]"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Mês anterior"
              onClick={() => navegarMes(-1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-app-border bg-app-bg/50 text-app-muted transition-all hover:border-app-primary/40 hover:text-app-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50"
            >
              <Icon name="chevron-left" className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold capitalize text-app-fg">{monthLabel}</p>
            <button
              type="button"
              aria-label="Próximo mês"
              onClick={() => navegarMes(1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-app-border bg-app-bg/50 text-app-muted transition-all hover:border-app-primary/40 hover:text-app-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50"
            >
              <Icon name="chevron-right" className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_9rem]">
            <div>
              <div className="grid grid-cols-7 gap-1 text-center text-[0.68rem] font-semibold uppercase tracking-wide text-app-muted">
                {WEEK_DAYS.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1">
                {monthCells.map((cell) => {
                  if (!cell.dateValue) {
                    return <span key={cell.key} className="h-9" aria-hidden="true" />;
                  }
                  const selected = cell.dateValue === pendingDate;
                  const disabledDay = isDateBeforeMinDateTime(
                    cell.dateValue,
                    minDateTime,
                  );
                  return (
                    <button
                      key={cell.key}
                      type="button"
                      disabled={disabledDay}
                      aria-pressed={selected}
                      onClick={() => setPendingDate(cell.dateValue ?? '')}
                      className={`h-9 rounded-xl border text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50 ${
                        selected
                          ? 'border-app-primary bg-app-primary text-white shadow-[0_0_16px_rgba(var(--primary-rgb),0.28)]'
                          : 'border-transparent bg-app-bg/40 text-app-fg hover:border-app-primary/40 hover:bg-app-primary/10'
                      } disabled:cursor-not-allowed disabled:bg-app-bg/20 disabled:text-app-muted/40 disabled:hover:border-transparent`}
                    >
                      {cell.dayNumber}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-app-fg">
                <Icon name="clock" className="h-4 w-4 text-app-primary" />
                Horário
              </div>
              <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
                {timeSlots.map((slot) => {
                  const disabledSlot =
                    !pendingDate ||
                    isDateTimeBeforeMin(
                      montarDateTimeLocalValue(pendingDate, slot),
                      minDateTime,
                    );
                  const selected = slot === pendingTime;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={disabledSlot}
                      aria-pressed={selected}
                      onClick={() => setPendingTime(slot)}
                      className={`w-full rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50 ${
                        selected
                          ? 'border-app-primary bg-app-primary/90 text-white'
                          : 'border-app-border/70 bg-app-bg/40 text-app-fg hover:border-app-primary/40 hover:bg-app-primary/10'
                      } disabled:cursor-not-allowed disabled:bg-app-bg/20 disabled:text-app-muted/40 disabled:hover:border-app-border/70`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col-reverse gap-2 border-t border-app-border pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selecionarHoje}
                className="rounded-xl border border-app-border bg-app-bg/50 px-3 py-2 text-xs font-semibold text-app-fg transition-all hover:border-app-primary/40 hover:bg-app-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50"
              >
                Hoje
              </button>
              {allowClear ? (
                <button
                  type="button"
                  onClick={limpar}
                  className="rounded-xl border border-app-border bg-transparent px-3 py-2 text-xs font-semibold text-app-muted transition-all hover:border-app-danger/40 hover:text-app-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-danger/50"
                >
                  Limpar
                </button>
              ) : null}
            </div>
            <button
              type="button"
              disabled={confirmDisabled}
              onClick={confirmar}
              className="rounded-xl border border-white/10 bg-app-primary px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_14px_0_rgba(var(--primary-rgb),0.39)] transition-all hover:bg-app-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Confirmar
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <span id={errorId} className="ml-1 text-xs font-medium text-app-danger">
          {error}
        </span>
      ) : null}
      {helperText && !error ? (
        <span id={helperId} className="ml-1 text-xs text-app-muted">
          {helperText}
        </span>
      ) : null}
    </div>
  );
}

function resolverValorInicial(
  value: string,
  minuteStep: number,
  minDateTime?: string,
): {
  value: string;
  dateValue: string;
  timeValue: string;
} {
  const parts = splitDateTimeLocalValue(value);
  if (parts) {
    return {
      value,
      ...parts,
    };
  }

  const fallback = resolverProximoInicioPermitido(new Date(), minuteStep, minDateTime);
  const fallbackParts = splitDateTimeLocalValue(fallback);
  if (!fallbackParts) {
    const today = dateToDateValue(new Date());
    return { value: `${today}T00:00`, dateValue: today, timeValue: '00:00' };
  }
  return {
    value: fallback,
    ...fallbackParts,
  };
}

function primeiroDiaMes(date: Date | null): Date {
  const base = date ?? new Date();
  return new Date(base.getFullYear(), base.getMonth(), 1);
}
