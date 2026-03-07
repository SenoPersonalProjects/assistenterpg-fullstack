'use client';

import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import type {
  HabilidadeCatalogo,
  SuplementoCatalogo,
  TipoFonte,
  TipoHabilidadeCatalogo,
  CreateHabilidadePayload,
  UpdateHabilidadePayload,
} from '@/lib/api';

type Props = {
  isOpen: boolean;
  onClose: (success?: boolean) => void;
  onSubmitCreate: (payload: CreateHabilidadePayload) => Promise<void>;
  onSubmitUpdate: (id: number, payload: UpdateHabilidadePayload) => Promise<void>;
  suplementos: SuplementoCatalogo[];
  habilidade?: HabilidadeCatalogo | null;
};

type FormState = {
  nome: string;
  descricao: string;
  tipo: TipoHabilidadeCatalogo;
  origem: string;
  fonte: TipoFonte;
  suplementoId: string;
  requisitosJson: string;
  mecanicasJson: string;
};

const TIPO_HABILIDADE_OPTIONS: Array<{ value: TipoHabilidadeCatalogo; label: string }> = [
  { value: 'PODER_GENERICO', label: 'Poder Generico' },
  { value: 'RECURSO_CLASSE', label: 'Recurso de Classe' },
  { value: 'EFEITO_GRAU', label: 'Efeito de Grau' },
  { value: 'MECANICA_ESPECIAL', label: 'Mecanica Especial' },
  { value: 'HABILIDADE_ORIGEM', label: 'Habilidade de Origem' },
  { value: 'HABILIDADE_TRILHA', label: 'Habilidade de Trilha' },
  { value: 'ESCOLA_TECNICA', label: 'Escola Tecnica' },
];

const FONTE_OPTIONS: Array<{ value: TipoFonte; label: string }> = [
  { value: 'SISTEMA_BASE' as TipoFonte, label: 'Sistema Base' },
  { value: 'SUPLEMENTO' as TipoFonte, label: 'Suplemento' },
  { value: 'HOMEBREW' as TipoFonte, label: 'Homebrew' },
];

function stringifyUnknown(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '';
  }
}

function parseOptionalJson(input: string): { value?: unknown; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) return {};

  try {
    return { value: JSON.parse(trimmed) as unknown };
  } catch {
    return { error: 'JSON invalido em campo opcional.' };
  }
}

function buildInitialState(habilidade?: HabilidadeCatalogo | null): FormState {
  return {
    nome: habilidade?.nome ?? '',
    descricao: habilidade?.descricao ?? '',
    tipo: (habilidade?.tipo as TipoHabilidadeCatalogo) ?? 'PODER_GENERICO',
    origem: typeof habilidade?.origem === 'string' ? habilidade.origem : '',
    fonte: habilidade?.fonte ?? ('SISTEMA_BASE' as TipoFonte),
    suplementoId:
      habilidade?.suplementoId !== undefined && habilidade?.suplementoId !== null
        ? habilidade.suplementoId.toString()
        : '',
    requisitosJson: stringifyUnknown(habilidade?.requisitos),
    mecanicasJson: stringifyUnknown(habilidade?.mecanicasEspeciais),
  };
}

export function ModalHabilidadeAdminForm({
  isOpen,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  suplementos,
  habilidade,
}: Props) {
  const [form, setForm] = useState<FormState>(buildInitialState(habilidade));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(buildInitialState(habilidade));
    setErrors({});
  }, [habilidade, isOpen]);

  const isEditing = Boolean(habilidade?.id);
  const titulo = isEditing ? 'Editar habilidade' : 'Nova habilidade';

  const suplementosPublicados = useMemo(
    () => suplementos.filter((item) => item.status === 'PUBLICADO' || item.status === 'RASCUNHO'),
    [suplementos],
  );

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validateForm(): boolean {
    const nextErrors: Record<string, string> = {};

    if (!form.nome.trim()) nextErrors.nome = 'Nome e obrigatorio.';
    if (!form.tipo) nextErrors.tipo = 'Tipo e obrigatorio.';

    if (form.fonte === 'SUPLEMENTO' && !form.suplementoId.trim()) {
      nextErrors.suplementoId = 'Selecione um suplemento quando a fonte for SUPLEMENTO.';
    }

    const reqParsed = parseOptionalJson(form.requisitosJson);
    if (reqParsed.error) nextErrors.requisitosJson = reqParsed.error;

    const mecParsed = parseOptionalJson(form.mecanicasJson);
    if (mecParsed.error) nextErrors.mecanicasJson = mecParsed.error;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSave() {
    if (!validateForm()) return;

    const requisitosParsed = parseOptionalJson(form.requisitosJson);
    const mecanicasParsed = parseOptionalJson(form.mecanicasJson);

    const fonte = form.fonte;
    const suplementoIdNumber =
      form.suplementoId.trim().length > 0 ? Number(form.suplementoId.trim()) : undefined;

    const basePayload: Omit<CreateHabilidadePayload, 'tipo'> & {
      tipo: TipoHabilidadeCatalogo;
    } = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || undefined,
      tipo: form.tipo,
      origem: form.origem.trim() || undefined,
      requisitos: requisitosParsed.value,
      mecanicasEspeciais: mecanicasParsed.value,
      fonte,
      suplementoId: fonte === 'SUPLEMENTO' ? suplementoIdNumber : undefined,
    };

    try {
      setSaving(true);

      if (isEditing && habilidade?.id) {
        const updatePayload: UpdateHabilidadePayload = {
          ...basePayload,
          suplementoId: fonte === 'SUPLEMENTO' ? suplementoIdNumber : null,
        };
        await onSubmitUpdate(habilidade.id, updatePayload);
      } else {
        await onSubmitCreate(basePayload);
      }

      onClose(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      title={titulo}
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
              <>
                <Icon name="check" className="w-4 h-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome *"
              value={form.nome}
              onChange={(e) => setField('nome', e.target.value)}
              error={errors.nome}
              placeholder="Ex: Golpe Harmonico"
            />

            <Select
              label="Tipo *"
              value={form.tipo}
              onChange={(e) => setField('tipo', e.target.value as TipoHabilidadeCatalogo)}
              error={errors.tipo}
            >
              {TIPO_HABILIDADE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>

            <Select
              label="Fonte *"
              value={form.fonte}
              onChange={(e) => setField('fonte', e.target.value as TipoFonte)}
            >
              {FONTE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>

            {form.fonte === 'SUPLEMENTO' ? (
              <Select
                label="Suplemento *"
                value={form.suplementoId}
                onChange={(e) => setField('suplementoId', e.target.value)}
                error={errors.suplementoId}
              >
                <option value="">Selecione...</option>
                {suplementosPublicados.map((suplemento) => (
                  <option key={suplemento.id} value={suplemento.id.toString()}>
                    #{suplemento.id} - {suplemento.nome}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                label="Suplemento"
                value=""
                disabled
                helperText="Nao aplicavel para esta fonte."
              />
            )}

            <Input
              label="Origem"
              value={form.origem}
              onChange={(e) => setField('origem', e.target.value)}
              placeholder="Ex: Classe, Trilha, Especial..."
            />
          </div>

          <div className="mt-4">
            <Textarea
              label="Descricao"
              value={form.descricao}
              onChange={(e) => setField('descricao', e.target.value)}
              rows={4}
            />
          </div>
        </Card>

        <Card>
          <div className="grid grid-cols-1 gap-4">
            <Textarea
              label="Requisitos (JSON)"
              value={form.requisitosJson}
              onChange={(e) => setField('requisitosJson', e.target.value)}
              error={errors.requisitosJson}
              rows={4}
              placeholder='Ex: { "nivelMinimo": 3 }'
            />
            <Textarea
              label="Mecanicas Especiais (JSON)"
              value={form.mecanicasJson}
              onChange={(e) => setField('mecanicasJson', e.target.value)}
              error={errors.mecanicasJson}
              rows={4}
              placeholder='Ex: { "critico": "+2d6" }'
            />
          </div>
        </Card>
      </div>
    </Modal>
  );
}
