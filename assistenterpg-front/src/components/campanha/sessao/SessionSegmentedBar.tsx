'use client';

import { Button } from '@/components/ui/Button';

type SessionSegmentedBarProps = {
  label: string;
  value: number;
  max?: number;
  target?: number;
  targetMin?: number;
  targetLabel?: string;
  tone?: 'primary' | 'success' | 'danger';
  canEdit?: boolean;
  canEditTarget?: boolean;
  disabled?: boolean;
  onChange?: (value: number) => void;
  onTargetChange?: (value: number) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.trunc(value)));
}

export function SessionSegmentedBar({
  label,
  value,
  max = 5,
  target,
  targetMin = 1,
  targetLabel = 'Alvo',
  tone = 'primary',
  canEdit = false,
  canEditTarget = false,
  disabled = false,
  onChange,
  onTargetChange,
}: SessionSegmentedBarProps) {
  const valor = clamp(value, 0, max);
  const alvo = typeof target === 'number' ? clamp(target, targetMin, max) : null;

  return (
    <div className={`session-segmented-bar session-segmented-bar--${tone}`}>
      <div className="session-segmented-bar__head">
        <span>{label}</span>
        <strong>
          {valor}/{max}
        </strong>
      </div>
      <div className="session-segmented-bar__track" aria-label={`${label} ${valor}`}>
        {Array.from({ length: max }, (_, index) => {
          const posicao = index + 1;
          return (
            <span
              key={posicao}
              className={[
                'session-segmented-bar__segment',
                posicao <= valor ? 'session-segmented-bar__segment--filled' : '',
                alvo !== null && posicao === alvo
                  ? 'session-segmented-bar__segment--target'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            />
          );
        })}
      </div>
      {canEdit ? (
        <div className="session-segmented-bar__actions">
          <Button
            size="xs"
            variant="ghost"
            disabled={disabled || valor <= 0}
            onClick={() => onChange?.(valor - 1)}
          >
            -1
          </Button>
          <Button
            size="xs"
            variant="ghost"
            disabled={disabled || valor >= max}
            onClick={() => onChange?.(valor + 1)}
          >
            +1
          </Button>
        </div>
      ) : null}
      {alvo !== null ? (
        <div className="session-segmented-bar__target">
          <span>
            {targetLabel}: {alvo}/{max}
          </span>
          {canEditTarget ? (
            <div className="session-segmented-bar__target-actions">
              <Button
                size="xs"
                variant="ghost"
                disabled={disabled || alvo <= targetMin}
                onClick={() => onTargetChange?.(alvo - 1)}
              >
                -1
              </Button>
              <Button
                size="xs"
                variant="ghost"
                disabled={disabled || alvo >= max}
                onClick={() => onTargetChange?.(alvo + 1)}
              >
                +1
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
