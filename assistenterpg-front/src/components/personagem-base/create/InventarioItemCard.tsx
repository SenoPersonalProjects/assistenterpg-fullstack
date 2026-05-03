// InventarioItemCard.tsx - ✅ CORRIGIDO PARA ItemInventarioPayload

'use client';

import { useMemo } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  getIconeTipo,
  CATEGORIA_GRAU_LABELS,
  calcularCategoriaFinal,
  contarModificacoesEfetivasItem,
  equipamentoUsaPericiaPersonalizada,
  extrairFuncoesAdicionaisPericias,
} from '@/lib/utils/inventario';
import type {
  ItemInventarioPayload,
  EquipamentoCatalogo,
  ModificacaoCatalogo,
  PericiaCatalogo,
} from '@/lib/api';

type Props = {
  item: ItemInventarioPayload; // ??? MUDOU
  equipamento: EquipamentoCatalogo;
  modificacoes: ModificacaoCatalogo[]; // ??? ADICIONAR: Cat??logo completo
  pericias?: PericiaCatalogo[];
  onEdit: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
};

export function InventarioItemCard({
  item,
  equipamento,
  modificacoes, // ??? ADICIONAR
  pericias = [],
  onEdit,
  onDuplicate,
  onRemove,
}: Props) {
  // ✅ NOVO: Buscar modificações pelos IDs
  const modsAplicadas = useMemo(() => {
    if (!item.modificacoesIds || item.modificacoesIds.length === 0) return [];
    return modificacoes.filter((mod) => item.modificacoesIds?.includes(mod.id));
  }, [item.modificacoesIds, modificacoes]);

  // ✅ NOVO: Calcular espaços (sem espacosCalculados do backend)
  const espacosPorUnidade = useMemo(() => {
    let espacos = equipamento.espacos;
    modsAplicadas.forEach((mod) => {
      espacos += mod.incrementoEspacos;
    });
    return espacos;
  }, [equipamento.espacos, modsAplicadas]);

  const espacosTotal = espacosPorUnidade * item.quantidade;

  // ✅ Normalizar categoria
  const categoriaFinal = calcularCategoriaFinal(
    equipamento.categoria,
    contarModificacoesEfetivasItem({
      modificacoesIds: item.modificacoesIds,
      modificacoesCatalogo: modificacoes,
      estado: item.estado,
    }),
  );

  // ✅ Obter label da categoria
  const categoriaLabel = CATEGORIA_GRAU_LABELS[categoriaFinal] || {
    nome: `Cat. ${categoriaFinal}`,
    cor: 'text-app-muted',
  };

  // ✅ Nome customizado e nome original
  const temNomeCustomizado = !!item.nomeCustomizado;
  const nomeExibido = item.nomeCustomizado || equipamento.nome;
  const nomeOriginal = equipamento.nome;
  const periciaPersonalizada = useMemo(() => {
    if (!equipamentoUsaPericiaPersonalizada(equipamento)) return null;
    const codigo = item.estado?.periciaCodigo?.trim().toUpperCase();
    if (!codigo) return null;
    return pericias.find((pericia) => pericia.codigo === codigo) ?? null;
  }, [equipamento, item.estado?.periciaCodigo, pericias]);
  const funcoesAdicionais = useMemo(() => {
    return extrairFuncoesAdicionaisPericias(item.estado)
      .map((codigo) => pericias.find((pericia) => pericia.codigo === codigo)?.nome ?? codigo);
  }, [item.estado, pericias]);

  return (
    <div className="p-3 rounded border border-app-border bg-app-surface text-sm hover:bg-app-primary/5 hover:border-app-primary/30 transition-all duration-200">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Icon name={getIconeTipo(equipamento.tipo)} className="w-4 h-4 text-app-primary" />
            
            {/* ✅ Nome customizado + nome original */}
            <div className="flex flex-col gap-0.5">
              <p className="font-semibold text-app-fg flex items-center gap-1.5">
                {nomeExibido}
                {temNomeCustomizado && (
                  <Icon name="edit" className="w-3 h-3 text-app-muted" title="Nome personalizado" />
                )}
              </p>
              
              {/* ✅ Mostrar nome original se houver customização */}
              {temNomeCustomizado && (
                <p className="text-xs text-app-muted italic">
                  {nomeOriginal}
                </p>
              )}
            </div>
          </div>

          <p className="text-xs text-app-muted ml-6 mb-2">
            {item.quantidade}× • {espacosPorUnidade} esp./un • Total: {espacosTotal}
          </p>

          <div className="flex flex-wrap gap-1 ml-6">
            {/* ✅ Badge "Equipado" mais visível */}
            {item.equipado && (
              <Badge color="green" size="sm" className="font-semibold">
                <Icon name="check" className="w-3.5 h-3.5 inline mr-1" />
                Equipado
              </Badge>
            )}

            {/* ✅ Categoria com label */}
            <Badge color="blue" size="sm" title={`Categoria de grau xamã: ${categoriaLabel.nome}`}>
              {categoriaLabel.nome}
            </Badge>

            {/* ✅ Modificações com tooltip descritivo */}
            {modsAplicadas.length > 0 &&
              modsAplicadas.map((mod) => (
                <Badge
                  key={mod.id}
                  color="purple"
                  size="sm"
                  title={
                    mod.descricao
                      ? `${mod.nome}: ${mod.descricao}`
                      : `Modificação: ${mod.nome}${
                          mod.incrementoEspacos !== 0
                            ? ` (${mod.incrementoEspacos > 0 ? '+' : ''}${mod.incrementoEspacos} espaços)`
                            : ''
                        }`
                  }
                >
                  <Icon name="sparkles" className="w-3 h-3 inline mr-1" />
                  {mod.nome}
                  {mod.incrementoEspacos !== 0 && (
                    <span className="ml-1 opacity-75">
                      ({mod.incrementoEspacos > 0 ? '+' : ''}
                      {mod.incrementoEspacos})
                    </span>
                  )}
                </Badge>
              ))}
            {periciaPersonalizada ? (
              <Badge color="yellow" size="sm">
                <Icon name="sparkles" className="w-3 h-3 inline mr-1" />
                +2 {periciaPersonalizada.nome}
              </Badge>
            ) : null}
            {funcoesAdicionais.map((pericia) => (
              <Badge key={pericia} color="yellow" size="sm">
                <Icon name="sparkles" className="w-3 h-3 inline mr-1" />
                +2 {pericia}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-1">
          <Button onClick={onEdit} variant="secondary" size="sm" title="Editar item">
            <Icon name="edit" className="w-4 h-4" />
          </Button>
          <Button onClick={onDuplicate} variant="secondary" size="sm" title="Duplicar item">
            <Icon name="copy" className="w-4 h-4" />
          </Button>
          <Button onClick={onRemove} variant="secondary" size="sm" title="Remover item">
            <Icon name="delete" className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
