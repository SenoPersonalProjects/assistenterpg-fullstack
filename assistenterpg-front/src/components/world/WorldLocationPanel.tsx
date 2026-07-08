'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type {
  WorldAtlasFilter,
  WorldAtlasItem,
  WorldBarrier,
  WorldBarrierType,
  WorldSecrecyLevel,
  WorldStatus,
} from '@/lib/world';
import {
  buildWorldBreadcrumb,
  getAtlasItemCategory,
  resolveWorldInternalMap,
} from '@/lib/world';

type WorldLocationPanelProps = {
  item: WorldAtlasItem | null;
  hoveredItem: WorldAtlasItem | null;
  items: WorldAtlasItem[];
  onSelectItem: (itemId: string) => void;
};

const CATEGORY_LABELS: Record<WorldAtlasFilter, string> = {
  LUGARES: 'Lugar',
  SETORES: 'Setor',
  INSTITUICOES: 'Instituição',
  BARREIRAS: 'Barreira',
};

const CATEGORY_BADGE_COLORS: Record<
  WorldAtlasFilter,
  'blue' | 'purple' | 'orange' | 'cyan'
> = {
  LUGARES: 'blue',
  SETORES: 'purple',
  INSTITUICOES: 'orange',
  BARREIRAS: 'cyan',
};

const STATUS_LABELS: Record<WorldStatus, string> = {
  ATIVA: 'Ativa',
  RESTRITA: 'Restrita',
  OCULTA: 'Oculta',
  INSTAVEL: 'Instável',
};

const STATUS_COLORS: Record<
  WorldStatus,
  'green' | 'yellow' | 'red' | 'purple'
> = {
  ATIVA: 'green',
  RESTRITA: 'yellow',
  OCULTA: 'purple',
  INSTAVEL: 'red',
};

const SECRECY_LABELS: Record<WorldSecrecyLevel, string> = {
  PUBLICO: 'Público',
  RESTRITO: 'Restrito',
  CONFIDENCIAL: 'Confidencial',
  OCULTO: 'Oculto',
};

const BARRIER_TYPE_LABELS: Record<WorldBarrierType, string> = {
  BARREIRA_PURA: 'Barreira pura',
  GRANDE_BARREIRA: 'Grande barreira',
};

const CITADELA_RELATED_IDS = new Set([
  'cidadela',
  'cidadela-distrito-industrial',
  'cidadela-distrito-comercial',
  'cidadela-distrito-entretenimento',
]);

const CITADELA_LEGEND = [
  {
    id: 'cidadela-distrito-industrial',
    label: 'Distrito Industrial',
    description: 'Cinza/azul frio: logística, fábricas, depósitos e infraestrutura.',
    className: 'bg-slate-400',
  },
  {
    id: 'cidadela-distrito-comercial',
    label: 'Distrito Comercial',
    description: 'Roxo: comércio, escritórios, serviços e circulação intensa.',
    className: 'bg-purple-400',
  },
  {
    id: 'cidadela-distrito-entretenimento',
    label: 'Distrito do Entretenimento',
    description: 'Vermelho/coral: vida noturna, espetáculos e alto fluxo social.',
    className: 'bg-rose-400',
  },
];

function sortRelatedItems(a: WorldAtlasItem, b: WorldAtlasItem) {
  return (
    (a.displayPriority ?? 999) - (b.displayPriority ?? 999) ||
    a.nome.localeCompare(b.nome)
  );
}

function isBarrier(item: WorldAtlasItem): item is WorldBarrier {
  return item.kind === 'BARREIRA';
}

function isCitadelaContext(item: WorldAtlasItem) {
  return (
    CITADELA_RELATED_IDS.has(item.id) ||
    Boolean(item.parentId && CITADELA_RELATED_IDS.has(item.parentId))
  );
}

export function WorldLocationPanel({
  item,
  hoveredItem,
  items,
  onSelectItem,
}: WorldLocationPanelProps) {
  const focusItem = item;
  const [failedMapSrc, setFailedMapSrc] = useState<string | null>(null);
  const relatedItems = focusItem
    ? items
        .filter((candidate) => candidate.parentId === focusItem.id)
        .sort(sortRelatedItems)
    : [];
  const breadcrumb = focusItem ? buildWorldBreadcrumb(focusItem, items) : [];
  const focusCategory = focusItem ? getAtlasItemCategory(focusItem) : null;
  const internalMap = focusItem
    ? resolveWorldInternalMap(focusItem, items)
    : null;
  const mapImageFailed = Boolean(
    internalMap?.src && failedMapSrc === internalMap.src,
  );
  const selectedDistrictId =
    focusItem?.parentId === 'cidadela' ? focusItem.id : null;

  return (
    <aside className="space-y-4 rounded-xl border border-white/5 bg-app-surface/55 p-4 shadow-sm shadow-black/5">
      <SectionHeader
        icon="map"
        title="Dossiê cartográfico"
        description="Painel de lore do ponto selecionado."
      />

      {hoveredItem && hoveredItem.id !== focusItem?.id ? (
        <div className="rounded-lg border border-white/5 bg-app-muted-surface/55 px-3 py-2">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-app-muted">
            Sobrevoando
          </p>
          <p className="mt-0.5 truncate text-sm font-bold text-app-fg">
            {hoveredItem.nome}
          </p>
        </div>
      ) : null}

      {focusItem && focusCategory ? (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              <Badge
                color={CATEGORY_BADGE_COLORS[focusCategory]}
                variant="subtle"
                size="xs"
              >
                {CATEGORY_LABELS[focusCategory]}
              </Badge>
              <Badge
                color={STATUS_COLORS[focusItem.status]}
                variant="subtle"
                size="xs"
              >
                {STATUS_LABELS[focusItem.status]}
              </Badge>
              {focusItem.nivelDeSigilo ? (
                <Badge color="gray" variant="outline" size="xs">
                  Sigilo: {SECRECY_LABELS[focusItem.nivelDeSigilo]}
                </Badge>
              ) : null}
              {focusItem.subtipo ? (
                <Badge color="gray" variant="outline" size="xs">
                  {focusItem.subtipo}
                </Badge>
              ) : null}
              {focusItem.kind === 'LUGAR' ? (
                <Badge color="gray" variant="outline" size="xs">
                  Escala: {focusItem.escala}
                </Badge>
              ) : null}
              {focusItem.ficticio ? (
                <Badge color="purple" variant="outline" size="xs">
                  Fictício
                </Badge>
              ) : null}
            </div>

            <nav
              aria-label="Hierarquia do atlas"
              className="flex flex-wrap items-center gap-1 text-[10px] font-black uppercase tracking-[0.14em] text-app-muted"
            >
              <span>Mundo</span>
              {breadcrumb.map((entry) => (
                <span key={entry.id} className="inline-flex items-center gap-1">
                  <span className="text-app-border">/</span>
                  <button
                    type="button"
                    onClick={() => onSelectItem(entry.id)}
                    className="rounded px-1 text-app-muted transition-colors hover:text-app-primary focus:outline-none focus:ring-2 focus:ring-app-primary/40"
                  >
                    {entry.nome}
                  </button>
                </span>
              ))}
            </nav>

            <div>
              <h2 className="text-2xl font-black tracking-tight text-app-fg">
                {focusItem.nome}
              </h2>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-app-muted">
                {focusItem.resumo}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-white/5 bg-app-bg/35 p-3">
            <p className="text-sm leading-relaxed text-app-muted">
              {focusItem.descricaoCurta}
            </p>
          </div>

          {isBarrier(focusItem) ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-white/5 bg-app-surface/55 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-app-muted">
                  Tipo
                </p>
                <p className="mt-1 text-sm font-black text-app-fg">
                  {BARRIER_TYPE_LABELS[focusItem.barrierType]}
                </p>
              </div>
              <div className="rounded-lg border border-white/5 bg-app-surface/55 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-app-muted">
                  Raio aproximado
                </p>
                <p className="mt-1 text-sm font-black text-app-fg">
                  {focusItem.raioKmAproximado
                    ? `${focusItem.raioKmAproximado} km`
                    : 'Não registrado'}
                </p>
              </div>
            </div>
          ) : null}

          {focusItem.notaCartografica ? (
            <div className="rounded-lg border border-app-warning/25 bg-app-warning/10 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-app-warning">
                Nota cartográfica
              </p>
              <p className="mt-1 text-sm leading-relaxed text-app-muted">
                {focusItem.notaCartografica}
              </p>
            </div>
          ) : null}

          {isCitadelaContext(focusItem) ? (
            <div className="rounded-lg border border-white/5 bg-app-surface/45 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-app-muted">
                    Mapa interno
                  </p>
                  <p className="mt-1 text-sm font-bold text-app-fg">
                    Cidadela por distritos
                  </p>
                </div>
                <Icon name="layers" className="h-4 w-4 text-app-muted" />
              </div>

              {internalMap && !mapImageFailed ? (
                <div className="mt-3 overflow-hidden rounded-lg border border-white/5 bg-app-bg/65 p-2">
                  <Image
                    src={internalMap.src}
                    alt={internalMap.alt}
                    width={720}
                    height={405}
                    loading="lazy"
                    onError={() => setFailedMapSrc(internalMap.src)}
                    className="max-h-64 w-full object-contain"
                  />
                </div>
              ) : null}

              {internalMap && mapImageFailed ? (
                <div className="mt-3 rounded-lg border border-app-warning/25 bg-app-warning/10 p-3 text-xs font-semibold text-app-muted">
                  Não foi possível carregar a imagem do mapa interno. A legenda
                  dos distritos continua disponível abaixo.
                </div>
              ) : null}

              <div className="mt-3 space-y-2">
                {CITADELA_LEGEND.map((entry) => (
                  <div
                    key={entry.id}
                    className={[
                      'flex gap-3 rounded-lg border p-3 transition-colors',
                      selectedDistrictId === entry.id
                        ? 'border-app-primary/45 bg-app-primary/10'
                        : 'border-white/5 bg-app-bg/35',
                    ].join(' ')}
                  >
                    <span
                      className={`mt-1 h-3 w-3 shrink-0 rounded-full ${entry.className}`}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-black text-app-fg">
                        {entry.label}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-app-muted">
                        {entry.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {relatedItems.length > 0 ? (
            <div className="space-y-3 rounded-lg border border-white/5 bg-app-bg/30 p-3">
              <SectionHeader title="Relacionados" count={relatedItems.length} />
              <div className="grid gap-2">
                {relatedItems.map((related) => (
                  <button
                    key={related.id}
                    type="button"
                    onClick={() => onSelectItem(related.id)}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-app-surface/50 p-3 text-left transition-colors hover:border-app-primary/30 hover:bg-app-primary/10 focus:outline-none focus:ring-2 focus:ring-app-primary/40"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black text-app-fg">
                        {related.nome}
                      </span>
                      <span className="mt-0.5 block text-[10px] font-black uppercase tracking-[0.14em] text-app-muted">
                        {CATEGORY_LABELS[getAtlasItemCategory(related)]}
                      </span>
                    </span>
                    <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.12em] text-app-primary">
                      Abrir
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {focusItem.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-app-surface/65 px-2.5 py-1 text-xs font-bold text-app-muted"
              >
                #{tag}
              </span>
            ))}
          </div>

          {focusItem.linkInterno ? (
            <Link href={focusItem.linkInterno}>
              <Button className="w-full gap-2">
                <Icon name="externalLink" className="h-4 w-4" />
                Ver mais
              </Button>
            </Link>
          ) : null}
        </div>
      ) : (
        <EmptyState
          variant="card"
          size="sm"
          icon="map"
          title="Selecione uma entrada"
          description="Use o globo ou a lista acessível para abrir dossiês. Setores aparecem no nível de detalhe do zoom."
        />
      )}
    </aside>
  );
}
