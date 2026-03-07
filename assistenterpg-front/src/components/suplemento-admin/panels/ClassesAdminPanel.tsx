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
import { FonteSuplementoFields } from '../common/FonteSuplementoFields';
import { fonteBadgeColor, formatFonte, toOptionalNumber } from '../common/fonte-utils';
import {
  apiAdminGetClasses,
  apiAdminCreateClasse,
  apiAdminUpdateClasse,
  apiGetSuplementos,
  extrairMensagemErro,
  type ClasseCatalogo,
  type SuplementoCatalogo,
  type TipoFonte,
  type CreateClassePayload,
  type UpdateClassePayload,
} from '@/lib/api';

type ClasseFormState = {
  nome: string;
  descricao: string;
  fonte: TipoFonte;
  suplementoId: string;
};

function buildFormState(item?: ClasseCatalogo | null): ClasseFormState {
  return {
    nome: item?.nome ?? '',
    descricao: item?.descricao ?? '',
    fonte: item?.fonte ?? ('SISTEMA_BASE' as TipoFonte),
    suplementoId:
      item?.suplementoId !== null && item?.suplementoId !== undefined ? String(item.suplementoId) : '',
  };
}

type ModalProps = {
  isOpen: boolean;
  onClose: (success?: boolean) => void;
  suplementos: SuplementoCatalogo[];
  classe?: ClasseCatalogo | null;
};

function ClasseAdminFormModal({ isOpen, onClose, suplementos, classe }: ModalProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<ClasseFormState>(buildFormState(classe));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(buildFormState(classe));
    setErrors({});
  }, [isOpen, classe]);

  const isEditing = Boolean(classe?.id);

  function setField<K extends keyof ClasseFormState>(key: K, value: ClasseFormState[K]) {
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
    if (!form.nome.trim()) next.nome = 'Nome e obrigatorio.';
    if (form.fonte === 'SUPLEMENTO' && !form.suplementoId.trim()) {
      next.suplementoId = 'Selecione um suplemento.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    const payloadBase: CreateClassePayload = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || undefined,
      fonte: form.fonte,
      suplementoId: form.fonte === 'SUPLEMENTO' ? toOptionalNumber(form.suplementoId) : undefined,
    };

    try {
      setSaving(true);
      if (isEditing && classe?.id) {
        const payloadUpdate: UpdateClassePayload = {
          ...payloadBase,
          suplementoId: form.fonte === 'SUPLEMENTO' ? toOptionalNumber(form.suplementoId) : null,
        };
        await apiAdminUpdateClasse(classe.id, payloadUpdate);
        showToast('Classe atualizada com sucesso.', 'success');
      } else {
        await apiAdminCreateClasse(payloadBase);
        showToast('Classe criada com sucesso.', 'success');
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
      title={isEditing ? 'Editar classe' : 'Nova classe'}
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
          label="Descricao"
          rows={4}
          value={form.descricao}
          onChange={(e) => setField('descricao', e.target.value)}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FonteSuplementoFields
            fonte={form.fonte}
            suplementoId={form.suplementoId}
            suplementos={suplementos}
            errorSuplementoId={errors.suplementoId}
            onChangeFonte={(fonte) => setField('fonte', fonte)}
            onChangeSuplementoId={(value) => setField('suplementoId', value)}
          />
        </div>
      </div>
    </Modal>
  );
}

export function ClassesAdminPanel() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [items, setItems] = useState<ClasseCatalogo[]>([]);
  const [suplementos, setSuplementos] = useState<SuplementoCatalogo[]>([]);
  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClasseCatalogo | null>(null);

  const suplementosById = useMemo(() => {
    const map = new Map<number, string>();
    suplementos.forEach((item) => map.set(item.id, item.nome));
    return map;
  }, [suplementos]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return items;
    return items.filter((item) => item.nome.toLowerCase().includes(termo));
  }, [items, busca]);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const [classesData, suplementosData] = await Promise.all([
        apiAdminGetClasses(),
        apiGetSuplementos(),
      ]);
      setItems(classesData);
      setSuplementos(suplementosData);
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

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <Input
            label="Buscar por nome"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            icon="search"
            placeholder="Digite o nome da classe..."
          />
          <Button
            variant="primary"
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
          >
            <Icon name="add" className="w-4 h-4 mr-1" />
            Nova classe
          </Button>
        </div>
      </Card>

      {erro && <ErrorAlert message={erro} />}

      <Card>
        {loading ? (
          <Loading message="Carregando classes..." className="py-8 text-app-fg" />
        ) : filtrados.length === 0 ? (
          <EmptyState
            variant="card"
            icon="class"
            title="Nenhuma classe encontrada"
            description="Ajuste a busca ou crie uma nova classe."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-app-border text-left text-app-muted">
                  <th className="py-2 pr-2">ID</th>
                  <th className="py-2 pr-2">Nome</th>
                  <th className="py-2 pr-2">Fonte</th>
                  <th className="py-2 pr-2">Suplemento</th>
                  <th className="py-2 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((item) => (
                  <tr key={item.id} className="border-b border-app-border/60">
                    <td className="py-3 pr-2 text-app-muted">#{item.id}</td>
                    <td className="py-3 pr-2 text-app-fg font-medium">{item.nome}</td>
                    <td className="py-3 pr-2">
                      <Badge size="sm" color={fonteBadgeColor(item.fonte)}>
                        {formatFonte(item.fonte)}
                      </Badge>
                    </td>
                    <td className="py-3 pr-2 text-app-fg">
                      {item.suplementoId ? suplementosById.get(item.suplementoId) ?? `#${item.suplementoId}` : '-'}
                    </td>
                    <td className="py-3 text-right">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ClasseAdminFormModal
        isOpen={modalOpen}
        onClose={(success) => {
          setModalOpen(false);
          setEditingItem(null);
          if (success) carregarDados();
        }}
        suplementos={suplementos}
        classe={editingItem}
      />
    </div>
  );
}
