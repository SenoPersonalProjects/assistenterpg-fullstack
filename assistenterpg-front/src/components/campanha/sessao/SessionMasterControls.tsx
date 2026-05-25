'use client';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
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

type SessionSceneControlPanelProps = Pick<
  SessionMasterControlsProps,
  | 'podeControlarSessao'
  | 'sessaoEncerrada'
  | 'cenaTipo'
  | 'cenaNome'
  | 'opcoesCena'
  | 'limitesCategoriaAtivo'
  | 'atualizandoCena'
  | 'erroCena'
  | 'onCenaTipoChange'
  | 'onCenaNomeChange'
  | 'onAtualizarCena'
  | 'onToggleLimitesCategoria'
>;

type SessionTableOperationsPanelProps = Pick<
  SessionMasterControlsProps,
  | 'sessaoEncerrada'
  | 'controleTurnosAtivo'
  | 'acaoTurnoPendente'
  | 'encerrandoSessao'
  | 'erroTurnos'
  | 'erroEncerramento'
  | 'onControleTurno'
  | 'onSolicitarEncerrarSessao'
>;

function MasterOnlyPanel() {
  return (
    <SessionPanel
      title="Controle da sessão"
      subtitle="Apenas o mestre pode controlar cena e turnos."
      tone="control"
    >
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-4 rounded-full bg-app-secondary/10 p-4 text-app-secondary">
          <Icon name="lock" className="h-8 w-8" />
        </div>
        <p className="max-w-xs text-sm font-bold text-app-muted">
          Apenas o mestre pode alterar a cena, controlar turnos e encerrar a sessão.
        </p>
      </div>
    </SessionPanel>
  );
}

export function SessionSceneControlPanel({
  podeControlarSessao,
  sessaoEncerrada,
  cenaTipo,
  cenaNome,
  opcoesCena,
  limitesCategoriaAtivo,
  atualizandoCena,
  erroCena,
  onCenaTipoChange,
  onCenaNomeChange,
  onAtualizarCena,
  onToggleLimitesCategoria,
}: SessionSceneControlPanelProps) {
  if (!podeControlarSessao) {
    return <MasterOnlyPanel />;
  }

  return (
    <SessionPanel
      title="Controle de cena"
      subtitle="Ajuste o contexto e as regras da cena atual."
      tone="control"
    >
      <div className="space-y-5">
        {erroCena && <ErrorAlert message={erroCena} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Tipo de cena"
            value={cenaTipo}
            onChange={(event) =>
              onCenaTipoChange(event.target.value as TipoCenaSessaoCampanha)
            }
            options={opcoesCena}
            disabled={sessaoEncerrada}
            className="font-bold"
          />
          <Input
            label="Nome da cena"
            value={cenaNome}
            onChange={(event) => onCenaNomeChange(event.target.value)}
            maxLength={120}
            disabled={sessaoEncerrada}
            placeholder="Ex.: Floresta das Sombras"
            className="font-bold"
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-app-border/40 bg-app-surface/50 p-4 transition-colors hover:bg-app-surface/70">
          <div className="min-w-0">
            <span className="block text-xs font-black text-app-fg">
              Limites por categoria
            </span>
            <span className="mt-1 block text-xs font-medium leading-relaxed text-app-muted">
              Aplica restrições por grau do personagem.
            </span>
          </div>
          <Checkbox
            checked={limitesCategoriaAtivo}
            onChange={(event) => onToggleLimitesCategoria(event.target.checked)}
            disabled={sessaoEncerrada}
          />
        </div>

        <Button
          variant="secondary"
          className="w-full font-black shadow-lg shadow-app-secondary/10 group"
          onClick={onAtualizarCena}
          disabled={atualizandoCena || sessaoEncerrada}
        >
          <Icon
            name="refresh"
            className={`mr-2 h-4 w-4 transition-transform group-hover:rotate-180 ${
              atualizandoCena ? 'animate-spin' : ''
            }`}
          />
          {atualizandoCena ? 'Atualizando...' : 'Atualizar cena'}
        </Button>
      </div>
    </SessionPanel>
  );
}

export function SessionTableOperationsPanel({
  sessaoEncerrada,
  controleTurnosAtivo,
  acaoTurnoPendente,
  encerrandoSessao,
  erroTurnos,
  erroEncerramento,
  onControleTurno,
  onSolicitarEncerrarSessao,
}: SessionTableOperationsPanelProps) {
  return (
    <SessionPanel
      title="Operações de mesa"
      subtitle="Gerencie turnos e encerramento."
      tone="control"
    >
      <div className="space-y-6">
        {erroTurnos && <ErrorAlert message={erroTurnos} />}
        {erroEncerramento && <ErrorAlert message={erroEncerramento} />}

        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-app-primary">
            Turnos
          </h4>

          <div className="session-turn-control">
            {controleTurnosAtivo ? (
              <div className="space-y-4">
                <div className="session-turn-control__head">
                  <span className="text-xs font-bold text-app-fg">
                    Controle de turnos ativo
                  </span>
                  <div className="session-turn-control__actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onControleTurno('VOLTAR')}
                      disabled={Boolean(acaoTurnoPendente) || sessaoEncerrada}
                      className="session-turn-control__button"
                      title="Voltar turno"
                    >
                      <Icon name="rotate-ccw" className="h-4 w-4" />
                      <span>Voltar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onControleTurno('PULAR')}
                      disabled={Boolean(acaoTurnoPendente) || sessaoEncerrada}
                      className="session-turn-control__button"
                      title="Pular turno"
                    >
                      <Icon name="skip-forward" className="h-4 w-4" />
                      <span>Pular</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onControleTurno('AVANCAR')}
                      disabled={Boolean(acaoTurnoPendente) || sessaoEncerrada}
                      className="session-turn-control__button"
                      title="Avançar turno"
                    >
                      <Icon name="forward" className="h-4 w-4" />
                      <span>Avançar</span>
                    </Button>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs font-medium text-app-muted">
                  <Icon name="info" className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>
                    Use os atalhos{' '}
                    <kbd className="rounded border border-app-border bg-app-surface px-1.5 py-0.5">
                      .
                    </kbd>{' '}
                    e{' '}
                    <kbd className="rounded border border-app-border bg-app-surface px-1.5 py-0.5">
                      Shift + ,
                    </kbd>{' '}
                    para agilidade.
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-3 text-center">
                <p className="text-xs font-bold text-app-muted">
                  Controle de turnos desativado nesta sessão.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 border-t border-app-border/30 pt-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-app-danger">
            Encerramento
          </h4>
          <Button
            variant="destructive"
            className="w-full justify-start font-black transition-all group"
            onClick={onSolicitarEncerrarSessao}
            disabled={encerrandoSessao || sessaoEncerrada}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white/20 p-1.5 transition-colors group-hover:bg-white/30">
                <Icon name="delete" className="h-4 w-4" />
              </div>
              {encerrandoSessao
                ? 'Encerrando...'
                : sessaoEncerrada
                  ? 'Sessão encerrada'
                  : 'Encerrar sessão'}
            </div>
          </Button>
        </div>
      </div>
    </SessionPanel>
  );
}

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
    return <MasterOnlyPanel />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SessionSceneControlPanel
        podeControlarSessao={podeControlarSessao}
        sessaoEncerrada={sessaoEncerrada}
        cenaTipo={cenaTipo}
        cenaNome={cenaNome}
        opcoesCena={opcoesCena}
        limitesCategoriaAtivo={limitesCategoriaAtivo}
        atualizandoCena={atualizandoCena}
        erroCena={erroCena}
        onCenaTipoChange={onCenaTipoChange}
        onCenaNomeChange={onCenaNomeChange}
        onAtualizarCena={onAtualizarCena}
        onToggleLimitesCategoria={onToggleLimitesCategoria}
      />
      <SessionTableOperationsPanel
        sessaoEncerrada={sessaoEncerrada}
        controleTurnosAtivo={controleTurnosAtivo}
        acaoTurnoPendente={acaoTurnoPendente}
        encerrandoSessao={encerrandoSessao}
        erroTurnos={erroTurnos}
        erroEncerramento={erroEncerramento}
        onControleTurno={onControleTurno}
        onSolicitarEncerrarSessao={onSolicitarEncerrarSessao}
      />
    </div>
  );
}

export type { AcaoControleTurno as AcaoControleTurnoMaster };
