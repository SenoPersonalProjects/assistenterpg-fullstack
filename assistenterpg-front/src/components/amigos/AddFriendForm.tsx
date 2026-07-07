'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type Props = {
  onSubmit: (identificador: string) => Promise<void>;
};

export function AddFriendForm({ onSubmit }: Props) {
  const [identificador, setIdentificador] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);

    const valor = identificador.trim();
    if (!valor) {
      setErro('Informe email ou apelido.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(valor);
      setIdentificador('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <Input
        label="Email ou apelido"
        placeholder="Informe o identificador exato"
        icon="search"
        value={identificador}
        error={erro ?? undefined}
        helperText="A busca é exata para preservar a privacidade dos usuários."
        onChange={(event) => setIdentificador(event.target.value)}
      />
      <Button type="submit" disabled={loading} className="w-full lg:w-auto">
        {loading ? 'Enviando...' : 'Enviar solicitação'}
      </Button>
    </form>
  );
}
