// components/personagem-base/PersonagemBaseListItem.tsx
'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import type { PersonagemBaseResumo } from '@/lib/api';
import { PersonagemBaseHeader } from './PersonagemBaseHeader';

type Props = {
  personagem: PersonagemBaseResumo;
  onClick?: () => void;
  onDelete?: () => void; // ✅ Nova prop opcional
};

export function PersonagemBaseListItem({ personagem, onClick, onDelete }: Props) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <Card
      onClick={onClick}
      className={`px-4 py-3 hover:border-app-primary transition-colors ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <PersonagemBaseHeader
        size="sm"
        nome={personagem.nome}
        nivel={personagem.nivel}
        claNome={personagem.cla}
        classeNome={personagem.classe}
        rightContent={
          onDelete ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-app-danger hover:bg-app-danger/10"
              title="Excluir personagem-base"
            >
              <Icon name="delete" className="w-4 h-4" />
            </Button>
          ) : null
        }
      />
    </Card>
  );
}
