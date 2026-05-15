'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArtigoContent } from '@/components/compendio/ArtigoContent';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  apiAdminAtualizarArtigo,
  type CompendioArtigoCompleto,
  type UpdateCompendioArtigoPayload,
} from '@/lib/utils/compendio';

type Props = {
  artigo: CompendioArtigoCompleto;
};

type FormState = {
  titulo: string;
  resumo: string;
  conteudo: string;
  tags: string;
  palavrasChave: string;
  nivelDificuldade: '' | 'iniciante' | 'intermediario' | 'avancado';
  destaque: boolean;
  ativo: boolean;
};

const SAFE_TEXT_BYTES = 50_000;

function splitCsv(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function createInitialState(artigo: CompendioArtigoCompleto): FormState {
  return {
    titulo: artigo.titulo,
    resumo: artigo.resumo ?? '',
    conteudo: artigo.conteudo,
    tags: Array.isArray(artigo.tags) ? artigo.tags.join(', ') : '',
    palavrasChave: artigo.palavrasChave ?? '',
    nivelDificuldade:
      artigo.nivelDificuldade === 'iniciante' ||
      artigo.nivelDificuldade === 'intermediario' ||
      artigo.nivelDificuldade === 'avancado'
        ? artigo.nivelDificuldade
        : '',
    destaque: artigo.destaque,
    ativo: artigo.ativo,
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Nao foi possivel salvar o artigo.';
}

export function CompendioArticleAdminActions({ artigo }: Props) {
  const { usuario } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(() => createInitialState(artigo));

  const isAdmin = usuario?.role === 'ADMIN';
  const conteudoBytes = useMemo(
    () => new TextEncoder().encode(form.conteudo).length,
    [form.conteudo],
  );
  const contentTooLarge = conteudoBytes > SAFE_TEXT_BYTES;

  if (!isAdmin) {
    return null;
  }

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const close = () => {
    if (saving) return;
    setOpen(false);
    setForm(createInitialState(artigo));
  };

  const save = async () => {
    if (!form.titulo.trim() || !form.conteudo.trim()) {
      showToast('Titulo e conteudo sao obrigatorios.', 'warning');
      return;
    }

    if (contentTooLarge) {
      showToast('O conteudo ultrapassa o limite seguro para o campo Text.', 'warning');
      return;
    }

    const payload: UpdateCompendioArtigoPayload = {
      titulo: form.titulo.trim(),
      resumo: form.resumo.trim() || undefined,
      conteudo: form.conteudo,
      tags: splitCsv(form.tags),
      palavrasChave: form.palavrasChave.trim() || undefined,
      nivelDificuldade: form.nivelDificuldade || undefined,
      destaque: form.destaque,
      ativo: form.ativo,
    };

    setSaving(true);
    try {
      await apiAdminAtualizarArtigo(artigo.id, payload);
      showToast('Artigo atualizado.', 'success');
      setOpen(false);
      router.refresh();
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Icon name="edit" className="mr-2 h-4 w-4" />
        Editar
      </Button>

      <Modal
        isOpen={open}
        onClose={close}
        title="Editar artigo do compendio"
        size="full"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={close} disabled={saving}>
              Cancelar
            </Button>
            <Button type="button" onClick={save} disabled={saving || contentTooLarge}>
              <Icon name={saving ? 'spinner' : 'save'} className="mr-2 h-4 w-4" />
              Salvar
            </Button>
          </>
        }
      >
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <Input
              label="Titulo"
              value={form.titulo}
              onChange={(event) => updateField('titulo', event.target.value)}
              maxLength={300}
            />

            <Textarea
              label="Resumo"
              value={form.resumo}
              onChange={(event) => updateField('resumo', event.target.value)}
              rows={3}
            />

            <Textarea
              label="Conteudo Markdown"
              value={form.conteudo}
              onChange={(event) => updateField('conteudo', event.target.value)}
              rows={18}
              error={contentTooLarge ? 'Conteudo acima do limite seguro.' : undefined}
              helperText={`${conteudoBytes.toLocaleString('pt-BR')} bytes / ${SAFE_TEXT_BYTES.toLocaleString('pt-BR')} bytes`}
              className="font-mono leading-relaxed"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Tags"
                value={form.tags}
                onChange={(event) => updateField('tags', event.target.value)}
                helperText="Separe por virgulas."
              />

              <Input
                label="Palavras-chave"
                value={form.palavrasChave}
                onChange={(event) => updateField('palavrasChave', event.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="block text-sm font-medium text-app-fg">
                  Dificuldade
                </span>
                <select
                  value={form.nivelDificuldade}
                  onChange={(event) =>
                    updateField(
                      'nivelDificuldade',
                      event.target.value as FormState['nivelDificuldade'],
                    )
                  }
                  className="w-full rounded border border-app-border bg-app-surface px-3 py-2 text-sm text-app-fg outline-none transition-colors focus:border-app-primary focus:ring-1 focus:ring-app-primary"
                >
                  <option value="">Sem nivel</option>
                  <option value="iniciante">iniciante</option>
                  <option value="intermediario">intermediario</option>
                  <option value="avancado">avancado</option>
                </select>
              </label>

              <div className="flex items-end gap-4">
                <Checkbox
                  checked={form.destaque}
                  onChange={(event) => updateField('destaque', event.target.checked)}
                  label="Destaque"
                />
                <Checkbox
                  checked={form.ativo}
                  onChange={(event) => updateField('ativo', event.target.checked)}
                  label="Ativo"
                />
              </div>
            </div>
          </div>

          <section className="min-h-[32rem] rounded-lg border border-app-border bg-app-bg p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-app-muted">
                Preview
              </h3>
              <span className="text-xs text-app-muted">Markdown renderizado</span>
            </div>
            <ArtigoContent conteudo={form.conteudo} titulo={form.titulo} />
          </section>
        </div>
      </Modal>
    </>
  );
}
