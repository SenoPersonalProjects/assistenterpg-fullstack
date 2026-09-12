'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

const MECANICAS_CONHECIDAS = [
  { value: 'custoPE', label: 'Custo de PE' },
  { value: 'custoEA', label: 'Custo de EA' },
  { value: 'dano', label: 'Dano' },
  { value: 'alcance', label: 'Alcance' },
  { value: 'duracao', label: 'Duração' },
  { value: 'limiteUso', label: 'Limite de uso' },
  { value: 'efeitoContinuo', label: 'Efeito contínuo' },
] as const;

type MecanicaItem = {
  chave: string;
  valor: unknown;
};

type Props = {
  value: unknown;
  onChange: (value: string | Record<string, unknown>) => void;
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

function ehMecanicaConhecida(chave: string): boolean {
  return MECANICAS_CONHECIDAS.some((item) => item.value === chave);
}

function paraRegistro(itens: MecanicaItem[]): Record<string, unknown> {
  return itens.reduce<Record<string, unknown>>((resultado, item) => {
    const chave = item.chave.trim();
    if (chave) resultado[chave] = item.valor;
    return resultado;
  }, {});
}

export function MecanicasEstruturadasEditor({ value, onChange }: Props) {
  const estruturado = ehRegistro(value);
  const textoLivre = typeof value === 'string' ? value : '';
  const itens = estruturado
    ? Object.entries(value).map(([chave, valor]) => ({ chave, valor }))
    : [];

  function atualizarItens(proximosItens: MecanicaItem[]) {
    onChange(paraRegistro(proximosItens));
  }

  if (!estruturado) {
    return (
      <section className="space-y-2 rounded-xl border border-app-border bg-app-bg/35 p-3">
        <Textarea
          label="Mecânicas especiais"
          value={textoLivre}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Descreva custos, limites ou efeitos que precisem de atenção."
          helperText="Use texto claro para regras descritivas ou organize os dados em campos estruturados."
          rows={4}
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => atualizarItens(textoLivre.trim() ? [{ chave: 'outro', valor: textoLivre }] : [])}
        >
          Organizar mecânicas
        </Button>
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-xl border border-app-border bg-app-bg/35 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-app-fg">Mecânicas especiais</p>
          <p className="text-xs text-app-muted">
            Selecione uma mecânica comum ou use “Outro” para uma regra específica.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => atualizarItens([...itens, { chave: 'custoPE', valor: '' }])}
        >
          Adicionar
        </Button>
      </div>

      {itens.length === 0 && <p className="text-sm text-app-muted">Nenhuma mecânica informada.</p>}

      {itens.map((item, index) => {
        const conhecida = ehMecanicaConhecida(item.chave);
        return (
          <div key={`${item.chave}-${index}`} className="grid gap-2 rounded-lg border border-app-border p-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_auto]">
            <Select
              label="Tipo"
              value={conhecida ? item.chave : 'OUTRO'}
              onChange={(event) => {
                const proximaChave = event.target.value === 'OUTRO' ? 'outro' : event.target.value;
                atualizarItens(
                  itens.map((atual, atualIndex) =>
                    atualIndex === index ? { ...atual, chave: proximaChave } : atual,
                  ),
                );
              }}
            >
              {MECANICAS_CONHECIDAS.map((opcao) => (
                <option key={opcao.value} value={opcao.value}>
                  {opcao.label}
                </option>
              ))}
              <option value="OUTRO">Outro</option>
            </Select>
            <Input
              label={conhecida ? 'Valor' : 'Regra'}
              value={valorParaTexto(item.valor)}
              onChange={(event) =>
                atualizarItens(
                  itens.map((atual, atualIndex) =>
                    atualIndex === index ? { ...atual, valor: event.target.value } : atual,
                  ),
                )
              }
              placeholder={conhecida ? 'Ex.: 2' : 'Ex.: Escolha um alvo adicional'}
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
