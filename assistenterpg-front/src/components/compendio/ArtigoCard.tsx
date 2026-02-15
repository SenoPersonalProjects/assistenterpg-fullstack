// components/compendio/ArtigoCard.tsx
'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Artigo } from '@/lib/utils/compendio';

interface ArtigoCardProps {
  artigo: Artigo;
  categoriaCodigo: string;
  subcategoriaCodigo: string;
}

export function ArtigoCard({ artigo, categoriaCodigo, subcategoriaCodigo }: ArtigoCardProps) {
  const nivelCores = {
    iniciante: 'green',
    intermediario: 'yellow',
    avancado: 'red',
  } as const;

  return (
    <Link href={`/compendio/${categoriaCodigo}/${subcategoriaCodigo}/${artigo.codigo}`}>
      <Card className="hover:border-app-primary transition-colors cursor-pointer h-full">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-app-fg flex-1">{artigo.titulo}</h3>
          {artigo.destaque && <Badge color="purple" size="sm">Destaque</Badge>}
        </div>
        
        {artigo.resumo && (
          <p className="text-sm text-app-muted mb-3 line-clamp-3">{artigo.resumo}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {artigo.nivelDificuldade && (
            <Badge 
              color={nivelCores[artigo.nivelDificuldade as keyof typeof nivelCores] || 'gray'} 
              size="sm"
            >
              {artigo.nivelDificuldade}
            </Badge>
          )}
          {artigo.tags && artigo.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} color="gray" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      </Card>
    </Link>
  );
}
