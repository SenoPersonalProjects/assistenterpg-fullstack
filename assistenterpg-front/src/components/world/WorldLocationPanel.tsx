'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import type {
  WorldAtlasCategory,
  WorldAtlasItem,
  WorldBarrierType,
  WorldSecrecyLevel,
  WorldStatus,
} from '@/lib/world';
import { getAtlasItemCategory } from '@/lib/world';

type WorldLocationPanelProps = {
  item: WorldAtlasItem | null;
  hoveredItem: WorldAtlasItem | null;
};

const CATEGORY_LABELS: Record<WorldAtlasCategory, string> = {
  ESCOLA: 'Escola',
  BARREIRA: 'Barreira',
  ORGANIZACAO: 'Organização',
  REGIAO_OCULTA: 'Região oculta',
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

export function WorldLocationPanel({
  item,
  hoveredItem,
}: WorldLocationPanelProps) {
  const focusItem = item;

  return (
    <Card
      variant="default"
      className="relative overflow-hidden !p-6 shadow-xl shadow-black/10"
    >
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-app-primary/10 blur-3xl" />
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-app-primary">
              Painel de lore
            </p>
            <h2 className="mt-1 text-2xl font-black text-app-fg">
              Dossie selecionado
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

        {focusItem ? (
          <div className="space-y-5">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge color="blue" variant="subtle" size="sm">
                  {CATEGORY_LABELS[getAtlasItemCategory(focusItem)]}
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
              </div>

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

            {focusItem.kind === 'barrier' ? (
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

            {focusItem.kind === 'location' && focusItem.notaCartografica ? (
              <div className="rounded-2xl border border-app-danger/30 bg-app-danger/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-app-danger">
                  Nota cartográfica
                </p>
                <p className="mt-1 text-sm leading-relaxed text-app-muted">
                  {focusItem.notaCartografica}
                </p>
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
          <div className="rounded-3xl border border-dashed border-app-border bg-app-muted-surface/30 p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-app-border bg-app-surface text-app-muted">
              <Icon name="map" className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-black text-app-fg">
              Nenhum dossiê selecionado.
            </h3>
            <p className="mt-2 text-sm text-app-muted">
              Selecione um ponto no globo ou na lista acessível para consultar
              os detalhes do atlas.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
