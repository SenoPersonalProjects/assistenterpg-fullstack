'use client';

import type { DragEvent } from 'react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { SessionPanel } from '@/components/campanha/sessao/SessionPanel';
import type { AcaoControleTurno } from '@/components/campanha/sessao/types';
import type {
  EstadoIniciativaAlternadaSessao,
  ParticipanteIniciativaSessaoCampanha,
  TipoCenaSessaoCampanha,
} from '@/lib/types';

type SessionInitiativePanelProps = {
  sessaoEncerrada: boolean;
  controleTurnosAtivo: boolean;
  iniciativaOrdem: ParticipanteIniciativaSessaoCampanha[];
  iniciativaIndiceAtual: number | null;
  podeControlarSessao: boolean;
  acaoTurnoPendente?: AcaoControleTurno | null;
  reordenandoIniciativa: boolean;
  sucessoReordenacao?: boolean;
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
  cenaTipo?: TipoCenaSessaoCampanha;
  rodadaAtual?: number | null;
  iniciativaAlternada?: EstadoIniciativaAlternadaSessao | null;
  escaladaAtiva?: boolean;
  bonusEscaladaDados?: number;
  atualizandoEscalada?: boolean;
  onAtualizarEscaladaBonus?: (bonusAtual: number) => void;
  onMarcarIniciativaAlternada?: (
    participanteToken: string,
    jaAgiu: boolean,
  ) => void;
  onAtualizarIniciativaAlternada?: (
    lados: EstadoIniciativaAlternadaSessao['lados'],
  ) => void;
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
  reordenandoIniciativa,
  sucessoReordenacao,
  indiceIniciativaArrastado,
  indiceIniciativaHover,
  erro,
  onSetIndiceIniciativaArrastado,
  onSetIndiceIniciativaHover,
  onDropIniciativa,
  onMoverIniciativa,
  onEditarIniciativa,
  cenaTipo = 'LIVRE',
  iniciativaAlternada,
  escaladaAtiva = false,
  bonusEscaladaDados = 0,
  atualizandoEscalada = false,
  onAtualizarEscaladaBonus,
  onMarcarIniciativaAlternada,
  onAtualizarIniciativaAlternada,
  labelParticipanteIniciativa,
}: SessionInitiativePanelProps) {
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdResetExecutadoRef = useRef(false);
  const [segurandoEscalada, setSegurandoEscalada] = useState(false);
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
  const iniciativaAlternadaAtiva =
    cenaTipo === 'COMBATE' &&
    controleTurnosAtivo &&
    Boolean(iniciativaAlternada?.ativo) &&
    Boolean(iniciativaAlternada?.lados.length);

  const iniciarHoldEscalada = () => {
    if (!podeControlarSessao || sessaoEncerrada || !onAtualizarEscaladaBonus) return;
    holdResetExecutadoRef.current = false;
    setSegurandoEscalada(true);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => {
      holdResetExecutadoRef.current = true;
      setSegurandoEscalada(false);
      onAtualizarEscaladaBonus(0);
    }, 3000);
  };

  const finalizarHoldEscalada = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setSegurandoEscalada(false);
  };

  const incrementarEscalada = () => {
    if (!podeControlarSessao || sessaoEncerrada || !onAtualizarEscaladaBonus) return;
    if (holdResetExecutadoRef.current) {
      holdResetExecutadoRef.current = false;
      return;
    }
    onAtualizarEscaladaBonus((bonusEscaladaDados + 1) % 7);
  };

  const controleEscalada =
    cenaTipo === 'COMBATE' && escaladaAtiva ? (
      <button
        type="button"
        className={`session-escalada-button${
          segurandoEscalada ? ' session-escalada-button--holding' : ''
        }`}
        disabled={
          !podeControlarSessao ||
          sessaoEncerrada ||
          atualizandoEscalada ||
          !onAtualizarEscaladaBonus
        }
        title="Escalada de Dados: clique para aumentar, segure por 3s para zerar."
        onMouseDown={iniciarHoldEscalada}
        onMouseUp={finalizarHoldEscalada}
        onMouseLeave={finalizarHoldEscalada}
        onTouchStart={iniciarHoldEscalada}
        onTouchEnd={finalizarHoldEscalada}
        onClick={incrementarEscalada}
      >
        <Icon name="dice" className="h-4 w-4" />
        <span>+{bonusEscaladaDados}</span>
        <span className="session-escalada-button__progress" />
      </button>
    ) : null;
  const rightContent = (
    <div className="flex flex-wrap items-center gap-2">
      {controleEscalada}
      <span className="session-panel-meta">
        {iniciativaAlternadaAtiva
          ? 'Iniciativa alternada'
          : controleTurnosAtivo
            ? 'Turnos ativos'
            : 'Turnos livres'}
      </span>
      {reordenandoIniciativa ? (
        <Badge color="yellow" size="sm" title="Reordenando iniciativa">
          <Icon name="shuffle" className="mr-1 h-3.5 w-3.5" />
          Reordenando
        </Badge>
      ) : null}
      {sucessoReordenacao ? (
        <Badge color="green" size="sm">
          Ordem atualizada
        </Badge>
      ) : null}
    </div>
  );
  const ladoAtual =
    iniciativaAlternadaAtiva && iniciativaAlternada
      ? iniciativaAlternada.lados.find(
          (lado) => lado.id === iniciativaAlternada.ladoAtualId,
        ) ??
        iniciativaAlternada.lados[0] ??
        null
      : null;
  const participantesAlternados =
    iniciativaAlternada?.lados.flatMap((lado) =>
      lado.participantes.map((participante) => ({
        ...participante,
        ladoId: lado.id,
      })),
    ) ?? [];

  const moverParticipanteAlternado = (
    participanteToken: string,
    novoLadoId: number,
  ) => {
    if (!iniciativaAlternada || !onAtualizarIniciativaAlternada) return;
    const participanteAtual = participantesAlternados.find(
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
            ordem: participantesSemAtual.length,
          },
        ],
      };
    });
    onAtualizarIniciativaAlternada(ladosAtualizados);
  };

  return (
    <SessionPanel
      title="Ordem de iniciativa"
      subtitle={
        podeControlarSessao
          ? 'Arraste ou use as setas para reordenar participantes.'
          : 'Acompanhe a ordem da cena em tempo real.'
      }
      tone="main"
      right={rightContent}
    >
      {erro ? <ErrorAlert message={erro} /> : null}
      {iniciativaAlternadaAtiva && iniciativaAlternada && ladoAtual ? (
        <div className="session-box space-y-3">
          <div className="session-alternating-head">
            <div>
              <p className="session-alternating-title">Vez de {ladoAtual.nome}</p>
              <p className="session-alternating-hint">
                Marque participantes que já agiram antes de avançar para o outro lado.
              </p>
            </div>
            <Badge color="green" size="sm">
              {ladoAtual.participantes.filter((participante) => participante.jaAgiu).length}/
              {ladoAtual.participantes.length}
            </Badge>
          </div>

          <div className="session-alternating-participants">
            {ladoAtual.participantes.length === 0 ? (
              <p className="text-xs font-medium text-app-muted">
                Este lado ainda não tem participantes.
              </p>
            ) : null}
            {ladoAtual.participantes.map((participante) => (
              <label
                key={participante.participanteToken}
                className="session-alternating-participant"
              >
                <span className="min-w-0 truncate text-xs font-bold text-app-fg">
                  {participante.nome}
                </span>
                <Checkbox
                  checked={participante.jaAgiu}
                  disabled={
                    sessaoEncerrada ||
                    !podeControlarSessao ||
                    !onMarcarIniciativaAlternada
                  }
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

          <div className="session-alternating-sides">
            {iniciativaAlternada.lados.map((lado) => (
              <span
                key={lado.id}
                className={`session-alternating-side${
                  lado.id === ladoAtual.id ? ' session-alternating-side--active' : ''
                }`}
              >
                {lado.nome}
              </span>
            ))}
          </div>

          {podeControlarSessao ? (
            <details className="session-alternating-config">
              <summary>Configurar lados</summary>
              <div className="mt-3 grid gap-2">
                {participantesAlternados.map((participante) => (
                  <label
                    key={`config-${participante.participanteToken}`}
                    className="session-alternating-config-row"
                  >
                    <span className="truncate font-bold text-app-fg">
                      {participante.nome}
                    </span>
                    <select
                      value={participante.ladoId}
                      disabled={sessaoEncerrada || !onAtualizarIniciativaAlternada}
                      onChange={(event) =>
                        moverParticipanteAlternado(
                          participante.participanteToken,
                          Number(event.target.value),
                        )
                      }
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
          ) : null}
        </div>
      ) : (
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
          <details className="session-text-xxs text-app-muted">
            <summary className="cursor-pointer">Como funciona a reordenacao</summary>
            <p className="mt-1">
              Ao mover na ordem, a INI fica 1 ponto acima ou abaixo do vizinho.
            </p>
          </details>
        ) : null}

        {iniciativaOrdem.length === 0 ? (
          <EmptyState
            variant="session"
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
              const reordenando = reordenandoIniciativa;
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
                  }${arrastando ? ' session-iniciativa-linha--dragging' : ''}${
                    reordenando ? ' session-iniciativa-linha--reordenando' : ''
                  }`}
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
      )}
    </SessionPanel>
  );
}
