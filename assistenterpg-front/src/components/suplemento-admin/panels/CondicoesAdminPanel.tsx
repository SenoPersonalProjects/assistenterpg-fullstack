'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
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
  apiAdminGetCondicoes,
  apiAdminCreateCondicao,
  apiAdminUpdateCondicao,
  apiAdminDeleteCondicao,
  criarErroUsuario,
  type CondicaoCatalogo,
  type CreateCondicaoPayload,
  type UpdateCondicaoPayload,
} from '@/lib/api';
import type { UserErrorState } from '@/lib/types';

type CondicaoFormState = {
  nome: string;
  descricao: string;
  icone: string;
};

function buildFormState(item?: CondicaoCatalogo | null): CondicaoFormState {
  return {
    nome: item?.nome ?? '',
    descricao: item?.descricao ?? '',
    icone: item?.icone ?? '',
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
    const icone = form.icone.trim();

    if (!nome) next.nome = 'Nome é obrigatório.';
    else if (nome.length < 3) next.nome = 'Nome deve ter no mínimo 3 caracteres.';

    if (!descricao) next.descricao = 'Descrição é obrigatória.';
    else if (descricao.length < 10) next.descricao = 'Descrição deve ter no mínimo 10 caracteres.';

    if (icone.length > 50) next.icone = 'Ícone deve ter no máximo 50 caracteres.';

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    const payload: CreateCondicaoPayload = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim(),
      icone: form.icone.trim() || null,
    };

    try {
      setSaving(true);
      if (isEditing && item?.id) {
        const payloadUpdate: UpdateCondicaoPayload = payload;
        await apiAdminUpdateCondicao(item.id, payloadUpdate);
        showToast('Condição atualizada com sucesso.', 'success');
      } else {
        await apiAdminCreateCondicao(payload);
        showToast('Condição criada com sucesso.', 'success');
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
      title={isEditing ? 'Editar condição' : 'Nova condição'}
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
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <Input
            label="Ícone (opcional)"
            value={form.icone}
            onChange={(e) => setField('icone', e.target.value)}
            error={errors.icone}
            placeholder="Ex.: warning, fire, shield"
          />
          <div className="flex items-center gap-2 rounded border border-app-border bg-app-surface px-3 py-2 text-xs text-app-muted">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-app-border bg-app-bg">
              <Icon
                name={(form.icone.trim() || 'status') as IconName}
                className="h-4 w-4 text-app-fg"
              />
            </span>
            Preview
          </div>
        </div>
        <Textarea
          label="Descrição *"
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
  const [erro, setErro] = useState<UserErrorState | null>(null);
  const [items, setItems] = useState<CondicaoCatalogo[]>([]);
  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CondicaoCatalogo | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const confirmacao = useConfirm();

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return items;
    return items.filter((item) =>
      [item.nome, item.descricao].join(' ').toLowerCase().includes(termo),
    );
  }, [items, busca]);

  const statsItems: StatsStripItem[] = useMemo(
    () => [
      { id: 'total', label: 'Total', value: items.length, icon: 'status' },
      { id: 'visiveis', label: 'Visíveis', value: filtrados.length, icon: 'filter' },
      {
        id: 'em-uso',
        label: 'Em uso',
        value: items.filter((item) => (item._count?.condicoesPersonagemSessao ?? 0) > 0).length,
        icon: 'link',
      },
    ],
    [items, filtrados.length],
  );

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = await apiAdminGetCondicoes();
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

  function handleDelete(item: CondicaoCatalogo) {
    confirmacao.confirm({
      title: 'Excluir condição?',
      description: `“${item.nome}” será removida do catálogo.`,
      confirmLabel: 'Excluir condição',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setDeletingId(item.id);
          const resposta = await apiAdminDeleteCondicao(item.id);
          showToast(resposta.message || 'Condição removida com sucesso.', 'success');
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
      title="Condições"
      description="Gerencie condições aplicadas em sessão e seus indicadores visuais."
      icon="status"
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
          Nova condição
        </Button>
      }
      toolbar={
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            label="Buscar"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            icon="search"
            placeholder="Nome ou descrição..."
            className="sm:max-w-md"
          />
        </div>
      }
    >

      {erro && <ErrorAlert message={erro} />}

      <AdminPanelSurface>
        {loading ? (
          <Loading message="Carregando condições..." className="py-8 text-app-fg" />
        ) : filtrados.length === 0 ? (
          <EmptyState
            variant="card"
            icon="status"
            title="Nenhuma condição encontrada"
            description="Ajuste a busca ou crie uma nova condição."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-app-border text-left text-app-muted">
                  <th className="py-2 pr-2">ID</th>
                  <th className="py-2 pr-2">Ícone</th>
                  <th className="py-2 pr-2">Nome</th>
                  <th className="py-2 pr-2">Uso em sessões</th>
                  <th className="py-2 pr-2">Descrição</th>
                  <th className="py-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((item) => {
                  const usos = item._count?.condicoesPersonagemSessao ?? 0;
                  const bloqueada = usos > 0;

                  return (
                    <tr key={item.id} className="border-b border-app-border/60">
                      <td className="py-3 pr-2 text-app-muted">#{item.id}</td>
                      <td className="py-3 pr-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-app-border bg-app-bg">
                          <Icon
                            name={(item.icone || 'status') as IconName}
                            className="h-4 w-4 text-app-fg"
                          />
                        </span>
                      </td>
                      <td className="py-3 pr-2 text-app-fg font-medium">{item.nome}</td>
                      <td className="py-3 pr-2">
                        <Badge size="sm" color={bloqueada ? 'yellow' : 'green'}>
                          {usos}
                        </Badge>
                      </td>
                      <td className="max-w-sm truncate py-3 pr-2 text-app-fg">{item.descricao}</td>
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
                                disabled: deletingId === item.id || bloqueada,
                                onSelect: () => handleDelete(item),
                              },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanelSurface>

      <CondicaoFormModal
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
