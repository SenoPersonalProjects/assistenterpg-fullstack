'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { extrairMensagemErro, traduzirErro } from '@/lib/api/error-handler';

type Props = {
  onSubmit: (data: { nome: string; descricao?: string }) => Promise<void>;
};

type CampaignFormError = {
  status?: number;
  response?: { status?: number };
  body?: {
    statusCode?: number;
    code?: string;
    details?: { nome?: string[] };
  };
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
    } catch (error: unknown) {
      const err = error as CampaignFormError;
      const status = Number(err.status || err.response?.status || err.body?.statusCode || 0);

      if (status === 422) {
        const erroCampoNome = err.body?.details?.nome;
        if (Array.isArray(erroCampoNome) && erroCampoNome.length > 0) {
          setNomeErro(String(erroCampoNome[0]));
          return;
        }

        const mensagem422 = traduzirErro(err.body?.code, extrairMensagemErro(error), 422);
        setNomeErro(mensagem422);
        return;
      }

      const mensagemGlobal = traduzirErro(err.body?.code, extrairMensagemErro(error), status);
      showToast(mensagemGlobal, 'error');
    } finally {
      setCreating(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        label="Nome da campanha"
        placeholder="Ex.: Caçada em Shibuya"
        value={nome}
        onChange={e => setNome(e.target.value)}
        error={nomeErro ?? undefined}
      />
      <Textarea
        label="Descrição (opcional)"
        placeholder="Fale sobre a premissa, tom da campanha e objetivos."
        value={descricao}
        onChange={e => setDescricao(e.target.value)}
        rows={3}
        helperText="Essa descrição aparece no resumo e na pré-visualização."
      />
      <Button type="submit" disabled={creating}>
        {creating ? 'Criando...' : 'Criar campanha'}
      </Button>
    </form>
  );
}
