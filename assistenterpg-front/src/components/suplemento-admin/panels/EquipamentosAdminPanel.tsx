'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { FonteSuplementoFields } from '../common/FonteSuplementoFields';
import { FONTE_OPTIONS, fonteBadgeColor, formatFonte, toOptionalNumber } from '../common/fonte-utils';
import {
  apiAdminGetEquipamentos,
  apiAdminCreateEquipamento,
  apiAdminUpdateEquipamento,
  apiGetSuplementos,
  extrairMensagemErro,
  TipoEquipamento,
  CategoriaEquipamento,
  ComplexidadeMaldicao,
  type EquipamentoResumoDto,
  type ListResult,
  type ListEquipamentosFilters,
  type SuplementoCatalogo,
  type TipoFonte,
  type CreateEquipamentoPayload,
  type UpdateEquipamentoPayload,
} from '@/lib/api';

type DraftFilters = {
  busca: string;
  tipo: 'TODOS' | TipoEquipamento;
  fonte: 'TODAS' | TipoFonte;
  suplementoId: string;
  limite: number;
};

type AppliedFilters = DraftFilters & {
  pagina: number;
};

type EquipamentoFormState = {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoEquipamento;
  categoria: '' | CategoriaEquipamento;
  espacos: string;
  complexidadeMaldicao: '' | ComplexidadeMaldicao;
  fonte: TipoFonte;
  suplementoId: string;
};

const LIMIT_OPTIONS = [10, 20, 50];

const INITIAL_DRAFT_FILTERS: DraftFilters = {
  busca: '',
  tipo: 'TODOS',
  fonte: 'TODAS',
  suplementoId: '',
  limite: 20,
};

function toApiFilters(filtros: AppliedFilters): ListEquipamentosFilters {
  const mapped: ListEquipamentosFilters = {
    pagina: filtros.pagina,
    limite: filtros.limite,
  };

  if (filtros.busca.trim()) mapped.busca = filtros.busca.trim();
  if (filtros.tipo !== 'TODOS') mapped.tipo = filtros.tipo;
  if (filtros.fonte !== 'TODAS') mapped.fontes = [filtros.fonte];
  if (filtros.fonte === 'SUPLEMENTO' && filtros.suplementoId.trim()) {
    mapped.suplementoId = Number(filtros.suplementoId.trim());
  }

  return mapped;
}

function buildFormState(item?: EquipamentoResumoDto | null): EquipamentoFormState {
  return {
    codigo: item?.codigo ?? '',
    nome: item?.nome ?? '',
    descricao: item?.descricao ?? '',
    tipo: (item?.tipo as TipoEquipamento) ?? TipoEquipamento.GENERICO,
    categoria: (item?.categoria as CategoriaEquipamento) ?? '',
    espacos: item?.espacos !== undefined ? String(item.espacos) : '',
    complexidadeMaldicao: (item?.complexidadeMaldicao as ComplexidadeMaldicao) ?? '',
    fonte: item?.fonte ?? ('SISTEMA_BASE' as TipoFonte),
    suplementoId:
      item?.suplementoId !== undefined && item?.suplementoId !== null ? String(item.suplementoId) : '',
  };
}

type ModalProps = {
  isOpen: boolean;
  onClose: (success?: boolean) => void;
  equipamento?: EquipamentoResumoDto | null;
  suplementos: SuplementoCatalogo[];
};

function EquipamentoAdminFormModal({ isOpen, onClose, equipamento, suplementos }: ModalProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<EquipamentoFormState>(buildFormState(equipamento));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(equipamento?.id);

  useEffect(() => {
    if (!isOpen) return;
    setForm(buildFormState(equipamento));
    setErrors({});
  }, [isOpen, equipamento]);

  function setField<K extends keyof EquipamentoFormState>(key: K, value: EquipamentoFormState[K]) {
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
    if (!form.tipo) next.tipo = 'Tipo e obrigatorio.';
    if (form.fonte === 'SUPLEMENTO' && !form.suplementoId.trim()) {
      next.suplementoId = 'Selecione um suplemento.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    const payloadBase: CreateEquipamentoPayload = {
      codigo: form.codigo.trim().toUpperCase(),
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || undefined,
      tipo: form.tipo,
      categoria: form.categoria || undefined,
      espacos: form.espacos.trim() ? Number(form.espacos.trim()) : undefined,
      complexidadeMaldicao: form.complexidadeMaldicao || undefined,
      fonte: form.fonte,
      suplementoId: form.fonte === 'SUPLEMENTO' ? toOptionalNumber(form.suplementoId) : undefined,
    };

    try {
      setSaving(true);
      if (isEditing && equipamento?.id) {
        const payloadUpdate: UpdateEquipamentoPayload = {
          ...payloadBase,
          suplementoId: form.fonte === 'SUPLEMENTO' ? toOptionalNumber(form.suplementoId) : null,
        };
        await apiAdminUpdateEquipamento(equipamento.id, payloadUpdate);
        showToast('Equipamento atualizado com sucesso.', 'success');
      } else {
        await apiAdminCreateEquipamento(payloadBase);
        showToast('Equipamento criado com sucesso.', 'success');
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
      title={isEditing ? 'Editar equipamento' : 'Novo equipamento'}
      size="xl"
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
            onChange={(e) => setField('codigo', e.target.value.toUpperCase())}
            error={errors.codigo}
          />
          <Input
            label="Nome *"
            value={form.nome}
            onChange={(e) => setField('nome', e.target.value)}
            error={errors.nome}
          />
          <Select
            label="Tipo *"
            value={form.tipo}
            onChange={(e) => setField('tipo', e.target.value as TipoEquipamento)}
            error={errors.tipo}
          >
            {Object.values(TipoEquipamento).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
          <Select
            label="Categoria"
            value={form.categoria}
            onChange={(e) => setField('categoria', e.target.value as '' | CategoriaEquipamento)}
          >
            <option value="">Nao definida</option>
            {Object.values(CategoriaEquipamento).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
          <Input
            label="Espacos"
            type="number"
            min={0}
            value={form.espacos}
            onChange={(e) => setField('espacos', e.target.value)}
          />
          <Select
            label="Complexidade da maldicao"
            value={form.complexidadeMaldicao}
            onChange={(e) =>
              setField('complexidadeMaldicao', e.target.value as '' | ComplexidadeMaldicao)
            }
          >
            <option value="">Nao definida</option>
            {Object.values(ComplexidadeMaldicao).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </div>

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

export function EquipamentosAdminPanel() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [result, setResult] = useState<ListResult<EquipamentoResumoDto>>({
    items: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [suplementos, setSuplementos] = useState<SuplementoCatalogo[]>([]);
  const [draftFilters, setDraftFilters] = useState<DraftFilters>(INITIAL_DRAFT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({
    ...INITIAL_DRAFT_FILTERS,
    pagina: 1,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipamentoResumoDto | null>(null);

  const suplementosById = useMemo(() => {
    const map = new Map<number, string>();
    suplementos.forEach((item) => map.set(item.id, item.nome));
    return map;
  }, [suplementos]);

  const carregarSuplementos = useCallback(async () => {
    try {
      const data = await apiGetSuplementos();
      setSuplementos(data);
    } catch (error) {
      showToast(extrairMensagemErro(error), 'error');
    }
  }, [showToast]);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = await apiAdminGetEquipamentos(toApiFilters(appliedFilters));
      setResult(data);
    } catch (error) {
      const mensagem = extrairMensagemErro(error);
      setErro(mensagem);
      showToast(mensagem, 'error');
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, showToast]);

  useEffect(() => {
    carregarSuplementos();
  }, [carregarSuplementos]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  function aplicarFiltros() {
    setAppliedFilters({
      ...draftFilters,
      pagina: 1,
    });
  }

  function limparFiltros() {
    setDraftFilters(INITIAL_DRAFT_FILTERS);
    setAppliedFilters({
      ...INITIAL_DRAFT_FILTERS,
      pagina: 1,
    });
  }

  function mudarPagina(page: number) {
    if (page < 1 || page > result.totalPages) return;
    setAppliedFilters((prev) => ({ ...prev, pagina: page }));
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input
            label="Busca"
            value={draftFilters.busca}
            onChange={(e) => setDraftFilters((prev) => ({ ...prev, busca: e.target.value }))}
            icon="search"
            placeholder="Nome ou codigo..."
          />

          <Select
            label="Tipo"
            value={draftFilters.tipo}
            onChange={(e) =>
              setDraftFilters((prev) => ({ ...prev, tipo: e.target.value as DraftFilters['tipo'] }))
            }
          >
            <option value="TODOS">Todos</option>
            {Object.values(TipoEquipamento).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>

          <Select
            label="Fonte"
            value={draftFilters.fonte}
            onChange={(e) =>
              setDraftFilters((prev) => ({
                ...prev,
                fonte: e.target.value as DraftFilters['fonte'],
                suplementoId: e.target.value === 'SUPLEMENTO' ? prev.suplementoId : '',
              }))
            }
          >
            <option value="TODAS">Todas</option>
            {FONTE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          {draftFilters.fonte === 'SUPLEMENTO' ? (
            <Select
              label="Suplemento"
              value={draftFilters.suplementoId}
              onChange={(e) => setDraftFilters((prev) => ({ ...prev, suplementoId: e.target.value }))}
            >
              <option value="">Todos</option>
              {suplementos.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  #{item.id} - {item.nome}
                </option>
              ))}
            </Select>
          ) : (
            <Input label="Suplemento" value="" disabled helperText="Somente para fonte SUPLEMENTO." />
          )}

          <Select
            label="Itens por pagina"
            value={String(draftFilters.limite)}
            onChange={(e) => setDraftFilters((prev) => ({ ...prev, limite: Number(e.target.value) }))}
          >
            {LIMIT_OPTIONS.map((value) => (
              <option key={value} value={String(value)}>
                {value}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Button variant="primary" onClick={aplicarFiltros}>
            Aplicar filtros
          </Button>
          <Button variant="secondary" onClick={limparFiltros}>
            Limpar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
          >
            <Icon name="add" className="w-4 h-4 mr-1" />
            Novo equipamento
          </Button>
        </div>
      </Card>

      {erro && <ErrorAlert message={erro} />}

      <Card>
        {loading ? (
          <Loading message="Carregando equipamentos..." className="py-8 text-app-fg" />
        ) : result.items.length === 0 ? (
          <EmptyState
            variant="card"
            icon="item"
            title="Nenhum equipamento encontrado"
            description="Ajuste os filtros ou crie um novo equipamento."
          />
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-app-border text-left text-app-muted">
                    <th className="py-2 pr-2">ID</th>
                    <th className="py-2 pr-2">Codigo</th>
                    <th className="py-2 pr-2">Nome</th>
                    <th className="py-2 pr-2">Tipo</th>
                    <th className="py-2 pr-2">Fonte</th>
                    <th className="py-2 pr-2">Suplemento</th>
                    <th className="py-2 text-right">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item) => (
                    <tr key={item.id} className="border-b border-app-border/60">
                      <td className="py-3 pr-2 text-app-muted">#{item.id}</td>
                      <td className="py-3 pr-2 text-app-fg">{item.codigo}</td>
                      <td className="py-3 pr-2 text-app-fg font-medium">{item.nome}</td>
                      <td className="py-3 pr-2 text-app-fg">{item.tipo}</td>
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

            <div className="flex items-center justify-between">
              <div className="text-xs text-app-muted">
                Pagina {result.page} de {result.totalPages} - Total {result.total}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={result.page <= 1}
                  onClick={() => mudarPagina(result.page - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={result.page >= result.totalPages}
                  onClick={() => mudarPagina(result.page + 1)}
                >
                  Proxima
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <EquipamentoAdminFormModal
        isOpen={modalOpen}
        onClose={(success) => {
          setModalOpen(false);
          setEditingItem(null);
          if (success) carregarDados();
        }}
        equipamento={editingItem}
        suplementos={suplementos}
      />
    </div>
  );
}
