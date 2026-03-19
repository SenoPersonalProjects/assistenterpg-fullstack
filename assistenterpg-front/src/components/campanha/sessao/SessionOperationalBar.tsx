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
      <div className="session-operational-bar__stats">
        {controleTurnosAtivo ? (
          <>
            <div className="session-operational-bar__block session-operational-bar__block--turno">
              <span className="session-operational-bar__label">Turno atual</span>
              <span className="session-operational-bar__value">
                {turnoAtualLabel ?? 'Sem turno definido'}
              </span>
            </div>
            <div className="session-operational-bar__block">
              <span className="session-operational-bar__label">Cena</span>
              <span className="session-operational-bar__value">
                {cenaLabel}
                {cenaNome ? ` — ${cenaNome}` : ''}
              </span>
            </div>
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
        ) : (
          <>
            <div className="session-operational-bar__block">
              <span className="session-operational-bar__label">Cena</span>
              <span className="session-operational-bar__value">
                {cenaLabel}
                {cenaNome ? ` — ${cenaNome}` : ''}
              </span>
            </div>
            <div className="session-operational-bar__block session-operational-bar__block--modo">
              <span className="session-operational-bar__label">Controle de turnos</span>
              <span className="session-operational-bar__value">
                Sem controle de turnos
              </span>
            </div>
          </>
        )}
      </div>

      <div className="session-operational-bar__meta">
        {combateAtivo ? (
          <Badge color="orange" size="sm">
            <Icon name="swords" className="mr-1 h-3.5 w-3.5" />
            Combate ativo
          </Badge>
        ) : null}
        <Badge color={sessaoEncerrada ? 'gray' : 'green'} size="sm">
          {sessaoEncerrada ? 'Sessao encerrada' : 'Sessao ativa'}
        </Badge>
        <Badge color={realtimeAtivo ? 'cyan' : 'yellow'} size="sm">
          {realtimeAtivo ? 'Tempo real' : 'Sincronizacao periodica'}
        </Badge>
        {typeof totalParticipantesOnline === 'number' &&
        typeof totalParticipantes === 'number' ? (
          <span className="session-operational-bar__meta-text">
            Online {totalParticipantesOnline}/{totalParticipantes}
          </span>
        ) : null}
      </div>

      {podeControlarSessao && controleTurnosAtivo ? (
        <div className="session-operational-bar__actions">
          <Button
            variant="secondary"
            size="sm"
            onClick={onVoltarTurno}
            disabled={sessaoEncerrada || Boolean(acaoTurnoPendente)}
          >
            <Icon name="chevron-left" className="mr-1 h-3.5 w-3.5" />
            {acaoTurnoPendente === 'VOLTAR' ? 'Voltando...' : 'Voltar'}
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



