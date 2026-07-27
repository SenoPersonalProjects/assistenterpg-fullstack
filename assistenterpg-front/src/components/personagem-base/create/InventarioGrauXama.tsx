// InventarioGrauXama.tsx - ✅ CORRIGIDO PARA ItemInventarioPayload

'use client';

import { Icon } from '@/components/ui/Icon';
import { InfoTile } from '@/components/ui/InfoTile';
import {
  formatarGrauXama,
  getLimiteCreditoComBonus,
  type GrauXama,
} from '@/lib/utils/prestigio';
import { isCategoriaBloquada } from '@/lib/utils/inventario';

type Props = {
  grauXama: GrauXama;
  itensPorCategoria: Record<string, number>;
  creditoCategoriaBonus?: number;
};

export function InventarioGrauXama({
  grauXama,
  itensPorCategoria,
  creditoCategoriaBonus = 0,
}: Props) {
  const limiteCredito = getLimiteCreditoComBonus(
    grauXama.grau,
    creditoCategoriaBonus,
  );
  return (
    <div>
      <h3 className="text-sm font-semibold text-app-fg mb-3 flex items-center gap-2">
        <Icon name="briefcase" className="w-4 h-4 text-app-primary" />
        Grau de Xamã
      </h3>

      <div className="space-y-3">
        {/* Info tiles compactas */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          <InfoTile
            label="Grau"
            value={<span className="text-app-success">{formatarGrauXama(grauXama.grau)}</span>}
          />
          <InfoTile label="Limite Credito" value={limiteCredito} />
        </div>

        {/* ✅ COMPACTO: Grid 3 colunas em mobile, 6 em desktop, padding reduzido */}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {(['0', '4', '3', '2', '1', 'ESPECIAL'] as const).map((cat) => {
            const limite = grauXama.limitesPorCategoria[cat] ?? 0;
            const atual = itensPorCategoria[cat] || 0;
            const bloqueado = isCategoriaBloquada(
              cat,
              itensPorCategoria,
              grauXama.limitesPorCategoria,
            );

            return (
              <div
                key={cat}
                className={`p-2 rounded-lg border-2 transition-all text-center ${
                  bloqueado
                    ? 'border-app-danger bg-app-danger/5'
                    : atual > 0
                      ? 'border-app-primary bg-app-primary/5'
                      : 'border-app-border bg-app-surface'
                }`}
              >
                {/* ✅ Categoria compacta */}
                <p className="text-xs font-bold text-app-muted mb-0.5">Cat. {cat}</p>

                {/* ✅ Contador compacto */}
                <p
                  className={`text-xl font-bold leading-none ${
                    bloqueado ? 'text-app-danger' : atual > 0 ? 'text-app-primary' : 'text-app-muted'
                  }`}
                >
                  {atual}
                  <span className="text-xs text-app-muted">/{cat === '0' ? '∞' : limite}</span>
                </p>

                {/* ✅ Status compacto */}
                {bloqueado && (
                  <p className="text-[10px] text-app-danger font-semibold mt-0.5">Bloqueado</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Nota informativa compacta */}
        {Object.values(itensPorCategoria).some((v) => v > 0) && (
          <p className="text-xs text-app-muted flex items-center gap-2">
            <Icon name="info" className="w-3 h-3" />
            Cat. 0 é ilimitada. Outras limitadas por grau {formatarGrauXama(grauXama.grau)}.
          </p>
        )}
      </div>
    </div>
  );
}
