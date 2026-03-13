'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import type { CondicaoAtivaSessaoCampanha, SessaoCampanhaDetalhe } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SessionCharacterResourceCard } from '@/components/campanha/sessao/SessionCharacterResourceCard';
import { SessionTabs } from '@/components/campanha/sessao/SessionTabs';
import { textoSeguro } from '@/lib/campanha/sessao-formatters';
import type { AbaDetalheCard } from '@/lib/campanha/sessao-preferencias';

export type CampoAjusteRecursoCard = 'pv' | 'pe' | 'ea' | 'san';

type CharacterSessionCardProps = {
  card: SessaoCampanhaDetalhe['cards'][number];
  iniciativaValor: number | null;
  cardRecursosExpandido: boolean;
  abaDetalheCard: AbaDetalheCard;
  totalCondicoesAtivasCard: number;
  totalTecnicasCard: number;
  totalSustentacoesAtivasCard: number;
  mostrarSomenteSustentadasAtivas: boolean;
  onToggleMostrarSomenteSustentadas: (checked: boolean) => void;
  onAtualizarAbaDetalheCard: (aba: AbaDetalheCard) => void;
  tecnicasNaoInatasAbertas: boolean;
  onToggleTecnicasNaoInatas: (aberto: boolean) => void;
  ajustesRecursos: Record<CampoAjusteRecursoCard, string>;
  campoRecursoPendenteCard: CampoAjusteRecursoCard | null;
  sessaoEncerrada: boolean;
  salvandoCardId: number | null;
  acaoHabilidadePendente: string | null;
  onAlternarExpandido: () => void;
  onAtualizarAjusteRecursoPersonalizado: (
    campo: CampoAjusteRecursoCard,
    valor: string,
  ) => void;
  onAplicarDeltaRecurso: (campo: CampoAjusteRecursoCard, delta: number) => void;
  onAplicarAjustePersonalizado: (campo: CampoAjusteRecursoCard) => void;
  onAbrirEdicaoPersonagem: () => void;
  onAbrirFichaCompleta: () => void;
  renderPainelCondicoes: (
    alvoTipo: 'PERSONAGEM' | 'NPC',
    alvoId: number,
    nomeAlvo: string,
    condicoesAtivas: CondicaoAtivaSessaoCampanha[],
    modo?: 'inline' | 'accordion',
  ) => ReactNode;
  renderTecnica: (
    tecnica: NonNullable<SessaoCampanhaDetalhe['cards'][number]['tecnicaInata']>,
  ) => ReactNode;
  onEncerrarSustentacao: (
    personagemSessaoId: number,
    sustentacaoId: number,
  ) => void;
  formatarCustos: (custoEA: number, custoPE: number) => string;
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

export function CharacterSessionCard({
  card,
  iniciativaValor,
  cardRecursosExpandido,
  abaDetalheCard,
  totalCondicoesAtivasCard,
  totalTecnicasCard,
  totalSustentacoesAtivasCard,
  mostrarSomenteSustentadasAtivas,
  onToggleMostrarSomenteSustentadas,
  onAtualizarAbaDetalheCard,
  tecnicasNaoInatasAbertas,
  onToggleTecnicasNaoInatas,
  ajustesRecursos,
  campoRecursoPendenteCard,
  sessaoEncerrada,
  salvandoCardId,
  acaoHabilidadePendente,
  onAlternarExpandido,
  onAtualizarAjusteRecursoPersonalizado,
  onAplicarDeltaRecurso,
  onAplicarAjustePersonalizado,
  onAbrirEdicaoPersonagem,
  onAbrirFichaCompleta,
  renderPainelCondicoes,
  renderTecnica,
  onEncerrarSustentacao,
  formatarCustos,
}: CharacterSessionCardProps) {
  const recursos = card.recursos;
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
  const [tecnicaInataAberta, setTecnicaInataAberta] = useState(true);
  const todasTecnicasAbertas = tecnicaInataAberta && tecnicasNaoInatasAbertas;
  const acaoHabilidadeCard =
    acaoHabilidadePendente &&
    new RegExp(`^(usar|encerrar):${card.personagemSessaoId}:`).test(
      acaoHabilidadePendente,
    )
      ? acaoHabilidadePendente
      : null;
  const mensagensStatus: string[] = [];
  if (
    campoRecursoPendenteCard ||
    salvandoCardId === card.personagemCampanhaId
  ) {
    mensagensStatus.push('Atualizando recurso...');
  }
  if (acaoHabilidadeCard) {
    mensagensStatus.push(
      acaoHabilidadeCard.startsWith('encerrar:')
        ? 'Encerrando sustentacao...'
        : 'Aplicando habilidade...',
    );
  }

  return (
    <Card className="session-panel space-y-3">
      {recursos ? (
        <SessionCharacterResourceCard
          nomePersonagem={card.nomePersonagem}
          nomeJogador={card.nomeJogador}
          iniciativaValor={iniciativaValor ?? null}
          expandido={cardRecursosExpandido}
          onAlternarExpandido={onAlternarExpandido}
          podeAjustar={card.podeEditar}
          ajustePersonalizado={ajustesRecursos}
          onAtualizarAjustePersonalizado={onAtualizarAjusteRecursoPersonalizado}
          onAplicarAjusteRapido={onAplicarDeltaRecurso}
          onAplicarAjustePersonalizado={onAplicarAjustePersonalizado}
          acaoPendenteCampo={campoRecursoPendenteCard}
          desabilitado={
            sessaoEncerrada || salvandoCardId === card.personagemCampanhaId
          }
          recursos={{
            pvAtual: recursos.pvAtual,
            pvMax: recursos.pvMax,
            sanAtual: recursos.sanAtual,
            sanMax: recursos.sanMax,
            eaAtual: recursos.eaAtual,
            eaMax: recursos.eaMax,
            peAtual: recursos.peAtual,
            peMax: recursos.peMax,
          }}
        />
      ) : (
        <div>
          <h3 className="text-sm font-semibold text-app-fg">{card.nomePersonagem}</h3>
          <p className="text-xs text-app-muted">Jogador: {card.nomeJogador}</p>
        </div>
      )}

      {!recursos ? (
        <div className="space-y-2">
          <Badge size="sm" color="gray">
            Somente leitura
          </Badge>
          <p className="text-xs text-app-muted">
            Recursos completos indisponiveis para este personagem no momento.
            Voce ainda pode acompanhar a iniciativa e informacoes basicas.
          </p>
        </div>
      ) : null}

      {mensagensStatus.length > 0 ? (
        <div className="rounded border border-app-border bg-app-surface px-2 py-1.5 text-[11px] text-app-muted space-y-1">
          {mensagensStatus.map((mensagem) => (
            <p key={mensagem}>{mensagem}</p>
          ))}
        </div>
      ) : null}

      {recursos && cardRecursosExpandido ? (
        <div className="space-y-2">
          <SessionTabs
            tabs={[
              { id: 'RESUMO', label: 'Resumo', icon: 'chart' },
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
                  <p className="text-[11px] font-semibold text-app-muted uppercase">
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
                  <p className="text-[11px] font-semibold text-app-muted uppercase">
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
                  <p className="text-[11px] text-app-muted">
                    Tecnica principal: {resumoTecnica}
                  </p>
                </div>
              </div>
              {card.podeEditar ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onAbrirEdicaoPersonagem}
                    disabled={sessaoEncerrada || !card.recursos}
                  >
                    Ajustes narrativos
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAbrirFichaCompleta}
                  >
                    Abrir ficha completa
                  </Button>
                </div>
              ) : null}
            </div>
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
                <label className="inline-flex items-center gap-2 text-[11px] text-app-muted">
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
                      const proximo = !todasTecnicasAbertas;
                      setTecnicaInataAberta(proximo);
                      onToggleTecnicasNaoInatas(proximo);
                    }}
                  >
                    {todasTecnicasAbertas ? 'Recolher tudo' : 'Expandir tudo'}
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-app-muted">
                {mostrarSomenteSustentadasAtivas
                  ? `Mostrando ${totalHabilidadesSustentadas} de ${totalHabilidades} habilidades`
                  : `Total de habilidades: ${totalHabilidades}`}
              </p>
              <details
                className="rounded border border-app-border p-2"
                open={tecnicaInataAberta}
                onToggle={(event) => setTecnicaInataAberta(event.currentTarget.open)}
              >
                <summary className="cursor-pointer text-xs font-semibold text-app-fg">
                  Tecnica inata ({totalHabilidadesInata} habilidade(s))
                </summary>
                <div className="mt-2 space-y-2">
                  {card.tecnicaInata ? (
                    renderTecnica(card.tecnicaInata)
                  ) : (
                    <p className="text-[11px] text-app-muted">
                      Personagem sem tecnica inata cadastrada.
                    </p>
                  )}
                </div>
              </details>

              <details
                className="rounded border border-app-border p-2"
                open={tecnicasNaoInatasAbertas}
                onToggle={(event) => onToggleTecnicasNaoInatas(event.currentTarget.open)}
              >
                <summary className="cursor-pointer text-xs font-semibold text-app-fg">
                  Tecnicas nao inatas ({card.tecnicasNaoInatas.length} tecnica(s) | {totalHabilidadesNaoInatas} habilidade(s))
                </summary>
                <div className="mt-2 space-y-2">
                  {card.tecnicasNaoInatas.length > 0 ? (
                    card.tecnicasNaoInatas.map((tecnica) => renderTecnica(tecnica))
                  ) : (
                    <p className="text-[11px] text-app-muted">
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
                <p className="text-[11px] text-app-muted">
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
                          <p className="text-[11px] text-app-muted">
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
      ) : null}

      {recursos && !cardRecursosExpandido ? (
        <div className="rounded border border-app-border bg-app-bg p-2 space-y-2">
          <div className="session-chip-row">
            <span className="session-chip">
              INI {typeof iniciativaValor === 'number' ? iniciativaValor : '--'}
            </span>
            <span className="session-chip">
              PV {recursos.pvAtual}/{recursos.pvMax}
            </span>
            <span className="session-chip">
              PE {recursos.peAtual}/{recursos.peMax}
            </span>
            <span className="session-chip">
              EA {recursos.eaAtual}/{recursos.eaMax}
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
          <p className="text-[11px] text-app-muted">
            Tecnica principal: {resumoTecnica}
          </p>
        </div>
      ) : null}
    </Card>
  );
}
