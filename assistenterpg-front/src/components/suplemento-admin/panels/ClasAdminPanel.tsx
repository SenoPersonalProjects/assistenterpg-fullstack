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
  apiAdminGetClas,
  apiAdminCreateCla,
  apiAdminUpdateCla,
  apiGetSuplementos,
  extrairMensagemErro,
  type ClaCatalogo,
  type SuplementoCatalogo,
  type TipoFonte,
  type CreateClaPayload,
  type UpdateClaPayload,
} from '@/lib/api';

type ClaComTecnicas = ClaCatalogo & {
  tecnicasHereditarias?: Array<{ id: number }>;
};

type ClaFormState = {
  nome: string;
  descricao: string;
  grandeCla: boolean;
  fonte: TipoFonte;
  suplementoId: string;
  tecnicasIdsCsv: string;
};

function parseIdsCsv(input: string): number[] | undefined {
  const values = input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item))
    .filter((id) => Number.isFinite(id) && id > 0);
  return values.length ? values : undefined;
}

function buildFormState(item?: ClaComTecnicas | null): ClaFormState {
  return {
    nome: item?.nome ?? '',
    descricao: item?.descricao ?? '',
    grandeCla: item?.grandeCla ?? false,
    fonte: item?.fonte ?? ('SISTEMA_BASE' as TipoFonte),
    suplementoId:
      item?.suplementoId !== null && item?.suplementoId !== undefined ? String(item.suplementoId) : '',
    tecnicasIdsCsv: (item?.tecnicasHereditarias ?? []).map((t) => t.id).join(', '),
  };
}

type ModalProps = {
  isOpen: boolean;
  onClose: (success?: boolean) => void;
  suplementos: SuplementoCatalogo[];
  cla?: ClaComTecnicas | null;
};

function ClaAdminFormModal({ isOpen, onClose, suplementos, cla }: ModalProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<ClaFormState>(buildFormState(cla));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(cla?.id);

  useEffect(() => {
    if (!isOpen) return;
    setForm(buildFormState(cla));
    setErrors({});
  }, [isOpen, cla]);

  function setField<K extends keyof ClaFormState>(key: K, value: ClaFormState[K]) {
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

    const payloadBase: CreateClaPayload = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || undefined,
      grandeCla: form.grandeCla,
      fonte: form.fonte,
      suplementoId: form.fonte === 'SUPLEMENTO' ? toOptionalNumber(form.suplementoId) : undefined,
      tecnicasHereditariasIds: parseIdsCsv(form.tecnicasIdsCsv),
    };

    try {
      setSaving(true);
      if (isEditing && cla?.id) {
        const payloadUpdate: UpdateClaPayload = {
          ...payloadBase,
          suplementoId: form.fonte === 'SUPLEMENTO' ? toOptionalNumber(form.suplementoId) : null,
        };
        await apiAdminUpdateCla(cla.id, payloadUpdate);
        showToast('Cla atualizado com sucesso.', 'success');
      } else {
        await apiAdminCreateCla(payloadBase);
        showToast('Cla criado com sucesso.', 'success');
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
      title={isEditing ? 'Editar cla' : 'Novo cla'}
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
        <Checkbox
          label="Grande cla"
          checked={form.grandeCla}
          onChange={(e) => setField('grandeCla', e.target.checked)}
        />
        <Input
          label="Tecnicas hereditarias IDs (CSV)"
          value={form.tecnicasIdsCsv}
          onChange={(e) => setField('tecnicasIdsCsv', e.target.value)}
          placeholder="Ex: 1, 2, 3"
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

export function ClasAdminPanel() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [items, setItems] = useState<ClaComTecnicas[]>([]);
  const [suplementos, setSuplementos] = useState<SuplementoCatalogo[]>([]);
  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClaComTecnicas | null>(null);

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
      const [data, suplementosData] = await Promise.all([apiAdminGetClas(), apiGetSuplementos()]);
      setItems(data as ClaComTecnicas[]);
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
            placeholder="Digite o nome do cla..."
          />
          <Button
            variant="primary"
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
          >
            <Icon name="add" className="w-4 h-4 mr-1" />
            Novo cla
          </Button>
        </div>
      </Card>

      {erro && <ErrorAlert message={erro} />}

      <Card>
        {loading ? (
          <Loading message="Carregando clas..." className="py-8 text-app-fg" />
        ) : filtrados.length === 0 ? (
          <EmptyState
            variant="card"
            icon="clan"
            title="Nenhum cla encontrado"
            description="Ajuste a busca ou crie um novo cla."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-app-border text-left text-app-muted">
                  <th className="py-2 pr-2">ID</th>
                  <th className="py-2 pr-2">Nome</th>
                  <th className="py-2 pr-2">Grande</th>
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
                    <td className="py-3 pr-2 text-app-fg">{item.grandeCla ? 'Sim' : 'Nao'}</td>
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

      <ClaAdminFormModal
        isOpen={modalOpen}
        onClose={(success) => {
          setModalOpen(false);
          setEditingItem(null);
          if (success) carregarDados();
        }}
        suplementos={suplementos}
        cla={editingItem}
      />
    </div>
  );
}
