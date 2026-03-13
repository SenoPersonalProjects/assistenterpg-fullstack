'use client';

import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { CondicaoAtivaSessaoCampanha, NpcSessaoCampanha } from '@/lib/types';
import type { NpcEditavel } from '@/components/campanha/sessao/types';

type NpcSessionCardProps = {
  npc: NpcSessaoCampanha;
  podeControlarSessao: boolean;
  sessaoEncerrada: boolean;
  draft: NpcEditavel | undefined;
  salvando: boolean;
  removendo: boolean;
  onAtualizarCampo: (
    npc: NpcSessaoCampanha,
    campo: keyof NpcEditavel,
    valor: string,
  ) => void;
  onSalvar: () => void;
  onSolicitarRemover: () => void;
  renderPainelCondicoes: (
    alvoTipo: 'PERSONAGEM' | 'NPC',
    alvoId: number,
    nomeAlvo: string,
    condicoesAtivas: CondicaoAtivaSessaoCampanha[],
  ) => ReactNode;
  labelTipoNpc: (tipo: string) => string;
};

export function NpcSessionCard({
  npc,
  podeControlarSessao,
  sessaoEncerrada,
  draft,
  salvando,
  removendo,
  onAtualizarCampo,
  onSalvar,
  onSolicitarRemover,
  renderPainelCondicoes,
  labelTipoNpc,
}: NpcSessionCardProps) {
  const metadadosAcao = (acao: NpcSessaoCampanha['acoes'][number]) =>
    [
      acao.tipoExecucao,
      acao.alcance,
      acao.alvo,
      acao.duracao,
      acao.resistencia,
      acao.dtResistencia ? `DT ${acao.dtResistencia}` : null,
      typeof acao.custoPE === 'number' ? `PE ${acao.custoPE}` : null,
      typeof acao.custoEA === 'number' ? `EA ${acao.custoEA}` : null,
      acao.teste,
      acao.dano,
      acao.critico,
    ]
      .filter(Boolean)
      .join(' | ');

  return (
    <Card className="session-panel space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-app-fg">{npc.nome}</h3>
        <p className="text-xs text-app-muted">
          {npc.fichaTipo === 'NPC' ? 'Aliado' : 'Ameaca'} | {labelTipoNpc(npc.tipo)}
        </p>
      </div>

      {podeControlarSessao && npc.podeEditar ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              label="VD"
              value={draft?.vd ?? String(npc.vd)}
              onChange={(event) => onAtualizarCampo(npc, 'vd', event.target.value)}
            />
            <Input
              type="number"
              label="Defesa"
              value={draft?.defesa ?? String(npc.defesa)}
              onChange={(event) =>
                onAtualizarCampo(npc, 'defesa', event.target.value)
              }
            />
            <Input
              type="number"
              label="PV atual"
              value={draft?.pontosVidaAtual ?? String(npc.pontosVidaAtual)}
              onChange={(event) =>
                onAtualizarCampo(npc, 'pontosVidaAtual', event.target.value)
              }
            />
            <Input
              type="number"
              label="PV max"
              value={draft?.pontosVidaMax ?? String(npc.pontosVidaMax)}
              onChange={(event) =>
                onAtualizarCampo(npc, 'pontosVidaMax', event.target.value)
              }
            />
            <Input
              type="number"
              label="Deslocamento (m)"
              value={
                draft?.deslocamentoMetros ??
                String(npc.deslocamentoMetros)
              }
              onChange={(event) =>
                onAtualizarCampo(npc, 'deslocamentoMetros', event.target.value)
              }
            />
          </div>
          <Input
            label="Notas da cena (opcional)"
            value={draft?.notasCena ?? npc.notasCena ?? ''}
            onChange={(event) => onAtualizarCampo(npc, 'notasCena', event.target.value)}
          />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={onSalvar} disabled={sessaoEncerrada || salvando}>
              {salvando ? 'Salvando...' : 'Salvar ficha'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onSolicitarRemover}
              disabled={sessaoEncerrada || removendo}
            >
              {removendo ? 'Removendo...' : 'Remover da cena'}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-app-muted">
          VD {npc.vd} | DEF {npc.defesa} | PV {npc.pontosVidaAtual}/{npc.pontosVidaMax} | Desloc.{' '}
          {npc.deslocamentoMetros}m
        </p>
      )}

      {renderPainelCondicoes('NPC', npc.npcSessaoId, npc.nome, npc.condicoesAtivas)}

      {npc.passivas.length > 0 ? (
        <details className="rounded border border-app-border p-2">
          <summary className="cursor-pointer text-xs font-semibold text-app-fg">
            Passivas guia ({npc.passivas.length})
          </summary>
          <div className="mt-2 space-y-2">
            {npc.passivas.map((passiva, passivaIndex) => (
              <div
                key={`npc-passiva-${npc.npcSessaoId}-${passivaIndex}`}
                className="rounded border border-app-border bg-app-surface px-2 py-1.5"
              >
                <p className="text-xs font-semibold text-app-fg">{passiva.nome}</p>
                <p className="text-xs text-app-muted">{passiva.descricao}</p>
              </div>
            ))}
          </div>
        </details>
      ) : null}

      {npc.acoes.length > 0 ? (
        <details className="rounded border border-app-border p-2">
          <summary className="cursor-pointer text-xs font-semibold text-app-fg">
            Acoes guia ({npc.acoes.length})
          </summary>
          <div className="mt-2 space-y-2">
            {npc.acoes.map((acao, acaoIndex) => (
              <div
                key={`npc-acao-${npc.npcSessaoId}-${acaoIndex}`}
                className="rounded border border-app-border bg-app-surface px-2 py-1.5"
              >
                <p className="text-xs font-semibold text-app-fg">{acao.nome}</p>
                {metadadosAcao(acao) ? (
                  <p className="text-xs text-app-muted">{metadadosAcao(acao)}</p>
                ) : null}
                {acao.efeito ? (
                  <p className="text-xs text-app-muted">{acao.efeito}</p>
                ) : null}
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </Card>
  );
}
