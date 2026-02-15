// src/components/suplemento/forms/ClaFormFields.tsx

'use client';

import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

type Props = {
  dados: any;
  onChange: (dados: any) => void;
};

export function ClaFormFields({ dados, onChange }: Props) {
  return (
    <div className="space-y-4">
      <Input
        label="ID da técnica inata (opcional)"
        type="number"
        min={1}
        value={dados.tecnicaInataId ?? ''}
        onChange={(e) => onChange({ tecnicaInataId: e.target.value ? Number(e.target.value) : undefined })}
        placeholder="Ex: 1, 5, 10"
      />

      <Textarea
        label="Características do clã (JSON array)"
        value={
          Array.isArray(dados.caracteristicas)
            ? JSON.stringify(dados.caracteristicas, null, 2)
            : dados.caracteristicas || '[]'
        }
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            onChange({ caracteristicas: Array.isArray(parsed) ? parsed : [] });
          } catch {
            onChange({ caracteristicas: e.target.value });
          }
        }}
        placeholder='Ex: [{"nome": "Grande Clã", "descricao": "Pertence aos grandes clãs"}]'
        rows={5}
      />

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
        placeholder='Ex: { "nivel": 1, "origem": "Kyoto" }'
        rows={3}
      />

      <div className="p-3 border border-app-border rounded-lg bg-app-muted-surface">
        <p className="text-xs text-app-muted">
          <strong>Dica:</strong> Use JSON válido para estruturar características e requisitos.
          Se a técnica inata for hereditária do clã, informe o ID dela.
        </p>
      </div>
    </div>
  );
}
