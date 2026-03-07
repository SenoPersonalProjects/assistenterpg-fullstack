'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
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
  apiAdminGetTecnicasAmaldicoadas,
  apiAdminCreateTecnicaAmaldicoada,
  apiAdminUpdateTecnicaAmaldicoada,
  apiGetSuplementos,
  extrairMensagemErro,
  TipoTecnicaAmaldicoada,
  type TecnicaAmaldicoadaCatalogo,
  type ListTecnicasFilters,
  type SuplementoCatalogo,
  type TipoFonte,
  type CreateTecnicaPayload,
  type UpdateTecnicaPayload,
} from '@/lib/api';

type DraftFilters = {
  nome: string;
  codigo: string;
  tipo: 'TODOS' | TipoTecnicaAmaldicoada;
  hereditaria: 'TODAS' | 'SIM' | 'NAO';
  fonte: 'TODAS' | TipoFonte;
  suplementoId: string;
};

type TecnicaFormState = {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoTecnicaAmaldicoada;
  hereditaria: boolean;
  clasHereditariosCsv: string;
  linkExterno: string;
  requisitosJson: string;
  fonte: TipoFonte;
  suplementoId: string;
};

const INITIAL_DRAFT_FILTERS: DraftFilters = {
  nome: '',
  codigo: '',
  tipo: 'TODOS',
  hereditaria: 'TODAS',
  fonte: 'TODAS',
  suplementoId: '',
};

function toApiFilters(filtros: DraftFilters): ListTecnicasFilters {
  const mapped: ListTecnicasFilters = {
    incluirClas: true,
  };

  if (filtros.nome.trim()) mapped.nome = filtros.nome.trim();
  if (filtros.codigo.trim()) mapped.codigo = filtros.codigo.trim();
  if (filtros.tipo !== 'TODOS') mapped.tipo = filtros.tipo;
  if (filtros.hereditaria === 'SIM') mapped.hereditaria = true;
  if (filtros.hereditaria === 'NAO') mapped.hereditaria = false;
  if (filtros.fonte !== 'TODAS') mapped.fonte = filtros.fonte;

  if (filtros.fonte === 'SUPLEMENTO' && filtros.suplementoId.trim()) {
    mapped.suplementoId = Number(filtros.suplementoId.trim());
  }

  return mapped;
}

function stringifyUnknown(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '';
  }
}

function parseOptionalJson(input: string): { value?: unknown } {
  const trimmed = input.trim();
  if (!trimmed) return {};

  try {
    return { value: JSON.parse(trimmed) as unknown };
  } catch {
    return { value: trimmed };
  }
}

function parseClasCsv(input: string): string[] | undefined {
  const values = input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const unique = Array.from(new Set(values));
  return unique.length > 0 ? unique : undefined;
}

function extractClaNomes(item?: TecnicaAmaldicoadaCatalogo | null): string[] {
  if (!item?.clasHereditarios?.length) return [];

  return item.clasHereditarios
    .map((cla) => cla.nome)
    .filter((nome): nome is string => typeof nome === 'string' && nome.trim().length > 0);
}

function buildFormState(item?: TecnicaAmaldicoadaCatalogo | null): TecnicaFormState {
  return {
    codigo: item?.codigo ?? '',
    nome: item?.nome ?? '',
    descricao: item?.descricao ?? '',
    tipo: item?.tipo ?? TipoTecnicaAmaldicoada.INATA,
    hereditaria: item?.hereditaria ?? false,
    clasHereditariosCsv: extractClaNomes(item).join(', '),
    linkExterno: item?.linkExterno ?? '',
    requisitosJson: stringifyUnknown(item?.requisitos),
    fonte: item?.fonte ?? ('SISTEMA_BASE' as TipoFonte),
    suplementoId:
      item?.suplementoId !== undefined && item?.suplementoId !== null ? String(item.suplementoId) : '',
  };
}

function formatClasHereditarios(item: TecnicaAmaldicoadaCatalogo): string {
  const nomes = extractClaNomes(item);
  return nomes.length > 0 ? nomes.join(', ') : '-';
}

type ModalProps = {
  isOpen: boolean;
  onClose: (success?: boolean) => void;
  tecnica?: TecnicaAmaldicoadaCatalogo | null;
  suplementos: SuplementoCatalogo[];
};

function TecnicaAdminFormModal({ isOpen, onClose, tecnica, suplementos }: ModalProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<TecnicaFormState>(buildFormState(tecnica));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(tecnica?.id);

  useEffect(() => {
    if (!isOpen) return;
    setForm(buildFormState(tecnica));
    setErrors({});
  }, [isOpen, tecnica]);

  function setField<K extends keyof TecnicaFormState>(key: K, value: TecnicaFormState[K]) {
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

    if (!isEditing && !form.codigo.trim()) next.codigo = 'Codigo e obrigatorio.';
    if (!form.nome.trim()) next.nome = 'Nome e obrigatorio.';
    if (!form.descricao.trim()) next.descricao = 'Descricao e obrigatoria.';
    if (!form.tipo) next.tipo = 'Tipo e obrigatorio.';

    if (form.fonte === 'SUPLEMENTO' && !form.suplementoId.trim()) {
      next.suplementoId = 'Selecione um suplemento.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    const requisitosParsed = parseOptionalJson(form.requisitosJson);
    const suplementoId = toOptionalNumber(form.suplementoId);
    const clasHereditarios = parseClasCsv(form.clasHereditariosCsv);
    const linkExterno = form.linkExterno.trim();
    const requisitos = requisitosParsed.value;

    try {
      setSaving(true);

      if (isEditing && tecnica?.id) {
        const payload: UpdateTecnicaPayload = {
          nome: form.nome.trim(),
          descricao: form.descricao.trim(),
          tipo: form.tipo,
          hereditaria: form.hereditaria,
          clasHereditarios: clasHereditarios ?? [],
          linkExterno: linkExterno || null,
          requisitos: requisitos ?? null,
          fonte: form.fonte,
          suplementoId: form.fonte === 'SUPLEMENTO' ? suplementoId : null,
        };

        await apiAdminUpdateTecnicaAmaldicoada(tecnica.id, payload);
        showToast('Tecnica atualizada com sucesso.', 'success');
      } else {
        const payload: CreateTecnicaPayload = {
          codigo: form.codigo.trim().toUpperCase(),
          nome: form.nome.trim(),
          descricao: form.descricao.trim(),
          tipo: form.tipo,
          hereditaria: form.hereditaria,
          clasHereditarios,
          linkExterno: linkExterno || undefined,
          requisitos,
          fonte: form.fonte,
          suplementoId: form.fonte === 'SUPLEMENTO' ? suplementoId : undefined,
        };

        await apiAdminCreateTecnicaAmaldicoada(payload);
        showToast('Tecnica criada com sucesso.', 'success');
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
      title={isEditing ? 'Editar tecnica' : 'Nova tecnica'}
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
            disabled={isEditing}
            error={errors.codigo}
            helperText={isEditing ? 'Codigo nao pode ser alterado no update.' : undefined}
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
            onChange={(e) => setField('tipo', e.target.value as TipoTecnicaAmaldicoada)}
            error={errors.tipo}
          >
            {Object.values(TipoTecnicaAmaldicoada).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
          <Input
            label="Link externo"
            value={form.linkExterno}
            onChange={(e) => setField('linkExterno', e.target.value)}
            placeholder="https://..."
          />
        </div>

        <Checkbox
          label="Tecnica hereditaria"
          checked={form.hereditaria}
          onChange={(e) => setField('hereditaria', e.target.checked)}
        />

        <Input
          label="Clas hereditarios (nomes CSV)"
          value={form.clasHereditariosCsv}
          onChange={(e) => setField('clasHereditariosCsv', e.target.value)}
          placeholder="Ex: Gojo, Kamo, Zenin"
          helperText="No update, deixe vazio para limpar os clas hereditarios."
        />

        <Textarea
          label="Descricao *"
          rows={4}
          value={form.descricao}
          onChange={(e) => setField('descricao', e.target.value)}
          error={errors.descricao}
        />

        <Textarea
          label="Requisitos (JSON ou texto livre)"
          rows={4}
          value={form.requisitosJson}
          onChange={(e) => setField('requisitosJson', e.target.value)}
          placeholder='Ex: { "nivelMinimo": 5 }'
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

export function TecnicasAdminPanel() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [items, setItems] = useState<TecnicaAmaldicoadaCatalogo[]>([]);
  const [suplementos, setSuplementos] = useState<SuplementoCatalogo[]>([]);
  const [draftFilters, setDraftFilters] = useState<DraftFilters>(INITIAL_DRAFT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<DraftFilters>(INITIAL_DRAFT_FILTERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TecnicaAmaldicoadaCatalogo | null>(null);

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
      const data = await apiAdminGetTecnicasAmaldicoadas(toApiFilters(appliedFilters));
      setItems(data);
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
    setAppliedFilters({ ...draftFilters });
  }

  function limparFiltros() {
    setDraftFilters(INITIAL_DRAFT_FILTERS);
    setAppliedFilters(INITIAL_DRAFT_FILTERS);
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <Input
            label="Nome"
            value={draftFilters.nome}
            onChange={(e) => setDraftFilters((prev) => ({ ...prev, nome: e.target.value }))}
            icon="search"
            placeholder="Busca por nome..."
          />

          <Input
            label="Codigo"
            value={draftFilters.codigo}
            onChange={(e) =>
              setDraftFilters((prev) => ({
                ...prev,
                codigo: e.target.value.toUpperCase(),
              }))
            }
            placeholder="Ex: TEC_..."
          />

          <Select
            label="Tipo"
            value={draftFilters.tipo}
            onChange={(e) =>
              setDraftFilters((prev) => ({ ...prev, tipo: e.target.value as DraftFilters['tipo'] }))
            }
          >
            <option value="TODOS">Todos</option>
            {Object.values(TipoTecnicaAmaldicoada).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>

          <Select
            label="Hereditaria"
            value={draftFilters.hereditaria}
            onChange={(e) =>
              setDraftFilters((prev) => ({
                ...prev,
                hereditaria: e.target.value as DraftFilters['hereditaria'],
              }))
            }
          >
            <option value="TODAS">Todas</option>
            <option value="SIM">Somente hereditarias</option>
            <option value="NAO">Somente nao hereditarias</option>
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
            <Input label="Suplemento" value="" disabled helperText="Somente quando fonte = SUPLEMENTO." />
          )}
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
            Nova tecnica
          </Button>
        </div>
      </Card>

      {erro && <ErrorAlert message={erro} />}

      <Card>
        {loading ? (
          <Loading message="Carregando tecnicas..." className="py-8 text-app-fg" />
        ) : items.length === 0 ? (
          <EmptyState
            variant="card"
            icon="technique"
            title="Nenhuma tecnica encontrada"
            description="Ajuste os filtros ou crie uma nova tecnica."
          />
        ) : (
          <div className="space-y-4">
            <div className="text-xs text-app-muted">Total: {items.length}</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-app-border text-left text-app-muted">
                    <th className="py-2 pr-2">ID</th>
                    <th className="py-2 pr-2">Codigo</th>
                    <th className="py-2 pr-2">Nome</th>
                    <th className="py-2 pr-2">Tipo</th>
                    <th className="py-2 pr-2">Hereditaria</th>
                    <th className="py-2 pr-2">Fonte</th>
                    <th className="py-2 pr-2">Suplemento</th>
                    <th className="py-2 pr-2">Clas</th>
                    <th className="py-2 text-right">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-app-border/60">
                      <td className="py-3 pr-2 text-app-muted">#{item.id}</td>
                      <td className="py-3 pr-2 text-app-fg">{item.codigo}</td>
                      <td className="py-3 pr-2">
                        <div className="text-app-fg font-medium">{item.nome}</div>
                        {item.descricao && (
                          <div className="text-xs text-app-muted line-clamp-1">{item.descricao}</div>
                        )}
                      </td>
                      <td className="py-3 pr-2 text-app-fg">{item.tipo}</td>
                      <td className="py-3 pr-2 text-app-fg">{item.hereditaria ? 'Sim' : 'Nao'}</td>
                      <td className="py-3 pr-2">
                        <Badge size="sm" color={fonteBadgeColor(item.fonte)}>
                          {formatFonte(item.fonte)}
                        </Badge>
                      </td>
                      <td className="py-3 pr-2 text-app-fg">
                        {item.suplementoId ? suplementosById.get(item.suplementoId) ?? `#${item.suplementoId}` : '-'}
                      </td>
                      <td className="py-3 pr-2 text-app-fg">{formatClasHereditarios(item)}</td>
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
          </div>
        )}
      </Card>

      <TecnicaAdminFormModal
        isOpen={modalOpen}
        onClose={(success) => {
          setModalOpen(false);
          setEditingItem(null);
          if (success) carregarDados();
        }}
        tecnica={editingItem}
        suplementos={suplementos}
      />
    </div>
  );
}
