'use client';

import type {
  CampanhaRoletaHistoricoItem,
  CampanhaRoletaPoolItem,
} from '@/lib/api/campanha-roleta';
import {
  agruparRepeticoesRoleta,
  calcularChanceRoleta,
  formatarChanceRoleta,
  lerConfigSnapshotRoleta,
  type EtapaGiroRoleta,
} from '@/lib/campanhas/campaign-roulette.helpers';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

const ROTULOS_SLOT = {
  CLA: 'Clã',
  TECNICA: 'Técnica',
  CUSTOMIZADO: 'Customizado',
} as const;

const ROTULOS_STATUS = {
  AGUARDANDO_GIRO_1: 'Aguardando 1º giro',
  AGUARDANDO_GIRO_2: 'Aguardando 2º giro',
  AGUARDANDO_ESCOLHA: 'Aguardando escolha',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
} as const;

const ROTULOS_EVENTO: Record<string, string> = {
  SORTEIO_INICIADO: 'Sorteio iniciado',
  GIRO_REALIZADO: 'Giro realizado',
  OPCAO_ESCOLHIDA: 'Opção escolhida',
  TERCEIRO_GIRO_REALIZADO: 'Terceiro giro definitivo',
  SORTEIO_CANCELADO: 'Sorteio cancelado',
};

const ROTULOS_FONTE = {
  SISTEMA_BASE: 'Sistema base',
  SUPLEMENTO: 'Suplemento',
  HOMEBREW: 'Homebrew',
  MANUAL: 'Manual',
} as const;

function corStatus(
  status: CampanhaRoletaHistoricoItem['status'],
): 'green' | 'red' | 'yellow' {
  if (status === 'FINALIZADO') return 'green';
  if (status === 'CANCELADO') return 'red';
  return 'yellow';
}

function formatarData(valor: string | null): string {
  return valor ? new Date(valor).toLocaleString('pt-BR') : 'Não registrado';
}

function etapaPorIndice(indice: number): EtapaGiroRoleta {
  if (indice === 0) return 1;
  if (indice === 1) return 2;
  return 3;
}

function indiceResultadoFinal(item: CampanhaRoletaHistoricoItem): number {
  if (!item.resultadoFinal) return -1;
  if (item.resultados.length >= 3) return 2;
  return item.resultados.findIndex(
    (resultado) => resultado.chave === item.resultadoFinal?.chave,
  );
}

function metadadosItem(poolItem: CampanhaRoletaPoolItem) {
  return (
    <div className="flex flex-wrap gap-1">
      <Badge color="gray" size="sm">
        {ROTULOS_FONTE[poolItem.fonte]}
      </Badge>
      {poolItem.ocorrencias > 1 ? (
        <Badge color="yellow" size="sm">
          Repetido ×{poolItem.ocorrencias}
        </Badge>
      ) : null}
      {poolItem.hereditaria ? (
        <Badge color="purple" size="sm">
          Hereditária
        </Badge>
      ) : null}
      {poolItem.incluidoManualmente ? (
        <Badge color="blue" size="sm">
          Inclusão manual
        </Badge>
      ) : null}
    </div>
  );
}

export function CampaignRouletteHistoryCard({
  item,
  aberto,
  onAlternar,
}: {
  item: CampanhaRoletaHistoricoItem;
  aberto: boolean;
  onAlternar: () => void;
}) {
  const painelId = `historico-roleta-${item.id}`;
  const configSnapshot = aberto ? lerConfigSnapshotRoleta(item.configSnapshot) : null;
  const repeticoesManuais = configSnapshot
    ? agruparRepeticoesRoleta(configSnapshot.config.listaManualTexto)
    : [];
  const entradasManuais = configSnapshot
    ? configSnapshot.config.listaManualTexto
        .split(';')
        .map((entrada) => entrada.trim())
        .filter(Boolean)
    : [];
  const primeiroResultadoChave = item.resultados[0]?.chave ?? null;
  const finalIndex = indiceResultadoFinal(item);

  return (
    <article className="rounded-xl border border-app-border bg-app-card/55 p-3 transition-colors hover:border-app-primary/35">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-app-fg">
            {ROTULOS_SLOT[item.slot]} · {item.resultadoFinal?.nome ?? ROTULOS_STATUS[item.status]}
          </p>
          <p className="text-xs text-app-muted">
            {formatarData(item.criadoEm)}
            {item.alvo ? ` · ${item.alvo.apelido}` : ''}
          </p>
          <p className="mt-1 text-xs text-app-muted">
            {item.poolSnapshot.quantidadeResultados} possibilidades · peso total{' '}
            {item.poolSnapshot.pesoTotal} · {item.eventos.length} eventos
          </p>
        </div>
        <Badge color={corStatus(item.status)}>{ROTULOS_STATUS[item.status]}</Badge>
      </div>

      <div className="mt-2 flex justify-end border-t border-app-border/70 pt-2">
        <Button
          type="button"
          size="xs"
          variant="ghost"
          aria-expanded={aberto}
          aria-controls={painelId}
          onClick={onAlternar}
        >
          <Icon name={aberto ? 'chevron-up' : 'chevron-down'} className="h-3.5 w-3.5" />
          {aberto ? 'Ocultar detalhes' : 'Ver detalhes'}
        </Button>
      </div>

      {aberto ? (
        <div
          id={painelId}
          role="region"
          aria-label={`Detalhes do sorteio ${item.id}`}
          className="mt-3 space-y-4 border-t border-app-border pt-4"
        >
          <section className="space-y-2" aria-labelledby={`${painelId}-pool`}>
            <div>
              <h4 id={`${painelId}-pool`} className="text-sm font-bold text-app-fg">
                Possibilidades e chances congeladas
              </h4>
              <p className="text-xs text-app-muted">
                A chance abaixo usa o pool original do 1º e do 3º giro. No 2º giro de
                técnica, a primeira opção é retirada integralmente.
              </p>
            </div>
            {item.poolSnapshot.itens.length > 0 && item.poolSnapshot.pesoTotal > 0 ? (
              <ul className="max-h-80 space-y-2 overflow-y-auto rounded-xl border border-app-border bg-app-bg/45 p-2">
                {item.poolSnapshot.itens.map((poolItem) => {
                  const chance = calcularChanceRoleta({
                    pool: item.poolSnapshot,
                    item: poolItem,
                  });
                  return (
                    <li
                      key={poolItem.chave}
                      className="grid gap-2 rounded-lg border border-app-border/70 bg-app-surface/70 p-2.5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="break-words text-sm font-semibold text-app-fg">
                          {poolItem.nome}
                        </p>
                        {metadadosItem(poolItem)}
                      </div>
                      <div className="text-left text-xs text-app-muted md:text-right">
                        <p className="font-mono text-app-fg">{formatarChanceRoleta(chance)}</p>
                        <p>
                          Peso unitário {poolItem.pesoUnitario} · efetivo {poolItem.pesoTotal}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="rounded-lg border border-app-warning/30 bg-app-warning/10 p-3 text-xs text-app-warning">
                O snapshot não possui um pool válido para calcular probabilidades.
              </p>
            )}
          </section>

          <section className="space-y-2" aria-labelledby={`${painelId}-resultados`}>
            <h4 id={`${painelId}-resultados`} className="text-sm font-bold text-app-fg">
              Resultados e decisão
            </h4>
            {item.resultados.length ? (
              <ol className="space-y-2">
                {item.resultados.map((resultado, indice) => {
                  const etapa = etapaPorIndice(indice);
                  const chance = calcularChanceRoleta({
                    pool: item.poolSnapshot,
                    item: resultado,
                    etapa,
                    primeiroResultadoChave,
                  });
                  return (
                    <li
                      key={`${resultado.chave}:${indice}`}
                      className="rounded-lg border border-app-border bg-app-surface/60 p-2.5 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-app-fg">
                          {etapa}º giro · {resultado.nome}
                        </span>
                        {indice === finalIndex ? <Badge color="green">Resultado final</Badge> : null}
                      </div>
                      <p className="mt-1 font-mono text-app-muted">
                        {formatarChanceRoleta(chance)}
                      </p>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="text-xs text-app-muted">Nenhum giro foi concluído.</p>
            )}
            <dl className="grid gap-2 rounded-lg bg-app-muted-surface/70 p-3 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-app-muted">Alvo</dt>
                <dd className="font-semibold text-app-fg">{item.alvo?.apelido ?? 'Sem alvo'}</dd>
              </div>
              <div>
                <dt className="text-app-muted">Iniciado por</dt>
                <dd className="font-semibold text-app-fg">
                  {item.iniciadoPor?.apelido ?? 'Usuário removido'}
                </dd>
              </div>
              <div>
                <dt className="text-app-muted">Finalizado por</dt>
                <dd className="font-semibold text-app-fg">
                  {item.finalizadoPor?.apelido ?? 'Não finalizado'}
                </dd>
              </div>
              <div>
                <dt className="text-app-muted">Cancelado por</dt>
                <dd className="font-semibold text-app-fg">
                  {item.canceladoPor?.apelido ?? 'Não cancelado'}
                </dd>
              </div>
            </dl>
          </section>

          <section className="space-y-2" aria-labelledby={`${painelId}-config`}>
            <h4 id={`${painelId}-config`} className="text-sm font-bold text-app-fg">
              Configuração congelada
            </h4>
            {configSnapshot ? (
              <div className="space-y-3 rounded-xl border border-app-border bg-app-bg/45 p-3 text-xs">
                <div className="flex flex-wrap gap-1.5">
                  <Badge color="blue">Modo {configSnapshot.modo}</Badge>
                  <Badge color="gray">Config v{configSnapshot.configVersao}</Badge>
                  <Badge color="gray">Preset revisão {configSnapshot.presetRevisao}</Badge>
                  <Badge color={configSnapshot.config.fontes.sistemaBase ? 'green' : 'gray'}>
                    Sistema base {configSnapshot.config.fontes.sistemaBase ? 'incluído' : 'excluído'}
                  </Badge>
                </div>
                <dl className="grid gap-2 text-app-muted sm:grid-cols-2">
                  <div>
                    <dt>Suplementos selecionados</dt>
                    <dd className="break-all font-mono text-app-fg">
                      {configSnapshot.config.fontes.suplementoIds.join(', ') || 'Nenhum'}
                    </dd>
                  </div>
                  <div>
                    <dt>Homebrews selecionados</dt>
                    <dd className="break-all font-mono text-app-fg">
                      {configSnapshot.config.fontes.homebrewIds.join(', ') || 'Nenhum'}
                    </dd>
                  </div>
                  <div>
                    <dt>Inclusões de catálogo</dt>
                    <dd className="break-all font-mono text-app-fg">
                      {configSnapshot.config.inclusoesCatalogo.join(', ') || 'Nenhuma'}
                    </dd>
                  </div>
                  <div>
                    <dt>Exclusões</dt>
                    <dd className="break-all font-mono text-app-fg">
                      {configSnapshot.config.exclusoes.join(', ') || 'Nenhuma'}
                    </dd>
                  </div>
                </dl>
                <div>
                  <p className="text-app-muted">
                    Lista manual: {entradasManuais.length} ocorrências
                    {repeticoesManuais.length
                      ? ` · ${repeticoesManuais.length} itens repetidos`
                      : ''}
                  </p>
                  <p className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-app-surface/70 p-2 font-mono text-app-fg">
                    {configSnapshot.config.listaManualTexto || 'Nenhuma entrada manual'}
                  </p>
                </div>
                {configSnapshot.config.compatibilidadesHereditarias.length ? (
                  <div>
                    <p className="text-app-muted">Compatibilidades hereditárias</p>
                    <ul className="mt-1 max-h-24 space-y-1 overflow-auto font-mono text-app-fg">
                      {configSnapshot.config.compatibilidadesHereditarias.map((compatibilidade) => (
                        <li key={compatibilidade.tecnicaChave} className="break-all">
                          {compatibilidade.tecnicaChave} →{' '}
                          {compatibilidade.claChaves.join(', ') || 'nenhum clã'}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-xs text-app-muted">
                A configuração histórica não possui o formato conhecido. O pool congelado acima
                continua sendo a fonte das possibilidades e chances.
              </p>
            )}
          </section>

          <section className="space-y-2" aria-labelledby={`${painelId}-eventos`}>
            <h4 id={`${painelId}-eventos`} className="text-sm font-bold text-app-fg">
              Linha do tempo imutável
            </h4>
            <ol className="space-y-2 border-l border-app-primary/35 pl-3">
              {item.eventos.map((evento) => (
                <li key={evento.id} className="relative text-xs text-app-muted">
                  <span className="absolute -left-[0.96rem] top-1.5 h-2 w-2 rounded-full bg-app-primary" />
                  <p className="font-semibold text-app-fg">
                    {ROTULOS_EVENTO[evento.tipo] ?? evento.tipo}
                  </p>
                  <p>
                    {formatarData(evento.criadoEm)} · {evento.ator?.apelido ?? 'Usuário removido'}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      ) : null}
    </article>
  );
}
