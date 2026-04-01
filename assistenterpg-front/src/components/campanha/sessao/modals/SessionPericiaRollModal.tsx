'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Icon } from '@/components/ui/Icon';
import { DiceMessageCard } from '@/components/campanha/sessao/DiceMessageCard';
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

  useEffect(() => {
    if (!isOpen || !payload) {
      setMostrandoResultado(false);
      return;
    }
    setMostrandoResultado(false);
    const timer = window.setTimeout(() => setMostrandoResultado(true), duracaoMs);
    return () => window.clearTimeout(timer);
  }, [isOpen, payload, duracaoMs]);

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
          <span className="session-roll-modal__badge">
            <Icon name="dice" className="h-4 w-4" />
            Rolagem
          </span>
        </div>

        {!payload ? (
          <p className="session-roll-modal__placeholder">
            Nenhuma rolagem disponivel.
          </p>
        ) : !mostrandoResultado ? (
          <div className="session-roll-modal__anim">
            <div className="session-roll-modal__dice">
              <Icon name="dice" className="h-10 w-10" />
            </div>
            <p className="session-roll-modal__anim-text">Rolando dados...</p>
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

