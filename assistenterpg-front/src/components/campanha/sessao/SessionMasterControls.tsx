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

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SessionPanel
        title="Controle de cena"
        subtitle="Ajuste o contexto e as regras da cena atual."
        tone="control"
      >
        <div className="space-y-4">
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

          <div className="flex items-center justify-between rounded-2xl bg-app-surface/40 p-3.5 border border-app-border/10 transition-colors hover:bg-app-surface/60">
            <div className="flex flex-col">
              <span className="text-xs font-black text-app-fg tracking-tight">Limites por categoria</span>
              <span className="text-[10px] font-medium text-app-muted leading-relaxed">Aplica restrições por grau do personagem.</span>
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
              className={`mr-2 h-4 w-4 transition-transform group-hover:rotate-180 ${atualizandoCena ? 'animate-spin' : ''}`}
            />
            {atualizandoCena ? 'Atualizando...' : 'Atualizar cena'}
          </Button>
        </div>
      </SessionPanel>

      <SessionPanel
        title="Operações de mesa"
        subtitle="Gerencie turnos e encerramento."
        tone="control"
      >
        <div className="space-y-6">
          {erroTurnos && <ErrorAlert message={erroTurnos} />}
          {erroEncerramento && <ErrorAlert message={erroEncerramento} />}

          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-app-primary">Turnos</h4>

            <div className="rounded-2xl border border-app-border/10 bg-app-surface/40 p-4">
              {controleTurnosAtivo ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-app-fg">Controle de turnos ativo</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => onControleTurno('VOLTAR')}
                        disabled={Boolean(acaoTurnoPendente) || sessaoEncerrada}
                        className="h-8 w-8 p-0 rounded-lg hover:bg-app-primary/10"
                        title="Reverter Turno"
                      >
                        <Icon name="rotate-ccw" className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => onControleTurno('PULAR')}
                        disabled={Boolean(acaoTurnoPendente) || sessaoEncerrada}
                        className="h-8 w-8 p-0 rounded-lg hover:bg-app-primary/10"
                        title="Pular Turno"
                      >
                        <Icon name="skip-forward" className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => onControleTurno('AVANCAR')}
                        disabled={Boolean(acaoTurnoPendente) || sessaoEncerrada}
                        className="h-8 w-8 p-0 rounded-lg hover:bg-app-primary/10"
                        title="Avançar Turno"
                      >
                        <Icon name="forward" className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-medium text-app-muted">
                    <Icon name="info" className="h-3 w-3" />
                    <span>Use os atalhos <kbd className="bg-app-surface px-1.5 py-0.5 rounded border border-app-border">.</kbd> e <kbd className="bg-app-surface px-1.5 py-0.5 rounded border border-app-border">Shift + ,</kbd> para agilidade.</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-2 text-center">
                  <p className="text-xs font-bold text-app-muted">Controle de turnos desativado nesta sessão.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-app-border/10">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-app-danger">Encerramento</h4>
            <Button
              variant="destructive"
              className="w-full justify-start font-black group transition-all"
              onClick={onSolicitarEncerrarSessao}
              disabled={encerrandoSessao || sessaoEncerrada}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white/20 p-1.5 group-hover:bg-white/30 transition-colors">
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
    </div>
  );
}

export type { AcaoControleTurno as AcaoControleTurnoMaster };
