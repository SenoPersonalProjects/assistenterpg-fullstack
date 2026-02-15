// src/components/personagem-base/sections/AttributesDisplay.tsx
'use client';

import { Icon } from '@/components/ui/Icon';

interface AttributesDisplayProps {
  agilidade: number;
  forca: number;
  intelecto: number;
  presenca: number;
  vigor: number;
  atributoChave?: string; // 'INT' ou 'PRE'
}

export function AttributesDisplay({
  agilidade,
  forca,
  intelecto,
  presenca,
  vigor,
  atributoChave,
}: AttributesDisplayProps) {
  const atributos = [
    { codigo: 'AGI', valor: agilidade, nome: 'Agilidade' },
    { codigo: 'FOR', valor: forca, nome: 'Força' },
    { codigo: 'INT', valor: intelecto, nome: 'Intelecto' },
    { codigo: 'PRE', valor: presenca, nome: 'Presença' },
    { codigo: 'VIG', valor: vigor, nome: 'Vigor' },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {atributos.map((attr) => {
        const isChave = atributoChave === attr.codigo;

        const cardClass = [
          'rounded',
          'border',
          'bg-app-surface',
          'p-3',
          'text-center',
          'transition-shadow',
          isChave
            ? 'border-app-secondary ring-2 ring-app-secondary/60 shadow-lg' // ✅ Usando tokens
            : 'border-app-border',
        ].join(' ');

        return (
          <div key={attr.codigo} className={cardClass}>
            <p className="flex items-center justify-center gap-1 text-xs text-app-muted">
              <span>{attr.codigo}</span>
              {isChave && (
                <Icon
                  name="bolt"
                  className="h-3 w-3 text-app-secondary" // ✅ Usando token
                  aria-label="Atributo-chave de EA"
                />
              )}
            </p>

            <p className="text-2xl font-bold text-app-fg">{attr.valor}</p>

            <p className="mt-1 text-[10px] text-app-muted">{attr.nome}</p>

            {isChave && (
              <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-app-secondary/40 bg-app-secondary/10 px-2 py-0.5 text-[10px] text-app-secondary">
                <Icon name="bolt" className="h-3 w-3" />
                <span>Chave EA</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
