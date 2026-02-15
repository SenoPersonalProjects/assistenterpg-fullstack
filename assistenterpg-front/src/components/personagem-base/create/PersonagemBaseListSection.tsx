// components/personagem-base/PersonagemBaseListSection.tsx
'use client';

import { SectionTitle } from '@/components/ui/SectionTitle';
import type { PersonagemBaseResumo } from '@/lib/api';
import { PersonagemBaseListItem } from './PersonagemBaseListItem';

type Props = {
  personagens: PersonagemBaseResumo[];
  erro?: string | null;
};

export function PersonagemBaseListSection({ personagens, erro }: Props) {
  return (
    <section>
      <SectionTitle>Lista</SectionTitle>
      {erro && <p className="text-sm text-app-danger mb-2">{erro}</p>}
      {personagens.length === 0 ? (
        <p className="text-sm text-app-muted">
          Você ainda não possui personagens-base.
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {personagens.map(p => (
            <li key={p.id}>
              <PersonagemBaseListItem personagem={p} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
