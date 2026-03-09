// personagem-base/create/modal/InventarioModalEquipamento.tsx

'use client';

import { useMemo, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getIconeTipo } from '@/lib/utils/inventario';
import type { EquipamentoCatalogo } from '@/lib/api';

type Props = {
  busca: string;
  onBuscaChange: (busca: string) => void;
  equipamentosFiltrados: EquipamentoCatalogo[];
  equipamentoSelecionado: EquipamentoCatalogo | null;
  onSelectEquipamento: (equip: EquipamentoCatalogo) => void;
};

const LIMITE_RENDER_INICIAL = 80;

export function InventarioModalEquipamento({
  busca,
  onBuscaChange,
  equipamentosFiltrados,
  equipamentoSelecionado,
  onSelectEquipamento,
}: Props) {
  const [equipamentoExpandido, setEquipamentoExpandido] = useState<number | null>(null);
  const [limiteRender, setLimiteRender] = useState(LIMITE_RENDER_INICIAL);

  const toggleExpandir = (equipId: number) => {
    setEquipamentoExpandido((atual) => (atual === equipId ? null : equipId));
  };

  const equipamentosRenderizados = useMemo(
    () => equipamentosFiltrados.slice(0, limiteRender),
    [equipamentosFiltrados, limiteRender],
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar equipamento..."
        value={busca}
        onChange={(e) => {
          setLimiteRender(LIMITE_RENDER_INICIAL);
          onBuscaChange(e.target.value);
        }}
        icon="search"
      />

      {equipamentosFiltrados.length === 0 ? (
        <EmptyState description="Nenhum equipamento encontrado" />
      ) : (
        <div className="space-y-3">
          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
            {equipamentosRenderizados.map((equip) => {
              const selecionado = equipamentoSelecionado?.id === equip.id;
              const expandido = equipamentoExpandido === equip.id;

              return (
                <div
                  key={equip.id}
                  className={`rounded-lg border-2 transition-all ${
                    selecionado
                      ? 'border-app-primary bg-app-primary/10'
                      : 'border-app-border bg-app-surface hover:border-app-primary/50 hover:bg-app-primary/5'
                  }`}
                >
                  <div
                    className="flex gap-3 p-4 cursor-pointer"
                    onClick={() => onSelectEquipamento(equip)}
                  >
                    <Icon
                      name={getIconeTipo(equip.tipo)}
                      className="w-8 h-8 text-app-primary flex-shrink-0 mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-app-fg">{equip.nome}</p>
                        </div>
                        {selecionado && (
                          <Icon name="success" className="w-5 h-5 text-app-primary flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge color="purple" size="sm">
                          {equip.tipo}
                        </Badge>
                        <Badge color="blue" size="sm">
                          <Icon name="briefcase" className="w-3 h-3 inline mr-1" />
                          {equip.espacos} esp.
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {equip.descricao && equip.descricao.trim().length > 0 && (
                    <div className="px-4 pb-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpandir(equip.id);
                        }}
                        className="flex items-center gap-2 text-xs text-app-primary hover:text-app-primary/80 transition-colors"
                      >
                        <Icon
                          name={expandido ? 'chevron-up' : 'chevron-down'}
                          className="w-4 h-4"
                        />
                        <span>{expandido ? 'Ocultar descricao' : 'Ver descricao'}</span>
                      </button>

                      {expandido && (
                        <div className="mt-2 p-3 bg-app-bg rounded-lg border border-app-border">
                          <p className="text-xs text-app-muted leading-relaxed">{equip.descricao}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {equipamentosFiltrados.length > limiteRender && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() =>
                setLimiteRender((atual) => Math.min(equipamentosFiltrados.length, atual + LIMITE_RENDER_INICIAL))
              }
            >
              Mostrar mais ({equipamentosFiltrados.length - limiteRender} restantes)
            </Button>
          )}
        </div>
      )}

      <div className="p-3 bg-app-primary/5 rounded-lg border border-app-primary/20">
        <p className="text-xs text-app-muted flex items-start gap-2">
          <Icon name="info" className="w-4 h-4 text-app-primary flex-shrink-0 mt-0.5" />
          <span>
            Clique em um equipamento para seleciona-lo. {equipamentosFiltrados.length} equipamento(s) disponivel(is) nesta categoria.
          </span>
        </p>
      </div>
    </div>
  );
}
