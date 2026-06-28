'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
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
    <Card
      variant="default"
      className="relative overflow-hidden !p-5 shadow-xl shadow-black/10 md:!p-6"
    >
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-app-primary/10 blur-3xl" />
      <div className="relative z-10 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-app-primary">
              Painel de lore
            </p>
            <h2 className="mt-1 text-2xl font-black text-app-fg">
              Dossiê cartográfico
            </h2>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-app-primary/25 bg-app-primary/10 text-app-primary">
            <Icon name="map" className="h-6 w-6" />
          </div>
        </div>

        {hoveredItem && hoveredItem.id !== focusItem?.id ? (
          <div className="rounded-2xl border border-app-border bg-app-surface/60 p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-app-muted">
              Sobrevoando
            </p>
            <p className="mt-1 text-sm font-bold text-app-fg">
              {hoveredItem.nome}
            </p>
          </div>
        ) : null}

        {focusItem && focusCategory ? (
          <div className="space-y-5">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge
                  color={CATEGORY_BADGE_COLORS[focusCategory]}
                  variant="subtle"
                  size="sm"
                >
                  {CATEGORY_LABELS[focusCategory]}
                </Badge>
                <Badge
                  color={STATUS_COLORS[focusItem.status]}
                  variant="subtle"
                  size="sm"
                >
                  {STATUS_LABELS[focusItem.status]}
                </Badge>
                {focusItem.nivelDeSigilo ? (
                  <Badge color="gray" variant="outline" size="sm">
                    Sigilo: {SECRECY_LABELS[focusItem.nivelDeSigilo]}
                  </Badge>
                ) : null}
                {focusItem.subtipo ? (
                  <Badge color="gray" variant="outline" size="sm">
                    {focusItem.subtipo}
                  </Badge>
                ) : null}
                {focusItem.kind === 'LUGAR' ? (
                  <Badge color="gray" variant="outline" size="sm">
                    Escala: {focusItem.escala}
                  </Badge>
                ) : null}
                {focusItem.ficticio ? (
                  <Badge color="purple" variant="outline" size="sm">
                    Fictício
                  </Badge>
                ) : null}
              </div>

              <nav
                aria-label="Hierarquia do atlas"
                className="mb-3 flex flex-wrap items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-app-muted"
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

              <h3 className="text-3xl font-black tracking-tight text-app-fg">
                {focusItem.nome}
              </h3>
              <p className="mt-3 text-base font-semibold leading-relaxed text-app-muted">
                {focusItem.resumo}
              </p>
            </div>

            <div className="rounded-2xl border border-app-border bg-app-bg/45 p-4">
              <p className="text-sm leading-relaxed text-app-muted">
                {focusItem.descricaoCurta}
              </p>
            </div>

            {isBarrier(focusItem) ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-app-border bg-app-surface/60 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-app-muted">
                    Tipo
                  </p>
                  <p className="mt-1 font-black text-app-fg">
                    {BARRIER_TYPE_LABELS[focusItem.barrierType]}
                  </p>
                </div>
                <div className="rounded-2xl border border-app-border bg-app-surface/60 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-app-muted">
                    Raio aproximado
                  </p>
                  <p className="mt-1 font-black text-app-fg">
                    {focusItem.raioKmAproximado
                      ? `${focusItem.raioKmAproximado} km`
                      : 'Não registrado'}
                  </p>
                </div>
              </div>
            ) : null}

            {focusItem.notaCartografica ? (
              <div className="rounded-2xl border border-app-warning/30 bg-app-warning/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-app-warning">
                  Nota cartográfica
                </p>
                <p className="mt-1 text-sm leading-relaxed text-app-muted">
                  {focusItem.notaCartografica}
                </p>
              </div>
            ) : null}

            {isCitadelaContext(focusItem) ? (
              <div className="rounded-2xl border border-app-border bg-app-surface/55 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-app-muted">
                      Mapa interno
                    </p>
                    <p className="mt-1 text-sm font-bold text-app-fg">
                      Cidadela por distritos
                    </p>
                  </div>
                  <Icon name="layers" className="h-5 w-5 text-app-muted" />
                </div>

                {internalMap && !mapImageFailed ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-app-border bg-app-bg/70 p-2">
                    <Image
                      src={internalMap.src}
                      alt={internalMap.alt}
                      width={720}
                      height={405}
                      loading="lazy"
                      onError={() => setFailedMapSrc(internalMap.src)}
                      className="max-h-72 w-full object-contain"
                    />
                  </div>
                ) : null}

                {internalMap && mapImageFailed ? (
                  <div className="mt-4 rounded-2xl border border-app-warning/30 bg-app-warning/10 p-3 text-xs font-semibold text-app-muted">
                    Não foi possível carregar a imagem do mapa interno. A legenda
                    dos distritos continua disponível abaixo.
                  </div>
                ) : null}

                <div className="mt-3 space-y-2">
                  {CITADELA_LEGEND.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex gap-3 rounded-xl border p-3 transition-colors ${
                        selectedDistrictId === entry.id
                          ? 'border-app-primary/50 bg-app-primary/10'
                          : 'border-transparent bg-app-bg/45'
                      }`}
                    >
                      <span
                        className={`mt-1 h-3 w-3 shrink-0 rounded-full ${entry.className}`}
                      />
                      <div>
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
              <div className="rounded-2xl border border-app-border bg-app-bg/35 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-app-muted">
                  Relacionados
                </p>
                <div className="mt-3 grid gap-2">
                  {relatedItems.map((related) => (
                    <button
                      key={related.id}
                      type="button"
                      onClick={() => onSelectItem(related.id)}
                      className="rounded-xl border border-app-border bg-app-surface/60 p-3 text-left transition-colors hover:border-app-primary/40 hover:bg-app-primary/10 focus:outline-none focus:ring-2 focus:ring-app-primary/40"
                    >
                      <span className="text-sm font-black text-app-fg">
                        {related.nome}
                      </span>
                      <span className="mt-1 block text-xs font-bold uppercase tracking-wider text-app-muted">
                        {CATEGORY_LABELS[getAtlasItemCategory(related)]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {focusItem.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-app-border bg-app-surface/70 px-3 py-1 text-xs font-bold text-app-muted"
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
          <div className="rounded-3xl border border-dashed border-app-border bg-app-muted-surface/30 p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-app-border bg-app-surface text-app-muted">
              <Icon name="map" className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-black text-app-fg">
              Selecione um local, instituição ou barreira.
            </h3>
            <p className="mt-2 text-sm text-app-muted">
              Use o globo ou a lista acessível para abrir dossiês. Setores
              aparecem no nível de detalhe do zoom.
            </p>
            <div className="mt-5 grid gap-2 text-left">
              {Object.entries(CATEGORY_LABELS).map(([kind, label]) => (
                <div
                  key={kind}
                  className="rounded-xl border border-app-border bg-app-surface/60 px-3 py-2 text-xs font-bold text-app-muted"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
