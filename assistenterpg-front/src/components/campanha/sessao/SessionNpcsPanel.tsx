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
  AlvoEncontroSocialSessao,
  UserErrorState,
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
  erro?: UserErrorState | null;
  onAbrirAdicionar: () => void;
  onAbrirAdicionarNpcSimples: () => void;
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
  onAlternarVisibilidadeNpc?: (npc: NpcSessaoCampanha) => void;
  renderPainelCondicoes: (
    alvoTipo: 'PERSONAGEM' | 'NPC',
    alvoId: number,
    nomeAlvo: string,
    condicoesAtivas: CondicaoAtivaSessaoCampanha[],
    modo?: 'inline' | 'accordion',
  ) => ReactNode;
  onRolarPericia: (payload: RolagemPericiaSessaoPayload) => void;
  onRolarExpressao: (payload: RolagemExpressaoSessaoPayload) => void;
  socialAtivo?: boolean;
  alvosSociais?: AlvoEncontroSocialSessao[];
  atualizandoAlvoSocial?: boolean;
  onAdicionarAlvoSocial?: (npc: NpcSessaoCampanha) => void;
  onRemoverAlvoSocial?: (npc: NpcSessaoCampanha) => void;
  onAtualizarAlvoSocial?: (
    alvo: AlvoEncontroSocialSessao,
    patch: Partial<AlvoEncontroSocialSessao>,
  ) => void;
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
  onAbrirAdicionarNpcSimples,
  onAtualizarCampo,
  onAtualizarAjustePersonalizado,
  onAplicarDeltaRecurso,
  onAplicarAjustePersonalizado,
  onSalvarNpc,
  onSolicitarRemoverNpc,
  onAlternarVisibilidadeNpc,
  renderPainelCondicoes,
  onRolarPericia,
  onRolarExpressao,
  socialAtivo = false,
  alvosSociais = [],
  atualizandoAlvoSocial = false,
  onAdicionarAlvoSocial,
  onRemoverAlvoSocial,
  onAtualizarAlvoSocial,
}: SessionNpcsPanelProps) {
  return (
    <SessionPanel
      title="Aliados ou ameaças na cena"
      subtitle="Mestre adiciona e ajusta aliados ou ameaças por cena. Jogadores visualizam em modo leitura."
      tone="aside"
      right={
        podeControlarSessao ? (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onAbrirAdicionarNpcSimples}
              disabled={sessaoEncerrada}
            >
              <Icon name="add" className="mr-1.5 h-3.5 w-3.5" />
              NPC simples
            </Button>
            <Button
              size="sm"
              onClick={onAbrirAdicionar}
              disabled={sessaoEncerrada || npcsDisponiveis.length === 0}
            >
              <Icon name="add" className="mr-1.5 h-3.5 w-3.5" />
              Da lista
            </Button>
          </div>
        ) : undefined
      }
    >
      {erro ? <ErrorAlert message={erro} /> : null}

      {npcs.length === 0 ? (
        <EmptyState
          variant="session"
          size="sm"
          icon="curse"
          title="Sem aliados ou ameaças nesta cena"
          description="O mestre pode adicionar aliados ou ameaças para esta cena."
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
            onAlternarVisibilidade={() => onAlternarVisibilidadeNpc?.(npc)}
            renderPainelCondicoes={renderPainelCondicoes}
            onRolarPericia={onRolarPericia}
            onRolarExpressao={onRolarExpressao}
            socialAtivo={socialAtivo}
            alvoSocial={
              alvosSociais.find((alvo) => alvo.npcSessaoId === npc.npcSessaoId) ?? null
            }
            atualizandoAlvoSocial={atualizandoAlvoSocial}
            onAdicionarAlvoSocial={() => onAdicionarAlvoSocial?.(npc)}
            onRemoverAlvoSocial={() => onRemoverAlvoSocial?.(npc)}
            onAtualizarAlvoSocial={onAtualizarAlvoSocial}
          />
        ))
      )}
    </SessionPanel>
  );
}
