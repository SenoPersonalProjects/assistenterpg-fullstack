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
  NpcSessaoCampanhaCompleto,
  AlvoEncontroSocialSessao,
  UserErrorState,
} from '@/lib/types';
import { ehNpcSessaoCampanhaCompleto } from '@/lib/campanha/sessao-atualizacoes';
import type {
  AjustesRecursosNpc,
  CampoAjusteRecursoNpc,
  NpcEditavel,
} from '@/components/campanha/sessao/types';
import type {
  RolagemAtaqueNpcAcaoSessaoPayload,
  RolagemDanoNpcAcaoSessaoPayload,
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
    npc: NpcSessaoCampanhaCompleto,
    campo: keyof NpcEditavel,
    valor: string,
  ) => void;
  onAtualizarAjustePersonalizado: (
    npc: NpcSessaoCampanhaCompleto,
    campo: CampoAjusteRecursoNpc,
    valor: string,
  ) => void;
  onAplicarDeltaRecurso: (
    npc: NpcSessaoCampanhaCompleto,
    campo: CampoAjusteRecursoNpc,
    delta: number,
  ) => void;
  onAplicarAjustePersonalizado: (
    npc: NpcSessaoCampanhaCompleto,
    campo: CampoAjusteRecursoNpc,
  ) => void;
  onSalvarNpc: (npc: NpcSessaoCampanhaCompleto) => void;
  onSolicitarRemoverNpc: (npc: NpcSessaoCampanhaCompleto) => void;
  onAlternarVisibilidadeNpc?: (npc: NpcSessaoCampanhaCompleto) => void;
  renderPainelCondicoes: (
    alvoTipo: 'PERSONAGEM' | 'NPC',
    alvoId: number,
    nomeAlvo: string,
    condicoesAtivas: CondicaoAtivaSessaoCampanha[],
    modo?: 'inline' | 'accordion',
  ) => ReactNode;
  onRolarPericia: (payload: RolagemPericiaSessaoPayload) => void;
  onRolarAtaqueAcao: (payload: RolagemAtaqueNpcAcaoSessaoPayload) => void;
  onRolarDanoAcao: (payload: RolagemDanoNpcAcaoSessaoPayload) => void;
  socialAtivo?: boolean;
  alvosSociais?: AlvoEncontroSocialSessao[];
  atualizandoAlvoSocial?: boolean;
  onAdicionarAlvoSocial?: (npc: NpcSessaoCampanhaCompleto) => void;
  onRemoverAlvoSocial?: (npc: NpcSessaoCampanhaCompleto) => void;
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
  onRolarAtaqueAcao,
  onRolarDanoAcao,
  socialAtivo = false,
  alvosSociais = [],
  atualizandoAlvoSocial = false,
  onAdicionarAlvoSocial,
  onRemoverAlvoSocial,
  onAtualizarAlvoSocial,
}: SessionNpcsPanelProps) {
  const npcsCompletos = npcs.filter(ehNpcSessaoCampanhaCompleto);
  const npcsResumidos = npcs.filter(
    (npc) => !ehNpcSessaoCampanhaCompleto(npc),
  );

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
        <>
          {npcsCompletos.map((npc) => (
            <NpcSessionCard
              key={npc.npcSessaoId}
              npc={npc}
            iniciativaValor={iniciativaPorNpcSessao.get(npc.npcSessaoId) ?? null}
            podeControlarSessao={podeControlarSessao}
            sessaoEncerrada={sessaoEncerrada}
            draft={edicaoNpcs[npc.npcSessaoId]}
            ajustesRecursos={ajustesRecursosNpc[npc.npcSessaoId] ?? { pv: '0', san: '0', ea: '0', pe: '0' }}
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
            onRolarAtaqueAcao={onRolarAtaqueAcao}
            onRolarDanoAcao={onRolarDanoAcao}
            socialAtivo={socialAtivo}
            alvoSocial={
              alvosSociais.find((alvo) => alvo.npcSessaoId === npc.npcSessaoId) ?? null
            }
            atualizandoAlvoSocial={atualizandoAlvoSocial}
            onAdicionarAlvoSocial={() => onAdicionarAlvoSocial?.(npc)}
            onRemoverAlvoSocial={() => onRemoverAlvoSocial?.(npc)}
              onAtualizarAlvoSocial={onAtualizarAlvoSocial}
            />
          ))}
          {npcsResumidos.map((npc) => (
            <div
              key={npc.npcSessaoId}
              className="rounded-xl border border-app-border/60 bg-app-surface/35 px-4 py-3"
            >
              <p className="text-sm font-semibold text-app-fg">{npc.nome}</p>
              <p className="mt-1 text-xs text-app-muted">
                {npc.fichaTipo === 'NPC' ? 'Aliado' : 'Ameaça'} · {npc.tipo}
              </p>
              <p className="mt-2 text-xs text-app-muted">
                Dados de combate disponíveis apenas ao mestre e ao controlador.
              </p>
            </div>
          ))}
        </>
      )}
    </SessionPanel>
  );
}
