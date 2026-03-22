'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Checkbox } from '@/components/ui/Checkbox';
import { SessionPanel } from '@/components/campanha/sessao/SessionPanel';
import type { TipoCenaSessaoCampanha } from '@/lib/types';
import type { AcaoControleTurno } from '@/components/campanha/sessao/types';

type SessionMasterControlsProps = {
  podeControlarSessao: boolean;
  sessaoEncerrada: boolean;
  controleTurnosAtivo: boolean;
  cenaTipo: TipoCenaSessaoCampanha;
  cenaNome: string;
  opcoesCena: Array<{ value: TipoCenaSessaoCampanha; label: string }>;
  limitesCategoriaAtivo: boolean;
  atualizandoCena: boolean;
  acaoTurnoPendente: AcaoControleTurno | null;
  encerrandoSessao: boolean;
  erroCena?: string | null;
  erroTurnos?: string | null;
  erroEncerramento?: string | null;
  onCenaTipoChange: (tipo: TipoCenaSessaoCampanha) => void;
  onCenaNomeChange: (nome: string) => void;
  onAtualizarCena: () => void;
  onToggleLimitesCategoria: (ativo: boolean) => void;
  onControleTurno: (acao: AcaoControleTurno) => void;
  onSolicitarEncerrarSessao: () => void;
};

export function SessionMasterControls({
  podeControlarSessao,
  sessaoEncerrada,
  controleTurnosAtivo,
  cenaTipo,
  cenaNome,
  opcoesCena,
  limitesCategoriaAtivo,
  atualizandoCena,
  acaoTurnoPendente,
  encerrandoSessao,
  erroCena,
  erroTurnos,
  erroEncerramento,
  onCenaTipoChange,
  onCenaNomeChange,
  onAtualizarCena,
  onToggleLimitesCategoria,
  onControleTurno,
  onSolicitarEncerrarSessao,
}: SessionMasterControlsProps) {
  if (!podeControlarSessao) {
    return (
      <SessionPanel
        title="Controle da sessao"
        subtitle="Apenas o mestre pode trocar cena e controlar turnos."
        tone="control"
      >
        <p className="text-sm text-app-muted">
          Apenas o mestre pode trocar cena e controlar turnos.
        </p>
      </SessionPanel>
    );
  }

  return (
    <SessionPanel
      title="Controle do mestre"
      subtitle="Ajustes de cena, turnos e encerramento da sessao."
      tone="control"
    >
      {erroCena ? <ErrorAlert message={erroCena} /> : null}
      {erroTurnos ? <ErrorAlert message={erroTurnos} /> : null}
      {erroEncerramento ? <ErrorAlert message={erroEncerramento} /> : null}

      <div className="session-master-group">
        <div className="session-master-group__head">Cena</div>
        <div className="session-master-group__body">
          <Select
            label="Tipo de cena"
            value={cenaTipo}
            onChange={(event) =>
              onCenaTipoChange(event.target.value as TipoCenaSessaoCampanha)
            }
            options={opcoesCena}
            disabled={sessaoEncerrada}
          />
          <Input
            label="Nome da cena (opcional)"
            value={cenaNome}
            onChange={(event) => onCenaNomeChange(event.target.value)}
            maxLength={120}
            disabled={sessaoEncerrada}
          />
          <label className="flex items-center gap-2 rounded border border-app-border bg-app-surface px-3 py-2 text-xs text-app-muted">
            <Checkbox
              checked={limitesCategoriaAtivo}
              onChange={(event) => onToggleLimitesCategoria(event.target.checked)}
              disabled={sessaoEncerrada}
            />
            <span>
              Aplicar limites por categoria de item (Grau do feiticeiro)
            </span>
          </label>
          <div className="flex items-center gap-2">
            <Button
              onClick={onAtualizarCena}
              disabled={atualizandoCena || sessaoEncerrada}
            >
              {atualizandoCena ? 'Atualizando...' : 'Atualizar cena'}
            </Button>
          </div>
        </div>
      </div>

      <div className="session-master-group">
        <div className="session-master-group__head">Turnos</div>
        <div className="session-master-group__body">
          {controleTurnosAtivo ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onControleTurno('VOLTAR')}
                  disabled={Boolean(acaoTurnoPendente) || sessaoEncerrada}
                >
                  {acaoTurnoPendente === 'VOLTAR' ? 'Voltando...' : 'Voltar turno'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onControleTurno('PULAR')}
                  disabled={Boolean(acaoTurnoPendente) || sessaoEncerrada}
                >
                  {acaoTurnoPendente === 'PULAR' ? 'Pulando...' : 'Pular turno'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onControleTurno('AVANCAR')}
                  disabled={Boolean(acaoTurnoPendente) || sessaoEncerrada}
                >
                  {acaoTurnoPendente === 'AVANCAR'
                    ? 'Avancando...'
                    : 'Avancar turno'}
                </Button>
              </div>
              <p className="text-xs text-app-muted">
                Atalhos: <span className="font-semibold">.</span> avancar |{' '}
                <span className="font-semibold">Shift + ,</span> voltar |{' '}
                <span className="font-semibold">Shift + /</span> pular.
              </p>
            </>
          ) : (
            <p className="text-xs text-app-muted">
              Controle de turnos desativado para esta sessao.
            </p>
          )}
        </div>
      </div>

      <div className="session-master-group session-master-group--danger">
        <div className="session-master-group__head">Encerramento</div>
        <div className="session-master-group__body">
          <Button
            variant="destructive"
            onClick={onSolicitarEncerrarSessao}
            disabled={encerrandoSessao || sessaoEncerrada}
          >
            {encerrandoSessao
              ? 'Encerrando...'
              : sessaoEncerrada
                ? 'Sessao encerrada'
                : 'Encerrar sessao'}
          </Button>
        </div>
      </div>
    </SessionPanel>
  );
}

export type { AcaoControleTurno as AcaoControleTurnoMaster };
