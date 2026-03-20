'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/EmptyState';
import { Textarea } from '@/components/ui/Textarea';
import { SessionTabs, type SessionTabItem } from '@/components/campanha/sessao/SessionTabs';
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

type MetaItem = {
  label: string;
  value: string;
};

type MetadadosAcao = {
  primario: MetaItem[];
  resistencia: MetaItem[];
  rolagem: MetaItem[];
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

function criarMetaItem(
  label: string,
  value: string | number | null | undefined,
): MetaItem | null {
  if (value === null || value === undefined) return null;
  const texto = String(value).trim();
  if (!texto) return null;
  return { label, value: texto };
}

function montarMetadadosAcao(
  acao: NpcSessaoCampanha['acoes'][number],
): MetadadosAcao {
  const primario = [
    criarMetaItem('Alcance', acao.alcance),
    criarMetaItem('Alvo', acao.alvo),
    criarMetaItem('Duracao', acao.duracao),
  ].filter(Boolean) as MetaItem[];

  const resistencia = [
    criarMetaItem('Resistencia', acao.resistencia),
    criarMetaItem('DT', acao.dtResistencia),
  ].filter(Boolean) as MetaItem[];

  const rolagem = [
    criarMetaItem('Teste', acao.teste),
    criarMetaItem('Dano', acao.dano),
    criarMetaItem('Critico', acao.critico),
  ].filter(Boolean) as MetaItem[];

  return { primario, resistencia, rolagem };
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
    modo?: 'inline' | 'accordion',
  ) => ReactNode;
};

type AbaDetalheNpc =
  | 'RESUMO'
  | 'ATRIBUTOS'
  | 'PERICIAS'
  | 'CONDICOES'
  | 'AJUSTES'
  | 'PASSIVAS'
  | 'ACOES';

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
  const [expandido, setExpandido] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<AbaDetalheNpc>('RESUMO');

  const abaAtivaEfetiva = podeAjustar ? abaAtiva : 'RESUMO';
  const mudouCampo = (
    valorDraft: string | undefined,
    base: string | number | null | undefined,
  ) => {
    if (valorDraft === undefined) return false;
    const baseTexto = base === null || base === undefined ? '' : String(base);
    return valorDraft !== baseTexto;
  };
  const camposAlterados = {
    defesa: mudouCampo(draft?.defesa, npc.defesa),
    pontosVidaMax: mudouCampo(draft?.pontosVidaMax, npc.pontosVidaMax),
    sanMax: mudouCampo(draft?.sanMax, npc.sanMax),
    eaMax: mudouCampo(draft?.eaMax, npc.eaMax),
    notasCena: mudouCampo(draft?.notasCena, npc.notasCena ?? ''),
  };
  const possuiAlteracoes = Object.values(camposAlterados).some(Boolean);

  const totalPericiasNpc =
    (npc.pericias?.length ?? 0) + (npc.periciasEspeciais?.length ?? 0);
  const tabs: SessionTabItem[] = [
    { id: 'RESUMO', label: 'Resumo', icon: 'chart' },
    { id: 'ATRIBUTOS', label: 'Atributos', icon: 'strength' },
    {
      id: 'PERICIAS',
      label: 'Pericias',
      icon: 'skills',
      count: totalPericiasNpc,
    },
    {
      id: 'CONDICOES',
      label: 'Condicoes',
      icon: 'status',
      count: npc.condicoesAtivas.length,
    },
    ...(podeAjustar
      ? [{ id: 'AJUSTES', label: 'Ajustes', icon: 'tools' }]
      : []),
    {
      id: 'PASSIVAS',
      label: 'Passivas',
      icon: 'shield',
      count: npc.passivas.length,
    },
    { id: 'ACOES', label: 'Acoes', icon: 'sword', count: npc.acoes.length },
  ];

  const totalAcoes = npc.acoes.length;
  const totalAcoesComCusto = npc.acoes.filter(
    (acao) =>
      typeof acao.custoPE === 'number' || typeof acao.custoEA === 'number',
  ).length;
  const totalAcoesComDano = npc.acoes.filter((acao) => Boolean(acao.dano)).length;
  const totalAcoesComResistencia = npc.acoes.filter(
    (acao) => Boolean(acao.resistencia || acao.dtResistencia),
  ).length;

  const resumoAcoes = [
    `Total ${totalAcoes}`,
    totalAcoesComCusto ? `Com custo ${totalAcoesComCusto}` : null,
    totalAcoesComDano ? `Com dano ${totalAcoesComDano}` : null,
    totalAcoesComResistencia
      ? `Com resistencia ${totalAcoesComResistencia}`
      : null,
  ].filter(Boolean) as string[];

  const renderGrupoMetadados = (itens: MetaItem[], className = '') => {
    if (itens.length === 0) return null;
    return (
      <div className={`session-npc-meta-group ${className}`.trim()}>
        {itens.map((item) => (
          <span
            key={`${item.label}-${item.value}`}
            className="session-npc-meta"
          >
            <span className="session-npc-meta__label">{item.label}</span>
            <span className="session-npc-meta__value">{item.value}</span>
          </span>
        ))}
      </div>
    );
  };

  const renderPassivasNpc = () => (
    <div className="session-npc-section">
      <div className="session-npc-section__header">
        <div className="space-y-1">
          <p className="session-npc-section__title">Passivas</p>
          <p className="session-npc-section__subtitle">
            Efeitos permanentes e tracos especiais.
          </p>
        </div>
        <Badge size="sm" color="gray">
          {npc.passivas.length} passiva{npc.passivas.length === 1 ? '' : 's'}
        </Badge>
      </div>

      <div className="session-chip-row">
        <span className="session-chip">Total {npc.passivas.length}</span>
        <span className="session-chip">Efeitos continuos</span>
      </div>

      {npc.passivas.length === 0 ? (
        <EmptyState
          variant="session"
          size="sm"
          icon="shield"
          title="Sem passivas"
          description="Este NPC nao possui passivas cadastradas."
        />
      ) : (
        <div className="session-npc-passivas">
          {npc.passivas.map((passiva, passivaIndex) => (
            <div
              key={`npc-passiva-${npc.npcSessaoId}-${passivaIndex}`}
              className="session-npc-passiva"
            >
              <div className="session-npc-passiva__head">
                <div className="session-npc-passiva__title">
                  <Icon name="shield" className="h-3.5 w-3.5 text-app-muted" />
                  <span>{passiva.nome}</span>
                </div>
                <Badge size="sm" color="gray">
                  Passiva
                </Badge>
              </div>
              {passiva.descricao ? (
                <p className="session-npc-passiva__desc">{passiva.descricao}</p>
              ) : (
                <p className="session-npc-passiva__desc session-npc-passiva__desc--empty">
                  Nenhuma descricao cadastrada.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAcoesNpc = () => (
    <div className="session-npc-section">
      <div className="session-npc-section__header">
        <div className="space-y-1">
          <p className="session-npc-section__title">Acoes</p>
          <p className="session-npc-section__subtitle">
            Acoes disponiveis deste NPC na cena.
          </p>
        </div>
        <Badge size="sm" color="gray">
          {totalAcoes} acao{totalAcoes === 1 ? '' : 'es'}
        </Badge>
      </div>

      {resumoAcoes.length > 0 ? (
        <div className="session-chip-row">
          {resumoAcoes.map((item) => (
            <span key={item} className="session-chip">
              {item}
            </span>
          ))}
        </div>
      ) : null}

      {npc.acoes.length === 0 ? (
        <EmptyState
          variant="session"
          size="sm"
          icon="sword"
          title="Sem acoes"
          description="Este NPC nao possui acoes disponiveis."
        />
      ) : (
        <div className="session-npc-acoes">
          {npc.acoes.map((acao, acaoIndex) => {
            const { primario, resistencia, rolagem } = montarMetadadosAcao(acao);
            const custoPE =
              typeof acao.custoPE === 'number' ? acao.custoPE : null;
            const custoEA =
              typeof acao.custoEA === 'number' ? acao.custoEA : null;

            return (
              <div
                key={`npc-acao-${npc.npcSessaoId}-${acaoIndex}`}
                className="session-npc-acao"
              >
                <div className="session-npc-acao__header">
                  <p className="session-npc-acao__title">{acao.nome}</p>
                  <div className="session-npc-acao__badges">
                    {acao.tipoExecucao ? (
                      <Badge size="sm" color="gray">
                        {acao.tipoExecucao}
                      </Badge>
                    ) : null}
                    {custoPE !== null ? (
                      <Badge size="sm" color="orange">
                        PE {custoPE}
                      </Badge>
                    ) : null}
                    {custoEA !== null ? (
                      <Badge size="sm" color="cyan">
                        EA {custoEA}
                      </Badge>
                    ) : null}
                  </div>
                </div>

                {acao.efeito ? (
                  <p className="session-npc-acao__effect">{acao.efeito}</p>
                ) : (
                  <p className="session-npc-acao__effect session-npc-acao__effect--empty">
                    Nenhum efeito descritivo informado.
                  </p>
                )}

                {renderGrupoMetadados(primario)}
                {renderGrupoMetadados(resistencia, 'session-npc-meta-group--muted')}
                {renderGrupoMetadados(rolagem, 'session-npc-meta-group--strong')}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderAtributosNpc = () => {
    if (!npc.atributos) {
      return (
        <EmptyState
          variant="session"
          size="sm"
          icon="strength"
          title="Atributos indisponiveis"
          description="Os atributos deste NPC nao estao disponiveis."
        />
      );
    }

    const listaAtributos = [
      { codigo: 'AGI', label: 'Agilidade', valor: npc.atributos.agilidade },
      { codigo: 'FOR', label: 'Forca', valor: npc.atributos.forca },
      { codigo: 'INT', label: 'Intelecto', valor: npc.atributos.intelecto },
      { codigo: 'PRE', label: 'Presenca', valor: npc.atributos.presenca },
      { codigo: 'VIG', label: 'Vigor', valor: npc.atributos.vigor },
    ];

    return (
      <div className="session-npc-section">
        <div className="session-npc-section__header">
          <div className="space-y-1">
            <p className="session-npc-section__title">Atributos</p>
            <p className="session-npc-section__subtitle">
              Base numerica do aliado/ameaca na cena.
            </p>
          </div>
        </div>
        <div className="session-atributos-grid">
          {listaAtributos.map((atributo) => (
            <div key={atributo.codigo} className="session-atributo-card">
              <div className="session-atributo-card__meta">
                <span className="session-atributo-card__code">{atributo.codigo}</span>
                <span className="session-atributo-card__label">
                  {atributo.label}
                </span>
              </div>
              <span className="session-atributo-card__value">{atributo.valor}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPericiasNpc = () => {
    const periciasPrincipais = npc.pericias ?? [];
    const periciasEspeciais = npc.periciasEspeciais ?? [];

    if (periciasPrincipais.length === 0 && periciasEspeciais.length === 0) {
      return (
        <EmptyState
          variant="session"
          size="sm"
          icon="skills"
          title="Sem pericias"
          description="Este NPC nao possui pericias cadastradas."
        />
      );
    }

    const formatarRolagem = (dados: number, bonus?: number | null) => {
      const dadosTexto = Number.isFinite(dados) && dados > 0 ? dados : 1;
      if (!bonus) return `${dadosTexto}d20`;
      return `${dadosTexto}d20 ${bonus > 0 ? '+' : ''}${bonus}`;
    };

    return (
      <div className="session-npc-pericias">
        <div className="session-npc-section__header">
          <div className="space-y-1">
            <p className="session-npc-section__title">Pericias</p>
            <p className="session-npc-section__subtitle">
              Principais e especiais disponiveis para este NPC.
            </p>
          </div>
          <Badge size="sm" color="gray">
            {periciasPrincipais.length + periciasEspeciais.length} pericia
            {periciasPrincipais.length + periciasEspeciais.length === 1 ? '' : 's'}
          </Badge>
        </div>

        {periciasPrincipais.length > 0 ? (
          <div className="session-npc-pericias-block">
            <div className="session-npc-pericias-block__head">
              <p className="session-npc-pericias-block__title">Principais</p>
              <Badge size="sm" color="gray">
                {periciasPrincipais.length}
              </Badge>
            </div>
            <div className="session-npc-pericias-grid">
              {periciasPrincipais.map((pericia) => (
                <div key={pericia.codigo} className="session-npc-pericia-card">
                  <div className="session-npc-pericia-card__head">
                    <p className="session-npc-pericia-card__name">{pericia.nome}</p>
                    {pericia.atributoBase ? (
                      <span className="session-npc-pericia-card__attr">
                        {pericia.atributoBase}
                      </span>
                    ) : null}
                  </div>
                  <div className="session-npc-pericia-card__roll">
                    <span className="session-npc-pericia-card__roll-label">
                      <Icon name="dice" className="h-3 w-3" />
                      Rolagem
                    </span>
                    <span className="session-npc-pericia-card__roll-value">
                      {formatarRolagem(pericia.dados, pericia.bonus)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {periciasEspeciais.length > 0 ? (
          <div className="session-npc-pericias-block">
            <div className="session-npc-pericias-block__head">
              <p className="session-npc-pericias-block__title">Especiais</p>
              <Badge size="sm" color="gray">
                {periciasEspeciais.length}
              </Badge>
            </div>
            <div className="session-npc-pericia-especiais">
              {periciasEspeciais.map((pericia) => (
                <div
                  key={`npc-pericia-especial-${npc.npcSessaoId}-${pericia.codigo}`}
                  className="session-npc-pericia-especial-card"
                >
                  <div className="session-npc-pericia-especial-card__head">
                    <div className="space-y-1">
                      <p className="session-npc-pericia-especial-card__title">
                        {pericia.nome}
                      </p>
                      {pericia.atributoBase ? (
                        <span className="session-npc-pericia-card__attr">
                          {pericia.atributoBase}
                        </span>
                      ) : null}
                    </div>
                    <span className="session-npc-pericia-card__roll-value">
                      {formatarRolagem(pericia.dados, pericia.bonus)}
                    </span>
                  </div>
                  {pericia.descricao ? (
                    <p className="session-npc-pericia-especial-card__desc">
                      {pericia.descricao}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  };

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
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setExpandido((estado) => !estado)}
              title={expandido ? 'Recolher detalhes' : 'Expandir detalhes'}
            >
              <Icon
                name={expandido ? 'chevron-up' : 'chevron-down'}
                className="h-3.5 w-3.5"
              />
            </Button>
          </div>
        </div>
        <div className="session-resource-list">
          {linhasRecursos.map((linha) => (
            <div
              key={linha.key}
              className={`session-resource-row${
                campoRecursoPendente === linha.key ? ' session-resource-row--pending' : ''
              }`}
            >
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

      {expandido ? (
        <div className="space-y-2">
          <SessionTabs
            tabs={tabs.map((tab) => ({
              id: tab.id,
              label: tab.label,
              icon: tab.icon,
              count: tab.count,
            }))}
            activeId={abaAtivaEfetiva}
            onChange={(tabId) => setAbaAtiva(tabId as AbaDetalheNpc)}
          />

          {abaAtivaEfetiva === 'RESUMO' ? (
            <div className="space-y-2 rounded border border-app-border p-2">
              <p className="text-xs text-app-muted">
                Resumo rapido do aliado/ameaca nesta cena.
              </p>
              <div className="session-chip-row">
                <span className="session-chip">INI {iniciativaTexto}</span>
                <span className="session-chip">
                  PV {npc.pontosVidaAtual}/{npc.pontosVidaMax}
                </span>
                {typeof npc.sanAtual === 'number' && typeof npc.sanMax === 'number' ? (
                  <span className="session-chip">
                    SAN {npc.sanAtual}/{npc.sanMax}
                  </span>
                ) : null}
                {typeof npc.eaAtual === 'number' && typeof npc.eaMax === 'number' ? (
                  <span className="session-chip">
                    EA {npc.eaAtual}/{npc.eaMax}
                  </span>
                ) : null}
                <span className="session-chip">VD {npc.vd}</span>
                <span className="session-chip">DEF {npc.defesa}</span>
                <span className="session-chip">
                  Desloc. {npc.deslocamentoMetros}m
                </span>
                {typeof npc.machucado === 'number' ? (
                  <span className="session-chip">Machucado {npc.machucado}</span>
                ) : null}
              </div>
            </div>
          ) : null}

          {abaAtivaEfetiva === 'ATRIBUTOS' ? renderAtributosNpc() : null}

          {abaAtivaEfetiva === 'PERICIAS' ? renderPericiasNpc() : null}

          {abaAtivaEfetiva === 'CONDICOES'
            ? renderPainelCondicoes(
                'NPC',
                npc.npcSessaoId,
                npc.nome,
                npc.condicoesAtivas,
                'inline',
              )
            : null}

          {abaAtivaEfetiva === 'AJUSTES' ? (
            <div className="rounded border border-app-border bg-app-surface/40 p-4">
              {podeAjustar ? (
                <div className="session-npc-ajustes">
                  <div className="space-y-1">
                    <p className="session-npc-ajustes__title">Ficha da cena</p>
                    <p className="session-npc-ajustes__subtitle">
                      Defina os valores base deste NPC para esta sessao.
                    </p>
                  </div>

                  <div className="session-npc-ajustes__group">
                    <div className="space-y-1">
                      <p className="session-npc-ajustes__group-title">
                        Atributos da ficha
                      </p>
                      <p className="session-npc-ajustes__group-subtitle">
                        Campos principais usados durante a cena.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <Input
                        type="number"
                        label="Defesa"
                        value={valorInputNumero(draft?.defesa, npc.defesa)}
                        className={camposAlterados.defesa ? 'session-input--dirty' : ''}
                        onChange={(event) =>
                          onAtualizarCampo(npc, 'defesa', event.target.value)
                        }
                      />
                      <Input
                        type="number"
                        label="PV max"
                        value={valorInputNumero(
                          draft?.pontosVidaMax,
                          npc.pontosVidaMax,
                        )}
                        className={
                          camposAlterados.pontosVidaMax ? 'session-input--dirty' : ''
                        }
                        onChange={(event) =>
                          onAtualizarCampo(npc, 'pontosVidaMax', event.target.value)
                        }
                      />
                      <Input
                        type="number"
                        label="SAN max (opcional)"
                        value={valorInputNumero(draft?.sanMax, npc.sanMax)}
                        className={camposAlterados.sanMax ? 'session-input--dirty' : ''}
                        onChange={(event) =>
                          onAtualizarCampo(npc, 'sanMax', event.target.value)
                        }
                      />
                      <Input
                        type="number"
                        label="EA max (opcional)"
                        value={valorInputNumero(draft?.eaMax, npc.eaMax)}
                        className={camposAlterados.eaMax ? 'session-input--dirty' : ''}
                        onChange={(event) =>
                          onAtualizarCampo(npc, 'eaMax', event.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="session-npc-ajustes__group">
                    <div className="space-y-1">
                      <p className="session-npc-ajustes__group-title">
                        Estado automatico
                      </p>
                      <p className="session-npc-ajustes__group-subtitle">
                        Valores derivados calculados pela ficha.
                      </p>
                    </div>

                    <div className="session-npc-info">
                      <div className="session-npc-info__icon">
                        <Icon name="info" className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="session-npc-info__title">Machucado</p>
                        <p className="session-npc-info__value">
                          {typeof npc.machucado === 'number' ? npc.machucado : '--'}
                        </p>
                        <p className="session-npc-info__hint">
                          Calculado automaticamente a partir da vida maxima.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="session-npc-ajustes__group">
                    <div className="space-y-1">
                      <p className="session-npc-ajustes__group-title">
                        Observacoes da cena
                      </p>
                      <p className="session-npc-ajustes__group-subtitle">
                        Use para registrar comportamento, foco ou taticas.
                      </p>
                    </div>
                    <Textarea
                      label="Notas da cena (opcional)"
                      value={draft?.notasCena ?? npc.notasCena ?? ''}
                      className={camposAlterados.notasCena ? 'session-input--dirty' : ''}
                      placeholder="Ex.: alvo prioritario, ferido, protegendo a retaguarda..."
                      onChange={(event) =>
                        onAtualizarCampo(npc, 'notasCena', event.target.value)
                      }
                    />
                  </div>

                  <div className="session-npc-ajustes__actions">
                    <p className="session-npc-ajustes__hint">
                      {possuiAlteracoes
                        ? 'Alteracoes locais pendentes.'
                        : 'Nenhuma alteracao pendente.'}
                    </p>
                    <Button
                      size="sm"
                      onClick={onSalvar}
                      disabled={sessaoEncerrada || salvando}
                    >
                      {salvando ? 'Salvando...' : 'Salvar alteracoes'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="session-npc-ajustes session-npc-ajustes--readonly">
                  <div className="session-npc-ajustes__readonly-head">
                    <Icon name="lock" className="h-4 w-4" />
                    <div>
                      <p className="text-xs font-semibold text-app-fg">
                        Ajustes bloqueados
                      </p>
                      <p className="session-text-xxs text-app-muted">
                        Apenas o mestre pode ajustar esta ficha.
                      </p>
                    </div>
                  </div>
                  <div className="session-chip-row">
                    <span className="session-chip">DEF {npc.defesa}</span>
                    <span className="session-chip">
                      PV {npc.pontosVidaMax}
                    </span>
                    {typeof npc.sanMax === 'number' ? (
                      <span className="session-chip">SAN {npc.sanMax}</span>
                    ) : null}
                    {typeof npc.eaMax === 'number' ? (
                      <span className="session-chip">EA {npc.eaMax}</span>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {abaAtivaEfetiva === 'PASSIVAS' ? renderPassivasNpc() : null}

          {abaAtivaEfetiva === 'ACOES' ? renderAcoesNpc() : null}
        </div>
      ) : null}
    </Card>
  );
}
