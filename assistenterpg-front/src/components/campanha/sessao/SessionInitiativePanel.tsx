'use client';

import type { DragEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { SessionPanel } from '@/components/campanha/sessao/SessionPanel';
import type { AcaoControleTurno } from '@/components/campanha/sessao/types';
import type { ParticipanteIniciativaSessaoCampanha } from '@/lib/types';

type SessionInitiativePanelProps = {
  sessaoEncerrada: boolean;
  controleTurnosAtivo: boolean;
  iniciativaOrdem: ParticipanteIniciativaSessaoCampanha[];
  iniciativaIndiceAtual: number | null;
  podeControlarSessao: boolean;
  acaoTurnoPendente?: AcaoControleTurno | null;
  reordenandoIniciativa: boolean;
  indiceIniciativaArrastado: number | null;
  indiceIniciativaHover: number | null;
  erro?: string | null;
  onAvancarTurno?: () => void;
  onVoltarTurno?: () => void;
  onSetIndiceIniciativaArrastado: (indice: number | null) => void;
  onSetIndiceIniciativaHover: (indice: number | null) => void;
  onDropIniciativa: (indiceDestino: number) => void;
  onMoverIniciativa: (indice: number, direcao: 'SUBIR' | 'DESCER') => void;
  onEditarIniciativa?: (participante: ParticipanteIniciativaSessaoCampanha) => void;
  labelParticipanteIniciativa: (
    participante: Pick<
      ParticipanteIniciativaSessaoCampanha,
      'tipoParticipante' | 'nomePersonagem' | 'nomeJogador'
    >,
  ) => string;
};

export function SessionInitiativePanel({
  sessaoEncerrada,
  controleTurnosAtivo,
  iniciativaOrdem,
  iniciativaIndiceAtual,
  podeControlarSessao,
  acaoTurnoPendente,
  reordenandoIniciativa,
  indiceIniciativaArrastado,
  indiceIniciativaHover,
  erro,
  onAvancarTurno,
  onVoltarTurno,
  onSetIndiceIniciativaArrastado,
  onSetIndiceIniciativaHover,
  onDropIniciativa,
  onMoverIniciativa,
  onEditarIniciativa,
  labelParticipanteIniciativa,
}: SessionInitiativePanelProps) {
  const indiceAtualValido =
    typeof iniciativaIndiceAtual === 'number' &&
    iniciativaIndiceAtual >= 0 &&
    iniciativaIndiceAtual < iniciativaOrdem.length;
  const turnoAtual = indiceAtualValido
    ? iniciativaOrdem[iniciativaIndiceAtual]
    : null;
  const indiceProximo =
    controleTurnosAtivo && iniciativaOrdem.length > 0
      ? indiceAtualValido
        ? (iniciativaIndiceAtual + 1) % iniciativaOrdem.length
        : 0
      : null;
  const proximoParticipante =
    indiceProximo !== null ? iniciativaOrdem[indiceProximo] : null;
  const mostrarAjudaReordenacao = podeControlarSessao && controleTurnosAtivo;
  const turnoAtualResumo = turnoAtual
    ? labelParticipanteIniciativa(turnoAtual)
    : 'Aguardando inicio';
  const proximoResumo = proximoParticipante
    ? labelParticipanteIniciativa(proximoParticipante)
    : '—';
  const podeControlarTurnos =
    podeControlarSessao &&
    controleTurnosAtivo &&
    typeof onAvancarTurno === 'function' &&
    typeof onVoltarTurno === 'function';
  const turnosDisabled = sessaoEncerrada || Boolean(acaoTurnoPendente);
  const rightContent = (
    <div className="flex flex-col items-end gap-2">
      {podeControlarTurnos ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="min-w-[110px]"
            onClick={onVoltarTurno}
            disabled={turnosDisabled}
          >
            <Icon name="chevron-left" className="mr-1 h-3.5 w-3.5" />
            {acaoTurnoPendente === 'VOLTAR' ? 'Voltando...' : 'Anterior'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="min-w-[110px]"
            onClick={onAvancarTurno}
            disabled={turnosDisabled}
          >
            <Icon name="chevron-right" className="mr-1 h-3.5 w-3.5" />
            {acaoTurnoPendente === 'AVANCAR' ? 'Avancando...' : 'Proximo'}
          </Button>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <Badge color={controleTurnosAtivo ? 'green' : 'gray'} size="sm">
          {controleTurnosAtivo ? 'Turnos ativos' : 'Turnos livres'}
        </Badge>
        {reordenandoIniciativa ? (
          <Badge color="yellow" size="sm" title="Reordenando iniciativa">
            <Icon name="shuffle" className="mr-1 h-3.5 w-3.5" />
            Reordenando
          </Badge>
        ) : null}
      </div>
    </div>
  );

  return (
    <SessionPanel
      title="Ordem de iniciativa"
      subtitle="Arraste ou use as setas para reordenar participantes."
      right={rightContent}
    >
      {erro ? <ErrorAlert message={erro} /> : null}
      <div className="session-box space-y-2">
        {controleTurnosAtivo ? (
          <div className="session-chip-row">
            <span className="session-chip">Turno atual: {turnoAtualResumo}</span>
            <span className="session-chip">Proximo: {proximoResumo}</span>
            <span className="session-chip">
              Total na fila: {iniciativaOrdem.length}
            </span>
          </div>
        ) : (
          <p className="text-xs text-app-muted">
            Controle de turnos desativado. Use a ordem como referencia rapida.
          </p>
        )}

        {mostrarAjudaReordenacao ? (
          <details className="text-[11px] text-app-muted">
            <summary className="cursor-pointer">Como funciona a reordenacao</summary>
            <p className="mt-1">
              Ao mover na ordem, a INI fica 1 ponto acima ou abaixo do vizinho.
            </p>
          </details>
        ) : null}

        {iniciativaOrdem.length === 0 ? (
          <EmptyState
            variant="plain"
            size="sm"
            icon="target"
            title="Iniciativa vazia"
            description={
              controleTurnosAtivo
                ? 'Adicione personagens ou NPCs para montar a fila.'
                : 'Ative o controle de turnos para organizar a fila.'
            }
          />
        ) : (
          <div className="space-y-1.5">
            {iniciativaOrdem.map((participante, indice) => {
              const emTurno = indiceAtualValido && iniciativaIndiceAtual === indice;
              const proximo = indiceProximo !== null && indiceProximo === indice;
              const primeiro = indice === 0;
              const ultimo = indice === iniciativaOrdem.length - 1;
              const podeArrastar =
                podeControlarSessao && !sessaoEncerrada && !reordenandoIniciativa;
              const hoverAtivo =
                indiceIniciativaHover === indice &&
                indiceIniciativaArrastado !== null &&
                indiceIniciativaArrastado !== indice;
              const arrastando = indiceIniciativaArrastado === indice;
              const nomeParticipante = labelParticipanteIniciativa(participante);

              return (
                <div
                  key={`${participante.tipoParticipante}-${participante.personagemSessaoId ?? participante.npcSessaoId ?? indice}`}
                  draggable={podeArrastar}
                  onDragStart={(event: DragEvent<HTMLDivElement>) => {
                    if (!podeArrastar) return;
                    onSetIndiceIniciativaArrastado(indice);
                    onSetIndiceIniciativaHover(indice);
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData('text/plain', String(indice));
                  }}
                  onDragOver={(event: DragEvent<HTMLDivElement>) => {
                    if (!podeArrastar) return;
                    event.preventDefault();
                    if (indiceIniciativaHover !== indice) {
                      onSetIndiceIniciativaHover(indice);
                    }
                    event.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(event: DragEvent<HTMLDivElement>) => {
                    if (!podeArrastar) return;
                    event.preventDefault();
                    onDropIniciativa(indice);
                  }}
                  onDragEnd={() => {
                    onSetIndiceIniciativaArrastado(null);
                    onSetIndiceIniciativaHover(null);
                  }}
                  className={`session-iniciativa-linha${
                    emTurno ? ' session-iniciativa-linha--turno' : ''
                  }${proximo ? ' session-iniciativa-linha--proximo' : ''}${
                    hoverAtivo ? ' session-iniciativa-linha--hover' : ''
                  }${arrastando ? ' session-iniciativa-linha--dragging' : ''}`}
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="session-iniciativa-handle">
                      <Icon name="menu-vertical" className="h-3 w-3" />
                    </span>
                    <span className="session-iniciativa-pos">#{indice + 1}</span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-app-fg">
                        {nomeParticipante}
                      </p>
                      <div className="session-iniciativa-meta">
                        <span>
                          INI{' '}
                          {typeof participante.valorIniciativa === 'number'
                            ? participante.valorIniciativa
                            : '--'}
                        </span>
                        {emTurno ? (
                          <Badge color="green" size="sm">
                            <Icon name="play" className="mr-1 h-3 w-3" />
                            Em turno
                          </Badge>
                        ) : null}
                        {proximo ? (
                          <Badge color="cyan" size="sm">
                            <Icon name="skip-forward" className="mr-1 h-3 w-3" />
                            Proximo
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  {podeControlarSessao ||
                  (onEditarIniciativa && participante.podeEditar) ? (
                    <div className="flex items-center gap-1">
                      {onEditarIniciativa && participante.podeEditar ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          title={`Editar iniciativa de ${nomeParticipante}`}
                          aria-label={`Editar iniciativa de ${nomeParticipante}`}
                          onClick={() => onEditarIniciativa(participante)}
                          disabled={sessaoEncerrada}
                        >
                          <Icon name="edit" className="w-3.5 h-3.5" />
                        </Button>
                      ) : null}
                      {podeControlarSessao ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            title={`Mover ${nomeParticipante} para cima`}
                            aria-label={`Mover ${nomeParticipante} para cima`}
                            onClick={() => onMoverIniciativa(indice, 'SUBIR')}
                            disabled={
                              sessaoEncerrada || reordenandoIniciativa || primeiro
                            }
                          >
                            <Icon name="chevron-up" className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title={`Mover ${nomeParticipante} para baixo`}
                            aria-label={`Mover ${nomeParticipante} para baixo`}
                            onClick={() => onMoverIniciativa(indice, 'DESCER')}
                            disabled={
                              sessaoEncerrada || reordenandoIniciativa || ultimo
                            }
                          >
                            <Icon name="chevron-down" className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SessionPanel>
  );
}
