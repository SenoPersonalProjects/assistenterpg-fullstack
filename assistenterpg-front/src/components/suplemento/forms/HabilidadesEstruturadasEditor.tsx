'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

export type HabilidadeEstruturada = {
  nivel?: number;
  nome?: string;
  descricao?: string;
};

type Props = {
  label: string;
  value: HabilidadeEstruturada[];
  onChange: (value: HabilidadeEstruturada[]) => void;
  incluirNivel?: boolean;
  required?: boolean;
};

export function HabilidadesEstruturadasEditor({ label, value, onChange, incluirNivel, required }: Props) {
  const patch = (index: number, partial: HabilidadeEstruturada) =>
    onChange(value.map((item, current) => current === index ? { ...item, ...partial } : item));

  return (
    <section className="space-y-3 rounded-xl border border-app-border bg-app-bg/35 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-app-fg">{label}{required ? ' *' : ''}</p>
          <p className="text-xs text-app-muted">Adicione nome e descrição; cada entrada pode ser revisada sem editar JSON.</p>
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={() => onChange([...value, { nivel: incluirNivel ? 1 : undefined, nome: '', descricao: '' }])}>Adicionar</Button>
      </div>
      {value.map((habilidade, index) => (
        <div key={index} className="space-y-2 rounded-lg border border-app-border p-3">
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Input label="Nome" value={habilidade.nome ?? ''} onChange={(event) => patch(index, { nome: event.target.value })} />
            {incluirNivel ? <Input label="Nível" type="number" min={1} max={20} value={habilidade.nivel ?? 1} onChange={(event) => patch(index, { nivel: Number(event.target.value) || 1 })} /> : null}
          </div>
          <Textarea label="Descrição" rows={3} value={habilidade.descricao ?? ''} onChange={(event) => patch(index, { descricao: event.target.value })} />
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange(value.filter((_, current) => current !== index))}>Remover</Button>
        </div>
      ))}
    </section>
  );
}
