// src/components/suplemento/forms/tecnicas/VariacoesList.tsx

'use client';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { VariacaoForm } from './VariacaoForm';
import type { VariacaoHabilidade } from '@/lib/api/homebrews';

type Props = {
  variacoes: VariacaoHabilidade[];
  onChange: (variacoes: VariacaoHabilidade[]) => void;
};

export function VariacoesList({ variacoes, onChange }: Props) {
  function addVariacao() {
    const novaVariacao: VariacaoHabilidade = {
      nome: '',
      descricao: '',
      substituiCustos: false,
      ordem: variacoes.length + 1,
    };
    onChange([...variacoes, novaVariacao]);
  }

  function updateVariacao(index: number, variacao: Partial<VariacaoHabilidade>) {
    const novasVariacoes = [...variacoes];
    novasVariacoes[index] = { ...novasVariacoes[index], ...variacao };
    onChange(novasVariacoes);
  }

  function removeVariacao(index: number) {
    onChange(variacoes.filter((_, i) => i !== index));
  }

  function moveVariacao(index: number, direction: 'up' | 'down') {
    const novasVariacoes = [...variacoes];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= novasVariacoes.length) return;

    [novasVariacoes[index], novasVariacoes[targetIndex]] = [
      novasVariacoes[targetIndex],
      novasVariacoes[index],
    ];

    // Atualizar ordem
    novasVariacoes.forEach((v, idx) => {
      v.ordem = idx + 1;
    });

    onChange(novasVariacoes);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-app-fg flex items-center gap-2">
            <Icon name="sparkles" className="w-4 h-4 text-app-secondary" />
            Variações (Liberação Superior/Máxima)
          </h4>
          <p className="text-xs text-app-muted mt-1">
            Adicione versões melhoradas desta habilidade
          </p>
        </div>

        <Button type="button" size="sm" variant="secondary" onClick={addVariacao}>
          <Icon name="add" className="w-4 h-4 mr-1" />
          Adicionar variação
        </Button>
      </div>

      {variacoes.length === 0 && (
        <div className="p-4 border border-dashed border-app-border rounded-lg bg-app-muted-surface text-center">
          <p className="text-xs text-app-muted">Nenhuma variação adicionada</p>
        </div>
      )}

      {variacoes.map((variacao, index) => (
        <VariacaoForm
          key={index}
          variacao={variacao}
          index={index}
          totalVariacoes={variacoes.length}
          onChange={(v) => updateVariacao(index, v)}
          onRemove={() => removeVariacao(index)}
          onMoveUp={() => moveVariacao(index, 'up')}
          onMoveDown={() => moveVariacao(index, 'down')}
        />
      ))}
    </div>
  );
}
