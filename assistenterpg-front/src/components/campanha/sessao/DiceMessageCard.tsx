'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import type {
  DiceResultado,
  DiceRollPayload,
  DiceTermResultado,
} from '@/lib/campanha/sessao-dice';
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
    payload.aplicarModificadorPorDado ||
      Boolean(payload.termos?.some((termo) => termo.aplicarModificadorPorDado)),
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
  const bonusDados = resultado.bonusDados;
  const bonusTotal = resultado.bonusTotal;
  const total = resultado.total;
  const keepMode = resultado.keepMode;
  const indiceEscolhido = resultado.indiceEscolhido;
  const termosResultado = resultado.termos ?? [];
  const composto = termosResultado.length > 1;

  const formatarTermoResumo = (termo: DiceTermResultado) => {
    const hash = termo.aplicarModificadorPorDado ? '#' : '';
    return `${termo.quantidade}${hash}d${termo.faces}`;
  };

  const termoTemNaturalMax = (termo: DiceTermResultado) =>
    termo.keepMode === 'SUM'
      ? termo.rolagensBase.some((valor) => valor === termo.faces)
      : termo.indiceEscolhido !== null &&
        termo.rolagensBase[termo.indiceEscolhido] === termo.faces;

  const termoTemNaturalMin = (termo: DiceTermResultado) =>
    termo.keepMode === 'SUM'
      ? termo.rolagensBase.some((valor) => valor === 1)
      : termo.indiceEscolhido !== null &&
        termo.rolagensBase[termo.indiceEscolhido] === 1;

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
  const temNaturalMax = composto
    ? termosResultado.some(termoTemNaturalMax)
    : keepMode === 'SUM'
      ? rolagensBase.some((valor) => valor === faces)
      : valorEscolhido === faces;
  const temNaturalMin = composto
    ? termosResultado.some(termoTemNaturalMin)
    : keepMode === 'SUM'
      ? rolagensBase.some((valor) => valor === 1)
      : valorEscolhido === 1;
  const naturalMaxD20 = composto
    ? termosResultado.some((termo) => termo.faces === 20 && termoTemNaturalMax(termo))
    : faces === 20 && temNaturalMax;
  const naturalMinD20 = composto
    ? termosResultado.some((termo) => termo.faces === 20 && termoTemNaturalMin(termo))
    : faces === 20 && temNaturalMin;
  const labelNaturalMax = naturalMaxD20 ? 'Crítico natural' : 'Máximo natural';
  const labelNaturalMin = naturalMinD20 ? 'Falha critica' : 'Minimo natural';
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
        {composto ? (
          <>
            <span className="session-dice__summary-label">Total</span>
            <span className="session-dice__total">{total}</span>
            {modificadorTexto ? (
              <span className="session-dice__modifier">{modificadorTexto}</span>
            ) : null}
            <span className="session-dice__meta">
              {termosResultado.length} grupos somados: base {totalBase}
              {bonusTotal > 0 ? ` + bonus ${bonusTotal}` : ''}
            </span>
          </>
        ) : payload.aplicarModificadorPorDado ? (
          <>
            <span className="session-dice__summary-label">{labelTotal}</span>
            {modificadorTexto ? (
              <span className="session-dice__modifier">
                {modificadorTexto} por dado
              </span>
            ) : null}
            <span className="session-dice__meta">
              {usarSelecionado ? 'Dado escolhido' : 'Base'} {totalBase}
              {bonusTotal > 0 ? ` + bonus ${bonusTotal}` : ''}
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
              {bonusTotal > 0 ? ` + bonus ${bonusTotal}` : ''}
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

      {mostrarDetalhes && composto ? (
        <div className="session-dice__terms">
          {termosResultado.map((termo, termoIndex) => {
            const usarSelecionadoTermo =
              termo.keepMode !== 'SUM' &&
              termo.indiceEscolhido !== null &&
              termo.indiceEscolhido !== undefined;
            return (
              <div
                key={`${termo.faces}-${termo.quantidade}-${termoIndex}`}
                className="session-dice__term"
              >
                <div className="session-dice__term-header">
                  <span className="session-dice__term-label">
                    {formatarTermoResumo(termo)}
                  </span>
                  <span className="session-dice__term-total">
                    Subtotal {termo.subtotal}
                  </span>
                </div>
                <div className="session-dice__rolls">
                  {termo.rolagensBase.map((valor, index) => {
                    const destaqueMin = valor === 1 && termo.faces > 1;
                    const destaqueMax = valor === termo.faces && termo.faces > 1;
                    const destaqueEscolhido =
                      usarSelecionadoTermo && termo.indiceEscolhido === index;
                    return (
                      <span
                        key={`${valor}-${index}`}
                        className={`session-dice__roll${
                          destaqueMax ? ' session-dice__roll--max' : ''
                        }${destaqueMin ? ' session-dice__roll--min' : ''}${destaqueEscolhido ? ' session-dice__roll--picked' : ''}`}
                      >
                        <span className="session-dice__roll-raw">{valor}</span>
                        {destaqueEscolhido ? (
                          <span className="session-dice__roll-picked">
                            Selecionado
                          </span>
                        ) : null}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {bonusDados.length > 0 ? (
            <div className="session-dice__rolls">
              {bonusDados.map((bonus) => (
                <span
                  key={`${bonus.origem}-${bonus.efeitoPendenteId ?? bonus.label}`}
                  className="session-dice__roll session-dice__roll--picked"
                >
                  <span className="session-dice__roll-raw">
                    {bonus.label}: {bonus.rolagens.join(', ')}
                  </span>
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : mostrarDetalhes ? (
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
          {bonusDados.map((bonus) => (
            <span
              key={`${bonus.origem}-${bonus.efeitoPendenteId ?? bonus.label}`}
              className="session-dice__roll session-dice__roll--picked"
            >
              <span className="session-dice__roll-raw">
                {bonus.label}: {bonus.rolagens.join(', ')}
              </span>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

