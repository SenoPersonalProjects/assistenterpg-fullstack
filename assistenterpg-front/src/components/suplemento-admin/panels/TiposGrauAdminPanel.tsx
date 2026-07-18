'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Icon } from '@/components/ui/Icon';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { EntityActionsMenu } from '@/components/ui/EntityActionsMenu';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';
import {
  AdminPanelScaffold,
  AdminPanelSurface,
  type StatsStripItem,
} from '../common/AdminPanelScaffold';
import {
  apiAdminGetTiposGrau,
  apiAdminCreateTipoGrau,
  apiAdminUpdateTipoGrau,
  apiAdminDeleteTipoGrau,
  criarErroUsuario,
  type TipoGrauCatalogo,
  type CreateTipoGrauPayload,
  type UpdateTipoGrauPayload,
} from '@/lib/api';
import type { UserErrorState } from '@/lib/types';

type TipoGrauFormState = {
  codigo: string;
  nome: string;
  descricao: string;
};

function buildFormState(item?: TipoGrauCatalogo | null): TipoGrauFormState {
  return {
    codigo: item?.codigo ?? '',
    nome: item?.nome ?? '',
    descricao: item?.descricao ?? '',
  };
}

type ModalProps = {
  isOpen: boolean;
  onClose: (success?: boolean) => void;
  item?: TipoGrauCatalogo | null;
};

function TipoGrauFormModal({ isOpen, onClose, item }: ModalProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<TipoGrauFormState>(buildFormState(item));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(item?.id);

  useEffect(() => {
    if (!isOpen) return;
    setForm(buildFormState(item));
    setErrors({});
  }, [isOpen, item]);

  function setField<K extends keyof TipoGrauFormState>(key: K, value: TipoGrauFormState[K]) {
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
    if (!form.codigo.trim()) next.codigo = 'Código é obrigatório.';
    if (!form.nome.trim()) next.nome = 'Nome é obrigatório.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    const descricaoNormalizada = form.descricao.trim();
    const payloadBase: CreateTipoGrauPayload = {
      codigo: form.codigo.trim(),
      nome: form.nome.trim(),
      descricao: descricaoNormalizada || undefined,
    };

    try {
      setSaving(true);
      if (isEditing && item?.id) {
        const payloadUpdate: UpdateTipoGrauPayload = {
          ...payloadBase,
          descricao: descricaoNormalizada ? descricaoNormalizada : null,
        };
        await apiAdminUpdateTipoGrau(item.id, payloadUpdate);
        showToast('Tipo de grau atualizado com sucesso.', 'success');
      } else {
        await apiAdminCreateTipoGrau(payloadBase);
        showToast('Tipo de grau criado com sucesso.', 'success');
      }
      onClose(true);
    } catch (error) {
      showToast(criarErroUsuario(error), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      title={isEditing ? 'Editar tipo de grau' : 'Novo tipo de grau'}
      size="md"
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
          label="Código *"
          value={form.codigo}
          onChange={(e) => setField('codigo', e.target.value)}
          error={errors.codigo}
        />
        <Input
          label="Nome *"
          value={form.nome}
          onChange={(e) => setField('nome', e.target.value)}
          error={errors.nome}
        />
        <Textarea
          label="Descrição"
          rows={4}
          value={form.descricao}
          onChange={(e) => setField('descricao', e.target.value)}
        />
      </div>
    </Modal>
  );
}

export function TiposGrauAdminPanel() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<UserErrorState | null>(null);
  const [items, setItems] = useState<TipoGrauCatalogo[]>([]);
  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TipoGrauCatalogo | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const confirmacao = useConfirm();

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return items;
    return items.filter((item) =>
      [item.codigo, item.nome, item.descricao ?? ''].join(' ').toLowerCase().includes(termo),
    );
  }, [items, busca]);

  const statsItems: StatsStripItem[] = useMemo(
    () => [
      { id: 'total', label: 'Total', value: items.length, icon: 'rank' },
      { id: 'visiveis', label: 'Visíveis', value: filtrados.length, icon: 'filter' },
      {
        id: 'com-descricao',
        label: 'Com descrição',
        value: items.filter((item) => Boolean(item.descricao?.trim())).length,
        icon: 'document',
      },
    ],
    [items, filtrados.length],
  );

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = await apiAdminGetTiposGrau();
      setItems(data);
    } catch (error) {
      const mensagem = criarErroUsuario(error);
      setErro(mensagem);
      showToast(mensagem, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  function handleDelete(item: TipoGrauCatalogo) {
    confirmacao.confirm({
      title: 'Excluir tipo de grau?',
      description: `“${item.nome}” será removido do catálogo.`,
      confirmLabel: 'Excluir tipo',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setDeletingId(item.id);
          await apiAdminDeleteTipoGrau(item.id);
          showToast('Tipo de grau removido com sucesso.', 'success');
          await carregarDados();
        } catch (error) {
          showToast(criarErroUsuario(error), 'error');
        } finally {
          setDeletingId(null);
        }
      },
    });
  }

  return (
    <AdminPanelScaffold
      title="Tipos de Grau"
      description="Gerencie os tipos usados para organizar progressão e efeitos de grau."
      icon="rank"
      count={filtrados.length}
      stats={statsItems}
      action={
        <Button
          variant="primary"
          onClick={() => {
            setEditingItem(null);
            setModalOpen(true);
          }}
        >
          <Icon name="add" className="w-4 h-4 mr-1" />
          Novo tipo de grau
        </Button>
      }
      toolbar={
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            label="Buscar"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            icon="search"
            placeholder="Nome ou código..."
            className="sm:max-w-md"
          />
        </div>
      }
    >

      {erro && <ErrorAlert message={erro} />}

      <AdminPanelSurface>
        {loading ? (
          <Loading message="Carregando tipos de grau..." className="py-8 text-app-fg" />
        ) : filtrados.length === 0 ? (
          <EmptyState
            variant="card"
            icon="rank"
            title="Nenhum tipo de grau encontrado"
            description="Ajuste a busca ou crie um novo tipo."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-app-border text-left text-app-muted">
                  <th className="py-2 pr-2">ID</th>
                  <th className="py-2 pr-2">Código</th>
                  <th className="py-2 pr-2">Nome</th>
                  <th className="py-2 pr-2">Descrição</th>
                  <th className="py-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((item) => (
                  <tr key={item.id} className="border-b border-app-border/60">
                    <td className="py-3 pr-2 text-app-muted">#{item.id}</td>
                    <td className="py-3 pr-2 text-app-muted font-mono">{item.codigo}</td>
                    <td className="py-3 pr-2 text-app-fg font-medium">{item.nome}</td>
                    <td className="max-w-md truncate py-3 pr-2 text-app-fg">{item.descricao ?? '-'}</td>
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
                        <EntityActionsMenu
                          items={[
                            {
                              id: 'delete',
                              label: deletingId === item.id ? 'Excluindo...' : 'Excluir',
                              icon: deletingId === item.id ? 'loading' : 'delete',
                              destructive: true,
                              disabled: deletingId === item.id,
                              onSelect: () => handleDelete(item),
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanelSurface>

      <TipoGrauFormModal
        isOpen={modalOpen}
        onClose={(success) => {
          setModalOpen(false);
          setEditingItem(null);
          if (success) carregarDados();
        }}
        item={editingItem}
      />
      <ConfirmDialog
        isOpen={confirmacao.isOpen}
        onClose={confirmacao.handleClose}
        onConfirm={() => void confirmacao.handleConfirm()}
        title={confirmacao.options?.title ?? 'Confirmar exclusão'}
        description={confirmacao.options?.description ?? ''}
        confirmLabel={confirmacao.options?.confirmLabel}
        cancelLabel={confirmacao.options?.cancelLabel}
        variant={confirmacao.options?.variant}
        confirmLoading={deletingId !== null}
      />
    </AdminPanelScaffold>
  );
}
