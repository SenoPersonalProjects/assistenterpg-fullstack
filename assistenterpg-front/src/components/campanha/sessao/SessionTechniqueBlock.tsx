'use client';

import { Button } from '@/components/ui/Button';
import type { SessaoCampanhaDetalhe } from '@/lib/types';
import {
  formatarCustos,
  resolverCustoExibicaoSessao as resolverCustoExibicao,
} from '@/lib/campanha/sessao-habilidades';
import { textoSeguro } from '@/lib/campanha/sessao-formatters';

type SessionTechniqueBlockProps = {
  card: SessaoCampanhaDetalhe['cards'][number];
  tecnica: NonNullable<SessaoCampanhaDetalhe['cards'][number]['tecnicaInata']>;
  mostrarSomenteSustentadasAtivas: boolean;
  obterQtdSustentacaoAtiva: (
    habilidadeTecnicaId: number,
    variacaoHabilidadeId?: number | null,
  ) => number;
  acumulosHabilidade: Record<string, string>;
  onAtualizarAcumulosHabilidade: (chave: string, valor: string) => void;
  sessaoEncerrada: boolean;
  acaoHabilidadePendente: string | null;
  onUsarHabilidade: (
    personagemSessaoId: number,
    habilidadeTecnicaId: number,
    variacaoHabilidadeId?: number,
    acumulos?: number,
  ) => void;
};

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

export function SessionTechniqueBlock({
  card,
  tecnica,
  mostrarSomenteSustentadasAtivas,
  obterQtdSustentacaoAtiva,
  acumulosHabilidade,
  onAtualizarAcumulosHabilidade,
  sessaoEncerrada,
  acaoHabilidadePendente,
  onUsarHabilidade,
}: SessionTechniqueBlockProps) {
  const habilidadesVisiveis = mostrarSomenteSustentadasAtivas
    ? tecnica.habilidades.filter((habilidade) => {
        const baseAtiva = obterQtdSustentacaoAtiva(habilidade.id) > 0;
        const variacaoAtiva = habilidade.variacoes.some(
          (variacao) => obterQtdSustentacaoAtiva(habilidade.id, variacao.id) > 0,
        );
        return baseAtiva || variacaoAtiva;
      })
    : tecnica.habilidades;

  return (
    <div className="space-y-2 rounded border border-app-border p-2">
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
          {mostrarSomenteSustentadasAtivas
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
              custoBase.custoEA + custoBase.escalonamentoCustoEA * acumulosBase;
            const custoBaseTotalPE =
              custoBase.custoPE + custoBase.escalonamentoCustoPE * acumulosBase;
            const chaveBase = montarChaveUsoHabilidade(
              card.personagemSessaoId,
              habilidade.id,
            );
            const qtdSustentacaoBaseAtiva = obterQtdSustentacaoAtiva(habilidade.id);

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
                      disabled={sessaoEncerrada || acaoHabilidadePendente === chaveBase}
                      title={`Custo: ${formatarCustos(custoBaseTotalEA, custoBaseTotalPE)}`}
                    >
                      {acaoHabilidadePendente === chaveBase
                        ? 'Aplicando...'
                        : 'Usar base'}
                    </Button>
                  ) : null}

                  {(mostrarSomenteSustentadasAtivas
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
                    const qtdSustentacaoVariacaoAtiva = obterQtdSustentacaoAtiva(
                      habilidade.id,
                      variacao.id,
                    );

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
}
