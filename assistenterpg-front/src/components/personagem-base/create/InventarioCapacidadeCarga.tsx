// InventarioCapacidadeCarga.tsx - SEM MUDANÇAS (já está correto)

'use client';

import { Icon } from '@/components/ui/Icon';
import { Alert } from '@/components/ui/Alert';
import {
  formatarPercentualCarga,
  getCorBarraProgresso,
  getCorTextoProgresso,
} from '@/lib/utils/inventario';

type Props = {
  espacosBase: number;
  espacosExtra: number;
  espacosTotal: number;
  espacosOcupados: number;
  espacosRestantes: number;
};

export function InventarioCapacidadeCarga({
  espacosBase,
  espacosExtra,
  espacosTotal,
  espacosOcupados,
  espacosRestantes,
}: Props) {
  const espacosPercentual = formatarPercentualCarga(espacosOcupados, espacosTotal);

  return (
    <div>
      <h3 className="text-sm font-semibold text-app-fg mb-3 flex items-center gap-2">
        <Icon name="briefcase" className="w-4 h-4 text-app-primary" />
        Capacidade de Carga
      </h3>

      <div className="space-y-3 rounded-lg border border-app-border bg-app-surface p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-app-muted">Espaços utilizados</p>
            <p className="text-lg font-bold text-app-fg">
              {espacosOcupados} / {espacosTotal}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${getCorTextoProgresso(espacosPercentual)}`}>
              {espacosPercentual}%
            </p>
            <p className="text-xs text-app-muted">Base: {espacosBase} (Força × 5)</p>
            {espacosExtra > 0 && <p className="text-xs text-app-success">+{espacosExtra} extras</p>}
          </div>
        </div>

        <div className="w-full bg-app-border rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all ${getCorBarraProgresso(espacosPercentual)}`}
            style={{ width: `${Math.min(espacosPercentual, 100)}%` }}
          />
        </div>

        {espacosRestantes < 0 ? (
          <Alert variant="error">
            <div className="flex items-center gap-2 text-xs">
              <span>
                <strong>Sobrecarga!</strong> {Math.abs(espacosRestantes)} espaço(s) acima do
                limite.
              </span>
            </div>
          </Alert>
        ) : espacosRestantes <= 5 ? (
          <Alert variant="warning">
            <div className="flex items-center gap-2 text-xs">
              <span>Apenas {espacosRestantes} espaço(s) restante(s).</span>
            </div>
          </Alert>
        ) : (
          <div className="text-xs text-app-success bg-app-success/10 p-2 rounded flex items-center gap-2 border border-app-success/30">
            <Icon name="check" className="w-4 h-4" />
            {espacosRestantes} espaço(s) disponível(is)
          </div>
        )}
      </div>
    </div>
  );
}

