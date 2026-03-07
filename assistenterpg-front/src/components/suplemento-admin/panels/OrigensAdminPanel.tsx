'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Modal } from '@/components/ui/Modal';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { FonteSuplementoFields } from '../common/FonteSuplementoFields';
import { fonteBadgeColor, formatFonte, toOptionalNumber } from '../common/fonte-utils';
import {
  apiAdminGetOrigens,
  apiAdminCreateOrigem,
  apiAdminUpdateOrigem,
  apiGetSuplementos,
  extrairMensagemErro,
  type OrigemCatalogo,
  type SuplementoCatalogo,
  type TipoFonte,
  type CreateOrigemPayload,
  type UpdateOrigemPayload,
} from '@/lib/api';

type OrigemFormState = {
  nome: string;
  descricao: string;
  requisitosTexto: string;
  requerGrandeCla: boolean;
  requerTecnicaHeriditaria: boolean;
  bloqueiaTecnicaHeriditaria: boolean;
  fonte: TipoFonte;
  suplementoId: string;
};

function buildFormState(item?: OrigemCatalogo | null): OrigemFormState {
  return {
    nome: item?.nome ?? '',
    descricao: item?.descricao ?? '',
    requisitosTexto: item?.requisitosTexto ?? '',
    requerGrandeCla: item?.requerGrandeCla ?? false,
    requerTecnicaHeriditaria: item?.requerTecnicaHeriditaria ?? false,
    bloqueiaTecnicaHeriditaria: item?.bloqueiaTecnicaHeriditaria ?? false,
    fonte: item?.fonte ?? ('SISTEMA_BASE' as TipoFonte),
    suplementoId:
      item?.suplementoId !== undefined && item?.suplementoId !== null ? String(item.suplementoId) : '',
  };
}

type ModalProps = {
  isOpen: boolean;
  onClose: (success?: boolean) => void;
  suplementos: SuplementoCatalogo[];
  origem?: OrigemCatalogo | null;
};

function OrigemAdminFormModal({ isOpen, onClose, suplementos, origem }: ModalProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<OrigemFormState>(buildFormState(origem));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(origem?.id);

  useEffect(() => {
    if (!isOpen) return;
    setForm(buildFormState(origem));
    setErrors({});
  }, [isOpen, origem]);

  function setField<K extends keyof OrigemFormState>(key: K, value: OrigemFormState[K]) {
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

    const payloadBase: CreateOrigemPayload = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || undefined,
      requisitosTexto: form.requisitosTexto.trim() || undefined,
      requerGrandeCla: form.requerGrandeCla,
      requerTecnicaHeriditaria: form.requerTecnicaHeriditaria,
      bloqueiaTecnicaHeriditaria: form.bloqueiaTecnicaHeriditaria,
      fonte: form.fonte,
      suplementoId: form.fonte === 'SUPLEMENTO' ? toOptionalNumber(form.suplementoId) : undefined,
    };

    try {
      setSaving(true);
      if (isEditing && origem?.id) {
        const payloadUpdate: UpdateOrigemPayload = {
          ...payloadBase,
          suplementoId: form.fonte === 'SUPLEMENTO' ? toOptionalNumber(form.suplementoId) : null,
        };
        await apiAdminUpdateOrigem(origem.id, payloadUpdate);
        showToast('Origem atualizada com sucesso.', 'success');
      } else {
        await apiAdminCreateOrigem(payloadBase);
        showToast('Origem criada com sucesso.', 'success');
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
      title={isEditing ? 'Editar origem' : 'Nova origem'}
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
        <Textarea
          label="Requisitos (texto)"
          rows={3}
          value={form.requisitosTexto}
          onChange={(e) => setField('requisitosTexto', e.target.value)}
        />
        <div className="grid grid-cols-1 gap-2">
          <Checkbox
            label="Requer grande cla"
            checked={form.requerGrandeCla}
            onChange={(e) => setField('requerGrandeCla', e.target.checked)}
          />
          <Checkbox
            label="Requer tecnica heriditaria"
            checked={form.requerTecnicaHeriditaria}
            onChange={(e) => setField('requerTecnicaHeriditaria', e.target.checked)}
          />
          <Checkbox
            label="Bloqueia tecnica heriditaria"
            checked={form.bloqueiaTecnicaHeriditaria}
            onChange={(e) => setField('bloqueiaTecnicaHeriditaria', e.target.checked)}
          />
        </div>
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

export function OrigensAdminPanel() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [items, setItems] = useState<OrigemCatalogo[]>([]);
  const [suplementos, setSuplementos] = useState<SuplementoCatalogo[]>([]);
  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OrigemCatalogo | null>(null);

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
      const [data, suplementosData] = await Promise.all([apiAdminGetOrigens(), apiGetSuplementos()]);
      setItems(data);
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
            placeholder="Digite o nome da origem..."
          />
          <Button
            variant="primary"
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
          >
            <Icon name="add" className="w-4 h-4 mr-1" />
            Nova origem
          </Button>
        </div>
      </Card>

      {erro && <ErrorAlert message={erro} />}

      <Card>
        {loading ? (
          <Loading message="Carregando origens..." className="py-8 text-app-fg" />
        ) : filtrados.length === 0 ? (
          <EmptyState
            variant="card"
            icon="story"
            title="Nenhuma origem encontrada"
            description="Ajuste a busca ou crie uma nova origem."
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

      <OrigemAdminFormModal
        isOpen={modalOpen}
        onClose={(success) => {
          setModalOpen(false);
          setEditingItem(null);
          if (success) carregarDados();
        }}
        suplementos={suplementos}
        origem={editingItem}
      />
    </div>
  );
}
