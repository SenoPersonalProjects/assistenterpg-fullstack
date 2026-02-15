// src/components/suplemento/forms/TrilhaFormFields.tsx

'use client';

import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

type Props = {
  dados: any;
  onChange: (dados: any) => void;
};

export function TrilhaFormFields({ dados, onChange }: Props) {
  return (
    <div className="space-y-4">
      <Input
        label="ID da classe *"
        type="number"
        min={1}
        value={dados.classeId ?? ''}
        onChange={(e) => onChange({ classeId: e.target.value ? Number(e.target.value) : undefined })}
        placeholder="Ex: 1 = Feiticeiro, 2 = Xamã..."
        required
      />

      <Input
        label="Nível de requisito"
        type="number"
        min={1}
        max={20}
        value={dados.nivelRequisito ?? 1}
        onChange={(e) => onChange({ nivelRequisito: Number(e.target.value) })}
        placeholder="1"
      />

      <Textarea
        label="Habilidades da trilha (JSON array) *"
        value={
          Array.isArray(dados.habilidades)
            ? JSON.stringify(dados.habilidades, null, 2)
            : dados.habilidades || '[]'
        }
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            onChange({ habilidades: Array.isArray(parsed) ? parsed : [] });
          } catch {
            onChange({ habilidades: e.target.value });
          }
        }}
        placeholder='Ex: [{"nivel": 3, "nome": "Foco Elemental", "descricao": "..."}]'
        rows={8}
        required
      />

      <div className="p-3 border border-app-border rounded-lg bg-app-muted-surface">
        <p className="text-xs text-app-muted">
          <strong>Estrutura esperada:</strong>
        </p>
        <ul className="text-xs text-app-muted mt-2 space-y-1">
          <li>• <strong>classeId:</strong> ID numérico da classe (obrigatório)</li>
          <li>• <strong>nivelRequisito:</strong> Nível mínimo para escolher a trilha (padrão: 1)</li>
          <li>• <strong>habilidades:</strong> Array de objetos com habilidades por nível</li>
        </ul>
      </div>
    </div>
  );
}
