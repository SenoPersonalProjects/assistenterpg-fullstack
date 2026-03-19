'use client';

import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import type { CondicaoAtivaSessaoCampanha, NpcSessaoCampanha } from '@/lib/types';
import type {
  AjustesRecursosNpc,
  CampoAjusteRecursoNpc,
  NpcEditavel,
} from '@/components/campanha/sessao/types';
import { labelTipoNpc } from '@/lib/npc-ameaca/labels';

type LinhaRecursoNpc = {
  key: CampoAjusteRecursoNpc;
  label: string;
  atual: number;
  maximo: number;
  tone: 'pv' | 'san' | 'ea';
};

function clampPercentual(atual: number, maximo: number): number {
  if (!Number.isFinite(atual) || !Number.isFinite(maximo) || maximo <= 0) return 0;
  const percentual = (atual / maximo) * 100;
  return Math.max(0, Math.min(100, percentual));
}

function valorInputNumero(valor: string | undefined, base: number | null): string {
  if (valor !== undefined) return valor;
  if (base === null || base === undefined) return '';
  return String(base);
}

type NpcSessionCardProps = {
  npc: NpcSessaoCampanha;
  iniciativaValor: number | null;
  podeControlarSessao: boolean;
  sessaoEncerrada: boolean;
  draft: NpcEditavel | undefined;
  ajustesRecursos: AjustesRecursosNpc;
  campoRecursoPendente: CampoAjusteRecursoNpc | null;
  salvando: boolean;
  removendo: boolean;
  onAtualizarCampo: (
    npc: NpcSessaoCampanha,
    campo: keyof NpcEditavel,
    valor: string,
  ) => void;
  onAtualizarAjustePersonalizado: (campo: CampoAjusteRecursoNpc, valor: string) => void;
  onAplicarDeltaRecurso: (campo: CampoAjusteRecursoNpc, delta: number) => void;
  onAplicarAjustePersonalizado: (campo: CampoAjusteRecursoNpc) => void;
  onSalvar: () => void;
  onSolicitarRemover: () => void;
  renderPainelCondicoes: (
    alvoTipo: 'PERSONAGEM' | 'NPC',
    alvoId: number,
    nomeAlvo: string,
    condicoesAtivas: CondicaoAtivaSessaoCampanha[],
  ) => ReactNode;
};

export function NpcSessionCard({
  npc,
  iniciativaValor,
  podeControlarSessao,
  sessaoEncerrada,
  draft,
  ajustesRecursos,
  campoRecursoPendente,
  salvando,
  removendo,
  onAtualizarCampo,
  onAtualizarAjustePersonalizado,
  onAplicarDeltaRecurso,
  onAplicarAjustePersonalizado,
  onSalvar,
  onSolicitarRemover,
  renderPainelCondicoes,
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
  const nomeTipoFicha = npc.fichaTipo === 'NPC' ? 'Aliado' : 'Ameaca';
  const linhasRecursos: LinhaRecursoNpc[] = [
    {
      key: 'pv',
      label: 'Vida',
      atual: npc.pontosVidaAtual,
      maximo: npc.pontosVidaMax,
      tone: 'pv',
    },
  ];
  if (typeof npc.sanAtual === 'number' && typeof npc.sanMax === 'number') {
    linhasRecursos.push({
      key: 'san',
      label: 'Sanidade',
      atual: npc.sanAtual,
      maximo: npc.sanMax,
      tone: 'san',
    });
  }
  if (typeof npc.eaAtual === 'number' && typeof npc.eaMax === 'number') {
    linhasRecursos.push({
      key: 'ea',
      label: 'Energia',
      atual: npc.eaAtual,
      maximo: npc.eaMax,
      tone: 'ea',
    });
  }

  const podeAjustar = podeControlarSessao && npc.podeEditar;
  const iniciativaTexto =
    typeof iniciativaValor === 'number' ? String(iniciativaValor) : '--';
  const condicoesColor = npc.condicoesAtivas.length > 0 ? 'yellow' : 'gray';

  return (
    <Card className="session-panel space-y-3">
      <div className="session-resource-card">
        <div className="session-resource-card__head">
          <div className="min-w-0 space-y-1">
            <p className="truncate text-xs font-semibold text-app-fg">{npc.nome}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge size="sm" color={npc.fichaTipo === 'NPC' ? 'green' : 'red'}>
                {nomeTipoFicha}
              </Badge>
              <Badge size="sm" color="gray">
                {labelTipoNpc(npc.tipo)}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="session-initiative-badge">INI {iniciativaTexto}</span>
          </div>
        </div>
        <div className="session-resource-list">
          {linhasRecursos.map((linha) => (
            <div key={linha.key} className="session-resource-row">
              <div className="session-resource-row__meta">
                <span className="session-resource-row__label">{linha.label}</span>
                <span className="session-resource-row__value">
                  {linha.atual}/{linha.maximo}
                </span>
              </div>
              <div className="session-resource-track">
                <span
                  className={`session-resource-fill session-resource-fill--${linha.tone}`}
                  style={{ width: `${clampPercentual(linha.atual, linha.maximo)}%` }}
                />
              </div>
              {podeAjustar ? (
                <div className="session-resource-actions">
                  <div className="session-resource-actions__quick">
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => onAplicarDeltaRecurso(linha.key, -5)}
                      disabled={sessaoEncerrada || campoRecursoPendente === linha.key}
                    >
                      -5
                    </Button>
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => onAplicarDeltaRecurso(linha.key, -1)}
                      disabled={sessaoEncerrada || campoRecursoPendente === linha.key}
                    >
                      -1
                    </Button>
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => onAplicarDeltaRecurso(linha.key, 1)}
                      disabled={sessaoEncerrada || campoRecursoPendente === linha.key}
                    >
                      +1
                    </Button>
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => onAplicarDeltaRecurso(linha.key, 5)}
                      disabled={sessaoEncerrada || campoRecursoPendente === linha.key}
                    >
                      +5
                    </Button>
                  </div>
                  <div className="session-resource-actions__custom">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={ajustesRecursos[linha.key] ?? '0'}
                      onChange={(event) =>
                        onAtualizarAjustePersonalizado(linha.key, event.target.value)
                      }
                      className="session-resource-actions__input"
                      placeholder="+3 / -2"
                      disabled={sessaoEncerrada || campoRecursoPendente === linha.key}
                    />
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => onAplicarAjustePersonalizado(linha.key)}
                      disabled={sessaoEncerrada || campoRecursoPendente === linha.key}
                    >
                      {campoRecursoPendente === linha.key ? 'Aplicando...' : 'Aplicar'}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge size="sm" color={condicoesColor}>
          Condicoes {npc.condicoesAtivas.length}
        </Badge>
        <Badge size="sm" color="gray">
          VD {npc.vd}
        </Badge>
        <Badge size="sm" color="gray">
          DEF {npc.defesa}
        </Badge>
        <Badge size="sm" color="gray">
          Desloc. {npc.deslocamentoMetros}m
        </Badge>
        {typeof npc.machucado === 'number' ? (
          <Badge size="sm" color="yellow">
            Machucado {npc.machucado}
          </Badge>
        ) : null}
      </div>

      {podeAjustar ? (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onSolicitarRemover}
            disabled={sessaoEncerrada || removendo}
          >
            {removendo ? 'Removendo...' : 'Remover da cena'}
          </Button>
        </div>
      ) : null}

      {renderPainelCondicoes('NPC', npc.npcSessaoId, npc.nome, npc.condicoesAtivas)}

      {podeAjustar ? (
        <details className="rounded border border-app-border p-2">
          <summary className="cursor-pointer text-xs font-semibold text-app-fg">
            Ajustes da ficha
          </summary>
          <div className="mt-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                label="Defesa"
                value={valorInputNumero(draft?.defesa, npc.defesa)}
                onChange={(event) => onAtualizarCampo(npc, 'defesa', event.target.value)}
              />
              <Input
                type="number"
                label="PV max"
                value={valorInputNumero(draft?.pontosVidaMax, npc.pontosVidaMax)}
                onChange={(event) =>
                  onAtualizarCampo(npc, 'pontosVidaMax', event.target.value)
                }
              />
              <Input
                type="number"
                label="SAN max (opcional)"
                value={valorInputNumero(draft?.sanMax, npc.sanMax)}
                onChange={(event) => onAtualizarCampo(npc, 'sanMax', event.target.value)}
              />
              <Input
                type="number"
                label="EA max (opcional)"
                value={valorInputNumero(draft?.eaMax, npc.eaMax)}
                onChange={(event) => onAtualizarCampo(npc, 'eaMax', event.target.value)}
              />
              <Input
                type="number"
                label="Machucado"
                value={valorInputNumero(draft?.machucado, npc.machucado)}
                onChange={(event) => onAtualizarCampo(npc, 'machucado', event.target.value)}
              />
            </div>
            <Input
              label="Notas da cena (opcional)"
              value={draft?.notasCena ?? npc.notasCena ?? ''}
              onChange={(event) => onAtualizarCampo(npc, 'notasCena', event.target.value)}
            />
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={onSalvar} disabled={sessaoEncerrada || salvando}>
                {salvando ? 'Salvando...' : 'Salvar ajustes'}
              </Button>
            </div>
          </div>
        </details>
      ) : null}

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
