// components/compendio/CompendioSearch.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';

export function CompendioSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 3) {
      router.push(`/compendio/busca?q=${encodeURIComponent(query)}`); // ✅ CORRIGIDO: busca (não buscar)
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar no compêndio..."
        className="w-full px-4 py-2 pl-10 bg-app-surface border border-app-border rounded-lg text-app-fg placeholder:text-app-muted focus:outline-none focus:border-app-primary"
        minLength={3}
      />
      <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-app-muted" />
      {query.length > 0 && query.length < 3 && (
        <p className="text-xs text-app-muted mt-1 ml-1">
          Digite pelo menos 3 caracteres para buscar
        </p>
      )}
    </form>
  );
}
