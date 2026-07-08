'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useToast } from '@/context/ToastContext';
import { criarErroUsuario } from '@/lib/api/error-handler';

type Props = {
  onSubmit: (data: { nome: string; descricao?: string }) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
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

export function CampaignForm({
  onSubmit,
  onCancel,
  submitLabel = 'Criar campanha',
  cancelLabel = 'Cancelar',
}: Props) {
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
    } catch (error: unknown) {
      const err = error as CampaignFormError;
      const status = Number(err.status || err.response?.status || err.body?.statusCode || 0);

      if (status === 422) {
        const erroCampoNome = err.body?.details?.nome;
        if (Array.isArray(erroCampoNome) && erroCampoNome.length > 0) {
          setNomeErro(String(erroCampoNome[0]));
          return;
        }

        const mensagem422 = criarErroUsuario(error).message;
        setNomeErro(mensagem422);
        return;
      }

      showToast(criarErroUsuario(error), 'error');
    } finally {
      setCreating(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-white/5 bg-app-surface/45 p-4 md:p-5"
    >
      <SectionHeader
        icon="campaign"
        title="Informações da campanha"
        description="Defina a base da mesa. Membros, personagens e sessões entram depois."
      />

      <div className="grid gap-4">
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
          rows={4}
          helperText="Essa descrição aparece no resumo e na pré-visualização."
        />
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-white/5 pt-4 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={creating}>
            {cancelLabel}
          </Button>
        ) : null}
        <Button type="submit" disabled={creating}>
          {creating ? 'Criando...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
