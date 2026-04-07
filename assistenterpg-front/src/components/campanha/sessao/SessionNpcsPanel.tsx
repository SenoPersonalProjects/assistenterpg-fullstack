'use client';

import type { ReactNode } from 'react';
import { SessionPanel } from '@/components/campanha/sessao/SessionPanel';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import type {
  CondicaoAtivaSessaoCampanha,
  NpcAmeacaResumo,
  NpcSessaoCampanha,
} from '@/lib/types';
import type {
  AjustesRecursosNpc,
  CampoAjusteRecursoNpc,
  NpcEditavel,
} from '@/components/campanha/sessao/types';
import type {
  RolagemExpressaoSessaoPayload,
  RolagemPericiaSessaoPayload,
} from '@/components/campanha/sessao/types';
import { NpcSessionCard } from '@/components/campanha/sessao/NpcSessionCard';

type SessionNpcsPanelProps = {
  npcs: NpcSessaoCampanha[];
  podeControlarSessao: boolean;
  sessaoEncerrada: boolean;
  npcsDisponiveis: NpcAmeacaResumo[];
  iniciativaPorNpcSessao: Map<number, number>;
  edicaoNpcs: Record<number, NpcEditavel>;
  ajustesRecursosNpc: Record<number, AjustesRecursosNpc>;
  salvandoNpcId: number | null;
  campoRecursoPendente: `${number}:${CampoAjusteRecursoNpc}` | null;
  removendoNpcId: number | null;
  erro?: string | null;
  onAbrirAdicionar: () => void;
  onAtualizarCampo: (
    npc: NpcSessaoCampanha,
    campo: keyof NpcEditavel,
    valor: string,
  ) => void;
  onAtualizarAjustePersonalizado: (
    npc: NpcSessaoCampanha,
    campo: CampoAjusteRecursoNpc,
    valor: string,
  ) => void;
  onAplicarDeltaRecurso: (
    npc: NpcSessaoCampanha,
    campo: CampoAjusteRecursoNpc,
    delta: number,
  ) => void;
  onAplicarAjustePersonalizado: (
    npc: NpcSessaoCampanha,
    campo: CampoAjusteRecursoNpc,
  ) => void;
  onSalvarNpc: (npc: NpcSessaoCampanha) => void;
  onSolicitarRemoverNpc: (npc: NpcSessaoCampanha) => void;
  renderPainelCondicoes: (
    alvoTipo: 'PERSONAGEM' | 'NPC',
    alvoId: number,
    nomeAlvo: string,
    condicoesAtivas: CondicaoAtivaSessaoCampanha[],
    modo?: 'inline' | 'accordion',
  ) => ReactNode;
  onRolarPericia: (payload: RolagemPericiaSessaoPayload) => void;
  onRolarExpressao: (payload: RolagemExpressaoSessaoPayload) => void;
};

export function SessionNpcsPanel({
  npcs,
  podeControlarSessao,
  sessaoEncerrada,
  npcsDisponiveis,
  iniciativaPorNpcSessao,
  edicaoNpcs,
  ajustesRecursosNpc,
  salvandoNpcId,
  campoRecursoPendente,
  removendoNpcId,
  erro,
  onAbrirAdicionar,
  onAtualizarCampo,
  onAtualizarAjustePersonalizado,
  onAplicarDeltaRecurso,
  onAplicarAjustePersonalizado,
  onSalvarNpc,
  onSolicitarRemoverNpc,
  renderPainelCondicoes,
  onRolarPericia,
  onRolarExpressao,
}: SessionNpcsPanelProps) {
  return (
    <SessionPanel
      title="Aliados ou ameacas na cena"
      subtitle="Mestre adiciona e ajusta aliados ou ameacas por cena. Jogadores visualizam em modo leitura."
      tone="aside"
      right={
        podeControlarSessao ? (
          <Button
            size="sm"
            onClick={onAbrirAdicionar}
            disabled={sessaoEncerrada || npcsDisponiveis.length === 0}
          >
            <Icon name="add" className="mr-1.5 h-3.5 w-3.5" />
            Adicionar
          </Button>
        ) : undefined
      }
    >
      {erro ? <ErrorAlert message={erro} /> : null}

      {npcs.length === 0 ? (
        <EmptyState
          variant="session"
          size="sm"
          icon="curse"
          title="Sem aliados ou ameacas nesta cena"
          description="O mestre pode adicionar aliados ou ameacas para esta cena."
        />
      ) : (
        npcs.map((npc) => (
          <NpcSessionCard
            key={npc.npcSessaoId}
            npc={npc}
            iniciativaValor={iniciativaPorNpcSessao.get(npc.npcSessaoId) ?? null}
            podeControlarSessao={podeControlarSessao}
            sessaoEncerrada={sessaoEncerrada}
            draft={edicaoNpcs[npc.npcSessaoId]}
            ajustesRecursos={ajustesRecursosNpc[npc.npcSessaoId] ?? { pv: '0', san: '0', ea: '0' }}
            campoRecursoPendente={
              campoRecursoPendente?.startsWith(`${npc.npcSessaoId}:`)
                ? (campoRecursoPendente.split(':')[1] as CampoAjusteRecursoNpc)
                : null
            }
            salvando={salvandoNpcId === npc.npcSessaoId}
            removendo={removendoNpcId === npc.npcSessaoId}
            onAtualizarCampo={onAtualizarCampo}
            onAtualizarAjustePersonalizado={(campo, valor) =>
              onAtualizarAjustePersonalizado(npc, campo, valor)
            }
            onAplicarDeltaRecurso={(campo, delta) =>
              onAplicarDeltaRecurso(npc, campo, delta)
            }
            onAplicarAjustePersonalizado={(campo) =>
              onAplicarAjustePersonalizado(npc, campo)
            }
            onSalvar={() => onSalvarNpc(npc)}
            onSolicitarRemover={() => onSolicitarRemoverNpc(npc)}
            renderPainelCondicoes={renderPainelCondicoes}
            onRolarPericia={onRolarPericia}
            onRolarExpressao={onRolarExpressao}
          />
        ))
      )}
    </SessionPanel>
  );
}
