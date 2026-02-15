// components/personagem-base/PersonagemBaseBasicInfo.tsx
'use client';

import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { SectionCard } from '@/components/ui/SectionCard';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/EmptyState';

type BasicInfoProps = {
  nome: string;
  nivel: number;
  estudouEscolaTecnica: boolean;
  erroNome?: string;
  onChangeNome: (nome: string) => void;
  onChangeNivel: (nivel: number) => void;
  onChangeEstudouEscolaTecnica: (v: boolean) => void;
};

export function PersonagemBaseBasicInfo({
  nome,
  nivel,
  estudouEscolaTecnica,
  erroNome,
  onChangeNome,
  onChangeNivel,
  onChangeEstudouEscolaTecnica,
}: BasicInfoProps) {
  return (
    <SectionCard
      title="Dados básicos"
      right={<Icon name="info" className="h-5 w-5 text-app-muted" />}
      contentClassName="space-y-4"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Input
          label="Nome do personagem"
          placeholder="Ex: Yuji Itadori"
          value={nome}
          onChange={(e) => onChangeNome(e.target.value)}
          error={erroNome}
        />

        <Input
          label="Nível"
          type="number"
          min={1}
          value={nivel}
          onChange={(e) => onChangeNivel(Number(e.target.value) || 1)}
        />

        <div className="rounded border border-app-border bg-app-surface p-3">
          <Checkbox
            label="Estudou na Escola Técnica de Jujutsu"
            checked={estudouEscolaTecnica}
            onChange={(e) => onChangeEstudouEscolaTecnica(e.target.checked)}
          />

          {estudouEscolaTecnica ? (
            <p className="mt-2 text-xs text-app-success">
              ✓ Você receberá +1 grau em Técnica Amaldiçoada e treinamento na perícia Jujutsu.
            </p>
          ) : (
            <EmptyState
              className="mt-2"
              description="Marque esta opção se o personagem estudou na Escola Técnica."
            />
          )}
        </div>
      </div>
    </SectionCard>
  );
}
