'use client';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import type React from 'react';
import type { SessaoCampanhaDetalhe } from '@/lib/types';
import {
  normalizarDadosDano,
  normalizarEscalonamentoDano,
  resolverCustoExibicaoSessao as resolverCustoExibicao,
  resolverTesteHabilidade,
} from '@/lib/campanha/sessao-habilidades';
import { textoSeguro } from '@/lib/campanha/sessao-formatters';
import { TIPO_EXECUCAO_LABELS, TipoExecucao } from '@/lib/types/homebrew-enums';
import type {
  HabilidadeRollContext,
  RolagemDanoHabilidadeSessaoPayload,
  RolagemTesteHabilidadeSessaoPayload,
} from '@/components/campanha/sessao/types';

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
  onRolarTesteHabilidade: (payload: RolagemTesteHabilidadeSessaoPayload) => void;
  onRolarDanoHabilidade: (payload: RolagemDanoHabilidadeSessaoPayload) => void;
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

function parseAcumulos(
  valor: string | undefined,
  maximo: number,
  minimo = 1,
): number {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return minimo;
  return Math.max(minimo, Math.min(maximo, Math.trunc(numero)));
}

type MetaItem = {
  label: string;
  value: string;
};

function montarMetadadosHabilidade({
  execucao,
  alcance,
  alvo,
  duracao,
}: {
  execucao?: string | null;
  alcance?: string | null;
  alvo?: string | null;
  duracao?: string | null;
}): MetaItem[] {
  const itens: MetaItem[] = [];
  if (execucao)
    itens.push({ label: 'Execucao', value: formatExecucao(execucao) });
  if (alcance) itens.push({ label: 'Alcance', value: textoSeguro(alcance) });
  if (alvo) itens.push({ label: 'Alvo', value: textoSeguro(alvo) });
  if (duracao) itens.push({ label: 'Duracao', value: textoSeguro(duracao) });
  return itens;
}

function formatExecucao(value: string | null | undefined): string {
  if (!value) return '';
  const key = value as TipoExecucao;
  const label = TIPO_EXECUCAO_LABELS[key] ?? value;
  return textoSeguro(label);
}

function renderCustoBadges({
  prefix,
  custoEA,
  custoPE,
  color = 'gray',
  variant = 'soft',
}: {
  prefix?: string;
  custoEA: number;
  custoPE: number;
  color?: 'gray' | 'green' | 'red' | 'blue' | 'yellow' | 'purple' | 'orange' | 'cyan';
  variant?: 'soft' | 'outline' | 'solid';
}) {
  const badges: React.ReactNode[] = [];
  if (custoEA > 0) {
    badges.push(
      <Badge key={`${prefix ?? ''}-ea`} size="sm" color={color} variant={variant}>
        {prefix ? `${prefix} ` : ''}EA {custoEA}
      </Badge>,
    );
  }
  if (custoPE > 0) {
    badges.push(
      <Badge key={`${prefix ?? ''}-pe`} size="sm" color={color} variant={variant}>
        {prefix ? `${prefix} ` : ''}PE {custoPE}
      </Badge>,
    );
  }
  if (badges.length === 0) {
    badges.push(
      <Badge key={`${prefix ?? ''}-zero`} size="sm" color="gray" variant={variant}>
        {prefix ? `${prefix} ` : ''}Sem custo
      </Badge>,
    );
  }
  return badges;
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
  const clamp = (numero: number) => Math.max(1, Math.min(maximo, numero));

  return (
    <div className="rounded border border-app-border bg-app-bg/80 p-2 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-app-fg">Acumulos</p>
          <p className="text-[10px] text-app-muted">Maximo {maximo}</p>
        </div>
        <span className="text-sm font-semibold text-app-fg">{valor}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="h-8 w-8 rounded border border-app-border bg-app-surface text-sm text-app-fg disabled:opacity-50"
          onClick={() => onChange(clamp(valor - 1))}
          disabled={disabled || valor <= 1}
          title="Diminuir acumulos"
        >
          -
        </button>
        <input
          type="number"
          min={1}
          max={maximo}
          value={valor}
          onChange={(event) => {
            const numero = Number(event.target.value);
            onChange(clamp(Number.isFinite(numero) ? numero : 1));
          }}
          disabled={disabled}
          className="h-8 w-16 rounded border border-app-border bg-app-surface px-2 text-center text-xs text-app-fg"
        />
        <button
          type="button"
          className="h-8 w-8 rounded border border-app-border bg-app-surface text-sm text-app-fg disabled:opacity-50"
          onClick={() => onChange(clamp(valor + 1))}
          disabled={disabled || valor >= maximo}
          title="Aumentar acumulos"
        >
          +
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-app-muted">
        <Badge size="sm" color="gray" variant="outline">
          +EA {custoEA}/acumulo
        </Badge>
        {custoPE > 0 ? (
          <Badge size="sm" color="gray" variant="outline">
            +PE {custoPE}/acumulo
          </Badge>
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
  onRolarTesteHabilidade,
  onRolarDanoHabilidade,
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
    <div className="space-y-3 rounded border border-app-border bg-app-surface/30 p-3">
      <div className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-app-fg">
              {textoSeguro(tecnica.nome)}
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge size="sm" color="gray" variant="outline">
                {textoSeguro(tecnica.codigo)}
              </Badge>
              <Badge size="sm" color="blue" variant="outline">
                {textoSeguro(tecnica.tipo)}
              </Badge>
            </div>
          </div>
        </div>
        {tecnica.descricao ? (
          <p className="text-xs text-app-muted leading-relaxed">
            {textoSeguro(tecnica.descricao)}
          </p>
        ) : null}
      </div>

      {habilidadesVisiveis.length === 0 ? (
        <EmptyState
          variant="session"
          size="sm"
          icon="info"
          title="Sem habilidades visiveis"
          description={
            mostrarSomenteSustentadasAtivas
              ? 'Nenhuma habilidade desta tecnica esta atualmente sustentada.'
              : 'Nenhuma habilidade desta tecnica esta liberada pelos graus atuais.'
          }
        />
      ) : (
        <div className="space-y-3">
          {habilidadesVisiveis.map((habilidade) => {
            const custoBase = resolverCustoExibicao(habilidade);
            const chaveAcumuloBase = montarChaveAcumuloHabilidade(
              card.personagemSessaoId,
              habilidade.id,
            );
            const maxAcumulosBase = Math.max(
              1,
              Math.min(custoBase.acumulosMaximos, 5),
            );
            const acumulosBase = custoBase.escalonavel
              ? parseAcumulos(
                  acumulosHabilidade[chaveAcumuloBase],
                  maxAcumulosBase,
                  1,
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
            const testesBaseResolvidos = resolverTesteHabilidade(
              habilidade.testesExigidos,
              card.pericias ?? [],
              card.atributos,
            );
            const dadosDanoBase = normalizarDadosDano(habilidade.dadosDano);
            const escalonamentoDanoBase = normalizarEscalonamentoDano(
              habilidade.escalonamentoDano,
            );
            const danoFlatBase =
              typeof habilidade.danoFlat === 'number' ? habilidade.danoFlat : null;
            const danoBaseDisponivel =
              dadosDanoBase.length > 0 || (danoFlatBase ?? 0) > 0;
            const acumulosBaseAplicados = custoBase.escalonavel
              ? Math.max(1, acumulosBase)
              : 1;
            const habilidadeContextBase: HabilidadeRollContext = {
              habilidadeNome: habilidade.nome,
              variacaoNome: null,
              criticoValor: habilidade.criticoValor,
              criticoMultiplicador: habilidade.criticoMultiplicador,
              dano: danoBaseDisponivel
                ? {
                    dadosDano: dadosDanoBase,
                    danoFlat: danoFlatBase,
                    danoFlatTipo: habilidade.danoFlatTipo,
                    escalonamentoDano: escalonamentoDanoBase,
                    acumulos: acumulosBaseAplicados,
                  }
                : null,
            };
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
            const metaBase = montarMetadadosHabilidade({
              execucao: habilidade.execucao,
              alcance: habilidade.alcance,
              alvo: habilidade.alvo,
              duracao: custoBase.duracao ?? habilidade.duracao ?? null,
            });

            return (
              <details
                key={`habilidade-${habilidade.id}`}
                className="group rounded border border-app-border bg-app-surface"
                open={habilidadeAberta}
              >
                <summary className="list-none cursor-pointer px-3 py-2 [&::-webkit-details-marker]:hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-app-fg">
                        {textoSeguro(habilidade.nome)}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {renderCustoBadges({
                          custoEA: custoBase.custoEA,
                          custoPE: custoBase.custoPE,
                          color: 'blue',
                          variant: 'soft',
                        })}
                        {custoBase.sustentada
                          ? renderCustoBadges({
                              prefix: 'Sust.',
                              custoEA: custoBase.custoSustentacaoEA ?? 0,
                              custoPE: custoBase.custoSustentacaoPE ?? 0,
                              color: 'cyan',
                              variant: 'outline',
                            })
                          : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {qtdSustentacaoBaseAtiva > 0 ? (
                        <Badge size="sm" color="green" variant="solid">
                          Sustentada x{qtdSustentacaoBaseAtiva}
                        </Badge>
                      ) : null}
                      <Icon
                        name="chevron-down"
                        className="h-4 w-4 text-app-muted transition-transform group-open:rotate-180"
                      />
                    </div>
                  </div>
                </summary>
                <div className="space-y-2 border-t border-app-border/70 px-3 py-2">
                  <p className="text-xs text-app-fg leading-relaxed">
                    {textoSeguro(habilidade.efeito)}
                  </p>
                  {metaBase.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {metaBase.map((item) => (
                        <Badge
                          key={`${habilidade.id}-${item.label}`}
                          size="sm"
                          variant="outline"
                        >
                          <span className="text-[10px] font-semibold uppercase text-app-muted">
                            {item.label}:
                          </span>
                          <span className="ml-1 text-[10px] text-app-fg">
                            {item.value}
                          </span>
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  {custoBase.escalonavel ? (
                    <AcumulosControl
                      valor={acumulosBase}
                      maximo={maxAcumulosBase}
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
                  {card.podeEditar && (testesBaseResolvidos || danoBaseDisponivel) ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {testesBaseResolvidos ? (
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() =>
                            onRolarTesteHabilidade({
                              alvoTipo: 'PERSONAGEM',
                              alvoNome: card.nomePersonagem,
                              periciaNome: testesBaseResolvidos.periciaNomeExibida,
                              atributoBase: testesBaseResolvidos.atributoBase,
                              dados: testesBaseResolvidos.dados,
                              bonus: testesBaseResolvidos.bonus,
                              keepMode: testesBaseResolvidos.keepMode,
                              habilidade: habilidadeContextBase,
                            })
                          }
                          disabled={sessaoEncerrada}
                          title="Rolar teste da habilidade"
                        >
                          <Icon name="dice" className="h-3 w-3" />
                          Rolar teste
                        </Button>
                      ) : null}
                      {danoBaseDisponivel ? (
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() =>
                            onRolarDanoHabilidade({
                              alvoTipo: 'PERSONAGEM',
                              alvoNome: card.nomePersonagem,
                              habilidade: habilidadeContextBase,
                            })
                          }
                          disabled={sessaoEncerrada}
                          title="Rolar dano/efeito da habilidade"
                        >
                          <Icon name="sparkles" className="h-3 w-3" />
                          Rolar dano/efeito
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-app-border/60 pt-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {renderCustoBadges({
                        prefix: 'Total',
                        custoEA: custoBaseTotalEA,
                        custoPE: custoBaseTotalPE,
                        color: 'orange',
                        variant: 'solid',
                      })}
                    </div>
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
                      >
                        {acaoHabilidadePendente === chaveBase
                          ? 'Aplicando...'
                          : 'Usar base'}
                      </Button>
                    ) : null}
                  </div>

                  {variacoesVisiveis.length > 0 ? (
                    <div className="space-y-2 border-l border-app-border/60 pl-3">
                      {variacoesVisiveis.map((variacao) => {
                        const custoVariacao = resolverCustoExibicao(
                          habilidade,
                          variacao,
                        );
                        const execucaoVariacao =
                          variacao.execucao ?? habilidade.execucao;
                        const alcanceVariacao =
                          variacao.alcance ?? habilidade.alcance;
                        const alvoVariacao = variacao.alvo ?? habilidade.alvo;
                        const duracaoVariacao =
                          variacao.duracao ?? custoVariacao.duracao;
                        const chaveAcumuloVariacao = montarChaveAcumuloHabilidade(
                          card.personagemSessaoId,
                          habilidade.id,
                          variacao.id,
                        );
                        const maxAcumulosVariacao = Math.max(
                          1,
                          Math.min(custoVariacao.acumulosMaximos, 5),
                        );
                        const acumulosVariacao = custoVariacao.escalonavel
                          ? parseAcumulos(
                              acumulosHabilidade[chaveAcumuloVariacao],
                              maxAcumulosVariacao,
                              1,
                            )
                          : 0;
                        const custoVariacaoTotalEA =
                          custoVariacao.custoEA +
                          custoVariacao.escalonamentoCustoEA * acumulosVariacao;
                        const custoVariacaoTotalPE =
                          custoVariacao.custoPE +
                          custoVariacao.escalonamentoCustoPE * acumulosVariacao;
                        const testesVariacaoResolvidos = resolverTesteHabilidade(
                          habilidade.testesExigidos,
                          card.pericias ?? [],
                          card.atributos,
                        );
                        const dadosDanoVariacao = normalizarDadosDano(
                          variacao.dadosDano ?? habilidade.dadosDano,
                        );
                        const escalonamentoDanoVariacao = normalizarEscalonamentoDano(
                          variacao.escalonamentoDano ?? habilidade.escalonamentoDano,
                        );
                        const danoFlatVariacao =
                          typeof variacao.danoFlat === 'number'
                            ? variacao.danoFlat
                            : habilidade.danoFlat;
                        const danoVariacaoDisponivel =
                          dadosDanoVariacao.length > 0 ||
                          (danoFlatVariacao ?? 0) > 0;
                        const acumulosVariacaoAplicados = custoVariacao.escalonavel
                          ? Math.max(1, acumulosVariacao)
                          : 1;
                        const habilidadeContextVariacao: HabilidadeRollContext = {
                          habilidadeNome: habilidade.nome,
                          variacaoNome: variacao.nome,
                          criticoValor:
                            variacao.criticoValor ?? habilidade.criticoValor ?? null,
                          criticoMultiplicador:
                            variacao.criticoMultiplicador ??
                            habilidade.criticoMultiplicador ??
                            null,
                          dano: danoVariacaoDisponivel
                            ? {
                                dadosDano: dadosDanoVariacao,
                                danoFlat: danoFlatVariacao,
                                danoFlatTipo:
                                  variacao.danoFlatTipo ?? habilidade.danoFlatTipo,
                                escalonamentoDano: escalonamentoDanoVariacao,
                                acumulos: acumulosVariacaoAplicados,
                              }
                            : null,
                        };
                        const chaveVariacao = montarChaveUsoHabilidade(
                          card.personagemSessaoId,
                          habilidade.id,
                          variacao.id,
                        );
                        const qtdSustentacaoVariacaoAtiva =
                          obterQtdSustentacaoAtiva(habilidade.id, variacao.id);
                        const variacaoAberta =
                          mostrarSomenteSustentadasAtivas ||
                          qtdSustentacaoVariacaoAtiva > 0;
                        const metaVariacao = montarMetadadosHabilidade({
                          execucao: execucaoVariacao,
                          alcance: alcanceVariacao,
                          alvo: alvoVariacao,
                          duracao: duracaoVariacao ?? null,
                        });

                        return (
                          <details
                            key={`variacao-${variacao.id}`}
                            className="group rounded border border-app-border bg-app-bg/70"
                            open={variacaoAberta}
                          >
                            <summary className="list-none cursor-pointer px-2 py-2 [&::-webkit-details-marker]:hidden">
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-app-fg">
                                    {textoSeguro(variacao.nome)}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {renderCustoBadges({
                                      custoEA: custoVariacao.custoEA,
                                      custoPE: custoVariacao.custoPE,
                                      color: 'purple',
                                      variant: 'soft',
                                    })}
                                    {custoVariacao.sustentada
                                      ? renderCustoBadges({
                                          prefix: 'Sust.',
                                          custoEA:
                                            custoVariacao.custoSustentacaoEA ??
                                            0,
                                          custoPE:
                                            custoVariacao.custoSustentacaoPE ??
                                            0,
                                          color: 'cyan',
                                          variant: 'outline',
                                        })
                                      : null}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {qtdSustentacaoVariacaoAtiva > 0 ? (
                                    <Badge size="sm" color="green" variant="solid">
                                      Sustentada x{qtdSustentacaoVariacaoAtiva}
                                    </Badge>
                                  ) : null}
                                  <Icon
                                    name="chevron-down"
                                    className="h-4 w-4 text-app-muted transition-transform group-open:rotate-180"
                                  />
                                </div>
                              </div>
                            </summary>
                            <div className="space-y-2 border-t border-app-border/70 px-2 py-2">
                              <p className="text-xs text-app-fg leading-relaxed">
                                {textoSeguro(variacao.descricao)}
                              </p>
                              {variacao.efeitoAdicional ? (
                                <p className="text-[11px] text-app-muted whitespace-pre-wrap">
                                  {textoSeguro(variacao.efeitoAdicional)}
                                </p>
                              ) : null}
                              {metaVariacao.length > 0 ? (
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {metaVariacao.map((item) => (
                                    <Badge
                                      key={`${variacao.id}-${item.label}`}
                                      size="sm"
                                      color="gray"
                                      variant="outline"
                                    >
                                      <span className="text-[10px] font-semibold uppercase text-app-muted">
                                        {item.label}:
                                      </span>
                                      <span className="ml-1 text-[10px] text-app-fg">
                                        {item.value}
                                      </span>
                                    </Badge>
                                  ))}
                                </div>
                              ) : null}
                              {custoVariacao.escalonavel ? (
                                <AcumulosControl
                                  valor={acumulosVariacao}
                                  maximo={maxAcumulosVariacao}
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
                              {card.podeEditar &&
                              (testesVariacaoResolvidos || danoVariacaoDisponivel) ? (
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {testesVariacaoResolvidos ? (
                                    <Button
                                      size="xs"
                                      variant="ghost"
                                      onClick={() =>
                                        onRolarTesteHabilidade({
                                          alvoTipo: 'PERSONAGEM',
                                          alvoNome: card.nomePersonagem,
                                          periciaNome:
                                            testesVariacaoResolvidos.periciaNomeExibida,
                                          atributoBase:
                                            testesVariacaoResolvidos.atributoBase,
                                          dados: testesVariacaoResolvidos.dados,
                                          bonus: testesVariacaoResolvidos.bonus,
                                          keepMode: testesVariacaoResolvidos.keepMode,
                                          habilidade: habilidadeContextVariacao,
                                        })
                                      }
                                      disabled={sessaoEncerrada}
                                      title="Rolar teste da habilidade"
                                    >
                                      <Icon name="dice" className="h-3 w-3" />
                                      Rolar teste
                                    </Button>
                                  ) : null}
                                  {danoVariacaoDisponivel ? (
                                    <Button
                                      size="xs"
                                      variant="ghost"
                                      onClick={() =>
                                        onRolarDanoHabilidade({
                                          alvoTipo: 'PERSONAGEM',
                                          alvoNome: card.nomePersonagem,
                                          habilidade: habilidadeContextVariacao,
                                        })
                                      }
                                      disabled={sessaoEncerrada}
                                      title="Rolar dano/efeito da habilidade"
                                    >
                                      <Icon name="sparkles" className="h-3 w-3" />
                                      Rolar dano/efeito
                                    </Button>
                                  ) : null}
                                </div>
                              ) : null}
                              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-app-border/60 pt-2">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {renderCustoBadges({
                                    prefix: 'Total',
                                    custoEA: custoVariacaoTotalEA,
                                    custoPE: custoVariacaoTotalPE,
                                    color: 'orange',
                                    variant: 'solid',
                                  })}
                                </div>
                                <Button
                                  size="xs"
                                  variant="secondary"
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
                  ) : null}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
