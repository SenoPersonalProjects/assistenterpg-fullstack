// components/personagem-base/PersonagemBaseGrausField.tsx
'use client';

import type { TipoGrauCatalogo } from '@/lib/api';

type Props = {
  tiposGrau: TipoGrauCatalogo[];
  valores: Record<string, number>;
  onChangeValor: (codigo: string, valor: number) => void;
};

export function PersonagemBaseGrausField({
  tiposGrau,
  valores,
  onChangeValor,
}: Props) {
  return (
    <div>
      <p className="text-sm font-medium text-app-fg mb-1">
        Graus de aprimoramento
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {tiposGrau.map(t => (
          <div
            key={t.codigo}
            className="flex items-center justify-between gap-2 text-xs"
          >
            <span className="text-app-fg">{t.nome}</span>
            <input
              type="number"
              min={0}
              max={5}
              className="w-16 rounded border border-app-border bg-app-surface px-1 py-0.5 text-right"
              value={valores[t.codigo] ?? 0}
              onChange={e =>
                onChangeValor(
                  t.codigo,
                  Math.min(
                    5,
                    Math.max(0, Number(e.target.value) || 0),
                  ),
                )
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
