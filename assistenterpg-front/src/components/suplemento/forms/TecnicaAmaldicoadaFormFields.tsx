// src/components/suplemento/forms/TecnicaAmaldicoadaFormFields.tsx

'use client';

import { TecnicaBaseFields } from './tecnicas/TecnicaBaseFields';
import { HabilidadesList } from './tecnicas/HabilidadesList';
import { Icon } from '@/components/ui/Icon';
import type { HabilidadeTecnica } from '@/lib/api/homebrews';

type Props = {
  dados: any;
  onChange: (dados: any) => void;
};

export function TecnicaAmaldicoadaFormFields({ dados, onChange }: Props) {
  const habilidades: HabilidadeTecnica[] = dados.habilidades ?? [];

  function handleBaseChange(baseDados: any) {
    onChange({ ...dados, ...baseDados });
  }

  function handleHabilidadesChange(novasHabilidades: HabilidadeTecnica[]) {
    onChange({ ...dados, habilidades: novasHabilidades });
  }

  return (
    <div className="space-y-6">
      {/* Campos base */}
      <TecnicaBaseFields dados={dados} onChange={handleBaseChange} />

      {/* Divisor */}
      <div className="border-t border-app-border" />

      {/* Lista de habilidades */}
      <HabilidadesList habilidades={habilidades} onChange={handleHabilidadesChange} />

      {/* Alerta se nenhuma habilidade */}
      {habilidades.length === 0 && (
        <div className="p-4 border border-app-warning/30 rounded-lg bg-app-warning/5">
          <div className="flex items-start gap-3">
            <Icon name="warning" className="w-5 h-5 text-app-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-app-fg">Habilidades obrigatórias</p>
              <p className="text-xs text-app-muted mt-1">
                Toda técnica amaldiçoada deve ter pelo menos uma habilidade.
                Adicione habilidades acima para continuar.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
