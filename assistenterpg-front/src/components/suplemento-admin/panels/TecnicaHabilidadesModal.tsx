'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  apiAdminGetHabilidadesDaTecnica,
  apiAdminCreateHabilidadeDaTecnica,
  apiAdminUpdateHabilidadeDaTecnica,
  apiAdminDeleteHabilidadeDaTecnica,
  apiAdminGetVariacoesDaHabilidadeTecnica,
  apiAdminCreateVariacaoDaHabilidadeTecnica,
  apiAdminUpdateVariacaoDaHabilidadeTecnica,
  apiAdminDeleteVariacaoDaHabilidadeTecnica,
  extrairMensagemErro,
  TipoExecucao,
  AreaEfeito,
  TipoDano,
  TIPO_EXECUCAO_LABELS,
  AREA_EFEITO_LABELS,
  TIPO_DANO_LABELS,
  type TecnicaAmaldicoadaCatalogo,
  type HabilidadeTecnicaCatalogo,
  type VariacaoHabilidadeTecnicaCatalogo,
  type CreateHabilidadeTecnicaPayload,
  type UpdateHabilidadeTecnicaPayload,
  type CreateVariacaoHabilidadeTecnicaPayload,
  type UpdateVariacaoHabilidadeTecnicaPayload,
} from '@/lib/api';

type Props = {
  isOpen: boolean;
  tecnica: TecnicaAmaldicoadaCatalogo | null;
  onClose: (success?: boolean) => void;
};

type DadoDanoDraft = {
  quantidade: string;
  dado: string;
  tipo: '' | TipoDano;
};

type RequisitoDraft = {
  chave: string;
  valor: string;
};

type HabilidadeFormState = {
  codigo: string;
  nome: string;
  descricao: string;
  execucao: TipoExecucao;
  area: '' | AreaEfeito;
  alcance: string;
  alvo: string;
  duracao: string;
  resistencia: string;
  dtResistencia: string;
  custoPE: string;
  custoEA: string;
  criticoValor: string;
  criticoMultiplicador: string;
  danoFlat: string;
  danoFlatTipo: '' | TipoDano;
  escalonaPorGrau: boolean;
  grauTipoGrauCodigo: string;
  escalonamentoCustoEA: string;
  efeito: string;
  ordem: string;
  requisitosModo: 'guiado' | 'json';
  requisitosItens: RequisitoDraft[];
  requisitosNovaChave: string;
  requisitosNovoValor: string;
  requisitosJson: string;
  testesExigidosInput: string;
  testesExigidosLista: string[];
  dadosDano: DadoDanoDraft[];
  escalonamentoDanoAtivo: boolean;
  escalonamentoDanoQuantidade: string;
  escalonamentoDanoDado: string;
  escalonamentoDanoTipo: '' | TipoDano;
};

type VariacaoFormState = {
  nome: string;
  descricao: string;
  substituiCustos: boolean;
  custoPE: string;
  custoEA: string;
  execucao: '' | TipoExecucao;
  area: '' | AreaEfeito;
  alcance: string;
  alvo: string;
  duracao: string;
  resistencia: string;
  dtResistencia: string;
  criticoValor: string;
  criticoMultiplicador: string;
  danoFlat: string;
  danoFlatTipo: '' | TipoDano;
  escalonaPorGrau: boolean;
  escalonamentoCustoEA: string;
  efeitoAdicional: string;
  ordem: string;
  requisitosModo: 'guiado' | 'json';
  requisitosItens: RequisitoDraft[];
  requisitosNovaChave: string;
  requisitosNovoValor: string;
  requisitosJson: string;
  dadosDano: DadoDanoDraft[];
  escalonamentoDanoAtivo: boolean;
  escalonamentoDanoQuantidade: string;
  escalonamentoDanoDado: string;
  escalonamentoDanoTipo: '' | TipoDano;
};

function parseNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
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

function parseLooseJsonValue(value: string): unknown {
  const trimmed = value.trim();
  if (!trimmed) return '';

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return value;
  }
}

function parseRequisitosState(value: unknown): {
  modo: 'guiado' | 'json';
  itens: RequisitoDraft[];
  json: string;
} {
  if (isObjectLike(value)) {
    return {
      modo: 'guiado',
      itens: Object.entries(value).map(([chave, item]) => ({
        chave,
        valor: stringifyUnknown(item),
      })),
      json: stringifyUnknown(value),
    };
  }

  if (value !== undefined && value !== null) {
    return {
      modo: 'json',
      itens: [],
      json: stringifyUnknown(value),
    };
  }

  return {
    modo: 'guiado',
    itens: [],
    json: '',
  };
}

function serializeRequisitosGuiados(itens: RequisitoDraft[]): Record<string, unknown> | undefined {
  const entries = itens
    .map((item) => ({
      chave: item.chave.trim(),
      valor: parseLooseJsonValue(item.valor),
    }))
    .filter((item) => item.chave.length > 0);

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries.map((item) => [item.chave, item.valor]));
}

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseTestesExigidos(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);
  }

  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
}

function parseDadosDano(value: unknown): DadoDanoDraft[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!isObjectLike(item)) return null;

      const quantidade =
        typeof item.quantidade === 'number' && Number.isFinite(item.quantidade)
          ? String(item.quantidade)
          : '';
      const dado = typeof item.dado === 'string' ? item.dado : '';
      const tipo = typeof item.tipo === 'string' ? (item.tipo as TipoDano) : '';

      return { quantidade, dado, tipo };
    })
    .filter((item): item is DadoDanoDraft => item !== null);
}

function serializeDadosDano(value: DadoDanoDraft[]): Array<{ quantidade: number; dado: string; tipo: TipoDano }> {
  return value
    .map((item) => {
      const quantidade = parseNumber(item.quantidade);
      const dado = item.dado.trim();
      const tipo = item.tipo;

      if (!quantidade || quantidade < 1 || !dado || !tipo) {
        return null;
      }

      return { quantidade, dado, tipo };
    })
    .filter((item): item is { quantidade: number; dado: string; tipo: TipoDano } => item !== null);
}

function parseEscalonamentoDano(value: unknown): {
  ativo: boolean;
  quantidade: string;
  dado: string;
  tipo: '' | TipoDano;
} {
  if (!isObjectLike(value)) {
    return { ativo: false, quantidade: '', dado: '', tipo: '' };
  }

  const quantidade =
    typeof value.quantidade === 'number' && Number.isFinite(value.quantidade)
      ? String(value.quantidade)
      : '';
  const dado = typeof value.dado === 'string' ? value.dado : '';
  const tipo = typeof value.tipo === 'string' ? (value.tipo as TipoDano) : '';

  const ativo = quantidade.length > 0 || dado.length > 0 || tipo.length > 0;
  return { ativo, quantidade, dado, tipo };
}

function serializeEscalonamentoDano(
  ativo: boolean,
  quantidade: string,
  dado: string,
  tipo: '' | TipoDano,
): { quantidade: number; dado: string; tipo: TipoDano } | null {
  if (!ativo) return null;

  const quantidadeFinal = parseNumber(quantidade);
  const dadoFinal = dado.trim();

  if (!quantidadeFinal || quantidadeFinal < 1 || !dadoFinal || !tipo) {
    return null;
  }

  return {
    quantidade: quantidadeFinal,
    dado: dadoFinal,
    tipo,
  };
}

function buildHabilidadeFormState(item?: HabilidadeTecnicaCatalogo | null): HabilidadeFormState {
  const testesExigidosLista = parseTestesExigidos(item?.testesExigidos);
  const dadosDano = parseDadosDano(item?.dadosDano);
  const escalonamentoDano = parseEscalonamentoDano(item?.escalonamentoDano);
  const requisitos = parseRequisitosState(item?.requisitos);

  return {
    codigo: item?.codigo ?? '',
    nome: item?.nome ?? '',
    descricao: item?.descricao ?? '',
    execucao: item?.execucao ?? TipoExecucao.ACAO_PADRAO,
    area: item?.area ?? '',
    alcance: item?.alcance ?? '',
    alvo: item?.alvo ?? '',
    duracao: item?.duracao ?? '',
    resistencia: item?.resistencia ?? '',
    dtResistencia: item?.dtResistencia ?? '',
    custoPE: String(item?.custoPE ?? 0),
    custoEA: String(item?.custoEA ?? 0),
    criticoValor:
      item?.criticoValor !== undefined && item?.criticoValor !== null ? String(item.criticoValor) : '',
    criticoMultiplicador:
      item?.criticoMultiplicador !== undefined && item?.criticoMultiplicador !== null
        ? String(item.criticoMultiplicador)
        : '',
    danoFlat: item?.danoFlat !== undefined && item?.danoFlat !== null ? String(item.danoFlat) : '',
    danoFlatTipo: item?.danoFlatTipo ?? '',
    escalonaPorGrau: item?.escalonaPorGrau ?? false,
    grauTipoGrauCodigo: item?.grauTipoGrauCodigo ?? '',
    escalonamentoCustoEA:
      item?.escalonamentoCustoEA !== undefined ? String(item.escalonamentoCustoEA) : '',
    efeito: item?.efeito ?? '',
    ordem: String(item?.ordem ?? 0),
    requisitosModo: requisitos.modo,
    requisitosItens: requisitos.itens,
    requisitosNovaChave: '',
    requisitosNovoValor: '',
    requisitosJson: requisitos.json,
    testesExigidosInput: '',
    testesExigidosLista,
    dadosDano,
    escalonamentoDanoAtivo: escalonamentoDano.ativo,
    escalonamentoDanoQuantidade: escalonamentoDano.quantidade,
    escalonamentoDanoDado: escalonamentoDano.dado,
    escalonamentoDanoTipo: escalonamentoDano.tipo,
  };
}

function buildVariacaoFormState(item?: VariacaoHabilidadeTecnicaCatalogo | null): VariacaoFormState {
  const dadosDano = parseDadosDano(item?.dadosDano);
  const escalonamentoDano = parseEscalonamentoDano(item?.escalonamentoDano);
  const requisitos = parseRequisitosState(item?.requisitos);

  return {
    nome: item?.nome ?? '',
    descricao: item?.descricao ?? '',
    substituiCustos: item?.substituiCustos ?? false,
    custoPE: item?.custoPE !== undefined && item?.custoPE !== null ? String(item.custoPE) : '',
    custoEA: item?.custoEA !== undefined && item?.custoEA !== null ? String(item.custoEA) : '',
    execucao: item?.execucao ?? '',
    area: item?.area ?? '',
    alcance: item?.alcance ?? '',
    alvo: item?.alvo ?? '',
    duracao: item?.duracao ?? '',
    resistencia: item?.resistencia ?? '',
    dtResistencia: item?.dtResistencia ?? '',
    criticoValor:
      item?.criticoValor !== undefined && item?.criticoValor !== null ? String(item.criticoValor) : '',
    criticoMultiplicador:
      item?.criticoMultiplicador !== undefined && item?.criticoMultiplicador !== null
        ? String(item.criticoMultiplicador)
        : '',
    danoFlat: item?.danoFlat !== undefined && item?.danoFlat !== null ? String(item.danoFlat) : '',
    danoFlatTipo: item?.danoFlatTipo ?? '',
    escalonaPorGrau: item?.escalonaPorGrau ?? false,
    escalonamentoCustoEA:
      item?.escalonamentoCustoEA !== undefined && item?.escalonamentoCustoEA !== null
        ? String(item.escalonamentoCustoEA)
        : '',
    efeitoAdicional: item?.efeitoAdicional ?? '',
    ordem: String(item?.ordem ?? 0),
    requisitosModo: requisitos.modo,
    requisitosItens: requisitos.itens,
    requisitosNovaChave: '',
    requisitosNovoValor: '',
    requisitosJson: requisitos.json,
    dadosDano,
    escalonamentoDanoAtivo: escalonamentoDano.ativo,
    escalonamentoDanoQuantidade: escalonamentoDano.quantidade,
    escalonamentoDanoDado: escalonamentoDano.dado,
    escalonamentoDanoTipo: escalonamentoDano.tipo,
  };
}

type HabilidadeFormModalProps = {
  isOpen: boolean;
  tecnicaId: number;
  habilidade?: HabilidadeTecnicaCatalogo | null;
  onClose: (success?: boolean) => void;
};

function HabilidadeFormModal({ isOpen, tecnicaId, habilidade, onClose }: HabilidadeFormModalProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<HabilidadeFormState>(buildHabilidadeFormState(habilidade));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(habilidade?.id);

  useEffect(() => {
    if (!isOpen) return;
    setForm(buildHabilidadeFormState(habilidade));
    setErrors({});
  }, [isOpen, habilidade]);

  function setField<K extends keyof HabilidadeFormState>(key: K, value: HabilidadeFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function addTesteExigido() {
    const novoItem = form.testesExigidosInput.trim();
    if (!novoItem) return;

    setForm((prev) => ({
      ...prev,
      testesExigidosInput: '',
      testesExigidosLista: prev.testesExigidosLista.includes(novoItem)
        ? prev.testesExigidosLista
        : [...prev.testesExigidosLista, novoItem],
    }));
  }

  function removeTesteExigido(index: number) {
    setForm((prev) => ({
      ...prev,
      testesExigidosLista: prev.testesExigidosLista.filter((_, i) => i !== index),
    }));
  }

  function addDadoDano() {
    setForm((prev) => ({
      ...prev,
      dadosDano: [...prev.dadosDano, { quantidade: '1', dado: 'd6', tipo: '' }],
    }));
  }

  function updateDadoDano(index: number, patch: Partial<DadoDanoDraft>) {
    setForm((prev) => ({
      ...prev,
      dadosDano: prev.dadosDano.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function removeDadoDano(index: number) {
    setForm((prev) => ({
      ...prev,
      dadosDano: prev.dadosDano.filter((_, i) => i !== index),
    }));
  }

  function addRequisito() {
    const chave = form.requisitosNovaChave.trim();
    if (!chave) return;

    setForm((prev) => ({
      ...prev,
      requisitosNovaChave: '',
      requisitosNovoValor: '',
      requisitosItens: [...prev.requisitosItens, { chave, valor: prev.requisitosNovoValor }],
    }));
  }

  function updateRequisito(index: number, patch: Partial<RequisitoDraft>) {
    setForm((prev) => ({
      ...prev,
      requisitosItens: prev.requisitosItens.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    }));
  }

  function removeRequisito(index: number) {
    setForm((prev) => ({
      ...prev,
      requisitosItens: prev.requisitosItens.filter((_, i) => i !== index),
    }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!isEditing && !form.codigo.trim()) next.codigo = 'Codigo e obrigatorio.';
    if (!form.nome.trim()) next.nome = 'Nome e obrigatorio.';
    if (!form.descricao.trim()) next.descricao = 'Descricao e obrigatoria.';
    if (!form.efeito.trim()) next.efeito = 'Efeito e obrigatorio.';

    const custoPE = parseNumber(form.custoPE);
    const custoEA = parseNumber(form.custoEA);
    if (custoPE === undefined || custoPE < 0) next.custoPE = 'Informe numero >= 0.';
    if (custoEA === undefined || custoEA < 0) next.custoEA = 'Informe numero >= 0.';

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    try {
      setSaving(true);

      const requisitosGuiados = serializeRequisitosGuiados(form.requisitosItens);
      const requisitosJson = parseOptionalJson(form.requisitosJson);
      const dadosDano = serializeDadosDano(form.dadosDano);
      const escalonamentoDano = serializeEscalonamentoDano(
        form.escalonamentoDanoAtivo,
        form.escalonamentoDanoQuantidade,
        form.escalonamentoDanoDado,
        form.escalonamentoDanoTipo,
      );

      const basePayload = {
        nome: form.nome.trim(),
        descricao: form.descricao.trim(),
        execucao: form.execucao,
        area: form.area || undefined,
        alcance: form.alcance.trim() || undefined,
        alvo: form.alvo.trim() || undefined,
        duracao: form.duracao.trim() || undefined,
        resistencia: form.resistencia.trim() || undefined,
        dtResistencia: form.dtResistencia.trim() || undefined,
        custoPE: Number(form.custoPE),
        custoEA: Number(form.custoEA),
        criticoValor: parseNumber(form.criticoValor),
        criticoMultiplicador: parseNumber(form.criticoMultiplicador),
        danoFlat: parseNumber(form.danoFlat),
        danoFlatTipo: form.danoFlatTipo || undefined,
        escalonaPorGrau: form.escalonaPorGrau,
        grauTipoGrauCodigo: form.grauTipoGrauCodigo.trim() || undefined,
        escalonamentoCustoEA: parseNumber(form.escalonamentoCustoEA),
        requisitos:
          form.requisitosModo === 'guiado' ? requisitosGuiados : requisitosJson.value,
        testesExigidos:
          form.testesExigidosLista.length > 0 ? form.testesExigidosLista : null,
        dadosDano: dadosDano.length > 0 ? dadosDano : null,
        escalonamentoDano,
        efeito: form.efeito.trim(),
        ordem: parseNumber(form.ordem),
      };

      if (isEditing && habilidade?.id) {
        const payload: UpdateHabilidadeTecnicaPayload = basePayload;
        await apiAdminUpdateHabilidadeDaTecnica(habilidade.id, payload);
        showToast('Habilidade atualizada com sucesso.', 'success');
      } else {
        const payload: CreateHabilidadeTecnicaPayload = {
          tecnicaId,
          codigo: form.codigo.trim().toUpperCase(),
          ...basePayload,
        };
        await apiAdminCreateHabilidadeDaTecnica(payload);
        showToast('Habilidade criada com sucesso.', 'success');
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
      title={isEditing ? 'Editar habilidade da tecnica' : 'Nova habilidade da tecnica'}
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
            label="Execucao *"
            value={form.execucao}
            onChange={(e) => setField('execucao', e.target.value as TipoExecucao)}
          >
            {(Object.entries(TIPO_EXECUCAO_LABELS) as [TipoExecucao, string][]).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select
            label="Area"
            value={form.area}
            onChange={(e) => setField('area', e.target.value as '' | AreaEfeito)}
          >
            <option value="">Nao definida</option>
            {(Object.entries(AREA_EFEITO_LABELS) as [AreaEfeito, string][]).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Input
            label="Ordem"
            type="number"
            min={0}
            value={form.ordem}
            onChange={(e) => setField('ordem', e.target.value)}
          />
          <Input
            label="Custo PE *"
            type="number"
            min={0}
            value={form.custoPE}
            onChange={(e) => setField('custoPE', e.target.value)}
            error={errors.custoPE}
          />
          <Input
            label="Custo EA *"
            type="number"
            min={0}
            value={form.custoEA}
            onChange={(e) => setField('custoEA', e.target.value)}
            error={errors.custoEA}
          />
          <Input
            label="Grau tipo (codigo)"
            value={form.grauTipoGrauCodigo}
            onChange={(e) => setField('grauTipoGrauCodigo', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            label="Alcance"
            value={form.alcance}
            onChange={(e) => setField('alcance', e.target.value)}
          />
          <Input label="Alvo" value={form.alvo} onChange={(e) => setField('alvo', e.target.value)} />
          <Input
            label="Duracao"
            value={form.duracao}
            onChange={(e) => setField('duracao', e.target.value)}
          />
          <Input
            label="Resistencia"
            value={form.resistencia}
            onChange={(e) => setField('resistencia', e.target.value)}
          />
          <Input
            label="DT resistencia"
            value={form.dtResistencia}
            onChange={(e) => setField('dtResistencia', e.target.value)}
          />
          <Input
            label="Escalonamento custo EA"
            type="number"
            min={0}
            value={form.escalonamentoCustoEA}
            onChange={(e) => setField('escalonamentoCustoEA', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            label="Critico valor"
            type="number"
            value={form.criticoValor}
            onChange={(e) => setField('criticoValor', e.target.value)}
          />
          <Input
            label="Critico multiplicador"
            type="number"
            value={form.criticoMultiplicador}
            onChange={(e) => setField('criticoMultiplicador', e.target.value)}
          />
          <Input
            label="Dano flat"
            type="number"
            value={form.danoFlat}
            onChange={(e) => setField('danoFlat', e.target.value)}
          />
        </div>

        <Select
          label="Tipo dano flat"
          value={form.danoFlatTipo}
          onChange={(e) => setField('danoFlatTipo', e.target.value as '' | TipoDano)}
        >
          <option value="">Nao definido</option>
          {(Object.entries(TIPO_DANO_LABELS) as [TipoDano, string][]).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <Checkbox
          label="Escalona por grau"
          checked={form.escalonaPorGrau}
          onChange={(e) => setField('escalonaPorGrau', e.target.checked)}
        />

        <Textarea
          label="Descricao *"
          rows={4}
          value={form.descricao}
          onChange={(e) => setField('descricao', e.target.value)}
          error={errors.descricao}
        />
        <Textarea
          label="Efeito *"
          rows={4}
          value={form.efeito}
          onChange={(e) => setField('efeito', e.target.value)}
          error={errors.efeito}
        />
        <div className="space-y-2">
          <Select
            label="Modo de requisitos"
            value={form.requisitosModo}
            onChange={(e) => setField('requisitosModo', e.target.value as 'guiado' | 'json')}
          >
            <option value="guiado">Guiado (chave/valor)</option>
            <option value="json">JSON/Texto avancado</option>
          </Select>

          {form.requisitosModo === 'guiado' ? (
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                <Input
                  label="Chave"
                  value={form.requisitosNovaChave}
                  onChange={(e) => setField('requisitosNovaChave', e.target.value)}
                  placeholder="nivelMinimo"
                />
                <Input
                  label="Valor"
                  value={form.requisitosNovoValor}
                  onChange={(e) => setField('requisitosNovoValor', e.target.value)}
                  placeholder='10 | "texto" | true | {"x":1}'
                />
                <Button type="button" variant="secondary" onClick={addRequisito}>
                  <Icon name="add" className="w-4 h-4 mr-1" />
                  Adicionar requisito
                </Button>
              </div>

              {form.requisitosItens.length > 0 ? (
                <div className="space-y-2">
                  {form.requisitosItens.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                      <Input
                        label="Chave"
                        value={item.chave}
                        onChange={(e) => updateRequisito(index, { chave: e.target.value })}
                      />
                      <Input
                        label="Valor"
                        value={item.valor}
                        onChange={(e) => updateRequisito(index, { valor: e.target.value })}
                      />
                      <Button type="button" variant="secondary" onClick={() => removeRequisito(index)}>
                        <Icon name="delete" className="w-4 h-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-app-muted">Nenhum requisito estruturado adicionado.</p>
              )}
            </div>
          ) : (
            <Textarea
              label="Requisitos (JSON ou texto)"
              rows={2}
              value={form.requisitosJson}
              onChange={(e) => setField('requisitosJson', e.target.value)}
            />
          )}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-app-fg">Testes exigidos</label>
          <div className="flex gap-2">
            <Input
              label=""
              value={form.testesExigidosInput}
              onChange={(e) => setField('testesExigidosInput', e.target.value)}
              placeholder="Ex: Acrobacia DC 15"
            />
            <Button type="button" variant="secondary" onClick={addTesteExigido}>
              <Icon name="add" className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>
          {form.testesExigidosLista.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {form.testesExigidosLista.map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="inline-flex items-center gap-1 rounded border border-app-border px-2 py-1 text-xs text-app-fg"
                >
                  {item}
                  <button
                    type="button"
                    className="text-app-danger"
                    onClick={() => removeTesteExigido(index)}
                  >
                    <Icon name="close" className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-app-muted">Nenhum teste adicionado.</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-app-fg">Dados de dano</label>
            <Button type="button" variant="secondary" size="sm" onClick={addDadoDano}>
              <Icon name="add" className="w-4 h-4 mr-1" />
              Adicionar dano
            </Button>
          </div>
          {form.dadosDano.length > 0 ? (
            <div className="space-y-2">
              {form.dadosDano.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                  <Input
                    label="Qtd"
                    type="number"
                    min={1}
                    value={item.quantidade}
                    onChange={(e) => updateDadoDano(index, { quantidade: e.target.value })}
                  />
                  <Input
                    label="Dado"
                    value={item.dado}
                    onChange={(e) => updateDadoDano(index, { dado: e.target.value })}
                    placeholder="d6"
                  />
                  <Select
                    label="Tipo"
                    value={item.tipo}
                    onChange={(e) => updateDadoDano(index, { tipo: e.target.value as '' | TipoDano })}
                  >
                    <option value="">Selecione</option>
                    {(Object.entries(TIPO_DANO_LABELS) as [TipoDano, string][]).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                  <Button type="button" variant="secondary" onClick={() => removeDadoDano(index)}>
                    <Icon name="delete" className="w-4 h-4 mr-1" />
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-app-muted">Nenhum dado de dano adicionado.</p>
          )}
        </div>

        <div className="space-y-2">
          <Checkbox
            label="Escalonamento de dano"
            checked={form.escalonamentoDanoAtivo}
            onChange={(e) => setField('escalonamentoDanoAtivo', e.target.checked)}
          />
          {form.escalonamentoDanoAtivo ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                label="Qtd"
                type="number"
                min={1}
                value={form.escalonamentoDanoQuantidade}
                onChange={(e) => setField('escalonamentoDanoQuantidade', e.target.value)}
              />
              <Input
                label="Dado"
                value={form.escalonamentoDanoDado}
                onChange={(e) => setField('escalonamentoDanoDado', e.target.value)}
                placeholder="d6"
              />
              <Select
                label="Tipo"
                value={form.escalonamentoDanoTipo}
                onChange={(e) =>
                  setField('escalonamentoDanoTipo', e.target.value as '' | TipoDano)
                }
              >
                <option value="">Selecione</option>
                {(Object.entries(TIPO_DANO_LABELS) as [TipoDano, string][]).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

type VariacaoFormModalProps = {
  isOpen: boolean;
  habilidadeId: number;
  variacao?: VariacaoHabilidadeTecnicaCatalogo | null;
  onClose: (success?: boolean) => void;
};

function VariacaoFormModal({ isOpen, habilidadeId, variacao, onClose }: VariacaoFormModalProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<VariacaoFormState>(buildVariacaoFormState(variacao));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(variacao?.id);

  useEffect(() => {
    if (!isOpen) return;
    setForm(buildVariacaoFormState(variacao));
    setErrors({});
  }, [isOpen, variacao]);

  function setField<K extends keyof VariacaoFormState>(key: K, value: VariacaoFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function addDadoDano() {
    setForm((prev) => ({
      ...prev,
      dadosDano: [...prev.dadosDano, { quantidade: '1', dado: 'd6', tipo: '' }],
    }));
  }

  function updateDadoDano(index: number, patch: Partial<DadoDanoDraft>) {
    setForm((prev) => ({
      ...prev,
      dadosDano: prev.dadosDano.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function removeDadoDano(index: number) {
    setForm((prev) => ({
      ...prev,
      dadosDano: prev.dadosDano.filter((_, i) => i !== index),
    }));
  }

  function addRequisito() {
    const chave = form.requisitosNovaChave.trim();
    if (!chave) return;

    setForm((prev) => ({
      ...prev,
      requisitosNovaChave: '',
      requisitosNovoValor: '',
      requisitosItens: [...prev.requisitosItens, { chave, valor: prev.requisitosNovoValor }],
    }));
  }

  function updateRequisito(index: number, patch: Partial<RequisitoDraft>) {
    setForm((prev) => ({
      ...prev,
      requisitosItens: prev.requisitosItens.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    }));
  }

  function removeRequisito(index: number) {
    setForm((prev) => ({
      ...prev,
      requisitosItens: prev.requisitosItens.filter((_, i) => i !== index),
    }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.nome.trim()) next.nome = 'Nome e obrigatorio.';
    if (!form.descricao.trim()) next.descricao = 'Descricao e obrigatoria.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    try {
      setSaving(true);

      const requisitosGuiados = serializeRequisitosGuiados(form.requisitosItens);
      const requisitosJson = parseOptionalJson(form.requisitosJson);
      const dadosDano = serializeDadosDano(form.dadosDano);
      const escalonamentoDano = serializeEscalonamentoDano(
        form.escalonamentoDanoAtivo,
        form.escalonamentoDanoQuantidade,
        form.escalonamentoDanoDado,
        form.escalonamentoDanoTipo,
      );

      const basePayload = {
        nome: form.nome.trim(),
        descricao: form.descricao.trim(),
        substituiCustos: form.substituiCustos,
        custoPE: parseNumber(form.custoPE),
        custoEA: parseNumber(form.custoEA),
        execucao: form.execucao || undefined,
        area: form.area || undefined,
        alcance: form.alcance.trim() || undefined,
        alvo: form.alvo.trim() || undefined,
        duracao: form.duracao.trim() || undefined,
        resistencia: form.resistencia.trim() || undefined,
        dtResistencia: form.dtResistencia.trim() || undefined,
        criticoValor: parseNumber(form.criticoValor),
        criticoMultiplicador: parseNumber(form.criticoMultiplicador),
        danoFlat: parseNumber(form.danoFlat),
        danoFlatTipo: form.danoFlatTipo || undefined,
        escalonaPorGrau: form.escalonaPorGrau,
        escalonamentoCustoEA: parseNumber(form.escalonamentoCustoEA),
        escalonamentoDano,
        efeitoAdicional: form.efeitoAdicional.trim() || undefined,
        requisitos:
          form.requisitosModo === 'guiado' ? requisitosGuiados : requisitosJson.value,
        dadosDano: dadosDano.length > 0 ? dadosDano : null,
        ordem: parseNumber(form.ordem),
      };

      if (isEditing && variacao?.id) {
        const payload: UpdateVariacaoHabilidadeTecnicaPayload = basePayload;
        await apiAdminUpdateVariacaoDaHabilidadeTecnica(variacao.id, payload);
        showToast('Variacao atualizada com sucesso.', 'success');
      } else {
        const payload: CreateVariacaoHabilidadeTecnicaPayload = {
          habilidadeTecnicaId: habilidadeId,
          ...basePayload,
        };
        await apiAdminCreateVariacaoDaHabilidadeTecnica(payload);
        showToast('Variacao criada com sucesso.', 'success');
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
      title={isEditing ? 'Editar variacao' : 'Nova variacao'}
      size="md"
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
          label="Descricao *"
          rows={3}
          value={form.descricao}
          onChange={(e) => setField('descricao', e.target.value)}
          error={errors.descricao}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select
            label="Execucao"
            value={form.execucao}
            onChange={(e) => setField('execucao', e.target.value as '' | TipoExecucao)}
          >
            <option value="">Nao definida</option>
            {(Object.entries(TIPO_EXECUCAO_LABELS) as [TipoExecucao, string][]).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select
            label="Area"
            value={form.area}
            onChange={(e) => setField('area', e.target.value as '' | AreaEfeito)}
          >
            <option value="">Nao definida</option>
            {(Object.entries(AREA_EFEITO_LABELS) as [AreaEfeito, string][]).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            label="Alcance"
            value={form.alcance}
            onChange={(e) => setField('alcance', e.target.value)}
          />
          <Input label="Alvo" value={form.alvo} onChange={(e) => setField('alvo', e.target.value)} />
          <Input
            label="Duracao"
            value={form.duracao}
            onChange={(e) => setField('duracao', e.target.value)}
          />
          <Input
            label="Resistencia"
            value={form.resistencia}
            onChange={(e) => setField('resistencia', e.target.value)}
          />
          <Input
            label="DT resistencia"
            value={form.dtResistencia}
            onChange={(e) => setField('dtResistencia', e.target.value)}
          />
          <Input
            label="Escalonamento custo EA"
            type="number"
            min={0}
            value={form.escalonamentoCustoEA}
            onChange={(e) => setField('escalonamentoCustoEA', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            label="Custo PE"
            type="number"
            min={0}
            value={form.custoPE}
            onChange={(e) => setField('custoPE', e.target.value)}
          />
          <Input
            label="Custo EA"
            type="number"
            min={0}
            value={form.custoEA}
            onChange={(e) => setField('custoEA', e.target.value)}
          />
          <Input
            label="Ordem"
            type="number"
            min={0}
            value={form.ordem}
            onChange={(e) => setField('ordem', e.target.value)}
          />
          <Input
            label="Critico valor"
            type="number"
            value={form.criticoValor}
            onChange={(e) => setField('criticoValor', e.target.value)}
          />
          <Input
            label="Critico multiplicador"
            type="number"
            value={form.criticoMultiplicador}
            onChange={(e) => setField('criticoMultiplicador', e.target.value)}
          />
          <Input
            label="Dano flat"
            type="number"
            value={form.danoFlat}
            onChange={(e) => setField('danoFlat', e.target.value)}
          />
        </div>

        <Select
          label="Tipo dano flat"
          value={form.danoFlatTipo}
          onChange={(e) => setField('danoFlatTipo', e.target.value as '' | TipoDano)}
        >
          <option value="">Nao definido</option>
          {(Object.entries(TIPO_DANO_LABELS) as [TipoDano, string][]).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <Checkbox
          label="Substitui custos"
          checked={form.substituiCustos}
          onChange={(e) => setField('substituiCustos', e.target.checked)}
        />
        <Checkbox
          label="Escalona por grau"
          checked={form.escalonaPorGrau}
          onChange={(e) => setField('escalonaPorGrau', e.target.checked)}
        />

        <Textarea
          label="Efeito adicional"
          rows={2}
          value={form.efeitoAdicional}
          onChange={(e) => setField('efeitoAdicional', e.target.value)}
        />
        <div className="space-y-2">
          <Select
            label="Modo de requisitos"
            value={form.requisitosModo}
            onChange={(e) => setField('requisitosModo', e.target.value as 'guiado' | 'json')}
          >
            <option value="guiado">Guiado (chave/valor)</option>
            <option value="json">JSON/Texto avancado</option>
          </Select>

          {form.requisitosModo === 'guiado' ? (
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                <Input
                  label="Chave"
                  value={form.requisitosNovaChave}
                  onChange={(e) => setField('requisitosNovaChave', e.target.value)}
                  placeholder="nivelMinimo"
                />
                <Input
                  label="Valor"
                  value={form.requisitosNovoValor}
                  onChange={(e) => setField('requisitosNovoValor', e.target.value)}
                  placeholder='10 | "texto" | true | {"x":1}'
                />
                <Button type="button" variant="secondary" onClick={addRequisito}>
                  <Icon name="add" className="w-4 h-4 mr-1" />
                  Adicionar requisito
                </Button>
              </div>

              {form.requisitosItens.length > 0 ? (
                <div className="space-y-2">
                  {form.requisitosItens.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                      <Input
                        label="Chave"
                        value={item.chave}
                        onChange={(e) => updateRequisito(index, { chave: e.target.value })}
                      />
                      <Input
                        label="Valor"
                        value={item.valor}
                        onChange={(e) => updateRequisito(index, { valor: e.target.value })}
                      />
                      <Button type="button" variant="secondary" onClick={() => removeRequisito(index)}>
                        <Icon name="delete" className="w-4 h-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-app-muted">Nenhum requisito estruturado adicionado.</p>
              )}
            </div>
          ) : (
            <Textarea
              label="Requisitos (JSON ou texto)"
              rows={2}
              value={form.requisitosJson}
              onChange={(e) => setField('requisitosJson', e.target.value)}
            />
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-app-fg">Dados de dano</label>
            <Button type="button" variant="secondary" size="sm" onClick={addDadoDano}>
              <Icon name="add" className="w-4 h-4 mr-1" />
              Adicionar dano
            </Button>
          </div>
          {form.dadosDano.length > 0 ? (
            <div className="space-y-2">
              {form.dadosDano.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                  <Input
                    label="Qtd"
                    type="number"
                    min={1}
                    value={item.quantidade}
                    onChange={(e) => updateDadoDano(index, { quantidade: e.target.value })}
                  />
                  <Input
                    label="Dado"
                    value={item.dado}
                    onChange={(e) => updateDadoDano(index, { dado: e.target.value })}
                    placeholder="d6"
                  />
                  <Select
                    label="Tipo"
                    value={item.tipo}
                    onChange={(e) => updateDadoDano(index, { tipo: e.target.value as '' | TipoDano })}
                  >
                    <option value="">Selecione</option>
                    {(Object.entries(TIPO_DANO_LABELS) as [TipoDano, string][]).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                  <Button type="button" variant="secondary" onClick={() => removeDadoDano(index)}>
                    <Icon name="delete" className="w-4 h-4 mr-1" />
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-app-muted">Nenhum dado de dano adicionado.</p>
          )}
        </div>

        <div className="space-y-2">
          <Checkbox
            label="Escalonamento de dano"
            checked={form.escalonamentoDanoAtivo}
            onChange={(e) => setField('escalonamentoDanoAtivo', e.target.checked)}
          />
          {form.escalonamentoDanoAtivo ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                label="Qtd"
                type="number"
                min={1}
                value={form.escalonamentoDanoQuantidade}
                onChange={(e) => setField('escalonamentoDanoQuantidade', e.target.value)}
              />
              <Input
                label="Dado"
                value={form.escalonamentoDanoDado}
                onChange={(e) => setField('escalonamentoDanoDado', e.target.value)}
                placeholder="d6"
              />
              <Select
                label="Tipo"
                value={form.escalonamentoDanoTipo}
                onChange={(e) =>
                  setField('escalonamentoDanoTipo', e.target.value as '' | TipoDano)
                }
              >
                <option value="">Selecione</option>
                {(Object.entries(TIPO_DANO_LABELS) as [TipoDano, string][]).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

type HabilidadeVariacoesModalProps = {
  isOpen: boolean;
  habilidade: HabilidadeTecnicaCatalogo | null;
  onClose: (success?: boolean) => void;
  onChanged: () => Promise<void>;
};

function HabilidadeVariacoesModal({ isOpen, habilidade, onClose, onChanged }: HabilidadeVariacoesModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [items, setItems] = useState<VariacaoHabilidadeTecnicaCatalogo[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VariacaoHabilidadeTecnicaCatalogo | null>(null);

  const habilidadeId = habilidade?.id;

  const carregarDados = useCallback(async () => {
    if (!habilidadeId) return;

    try {
      setLoading(true);
      setErro(null);
      const data = await apiAdminGetVariacoesDaHabilidadeTecnica(habilidadeId);
      setItems(data);
    } catch (error) {
      const mensagem = extrairMensagemErro(error);
      setErro(mensagem);
      showToast(mensagem, 'error');
    } finally {
      setLoading(false);
    }
  }, [habilidadeId, showToast]);

  useEffect(() => {
    if (!isOpen || !habilidadeId) return;
    carregarDados();
  }, [isOpen, habilidadeId, carregarDados]);

  async function handleDelete(item: VariacaoHabilidadeTecnicaCatalogo) {
    if (!window.confirm(`Remover variacao "${item.nome}"?`)) return;

    try {
      await apiAdminDeleteVariacaoDaHabilidadeTecnica(item.id);
      showToast('Variacao removida com sucesso.', 'success');
      await carregarDados();
      await onChanged();
    } catch (error) {
      showToast(extrairMensagemErro(error), 'error');
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => onClose(false)}
        title={`Variacoes - ${habilidade?.nome ?? ''}`}
        size="lg"
        footer={<Button variant="secondary" onClick={() => onClose(false)}>Fechar</Button>}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-app-muted">Total: {items.length}</div>
            <Button variant="primary" size="sm" onClick={() => { setEditingItem(null); setModalOpen(true); }}>
              <Icon name="add" className="w-4 h-4 mr-1" />
              Nova variacao
            </Button>
          </div>

          {erro && <ErrorAlert message={erro} />}

          {loading ? (
            <Loading message="Carregando variacoes..." className="py-8 text-app-fg" />
          ) : items.length === 0 ? (
            <EmptyState variant="card" icon="sparkles" title="Nenhuma variacao cadastrada" description="Crie uma variacao para esta habilidade." />
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-app-border text-left text-app-muted">
                      <th className="py-2 pr-2">ID</th>
                      <th className="py-2 pr-2">Nome</th>
                      <th className="py-2 pr-2">Ordem</th>
                      <th className="py-2 pr-2">Custos</th>
                      <th className="py-2 text-right">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-app-border/60">
                        <td className="py-3 pr-2 text-app-muted">#{item.id}</td>
                        <td className="py-3 pr-2 text-app-fg font-medium">{item.nome}</td>
                        <td className="py-3 pr-2 text-app-fg">{item.ordem}</td>
                        <td className="py-3 pr-2 text-app-fg">{item.custoPE ?? 0} PE / {item.custoEA ?? 0} EA</td>
                        <td className="py-3 text-right">
                          <div className="inline-flex gap-2">
                            <Button variant="secondary" size="sm" onClick={() => { setEditingItem(item); setModalOpen(true); }}>
                              <Icon name="edit" className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                            <Button variant="secondary" size="sm" className="text-app-danger" onClick={() => handleDelete(item)}>
                              <Icon name="delete" className="w-4 h-4 mr-1" />
                              Remover
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </Modal>

      {habilidadeId ? (
        <VariacaoFormModal
          isOpen={modalOpen}
          habilidadeId={habilidadeId}
          variacao={editingItem}
          onClose={async (success) => {
            setModalOpen(false);
            setEditingItem(null);
            if (success) {
              await carregarDados();
              await onChanged();
            }
          }}
        />
      ) : null}
    </>
  );
}

export function TecnicaHabilidadesModal({ isOpen, tecnica, onClose }: Props) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [items, setItems] = useState<HabilidadeTecnicaCatalogo[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HabilidadeTecnicaCatalogo | null>(null);
  const [variacoesModalOpen, setVariacoesModalOpen] = useState(false);
  const [variacoesHabilidade, setVariacoesHabilidade] = useState<HabilidadeTecnicaCatalogo | null>(null);

  const tecnicaId = tecnica?.id;

  const habilidadesOrdenadas = useMemo(
    () => [...items].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)),
    [items],
  );

  const carregarDados = useCallback(async () => {
    if (!tecnicaId) return;

    try {
      setLoading(true);
      setErro(null);
      const data = await apiAdminGetHabilidadesDaTecnica(tecnicaId);
      setItems(data);
    } catch (error) {
      const mensagem = extrairMensagemErro(error);
      setErro(mensagem);
      showToast(mensagem, 'error');
    } finally {
      setLoading(false);
    }
  }, [tecnicaId, showToast]);

  useEffect(() => {
    if (!isOpen || !tecnicaId) return;
    carregarDados();
  }, [isOpen, tecnicaId, carregarDados]);

  async function handleDelete(item: HabilidadeTecnicaCatalogo) {
    if (!window.confirm(`Remover habilidade "${item.nome}"?`)) return;

    try {
      await apiAdminDeleteHabilidadeDaTecnica(item.id);
      showToast('Habilidade removida com sucesso.', 'success');
      await carregarDados();
    } catch (error) {
      showToast(extrairMensagemErro(error), 'error');
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => onClose(false)}
        title={`Habilidades - ${tecnica?.nome ?? ''}`}
        size="xl"
        footer={<Button variant="secondary" onClick={() => onClose(false)}>Fechar</Button>}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-app-muted">Total: {habilidadesOrdenadas.length}</div>
            <Button variant="primary" size="sm" onClick={() => { setEditingItem(null); setModalOpen(true); }}>
              <Icon name="add" className="w-4 h-4 mr-1" />
              Nova habilidade
            </Button>
          </div>

          {erro && <ErrorAlert message={erro} />}

          {loading ? (
            <Loading message="Carregando habilidades..." className="py-8 text-app-fg" />
          ) : habilidadesOrdenadas.length === 0 ? (
            <EmptyState variant="card" icon="technique" title="Nenhuma habilidade cadastrada" description="Crie uma habilidade para esta tecnica." />
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-app-border text-left text-app-muted">
                      <th className="py-2 pr-2">ID</th>
                      <th className="py-2 pr-2">Codigo</th>
                      <th className="py-2 pr-2">Nome</th>
                      <th className="py-2 pr-2">Ordem</th>
                      <th className="py-2 pr-2">Custos</th>
                      <th className="py-2 pr-2">Variacoes</th>
                      <th className="py-2 text-right">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {habilidadesOrdenadas.map((item) => (
                      <tr key={item.id} className="border-b border-app-border/60">
                        <td className="py-3 pr-2 text-app-muted">#{item.id}</td>
                        <td className="py-3 pr-2 text-app-fg">{item.codigo}</td>
                        <td className="py-3 pr-2 text-app-fg font-medium">{item.nome}</td>
                        <td className="py-3 pr-2 text-app-fg">{item.ordem}</td>
                        <td className="py-3 pr-2 text-app-fg">{item.custoPE} PE / {item.custoEA} EA</td>
                        <td className="py-3 pr-2 text-app-fg">{item.variacoes?.length ?? 0}</td>
                        <td className="py-3 text-right">
                          <div className="inline-flex gap-2">
                            <Button variant="secondary" size="sm" onClick={() => { setEditingItem(item); setModalOpen(true); }}>
                              <Icon name="edit" className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => { setVariacoesHabilidade(item); setVariacoesModalOpen(true); }}>
                              <Icon name="sparkles" className="w-4 h-4 mr-1" />
                              Variacoes
                            </Button>
                            <Button variant="secondary" size="sm" className="text-app-danger" onClick={() => handleDelete(item)}>
                              <Icon name="delete" className="w-4 h-4 mr-1" />
                              Remover
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </Modal>

      {tecnicaId ? (
        <HabilidadeFormModal
          isOpen={modalOpen}
          tecnicaId={tecnicaId}
          habilidade={editingItem}
          onClose={async (success) => {
            setModalOpen(false);
            setEditingItem(null);
            if (success) {
              await carregarDados();
              onClose(true);
            }
          }}
        />
      ) : null}

      <HabilidadeVariacoesModal
        isOpen={variacoesModalOpen}
        habilidade={variacoesHabilidade}
        onClose={(success) => {
          setVariacoesModalOpen(false);
          setVariacoesHabilidade(null);
          if (success) onClose(true);
        }}
        onChanged={carregarDados}
      />
    </>
  );
}
