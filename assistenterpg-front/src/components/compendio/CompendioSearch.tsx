'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type CompendioSearchProps = {
  livroCodigo?: string;
  initialQuery?: string;
  placeholder?: string;
  showSubmit?: boolean;
  className?: string;
  inputLabel?: string;
};

export function CompendioSearch({
  livroCodigo,
  initialQuery = '',
  placeholder,
  showSubmit = true,
  className = '',
  inputLabel = 'Busca',
}: CompendioSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  const trimmedQuery = query.trim();
  const siglasValidas = ['PV', 'PE', 'EA', 'DT', 'RD'];
  const tooShort =
    trimmedQuery.length > 0 &&
    trimmedQuery.length < 3 &&
    !siglasValidas.includes(trimmedQuery.toUpperCase());

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();

    if (!tooShort && trimmedQuery) {
      const params = new URLSearchParams({ q: trimmedQuery });
      if (livroCodigo) params.set('livroCodigo', livroCodigo);
      router.push(`/compendio/busca?${params.toString()}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className={[
        showSubmit
          ? 'grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end'
          : 'block',
        className,
      ].join(' ')}
    >
      <Input
        label={inputLabel}
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder ?? (livroCodigo ? 'Buscar neste livro...' : 'Buscar no compêndio...')}
        icon="search"
        minLength={2}
        helperText={tooShort ? 'Digite pelo menos 3 caracteres ou uma sigla oficial, como PV ou DT.' : undefined}
        rightIcon={query.length > 0 ? 'close' : undefined}
        rightIconLabel="Limpar busca"
        onRightIconClick={() => setQuery('')}
      />

      {showSubmit ? (
        <Button type="submit" size="md" disabled={tooShort}>
          Buscar
        </Button>
      ) : null}
    </form>
  );
}
