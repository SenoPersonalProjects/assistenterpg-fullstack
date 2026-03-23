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

type AcumulosControlProps = {
  valor: number;
  maximo: number;
  disabled: boolean;
  custoEA: number;
  custoPE: number;
  onChange: (valor: number) => void;
};

function AcumulosControl({
  valor,
  maximo,
  disabled,
  custoEA,
  custoPE,
  onChange,
}: AcumulosControlProps) {
  const clamp = (numero: number) => Math.max(0, Math.min(maximo, numero));

  return (
    <div className="flex flex-wrap items-center gap-2 rounded border border-app-border bg-app-bg px-2 py-1 text-[11px]">
      <span className="text-app-muted">Acumulos</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="h-7 w-7 rounded border border-app-border bg-app-surface text-xs text-app-fg disabled:opacity-50"
          onClick={() => onChange(clamp(valor - 1))}
          disabled={disabled || valor <= 0}
          title="Diminuir acumulos"
        >
          -
        </button>
        <input
          type="number"
          min={0}
          max={maximo}
          value={valor}
          onChange={(event) => {
            const numero = Number(event.target.value);
            onChange(clamp(Number.isFinite(numero) ? numero : 0));
          }}
          disabled={disabled}
          className="h-7 w-14 rounded border border-app-border bg-app-surface px-2 text-center text-[11px] text-app-fg"
        />
        <button
          type="button"
          className="h-7 w-7 rounded border border-app-border bg-app-surface text-xs text-app-fg disabled:opacity-50"
          onClick={() => onChange(clamp(valor + 1))}
          disabled={disabled || valor >= maximo}
          title="Aumentar acumulos"
        >
          +
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-1 text-[10px] text-app-muted">
        <span className="rounded border border-app-border px-1.5 py-0.5">
          max {maximo}
        </span>
        <span className="rounded border border-app-border px-1.5 py-0.5">
          +EA {custoEA}/acumulo
        </span>
        {custoPE > 0 ? (
          <span className="rounded border border-app-border px-1.5 py-0.5">
            +PE {custoPE}/acumulo
          </span>
        ) : null}
      </div>
    </div>
  );
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
            const variacoesVisiveis = mostrarSomenteSustentadasAtivas
              ? habilidade.variacoes.filter(
                  (variacao) =>
                    obterQtdSustentacaoAtiva(habilidade.id, variacao.id) > 0,
                )
              : habilidade.variacoes;
            const possuiSustentacaoAtiva =
              qtdSustentacaoBaseAtiva > 0 ||
              variacoesVisiveis.some(
                (variacao) =>
                  obterQtdSustentacaoAtiva(habilidade.id, variacao.id) > 0,
              );
            const habilidadeAberta =
              mostrarSomenteSustentadasAtivas || possuiSustentacaoAtiva;

            return (
              <details
                key={`habilidade-${habilidade.id}`}
                className="rounded border border-app-border bg-app-surface"
                open={habilidadeAberta}
              >
                <summary className="cursor-pointer px-2 py-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-app-fg">
                        {textoSeguro(habilidade.nome)}
                      </span>
                      <span className="text-[10px] text-app-muted">
                        {formatarCustos(custoBase.custoEA, custoBase.custoPE)}
                        {custoBase.sustentada
                          ? ` | Sustentacao ${formatarCustos(
                              custoBase.custoSustentacaoEA ?? 0,
                              custoBase.custoSustentacaoPE ?? 0,
                            )}/rodada`
                          : ''}
                      </span>
                    </div>
                    {qtdSustentacaoBaseAtiva > 0 ? (
                      <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                        Sustentada ativa x{qtdSustentacaoBaseAtiva}
                      </span>
                    ) : null}
                  </div>
                </summary>
                <div className="space-y-1.5 border-t border-app-border px-2 py-1.5">
                  <p className="text-[11px] text-app-muted">
                    {textoSeguro(habilidade.execucao)}
                    {habilidade.alcance
                      ? ` | Alcance: ${textoSeguro(habilidade.alcance)}`
                      : ''}
                    {habilidade.alvo
                      ? ` | Alvo: ${textoSeguro(habilidade.alvo)}`
                      : ''}
                    {custoBase.duracao
                      ? ` | Duracao: ${textoSeguro(custoBase.duracao)}`
                      : ''}
                  </p>
                  {custoBase.escalonavel ? (
                    <AcumulosControl
                      valor={acumulosBase}
                      maximo={custoBase.acumulosMaximos}
                      disabled={!card.podeEditar || sessaoEncerrada}
                      custoEA={custoBase.escalonamentoCustoEA}
                      custoPE={custoBase.escalonamentoCustoPE}
                      onChange={(valor) =>
                        onAtualizarAcumulosHabilidade(
                          chaveAcumuloBase,
                          String(valor),
                        )
                      }
                    />
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
                        title={`Custo: ${formatarCustos(
                          custoBaseTotalEA,
                          custoBaseTotalPE,
                        )}`}
                      >
                        {acaoHabilidadePendente === chaveBase
                          ? 'Aplicando...'
                          : 'Usar base'}
                      </Button>
                    ) : null}

                    {variacoesVisiveis.map((variacao) => {
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
                    const variacaoAberta =
                      mostrarSomenteSustentadasAtivas ||
                      qtdSustentacaoVariacaoAtiva > 0;

                    return (
                      <details
                        key={`variacao-${variacao.id}`}
                        className="w-full rounded border border-app-border bg-app-bg"
                        open={variacaoAberta}
                      >
                        <summary className="cursor-pointer px-2 py-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-col">
                              <span className="text-[11px] font-semibold text-app-fg">
                                {textoSeguro(variacao.nome)}
                              </span>
                              <span className="text-[10px] text-app-muted">
                                {formatarCustos(
                                  custoVariacao.custoEA,
                                  custoVariacao.custoPE,
                                )}
                                {custoVariacao.sustentada
                                  ? ` | Sustentacao ${formatarCustos(
                                      custoVariacao.custoSustentacaoEA ?? 0,
                                      custoVariacao.custoSustentacaoPE ?? 0,
                                    )}/rodada`
                                  : ''}
                              </span>
                            </div>
                            {qtdSustentacaoVariacaoAtiva > 0 ? (
                              <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                                Ativa x{qtdSustentacaoVariacaoAtiva}
                              </span>
                            ) : null}
                          </div>
                        </summary>
                        <div className="space-y-1 border-t border-app-border px-2 py-1.5">
                          <p className="text-[11px] text-app-muted">
                            {textoSeguro(variacao.descricao)}
                          </p>
                          <p className="text-[11px] text-app-muted">
                            {textoSeguro(execucaoVariacao)}
                            {alcanceVariacao
                              ? ` | Alcance: ${textoSeguro(alcanceVariacao)}`
                              : ''}
                            {alvoVariacao
                              ? ` | Alvo: ${textoSeguro(alvoVariacao)}`
                              : ''}
                            {duracaoVariacao
                              ? ` | Duracao: ${textoSeguro(duracaoVariacao)}`
                              : ''}
                          </p>
                          {variacao.efeitoAdicional ? (
                            <p className="text-[11px] text-app-muted whitespace-pre-wrap">
                              {textoSeguro(variacao.efeitoAdicional)}
                            </p>
                          ) : null}

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {custoVariacao.escalonavel ? (
                              <AcumulosControl
                                valor={acumulosVariacao}
                                maximo={custoVariacao.acumulosMaximos}
                                disabled={!card.podeEditar || sessaoEncerrada}
                                custoEA={custoVariacao.escalonamentoCustoEA}
                                custoPE={custoVariacao.escalonamentoCustoPE}
                                onChange={(valor) =>
                                  onAtualizarAcumulosHabilidade(
                                    chaveAcumuloVariacao,
                                    String(valor),
                                  )
                                }
                              />
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
                      </details>
                    );
                  })}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
