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
  TIPO_EXECUCAO_LABELS,
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

type HabilidadeFormState = {
  codigo: string;
  nome: string;
  descricao: string;
  execucao: TipoExecucao;
  custoPE: string;
  custoEA: string;
  efeito: string;
  ordem: string;
};

type VariacaoFormState = {
  nome: string;
  descricao: string;
  substituiCustos: boolean;
  custoPE: string;
  custoEA: string;
  ordem: string;
};

function parseNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
}

function buildHabilidadeFormState(item?: HabilidadeTecnicaCatalogo | null): HabilidadeFormState {
  return {
    codigo: item?.codigo ?? '',
    nome: item?.nome ?? '',
    descricao: item?.descricao ?? '',
    execucao: item?.execucao ?? TipoExecucao.ACAO_PADRAO,
    custoPE: String(item?.custoPE ?? 0),
    custoEA: String(item?.custoEA ?? 0),
    efeito: item?.efeito ?? '',
    ordem: String(item?.ordem ?? 0),
  };
}

function buildVariacaoFormState(item?: VariacaoHabilidadeTecnicaCatalogo | null): VariacaoFormState {
  return {
    nome: item?.nome ?? '',
    descricao: item?.descricao ?? '',
    substituiCustos: item?.substituiCustos ?? false,
    custoPE: item?.custoPE !== undefined && item?.custoPE !== null ? String(item.custoPE) : '',
    custoEA: item?.custoEA !== undefined && item?.custoEA !== null ? String(item.custoEA) : '',
    ordem: String(item?.ordem ?? 0),
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

      const basePayload = {
        nome: form.nome.trim(),
        descricao: form.descricao.trim(),
        execucao: form.execucao,
        custoPE: Number(form.custoPE),
        custoEA: Number(form.custoEA),
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
          <Input label="Nome *" value={form.nome} onChange={(e) => setField('nome', e.target.value)} error={errors.nome} />
          <Select label="Execucao *" value={form.execucao} onChange={(e) => setField('execucao', e.target.value as TipoExecucao)}>
            {(Object.entries(TIPO_EXECUCAO_LABELS) as [TipoExecucao, string][]).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
          <Input label="Ordem" type="number" min={0} value={form.ordem} onChange={(e) => setField('ordem', e.target.value)} />
          <Input label="Custo PE *" type="number" min={0} value={form.custoPE} onChange={(e) => setField('custoPE', e.target.value)} error={errors.custoPE} />
          <Input label="Custo EA *" type="number" min={0} value={form.custoEA} onChange={(e) => setField('custoEA', e.target.value)} error={errors.custoEA} />
        </div>

        <Textarea label="Descricao *" rows={4} value={form.descricao} onChange={(e) => setField('descricao', e.target.value)} error={errors.descricao} />
        <Textarea label="Efeito *" rows={4} value={form.efeito} onChange={(e) => setField('efeito', e.target.value)} error={errors.efeito} />
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

      const basePayload = {
        nome: form.nome.trim(),
        descricao: form.descricao.trim(),
        substituiCustos: form.substituiCustos,
        custoPE: parseNumber(form.custoPE),
        custoEA: parseNumber(form.custoEA),
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
        <Input label="Nome *" value={form.nome} onChange={(e) => setField('nome', e.target.value)} error={errors.nome} />
        <Textarea label="Descricao *" rows={3} value={form.descricao} onChange={(e) => setField('descricao', e.target.value)} error={errors.descricao} />
        <Checkbox label="Substitui custos" checked={form.substituiCustos} onChange={(e) => setField('substituiCustos', e.target.checked)} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input label="Custo PE" type="number" min={0} value={form.custoPE} onChange={(e) => setField('custoPE', e.target.value)} />
          <Input label="Custo EA" type="number" min={0} value={form.custoEA} onChange={(e) => setField('custoEA', e.target.value)} />
          <Input label="Ordem" type="number" min={0} value={form.ordem} onChange={(e) => setField('ordem', e.target.value)} />
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
