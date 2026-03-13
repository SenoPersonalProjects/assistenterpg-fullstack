'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

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
  podeControlarSessao: boolean;
  totalParticipantesOnline?: number;
  totalParticipantes?: number;
  acaoTurnoPendente: AcaoControleTurno | null;
  onAvancarTurno: () => void;
  onPularTurno: () => void;
  onVoltarTurno: () => void;
  className?: string;
};

export function SessionOperationalBar({
  cenaLabel,
  cenaNome,
  rodadaAtual,
  turnoAtualLabel,
  proximoTurnoLabel,
  sessaoEncerrada,
  realtimeAtivo,
  controleTurnosAtivo,
  podeControlarSessao,
  totalParticipantesOnline,
  totalParticipantes,
  acaoTurnoPendente,
  onAvancarTurno,
  onPularTurno,
  onVoltarTurno,
  className = '',
}: SessionOperationalBarProps) {
  return (
    <section className={`session-operational-bar ${className}`}>
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
            <span className="session-operational-bar__shortcut">Shift + ,</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onPularTurno}
            disabled={sessaoEncerrada || Boolean(acaoTurnoPendente)}
          >
            <Icon name="skip-forward" className="mr-1 h-3.5 w-3.5" />
            {acaoTurnoPendente === 'PULAR' ? 'Pulando...' : 'Pular'}
            <span className="session-operational-bar__shortcut">Shift + /</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onAvancarTurno}
            disabled={sessaoEncerrada || Boolean(acaoTurnoPendente)}
          >
            <Icon name="forward" className="mr-1 h-3.5 w-3.5" />
            {acaoTurnoPendente === 'AVANCAR' ? 'Avancando...' : 'Avancar'}
            <span className="session-operational-bar__shortcut">.</span>
          </Button>
        </div>
      ) : null}
    </section>
  );
}

export type { AcaoControleTurno };

