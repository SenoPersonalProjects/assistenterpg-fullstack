'use client';

import type { DragEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { SessionPanel } from '@/components/campanha/sessao/SessionPanel';
import type { ParticipanteIniciativaSessaoCampanha } from '@/lib/types';

type SessionInitiativePanelProps = {
  cenaLabel: string;
  cenaNome: string | null;
  sessaoEncerrada: boolean;
  totalParticipantesOnline: number;
  totalParticipantes: number;
  totalNpcs: number;
  controleTurnosAtivo: boolean;
  rodadaAtual: number | null;
  turnoAtualLabel: string | null;
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
  cenaLabel,
  cenaNome,
  sessaoEncerrada,
  totalParticipantesOnline,
  totalParticipantes,
  totalNpcs,
  controleTurnosAtivo,
  rodadaAtual,
  turnoAtualLabel,
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
  return (
    <SessionPanel
      title="Painel da sessao"
      subtitle="Cena, status de combate e ordem de iniciativa."
    >
      <p className="text-sm text-app-muted">Cena: {cenaLabel}</p>
      {cenaNome ? <p className="text-xs text-app-muted">{cenaNome}</p> : null}
      <p className="text-xs text-app-muted">
        Status: {sessaoEncerrada ? 'Encerrada' : 'Ativa'} | Participantes online:{' '}
        {totalParticipantesOnline}/{totalParticipantes}
      </p>
      <p className="text-xs text-app-muted">Aliados ou ameacas na cena: {totalNpcs}</p>

      {controleTurnosAtivo ? (
        <div className="session-box space-y-1">
          <p className="text-sm text-app-fg">Rodada: {rodadaAtual ?? 1}</p>
          <p className="text-sm text-app-fg">
            Turno atual: {turnoAtualLabel ?? 'Sem turno definido'}
          </p>
          <p className="text-xs text-app-muted">
            Ordem de iniciativa: {iniciativaOrdem.length} participante(s)
          </p>
          <p className="text-[11px] text-app-muted">
            Regra: ao mover na ordem, a INI fica 1 ponto acima/abaixo do vizinho.
          </p>
          {iniciativaOrdem.length > 0 ? (
            <div className="mt-2 space-y-1.5">
              {iniciativaOrdem.map((participante, indice) => {
                const emTurno = iniciativaIndiceAtual === indice;
                const primeiro = indice === 0;
                const ultimo = indice === iniciativaOrdem.length - 1;
                const podeArrastar =
                  podeControlarSessao && !sessaoEncerrada && !reordenandoIniciativa;
                const hoverAtivo =
                  indiceIniciativaHover === indice &&
                  indiceIniciativaArrastado !== null &&
                  indiceIniciativaArrastado !== indice;

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
                    }${hoverAtivo ? ' session-iniciativa-linha--hover' : ''}`}
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <span className="session-iniciativa-handle">
                        <Icon name="menu-vertical" className="h-3 w-3" />
                      </span>
                      <p className="truncate text-xs text-app-fg">
                        <span className="font-semibold mr-1">#{indice + 1}</span>
                        {labelParticipanteIniciativa(participante)}
                        <span className="ml-2 text-app-muted">
                          INI {participante.valorIniciativa}
                        </span>
                      </p>
                      {emTurno ? (
                        <span className="rounded border border-emerald-500/40 bg-emerald-500/12 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                          ⚡ Turno atual
                        </span>
                      ) : null}
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
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-app-muted">Cena livre: sem contagem de rodadas/turnos.</p>
      )}
    </SessionPanel>
  );
}
