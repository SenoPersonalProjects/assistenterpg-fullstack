'use client';

import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Icon } from '@/components/ui/Icon';
import { Checkbox } from '@/components/ui/Checkbox';
import { DiceMessageCard } from '@/components/campanha/sessao/DiceMessageCard';
import { DiceScene } from '@/components/campanha/sessao/dice/DiceScene';
import { STORAGE_ANIMACAO_ROLAGEM_KEY } from '@/lib/constants/rolagem';
import { calcularResultadoDice } from '@/lib/campanha/sessao-dice';
import type { DiceRollPayload } from '@/lib/campanha/sessao-dice';

const ANIMACAO_PADRAO_MS = 900;

type SessionPericiaRollModalProps = {
  isOpen: boolean;
  onClose: () => void;
  titulo: string;
  subtitulo?: string;
  payload: DiceRollPayload | null;
  expression?: string;
  enviando?: boolean;
  enviado?: boolean;
  erro?: string | null;
  duracaoMs?: number;
};

export function SessionPericiaRollModal({
  isOpen,
  onClose,
  titulo,
  subtitulo,
  payload,
  expression,
  enviando = false,
  enviado = false,
  erro = null,
  duracaoMs = ANIMACAO_PADRAO_MS,
}: SessionPericiaRollModalProps) {
  const [mostrandoResultado, setMostrandoResultado] = useState(false);
  const [animacaoAtiva, setAnimacaoAtiva] = useState(() => {
    if (typeof window === 'undefined') return true;
    const armazenado = window.localStorage.getItem(STORAGE_ANIMACAO_ROLAGEM_KEY);
    return armazenado !== 'off';
  });

  const duracaoAnimacao = useMemo(() => {
    if (!animacaoAtiva) return 0;
    return duracaoMs;
  }, [animacaoAtiva, duracaoMs]);

  const resultadoCalculado = useMemo(() => {
    if (!payload) return null;
    return calcularResultadoDice(payload);
  }, [payload]);

  const valorDado = useMemo(() => {
    if (!payload || !resultadoCalculado) return null;
    if (resultadoCalculado.keepMode !== 'SUM') {
      const indice = resultadoCalculado.indiceEscolhido ?? 0;
      return (
        resultadoCalculado.rolagensBase[indice] ??
        payload.rolagens[0] ??
        null
      );
    }
    return payload.rolagens[0] ?? null;
  }, [payload, resultadoCalculado]);

  const facesExibidas = payload?.faces ?? 20;

  useEffect(() => {
    if (!isOpen || !payload) {
      const reset = window.setTimeout(() => setMostrandoResultado(false), 0);
      return () => window.clearTimeout(reset);
    }
    const reset = window.setTimeout(() => setMostrandoResultado(false), 0);
    const timer = window.setTimeout(
      () => setMostrandoResultado(true),
      duracaoAnimacao,
    );
    return () => {
      window.clearTimeout(reset);
      window.clearTimeout(timer);
    };
  }, [isOpen, payload, duracaoAnimacao]);

  const handleToggleAnimacao = (checked: boolean) => {
    setAnimacaoAtiva(checked);
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      STORAGE_ANIMACAO_ROLAGEM_KEY,
      checked ? 'on' : 'off',
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rolagem de pericia"
      size="md"
      footer={null}
    >
      <div className="session-roll-modal">
        <div className="session-roll-modal__head">
          <div>
            <p className="session-roll-modal__title">{titulo}</p>
            {subtitulo ? (
              <p className="session-roll-modal__subtitle">{subtitulo}</p>
            ) : null}
            {expression ? (
              <span className="session-roll-modal__expr">{expression}</span>
            ) : null}
          </div>
          <div className="session-roll-modal__head-actions">
            <Checkbox
              checked={animacaoAtiva}
              onChange={(event) => handleToggleAnimacao(event.target.checked)}
              label={animacaoAtiva ? 'Modo animado' : 'Modo rapido'}
              className="session-roll-modal__toggle"
            />
            <span className="session-roll-modal__badge">
              <Icon name="dice" className="h-4 w-4" />
              Rolagem
            </span>
          </div>
        </div>

        <div className="session-roll-modal__viewer">
          <div className="session-roll-modal__dice-card">
            <DiceScene
              faces={facesExibidas}
              isRolling={Boolean(payload) && animacaoAtiva && !mostrandoResultado}
              result={mostrandoResultado ? valorDado : null}
              reducedMotion={!animacaoAtiva}
            />
            {!mostrandoResultado && payload ? (
              <div className="session-roll-modal__dice-overlay">
                <span className="session-roll-modal__dice-label">{titulo}</span>
                {expression ? (
                  <span className="session-roll-modal__dice-expr">{expression}</span>
                ) : null}
                <span className="session-roll-modal__dice-status">
                  {animacaoAtiva ? 'Rolando teste...' : 'Preparando resultado...'}
                </span>
              </div>
            ) : null}
          </div>

          {!payload ? (
            <div className="session-roll-modal__empty">
              <Icon name="dice" className="h-5 w-5" />
              <div>
                <p className="session-roll-modal__empty-title">
                  Nenhuma rolagem disponivel
                </p>
                <p className="session-roll-modal__empty-subtitle">
                  Faca uma rolagem para ver o resultado aqui.
                </p>
              </div>
            </div>
          ) : mostrandoResultado ? (
            <DiceMessageCard payload={payload} expression={expression} />
          ) : null}
        </div>

        <div className="session-roll-modal__status">
          {erro ? (
            <span className="session-roll-modal__status-error">
              <Icon name="close" className="h-3.5 w-3.5" />
              Falha ao enviar resultado
            </span>
          ) : enviado ? (
            <span className="session-roll-modal__status-ok">
              <Icon name="check" className="h-3.5 w-3.5" />
              Resultado enviado ao chat
            </span>
          ) : enviando ? (
            <span className="session-roll-modal__status-warn">
              <Icon name="info" className="h-3.5 w-3.5" />
              Enviando ao chat...
            </span>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
