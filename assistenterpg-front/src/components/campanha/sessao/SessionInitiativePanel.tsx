'use client';

import type { DragEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { SessionPanel } from '@/components/campanha/sessao/SessionPanel';
import type { ParticipanteIniciativaSessaoCampanha } from '@/lib/types';

type SessionInitiativePanelProps = {
  sessaoEncerrada: boolean;
  controleTurnosAtivo: boolean;
  iniciativaOrdem: ParticipanteIniciativaSessaoCampanha[];
  iniciativaIndiceAtual: number | null;
  podeControlarSessao: boolean;
  reordenandoIniciativa: boolean;
  indiceIniciativaArrastado: number | null;
  indiceIniciativaHover: number | null;
  onSetIndiceIniciativaArrastado: (indice: number | null) => void;
  onSetIndiceIniciativaHover: (indice: number | null) => void;
  onDropIniciativa: (indiceDestino: number) => void;
  onMoverIniciativa: (indice: number, direcao: 'SUBIR' | 'DESCER') => void;
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
  indiceIniciativaArrastado,
  indiceIniciativaHover,
  onSetIndiceIniciativaArrastado,
  onSetIndiceIniciativaHover,
  onDropIniciativa,
  onMoverIniciativa,
  labelParticipanteIniciativa,
}: SessionInitiativePanelProps) {
  const indiceProximo =
    controleTurnosAtivo && iniciativaOrdem.length > 0
      ? typeof iniciativaIndiceAtual === 'number'
        ? (iniciativaIndiceAtual + 1) % iniciativaOrdem.length
        : 0
      : null;
  const mostrarAjudaReordenacao = podeControlarSessao && controleTurnosAtivo;

  return (
    <SessionPanel
      title="Ordem de iniciativa"
      subtitle="Arraste ou use as setas para reordenar os participantes."
    >
      <div className="session-box space-y-2">
        {controleTurnosAtivo ? (
          <p className="text-xs text-app-muted">
            {iniciativaOrdem.length} participante(s) na fila de iniciativa.
          </p>
        ) : (
          <p className="text-xs text-app-muted">
            Controle de turnos desativado. A iniciativa pode ser organizada para
            referencia rapida.
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
          <p className="text-sm text-app-muted">
            Nenhum participante entrou na iniciativa ainda.
          </p>
        ) : (
          <div className="space-y-1.5">
            {iniciativaOrdem.map((participante, indice) => {
              const emTurno = iniciativaIndiceAtual === indice;
              const proximo =
                indiceProximo !== null &&
                indiceProximo === indice &&
                iniciativaIndiceAtual !== null;
              const primeiro = indice === 0;
              const ultimo = indice === iniciativaOrdem.length - 1;
              const podeArrastar =
                podeControlarSessao && !sessaoEncerrada && !reordenandoIniciativa;
              const hoverAtivo =
                indiceIniciativaHover === indice &&
                indiceIniciativaArrastado !== null &&
                indiceIniciativaArrastado !== indice;
              const arrastando = indiceIniciativaArrastado === indice;

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
                        {labelParticipanteIniciativa(participante)}
                      </p>
                      <div className="session-iniciativa-meta">
                        <span>INI {participante.valorIniciativa}</span>
                        {emTurno ? (
                          <Badge color="green" size="sm">
                            Em turno
                          </Badge>
                        ) : null}
                        {proximo ? (
                          <Badge color="cyan" size="sm">
                            Proximo
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  {podeControlarSessao ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMoverIniciativa(indice, 'SUBIR')}
                        disabled={sessaoEncerrada || reordenandoIniciativa || primeiro}
                      >
                        <Icon name="chevron-up" className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMoverIniciativa(indice, 'DESCER')}
                        disabled={sessaoEncerrada || reordenandoIniciativa || ultimo}
                      >
                        <Icon name="chevron-down" className="w-3.5 h-3.5" />
                      </Button>
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
