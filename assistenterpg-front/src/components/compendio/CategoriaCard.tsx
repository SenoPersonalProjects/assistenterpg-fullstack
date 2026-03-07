// components/compendio/CategoriaCard.tsx
'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';
import type { CompendioCategoria as Categoria } from '@/lib/utils/compendio';

interface CategoriaCardProps {
  categoria: Categoria;
}

// Helper para validar se o ícone existe
function isValidIcon(icon: string | null): icon is IconName {
  if (!icon) return false;
  const validIcons: IconName[] = [
    'bell', 'search', 'back', 'add', 'close', 'delete', 'edit', 'check',
    'campaign', 'characters', 'settings', 'rules', 'info', 'chart', 'heart',
    'bolt', 'sparkles', 'shield', 'training', 'skills', 'tools', 'id', 'tag',
    'list', 'warning', 'error', 'eye', 'eyeOff', 'copy', 'copyDone',
    'externalLink', 'refresh', 'home', 'folder', 'document', 'chat',
    'success', 'fail', 'fire', 'beaker', 'hand', 'map', 'code', 'star'
  ];
  return validIcons.includes(icon as IconName);
}

export function CategoriaCard({ categoria }: CategoriaCardProps) {
  // Validar e usar ícone padrão se inválido
  const iconName: IconName = isValidIcon(categoria.icone) 
    ? categoria.icone 
    : 'rules'; // ícone padrão para compêndio

  return (
    <Link href={`/compendio/${categoria.codigo}`}>
      <Card className="hover:border-app-primary transition-colors cursor-pointer h-full">
        <div className="flex items-start gap-3">
          <Icon name={iconName} className="h-6 w-6 text-app-primary flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-app-fg mb-1">{categoria.nome}</h3>
            {categoria.descricao && (
              <p className="text-sm text-app-muted line-clamp-2">{categoria.descricao}</p>
            )}
            {categoria.subcategorias && categoria.subcategorias.length > 0 && (
              <p className="text-xs text-app-muted mt-2">
                {categoria.subcategorias.length} subcategoria(s)
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
