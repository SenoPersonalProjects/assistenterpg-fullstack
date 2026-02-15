// src/components/suplemento/forms/tecnicas/HabilidadesList.tsx

'use client';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { HabilidadeForm } from './HabilidadeForm';
import type { HabilidadeTecnica } from '@/lib/api/homebrews';
import { TipoExecucao, TipoDano } from '@/lib/types/homebrew-enums';

type Props = {
  habilidades: HabilidadeTecnica[];
  onChange: (habilidades: HabilidadeTecnica[]) => void;
};

export function HabilidadesList({ habilidades, onChange }: Props) {
  function addHabilidade() {
    const novaHabilidade: HabilidadeTecnica = {
      codigo: '',
      nome: '',
      descricao: '',
      execucao: TipoExecucao.ACAO_PADRAO,
      custoPE: 0,
      custoEA: 0,
      efeito: '',
      ordem: habilidades.length + 1,
    };
    onChange([...habilidades, novaHabilidade]);
  }

  function updateHabilidade(index: number, habilidade: Partial<HabilidadeTecnica>) {
    const novasHabilidades = [...habilidades];
    novasHabilidades[index] = { ...novasHabilidades[index], ...habilidade };
    onChange(novasHabilidades);
  }

  function removeHabilidade(index: number) {
    onChange(habilidades.filter((_, i) => i !== index));
  }

  function moveHabilidade(index: number, direction: 'up' | 'down') {
    const novasHabilidades = [...habilidades];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= novasHabilidades.length) return;

    [novasHabilidades[index], novasHabilidades[targetIndex]] = [
      novasHabilidades[targetIndex],
      novasHabilidades[index],
    ];

    // Atualizar ordem
    novasHabilidades.forEach((hab, idx) => {
      hab.ordem = idx + 1;
    });

    onChange(novasHabilidades);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-app-fg flex items-center gap-2">
            <Icon name="technique" className="w-4 h-4 text-app-primary" />
            Habilidades da técnica *
          </h3>
          <p className="text-xs text-app-muted mt-1">
            Adicione as habilidades que compõem esta técnica
          </p>
        </div>

        <Button type="button" size="sm" onClick={addHabilidade}>
          <Icon name="add" className="w-4 h-4 mr-1" />
          Adicionar habilidade
        </Button>
      </div>

      {habilidades.length === 0 && (
        <div className="p-6 border-2 border-dashed border-app-border rounded-lg bg-app-muted-surface text-center">
          <Icon name="technique" className="w-8 h-8 text-app-muted mx-auto mb-2" />
          <p className="text-sm text-app-muted">Nenhuma habilidade adicionada</p>
          <p className="text-xs text-app-muted mt-1">
            Clique em "Adicionar habilidade" para começar
          </p>
        </div>
      )}

      {habilidades.map((habilidade, index) => (
        <HabilidadeForm
          key={index}
          habilidade={habilidade}
          index={index}
          totalHabilidades={habilidades.length}
          onChange={(hab) => updateHabilidade(index, hab)}
          onRemove={() => removeHabilidade(index)}
          onMoveUp={() => moveHabilidade(index, 'up')}
          onMoveDown={() => moveHabilidade(index, 'down')}
        />
      ))}
    </div>
  );
}
