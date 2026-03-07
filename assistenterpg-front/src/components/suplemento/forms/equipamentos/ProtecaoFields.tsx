// src/components/suplemento/forms/equipamentos/ProtecaoFields.tsx

'use client';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import {
  ProficienciaProtecao,
  TipoProtecao,
  TipoReducaoDano,
  PROFICIENCIA_PROTECAO_LABELS,
  TIPO_PROTECAO_LABELS,
  TIPO_REDUCAO_DANO_LABELS,
} from '@/lib/types/homebrew-enums';
import type { DadosReducaoDano } from '@/lib/api/homebrews';
import type { HomebrewFormDados } from '../../hooks/useHomebrewForm';

type Props = {
  dados: HomebrewFormDados;
  onChange: (dados: Partial<HomebrewFormDados>) => void;
};

export function ProtecaoFields({ dados, onChange }: Props) {
  const reducoesDano: DadosReducaoDano[] = dados.reducoesDano ?? [];

  function addReducao() {
    const novaReducao: DadosReducaoDano = {
      tipoReducao: TipoReducaoDano.FISICO,
      valor: 2,
    };
    onChange({ reducoesDano: [...reducoesDano, novaReducao] });
  }

  function updateReducao(index: number, campo: keyof DadosReducaoDano, valor: unknown) {
    const novasReducoes = [...reducoesDano];
    novasReducoes[index] = { ...novasReducoes[index], [campo]: valor };
    onChange({ reducoesDano: novasReducoes });
  }

  function removeReducao(index: number) {
    onChange({ reducoesDano: reducoesDano.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-4">
      {/* Proficiência e Tipo */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Select
          label="Proficiência *"
          value={dados.proficienciaProtecao ?? ''}
          onChange={(e) => onChange({ proficienciaProtecao: e.target.value as ProficienciaProtecao })}
          required
        >
          <option value="">Selecione...</option>
          {(Object.entries(PROFICIENCIA_PROTECAO_LABELS) as [ProficienciaProtecao, string][]).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <Select
          label="Tipo *"
          value={dados.tipoProtecao ?? ''}
          onChange={(e) => onChange({ tipoProtecao: e.target.value as TipoProtecao })}
          required
        >
          <option value="">Selecione...</option>
          {(Object.entries(TIPO_PROTECAO_LABELS) as [TipoProtecao, string][]).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {/* Bônus de Defesa e Penalidade */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Input
          label="Bônus de defesa *"
          type="number"
          min={0}
          value={dados.bonusDefesa ?? ''}
          onChange={(e) => onChange({ bonusDefesa: Number(e.target.value) })}
          placeholder="Ex: 2, 5, 10"
          required
        />

        <Input
          label="Penalidade de carga *"
          type="number"
          value={dados.penalidadeCarga ?? 0}
          onChange={(e) => onChange({ penalidadeCarga: Number(e.target.value) })}
          placeholder="Ex: 0, -5, -10"
          required
        />
      </div>

      {/* Reduções de dano */}
      <div className="space-y-3 pt-3 border-t border-app-border">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-app-fg">Reduções de dano</label>
          <Button type="button" size="sm" variant="secondary" onClick={addReducao}>
            <Icon name="add" className="w-4 h-4 mr-1" />
            Adicionar redução
          </Button>
        </div>

        {reducoesDano.length === 0 && (
          <p className="text-xs text-app-muted italic">Nenhuma redução de dano configurada</p>
        )}

        {reducoesDano.map((reducao, idx) => (
          <div key={idx} className="p-3 border border-app-border rounded-lg bg-app-muted-surface">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-app-fg">Redução #{idx + 1}</span>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => removeReducao(idx)}
              >
                <Icon name="delete" className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <Select
                label="Tipo *"
                value={reducao.tipoReducao}
                onChange={(e) => updateReducao(idx, 'tipoReducao', e.target.value as TipoReducaoDano)}
                required
              >
                {(Object.entries(TIPO_REDUCAO_DANO_LABELS) as [TipoReducaoDano, string][]).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>

              <Input
                label="Valor *"
                type="number"
                min={1}
                value={reducao.valor}
                onChange={(e) => updateReducao(idx, 'valor', Number(e.target.value))}
                placeholder="Ex: 2, 5"
                required
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
