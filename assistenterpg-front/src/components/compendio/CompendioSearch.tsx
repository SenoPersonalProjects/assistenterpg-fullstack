'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';

type CompendioSearchProps = {
  livroCodigo?: string;
};

export function CompendioSearch({ livroCodigo }: CompendioSearchProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();

    if (query.trim().length >= 3) {
      const params = new URLSearchParams({ q: query.trim() });
      if (livroCodigo) params.set('livroCodigo', livroCodigo);
      router.push(`/compendio/busca?${params.toString()}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={livroCodigo ? 'Buscar neste livro...' : 'Buscar no compendio...'}
        className="w-full rounded-lg border border-app-border bg-app-surface px-4 py-2 pl-10 text-app-fg placeholder:text-app-muted focus:border-app-primary focus:outline-none"
        minLength={3}
      />
      <Icon
        name="search"
        className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-app-muted"
      />
      {query.length > 0 && query.length < 3 ? (
        <p className="ml-1 mt-1 text-xs text-app-muted">
          Digite pelo menos 3 caracteres para buscar
        </p>
      ) : null}
    </form>
  );
}
