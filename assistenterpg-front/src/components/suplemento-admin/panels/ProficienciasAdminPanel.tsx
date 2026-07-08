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
import {
  AdminPanelScaffold,
  AdminPanelSurface,
  type StatsStripItem,
} from '../common/AdminPanelScaffold';
import {
  apiAdminGetProficiencias,
  apiAdminCreateProficiencia,
  apiAdminUpdateProficiencia,
  apiAdminDeleteProficiencia,
  criarErroUsuario,
  type ProficienciaCatalogo,
  type CreateProficienciaPayload,
  type UpdateProficienciaPayload,
} from '@/lib/api';
import type { UserErrorState } from '@/lib/types';

type ProficienciaFormState = {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: string;
  categoria: string;
  subtipo: string;
};

function buildFormState(item?: ProficienciaCatalogo | null): ProficienciaFormState {
  return {
    codigo: item?.codigo ?? '',
    nome: item?.nome ?? '',
    descricao: item?.descricao ?? '',
    tipo: item?.tipo ?? '',
    categoria: item?.categoria ?? '',
    subtipo: item?.subtipo ?? '',
  };
}

type ModalProps = {
  isOpen: boolean;
  onClose: (success?: boolean) => void;
  item?: ProficienciaCatalogo | null;
};

function ProficienciaFormModal({ isOpen, onClose, item }: ModalProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<ProficienciaFormState>(buildFormState(item));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(item?.id);

  useEffect(() => {
    if (!isOpen) return;
    setForm(buildFormState(item));
    setErrors({});
  }, [isOpen, item]);

  function setField<K extends keyof ProficienciaFormState>(
    key: K,
    value: ProficienciaFormState[K],
  ) {
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
    if (!form.tipo.trim()) next.tipo = 'Tipo é obrigatório.';
    if (!form.categoria.trim()) next.categoria = 'Categoria é obrigatória.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    const descricaoNormalizada = form.descricao.trim();
    const subtipoNormalizado = form.subtipo.trim();
    const payloadBase: CreateProficienciaPayload = {
      codigo: form.codigo.trim(),
      nome: form.nome.trim(),
      descricao: descricaoNormalizada || undefined,
      tipo: form.tipo.trim(),
      categoria: form.categoria.trim(),
      subtipo: subtipoNormalizado || undefined,
    };

    try {
      setSaving(true);
      if (isEditing && item?.id) {
        const payloadUpdate: UpdateProficienciaPayload = {
          ...payloadBase,
          descricao: descricaoNormalizada ? descricaoNormalizada : null,
          subtipo: subtipoNormalizado ? subtipoNormalizado : null,
        };
        await apiAdminUpdateProficiencia(item.id, payloadUpdate);
        showToast('Proficiência atualizada com sucesso.', 'success');
      } else {
        await apiAdminCreateProficiencia(payloadBase);
        showToast('Proficiência criada com sucesso.', 'success');
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
      title={isEditing ? 'Editar proficiência' : 'Nova proficiência'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
          <Input
            label="Tipo *"
            value={form.tipo}
            onChange={(e) => setField('tipo', e.target.value)}
            error={errors.tipo}
          />
          <Input
            label="Categoria *"
            value={form.categoria}
            onChange={(e) => setField('categoria', e.target.value)}
            error={errors.categoria}
          />
          <Input
            label="Subtipo"
            value={form.subtipo}
            onChange={(e) => setField('subtipo', e.target.value)}
          />
        </div>
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

export function ProficienciasAdminPanel() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<UserErrorState | null>(null);
  const [items, setItems] = useState<ProficienciaCatalogo[]>([]);
  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProficienciaCatalogo | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return items;
    return items.filter((item) =>
      [item.codigo, item.nome, item.tipo, item.categoria, item.subtipo ?? '']
        .join(' ')
        .toLowerCase()
        .includes(termo),
    );
  }, [items, busca]);

  const statsItems: StatsStripItem[] = useMemo(
    () => [
      { id: 'total', label: 'Total', value: items.length, icon: 'skills' },
      { id: 'visiveis', label: 'Visíveis', value: filtrados.length, icon: 'filter' },
      {
        id: 'categorias',
        label: 'Categorias',
        value: new Set(items.map((item) => item.categoria).filter(Boolean)).size,
        icon: 'tag',
      },
    ],
    [items, filtrados.length],
  );

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = await apiAdminGetProficiencias();
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

  async function handleDelete(item: ProficienciaCatalogo) {
    if (!window.confirm(`Excluir proficiência "${item.nome}"?`)) return;

    try {
      setDeletingId(item.id);
      await apiAdminDeleteProficiencia(item.id);
      showToast('Proficiência removida com sucesso.', 'success');
      await carregarDados();
    } catch (error) {
      showToast(criarErroUsuario(error), 'error');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminPanelScaffold
      title="Proficiências"
      description="Gerencie proficiências, categorias e subtipos do catálogo."
      icon="skills"
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
          Nova proficiência
        </Button>
      }
      toolbar={
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            label="Buscar"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            icon="search"
            placeholder="Nome, código, tipo..."
            className="sm:max-w-md"
          />
        </div>
      }
    >

      {erro && <ErrorAlert message={erro} />}

      <AdminPanelSurface>
        {loading ? (
          <Loading message="Carregando proficiências..." className="py-8 text-app-fg" />
        ) : filtrados.length === 0 ? (
          <EmptyState
            variant="card"
            icon="skills"
            title="Nenhuma proficiência encontrada"
            description="Ajuste a busca ou crie uma nova proficiência."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-app-border text-left text-app-muted">
                  <th className="py-2 pr-2">ID</th>
                  <th className="py-2 pr-2">Código</th>
                  <th className="py-2 pr-2">Nome</th>
                  <th className="py-2 pr-2">Tipo</th>
                  <th className="py-2 pr-2">Categoria</th>
                  <th className="py-2 pr-2">Subtipo</th>
                  <th className="py-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((item) => (
                  <tr key={item.id} className="border-b border-app-border/60">
                    <td className="py-3 pr-2 text-app-muted">#{item.id}</td>
                    <td className="py-3 pr-2 text-app-muted font-mono">{item.codigo}</td>
                    <td className="py-3 pr-2 text-app-fg font-medium">{item.nome}</td>
                    <td className="py-3 pr-2 text-app-fg">{item.tipo}</td>
                    <td className="py-3 pr-2 text-app-fg">{item.categoria}</td>
                    <td className="py-3 pr-2 text-app-fg">{item.subtipo ?? '-'}</td>
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

      <ProficienciaFormModal
        isOpen={modalOpen}
        onClose={(success) => {
          setModalOpen(false);
          setEditingItem(null);
          if (success) carregarDados();
        }}
        item={editingItem}
      />
    </AdminPanelScaffold>
  );
}
