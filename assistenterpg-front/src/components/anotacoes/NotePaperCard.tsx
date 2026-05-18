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
    <article className="note-paper note-paper--clickable group relative overflow-hidden transition-all duration-500 hover:rotate-1">
      {/* Decoração de grampo/clipe sutil */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-app-primary/20 rounded-b-lg group-hover:bg-app-primary/40 transition-colors" />
      
      <button
        type="button"
        className="note-paper__body block w-full p-6 text-left focus-visible:outline-none"
        onClick={() => onOpen(nota)}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-app-orange/10 text-app-orange shadow-inner group-hover:scale-110 transition-transform">
            <Icon name="scroll" className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-black text-app-fg tracking-tight group-hover:text-app-primary transition-colors">{nota.titulo}</h3>
            <p className="text-[10px] font-bold text-app-muted uppercase tracking-widest">
              {formatarDataHora(nota.criadoEm)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {nota.campanha && (
            <Badge size="xs" color="gray" variant="subtle" className="font-bold">
              {nota.campanha.nome}
            </Badge>
          )}
          {nota.sessao && (
            <Badge size="xs" color="blue" variant="subtle" className="font-bold">
              {nota.sessao.titulo}
            </Badge>
          )}
        </div>

        <p className="note-paper__content text-sm leading-relaxed text-app-muted font-medium italic opacity-80 line-clamp-4">
          {nota.conteudo}
        </p>

        <div className="mt-6 flex items-center gap-2 text-xs font-black text-app-primary uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 duration-300">
          Abrir anotação
          <Icon name="forward" className="h-4 w-4" />
        </div>
      </button>

      <div className="note-paper__actions flex items-center justify-end gap-2 p-4 bg-black/5 backdrop-blur-sm border-t border-app-border/30 opacity-0 group-hover:opacity-100 transition-opacity translate-y-[10px] group-hover:translate-y-0 duration-300">
        <Button size="xs" variant="secondary" onClick={() => onEdit(nota)} className="font-bold rounded-lg h-8">
          <Icon name="edit" className="mr-1.5 h-3.5 w-3.5" />
          Editar
        </Button>
        <Button size="xs" variant="destructive" onClick={() => onDelete(nota)} className="font-bold rounded-lg h-8">
          <Icon name="delete" className="mr-1.5 h-3.5 w-3.5" />
          Excluir
        </Button>
      </div>
    </article>
  );
}
