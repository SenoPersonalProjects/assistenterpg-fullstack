'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import type { DiceResultado, DiceRollPayload } from '@/lib/campanha/sessao-dice';
import {
  calcularResultadoDice,
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

  const normalizado = normalizarOperador(payload.operador, payload.modificador);
  const faces = payload.faces;
  const resultado: DiceResultado = useMemo(
    () => calcularResultadoDice(payload),
    [payload],
  );
  const rolagensBase = resultado.rolagensBase;
  const valoresExibidos = resultado.rolagensFinais;
  const totalBase = resultado.totalBase;
  const total = resultado.total;
  const keepMode = resultado.keepMode;
  const indiceEscolhido = resultado.indiceEscolhido;

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
  const valorEscolhido =
    indiceEscolhido !== null ? rolagensBase[indiceEscolhido] : null;
  const temNaturalMax =
    keepMode === 'SUM'
      ? rolagensBase.some((valor) => valor === faces)
      : valorEscolhido === faces;
  const temNaturalMin =
    keepMode === 'SUM'
      ? rolagensBase.some((valor) => valor === 1)
      : valorEscolhido === 1;
  const labelNaturalMax = faces === 20 ? 'Critico natural' : 'Maximo natural';
  const labelNaturalMin = faces === 20 ? 'Falha critica' : 'Minimo natural';
  const mostrarFinalPorDado =
    payload.aplicarModificadorPorDado || Boolean(modificadorTexto);
  const usarSelecionado =
    keepMode !== 'SUM' && indiceEscolhido !== null && indiceEscolhido !== undefined;
  const labelTotal = usarSelecionado
    ? keepMode === 'HIGHEST'
      ? 'Melhor resultado'
      : 'Pior resultado'
    : 'Total';
  const resumoClassName = `session-dice__summary${
    temNaturalMax ? ' session-dice__summary--crit' : ''
  }${temNaturalMin ? ' session-dice__summary--fumble' : ''}`;

  return (
    <div className="session-dice">
      <div className="session-dice__header">
        <span className="session-dice__badge">Rolagem</span>
        {label ? <span className="session-dice__label">{label}</span> : null}
        <span className="session-dice__expr">{expressaoExibida}</span>
        {temNaturalMax ? (
          <span className="session-dice__tag session-dice__tag--crit">
            {labelNaturalMax}
          </span>
        ) : null}
        {temNaturalMin ? (
          <span className="session-dice__tag session-dice__tag--fumble">
            {labelNaturalMin}
          </span>
        ) : null}
      </div>

      <div className={resumoClassName}>
        {payload.aplicarModificadorPorDado ? (
          <>
            <span className="session-dice__summary-label">{labelTotal}</span>
            {modificadorTexto ? (
              <span className="session-dice__modifier">
                {modificadorTexto} por dado
              </span>
            ) : null}
            <span className="session-dice__meta">
              {usarSelecionado ? 'Dado escolhido' : 'Base'} {totalBase}
            </span>
            <span className="session-dice__total">{total}</span>
          </>
        ) : (
          <>
            <span className="session-dice__summary-label">{labelTotal}</span>
            <span className="session-dice__total">{total}</span>
            {modificadorTexto ? (
              <span className="session-dice__modifier">{modificadorTexto}</span>
            ) : null}
            <span className="session-dice__meta">
              {usarSelecionado ? 'Dado escolhido' : 'Dado puro'} {totalBase}
            </span>
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
          {rolagensBase.map((valor, index) => {
            const final = valoresExibidos[index] ?? valor;
            const destaqueMin = valor === 1 && faces > 1;
            const destaqueMax = valor === faces && faces > 1;
            const destaqueEscolhido = usarSelecionado && indiceEscolhido === index;
            return (
              <span
                key={`${valor}-${index}`}
                className={`session-dice__roll${
                  destaqueMax ? ' session-dice__roll--max' : ''
                }${destaqueMin ? ' session-dice__roll--min' : ''}${destaqueEscolhido ? ' session-dice__roll--picked' : ''}`}
              >
                <span className="session-dice__roll-raw">{valor}</span>
                {destaqueEscolhido ? (
                  <span className="session-dice__roll-picked">Selecionado</span>
                ) : null}
                {mostrarFinalPorDado ? (
                  <span className="session-dice__roll-final">
                    -{'>'} {final}
                  </span>
                ) : null}
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

