// components/compendio/SubcategoriaCard.tsx
'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { CompendioSubcategoriaComArtigo } from '@/lib/utils/compendio'; // ✅ Tipo corrigido

interface SubcategoriaCardProps {
  subcategoria: CompendioSubcategoriaComArtigo; // ✅ Tipo específico com artigos
  categoriaCodigo: string;
}

export function SubcategoriaCard({ subcategoria, categoriaCodigo }: SubcategoriaCardProps) {
  const totalArtigos = subcategoria.artigos?.length || 0; // ✅ Tipo seguro

  return (
    <Link href={`/compendio/${categoriaCodigo}/${subcategoria.codigo}`}>
      <Card className="hover:border-app-primary transition-colors cursor-pointer h-full">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-app-fg flex-1 pr-2">{subcategoria.nome}</h3>
          {subcategoria.categoria?.cor && (
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: subcategoria.categoria.cor }}
            />
          )}
        </div>
        
        {subcategoria.descricao && (
          <p className="text-sm text-app-muted mb-3 line-clamp-2">{subcategoria.descricao}</p>
        )}
        
        {totalArtigos > 0 && (
          <Badge color="blue" size="sm">
            {totalArtigos} artigo{subcategoria.artigos!.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </Card>
    </Link>
  );
}
