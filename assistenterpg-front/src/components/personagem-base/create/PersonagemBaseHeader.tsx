// components/personagem-base/PersonagemBaseHeader.tsx
'use client';

import { Badge } from '@/components/ui/Badge';

type Size = 'sm' | 'md';

type Props = {
  nome: string;
  nivel: number;
  claNome: string;
  classeNome: string;
  size?: Size;
  rightContent?: React.ReactNode;
};

export function PersonagemBaseHeader({
  nome,
  nivel,
  claNome,
  classeNome,
  size = 'md',
  rightContent,
}: Props) {
  const titleClass = size === 'sm' ? 'text-base' : 'text-2xl';
  const subtitleClass = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className={`${titleClass} font-bold text-app-fg`}>{nome}</h1>
        <p className={`${subtitleClass} text-app-muted`}>
          Nível {nivel} • {claNome} • {classeNome}
        </p>
      </div>
      {rightContent ?? <Badge color="blue">Personagem-base</Badge>}
    </header>
  );
}
