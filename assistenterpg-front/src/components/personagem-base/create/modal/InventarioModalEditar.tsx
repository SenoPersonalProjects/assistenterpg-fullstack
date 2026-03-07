// InventarioModalEditar.tsx - ✅ CORRIGIDO PARA ItemInventarioPayload

'use client';

import { useMemo } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { formatarIncrementoEspacos, calcularEspacosExtraDeItens, podeSerVestido } from '@/lib/utils/inventario';
import type { ItemInventarioPayload, ModificacaoCatalogo, EquipamentoCatalogo } from '@/lib/api';

type Props = {
  item: ItemInventarioPayload; // ✅ MUDOU
  quantidade: number;
  modificacoesIds: number[]; // ✅ MUDOU: Array de IDs
  modificacoesCompativeis: ModificacaoCatalogo[];
  equipamentos: EquipamentoCatalogo[];
  nomeCustomizado: string;
  equipado: boolean;
  onQuantidadeChange: (qtd: number) => void;
  onToggleModificacao: (modId: number, checked: boolean) => void; // ✅ MUDOU: Recebe ID
  onNomeCustomizadoChange: (nome: string) => void;
  onEquipadoChange: (equipado: boolean) => void;
};

export function InventarioModalEditar({
  item,
  quantidade,
  modificacoesIds, // ✅ MUDOU
  modificacoesCompativeis,
  equipamentos,
  nomeCustomizado,
  equipado,
  onQuantidadeChange,
  onToggleModificacao,
  onNomeCustomizadoChange,
  onEquipadoChange,
}: Props) {
  // ✅ NOVO: Buscar equipamento pelo ID
  const equipamento = useMemo(() => {
    return equipamentos.find((e) => e.id === item.equipamentoId);
  }, [equipamentos, item.equipamentoId]);

  const podeVestir = useMemo(
    () => (equipamento ? podeSerVestido(equipamento) : false),
    [equipamento],
  );

  if (!equipamento) {
    return (
      <div className="text-center py-4">
        <Icon name="error" className="w-8 h-8 text-app-danger mx-auto mb-2" />
        <p className="text-sm text-app-danger">Equipamento não encontrado</p>
      </div>
    );
  }

  const espacosExtraItem = calcularEspacosExtraDeItens(
    [{ equipamentoId: item.equipamentoId, quantidade: 1 }],
    equipamentos,
  );

  // ✅ Detectar se tem nome customizado
  const temNomeCustomizado = !!nomeCustomizado.trim();

  return (
    <div className="space-y-4">
      {/* Info do equipamento base */}
      <div className="p-4 bg-app-primary/10 rounded-lg border border-app-primary/30">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-bold text-app-fg">{equipamento.nome}</p>
            <p className="text-sm text-app-muted mt-1">{equipamento.codigo}</p>
          </div>
          {espacosExtraItem > 0 && (
            <Badge color="green" size="sm">
              <Icon name="add" className="w-3 h-3 inline mr-1" />
              +{espacosExtraItem} espaços
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* ✅ Nome Customizado */}
        <div>
          <label className="block text-sm font-semibold text-app-fg mb-2 flex items-center gap-2">
            <Icon name="edit" className="w-4 h-4 text-app-primary" />
            Nome Personalizado
            <span className="text-xs font-normal text-app-muted">(Opcional)</span>
          </label>
          
          <Input
            value={nomeCustomizado}
            onChange={(e) => onNomeCustomizadoChange(e.target.value)}
            placeholder={equipamento.nome}
            icon="edit"
            maxLength={100}
          />

          {/* Botão para limpar nome customizado */}
          {temNomeCustomizado && (
            <button
              onClick={() => onNomeCustomizadoChange('')}
              className="text-xs text-app-muted hover:text-app-fg mt-2 flex items-center gap-1 transition-colors"
            >
              <Icon name="close" className="w-3 h-3" />
              Limpar nome customizado
            </button>
          )}

          {/* Preview do nome que será exibido */}
          <div className="mt-2 p-2 bg-app-bg rounded border border-app-border">
            <p className="text-xs text-app-muted mb-1">Preview:</p>
            <p className="text-sm font-semibold text-app-fg">
              {nomeCustomizado.trim() || equipamento.nome}
            </p>
            {temNomeCustomizado && (
              <p className="text-xs text-app-muted italic mt-1">
                ({equipamento.nome})
              </p>
            )}
          </div>
        </div>

        {/* Quantidade */}
        <div>
          <label className="block text-sm font-semibold text-app-fg mb-2 flex items-center gap-2">
            <Icon name="chart" className="w-4 h-4 text-app-primary" />
            Quantidade
          </label>
          <Input
            type="number"
            min="1"
            value={quantidade}
            onChange={(e) => onQuantidadeChange(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>

        {/* ✅ Checkbox "Equipado" (só se pode vestir) */}
        {podeVestir && (
          <div>
            <label className="flex items-center gap-2 cursor-pointer p-3 bg-app-surface rounded-lg border border-app-border hover:border-app-primary/50 transition-colors">
              <Checkbox 
                checked={equipado} 
                onChange={(e) => onEquipadoChange(e.target.checked)} 
              />
              <div className="flex-1">
                <span className="text-sm font-semibold text-app-fg block">Equipado</span>
                <span className="text-xs text-app-muted">Este item está vestido no personagem</span>
              </div>
              <Icon name="shield" className="w-5 h-5 text-app-primary" />
            </label>
          </div>
        )}

        {/* Modificações */}
        <div>
          <label className="block text-sm font-semibold text-app-fg mb-2 flex items-center gap-2">
            <Icon name="sparkles" className="w-4 h-4 text-app-primary" />
            Modificações
            <Badge color="blue" size="sm">
              {modificacoesIds.length}
            </Badge>
          </label>

          <div className="space-y-2 max-h-60 overflow-y-auto border border-app-border rounded-lg p-3 bg-app-bg">
            {modificacoesCompativeis.length === 0 ? (
              <div className="text-center py-4">
                <Icon name="info" className="w-8 h-8 text-app-muted mx-auto mb-2" />
                <p className="text-xs text-app-muted">
                  Nenhuma modificação compatível com este equipamento
                </p>
              </div>
            ) : (
              modificacoesCompativeis.map((mod) => {
                const temAplicada = modificacoesIds.includes(mod.id); // ✅ MUDOU
                return (
                  <label
                    key={mod.id}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      temAplicada
                        ? 'bg-app-primary/10 border border-app-primary/30'
                        : 'hover:bg-app-surface border border-transparent'
                    }`}
                  >
                    <Checkbox
                      checked={temAplicada}
                      onChange={(e) => onToggleModificacao(mod.id, e.target.checked)} // ✅ MUDOU: Passa ID
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-app-fg">{mod.nome}</p>
                      <p className="text-xs text-app-muted mt-0.5">
                        {formatarIncrementoEspacos(mod.incrementoEspacos)}
                      </p>
                      {mod.descricao && (
                        <p className="text-xs text-app-muted mt-1 line-clamp-2">
                          {mod.descricao}
                        </p>
                      )}
                      {(mod.apenasAmaldicoadas ||
                        (mod.requerComplexidade && mod.requerComplexidade !== 'NENHUMA')) && (
                        <div className="flex gap-1 mt-2">
                          {mod.apenasAmaldicoadas && (
                            <Badge color="purple" size="sm">
                              <Icon name="sparkles" className="w-3 h-3 inline mr-1" />
                              Amaldiçoado
                            </Badge>
                          )}
                          {mod.requerComplexidade && mod.requerComplexidade !== 'NENHUMA' && (
                            <Badge color="orange" size="sm">
                              Requer {mod.requerComplexidade}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
