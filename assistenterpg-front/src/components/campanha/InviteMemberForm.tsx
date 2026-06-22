'use client';

import { useState } from 'react';
import { criarErroUsuario } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import type { UserErrorState } from '@/lib/types';

type Props = {
  onInvite: (data: { email?: string; apelido?: string; papel: 'MESTRE' | 'JOGADOR' | 'OBSERVADOR' }) => Promise<void>;
};

const PAPEL_OPTIONS = [
  { value: 'JOGADOR', label: 'Jogador' },
  { value: 'OBSERVADOR', label: 'Observador' },
  { value: 'MESTRE', label: 'Mestre' },
];

export function InviteMemberForm({ onInvite }: Props) {
  const [destino, setDestino] = useState('');
  const [papel, setPapel] = useState<'MESTRE' | 'JOGADOR' | 'OBSERVADOR'>('JOGADOR');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<UserErrorState | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (!destino.trim()) {
      setErro('Informe um email ou usuário');
      return;
    }

    setLoading(true);
    try {
      const destinoLimpo = destino.trim();
      await onInvite(
        destinoLimpo.includes('@')
          ? { email: destinoLimpo, papel }
          : { apelido: destinoLimpo, papel },
      );
      setSucesso('Convite enviado');
      setDestino('');
    } catch (error) {
      const mensagem =
        error instanceof Error && error.message
          ? error.message
          : criarErroUsuario(error);
      setErro(mensagem);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        label="Email ou usuário do convidado"
        placeholder="ex.: jogador@domínio.com ou apelido"
        value={destino}
        onChange={e => setDestino(e.target.value)}
      />
      <Select
        label="Papel na campanha"
        value={papel}
        onChange={e =>
          setPapel(e.target.value as 'MESTRE' | 'JOGADOR' | 'OBSERVADOR')
        }
        options={PAPEL_OPTIONS}
        helperText="Mestres podem gerenciar sessões, jogadores atuam nas cenas, observadores só assistem."
      />
      {erro ? <ErrorAlert message={erro} /> : null}
      {sucesso && <p className="text-sm text-app-success">{sucesso}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar convite'}
      </Button>
    </form>
  );
}
