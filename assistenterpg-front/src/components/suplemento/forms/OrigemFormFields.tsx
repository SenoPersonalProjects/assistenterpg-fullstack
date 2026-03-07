// src/components/suplemento/forms/OrigemFormFields.tsx

'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import type { HomebrewFormDados } from '../hooks/useHomebrewForm';

type Props = {
  dados: HomebrewFormDados;
  onChange: (dados: Partial<HomebrewFormDados>) => void;
};

export function OrigemFormFields({ dados, onChange }: Props) {
  const [novaPericha, setNovaPericia] = useState('');
  const pericias: string[] = dados.pericias ?? [];

  function addPericia() {
    if (!novaPericha.trim()) return;
    onChange({ pericias: [...pericias, novaPericha.trim()] });
    setNovaPericia('');
  }

  function removePericia(index: number) {
    onChange({ pericias: pericias.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-4">
      {/* Perícias */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-app-fg">Perícias *</label>

        <div className="flex gap-2">
          <Input
            value={novaPericha}
            onChange={(e) => setNovaPericia(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addPericia();
              }
            }}
            placeholder="Ex: Atletismo, Percepção"
          />
          <Button type="button" onClick={addPericia}>
            <Icon name="add" className="w-4 h-4" />
          </Button>
        </div>

        {pericias.length === 0 && (
          <p className="text-xs text-app-muted italic">Nenhuma perícia adicionada</p>
        )}

        {pericias.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {pericias.map((pericia, idx) => (
              <Badge key={idx} color="blue" size="sm">
                {pericia}
                <button
                  type="button"
                  onClick={() => removePericia(idx)}
                  className="ml-1.5 hover:text-app-danger"
                >
                  <Icon name="close" className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Habilidades */}
      <Textarea
        label="Habilidades iniciais (JSON array)"
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
        placeholder='Ex: [{"nome": "Herança Mágica", "descricao": "..."}]'
        rows={5}
      />

      <div className="p-3 border border-app-border rounded-lg bg-app-muted-surface">
        <p className="text-xs text-app-muted">
          <strong>Estrutura esperada:</strong>
        </p>
        <ul className="text-xs text-app-muted mt-2 space-y-1">
          <li>• <strong>pericias:</strong> Array de strings (nomes das perícias)</li>
          <li>• <strong>habilidades:</strong> Array de objetos JSON (habilidades especiais da origem)</li>
        </ul>
      </div>
    </div>
  );
}
