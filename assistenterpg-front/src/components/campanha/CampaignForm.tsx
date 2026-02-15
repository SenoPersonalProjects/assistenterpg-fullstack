'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { extrairMensagemErro, traduzirErro } from '@/lib/api/error-handler';

type Props = {
  onSubmit: (data: { nome: string; descricao?: string }) => Promise<void>;
};

export function CampaignForm({ onSubmit }: Props) {
  const { showToast } = useToast();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [nomeErro, setNomeErro] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      setNomeErro('Nome é obrigatório');
      return;
    }

    setNomeErro(null);
    setCreating(true);

    try {
      await onSubmit({
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
      });

      setNome('');
      setDescricao('');
      showToast('Campanha criada com sucesso!', 'success');
    } catch (error: any) {
      const status = Number(error?.status || error?.response?.status || error?.body?.statusCode || 0);

      if (status === 422) {
        const erroCampoNome = error?.body?.details?.nome;
        if (Array.isArray(erroCampoNome) && erroCampoNome.length > 0) {
          setNomeErro(String(erroCampoNome[0]));
          return;
        }

        const mensagem422 = traduzirErro(error?.body?.code, extrairMensagemErro(error), 422);
        setNomeErro(mensagem422);
        return;
      }

      const mensagemGlobal = traduzirErro(error?.body?.code, extrairMensagemErro(error), status);
      showToast(mensagemGlobal, 'error');
    } finally {
      setCreating(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Nome da campanha"
          value={nome}
          onChange={e => setNome(e.target.value)}
          error={nomeErro ?? undefined}
        />
        <Input
          label="Descrição"
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
        />
        <Button type="submit" disabled={creating}>
          {creating ? 'Criando...' : 'Criar campanha'}
        </Button>
      </form>
    </Card>
  );
}
