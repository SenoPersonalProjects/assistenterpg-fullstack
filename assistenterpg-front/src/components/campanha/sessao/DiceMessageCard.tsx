'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import type { DiceRollPayload } from '@/lib/campanha/sessao-dice';
import {
  formatarExpressaoDice,
  type DiceOperador,
} from '@/lib/campanha/sessao-dice';

type DiceMessageCardProps = {
  payload: DiceRollPayload;
  expression?: string;
};

export function DiceMessageCard({ payload, expression }: DiceMessageCardProps) {
  const [mostrarDetalhes, setMostrarDetalhes] = useState(
    payload.aplicarModificadorPorDado,
  );

  const normalizarOperador = (
    operador: DiceOperador | undefined,
    modificador: number,
  ) => {
    if (!operador && modificador < 0) {
      return { operador: '-' as DiceOperador, modificador: Math.abs(modificador) };
    }
    return { operador: (operador ?? '+') as DiceOperador, modificador };
  };

  const aplicarOperador = (
    valor: number,
    operador: DiceOperador,
    modificador: number,
  ) => {
    switch (operador) {
      case '+':
        return valor + modificador;
      case '-':
        return valor - modificador;
      case '*':
        return valor * modificador;
      case '/':
        if (modificador === 0) return valor;
        return Math.trunc(valor / modificador);
      default:
        return valor + modificador;
    }
  };

  const normalizado = normalizarOperador(payload.operador, payload.modificador);

  const valoresExibidos = useMemo(() => {
    if (payload.aplicarModificadorPorDado) {
      return payload.rolagens.map((valor) =>
        aplicarOperador(valor, normalizado.operador, normalizado.modificador),
      );
    }
    return payload.rolagens;
  }, [payload, normalizado]);

  const total = useMemo(() => {
    if (payload.aplicarModificadorPorDado) {
      return valoresExibidos.reduce((acc, valor) => acc + valor, 0);
    }
    const base = payload.rolagens.reduce((acc, valor) => acc + valor, 0);
    return aplicarOperador(base, normalizado.operador, normalizado.modificador);
  }, [payload, normalizado, valoresExibidos]);

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
    normalizado.modificador === 0 && normalizado.operador === '+'
      ? null
      : normalizado.operador === '+'
        ? `+${normalizado.modificador}`
        : normalizado.operador === '-'
          ? `-${normalizado.modificador}`
          : `${normalizado.operador}${normalizado.modificador}`;

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
