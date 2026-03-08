'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  apiAdminGetCondicoes,
  apiAdminCreateCondicao,
  apiAdminUpdateCondicao,
  apiAdminDeleteCondicao,
  extrairMensagemErro,
  type CondicaoCatalogo,
  type CreateCondicaoPayload,
  type UpdateCondicaoPayload,
} from '@/lib/api';

type CondicaoFormState = {
  nome: string;
  descricao: string;
};

function buildFormState(item?: CondicaoCatalogo | null): CondicaoFormState {
  return {
    nome: item?.nome ?? '',
    descricao: item?.descricao ?? '',
  };
}

type ModalProps = {
  isOpen: boolean;
  onClose: (success?: boolean) => void;
  item?: CondicaoCatalogo | null;
};

function CondicaoFormModal({ isOpen, onClose, item }: ModalProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<CondicaoFormState>(buildFormState(item));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(item?.id);

  useEffect(() => {
    if (!isOpen) return;
    setForm(buildFormState(item));
    setErrors({});
  }, [isOpen, item]);

  function setField<K extends keyof CondicaoFormState>(key: K, value: CondicaoFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    const nome = form.nome.trim();
    const descricao = form.descricao.trim();

    if (!nome) next.nome = 'Nome e obrigatorio.';
    else if (nome.length < 3) next.nome = 'Nome deve ter no minimo 3 caracteres.';

    if (!descricao) next.descricao = 'Descricao e obrigatoria.';
    else if (descricao.length < 10) next.descricao = 'Descricao deve ter no minimo 10 caracteres.';

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    const payload: CreateCondicaoPayload = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim(),
    };

    try {
      setSaving(true);
      if (isEditing && item?.id) {
        const payloadUpdate: UpdateCondicaoPayload = payload;
        await apiAdminUpdateCondicao(item.id, payloadUpdate);
        showToast('Condicao atualizada com sucesso.', 'success');
      } else {
        await apiAdminCreateCondicao(payload);
        showToast('Condicao criada com sucesso.', 'success');
      }
      onClose(true);
    } catch (error) {
      showToast(extrairMensagemErro(error), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      title={isEditing ? 'Editar condicao' : 'Nova condicao'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={() => onClose(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Icon name="loading" className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Nome *"
          value={form.nome}
          onChange={(e) => setField('nome', e.target.value)}
          error={errors.nome}
        />
        <Textarea
          label="Descricao *"
          rows={5}
          value={form.descricao}
          onChange={(e) => setField('descricao', e.target.value)}
          error={errors.descricao}
        />
      </div>
    </Modal>
  );
}

export function CondicoesAdminPanel() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [items, setItems] = useState<CondicaoCatalogo[]>([]);
  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CondicaoCatalogo | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return items;
    return items.filter((item) =>
      [item.nome, item.descricao].join(' ').toLowerCase().includes(termo),
    );
  }, [items, busca]);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = await apiAdminGetCondicoes();
      setItems(data);
    } catch (error) {
      const mensagem = extrairMensagemErro(error);
      setErro(mensagem);
      showToast(mensagem, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  async function handleDelete(item: CondicaoCatalogo) {
    if (!window.confirm(`Excluir condicao "${item.nome}"?`)) return;

    try {
      setDeletingId(item.id);
      const resposta = await apiAdminDeleteCondicao(item.id);
      showToast(resposta.message || 'Condicao removida com sucesso.', 'success');
      await carregarDados();
    } catch (error) {
      showToast(extrairMensagemErro(error), 'error');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <Input
            label="Buscar"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            icon="search"
            placeholder="Nome ou descricao..."
          />
          <Button
            variant="primary"
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
          >
            <Icon name="add" className="w-4 h-4 mr-1" />
            Nova condicao
          </Button>
        </div>
      </Card>

      {erro && <ErrorAlert message={erro} />}

      <Card>
        {loading ? (
          <Loading message="Carregando condicoes..." className="py-8 text-app-fg" />
        ) : filtrados.length === 0 ? (
          <EmptyState
            variant="card"
            icon="status"
            title="Nenhuma condicao encontrada"
            description="Ajuste a busca ou crie uma nova condicao."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-app-border text-left text-app-muted">
                  <th className="py-2 pr-2">ID</th>
                  <th className="py-2 pr-2">Nome</th>
                  <th className="py-2 pr-2">Uso em sessoes</th>
                  <th className="py-2 pr-2">Descricao</th>
                  <th className="py-2 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((item) => {
                  const usos = item._count?.condicoesPersonagemSessao ?? 0;
                  const bloqueada = usos > 0;

                  return (
                    <tr key={item.id} className="border-b border-app-border/60">
                      <td className="py-3 pr-2 text-app-muted">#{item.id}</td>
                      <td className="py-3 pr-2 text-app-fg font-medium">{item.nome}</td>
                      <td className="py-3 pr-2">
                        <Badge size="sm" color={bloqueada ? 'yellow' : 'green'}>
                          {usos}
                        </Badge>
                      </td>
                      <td className="py-3 pr-2 text-app-fg">{item.descricao}</td>
                      <td className="py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setEditingItem(item);
                              setModalOpen(true);
                            }}
                          >
                            <Icon name="edit" className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-app-danger"
                            disabled={deletingId === item.id || bloqueada}
                            onClick={() => handleDelete(item)}
                          >
                            <Icon
                              name={deletingId === item.id ? 'loading' : 'delete'}
                              className={`w-4 h-4 mr-1 ${deletingId === item.id ? 'animate-spin' : ''}`}
                            />
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <CondicaoFormModal
        isOpen={modalOpen}
        onClose={(success) => {
          setModalOpen(false);
          setEditingItem(null);
          if (success) carregarDados();
        }}
        item={editingItem}
      />
    </div>
  );
}
