'use client';

import { forwardRef, useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Modal } from '@/components/ui/Modal';

type AcaoControleTurno = 'AVANCAR' | 'VOLTAR' | 'PULAR';

type SessionOperationalBarProps = {
  cenaLabel: string;
  cenaNome?: string | null;
  rodadaAtual?: number | null;
  turnoAtualLabel?: string | null;
  proximoTurnoLabel?: string | null;
  sessaoEncerrada: boolean;
  realtimeAtivo: boolean;
  realtimeStatus?: 'online' | 'reconnecting' | 'polling';
  controleTurnosAtivo: boolean;
  combateAtivo?: boolean;
  podeControlarSessao: boolean;
  totalParticipantesOnline?: number;
  totalParticipantes?: number;
  erro?: string | null;
  acaoTurnoPendente: AcaoControleTurno | null;
  onAvancarTurno: () => void;
  onPularTurno: () => void;
  onVoltarTurno: () => void;
  className?: string;
};

export const SessionOperationalBar = forwardRef<
  HTMLElement,
  SessionOperationalBarProps
>(function SessionOperationalBar(
  {
    cenaLabel,
    cenaNome,
    rodadaAtual,
    turnoAtualLabel,
    proximoTurnoLabel,
    sessaoEncerrada,
    realtimeAtivo,
    realtimeStatus,
    controleTurnosAtivo,
    combateAtivo = false,
    podeControlarSessao,
    totalParticipantesOnline,
    totalParticipantes,
    erro,
    acaoTurnoPendente,
    onAvancarTurno,
    onPularTurno,
    onVoltarTurno,
    className = '',
  },
  ref,
) {
  const [atalhosAbertos, setAtalhosAbertos] = useState(false);
  const statusTempoReal =
    realtimeStatus ?? (realtimeAtivo ? 'online' : 'polling');
  const labelTempoReal =
    statusTempoReal === 'online'
      ? 'Conectado'
      : statusTempoReal === 'reconnecting'
        ? 'Reconectando'
        : 'Atualizacao periodica';
  const classeTempoReal =
    statusTempoReal === 'online'
      ? 'text-app-success'
      : statusTempoReal === 'reconnecting'
        ? 'text-app-warning'
        : '';

  return (
    <section
      ref={ref}
      className={`session-operational-bar${
        combateAtivo ? ' session-operational-bar--combat' : ''
      } ${className}`}
    >
      {erro ? (
        <ErrorAlert message={erro} className="session-operational-bar__error" />
      ) : null}
      <div className="session-operational-bar__grid">
        <div className="session-operational-bar__zone session-operational-bar__zone--focus">
          {controleTurnosAtivo ? (
            <div className="session-operational-bar__block session-operational-bar__block--turno">
              <span className="session-operational-bar__label">Turno atual</span>
              <span className="session-operational-bar__value">
                {turnoAtualLabel ?? 'Sem turno definido'}
              </span>
            </div>
          ) : (
            <div className="session-operational-bar__block session-operational-bar__block--modo">
              <span className="session-operational-bar__label">Controle de turnos</span>
              <span className="session-operational-bar__value">
                Sem controle de turnos
              </span>
            </div>
          )}

          {podeControlarSessao && controleTurnosAtivo ? (
            <div className="session-operational-bar__actions">
              <Button
                variant="secondary"
                size="sm"
                onClick={onVoltarTurno}
                disabled={sessaoEncerrada || Boolean(acaoTurnoPendente)}
                title="Reverter turno"
              >
                <Icon name="rotate-ccw" className="mr-1 h-3.5 w-3.5" />
                {acaoTurnoPendente === 'VOLTAR'
                  ? 'Revertendo...'
                  : 'Reverter turno'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={onPularTurno}
                disabled={sessaoEncerrada || Boolean(acaoTurnoPendente)}
              >
                <Icon name="skip-forward" className="mr-1 h-3.5 w-3.5" />
                {acaoTurnoPendente === 'PULAR' ? 'Pulando...' : 'Pular'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={onAvancarTurno}
                disabled={sessaoEncerrada || Boolean(acaoTurnoPendente)}
              >
                <Icon name="forward" className="mr-1 h-3.5 w-3.5" />
                {acaoTurnoPendente === 'AVANCAR' ? 'Avancando...' : 'Avancar'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAtalhosAbertos(true)}
                title="Ver atalhos"
              >
                <Icon name="info" className="mr-1 h-3.5 w-3.5" />
                Atalhos
              </Button>
            </div>
          ) : null}
        </div>

        <div className="session-operational-bar__zone session-operational-bar__zone--context">
          <div className="session-operational-bar__block">
            <span className="session-operational-bar__label">Cena</span>
            <span className="session-operational-bar__value">
              {cenaLabel}
              {cenaNome ? ` — ${cenaNome}` : ''}
            </span>
          </div>
          {controleTurnosAtivo ? (
            <>
              <div className="session-operational-bar__block">
                <span className="session-operational-bar__label">Rodada</span>
                <span className="session-operational-bar__value">
                  {rodadaAtual ?? 1}
                </span>
              </div>
              <div className="session-operational-bar__block session-operational-bar__block--proximo">
                <span className="session-operational-bar__label">Proximo turno</span>
                <span className="session-operational-bar__value">
                  {proximoTurnoLabel ?? '—'}
                </span>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="session-operational-bar__meta">
        {combateAtivo ? (
          <Badge color="orange" size="sm">
            <Icon name="swords" className="mr-1 h-3.5 w-3.5" />
            Combate ativo
          </Badge>
        ) : null}
        <span
          className={`session-operational-bar__meta-text${
            sessaoEncerrada ? ' text-app-danger' : ''
          }`}
        >
          {sessaoEncerrada ? 'Sessao encerrada' : 'Sessao ativa'}
        </span>
        <span className={`session-operational-bar__meta-text ${classeTempoReal}`}>
          <Icon
            name={statusTempoReal === 'online' ? 'bolt' : 'refresh'}
            className="mr-1 h-3.5 w-3.5"
          />
          {labelTempoReal}
        </span>
        {typeof totalParticipantesOnline === 'number' &&
        typeof totalParticipantes === 'number' ? (
          <span className="session-operational-bar__meta-text">
            Online {totalParticipantesOnline}/{totalParticipantes}
          </span>
        ) : null}
      </div>

      <Modal
        isOpen={atalhosAbertos}
        onClose={() => setAtalhosAbertos(false)}
        title="Atalhos da sessao"
        size="sm"
      >
        <div className="space-y-2">
          <p className="text-xs text-app-muted">
            Atalhos funcionam quando o foco nao esta em campos de texto.
          </p>
          <div className="space-y-1.5">
            <div className="session-shortcut-row">
              <span>Avancar turno</span>
              <span className="session-kbd">.</span>
            </div>
            <div className="session-shortcut-row">
              <span>Voltar turno</span>
              <span className="session-kbd">Shift + ,</span>
            </div>
            <div className="session-shortcut-row">
              <span>Pular turno</span>
              <span className="session-kbd">Shift + /</span>
            </div>
          </div>
        </div>
      </Modal>
    </section>
  );
});

SessionOperationalBar.displayName = 'SessionOperationalBar';

export type { AcaoControleTurno };



