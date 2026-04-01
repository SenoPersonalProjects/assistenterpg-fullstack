'use client';

import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Icon } from '@/components/ui/Icon';
import { Checkbox } from '@/components/ui/Checkbox';
import { DiceMessageCard } from '@/components/campanha/sessao/DiceMessageCard';
import type { DiceRollPayload } from '@/lib/campanha/sessao-dice';

const ANIMACAO_PADRAO_MS = 900;
const STORAGE_ANIMACAO_KEY = 'assistenterpg.session.roll.animacao';

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
    const armazenado = window.localStorage.getItem(STORAGE_ANIMACAO_KEY);
    return armazenado !== 'off';
  });

  const duracaoAnimacao = useMemo(() => {
    if (!animacaoAtiva) return 0;
    return duracaoMs;
  }, [animacaoAtiva, duracaoMs]);

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
      STORAGE_ANIMACAO_KEY,
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
          </div>
          <div className="session-roll-modal__head-actions">
            <span className="session-roll-modal__badge">
              <Icon name="dice" className="h-4 w-4" />
              Rolagem
            </span>
            <Checkbox
              checked={animacaoAtiva}
              onChange={(event) => handleToggleAnimacao(event.target.checked)}
              label="Animacao detalhada"
              className="session-roll-modal__toggle"
            />
          </div>
        </div>

        {!payload ? (
          <p className="session-roll-modal__placeholder">
            Nenhuma rolagem disponivel.
          </p>
        ) : !mostrandoResultado ? (
          <div className="session-roll-modal__anim">
            <div className="session-roll-modal__dice-track">
              <span className="session-roll-modal__dice session-roll-modal__dice--a">
                <Icon name="dice" className="h-6 w-6" />
              </span>
              <span className="session-roll-modal__dice session-roll-modal__dice--b">
                <Icon name="dice" className="h-6 w-6" />
              </span>
              <span className="session-roll-modal__dice session-roll-modal__dice--c">
                <Icon name="dice" className="h-6 w-6" />
              </span>
            </div>
            <p className="session-roll-modal__anim-text">
              {animacaoAtiva ? 'Rolando dados...' : 'Calculando resultado...'}
            </p>
          </div>
        ) : (
          <DiceMessageCard payload={payload} expression={expression} />
        )}

        <div className="session-roll-modal__status">
          {erro ? (
            <span className="session-roll-modal__status-error">{erro}</span>
          ) : enviado ? (
            <span className="session-roll-modal__status-ok">Enviado ao chat</span>
          ) : enviando ? (
            <span className="session-roll-modal__status-warn">Enviando...</span>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

