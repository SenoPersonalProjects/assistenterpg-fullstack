'use client';

import type { ReactNode } from 'react';
import type {
  CondicaoAtivaSessaoCampanha,
  SessaoCampanhaDetalhe,
} from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SessionCharacterResourceCard } from '@/components/campanha/sessao/SessionCharacterResourceCard';
import { SessionTabs } from '@/components/campanha/sessao/SessionTabs';
import { textoSeguro } from '@/lib/campanha/sessao-formatters';

export type CampoAjusteRecursoCard = 'pv' | 'pe' | 'ea' | 'san';
export type AbaDetalheCard =
  | 'RESUMO'
  | 'CONDICOES'
  | 'TECNICAS'
  | 'SUSTENTACOES';

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
          </p>
        </div>
      ) : null}

      {recursos && cardRecursosExpandido ? (
        <div className="space-y-2">
          <SessionTabs
            tabs={[
              { id: 'RESUMO', label: 'Resumo', icon: 'chart' },
              {
                id: 'CONDICOES',
                label: 'Condicoes',
                icon: 'status',
                count: totalCondicoesAtivasCard,
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
            ]}
            activeId={abaDetalheCard}
            onChange={(tabId) => onAtualizarAbaDetalheCard(tabId as AbaDetalheCard)}
          />

          {abaDetalheCard === 'RESUMO' ? (
            <div className="space-y-2 rounded border border-app-border p-2">
              <p className="text-xs text-app-muted">
                Resumo rapido do personagem na sessao.
              </p>
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
                <span className="session-chip">Tecnicas {totalTecnicasCard}</span>
              </div>
              <p className="text-[11px] text-app-muted">
                Tecnica principal: {resumoTecnica}
              </p>
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
              )
            : null}

          {abaDetalheCard === 'TECNICAS' ? (
            <div className="space-y-2">
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
                Mostrar apenas habilidades com sustentacao ativa (
                {card.sustentacoesAtivas.length})
              </label>
              <details className="rounded border border-app-border p-2" open>
                <summary className="cursor-pointer text-xs font-semibold text-app-fg">
                  Tecnica inata
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

              <details className="rounded border border-app-border p-2">
                <summary className="cursor-pointer text-xs font-semibold text-app-fg">
                  Tecnicas nao inatas ({card.tecnicasNaoInatas.length})
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
                  return (
                    <div
                      key={`sustentacao-${sustentacao.id}`}
                      className="rounded border border-app-border bg-app-surface px-2 py-1.5 flex items-center justify-between gap-2"
                    >
                      <div>
                        <p className="text-xs font-semibold text-app-fg">
                          {sustentacao.nomeHabilidade}
                          {sustentacao.nomeVariacao
                            ? ` (${sustentacao.nomeVariacao})`
                            : ''}
                        </p>
                        <p className="text-[11px] text-app-muted">
                          {formatarCustos(
                            sustentacao.custoSustentacaoEA,
                            sustentacao.custoSustentacaoPE,
                          )}
                          /rodada | Ativa desde rodada {sustentacao.ativadaNaRodada}
                        </p>
                      </div>
                      {card.podeEditar ? (
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
          {card.podeEditar ? (
            <Button variant="ghost" size="sm" onClick={onAbrirFichaCompleta}>
              Abrir ficha completa
            </Button>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
