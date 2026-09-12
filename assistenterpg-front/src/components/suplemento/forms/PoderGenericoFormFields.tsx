// src/components/suplemento/forms/PoderGenericoFormFields.tsx

'use client';

import { Textarea } from '@/components/ui/Textarea';
import { RequisitosEstruturadosEditor } from './RequisitosEstruturadosEditor';
import { MecanicasEstruturadasEditor } from './MecanicasEstruturadasEditor';
import type { HomebrewFormDados } from '../hooks/useHomebrewForm';

type Props = {
  dados: HomebrewFormDados;
  onChange: (dados: Partial<HomebrewFormDados>) => void;
};

export function PoderGenericoFormFields({ dados, onChange }: Props) {
  return (
    <div className="space-y-4">
      <RequisitosEstruturadosEditor
        value={dados.requisitos}
        onChange={(requisitos) => onChange({ requisitos })}
      />

      <Textarea
        label="Efeitos *"
        value={dados.efeitos ?? ''}
        onChange={(e) => onChange({ efeitos: e.target.value })}
        placeholder="Descreva os efeitos do poder em detalhes..."
        rows={6}
        maxLength={2000}
        required
      />

      <MecanicasEstruturadasEditor
        value={dados.mecanicas}
        onChange={(mecanicas) => onChange({ mecanicas })}
      />

      <div className="p-3 border border-app-border rounded-lg bg-app-muted-surface">
        <p className="text-xs text-app-muted">
          <strong>Estrutura esperada:</strong>
        </p>
        <ul className="text-xs text-app-muted mt-2 space-y-1">
          <li>• <strong>requisitos:</strong> Condições livres ou estruturadas (opcional)</li>
          <li>• <strong>efeitos:</strong> Descrição textual dos efeitos (obrigatório)</li>
          <li>• <strong>mecânicas:</strong> Custos, dano, alcance e limites estruturados (opcional)</li>
        </ul>
      </div>
    </div>
  );
}
