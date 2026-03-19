'use client';

import { useState } from 'react';
import { extrairMensagemErro } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

type Props = {
  onInvite: (data: { email: string; papel: 'MESTRE' | 'JOGADOR' | 'OBSERVADOR' }) => Promise<void>;
};

const PAPEL_OPTIONS = [
  { value: 'JOGADOR', label: 'Jogador' },
  { value: 'OBSERVADOR', label: 'Observador' },
  { value: 'MESTRE', label: 'Mestre' },
];

export function InviteMemberForm({ onInvite }: Props) {
  const [email, setEmail] = useState('');
  const [papel, setPapel] = useState<'MESTRE' | 'JOGADOR' | 'OBSERVADOR'>('JOGADOR');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (!email.trim()) {
      setErro('Informe um e-mail');
      return;
    }

    setLoading(true);
    try {
      await onInvite({ email: email.trim(), papel });
      setSucesso('Convite enviado');
      setEmail('');
    } catch (error) {
      const mensagem =
        error instanceof Error && error.message
          ? error.message
          : extrairMensagemErro(error);
      setErro(mensagem);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        label="E-mail do convidado"
        type="email"
        placeholder="ex.: jogador@dominio.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
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
      {erro && <p className="text-sm text-app-danger">{erro}</p>}
      {sucesso && <p className="text-sm text-app-success">{sucesso}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar convite'}
      </Button>
    </form>
  );
}
