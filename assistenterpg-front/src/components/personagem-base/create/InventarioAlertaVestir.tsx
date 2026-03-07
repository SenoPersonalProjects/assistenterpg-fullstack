// InventarioAlertaVestir.tsx - ✅ CORRIGIDO PARA ItemInventarioPayload

'use client';

import { useMemo } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Alert } from '@/components/ui/Alert';
import { LIMITES_VESTIR, podeSerVestido } from '@/lib/utils/inventario';
import type { ItemInventarioPayload, EquipamentoCatalogo } from '@/lib/api';

type Props = {
  itens: ItemInventarioPayload[]; // ✅ MUDOU
  equipamentos: EquipamentoCatalogo[];
  className?: string;
};

export function InventarioAlertaVestir({ itens, equipamentos, className }: Props) {
  // ✅ NOVO: Contar manualmente (sem usar contarItensVestiveis que espera ItemInventarioDto)
  const { vestiveis, vestimentas } = useMemo(() => {
    let totalVestiveis = 0;
    let totalVestimentas = 0;

    itens
      .filter((item) => item.equipado)
      .forEach((item) => {
        const equip = equipamentos.find((e) => e.id === item.equipamentoId);
        if (!equip) return;

        // ✅ Usar podeSerVestido() que considera tipoUso
        if (!podeSerVestido(equip)) return;

        // Contar como vestível
        totalVestiveis += item.quantidade;

        // Verificar se é vestimenta (só para ACESSORIO)
        const tipoAcessorio = equip.tipoAcessorio;
        if (equip.tipo === 'ACESSORIO' && tipoAcessorio === 'VESTIMENTA') {
          totalVestimentas += item.quantidade;
        }
      });

    return { vestiveis: totalVestiveis, vestimentas: totalVestimentas };
  }, [itens, equipamentos]);

  const excedeuVestiveis = vestiveis > LIMITES_VESTIR.MAX_VESTIVEIS;
  const excedeuVestimentas = vestimentas > LIMITES_VESTIR.MAX_VESTIMENTAS;
  const temExcesso = excedeuVestiveis || excedeuVestimentas;
  const proxDoLimite =
    vestiveis >= LIMITES_VESTIR.MAX_VESTIVEIS - 1 ||
    vestimentas >= LIMITES_VESTIR.MAX_VESTIMENTAS - 1;

  // Não mostrar se não houver itens equipados
  if (vestiveis === 0) {
    return null;
  }

  return (
    <div className={className}>
      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Card: Itens Vestidos */}
        <div
          className={`p-3 rounded border transition-all ${
            excedeuVestiveis
              ? 'border-app-danger/30 bg-app-danger/5'
              : proxDoLimite && !excedeuVestiveis
                ? 'border-app-warning/30 bg-app-warning/5'
                : 'border-app-border bg-app-surface'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-app-muted">Itens Vestidos</span>
            <Icon
              name="shield"
              className={`w-4 h-4 ${
                excedeuVestiveis
                  ? 'text-app-danger'
                  : proxDoLimite && !excedeuVestiveis
                    ? 'text-app-warning'
                    : 'text-app-primary'
              }`}
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold ${
                excedeuVestiveis
                  ? 'text-app-danger'
                  : proxDoLimite && !excedeuVestiveis
                    ? 'text-app-warning'
                    : 'text-app-fg'
              }`}
            >
              {vestiveis}
            </span>
            <span className="text-sm text-app-muted">/ {LIMITES_VESTIR.MAX_VESTIVEIS}</span>
          </div>
          {excedeuVestiveis && (
            <p className="text-xs text-app-danger mt-1">
              ⚠️ Excede em {vestiveis - LIMITES_VESTIR.MAX_VESTIVEIS}
            </p>
          )}
        </div>

        {/* Card: Vestimentas */}
        <div
          className={`p-3 rounded border transition-all ${
            excedeuVestimentas
              ? 'border-app-danger/30 bg-app-danger/5'
              : vestimentas >= LIMITES_VESTIR.MAX_VESTIMENTAS - 1 && !excedeuVestimentas
                ? 'border-app-warning/30 bg-app-warning/5'
                : 'border-app-border bg-app-surface'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-app-muted">Vestimentas</span>
            <Icon
              name="sparkles"
              className={`w-4 h-4 ${
                excedeuVestimentas
                  ? 'text-app-danger'
                  : vestimentas >= LIMITES_VESTIR.MAX_VESTIMENTAS - 1 && !excedeuVestimentas
                    ? 'text-app-warning'
                    : 'text-app-primary'
              }`}
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold ${
                excedeuVestimentas
                  ? 'text-app-danger'
                  : vestimentas >= LIMITES_VESTIR.MAX_VESTIMENTAS - 1 && !excedeuVestimentas
                    ? 'text-app-warning'
                    : 'text-app-fg'
              }`}
            >
              {vestimentas}
            </span>
            <span className="text-sm text-app-muted">/ {LIMITES_VESTIR.MAX_VESTIMENTAS}</span>
          </div>
          {excedeuVestimentas && (
            <p className="text-xs text-app-danger mt-1">
              ⚠️ Excede em {vestimentas - LIMITES_VESTIR.MAX_VESTIMENTAS}
            </p>
          )}
        </div>
      </div>

      {/* Alerta de Erro */}
      {temExcesso && (
        <Alert variant="error">
          <div className="flex items-start gap-2 text-sm">
            <Icon name="error" className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <strong>⚠️ Limite de itens vestidos excedido!</strong>
              <ul className="mt-1 space-y-0.5 text-xs">
                {excedeuVestiveis && (
                  <li>
                    • Você tem <strong>{vestiveis}</strong> itens vestidos, mas o máximo é{' '}
                    <strong>{LIMITES_VESTIR.MAX_VESTIVEIS}</strong>
                  </li>
                )}
                {excedeuVestimentas && (
                  <li>
                    • Você tem <strong>{vestimentas}</strong> vestimentas, mas o máximo é{' '}
                    <strong>{LIMITES_VESTIR.MAX_VESTIMENTAS}</strong>
                  </li>
                )}
              </ul>
              <p className="mt-2 text-xs text-app-muted">
                Desequipe alguns itens antes de finalizar a criação do personagem.
              </p>
            </div>
          </div>
        </Alert>
      )}

      {/* Alerta de Aviso (próximo do limite) */}
      {!temExcesso && proxDoLimite && (
        <Alert variant="warning">
          <div className="flex items-center gap-2 text-sm">
            <Icon name="warning" className="w-4 h-4" />
            <span>Você está próximo do limite de itens vestidos.</span>
          </div>
        </Alert>
      )}
    </div>
  );
}
