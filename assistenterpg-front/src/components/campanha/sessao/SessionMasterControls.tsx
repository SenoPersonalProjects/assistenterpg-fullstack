'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Checkbox } from '@/components/ui/Checkbox';
import { SessionPanel } from '@/components/campanha/sessao/SessionPanel';
import type {
  EstadoIniciativaAlternadaSessao,
  TipoCenaSessaoCampanha,
} from '@/lib/types';
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
  iniciativaAlternada?: EstadoIniciativaAlternadaSessao | null;
  optionalMechanicsPanel?: ReactNode;
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
  | 'iniciativaAlternada'
  | 'optionalMechanicsPanel'
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

export function InitiativeAlternadaPanel({
  iniciativaAlternada,
  sessaoEncerrada,
  onMarcarIniciativaAlternada,
  onAtualizarIniciativaAlternada,
}: {
  iniciativaAlternada: EstadoIniciativaAlternadaSessao;
  sessaoEncerrada: boolean;
  onMarcarIniciativaAlternada?: (
    participanteToken: string,
    jaAgiu: boolean,
  ) => void;
  onAtualizarIniciativaAlternada?: (
    lados: EstadoIniciativaAlternadaSessao['lados'],
  ) => void;
}) {
  const ladoAtual =
    iniciativaAlternada.lados.find((lado) => lado.id === iniciativaAlternada.ladoAtualId) ??
    iniciativaAlternada.lados[0] ??
    null;

  if (!ladoAtual) {
    return (
      <div className="rounded-2xl border border-app-border/50 bg-app-surface/60 p-3 text-xs font-medium text-app-muted">
        A iniciativa alternada está ativa, mas ainda não há lados configurados.
      </div>
    );
  }

  const todosParticipantes = iniciativaAlternada.lados.flatMap((lado) =>
    lado.participantes.map((participante) => ({
      ...participante,
      ladoId: lado.id,
    })),
  );

  const moverParticipante = (participanteToken: string, novoLadoId: number) => {
    if (!onAtualizarIniciativaAlternada) return;
    const participanteAtual = todosParticipantes.find(
      (participante) => participante.participanteToken === participanteToken,
    );
    if (!participanteAtual) return;
    const ladosAtualizados = iniciativaAlternada.lados.map((lado) => {
      const participantesSemAtual = lado.participantes.filter(
        (participante) => participante.participanteToken !== participanteToken,
      );
      if (lado.id !== novoLadoId) {
        return { ...lado, participantes: participantesSemAtual };
      }
      return {
        ...lado,
        participantes: [
          ...participantesSemAtual,
          {
            id: participanteAtual.id,
            participanteToken: participanteAtual.participanteToken,
            tipoParticipante: participanteAtual.tipoParticipante,
            personagemSessaoId: participanteAtual.personagemSessaoId,
            npcSessaoId: participanteAtual.npcSessaoId,
            nome: participanteAtual.nome,
            jaAgiu: false,
            ordem: lado.participantes.length,
          },
        ],
      };
    });
    onAtualizarIniciativaAlternada(ladosAtualizados);
  };

  return (
    <div className="space-y-3 rounded-2xl border border-app-primary/30 bg-app-primary/10 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-app-primary">
            Vez de {ladoAtual.nome}
          </p>
          <p className="text-[11px] font-medium text-app-muted">
            Marque quem já agiu antes de avançar para o outro lado.
          </p>
        </div>
        <span className="rounded-full bg-app-primary/15 px-2 py-1 text-[11px] font-black text-app-primary">
          {ladoAtual.participantes.filter((participante) => participante.jaAgiu).length}/
          {ladoAtual.participantes.length}
        </span>
      </div>
      <div className="grid gap-2">
        {ladoAtual.participantes.length === 0 ? (
          <p className="text-xs font-medium text-app-muted">
            Este lado ainda não tem participantes.
          </p>
        ) : null}
        {ladoAtual.participantes.map((participante) => (
          <label
            key={participante.participanteToken}
            className="flex items-center justify-between gap-3 rounded-xl border border-app-border/40 bg-app-card/80 px-3 py-2"
          >
            <span className="min-w-0 text-xs font-bold text-app-fg">
              {participante.nome}
            </span>
            <Checkbox
              checked={participante.jaAgiu}
              disabled={sessaoEncerrada || !onMarcarIniciativaAlternada}
              onChange={(event) =>
                onMarcarIniciativaAlternada?.(
                  participante.participanteToken,
                  event.target.checked,
                )
              }
            />
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {iniciativaAlternada.lados.map((lado) => (
          <span
            key={lado.id}
            className={`rounded-full px-2 py-1 text-[11px] font-black ${
              lado.id === ladoAtual.id
                ? 'bg-app-primary text-white'
                : 'bg-app-surface text-app-muted'
            }`}
          >
            {lado.nome}
          </span>
        ))}
      </div>
      <details className="rounded-xl border border-app-border/40 bg-app-card/70 p-3">
        <summary className="cursor-pointer text-xs font-black text-app-fg">
          Configurar lados
        </summary>
        <div className="mt-3 grid gap-2">
          {todosParticipantes.map((participante) => (
            <label
              key={`config-${participante.participanteToken}`}
              className="grid gap-2 rounded-lg border border-app-border/30 bg-app-surface/60 p-2 text-xs sm:grid-cols-[minmax(0,1fr)_150px] sm:items-center"
            >
              <span className="font-bold text-app-fg">{participante.nome}</span>
              <select
                value={participante.ladoId}
                disabled={sessaoEncerrada || !onAtualizarIniciativaAlternada}
                onChange={(event) =>
                  moverParticipante(participante.participanteToken, Number(event.target.value))
                }
                className="rounded-lg border border-app-border bg-app-bg px-2 py-1 font-bold text-app-fg"
              >
                {iniciativaAlternada.lados.map((lado) => (
                  <option key={lado.id} value={lado.id}>
                    {lado.nome}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </details>
    </div>
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
  iniciativaAlternada,
  optionalMechanicsPanel,
}: SessionTableOperationsPanelProps) {
  const iniciativaAlternadaAtiva =
    controleTurnosAtivo &&
    Boolean(iniciativaAlternada?.ativo) &&
    Boolean(iniciativaAlternada?.lados.length);

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
                    {iniciativaAlternadaAtiva
                      ? 'Iniciativa alternada ativa'
                      : 'Controle de turnos ativo'}
                  </span>
                  <div className="session-turn-control__actions">
                    {!iniciativaAlternadaAtiva ? (
                      <>
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
                      </>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onControleTurno('AVANCAR')}
                      disabled={Boolean(acaoTurnoPendente) || sessaoEncerrada}
                      className="session-turn-control__button"
                      title={iniciativaAlternadaAtiva ? 'Avançar lado' : 'Avançar turno'}
                    >
                      <Icon name="forward" className="h-4 w-4" />
                      <span>{iniciativaAlternadaAtiva ? 'Avançar lado' : 'Avançar'}</span>
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

        {optionalMechanicsPanel ? (
          <div className="space-y-3 border-t border-app-border/30 pt-4">
            {optionalMechanicsPanel}
          </div>
        ) : null}

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
  iniciativaAlternada,
  optionalMechanicsPanel,
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
        iniciativaAlternada={iniciativaAlternada}
        optionalMechanicsPanel={optionalMechanicsPanel}
      />
    </div>
  );
}

export type { AcaoControleTurno as AcaoControleTurnoMaster };
