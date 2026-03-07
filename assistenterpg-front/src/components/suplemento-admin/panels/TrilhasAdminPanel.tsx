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
  apiGetClasses,
  apiGetSuplementos,
  apiAdminGetTrilhas,
  apiAdminCreateTrilha,
  apiAdminUpdateTrilha,
  extrairMensagemErro,
  type ClasseCatalogo,
  type TrilhaCatalogo,
  type SuplementoCatalogo,
  type TipoFonte,
  type CreateTrilhaPayload,
  type UpdateTrilhaPayload,
} from '@/lib/api';

type TrilhaFormState = {
  classeId: string;
  nome: string;
  descricao: string;
  fonte: TipoFonte;
  suplementoId: string;
};

function buildFormState(item?: TrilhaCatalogo | null): TrilhaFormState {
  return {
    classeId: item?.classeId ? String(item.classeId) : '',
    nome: item?.nome ?? '',
    descricao: item?.descricao ?? '',
    fonte: item?.fonte ?? ('SISTEMA_BASE' as TipoFonte),
    suplementoId:
      item?.suplementoId !== undefined && item?.suplementoId !== null ? String(item.suplementoId) : '',
  };
}

type ModalProps = {
  isOpen: boolean;
  onClose: (success?: boolean) => void;
  classes: ClasseCatalogo[];
  suplementos: SuplementoCatalogo[];
  trilha?: TrilhaCatalogo | null;
};

function TrilhaAdminFormModal({ isOpen, onClose, classes, suplementos, trilha }: ModalProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<TrilhaFormState>(buildFormState(trilha));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(trilha?.id);

  useEffect(() => {
    if (!isOpen) return;
    setForm(buildFormState(trilha));
    setErrors({});
  }, [isOpen, trilha]);

  function setField<K extends keyof TrilhaFormState>(key: K, value: TrilhaFormState[K]) {
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
    if (!form.classeId.trim()) next.classeId = 'Classe e obrigatoria.';
    if (!form.nome.trim()) next.nome = 'Nome e obrigatorio.';
    if (form.fonte === 'SUPLEMENTO' && !form.suplementoId.trim()) {
      next.suplementoId = 'Selecione um suplemento.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    const payloadBase: CreateTrilhaPayload = {
      classeId: Number(form.classeId),
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || undefined,
      fonte: form.fonte,
      suplementoId: form.fonte === 'SUPLEMENTO' ? toOptionalNumber(form.suplementoId) : undefined,
    };

    try {
      setSaving(true);
      if (isEditing && trilha?.id) {
        const payloadUpdate: UpdateTrilhaPayload = {
          ...payloadBase,
          suplementoId: form.fonte === 'SUPLEMENTO' ? toOptionalNumber(form.suplementoId) : null,
        };
        await apiAdminUpdateTrilha(trilha.id, payloadUpdate);
        showToast('Trilha atualizada com sucesso.', 'success');
      } else {
        await apiAdminCreateTrilha(payloadBase);
        showToast('Trilha criada com sucesso.', 'success');
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
      title={isEditing ? 'Editar trilha' : 'Nova trilha'}
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
          label="Classe *"
          value={form.classeId}
          onChange={(e) => setField('classeId', e.target.value)}
          error={errors.classeId}
        >
          <option value="">Selecione...</option>
          {classes.map((item) => (
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

export function TrilhasAdminPanel() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [items, setItems] = useState<TrilhaCatalogo[]>([]);
  const [classes, setClasses] = useState<ClasseCatalogo[]>([]);
  const [suplementos, setSuplementos] = useState<SuplementoCatalogo[]>([]);
  const [busca, setBusca] = useState('');
  const [classeFiltro, setClasseFiltro] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TrilhaCatalogo | null>(null);

  const classesById = useMemo(() => {
    const map = new Map<number, string>();
    classes.forEach((item) => map.set(item.id, item.nome));
    return map;
  }, [classes]);

  const suplementosById = useMemo(() => {
    const map = new Map<number, string>();
    suplementos.forEach((item) => map.set(item.id, item.nome));
    return map;
  }, [suplementos]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return items.filter((item) => {
      const matchBusca = !termo || item.nome.toLowerCase().includes(termo);
      const matchClasse = !classeFiltro || String(item.classeId) === classeFiltro;
      return matchBusca && matchClasse;
    });
  }, [items, busca, classeFiltro]);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const classeIdFiltro = classeFiltro ? Number(classeFiltro) : undefined;
      const [trilhasData, classesData, suplementosData] = await Promise.all([
        apiAdminGetTrilhas(classeIdFiltro),
        apiGetClasses(),
        apiGetSuplementos(),
      ]);
      setItems(trilhasData);
      setClasses(classesData);
      setSuplementos(suplementosData);
    } catch (error) {
      const mensagem = extrairMensagemErro(error);
      setErro(mensagem);
      showToast(mensagem, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, classeFiltro]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return (
    <div className="space-y-4">
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            label="Buscar por nome"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            icon="search"
            placeholder="Digite o nome da trilha..."
          />
          <Select
            label="Classe (filtro backend)"
            value={classeFiltro}
            onChange={(e) => setClasseFiltro(e.target.value)}
          >
            <option value="">Todas</option>
            {classes.map((item) => (
              <option key={item.id} value={String(item.id)}>
                #{item.id} - {item.nome}
              </option>
            ))}
          </Select>
          <div className="flex items-end gap-2">
            <Button variant="secondary" onClick={carregarDados}>
              Atualizar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setEditingItem(null);
                setModalOpen(true);
              }}
            >
              <Icon name="add" className="w-4 h-4 mr-1" />
              Nova trilha
            </Button>
          </div>
        </div>
      </Card>

      {erro && <ErrorAlert message={erro} />}

      <Card>
        {loading ? (
          <Loading message="Carregando trilhas..." className="py-8 text-app-fg" />
        ) : filtrados.length === 0 ? (
          <EmptyState
            variant="card"
            icon="training"
            title="Nenhuma trilha encontrada"
            description="Ajuste os filtros ou crie uma nova trilha."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-app-border text-left text-app-muted">
                  <th className="py-2 pr-2">ID</th>
                  <th className="py-2 pr-2">Nome</th>
                  <th className="py-2 pr-2">Classe</th>
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
                    <td className="py-3 pr-2 text-app-fg">{classesById.get(item.classeId) ?? `#${item.classeId}`}</td>
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

      <TrilhaAdminFormModal
        isOpen={modalOpen}
        onClose={(success) => {
          setModalOpen(false);
          setEditingItem(null);
          if (success) carregarDados();
        }}
        classes={classes}
        suplementos={suplementos}
        trilha={editingItem}
      />
    </div>
  );
}
