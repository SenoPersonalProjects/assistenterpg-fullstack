// src/components/suplemento/forms/PoderGenericoFormFields.tsx

'use client';

import { Textarea } from '@/components/ui/Textarea';

type Props = {
  dados: any;
  onChange: (dados: any) => void;
};

export function PoderGenericoFormFields({ dados, onChange }: Props) {
  return (
    <div className="space-y-4">
      <Textarea
        label="Requisitos (JSON ou texto livre)"
        value={
          typeof dados.requisitos === 'string'
            ? dados.requisitos
            : JSON.stringify(dados.requisitos || {}, null, 2)
        }
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            onChange({ requisitos: parsed });
          } catch {
            onChange({ requisitos: e.target.value });
          }
        }}
        placeholder='Ex: { "nivel": 3, "atributo": "INT >= 3" }'
        rows={3}
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

      <Textarea
        label="Mecânicas especiais (JSON)"
        value={
          typeof dados.mecanicas === 'string'
            ? dados.mecanicas
            : JSON.stringify(dados.mecanicas || {}, null, 2)
        }
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            onChange({ mecanicas: parsed });
          } catch {
            onChange({ mecanicas: e.target.value });
          }
        }}
        placeholder='Ex: { "custoXP": 2, "dano": "1d6", "alcance": "Curto" }'
        rows={5}
      />

      <div className="p-3 border border-app-border rounded-lg bg-app-muted-surface">
        <p className="text-xs text-app-muted">
          <strong>Estrutura esperada:</strong>
        </p>
        <ul className="text-xs text-app-muted mt-2 space-y-1">
          <li>• <strong>requisitos:</strong> Objeto JSON ou texto (opcional)</li>
          <li>• <strong>efeitos:</strong> Descrição textual dos efeitos (obrigatório)</li>
          <li>• <strong>mecanicas:</strong> Objeto JSON com custos, dano, alcance, etc. (opcional)</li>
        </ul>
      </div>
    </div>
  );
}
