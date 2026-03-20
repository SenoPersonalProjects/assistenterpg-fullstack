'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SessionTabs } from '@/components/campanha/sessao/SessionTabs';
import { SessionTechniqueBlock } from '@/components/campanha/sessao/SessionTechniqueBlock';
import type { CondicaoAtivaSessaoCampanha, SessaoCampanhaDetalhe } from '@/lib/types';
import { textoSeguro } from '@/lib/campanha/sessao-formatters';
import type { AbaDetalheCard } from '@/lib/campanha/sessao-preferencias';

type SessionCharacterDetailsTabsProps = {
  card: SessaoCampanhaDetalhe['cards'][number];
  iniciativaValor: number | null;
  abaDetalheCard: AbaDetalheCard;
  totalCondicoesAtivasCard: number;
  totalTecnicasCard: number;
  totalSustentacoesAtivasCard: number;
  mostrarSomenteSustentadasAtivas: boolean;
  onToggleMostrarSomenteSustentadas: (checked: boolean) => void;
  onAtualizarAbaDetalheCard: (aba: AbaDetalheCard) => void;
  tecnicaInataAberta: boolean;
  onToggleTecnicaInata: (aberto: boolean) => void;
  tecnicasNaoInatasAbertas: boolean;
  onToggleTecnicasNaoInatas: (aberto: boolean) => void;
  acumulosHabilidade: Record<string, string>;
  onAtualizarAcumulosHabilidade: (chave: string, valor: string) => void;
  onUsarHabilidade: (
    personagemSessaoId: number,
    habilidadeTecnicaId: number,
    variacaoHabilidadeId?: number,
    acumulos?: number,
  ) => void;
  acaoHabilidadePendente: string | null;
  sessaoEncerrada: boolean;
  onAbrirEdicaoPersonagem?: () => void;
  onAbrirFichaCompleta?: () => void;
  onEncerrarSustentacao: (personagemSessaoId: number, sustentacaoId: number) => void;
  formatarCustos: (custoEA: number, custoPE: number) => string;
  renderPainelCondicoes: (
    alvoTipo: 'PERSONAGEM' | 'NPC',
    alvoId: number,
    nomeAlvo: string,
    condicoesAtivas: CondicaoAtivaSessaoCampanha[],
    modo?: 'inline' | 'accordion',
  ) => ReactNode;
  mostrarAcoesResumo?: boolean;
};

function montarChaveEncerrarSustentacao(
  personagemSessaoId: number,
  sustentacaoId: number,
): string {
  return `encerrar:${personagemSessaoId}:${sustentacaoId}`;
}

function montarChaveSustentacaoAtiva(
  habilidadeTecnicaId: number,
  variacaoHabilidadeId?: number | null,
): string {
  return `${habilidadeTecnicaId}:${variacaoHabilidadeId ?? 'base'}`;
}

function formatarBonus(valor: number): string {
  if (!valor) return '--';
  return valor > 0 ? `+${valor}` : String(valor);
}

export function SessionCharacterDetailsTabs({
  card,
  iniciativaValor,
  abaDetalheCard,
  totalCondicoesAtivasCard,
  totalTecnicasCard,
  totalSustentacoesAtivasCard,
  mostrarSomenteSustentadasAtivas,
  onToggleMostrarSomenteSustentadas,
  onAtualizarAbaDetalheCard,
  tecnicaInataAberta,
  onToggleTecnicaInata,
  tecnicasNaoInatasAbertas,
  onToggleTecnicasNaoInatas,
  acumulosHabilidade,
  onAtualizarAcumulosHabilidade,
  onUsarHabilidade,
  acaoHabilidadePendente,
  sessaoEncerrada,
  onAbrirEdicaoPersonagem,
  onAbrirFichaCompleta,
  onEncerrarSustentacao,
  formatarCustos,
  renderPainelCondicoes,
  mostrarAcoesResumo = true,
}: SessionCharacterDetailsTabsProps) {
  const recursos = card.recursos;
  if (!recursos) return null;

  const resumoTecnica = card.tecnicaInata?.nome
    ? textoSeguro(card.tecnicaInata.nome)
    : 'Sem tecnica inata';
  const mapaSustentacoes = new Map<string, number>();
  for (const sustentacao of card.sustentacoesAtivas) {
    const chave = montarChaveSustentacaoAtiva(
      sustentacao.habilidadeTecnicaId,
      sustentacao.variacaoHabilidadeId,
    );
    mapaSustentacoes.set(chave, (mapaSustentacoes.get(chave) ?? 0) + 1);
  }
  const tecnicasDisponiveis = [
    card.tecnicaInata,
    ...card.tecnicasNaoInatas,
  ].filter(Boolean) as Array<
    NonNullable<SessaoCampanhaDetalhe['cards'][number]['tecnicaInata']>
  >;
  let totalHabilidades = 0;
  let totalHabilidadesSustentadas = 0;
  let totalHabilidadesInata = 0;
  let totalHabilidadesNaoInatas = 0;
  for (const tecnica of tecnicasDisponiveis) {
    for (const habilidade of tecnica.habilidades) {
      totalHabilidades += 1;
      if (tecnica.id === card.tecnicaInata?.id) {
        totalHabilidadesInata += 1;
      } else {
        totalHabilidadesNaoInatas += 1;
      }
      const baseAtiva = mapaSustentacoes.has(
        montarChaveSustentacaoAtiva(habilidade.id),
      );
      const variacaoAtiva = habilidade.variacoes.some((variacao) =>
        mapaSustentacoes.has(
          montarChaveSustentacaoAtiva(habilidade.id, variacao.id),
        ),
      );
      if (baseAtiva || variacaoAtiva) {
        totalHabilidadesSustentadas += 1;
      }
    }
  }

  const obterQtdSustentacaoAtiva = (
    habilidadeTecnicaId: number,
    variacaoHabilidadeId?: number | null,
  ) =>
    mapaSustentacoes.get(
      montarChaveSustentacaoAtiva(habilidadeTecnicaId, variacaoHabilidadeId),
    ) ?? 0;

  const [mostrarSomentePericiasBonificadas, setMostrarSomentePericiasBonificadas] =
    useState(false);
  const periciasOrdenadas = [...(card.pericias ?? [])].sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt-BR'),
  );
  const periciasFiltradas = mostrarSomentePericiasBonificadas
    ? periciasOrdenadas.filter((pericia) => pericia.bonusTotal > 0)
    : periciasOrdenadas;
  const atributos = card.atributos;
  const listaAtributos = [
    { codigo: 'AGI', label: 'Agilidade', valor: atributos?.agilidade },
    { codigo: 'FOR', label: 'Forca', valor: atributos?.forca },
    { codigo: 'INT', label: 'Intelecto', valor: atributos?.intelecto },
    { codigo: 'PRE', label: 'Presenca', valor: atributos?.presenca },
    { codigo: 'VIG', label: 'Vigor', valor: atributos?.vigor },
  ];

  return (
    <div className="space-y-2">
      <SessionTabs
        tabs={[
          { id: 'RESUMO', label: 'Resumo', icon: 'chart' },
          { id: 'ATRIBUTOS', label: 'Atributos', icon: 'strength' },
          {
            id: 'PERICIAS',
            label: 'Pericias',
            icon: 'skills',
            count: periciasOrdenadas.length,
          },
          {
            id: 'TECNICAS',
            label: 'Tecnicas',
            icon: 'technique',
            count: totalTecnicasCard,
          },
          {
            id: 'SUSTENTACOES',
            label: 'Sustentacoes',
            icon: 'energy',
            count: totalSustentacoesAtivasCard,
          },
          {
            id: 'CONDICOES',
            label: 'Condicoes',
            icon: 'status',
            count: totalCondicoesAtivasCard,
          },
        ]}
        activeId={abaDetalheCard}
        onChange={(tabId) => onAtualizarAbaDetalheCard(tabId as AbaDetalheCard)}
      />

      {abaDetalheCard === 'RESUMO' ? (
        <div className="space-y-2 rounded border border-app-border p-2">
          <p className="text-xs text-app-muted">
            Resumo rapido do personagem na sessao.
          </p>
          <div className="space-y-2">
            <div>
              <p className="session-text-xxs font-semibold text-app-muted uppercase">
                Estado atual
              </p>
              <div className="session-chip-row">
                <span className="session-chip">
                  INI {typeof iniciativaValor === 'number' ? iniciativaValor : '--'}
                </span>
                <span className="session-chip">
                  PV {recursos.pvAtual}/{recursos.pvMax}
                </span>
                <span className="session-chip">
                  SAN {recursos.sanAtual}/{recursos.sanMax}
                </span>
                <span className="session-chip">
                  Condicoes {totalCondicoesAtivasCard}
                </span>
                <span className="session-chip">
                  Sustentacoes {totalSustentacoesAtivasCard}
                </span>
              </div>
            </div>
            <div>
              <p className="session-text-xxs font-semibold text-app-muted uppercase">
                Capacidade
              </p>
              <div className="session-chip-row">
                <span className="session-chip">
                  PE {recursos.peAtual}/{recursos.peMax}
                </span>
                <span className="session-chip">
                  EA {recursos.eaAtual}/{recursos.eaMax}
                </span>
                <span className="session-chip">
                  Tecnicas {totalTecnicasCard}
                </span>
              </div>
              <p className="session-text-xxs text-app-muted">
                Tecnica principal: {resumoTecnica}
              </p>
            </div>
          </div>
          {mostrarAcoesResumo && card.podeEditar ? (
            <div className="flex items-center gap-2 flex-wrap">
              {onAbrirEdicaoPersonagem ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onAbrirEdicaoPersonagem}
                  disabled={sessaoEncerrada || !card.recursos}
                >
                  Ajustes narrativos
                </Button>
              ) : null}
              {onAbrirFichaCompleta ? (
                <Button variant="ghost" size="sm" onClick={onAbrirFichaCompleta}>
                  Abrir ficha completa
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {abaDetalheCard === 'ATRIBUTOS' ? (
        atributos ? (
          <div className="session-atributos-grid">
            {listaAtributos.map((atributo) => (
              <div key={atributo.codigo} className="session-atributo-card">
                <div className="session-atributo-card__meta">
                  <span className="session-atributo-card__code">{atributo.codigo}</span>
                  <span className="session-atributo-card__label">{atributo.label}</span>
                </div>
                <span className="session-atributo-card__value">
                  {atributo.valor ?? '--'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            variant="session"
            size="sm"
            icon="strength"
            title="Atributos indisponiveis"
            description="Os atributos deste personagem nao estao disponiveis."
          />
        )
      ) : null}

      {abaDetalheCard === 'PERICIAS' ? (
        periciasOrdenadas.length === 0 ? (
          <EmptyState
            variant="session"
            size="sm"
            icon="skills"
            title="Sem pericias"
            description="Nenhuma pericia disponivel para este personagem."
          />
        ) : (
          <div className="space-y-2">
            <div className="session-pericias-header">
              <div className="session-pericias-header__meta">
                <p className="session-pericias-header__title">Pericias</p>
                <p className="session-pericias-header__subtitle">
                  {mostrarSomentePericiasBonificadas
                    ? 'Exibindo somente pericias com bonus positivo.'
                    : 'Resumo dos bonus aplicados por treino, equipamento e outros.'}
                </p>
              </div>
              <div className="session-pericias-header__actions">
                <Badge size="sm" color="gray">
                  {periciasFiltradas.length} de {periciasOrdenadas.length}
                </Badge>
                <Button
                  size="xs"
                  variant={
                    mostrarSomentePericiasBonificadas ? 'secondary' : 'ghost'
                  }
                  onClick={() =>
                    setMostrarSomentePericiasBonificadas((estado) => !estado)
                  }
                  disabled={periciasOrdenadas.length === 0}
                >
                  {mostrarSomentePericiasBonificadas
                    ? 'Mostrar todas'
                    : 'Somente com bonus'}
                </Button>
              </div>
            </div>

            {periciasFiltradas.length === 0 ? (
              <EmptyState
                variant="session"
                size="sm"
                icon="skills"
                title="Nenhuma pericia com bonus"
                description="Nenhuma pericia com bonus positivo foi encontrada."
              />
            ) : (
              <div className="session-pericias-list">
                {periciasFiltradas.map((pericia) => {
                  const total = pericia.bonusTotal;
                  const totalLabel = total > 0 ? `+${total}` : String(total);
                  return (
                    <div key={pericia.codigo} className="session-pericia-card">
                      <div className="session-pericia-card__head">
                        <div className="session-pericia-card__meta">
                          <p className="session-pericia-card__name">
                            {pericia.nome}
                          </p>
                          <span className="session-pericia-card__attr">
                            {pericia.atributoBase}
                          </span>
                        </div>
                        <span className="session-pericia-card__total">
                          {totalLabel}
                        </span>
                      </div>
                      <div className="session-pericia-card__breakdown">
                        <span className="session-pericia-breakdown__item">
                          <span className="session-pericia-breakdown__label">
                            Treino
                          </span>
                          <span className="session-pericia-breakdown__value">
                            {formatarBonus(pericia.bonusTreinamento)}
                          </span>
                        </span>
                        <span className="session-pericia-breakdown__item">
                          <span className="session-pericia-breakdown__label">
                            Equip
                          </span>
                          <span className="session-pericia-breakdown__value">
                            {formatarBonus(pericia.bonusEquipamento)}
                          </span>
                        </span>
                        <span className="session-pericia-breakdown__item">
                          <span className="session-pericia-breakdown__label">
                            Outros
                          </span>
                          <span className="session-pericia-breakdown__value">
                            {formatarBonus(pericia.bonusOutros)}
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )
      ) : null}

      {abaDetalheCard === 'CONDICOES'
        ? renderPainelCondicoes(
            'PERSONAGEM',
            card.personagemSessaoId,
            card.nomePersonagem,
            card.condicoesAtivas,
            'inline',
          )
        : null}

      {abaDetalheCard === 'TECNICAS' ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="inline-flex items-center gap-2 session-text-xxs text-app-muted">
              <input
                type="checkbox"
                checked={mostrarSomenteSustentadasAtivas}
                onChange={(event) =>
                  onToggleMostrarSomenteSustentadas(event.target.checked)
                }
                disabled={card.sustentacoesAtivas.length === 0}
                className="h-3.5 w-3.5 rounded border border-app-border bg-app-surface"
              />
              Somente sustentadas ({card.sustentacoesAtivas.length})
            </label>
            <div className="flex items-center gap-2">
              {mostrarSomenteSustentadasAtivas ? (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => onToggleMostrarSomenteSustentadas(false)}
                >
                  Limpar filtro
                </Button>
              ) : null}
              <Button
                size="xs"
                variant="ghost"
                onClick={() => {
                  const proximo = !(tecnicaInataAberta && tecnicasNaoInatasAbertas);
                  onToggleTecnicaInata(proximo);
                  onToggleTecnicasNaoInatas(proximo);
                }}
              >
                {tecnicaInataAberta && tecnicasNaoInatasAbertas
                  ? 'Recolher tudo'
                  : 'Expandir tudo'}
              </Button>
            </div>
          </div>
          <p className="session-text-xxs text-app-muted">
            {mostrarSomenteSustentadasAtivas
              ? `Mostrando ${totalHabilidadesSustentadas} de ${totalHabilidades} habilidades`
              : `Total de habilidades: ${totalHabilidades}`}
          </p>
          <details
            className="rounded border border-app-border p-2"
            open={tecnicaInataAberta}
            onToggle={(event) => onToggleTecnicaInata(event.currentTarget.open)}
          >
            <summary className="cursor-pointer text-xs font-semibold text-app-fg">
              Tecnica inata ({totalHabilidadesInata} habilidade(s))
            </summary>
            <div className="mt-2 space-y-2">
              {card.tecnicaInata ? (
                <SessionTechniqueBlock
                  card={card}
                  tecnica={card.tecnicaInata}
                  mostrarSomenteSustentadasAtivas={mostrarSomenteSustentadasAtivas}
                  obterQtdSustentacaoAtiva={obterQtdSustentacaoAtiva}
                  acumulosHabilidade={acumulosHabilidade}
                  onAtualizarAcumulosHabilidade={onAtualizarAcumulosHabilidade}
                  sessaoEncerrada={sessaoEncerrada}
                  acaoHabilidadePendente={acaoHabilidadePendente}
                  onUsarHabilidade={onUsarHabilidade}
                />
              ) : (
                <p className="session-text-xxs text-app-muted">
                  Personagem sem tecnica inata cadastrada.
                </p>
              )}
            </div>
          </details>

          <details
            className="rounded border border-app-border p-2"
            open={tecnicasNaoInatasAbertas}
            onToggle={(event) =>
              onToggleTecnicasNaoInatas(event.currentTarget.open)
            }
          >
            <summary className="cursor-pointer text-xs font-semibold text-app-fg">
              Tecnicas nao inatas ({card.tecnicasNaoInatas.length} tecnica(s) |{' '}
              {totalHabilidadesNaoInatas} habilidade(s))
            </summary>
            <div className="mt-2 space-y-2">
              {card.tecnicasNaoInatas.length > 0 ? (
                card.tecnicasNaoInatas.map((tecnica) => (
                  <SessionTechniqueBlock
                    key={`tecnica-${tecnica.id}`}
                    card={card}
                    tecnica={tecnica}
                    mostrarSomenteSustentadasAtivas={mostrarSomenteSustentadasAtivas}
                    obterQtdSustentacaoAtiva={obterQtdSustentacaoAtiva}
                    acumulosHabilidade={acumulosHabilidade}
                    onAtualizarAcumulosHabilidade={onAtualizarAcumulosHabilidade}
                    sessaoEncerrada={sessaoEncerrada}
                    acaoHabilidadePendente={acaoHabilidadePendente}
                    onUsarHabilidade={onUsarHabilidade}
                  />
                ))
              ) : (
                <p className="session-text-xxs text-app-muted">
                  Nenhuma tecnica nao inata disponivel no momento.
                </p>
              )}
            </div>
          </details>
        </div>
      ) : null}

      {abaDetalheCard === 'SUSTENTACOES' ? (
        <div className="rounded border border-app-border p-2 space-y-1.5">
          <p className="text-xs font-semibold text-app-fg">
            Sustentacoes ativas ({card.sustentacoesAtivas.length})
          </p>
          {card.sustentacoesAtivas.length === 0 ? (
            <p className="session-text-xxs text-app-muted">
              Nenhuma habilidade sustentada ativa.
            </p>
          ) : (
            card.sustentacoesAtivas.map((sustentacao) => {
              const chaveEncerrar = montarChaveEncerrarSustentacao(
                card.personagemSessaoId,
                sustentacao.id,
              );
              const custoTotal =
                sustentacao.custoSustentacaoEA + sustentacao.custoSustentacaoPE;
              const custoBadgeColor =
                custoTotal >= 4 || sustentacao.custoSustentacaoPE > 0
                  ? 'orange'
                  : custoTotal >= 2
                    ? 'yellow'
                    : 'blue';
              return (
                <div
                  key={`sustentacao-${sustentacao.id}`}
                  className="rounded border border-app-border bg-app-surface px-2 py-2 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-app-fg">
                        {sustentacao.nomeHabilidade}
                        {sustentacao.nomeVariacao
                          ? ` (${sustentacao.nomeVariacao})`
                          : ''}
                      </p>
                      <p className="session-text-xxs text-app-muted">
                        Ativa desde rodada {sustentacao.ativadaNaRodada}
                      </p>
                    </div>
                    <Badge
                      color={custoBadgeColor}
                      size="sm"
                      title={
                        custoBadgeColor === 'orange'
                          ? 'Custo alto por rodada'
                          : custoBadgeColor === 'yellow'
                            ? 'Custo moderado por rodada'
                            : 'Custo por rodada'
                      }
                    >
                      {formatarCustos(
                        sustentacao.custoSustentacaoEA,
                        sustentacao.custoSustentacaoPE,
                      )}
                      /rodada
                    </Badge>
                  </div>
                  {card.podeEditar ? (
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          onEncerrarSustentacao(
                            card.personagemSessaoId,
                            sustentacao.id,
                          )
                        }
                        disabled={
                          sessaoEncerrada ||
                          acaoHabilidadePendente === chaveEncerrar
                        }
                      >
                        {acaoHabilidadePendente === chaveEncerrar
                          ? 'Encerrando...'
                          : 'Encerrar'}
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
