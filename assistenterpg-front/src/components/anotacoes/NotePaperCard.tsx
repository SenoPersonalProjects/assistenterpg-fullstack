'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EntityActionsMenu } from '@/components/ui/EntityActionsMenu';
import { Icon } from '@/components/ui/Icon';
import type { AnotacaoResumo } from '@/lib/api';
import { formatarDataHora } from '@/lib/utils/formatters';

type NotePaperCardProps = {
  nota: AnotacaoResumo;
  onOpen: (nota: AnotacaoResumo) => void;
  onEdit: (nota: AnotacaoResumo) => void;
  onDelete: (nota: AnotacaoResumo) => void;
};

export function NotePaperCard({ nota, onOpen, onEdit, onDelete }: NotePaperCardProps) {
  return (
    <article className="rounded-xl border border-white/5 bg-app-surface/55 p-4 shadow-sm shadow-black/5 transition-colors hover:border-app-primary/20">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <button
          type="button"
          className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50"
          onClick={() => onOpen(nota)}
        >
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-app-orange/10 text-app-orange">
              <Icon name="scroll" className="h-4 w-4" />
            </span>

            <span className="min-w-0">
              <span className="block truncate text-sm font-black text-app-fg">
                {nota.titulo}
              </span>
              <span className="mt-0.5 block truncate text-[11px] font-medium text-app-muted">
                {formatarDataHora(nota.atualizadoEm)}
              </span>
            </span>
          </div>
        </button>

        <EntityActionsMenu
          ariaLabel={`Ações da anotação ${nota.titulo}`}
          items={[
            { id: 'edit', label: 'Editar', icon: 'edit', onSelect: () => onEdit(nota) },
            {
              id: 'delete',
              label: 'Excluir',
              icon: 'delete',
              destructive: true,
              onSelect: () => onDelete(nota),
            },
          ]}
        />
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-app-muted">
        {nota.conteudo}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap gap-1.5">
          {nota.campanha ? (
            <Badge size="xs" color="gray" variant="subtle" className="max-w-[11rem] truncate">
              {nota.campanha.nome}
            </Badge>
          ) : null}
          {nota.sessao ? (
            <Badge size="xs" color="blue" variant="subtle" className="max-w-[11rem] truncate">
              {nota.sessao.titulo}
            </Badge>
          ) : null}
        </div>

        <Button size="xs" variant="secondary" onClick={() => onOpen(nota)} className="shrink-0">
          Abrir
        </Button>
      </div>
    </article>
  );
}
