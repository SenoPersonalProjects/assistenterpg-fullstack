// InventarioModalCategoria.tsx - SEM MUDANÇAS (já está correto)

'use client';

import { Icon } from '@/components/ui/Icon';
import { CATEGORIAS_LABELS, type CategoriaEquipamento } from '@/lib/utils/inventario';
import type { EquipamentoCatalogo } from '@/lib/api';

type Props = {
  categoriaAtiva: CategoriaEquipamento;
  equipamentosPorCategoria: Record<CategoriaEquipamento, EquipamentoCatalogo[]>;
  onSelectCategoria: (categoria: CategoriaEquipamento) => void;
};

export function InventarioModalCategoria({
  categoriaAtiva,
  equipamentosPorCategoria,
  onSelectCategoria,
}: Props) {
  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {(Object.keys(CATEGORIAS_LABELS) as CategoriaEquipamento[]).map((cat) => {
        const qtd = equipamentosPorCategoria[cat]?.length || 0;
        const label = CATEGORIAS_LABELS[cat];

        return (
          <button
            key={cat}
            onClick={() => onSelectCategoria(cat)}
            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
              categoriaAtiva === cat
                ? 'border-app-primary bg-app-primary/5'
                : 'border-app-border bg-app-surface hover:border-app-primary/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon name={label.icon} className={`w-6 h-6 ${label.cor}`} />
              <div className="flex-1">
                <span className="font-semibold block text-app-fg">{label.nome}</span>
                <span className="text-xs text-app-muted">
                  {qtd} {qtd === 1 ? 'item' : 'itens'}
                </span>
              </div>
              <span className="text-sm font-bold text-app-fg bg-app-border px-2 py-1 rounded">
                {qtd}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
