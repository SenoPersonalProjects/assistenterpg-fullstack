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
  acaoTurnoPendente,
  onAvancarTurno,
  onPularTurno,
  onVoltarTurno,
  className = '',
}: SessionOperationalBarProps) {
  return (
    <section className={`session-operational-bar ${className}`}>
      <div className="session-operational-bar__context">
        <p className="session-operational-bar__scene">
          Cena: <strong>{cenaLabel}</strong>
          {cenaNome ? ` — ${cenaNome}` : ''}
        </p>
        <p className="session-operational-bar__turn">
          {controleTurnosAtivo ? (
            <>
              Rodada: <strong>{rodadaAtual ?? 1}</strong>
              {' | '}
              Turno: <strong>{turnoAtualLabel ?? 'Sem turno definido'}</strong>
              {proximoTurnoLabel ? (
                <>
                  {' | '}
                  Proximo: <strong>{proximoTurnoLabel}</strong>
                </>
              ) : null}
            </>
          ) : (
            <>
              <strong>Cena livre</strong> (sem controle de turnos)
            </>
          )}
        </p>
      </div>

      <div className="session-operational-bar__meta">
        <Badge color={sessaoEncerrada ? 'gray' : 'green'} size="sm">
          Sessao: {sessaoEncerrada ? 'Encerrada' : 'Ativa'}
        </Badge>
        <Badge color={realtimeAtivo ? 'cyan' : 'yellow'} size="sm">
          Sync: {realtimeAtivo ? 'Real-time' : 'Fallback'}
        </Badge>
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
        </div>
      ) : null}
    </section>
  );
}

export type { AcaoControleTurno };

