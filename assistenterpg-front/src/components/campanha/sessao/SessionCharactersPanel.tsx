'use client';

import type { ReactNode } from 'react';
import { SessionPanel } from '@/components/campanha/sessao/SessionPanel';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Button } from '@/components/ui/Button';
import { CharacterSessionCard } from '@/components/campanha/sessao/CharacterSessionCard';
import type { SessaoCampanhaDetalhe } from '@/lib/types';
import type { AbaDetalheCard } from '@/lib/campanha/sessao-preferencias';
import type {
  AjustesRecursos,
  CampoAjusteRecurso,
} from '@/hooks/useSessaoRecursos';
import {
  formatarCustos,
  resolverCustoExibicaoSessao as resolverCustoExibicao,
} from '@/lib/campanha/sessao-habilidades';
import { textoSeguro } from '@/lib/campanha/sessao-formatters';

type SessionCharactersPanelProps = {
  cards: SessaoCampanhaDetalhe['cards'];
  iniciativaPorPersonagemSessao: Map<number, number>;
  cardsRecursosExpandidos: Record<number, boolean>;
  onAlternarExpandido: (personagemSessaoId: number) => void;
  obterAjustesRecursosCard: (personagemCampanhaId: number) => AjustesRecursos;
  onAtualizarAjusteRecursoCard: (
    personagemCampanhaId: number,
    campo: CampoAjusteRecurso,
    valor: string,
  ) => void;
  campoRecursoPendente: `${number}:${CampoAjusteRecurso}` | null;
  salvandoCardId: number | null;
  sessaoEncerrada: boolean;
  acaoHabilidadePendente: string | null;
  mostrarSomenteSustentadas: Record<number, boolean>;
  onToggleMostrarSomenteSustentadas: (personagemSessaoId: number, checked: boolean) => void;
  abasDetalheCard: Record<number, AbaDetalheCard>;
  onAtualizarAbaDetalheCard: (personagemSessaoId: number, aba: AbaDetalheCard) => void;
  tecnicasNaoInatasAbertas: Record<number, boolean>;
  onToggleTecnicasNaoInatas: (personagemSessaoId: number, aberto: boolean) => void;
  acumulosHabilidade: Record<string, string>;
  onAtualizarAcumulosHabilidade: (chave: string, valor: string) => void;
  onUsarHabilidade: (
    personagemSessaoId: number,
    habilidadeTecnicaId: number,
    variacaoHabilidadeId?: number,
    acumulos?: number,
  ) => void;
  onEncerrarSustentacao: (personagemSessaoId: number, sustentacaoId: number) => void;
  onAplicarDeltaRecursoCard: (
    card: SessaoCampanhaDetalhe['cards'][number],
    campo: CampoAjusteRecurso,
    delta: number,
  ) => void;
  onAplicarAjustePersonalizadoRecursoCard: (
    card: SessaoCampanhaDetalhe['cards'][number],
    campo: CampoAjusteRecurso,
  ) => void;
  onAbrirEdicaoPersonagem: (card: SessaoCampanhaDetalhe['cards'][number]) => void;
  onAbrirFichaCompleta: (card: SessaoCampanhaDetalhe['cards'][number]) => void;
  renderPainelCondicoes: (
    alvoTipo: 'PERSONAGEM' | 'NPC',
    alvoId: number,
    nomeAlvo: string,
    condicoesAtivas: SessaoCampanhaDetalhe['cards'][number]['condicoesAtivas'],
    modo?: 'inline' | 'accordion',
  ) => ReactNode;
  erro?: string | null;
};

function montarChaveSustentacaoAtiva(
  habilidadeTecnicaId: number,
  variacaoHabilidadeId?: number | null,
): string {
  return `${habilidadeTecnicaId}:${variacaoHabilidadeId ?? 'base'}`;
}

function montarChaveUsoHabilidade(
  personagemSessaoId: number,
  habilidadeTecnicaId: number,
  variacaoHabilidadeId?: number,
): string {
  return `usar:${personagemSessaoId}:${habilidadeTecnicaId}:${variacaoHabilidadeId ?? 'base'}`;
}

function montarChaveAcumuloHabilidade(
  personagemSessaoId: number,
  habilidadeTecnicaId: number,
  variacaoHabilidadeId?: number,
): string {
  return `acumulo:${personagemSessaoId}:${habilidadeTecnicaId}:${variacaoHabilidadeId ?? 'base'}`;
}

function parseAcumulos(valor: string | undefined, maximo: number): number {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return 0;
  return Math.max(0, Math.min(maximo, Math.trunc(numero)));
}

export function SessionCharactersPanel({
  cards,
  iniciativaPorPersonagemSessao,
  cardsRecursosExpandidos,
  onAlternarExpandido,
  obterAjustesRecursosCard,
  onAtualizarAjusteRecursoCard,
  campoRecursoPendente,
  salvandoCardId,
  sessaoEncerrada,
  acaoHabilidadePendente,
  mostrarSomenteSustentadas,
  onToggleMostrarSomenteSustentadas,
  abasDetalheCard,
  onAtualizarAbaDetalheCard,
  tecnicasNaoInatasAbertas,
  onToggleTecnicasNaoInatas,
  acumulosHabilidade,
  onAtualizarAcumulosHabilidade,
  onUsarHabilidade,
  onEncerrarSustentacao,
  onAplicarDeltaRecursoCard,
  onAplicarAjustePersonalizadoRecursoCard,
  onAbrirEdicaoPersonagem,
  onAbrirFichaCompleta,
  renderPainelCondicoes,
  erro,
}: SessionCharactersPanelProps) {
  const renderTecnica = (
    card: SessaoCampanhaDetalhe['cards'][number],
    sustentacoesAtivasPorHabilidade: Map<string, number>,
    tecnica: NonNullable<SessaoCampanhaDetalhe['cards'][number]['tecnicaInata']>,
  ) => {
    const filtroSomenteSustentadasAtivas = Boolean(
      mostrarSomenteSustentadas[card.personagemSessaoId],
    );
    const obterQtdSustentacaoAtiva = (
      habilidadeTecnicaId: number,
      variacaoHabilidadeId?: number | null,
    ) =>
      sustentacoesAtivasPorHabilidade.get(
        montarChaveSustentacaoAtiva(habilidadeTecnicaId, variacaoHabilidadeId),
      ) ?? 0;
    const habilidadesVisiveis = filtroSomenteSustentadasAtivas
      ? tecnica.habilidades.filter((habilidade) => {
          const baseAtiva = obterQtdSustentacaoAtiva(habilidade.id) > 0;
          const variacaoAtiva = habilidade.variacoes.some(
            (variacao) =>
              obterQtdSustentacaoAtiva(habilidade.id, variacao.id) > 0,
          );
          return baseAtiva || variacaoAtiva;
        })
      : tecnica.habilidades;

    return (
      <div key={tecnica.id} className="space-y-2 rounded border border-app-border p-2">
        <div>
          <p className="text-xs font-semibold text-app-fg">{textoSeguro(tecnica.nome)}</p>
          <p className="text-[11px] text-app-muted">
            {textoSeguro(tecnica.codigo)} | {textoSeguro(tecnica.tipo)}
          </p>
          {tecnica.descricao ? (
            <p className="text-[11px] text-app-muted">{textoSeguro(tecnica.descricao)}</p>
          ) : null}
        </div>
        {habilidadesVisiveis.length === 0 ? (
          <p className="text-[11px] text-app-muted">
            {filtroSomenteSustentadasAtivas
              ? 'Nenhuma habilidade com sustentacao ativa nesta tecnica.'
              : 'Nenhuma habilidade liberada com os graus atuais.'}
          </p>
        ) : (
          <div className="space-y-2">
            {habilidadesVisiveis.map((habilidade) => {
              const custoBase = resolverCustoExibicao(habilidade);
              const chaveAcumuloBase = montarChaveAcumuloHabilidade(
                card.personagemSessaoId,
                habilidade.id,
              );
              const acumulosBase = custoBase.escalonavel
                ? parseAcumulos(
                    acumulosHabilidade[chaveAcumuloBase],
                    custoBase.acumulosMaximos,
                  )
                : 0;
              const custoBaseTotalEA =
                custoBase.custoEA +
                custoBase.escalonamentoCustoEA * acumulosBase;
              const custoBaseTotalPE =
                custoBase.custoPE +
                custoBase.escalonamentoCustoPE * acumulosBase;
              const chaveBase = montarChaveUsoHabilidade(
                card.personagemSessaoId,
                habilidade.id,
              );
              const qtdSustentacaoBaseAtiva = obterQtdSustentacaoAtiva(
                habilidade.id,
              );

              return (
                <div
                  key={`habilidade-${habilidade.id}`}
                  className="rounded border border-app-border bg-app-surface px-2 py-1.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-app-fg">
                      {textoSeguro(habilidade.nome)}
                    </p>
                    {qtdSustentacaoBaseAtiva > 0 ? (
                      <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                        Sustentada ativa x{qtdSustentacaoBaseAtiva}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-app-muted">
                    {textoSeguro(habilidade.execucao)}
                    {habilidade.alcance ? ` | Alcance: ${textoSeguro(habilidade.alcance)}` : ''}
                    {habilidade.alvo ? ` | Alvo: ${textoSeguro(habilidade.alvo)}` : ''}
                    {custoBase.duracao ? ` | Duracao: ${textoSeguro(custoBase.duracao)}` : ''}
                  </p>
                  <p className="text-[11px] text-app-muted">
                    Custo base: {formatarCustos(custoBase.custoEA, custoBase.custoPE)}
                    {custoBase.sustentada
                      ? ` | Sustentacao: ${formatarCustos(
                          custoBase.custoSustentacaoEA ?? 0,
                          custoBase.custoSustentacaoPE ?? 0,
                        )}/rodada`
                      : ''}
                  </p>
                  {custoBase.escalonavel ? (
                    <div className="flex items-center gap-2 text-[11px] text-app-muted">
                      <span>Acumulos</span>
                      <input
                        type="number"
                        min={0}
                        max={custoBase.acumulosMaximos}
                        value={acumulosHabilidade[chaveAcumuloBase] ?? '0'}
                        onChange={(event) => {
                          const normalizado = parseAcumulos(
                            event.target.value,
                            custoBase.acumulosMaximos,
                          );
                          onAtualizarAcumulosHabilidade(
                            chaveAcumuloBase,
                            String(normalizado),
                          );
                        }}
                        disabled={!card.podeEditar || sessaoEncerrada}
                        className="w-16 rounded border border-app-border bg-app-surface px-2 py-1 text-[11px] text-app-fg"
                      />
                      <span>
                        {`max ${custoBase.acumulosMaximos} | +EA ${custoBase.escalonamentoCustoEA}/acumulo${
                          custoBase.escalonamentoCustoPE > 0
                            ? ` | +PE ${custoBase.escalonamentoCustoPE}/acumulo`
                            : ''
                        }`}
                      </span>
                    </div>
                  ) : null}
                  <p className="text-[11px] text-app-muted whitespace-pre-wrap">
                    {textoSeguro(habilidade.efeito)}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {card.podeEditar ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          void onUsarHabilidade(
                            card.personagemSessaoId,
                            habilidade.id,
                            undefined,
                            acumulosBase,
                          )
                        }
                        disabled={
                          sessaoEncerrada || acaoHabilidadePendente === chaveBase
                        }
                        title={`Custo: ${formatarCustos(custoBaseTotalEA, custoBaseTotalPE)}`}
                      >
                        {acaoHabilidadePendente === chaveBase
                          ? 'Aplicando...'
                          : 'Usar base'}
                      </Button>
                    ) : null}

                    {(filtroSomenteSustentadasAtivas
                      ? habilidade.variacoes.filter(
                          (variacao) =>
                            obterQtdSustentacaoAtiva(habilidade.id, variacao.id) > 0,
                        )
                      : habilidade.variacoes
                    ).map((variacao) => {
                      const custoVariacao = resolverCustoExibicao(habilidade, variacao);
                      const execucaoVariacao = variacao.execucao ?? habilidade.execucao;
                      const alcanceVariacao = variacao.alcance ?? habilidade.alcance;
                      const alvoVariacao = variacao.alvo ?? habilidade.alvo;
                      const duracaoVariacao = variacao.duracao ?? custoVariacao.duracao;
                      const chaveAcumuloVariacao = montarChaveAcumuloHabilidade(
                        card.personagemSessaoId,
                        habilidade.id,
                        variacao.id,
                      );
                      const acumulosVariacao = custoVariacao.escalonavel
                        ? parseAcumulos(
                            acumulosHabilidade[chaveAcumuloVariacao],
                            custoVariacao.acumulosMaximos,
                          )
                        : 0;
                      const custoVariacaoTotalEA =
                        custoVariacao.custoEA +
                        custoVariacao.escalonamentoCustoEA * acumulosVariacao;
                      const custoVariacaoTotalPE =
                        custoVariacao.custoPE +
                        custoVariacao.escalonamentoCustoPE * acumulosVariacao;
                      const chaveVariacao = montarChaveUsoHabilidade(
                        card.personagemSessaoId,
                        habilidade.id,
                        variacao.id,
                      );
                      const qtdSustentacaoVariacaoAtiva =
                        obterQtdSustentacaoAtiva(habilidade.id, variacao.id);

                      return (
                        <div
                          key={`variacao-${variacao.id}`}
                          className="w-full rounded border border-app-border bg-app-bg px-2 py-1.5 space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[11px] font-semibold text-app-fg">
                              {textoSeguro(variacao.nome)}
                            </p>
                            {qtdSustentacaoVariacaoAtiva > 0 ? (
                              <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                                Ativa x{qtdSustentacaoVariacaoAtiva}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-[11px] text-app-muted">
                            {textoSeguro(variacao.descricao)}
                          </p>
                          <p className="text-[11px] text-app-muted">
                            {textoSeguro(execucaoVariacao)}
                            {alcanceVariacao ? ` | Alcance: ${textoSeguro(alcanceVariacao)}` : ''}
                            {alvoVariacao ? ` | Alvo: ${textoSeguro(alvoVariacao)}` : ''}
                            {duracaoVariacao ? ` | Duracao: ${textoSeguro(duracaoVariacao)}` : ''}
                          </p>
                          <p className="text-[11px] text-app-muted">
                            Custo: {formatarCustos(custoVariacao.custoEA, custoVariacao.custoPE)}
                            {custoVariacao.sustentada
                              ? ` | Sustentacao: ${formatarCustos(
                                  custoVariacao.custoSustentacaoEA ?? 0,
                                  custoVariacao.custoSustentacaoPE ?? 0,
                                )}/rodada`
                              : ''}
                          </p>
                          {variacao.efeitoAdicional ? (
                            <p className="text-[11px] text-app-muted whitespace-pre-wrap">
                              {textoSeguro(variacao.efeitoAdicional)}
                            </p>
                          ) : null}

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {custoVariacao.escalonavel ? (
                              <>
                                <input
                                  type="number"
                                  min={0}
                                  max={custoVariacao.acumulosMaximos}
                                  value={acumulosHabilidade[chaveAcumuloVariacao] ?? '0'}
                                  onChange={(event) => {
                                    const normalizado = parseAcumulos(
                                      event.target.value,
                                      custoVariacao.acumulosMaximos,
                                    );
                                    onAtualizarAcumulosHabilidade(
                                      chaveAcumuloVariacao,
                                      String(normalizado),
                                    );
                                  }}
                                  disabled={!card.podeEditar || sessaoEncerrada}
                                  className="w-14 rounded border border-app-border bg-app-surface px-1.5 py-1 text-[11px] text-app-fg"
                                  title={`Acumulos (max ${custoVariacao.acumulosMaximos})`}
                                />
                                <span className="text-[11px] text-app-muted">
                                  {`max ${custoVariacao.acumulosMaximos} | +EA ${custoVariacao.escalonamentoCustoEA}/acumulo${
                                    custoVariacao.escalonamentoCustoPE > 0
                                      ? ` | +PE ${custoVariacao.escalonamentoCustoPE}/acumulo`
                                      : ''
                                  }`}
                                </span>
                              </>
                            ) : null}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                void onUsarHabilidade(
                                  card.personagemSessaoId,
                                  habilidade.id,
                                  variacao.id,
                                  acumulosVariacao,
                                )
                              }
                              disabled={
                                !card.podeEditar ||
                                sessaoEncerrada ||
                                acaoHabilidadePendente === chaveVariacao
                              }
                              title={`Custo total: ${formatarCustos(
                                custoVariacaoTotalEA,
                                custoVariacaoTotalPE,
                              )}`}
                            >
                              {acaoHabilidadePendente === chaveVariacao
                                ? 'Aplicando...'
                                : 'Usar variacao'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <SessionPanel
        title="Personagens da sessao"
        subtitle="Jogadores editam apenas sua ficha. O mestre pode editar todas."
      />
      {erro ? <ErrorAlert message={erro} /> : null}

      {cards.length === 0 ? (
        <EmptyState
          variant="card"
          icon="characters"
          title="Sem personagens na sessao"
          description="Associe personagens na campanha para aparecerem no lobby."
        />
      ) : (
        cards.map((card) => {
          const ajustesRecursos = obterAjustesRecursosCard(card.personagemCampanhaId);
          const cardRecursosExpandido = Boolean(
            cardsRecursosExpandidos[card.personagemSessaoId],
          );
          const campoRecursoPendenteCard =
            campoRecursoPendente?.startsWith(`${card.personagemCampanhaId}:`)
              ? (campoRecursoPendente.split(':')[1] as CampoAjusteRecurso)
              : null;
          const iniciativaValor = iniciativaPorPersonagemSessao.get(
            card.personagemSessaoId,
          );
          const abaDetalheCard = abasDetalheCard[card.personagemSessaoId] ?? 'RESUMO';
          const totalTecnicasCard =
            (card.tecnicaInata ? 1 : 0) + card.tecnicasNaoInatas.length;
          const totalCondicoesAtivasCard = card.condicoesAtivas.length;
          const totalSustentacoesAtivasCard = card.sustentacoesAtivas.length;
          const sustentacoesAtivasPorHabilidade = new Map<string, number>();
          for (const sustentacao of card.sustentacoesAtivas) {
            const chave = montarChaveSustentacaoAtiva(
              sustentacao.habilidadeTecnicaId,
              sustentacao.variacaoHabilidadeId,
            );
            sustentacoesAtivasPorHabilidade.set(
              chave,
              (sustentacoesAtivasPorHabilidade.get(chave) ?? 0) + 1,
            );
          }

          return (
            <CharacterSessionCard
              key={card.personagemSessaoId}
              card={card}
              iniciativaValor={iniciativaValor ?? null}
              cardRecursosExpandido={cardRecursosExpandido}
              abaDetalheCard={abaDetalheCard}
              totalCondicoesAtivasCard={totalCondicoesAtivasCard}
              totalTecnicasCard={totalTecnicasCard}
              totalSustentacoesAtivasCard={totalSustentacoesAtivasCard}
              mostrarSomenteSustentadasAtivas={Boolean(
                mostrarSomenteSustentadas[card.personagemSessaoId],
              )}
              onToggleMostrarSomenteSustentadas={(checked) =>
                onToggleMostrarSomenteSustentadas(card.personagemSessaoId, checked)
              }
              onAtualizarAbaDetalheCard={(aba) =>
                onAtualizarAbaDetalheCard(card.personagemSessaoId, aba)
              }
              tecnicasNaoInatasAbertas={Boolean(
                tecnicasNaoInatasAbertas[card.personagemSessaoId],
              )}
              onToggleTecnicasNaoInatas={(aberto) =>
                onToggleTecnicasNaoInatas(card.personagemSessaoId, aberto)
              }
              ajustesRecursos={ajustesRecursos}
              campoRecursoPendenteCard={campoRecursoPendenteCard}
              sessaoEncerrada={sessaoEncerrada}
              salvandoCardId={salvandoCardId}
              acaoHabilidadePendente={acaoHabilidadePendente}
              onAlternarExpandido={() => onAlternarExpandido(card.personagemSessaoId)}
              onAtualizarAjusteRecursoPersonalizado={(campo, valor) =>
                onAtualizarAjusteRecursoCard(card.personagemCampanhaId, campo, valor)
              }
              onAplicarDeltaRecurso={(campo, delta) =>
                void onAplicarDeltaRecursoCard(card, campo, delta)
              }
              onAplicarAjustePersonalizado={(campo) =>
                void onAplicarAjustePersonalizadoRecursoCard(card, campo)
              }
              onAbrirEdicaoPersonagem={() => onAbrirEdicaoPersonagem(card)}
              onAbrirFichaCompleta={() => onAbrirFichaCompleta(card)}
              renderPainelCondicoes={renderPainelCondicoes}
              renderTecnica={(tecnica) =>
                renderTecnica(card, sustentacoesAtivasPorHabilidade, tecnica)
              }
              onEncerrarSustentacao={(personagemSessaoId, sustentacaoId) =>
                void onEncerrarSustentacao(personagemSessaoId, sustentacaoId)
              }
              formatarCustos={formatarCustos}
            />
          );
        })
      )}
    </>
  );
}
