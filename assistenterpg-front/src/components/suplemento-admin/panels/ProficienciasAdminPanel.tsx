'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Icon } from '@/components/ui/Icon';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  apiAdminGetProficiencias,
  apiAdminCreateProficiencia,
  apiAdminUpdateProficiencia,
  apiAdminDeleteProficiencia,
  extrairMensagemErro,
  type ProficienciaCatalogo,
  type CreateProficienciaPayload,
  type UpdateProficienciaPayload,
} from '@/lib/api';

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
    if (!form.codigo.trim()) next.codigo = 'Codigo e obrigatorio.';
    if (!form.nome.trim()) next.nome = 'Nome e obrigatorio.';
    if (!form.tipo.trim()) next.tipo = 'Tipo e obrigatorio.';
    if (!form.categoria.trim()) next.categoria = 'Categoria e obrigatoria.';
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
        showToast('Proficiencia atualizada com sucesso.', 'success');
      } else {
        await apiAdminCreateProficiencia(payloadBase);
        showToast('Proficiencia criada com sucesso.', 'success');
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
      title={isEditing ? 'Editar proficiencia' : 'Nova proficiencia'}
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
            label="Codigo *"
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
          label="Descricao"
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
  const [erro, setErro] = useState<string | null>(null);
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

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = await apiAdminGetProficiencias();
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

  async function handleDelete(item: ProficienciaCatalogo) {
    if (!window.confirm(`Excluir proficiencia "${item.nome}"?`)) return;

    try {
      setDeletingId(item.id);
      await apiAdminDeleteProficiencia(item.id);
      showToast('Proficiencia removida com sucesso.', 'success');
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
            placeholder="Nome, codigo, tipo..."
          />
          <Button
            variant="primary"
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
          >
            <Icon name="add" className="w-4 h-4 mr-1" />
            Nova proficiencia
          </Button>
        </div>
      </Card>

      {erro && <ErrorAlert message={erro} />}

      <Card>
        {loading ? (
          <Loading message="Carregando proficiencias..." className="py-8 text-app-fg" />
        ) : filtrados.length === 0 ? (
          <EmptyState
            variant="card"
            icon="skills"
            title="Nenhuma proficiencia encontrada"
            description="Ajuste a busca ou crie uma nova proficiencia."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-app-border text-left text-app-muted">
                  <th className="py-2 pr-2">ID</th>
                  <th className="py-2 pr-2">Codigo</th>
                  <th className="py-2 pr-2">Nome</th>
                  <th className="py-2 pr-2">Tipo</th>
                  <th className="py-2 pr-2">Categoria</th>
                  <th className="py-2 pr-2">Subtipo</th>
                  <th className="py-2 text-right">Acoes</th>
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
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-app-danger"
                          disabled={deletingId === item.id}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ProficienciaFormModal
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
