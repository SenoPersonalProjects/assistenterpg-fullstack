'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import type { DiceRollPayload } from '@/lib/campanha/sessao-dice';
import { formatarExpressaoDice } from '@/lib/campanha/sessao-dice';

type DiceMessageCardProps = {
  payload: DiceRollPayload;
  expression?: string;
};

export function DiceMessageCard({ payload, expression }: DiceMessageCardProps) {
  const [mostrarDetalhes, setMostrarDetalhes] = useState(
    payload.aplicarModificadorPorDado,
  );

  const valoresExibidos = useMemo(() => {
    if (payload.aplicarModificadorPorDado) {
      return payload.rolagens.map((valor) => valor + payload.modificador);
    }
    return payload.rolagens;
  }, [payload]);

  const total = useMemo(
    () => payload.rolagens.reduce((acc, valor) => acc + valor, 0) + payload.modificador,
    [payload],
  );

  const { min, max } = useMemo(() => {
    if (valoresExibidos.length === 0) return { min: 0, max: 0 };
    let minValor = valoresExibidos[0] ?? 0;
    let maxValor = valoresExibidos[0] ?? 0;
    for (const valor of valoresExibidos) {
      if (valor < minValor) minValor = valor;
      if (valor > maxValor) maxValor = valor;
    }
    return { min: minValor, max: maxValor };
  }, [valoresExibidos]);

  const expressaoExibida = expression ?? formatarExpressaoDice(payload);
  const label = payload.label?.trim();
  const modificadorTexto =
    payload.modificador === 0
      ? null
      : payload.modificador > 0
        ? `+${payload.modificador}`
        : String(payload.modificador);

  return (
    <div className="session-dice">
      <div className="session-dice__header">
        <span className="session-dice__badge">Rolagem</span>
        {label ? <span className="session-dice__label">{label}</span> : null}
        <span className="session-dice__expr">{expressaoExibida}</span>
      </div>

      <div className="session-dice__summary">
        {payload.aplicarModificadorPorDado ? (
          <>
            <span className="session-dice__summary-label">Valores individuais</span>
            {modificadorTexto ? (
              <span className="session-dice__modifier">
                {modificadorTexto} por dado
              </span>
            ) : null}
          </>
        ) : (
          <>
            <span className="session-dice__summary-label">Total</span>
            <span className="session-dice__total">{total}</span>
            {modificadorTexto ? (
              <span className="session-dice__modifier">{modificadorTexto}</span>
            ) : null}
          </>
        )}
      </div>

      <div className="session-dice__actions">
        <Button
          type="button"
          size="xs"
          variant="ghost"
          onClick={() => setMostrarDetalhes((valor) => !valor)}
        >
          <Icon
            name={mostrarDetalhes ? 'chevron-up' : 'chevron-down'}
            className="h-3 w-3"
          />
          {mostrarDetalhes ? 'Ocultar detalhes' : 'Ver detalhes'}
        </Button>
      </div>

      {mostrarDetalhes ? (
        <div className="session-dice__rolls">
          {valoresExibidos.map((valor, index) => {
            const destaqueMin = valor === min && max !== min;
            const destaqueMax = valor === max && max !== min;
            return (
              <span
                key={`${valor}-${index}`}
                className={`session-dice__roll${
                  destaqueMax ? ' session-dice__roll--max' : ''
                }${destaqueMin ? ' session-dice__roll--min' : ''}`}
              >
                {valor}
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
