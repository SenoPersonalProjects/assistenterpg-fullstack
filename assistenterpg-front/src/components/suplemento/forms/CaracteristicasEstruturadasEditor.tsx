'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

type Caracteristica = Record<string, unknown> & {
  nome?: string;
  descricao?: string;
};

type Props = {
  value: unknown[] | string | undefined;
  onChange: (value: Caracteristica[] | string) => void;
};

function normalizarCaracteristica(value: unknown, index: number): Caracteristica {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const registro = value as Record<string, unknown>;
    return {
      ...registro,
      nome: typeof registro.nome === 'string' ? registro.nome : `Característica ${index + 1}`,
      descricao: typeof registro.descricao === 'string' ? registro.descricao : '',
    };
  }

  return {
    nome: `Característica ${index + 1}`,
    descricao: typeof value === 'string' ? value : '',
  };
}

export function CaracteristicasEstruturadasEditor({ value, onChange }: Props) {
  if (!Array.isArray(value)) {
    const textoLivre = value ?? '';
    return (
      <section className="space-y-2 rounded-xl border border-app-border bg-app-bg/35 p-3">
        <Textarea
          label="Características do clã"
          value={textoLivre}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Descreva as características do clã."
          helperText="Use uma descrição livre ou organize as características em uma lista detalhada."
          rows={4}
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() =>
            onChange(textoLivre.trim() ? [{ nome: 'Característica', descricao: textoLivre }] : [])
          }
        >
          Organizar em lista
        </Button>
      </section>
    );
  }

  const caracteristicas = value.map(normalizarCaracteristica);
  const atualizar = (proximas: Caracteristica[]) => onChange(proximas);

  return (
    <section className="space-y-3 rounded-xl border border-app-border bg-app-bg/35 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-app-fg">Características do clã</p>
          <p className="text-xs text-app-muted">
            Adicione nome e descrição para cada característica, sem editar JSON.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => atualizar([...caracteristicas, { nome: '', descricao: '' }])}
        >
          Adicionar
        </Button>
      </div>

      {caracteristicas.length === 0 && (
        <p className="text-sm text-app-muted">Nenhuma característica cadastrada.</p>
      )}

      {caracteristicas.map((caracteristica, index) => (
        <div key={index} className="space-y-2 rounded-lg border border-app-border p-3">
          <Input
            label="Nome"
            value={caracteristica.nome ?? ''}
            onChange={(event) =>
              atualizar(
                caracteristicas.map((atual, atualIndex) =>
                  atualIndex === index ? { ...atual, nome: event.target.value } : atual,
                ),
              )
            }
          />
          <Textarea
            label="Descrição"
            rows={3}
            value={caracteristica.descricao ?? ''}
            onChange={(event) =>
              atualizar(
                caracteristicas.map((atual, atualIndex) =>
                  atualIndex === index ? { ...atual, descricao: event.target.value } : atual,
                ),
              )
            }
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => atualizar(caracteristicas.filter((_, atualIndex) => atualIndex !== index))}
          >
            Remover
          </Button>
        </div>
      ))}

      <Button type="button" size="sm" variant="ghost" onClick={() => onChange('')}>
        Usar descrição livre
      </Button>
    </section>
  );
}
