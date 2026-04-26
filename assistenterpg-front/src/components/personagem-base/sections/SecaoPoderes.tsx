'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { PoderesGenericosSection } from '@/components/personagem-base/sections/PoderesGenericosSection';
import { TrainingGradesSection } from '@/components/personagem-base/sections/TrainingGradesSection';
import {
  AREA_EFEITO_LABELS,
  TIPO_EXECUCAO_LABELS,
  type AreaEfeito,
  type TipoExecucao,
} from '@/lib/types';
import type {
  PersonagemBaseDetalhe,
  PericiaCatalogo,
  TecnicaAmaldicoadaCatalogo,
} from '@/lib/api';
import {
  apiAtualizarHabilidadeTecnicaInataPropria,
  apiAtualizarVariacaoTecnicaInataPropria,
  apiCriarHabilidadeTecnicaInataPropria,
  apiCriarVariacaoTecnicaInataPropria,
  extrairMensagemErro,
} from '@/lib/api';

type Habilidade = {
  id: number;
  nome: string;
  tipo: string;
  descricao?: string | null;
};

type SecaoPoderesProps = {
  personagem: PersonagemBaseDetalhe;
  periciasMap: Map<string, { nome: string }>;
  tiposGrauMap: Map<string, string>;
  personagemId?: number;
  onTecnicaAtualizada?: () => Promise<void> | void;
};

type TecnicaHabilidade = NonNullable<TecnicaAmaldicoadaCatalogo['habilidades']>[number];
type TecnicaVariacao = NonNullable<TecnicaHabilidade['variacoes']>[number];

type HabilidadeFormState = {
  codigo: string;
  nome: string;
  descricao: string;
  execucao: string;
  alcance: string;
  alvo: string;
  duracao: string;
  custoEA: string;
  custoPE: string;
  efeito: string;
  ordem: string;
  requisitos: string;
  habilitada: boolean;
};

type VariacaoFormState = {
  nome: string;
  descricao: string;
  custoEA: string;
  custoPE: string;
  efeitoAdicional: string;
  ordem: string;
  requisitos: string;
};

const HABILITY_TYPES = {
  RECURSO_CLASSE: 'Recurso de Classe',
  PODER_GENERICO: 'Poderes Genericos',
  ORIGEM: 'Habilidades de Origem',
  TRILHA: 'Habilidades de Trilha',
  CAMINHO: 'Habilidades de Caminho',
  INATA: 'Tecnica Inata',
  OUTRO: 'Outras Habilidades',
} as const;

function formatExecucao(value: string | null | undefined): string | null {
  if (!value) return null;
  const key = value as TipoExecucao;
  return TIPO_EXECUCAO_LABELS[key] ?? value;
}

function formatArea(value: string | null | undefined): string | null {
  if (!value) return null;
  const key = value as AreaEfeito;
  return AREA_EFEITO_LABELS[key] ?? value;
}

function formatRequisitos(value: unknown): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];

  const requisitos = value as Record<string, unknown>;
  const linhas: string[] = [];

  const graus = requisitos.graus;
  if (Array.isArray(graus)) {
    for (const grau of graus) {
      if (!grau || typeof grau !== 'object' || Array.isArray(grau)) continue;
      const g = grau as Record<string, unknown>;
      const tipo = String(g.tipoGrauCodigo ?? '').trim();
      const minimo = Number(g.valorMinimo);
      if (!tipo || Number.isNaN(minimo)) continue;
      linhas.push(`Grau minimo: ${tipo} ${minimo}`);
    }
  }

  for (const [key, raw] of Object.entries(requisitos)) {
    if (key === 'graus') continue;

    if (typeof raw === 'boolean') {
      linhas.push(`${key}: ${raw ? 'sim' : 'nao'}`);
      continue;
    }

    if (typeof raw === 'number' || typeof raw === 'string') {
      linhas.push(`${key}: ${String(raw)}`);
    }
  }

  return linhas;
}

function formatJsonTextarea(value: unknown): string {
  if (value == null) return '';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '';
  }
}

function parseJsonTextarea(value: string): unknown | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return JSON.parse(trimmed);
}

function createHabilidadeFormState(
  habilidade?: TecnicaHabilidade | null,
): HabilidadeFormState {
  return {
    codigo: habilidade?.codigo ?? '',
    nome: habilidade?.nome ?? '',
    descricao: habilidade?.descricao ?? '',
    execucao: habilidade?.execucao ?? 'ACAO_PADRAO',
    alcance: habilidade?.alcance ?? '',
    alvo: habilidade?.alvo ?? '',
    duracao: habilidade?.duracao ?? '',
    custoEA: String(habilidade?.custoEA ?? 0),
    custoPE: String(habilidade?.custoPE ?? 0),
    efeito: habilidade?.efeito ?? '',
    ordem: String(habilidade?.ordem ?? 10),
    requisitos: formatJsonTextarea(habilidade?.requisitos),
    habilitada: habilidade?.habilitada ?? true,
  };
}

function createVariacaoFormState(
  variacao?: TecnicaVariacao | null,
): VariacaoFormState {
  return {
    nome: variacao?.nome ?? '',
    descricao: variacao?.descricao ?? '',
    custoEA:
      variacao?.custoEA == null ? '' : String(variacao.custoEA),
    custoPE:
      variacao?.custoPE == null ? '' : String(variacao.custoPE),
    efeitoAdicional: variacao?.efeitoAdicional ?? '',
    ordem: String(variacao?.ordem ?? 10),
    requisitos: formatJsonTextarea(variacao?.requisitos),
  };
}

function HabilidadeTecnicaFormModal({
  isOpen,
  onClose,
  title,
  value,
  onChange,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  value: HabilidadeFormState;
  onChange: (next: HabilidadeFormState) => void;
  onSubmit: () => Promise<void>;
}) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit() {
    try {
      setErro(null);
      setSalvando(true);
      await onSubmit();
      onClose();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-4">
        {erro && (
          <div className="rounded-lg border border-app-danger/30 bg-app-danger/10 px-3 py-2 text-sm text-app-danger">
            {erro}
          </div>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Código"
            value={value.codigo}
            onChange={(e) => onChange({ ...value, codigo: e.target.value })}
            placeholder="Opcional"
          />
          <Input
            label="Execução"
            value={value.execucao}
            onChange={(e) => onChange({ ...value, execucao: e.target.value })}
          />
          <Input
            label="Nome"
            value={value.nome}
            onChange={(e) => onChange({ ...value, nome: e.target.value })}
          />
          <Input
            label="Ordem"
            type="number"
            value={value.ordem}
            onChange={(e) => onChange({ ...value, ordem: e.target.value })}
          />
          <Input
            label="Alcance"
            value={value.alcance}
            onChange={(e) => onChange({ ...value, alcance: e.target.value })}
          />
          <Input
            label="Alvo"
            value={value.alvo}
            onChange={(e) => onChange({ ...value, alvo: e.target.value })}
          />
          <Input
            label="Duração"
            value={value.duracao}
            onChange={(e) => onChange({ ...value, duracao: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Custo EA"
              type="number"
              value={value.custoEA}
              onChange={(e) => onChange({ ...value, custoEA: e.target.value })}
            />
            <Input
              label="Custo PE"
              type="number"
              value={value.custoPE}
              onChange={(e) => onChange({ ...value, custoPE: e.target.value })}
            />
          </div>
        </div>
        <Textarea
          label="Descrição"
          value={value.descricao}
          onChange={(e) => onChange({ ...value, descricao: e.target.value })}
          rows={3}
        />
        <Textarea
          label="Efeito"
          value={value.efeito}
          onChange={(e) => onChange({ ...value, efeito: e.target.value })}
          rows={4}
        />
        <Textarea
          label="Requisitos (JSON)"
          value={value.requisitos}
          onChange={(e) => onChange({ ...value, requisitos: e.target.value })}
          rows={4}
          placeholder='Ex: {"graus":[{"valorMinimo":1,"tipoGrauCodigo":"TECNICA_AMALDICOADA"}]}'
        />
        <Checkbox
          checked={value.habilitada}
          onChange={(e) => onChange({ ...value, habilitada: e.target.checked })}
          label="Habilidade habilitada na técnica própria"
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={salvando || !value.nome.trim()}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function VariacaoTecnicaFormModal({
  isOpen,
  onClose,
  title,
  value,
  onChange,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  value: VariacaoFormState;
  onChange: (next: VariacaoFormState) => void;
  onSubmit: () => Promise<void>;
}) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit() {
    try {
      setErro(null);
      setSalvando(true);
      await onSubmit();
      onClose();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-4">
        {erro && (
          <div className="rounded-lg border border-app-danger/30 bg-app-danger/10 px-3 py-2 text-sm text-app-danger">
            {erro}
          </div>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Nome"
            value={value.nome}
            onChange={(e) => onChange({ ...value, nome: e.target.value })}
          />
          <Input
            label="Ordem"
            type="number"
            value={value.ordem}
            onChange={(e) => onChange({ ...value, ordem: e.target.value })}
          />
          <Input
            label="Custo EA"
            type="number"
            value={value.custoEA}
            onChange={(e) => onChange({ ...value, custoEA: e.target.value })}
          />
          <Input
            label="Custo PE"
            type="number"
            value={value.custoPE}
            onChange={(e) => onChange({ ...value, custoPE: e.target.value })}
          />
        </div>
        <Textarea
          label="Descrição"
          value={value.descricao}
          onChange={(e) => onChange({ ...value, descricao: e.target.value })}
          rows={3}
        />
        <Textarea
          label="Efeito adicional"
          value={value.efeitoAdicional}
          onChange={(e) => onChange({ ...value, efeitoAdicional: e.target.value })}
          rows={4}
        />
        <Textarea
          label="Requisitos (JSON)"
          value={value.requisitos}
          onChange={(e) => onChange({ ...value, requisitos: e.target.value })}
          rows={4}
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={salvando || !value.nome.trim()}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function HabilidadesTecnicaList({
  habilidadesTecnica,
  editavel = false,
  onToggleHabilitada,
  onEditarHabilidade,
  onNovaVariacao,
  onEditarVariacao,
}: {
  habilidadesTecnica: TecnicaHabilidade[];
  editavel?: boolean;
  onToggleHabilitada?: (habilidade: TecnicaHabilidade, habilitada: boolean) => void;
  onEditarHabilidade?: (habilidade: TecnicaHabilidade) => void;
  onNovaVariacao?: (habilidade: TecnicaHabilidade) => void;
  onEditarVariacao?: (habilidade: TecnicaHabilidade, variacao: TecnicaVariacao) => void;
}) {
  if (habilidadesTecnica.length === 0) {
    return (
      <div className="px-4 py-3">
        <p className="text-xs text-app-muted">
          Nenhuma habilidade cadastrada para esta tecnica.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-app-border">
      {habilidadesTecnica
        .slice()
        .sort((a, b) => a.ordem - b.ordem)
        .map((habilidade) => {
          const requisitos = formatRequisitos(habilidade.requisitos);
          const variacoes = habilidade.variacoes ?? [];

          return (
            <details key={habilidade.id} className="group px-4 py-3">
              <summary className="list-none cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-sm font-semibold ${habilidade.habilitada === false ? 'text-app-muted line-through' : 'text-app-fg'}`}>
                      {habilidade.nome}
                    </p>
                    <p className="mt-1 text-xs text-app-muted">
                      {habilidade.descricao}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {habilidade.habilitada === false && (
                      <Badge color="gray" size="sm">
                        Desabilitada
                      </Badge>
                    )}
                    <Icon
                      name="chevron-down"
                      className="mt-0.5 h-4 w-4 text-app-muted transition-transform group-open:rotate-180"
                    />
                  </div>
                </div>
              </summary>

              <div className="mt-3 space-y-3">
                {editavel && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Checkbox
                      checked={habilidade.habilitada !== false}
                      onChange={(event) =>
                        onToggleHabilitada?.(habilidade, event.target.checked)
                      }
                      label="Habilitada"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEditarHabilidade?.(habilidade)}
                    >
                      Editar habilidade
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNovaVariacao?.(habilidade)}
                    >
                      Nova variação
                    </Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {formatExecucao(habilidade.execucao) && (
                    <Badge color="purple" size="sm">
                      {formatExecucao(habilidade.execucao)}
                    </Badge>
                  )}
                  {habilidade.alcance && (
                    <Badge color="gray" size="sm">
                      Alcance: {habilidade.alcance}
                    </Badge>
                  )}
                  {habilidade.alvo && (
                    <Badge color="gray" size="sm">
                      Alvo: {habilidade.alvo}
                    </Badge>
                  )}
                  {habilidade.duracao && (
                    <Badge color="gray" size="sm">
                      Duracao: {habilidade.duracao}
                    </Badge>
                  )}
                  {formatArea(habilidade.area) && (
                    <Badge color="gray" size="sm">
                      Area: {formatArea(habilidade.area)}
                    </Badge>
                  )}
                  {(habilidade.custoEA > 0 || habilidade.custoPE > 0) && (
                    <Badge color="orange" size="sm">
                      Custo: {habilidade.custoEA} EA / {habilidade.custoPE} PE
                    </Badge>
                  )}
                </div>

                <div className="rounded-md border border-app-border bg-app-surface px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-app-muted">
                    Efeito
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-app-fg">
                    {habilidade.efeito}
                  </p>
                </div>

                {requisitos.length > 0 && (
                  <div className="rounded-md border border-app-border bg-app-surface px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-app-muted">
                      Requisitos
                    </p>
                    <ul className="mt-1 space-y-1 text-xs text-app-fg">
                      {requisitos.map((linha) => (
                        <li key={linha}>- {linha}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {variacoes.length > 0 && (
                  <div className="rounded-md border border-app-border bg-app-surface px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-app-muted">
                      Variacoes
                    </p>
                    <div className="mt-2 space-y-2">
                      {variacoes
                        .slice()
                        .sort((a, b) => a.ordem - b.ordem)
                        .map((variacao) => (
                          <div
                            key={variacao.id}
                            className="rounded border border-app-border bg-app-bg px-3 py-2"
                          >
                            <p className="text-xs font-semibold text-app-fg">
                              {variacao.nome}
                            </p>
                            <p className="mt-1 text-xs text-app-muted">
                              {variacao.descricao}
                            </p>
                            {variacao.efeitoAdicional && (
                              <p className="mt-1 text-xs text-app-fg">
                                {variacao.efeitoAdicional}
                              </p>
                            )}
                            {editavel && (
                              <div className="mt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    onEditarVariacao?.(habilidade, variacao)
                                  }
                                >
                                  Editar variação
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </details>
          );
        })}
    </div>
  );
}

export function SecaoPoderes({
  personagem,
  periciasMap,
  tiposGrauMap,
  personagemId,
  onTecnicaAtualizada,
}: SecaoPoderesProps) {
  const habilidades = personagem.habilidades ?? [];

  const periciasMapCompleto = new Map<string, PericiaCatalogo>();
  (personagem.pericias ?? []).forEach((pericia) => {
    periciasMapCompleto.set(pericia.codigo, {
      id: pericia.id,
      codigo: pericia.codigo,
      nome: pericia.nome,
      descricao: null,
      atributoBase: pericia.atributoBase,
      somenteTreinada: pericia.somenteTreinada,
      penalizaPorCarga: pericia.penalizaPorCarga,
      precisaKit: pericia.precisaKit,
    });
  });

  const groupedHabilities = habilidades.reduce((acc, hab) => {
    const tipo = hab.tipo || 'OUTRO';
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(hab);
    return acc;
  }, {} as Record<string, Habilidade[]>);

  const tecnicasNaoInatasOrdenadas = [...(personagem.tecnicasNaoInatas ?? [])]
    .sort((a, b) => a.nome.localeCompare(b.nome));
  const tecnicaInata = personagem.tecnicaInata;
  const tecnicaEditavel = Boolean(personagemId && tecnicaInata);
  const [modalHabilidadeAberto, setModalHabilidadeAberto] = useState(false);
  const [habilidadeEditando, setHabilidadeEditando] =
    useState<TecnicaHabilidade | null>(null);
  const [formHabilidade, setFormHabilidade] = useState<HabilidadeFormState>(
    createHabilidadeFormState(),
  );
  const [modalVariacaoAberto, setModalVariacaoAberto] = useState(false);
  const [habilidadeVariacaoPai, setHabilidadeVariacaoPai] =
    useState<TecnicaHabilidade | null>(null);
  const [variacaoEditando, setVariacaoEditando] =
    useState<TecnicaVariacao | null>(null);
  const [formVariacao, setFormVariacao] = useState<VariacaoFormState>(
    createVariacaoFormState(),
  );

  async function refreshTecnica() {
    if (onTecnicaAtualizada) {
      await onTecnicaAtualizada();
    }
  }

  async function toggleHabilitada(
    habilidade: TecnicaHabilidade,
    habilitada: boolean,
  ) {
    if (!personagemId) return;
    await apiAtualizarHabilidadeTecnicaInataPropria(personagemId, habilidade.id, {
      habilitada,
    });
    await refreshTecnica();
  }

  function abrirNovaHabilidade() {
    setHabilidadeEditando(null);
    setFormHabilidade(createHabilidadeFormState());
    setModalHabilidadeAberto(true);
  }

  function abrirEditarHabilidade(habilidade: TecnicaHabilidade) {
    setHabilidadeEditando(habilidade);
    setFormHabilidade(createHabilidadeFormState(habilidade));
    setModalHabilidadeAberto(true);
  }

  function abrirNovaVariacao(habilidade: TecnicaHabilidade) {
    setHabilidadeVariacaoPai(habilidade);
    setVariacaoEditando(null);
    setFormVariacao(createVariacaoFormState());
    setModalVariacaoAberto(true);
  }

  function abrirEditarVariacao(
    habilidade: TecnicaHabilidade,
    variacao: TecnicaVariacao,
  ) {
    setHabilidadeVariacaoPai(habilidade);
    setVariacaoEditando(variacao);
    setFormVariacao(createVariacaoFormState(variacao));
    setModalVariacaoAberto(true);
  }

  async function salvarHabilidade() {
    if (!personagemId) return;
    const payload = {
      codigo: formHabilidade.codigo || undefined,
      nome: formHabilidade.nome,
      descricao: formHabilidade.descricao,
      execucao: formHabilidade.execucao,
      alcance: formHabilidade.alcance || null,
      alvo: formHabilidade.alvo || null,
      duracao: formHabilidade.duracao || null,
      custoEA: Number(formHabilidade.custoEA || 0),
      custoPE: Number(formHabilidade.custoPE || 0),
      efeito: formHabilidade.efeito,
      ordem: Number(formHabilidade.ordem || 10),
      requisitos: parseJsonTextarea(formHabilidade.requisitos),
      habilitada: formHabilidade.habilitada,
    };

    if (habilidadeEditando) {
      await apiAtualizarHabilidadeTecnicaInataPropria(
        personagemId,
        habilidadeEditando.id,
        payload,
      );
    } else {
      await apiCriarHabilidadeTecnicaInataPropria(personagemId, payload);
    }
    await refreshTecnica();
  }

  async function salvarVariacao() {
    if (!personagemId || !habilidadeVariacaoPai) return;
    const payload = {
      nome: formVariacao.nome,
      descricao: formVariacao.descricao,
      custoEA: formVariacao.custoEA ? Number(formVariacao.custoEA) : null,
      custoPE: formVariacao.custoPE ? Number(formVariacao.custoPE) : null,
      efeitoAdicional: formVariacao.efeitoAdicional || null,
      ordem: Number(formVariacao.ordem || 10),
      requisitos: parseJsonTextarea(formVariacao.requisitos),
    };

    if (variacaoEditando) {
      await apiAtualizarVariacaoTecnicaInataPropria(
        personagemId,
        variacaoEditando.id,
        payload,
      );
    } else {
      await apiCriarVariacaoTecnicaInataPropria(
        personagemId,
        habilidadeVariacaoPai.id,
        payload,
      );
    }
    await refreshTecnica();
  }

  return (
    <div className="space-y-6">
      <SectionCard
        title="Tecnica Inata"
        right={<Icon name="technique" className="h-5 w-5 text-app-muted" />}
      >
        {!tecnicaInata ? (
          <EmptyState
            variant="card"
            icon="technique"
            title="Sem tecnica inata"
            description="Este personagem nao possui tecnica inata selecionada."
          />
        ) : (
          <div className="rounded-lg border border-app-border bg-app-bg">
            <div className="border-b border-app-border px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-app-fg">
                    {tecnicaInata.nome}
                  </h4>
                  {tecnicaInata.descricao && (
                    <p className="mt-1 text-xs text-app-muted">
                      {tecnicaInata.descricao}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Badge
                    color={tecnicaInata.hereditaria ? 'purple' : 'blue'}
                    size="sm"
                  >
                    {tecnicaInata.hereditaria ? 'Hereditaria' : 'Nao hereditaria'}
                  </Badge>
                  <Badge color="gray" size="sm">
                    {(tecnicaInata.habilidades ?? []).length}{' '}
                    {(tecnicaInata.habilidades ?? []).length === 1
                      ? 'habilidade'
                      : 'habilidades'}
                  </Badge>
                  {tecnicaEditavel && (
                    <Button variant="secondary" size="sm" onClick={abrirNovaHabilidade}>
                      <Icon name="add" className="h-4 w-4 mr-1" />
                      Nova habilidade
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <HabilidadesTecnicaList
              habilidadesTecnica={tecnicaInata.habilidades ?? []}
              editavel={tecnicaEditavel}
              onToggleHabilitada={(habilidade, habilitada) => {
                void toggleHabilitada(habilidade, habilitada);
              }}
              onEditarHabilidade={abrirEditarHabilidade}
              onNovaVariacao={abrirNovaVariacao}
              onEditarVariacao={abrirEditarVariacao}
            />
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Tecnicas Nao-Inatas"
        right={<Icon name="book" className="h-5 w-5 text-app-muted" />}
      >
        {tecnicasNaoInatasOrdenadas.length === 0 ? (
          <EmptyState
            variant="card"
            icon="book"
            title="Sem tecnicas nao-inatas"
            description="Nenhuma tecnica nao-inata cadastrada no sistema."
          />
        ) : (
          <div className="space-y-4">
            {tecnicasNaoInatasOrdenadas.map((tecnica) => {
              const habilidadesTecnica = tecnica.habilidades ?? [];
              return (
                <div
                  key={tecnica.id}
                  className="rounded-lg border border-app-border bg-app-bg"
                >
                  <div className="border-b border-app-border px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-app-fg">
                          {tecnica.nome}
                        </h4>
                        {tecnica.descricao && (
                          <p className="mt-1 text-xs text-app-muted">
                            {tecnica.descricao}
                          </p>
                        )}
                      </div>
                      <Badge color="blue" size="sm">
                        {habilidadesTecnica.length}{' '}
                        {habilidadesTecnica.length === 1
                          ? 'habilidade'
                          : 'habilidades'}
                      </Badge>
                    </div>
                  </div>

                  <HabilidadesTecnicaList habilidadesTecnica={habilidadesTecnica} />
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Habilidades & Tecnicas do Personagem"
        right={<Icon name="sparkles" className="h-5 w-5 text-app-muted" />}
      >
        {habilidades.length === 0 ? (
          <EmptyState
            variant="card"
            icon="sparkles"
            title="Sem habilidades"
            description="Nenhuma habilidade ou tecnica foi atribuida ao personagem."
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedHabilities).map(([tipo, habs]) => {
              const useSingleColumn = habs.length === 1;

              return (
                <div key={tipo}>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-px flex-1 bg-app-border"></div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-app-primary">
                      {HABILITY_TYPES[tipo as keyof typeof HABILITY_TYPES] ||
                        tipo}
                    </h4>
                    <div className="h-px flex-1 bg-app-border"></div>
                  </div>

                  <div
                    className={
                      useSingleColumn
                        ? 'grid grid-cols-1 gap-3'
                        : 'grid grid-cols-1 gap-3 md:grid-cols-2'
                    }
                  >
                    {habs.map((hab) => (
                      <div
                        key={hab.id}
                        className="rounded-lg border border-app-border bg-app-bg p-4 transition-colors hover:border-app-primary/30"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h5 className="text-sm font-semibold text-app-fg">
                            {hab.nome}
                          </h5>
                          {hab.tipo === 'PODER_GENERICO' && (
                            <Badge color="purple" size="sm">
                              Poder
                            </Badge>
                          )}
                        </div>
                        {hab.descricao && (
                          <p className="text-xs leading-relaxed text-app-muted">
                            {hab.descricao}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {personagem.poderesGenericos && personagem.poderesGenericos.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Icon name="fire" className="h-5 w-5 text-app-warning" />
            <span className="text-lg font-semibold text-app-fg">
              Poderes Genericos (Detalhes)
            </span>
          </div>
          <PoderesGenericosSection
            poderes={personagem.poderesGenericos}
            periciasMap={periciasMap}
            tiposGrauMap={tiposGrauMap}
          />
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center gap-2">
          <Icon name="training" className="h-5 w-5 text-app-success" />
          <span className="text-lg font-semibold text-app-fg">
            Graus de Treinamento
          </span>
        </div>
        <TrainingGradesSection
          grades={personagem.grausTreinamento ?? []}
          skillsMap={periciasMapCompleto}
        />
      </div>

      <HabilidadeTecnicaFormModal
        isOpen={modalHabilidadeAberto}
        onClose={() => setModalHabilidadeAberto(false)}
        title={
          habilidadeEditando
            ? 'Editar habilidade da técnica própria'
            : 'Nova habilidade da técnica própria'
        }
        value={formHabilidade}
        onChange={setFormHabilidade}
        onSubmit={salvarHabilidade}
      />

      <VariacaoTecnicaFormModal
        isOpen={modalVariacaoAberto}
        onClose={() => setModalVariacaoAberto(false)}
        title={
          variacaoEditando
            ? 'Editar variação da técnica própria'
            : 'Nova variação da técnica própria'
        }
        value={formVariacao}
        onChange={setFormVariacao}
        onSubmit={salvarVariacao}
      />
    </div>
  );
}
