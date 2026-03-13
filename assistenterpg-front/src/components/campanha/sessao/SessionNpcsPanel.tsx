'use client';

import type { ReactNode } from 'react';
import { SessionPanel } from '@/components/campanha/sessao/SessionPanel';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import type {
  CondicaoAtivaSessaoCampanha,
  NpcAmeacaResumo,
  NpcSessaoCampanha,
} from '@/lib/types';
import type { NpcEditavel } from '@/components/campanha/sessao/types';
import { NpcSessionCard } from '@/components/campanha/sessao/NpcSessionCard';

type SessionNpcsPanelProps = {
  npcs: NpcSessaoCampanha[];
  podeControlarSessao: boolean;
  sessaoEncerrada: boolean;
  npcsDisponiveis: NpcAmeacaResumo[];
  edicaoNpcs: Record<number, NpcEditavel>;
  salvandoNpcId: number | null;
  removendoNpcId: number | null;
  onAbrirAdicionar: () => void;
  onAtualizarCampo: (
    npc: NpcSessaoCampanha,
    campo: keyof NpcEditavel,
    valor: string,
  ) => void;
  onSalvarNpc: (npc: NpcSessaoCampanha) => void;
  onSolicitarRemoverNpc: (npc: NpcSessaoCampanha) => void;
  renderPainelCondicoes: (
    alvoTipo: 'PERSONAGEM' | 'NPC',
    alvoId: number,
    nomeAlvo: string,
    condicoesAtivas: CondicaoAtivaSessaoCampanha[],
  ) => ReactNode;
  labelTipoNpc: (tipo: string) => string;
};

export function SessionNpcsPanel({
  npcs,
  podeControlarSessao,
  sessaoEncerrada,
  npcsDisponiveis,
  edicaoNpcs,
  salvandoNpcId,
  removendoNpcId,
  onAbrirAdicionar,
  onAtualizarCampo,
  onSalvarNpc,
  onSolicitarRemoverNpc,
  renderPainelCondicoes,
  labelTipoNpc,
}: SessionNpcsPanelProps) {
  return (
    <>
      <SessionPanel
        title="Aliados ou ameacas na cena"
        subtitle="Mestre adiciona e ajusta aliados ou ameacas por cena. Jogadores visualizam em modo leitura."
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
      />

      {npcs.length === 0 ? (
        <EmptyState
          variant="card"
          icon="curse"
          title="Sem aliados ou ameacas nesta cena"
          description="O mestre pode adicionar aliados ou ameacas para esta cena."
        />
      ) : (
        npcs.map((npc) => (
          <NpcSessionCard
            key={npc.npcSessaoId}
            npc={npc}
            podeControlarSessao={podeControlarSessao}
            sessaoEncerrada={sessaoEncerrada}
            draft={edicaoNpcs[npc.npcSessaoId]}
            salvando={salvandoNpcId === npc.npcSessaoId}
            removendo={removendoNpcId === npc.npcSessaoId}
            onAtualizarCampo={onAtualizarCampo}
            onSalvar={() => onSalvarNpc(npc)}
            onSolicitarRemover={() => onSolicitarRemoverNpc(npc)}
            renderPainelCondicoes={renderPainelCondicoes}
            labelTipoNpc={labelTipoNpc}
          />
        ))
      )}
    </>
  );
}
