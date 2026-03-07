'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
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
  apiAdminGetTrilhas,
  apiAdminGetCaminhosDaTrilha,
  apiAdminCreateCaminho,
  apiAdminUpdateCaminho,
  apiGetSuplementos,
  extrairMensagemErro,
  type CaminhoCatalogo,
  type TrilhaCatalogo,
  type SuplementoCatalogo,
  type TipoFonte,
  type CreateCaminhoPayload,
  type UpdateCaminhoPayload,
} from '@/lib/api';

type CaminhoFormState = {
  trilhaId: string;
  nome: string;
  descricao: string;
  fonte: TipoFonte;
  suplementoId: string;
};

type CaminhoExtended = CaminhoCatalogo & {
  fonte?: TipoFonte;
  suplementoId?: number | null;
};

function buildFormState(item?: CaminhoExtended | null): CaminhoFormState {
  return {
    trilhaId: item?.trilhaId ? String(item.trilhaId) : '',
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
  trilhas: TrilhaCatalogo[];
  suplementos: SuplementoCatalogo[];
  caminho?: CaminhoExtended | null;
};

function CaminhoAdminFormModal({ isOpen, onClose, trilhas, suplementos, caminho }: ModalProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<CaminhoFormState>(buildFormState(caminho));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(caminho?.id);

  useEffect(() => {
    if (!isOpen) return;
    setForm(buildFormState(caminho));
    setErrors({});
  }, [isOpen, caminho]);

  function setField<K extends keyof CaminhoFormState>(key: K, value: CaminhoFormState[K]) {
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
    if (!form.trilhaId.trim()) next.trilhaId = 'Trilha e obrigatoria.';
    if (!form.nome.trim()) next.nome = 'Nome e obrigatorio.';
    if (form.fonte === 'SUPLEMENTO' && !form.suplementoId.trim()) {
      next.suplementoId = 'Selecione um suplemento.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    const payloadBase: CreateCaminhoPayload = {
      trilhaId: Number(form.trilhaId),
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || undefined,
      fonte: form.fonte,
      suplementoId: form.fonte === 'SUPLEMENTO' ? toOptionalNumber(form.suplementoId) : undefined,
    };

    try {
      setSaving(true);
      if (isEditing && caminho?.id) {
        const payloadUpdate: UpdateCaminhoPayload = {
          ...payloadBase,
          suplementoId: form.fonte === 'SUPLEMENTO' ? toOptionalNumber(form.suplementoId) : null,
        };
        await apiAdminUpdateCaminho(caminho.id, payloadUpdate);
        showToast('Caminho atualizado com sucesso.', 'success');
      } else {
        await apiAdminCreateCaminho(payloadBase);
        showToast('Caminho criado com sucesso.', 'success');
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
      title={isEditing ? 'Editar caminho' : 'Novo caminho'}
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
        <Select
          label="Trilha *"
          value={form.trilhaId}
          onChange={(e) => setField('trilhaId', e.target.value)}
          error={errors.trilhaId}
        >
          <option value="">Selecione...</option>
          {trilhas.map((item) => (
            <option key={item.id} value={String(item.id)}>
              #{item.id} - {item.nome}
            </option>
          ))}
        </Select>

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

export function CaminhosAdminPanel() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [items, setItems] = useState<CaminhoExtended[]>([]);
  const [trilhas, setTrilhas] = useState<TrilhaCatalogo[]>([]);
  const [suplementos, setSuplementos] = useState<SuplementoCatalogo[]>([]);
  const [busca, setBusca] = useState('');
  const [trilhaFiltro, setTrilhaFiltro] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CaminhoExtended | null>(null);

  const trilhasById = useMemo(() => {
    const map = new Map<number, string>();
    trilhas.forEach((item) => map.set(item.id, item.nome));
    return map;
  }, [trilhas]);

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

  const carregarMeta = useCallback(async () => {
    try {
      const [trilhasData, suplementosData] = await Promise.all([apiAdminGetTrilhas(), apiGetSuplementos()]);
      setTrilhas(trilhasData);
      setSuplementos(suplementosData);
    } catch (error) {
      showToast(extrairMensagemErro(error), 'error');
    }
  }, [showToast]);

  const carregarCaminhos = useCallback(async () => {
    if (!trilhaFiltro) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErro(null);
      const data = await apiAdminGetCaminhosDaTrilha(Number(trilhaFiltro));
      setItems(data as CaminhoExtended[]);
    } catch (error) {
      const mensagem = extrairMensagemErro(error);
      setErro(mensagem);
      showToast(mensagem, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, trilhaFiltro]);

  useEffect(() => {
    carregarMeta();
  }, [carregarMeta]);

  useEffect(() => {
    carregarCaminhos();
  }, [carregarCaminhos]);

  return (
    <div className="space-y-4">
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select label="Trilha (obrigatorio)" value={trilhaFiltro} onChange={(e) => setTrilhaFiltro(e.target.value)}>
            <option value="">Selecione...</option>
            {trilhas.map((item) => (
              <option key={item.id} value={String(item.id)}>
                #{item.id} - {item.nome}
              </option>
            ))}
          </Select>

          <Input
            label="Buscar por nome"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            icon="search"
            placeholder="Digite o nome do caminho..."
          />

          <div className="flex items-end gap-2">
            <Button variant="secondary" onClick={carregarCaminhos} disabled={!trilhaFiltro}>
              Atualizar
            </Button>
            <Button
              variant="primary"
              disabled={!trilhaFiltro}
              onClick={() => {
                setEditingItem(
                  trilhaFiltro ? ({ trilhaId: Number(trilhaFiltro), id: 0, nome: '', descricao: '' } as CaminhoExtended) : null,
                );
                setModalOpen(true);
              }}
            >
              <Icon name="add" className="w-4 h-4 mr-1" />
              Novo caminho
            </Button>
          </div>
        </div>
      </Card>

      {!trilhaFiltro ? (
        <Card>
          <EmptyState
            variant="card"
            icon="map"
            title="Selecione uma trilha"
            description="Escolha uma trilha para listar e gerenciar os caminhos."
          />
        </Card>
      ) : (
        <>
          {erro && <ErrorAlert message={erro} />}

          <Card>
            {loading ? (
              <Loading message="Carregando caminhos..." className="py-8 text-app-fg" />
            ) : filtrados.length === 0 ? (
              <EmptyState
                variant="card"
                icon="map"
                title="Nenhum caminho encontrado"
                description="Ajuste a busca ou crie um novo caminho."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-app-border text-left text-app-muted">
                      <th className="py-2 pr-2">ID</th>
                      <th className="py-2 pr-2">Nome</th>
                      <th className="py-2 pr-2">Trilha</th>
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
                        <td className="py-3 pr-2 text-app-fg">{trilhasById.get(item.trilhaId) ?? `#${item.trilhaId}`}</td>
                        <td className="py-3 pr-2">
                          <Badge size="sm" color={fonteBadgeColor(item.fonte)}>
                            {formatFonte(item.fonte)}
                          </Badge>
                        </td>
                        <td className="py-3 pr-2 text-app-fg">
                          {item.suplementoId
                            ? suplementosById.get(item.suplementoId) ?? `#${item.suplementoId}`
                            : '-'}
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
        </>
      )}

      <CaminhoAdminFormModal
        isOpen={modalOpen}
        onClose={(success) => {
          setModalOpen(false);
          setEditingItem(null);
          if (success) carregarCaminhos();
        }}
        trilhas={trilhas}
        suplementos={suplementos}
        caminho={editingItem}
      />
    </div>
  );
}
