'use client';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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
    <article className="note-paper note-paper--clickable">
      <button
        type="button"
        className="note-paper__body block w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
        onClick={() => onOpen(nota)}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-app-warning/15 text-app-warning">
            <Icon name="scroll" className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-app-fg">{nota.titulo}</p>
            <p className="mt-1 text-xs text-app-muted">
              {formatarDataHora(nota.criadoEm)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {nota.campanha ? (
            <Badge size="sm" color="gray">
              Campanha: {nota.campanha.nome}
            </Badge>
          ) : null}
          {nota.sessao ? (
            <Badge size="sm" color="blue">
              Sessao: {nota.sessao.titulo}
            </Badge>
          ) : null}
        </div>

        <p className="note-paper__content mt-4 text-sm leading-relaxed text-app-muted whitespace-pre-line">
          {nota.conteudo}
        </p>

        <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-app-primary">
          Abrir anotacao
          <Icon name="chevron-right" className="h-3.5 w-3.5" />
        </span>
      </button>

      <div className="note-paper__actions mt-4 flex flex-wrap items-center gap-2 border-t border-app-border/70 pt-3">
        <Button size="xs" variant="secondary" onClick={() => onEdit(nota)}>
          <Icon name="edit" className="mr-1 h-3.5 w-3.5" />
          Editar
        </Button>
        <Button size="xs" variant="destructive" onClick={() => onDelete(nota)}>
          <Icon name="delete" className="mr-1 h-3.5 w-3.5" />
          Excluir
        </Button>
      </div>
    </article>
  );
}
