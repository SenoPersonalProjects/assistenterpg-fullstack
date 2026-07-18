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
import { Modal } from '@/components/ui/Modal';

const ROTULOS_SLOT = {
  CLA: 'Clã',
  TECNICA: 'Técnica',
  CUSTOMIZADO: 'Personalizado',
} as const;

const ROTULOS_STATUS = {
  AGUARDANDO_GIRO_1: 'Aguardando giro',
  AGUARDANDO_GIRO_2: 'Aguardando segunda opção',
  AGUARDANDO_ESCOLHA: 'Aguardando escolha',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
} as const;

const ROTULOS_MODO = {
  CLA: 'Clã pela regra',
  TECNICA: 'Técnica pela regra',
  SIMPLES: 'Roleta simples',
} as const;

const ROTULOS_EVENTO: Record<string, string> = {
  SORTEIO_INICIADO: 'Sorteio preparado',
  GIRO_REALIZADO: 'Giro realizado',
  OPCAO_ESCOLHIDA: 'Opção escolhida',
  TERCEIRO_GIRO_REALIZADO: 'Terceiro giro aceito',
  SORTEIO_CANCELADO: 'Sorteio cancelado',
};

const ROTULOS_FONTE = {
  SISTEMA_BASE: 'Sistema base',
  SUPLEMENTO: 'Suplemento',
  HOMEBREW: 'Homebrew',
  MANUAL: 'Lista própria',
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

function MetadadosItem({ item }: { item: CampanhaRoletaPoolItem }) {
  return (
    <div className="flex flex-wrap gap-1">
      <Badge color="gray" size="sm">{ROTULOS_FONTE[item.fonte]}</Badge>
      {item.ocorrencias > 1 ? <Badge color="yellow" size="sm">Repetido ×{item.ocorrencias}</Badge> : null}
      {item.hereditaria ? <Badge color="purple" size="sm">Hereditária</Badge> : null}
      {item.incluidoManualmente ? <Badge color="blue" size="sm">Adicionado manualmente</Badge> : null}
    </div>
  );
}

export function CampaignRouletteHistoryCard({
  item,
  onOpen,
}: {
  item: CampanhaRoletaHistoricoItem;
  onOpen: () => void;
}) {
  return (
    <article className="rounded-xl border border-app-border bg-app-card/55 p-3 transition-colors hover:border-app-primary/35">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-app-fg">
            {ROTULOS_SLOT[item.slot]} · {item.resultadoFinal?.nome ?? ROTULOS_STATUS[item.status]}
          </p>
          <p className="text-xs text-app-muted">
            {formatarData(item.criadoEm)}{item.alvo ? ` · ${item.alvo.apelido}` : ''}
          </p>
          <p className="mt-1 text-xs text-app-muted">
            {item.poolSnapshot.quantidadeResultados} possibilidades · peso {item.poolSnapshot.pesoTotal}
          </p>
        </div>
        <Badge color={corStatus(item.status)}>{ROTULOS_STATUS[item.status]}</Badge>
      </div>
      <div className="mt-2 flex justify-end border-t border-app-border/70 pt-2">
        <Button type="button" size="xs" variant="ghost" onClick={onOpen}>
          <Icon name="eye" className="mr-1 h-3.5 w-3.5" />
          Ver detalhes
        </Button>
      </div>
    </article>
  );
}

function DetalhesHistorico({ item }: { item: CampanhaRoletaHistoricoItem }) {
  const config = lerConfigSnapshotRoleta(item.configSnapshot);
  const primeiroResultadoChave = item.resultados[0]?.chave ?? null;
  const indiceFinal = indiceResultadoFinal(item);
  const repeticoes = config
    ? agruparRepeticoesRoleta(config.config.listaManualTexto)
    : [];
  const entradasManuais = config
    ? config.config.listaManualTexto.split(';').map((valor) => valor.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      <section className="grid gap-3 rounded-xl border border-app-border bg-app-bg/45 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div><p className="text-xs text-app-muted">Resultado final</p><p className="font-bold text-app-fg">{item.resultadoFinal?.nome ?? 'Não definido'}</p></div>
        <div><p className="text-xs text-app-muted">Alvo</p><p className="font-bold text-app-fg">{item.alvo?.apelido ?? 'Sem alvo'}</p></div>
        <div><p className="text-xs text-app-muted">Iniciado por</p><p className="font-bold text-app-fg">{item.iniciadoPor?.apelido ?? 'Usuário removido'}</p></div>
        <div><p className="text-xs text-app-muted">Data</p><p className="font-bold text-app-fg">{formatarData(item.criadoEm)}</p></div>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="font-bold text-app-fg">Possibilidades e chances</h3>
          <p className="text-xs text-app-muted">
            No segundo giro de técnica, a primeira opção deixa de participar. O terceiro usa novamente todas as possibilidades.
          </p>
        </div>
        {item.poolSnapshot.itens.length && item.poolSnapshot.pesoTotal > 0 ? (
          <ul className="max-h-80 space-y-2 overflow-y-auto rounded-xl border border-app-border bg-app-bg/45 p-2">
            {item.poolSnapshot.itens.map((poolItem) => {
              const chance = calcularChanceRoleta({ pool: item.poolSnapshot, item: poolItem });
              return (
                <li key={poolItem.chave} className="grid gap-2 rounded-lg border border-app-border/70 bg-app-surface/70 p-2.5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                  <div className="min-w-0 space-y-1">
                    <p className="break-words text-sm font-semibold text-app-fg">{poolItem.nome}</p>
                    <MetadadosItem item={poolItem} />
                  </div>
                  <div className="text-left text-xs text-app-muted md:text-right">
                    <p className="font-mono text-app-fg">{formatarChanceRoleta(chance)}</p>
                    <p>Peso por ocorrência {poolItem.pesoUnitario} · peso total {poolItem.pesoTotal}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-lg border border-app-warning/30 bg-app-warning/10 p-3 text-xs text-app-warning">
            Não foi possível calcular as chances deste registro.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="font-bold text-app-fg">Resultados e decisão</h3>
        {item.resultados.length ? (
          <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {item.resultados.map((resultado, indice) => {
              const etapa = etapaPorIndice(indice);
              const chance = calcularChanceRoleta({
                pool: item.poolSnapshot,
                item: resultado,
                etapa,
                primeiroResultadoChave,
              });
              return (
                <li key={`${resultado.chave}:${indice}`} className="rounded-lg border border-app-border bg-app-surface/60 p-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-app-fg">{etapa}º giro · {resultado.nome}</span>
                    {indice === indiceFinal ? <Badge color="green">Escolhido</Badge> : null}
                  </div>
                  <p className="mt-1 font-mono text-app-muted">{formatarChanceRoleta(chance)}</p>
                </li>
              );
            })}
          </ol>
        ) : <p className="text-sm text-app-muted">Nenhum giro foi concluído.</p>}
      </section>

      <section className="space-y-3">
        <h3 className="font-bold text-app-fg">Configuração usada no sorteio</h3>
        {config ? (
          <div className="space-y-3 rounded-xl border border-app-border bg-app-bg/45 p-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge color="blue">{ROTULOS_MODO[config.modo]}</Badge>
              <Badge color={config.config.fontes.sistemaBase ? 'green' : 'gray'}>
                {config.config.fontes.sistemaBase ? 'Sistema base incluído' : 'Sem sistema base'}
              </Badge>
              <Badge color="gray">{config.config.fontes.suplementoIds.length} suplemento(s)</Badge>
              <Badge color="gray">{config.config.fontes.homebrewIds.length} homebrew(s)</Badge>
            </div>
            <dl className="grid gap-3 text-app-muted sm:grid-cols-3">
              <div><dt>Itens adicionados</dt><dd className="font-bold text-app-fg">{config.config.inclusoesCatalogo.length}</dd></div>
              <div><dt>Itens removidos</dt><dd className="font-bold text-app-fg">{config.config.exclusoes.length}</dd></div>
              <div><dt>Compatibilidades configuradas</dt><dd className="font-bold text-app-fg">{config.config.compatibilidadesHereditarias.length}</dd></div>
            </dl>
            {entradasManuais.length ? (
              <div>
                <p className="text-xs text-app-muted">
                  Lista própria: {entradasManuais.length} ocorrência(s){repeticoes.length ? ` · ${repeticoes.length} repetição(ões)` : ''}
                </p>
                <p className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-app-surface/70 p-2 text-sm text-app-fg">
                  {config.config.listaManualTexto}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-app-muted">
            Os detalhes da configuração não estão disponíveis, mas as possibilidades acima permanecem preservadas.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="font-bold text-app-fg">Atividade do sorteio</h3>
        <ol className="space-y-2 border-l border-app-primary/35 pl-3">
          {item.eventos.map((evento) => (
            <li key={evento.id} className="relative text-xs text-app-muted">
              <span className="absolute -left-[0.96rem] top-1.5 h-2 w-2 rounded-full bg-app-primary" />
              <p className="font-semibold text-app-fg">{ROTULOS_EVENTO[evento.tipo] ?? 'Ação registrada'}</p>
              <p>{formatarData(evento.criadoEm)} · {evento.ator?.apelido ?? 'Usuário removido'}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export function CampaignRouletteHistoryModal({
  item,
  onClose,
}: {
  item: CampanhaRoletaHistoricoItem;
  onClose: () => void;
}) {
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`${ROTULOS_SLOT[item.slot]} · ${item.resultadoFinal?.nome ?? ROTULOS_STATUS[item.status]}`}
      size="xl"
      footer={<Button variant="secondary" onClick={onClose}>Fechar</Button>}
    >
      <DetalhesHistorico item={item} />
    </Modal>
  );
}
