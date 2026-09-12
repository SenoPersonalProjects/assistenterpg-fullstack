'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

const REQUISITOS_CONHECIDOS = [
  { value: 'nivel', label: 'Nível' },
  { value: 'classe', label: 'Classe' },
  { value: 'tecnica', label: 'Técnica' },
  { value: 'grau', label: 'Grau de aprimoramento' },
  { value: 'pericia', label: 'Perícia' },
  { value: 'proficiencia', label: 'Proficiência' },
] as const;

type RequisitoItem = {
  chave: string;
  valor: unknown;
};

type Props = {
  value: unknown;
  onChange: (value: string | Record<string, unknown>) => void;
  helperText?: string;
};

function ehRegistro(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function valorParaTexto(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function paraItens(value: Record<string, unknown>): RequisitoItem[] {
  return Object.entries(value).map(([chave, valor]) => ({ chave, valor }));
}

function paraRegistro(itens: RequisitoItem[]): Record<string, unknown> {
  return itens.reduce<Record<string, unknown>>((resultado, item) => {
    const chave = item.chave.trim();
    if (chave) resultado[chave] = item.valor;
    return resultado;
  }, {});
}

function ehRequisitoConhecido(chave: string): boolean {
  return REQUISITOS_CONHECIDOS.some((item) => item.value === chave);
}

export function RequisitosEstruturadosEditor({ value, onChange, helperText }: Props) {
  const estruturado = ehRegistro(value);
  const itens = estruturado ? paraItens(value) : [];
  const textoLivre = typeof value === 'string' ? value : '';

  function atualizarItens(proximosItens: RequisitoItem[]) {
    onChange(paraRegistro(proximosItens));
  }

  function estruturarRequisitos() {
    onChange(textoLivre.trim() ? { outro: textoLivre.trim() } : {});
  }

  if (!estruturado) {
    return (
      <section className="space-y-2 rounded-xl border border-app-border bg-app-bg/35 p-3">
        <Textarea
          label="Requisitos"
          value={textoLivre}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Ex.: Nível 5 e grau 2 em Técnica Amaldiçoada."
          helperText={helperText ?? 'Descreva os pré-requisitos em linguagem clara.'}
          rows={3}
        />
        <Button type="button" size="sm" variant="secondary" onClick={estruturarRequisitos}>
          Adicionar requisitos estruturados
        </Button>
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-xl border border-app-border bg-app-bg/35 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-app-fg">Requisitos</p>
          <p className="text-xs text-app-muted">
            Selecione regras conhecidas ou use “Outro” para uma condição descritiva.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => atualizarItens([...itens, { chave: 'nivel', valor: '' }])}
        >
          Adicionar
        </Button>
      </div>

      {itens.length === 0 && (
        <p className="text-sm text-app-muted">Nenhum requisito estruturado informado.</p>
      )}

      {itens.map((item, index) => {
        const conhecido = ehRequisitoConhecido(item.chave);
        return (
          <div key={`${item.chave}-${index}`} className="grid gap-2 rounded-lg border border-app-border p-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_auto]">
            <Select
              label="Tipo"
              value={conhecido ? item.chave : 'OUTRO'}
              onChange={(event) => {
                const proximaChave = event.target.value === 'OUTRO' ? 'outro' : event.target.value;
                atualizarItens(
                  itens.map((atual, atualIndex) =>
                    atualIndex === index ? { ...atual, chave: proximaChave } : atual,
                  ),
                );
              }}
            >
              {REQUISITOS_CONHECIDOS.map((opcao) => (
                <option key={opcao.value} value={opcao.value}>
                  {opcao.label}
                </option>
              ))}
              <option value="OUTRO">Outro</option>
            </Select>
            <Input
              label={conhecido ? 'Valor' : 'Condição'}
              value={valorParaTexto(item.valor)}
              onChange={(event) =>
                atualizarItens(
                  itens.map((atual, atualIndex) =>
                    atualIndex === index ? { ...atual, valor: event.target.value } : atual,
                  ),
                )
              }
              placeholder={conhecido ? 'Ex.: 5' : 'Ex.: Origem Kyoto'}
            />
            <div className="flex items-end">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => atualizarItens(itens.filter((_, atualIndex) => atualIndex !== index))}
              >
                Remover
              </Button>
            </div>
          </div>
        );
      })}

      <Button type="button" size="sm" variant="ghost" onClick={() => onChange('')}>
        Usar descrição livre
      </Button>
    </section>
  );
}
