'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { ModalHabilidadeAdminForm } from './ModalHabilidadeAdminForm';
import { TecnicaHabilidadesModal } from '../panels/TecnicaHabilidadesModal';
import {
  apiAdminGetHabilidades,
  apiAdminCreateHabilidade,
  apiAdminUpdateHabilidade,
  apiAdminGetTecnicasAmaldicoadas,
  apiGetSuplementos,
  extrairMensagemErro,
  type HabilidadeCatalogo,
  type ListResult,
  type ListHabilidadesFilters,
  type TipoFonte,
  type TipoHabilidadeCatalogo,
  TipoTecnicaAmaldicoada,
  type TecnicaAmaldicoadaCatalogo,
  type SuplementoCatalogo,
  type CreateHabilidadePayload,
  type UpdateHabilidadePayload,
} from '@/lib/api';

type DraftFilters = {
  busca: string;
  tipo: 'TODOS' | TipoHabilidadeCatalogo;
  fonte: 'TODAS' | TipoFonte;
  suplementoId: string;
  limite: number;
};

type AppliedFilters = DraftFilters & {
  pagina: number;
};

const TIPO_OPTIONS: Array<{ value: DraftFilters['tipo']; label: string }> = [
  { value: 'TODOS', label: 'Todos os tipos' },
  { value: 'PODER_GENERICO', label: 'Poder Generico' },
  { value: 'RECURSO_CLASSE', label: 'Recurso de Classe' },
  { value: 'EFEITO_GRAU', label: 'Efeito de Grau' },
  { value: 'MECANICA_ESPECIAL', label: 'Mecanica Especial' },
  { value: 'HABILIDADE_ORIGEM', label: 'Habilidade de Origem' },
  { value: 'HABILIDADE_TRILHA', label: 'Habilidade de Trilha' },
  { value: 'ESCOLA_TECNICA', label: 'Escola Tecnica' },
];

const FONTE_OPTIONS: Array<{ value: DraftFilters['fonte']; label: string }> = [
  { value: 'TODAS', label: 'Todas as fontes' },
  { value: 'SISTEMA_BASE' as TipoFonte, label: 'Sistema Base' },
  { value: 'SUPLEMENTO' as TipoFonte, label: 'Suplemento' },
  { value: 'HOMEBREW' as TipoFonte, label: 'Homebrew' },
];

const LIMIT_OPTIONS = [10, 20, 50];

const INITIAL_DRAFT_FILTERS: DraftFilters = {
  busca: '',
  tipo: 'TODOS',
  fonte: 'TODAS',
  suplementoId: '',
  limite: 20,
};

function toApiFilters(filtros: AppliedFilters): ListHabilidadesFilters {
  const mapped: ListHabilidadesFilters = {
    pagina: filtros.pagina,
    limite: filtros.limite,
  };

  if (filtros.busca.trim()) mapped.busca = filtros.busca.trim();
  if (filtros.tipo !== 'TODOS') mapped.tipo = filtros.tipo;
  if (filtros.fonte !== 'TODAS') mapped.fonte = filtros.fonte;

  if (filtros.fonte === 'SUPLEMENTO' && filtros.suplementoId.trim()) {
    mapped.suplementoId = Number(filtros.suplementoId.trim());
  }

  return mapped;
}

function formatFonte(fonte?: TipoFonte): string {
  if (!fonte) return 'N/A';
  if (fonte === 'SISTEMA_BASE') return 'Sistema Base';
  if (fonte === 'SUPLEMENTO') return 'Suplemento';
  return 'Homebrew';
}

function fonteBadgeColor(fonte?: TipoFonte): 'gray' | 'blue' | 'orange' {
  if (fonte === 'SUPLEMENTO') return 'blue';
  if (fonte === 'HOMEBREW') return 'orange';
  return 'gray';
}

type SelecionarTecnicaModalProps = {
  isOpen: boolean;
  loading: boolean;
  tipo: TipoTecnicaAmaldicoada;
  tecnicas: TecnicaAmaldicoadaCatalogo[];
  selectedId: string;
  onChangeTipo: (value: TipoTecnicaAmaldicoada) => void;
  onChangeSelectedId: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

function SelecionarTecnicaModal({
  isOpen,
  loading,
  tipo,
  tecnicas,
  selectedId,
  onChangeTipo,
  onChangeSelectedId,
  onClose,
  onConfirm,
}: SelecionarTecnicaModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova habilidade de tecnica"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={!selectedId || loading}>
            Abrir editor da tecnica
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-app-muted">
            Cadastro de habilidade de tecnica e separado do poder generico.
            Selecione a tecnica de destino para abrir o CRUD dedicado.
          </p>
        </Card>

        <div className="grid grid-cols-1 gap-3">
          <Select
            label="Tipo da tecnica"
            value={tipo}
            onChange={(e) => onChangeTipo(e.target.value as TipoTecnicaAmaldicoada)}
          >
            <option value={TipoTecnicaAmaldicoada.INATA}>Tecnica Inata</option>
            <option value={TipoTecnicaAmaldicoada.NAO_INATA}>Tecnica Nao Inata</option>
          </Select>

          {loading ? (
            <Loading message="Carregando tecnicas..." className="py-6 text-app-fg" />
          ) : tecnicas.length === 0 ? (
            <EmptyState
              variant="card"
              icon="technique"
              title="Nenhuma tecnica encontrada"
              description="Cadastre a tecnica primeiro no modulo de tecnicas."
            />
          ) : (
            <Select
              label="Tecnica de destino"
              value={selectedId}
              onChange={(e) => onChangeSelectedId(e.target.value)}
            >
              <option value="">Selecione...</option>
              {tecnicas.map((tecnica) => (
                <option key={tecnica.id} value={String(tecnica.id)}>
                  {tecnica.codigo} - {tecnica.nome}
                </option>
              ))}
            </Select>
          )}
        </div>
      </div>
    </Modal>
  );
}

export function HabilidadesAdminPanel() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [result, setResult] = useState<ListResult<HabilidadeCatalogo>>({
    items: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  const [draftFilters, setDraftFilters] = useState<DraftFilters>(INITIAL_DRAFT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({
    ...INITIAL_DRAFT_FILTERS,
    pagina: 1,
  });

  const [suplementos, setSuplementos] = useState<SuplementoCatalogo[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [habilidadeEditando, setHabilidadeEditando] = useState<HabilidadeCatalogo | null>(null);
  const [tecnicaSelectorOpen, setTecnicaSelectorOpen] = useState(false);
  const [tecnicaTipoSelecionado, setTecnicaTipoSelecionado] = useState<TipoTecnicaAmaldicoada>(
    TipoTecnicaAmaldicoada.INATA,
  );
  const [tecnicasDisponiveis, setTecnicasDisponiveis] = useState<TecnicaAmaldicoadaCatalogo[]>([]);
  const [tecnicasLoading, setTecnicasLoading] = useState(false);
  const [tecnicaSelecionadaId, setTecnicaSelecionadaId] = useState('');
  const [tecnicaHabilidadesModalOpen, setTecnicaHabilidadesModalOpen] = useState(false);
  const [tecnicaHabilidadesItem, setTecnicaHabilidadesItem] =
    useState<TecnicaAmaldicoadaCatalogo | null>(null);

  const suplementoNameById = useMemo(() => {
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

  const carregarHabilidades = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);

      const data = await apiAdminGetHabilidades(toApiFilters(appliedFilters));
      setResult(data);
    } catch (error) {
      const mensagem = extrairMensagemErro(error);
      setErro(mensagem);
      showToast(mensagem, 'error');
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, showToast]);

  const carregarTecnicasDisponiveis = useCallback(
    async (tipo: TipoTecnicaAmaldicoada) => {
      try {
        setTecnicasLoading(true);
        const data = await apiAdminGetTecnicasAmaldicoadas({
          tipo,
          incluirClas: true,
          incluirHabilidades: false,
        });
        setTecnicasDisponiveis(data);
      } catch (error) {
        showToast(extrairMensagemErro(error), 'error');
      } finally {
        setTecnicasLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    carregarSuplementos();
  }, [carregarSuplementos]);

  useEffect(() => {
    carregarHabilidades();
  }, [carregarHabilidades]);

  useEffect(() => {
    if (!tecnicaSelectorOpen) return;
    carregarTecnicasDisponiveis(tecnicaTipoSelecionado);
  }, [tecnicaSelectorOpen, tecnicaTipoSelecionado, carregarTecnicasDisponiveis]);

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

  function mudarPagina(novaPagina: number) {
    if (novaPagina < 1 || novaPagina > result.totalPages) return;
    setAppliedFilters((prev) => ({ ...prev, pagina: novaPagina }));
  }

  async function handleCreate(payload: CreateHabilidadePayload) {
    try {
      await apiAdminCreateHabilidade(payload);
      showToast('Habilidade criada com sucesso.', 'success');
      await carregarHabilidades();
    } catch (error) {
      showToast(extrairMensagemErro(error), 'error');
      throw error;
    }
  }

  async function handleUpdate(id: number, payload: UpdateHabilidadePayload) {
    try {
      await apiAdminUpdateHabilidade(id, payload);
      showToast('Habilidade atualizada com sucesso.', 'success');
      await carregarHabilidades();
    } catch (error) {
      showToast(extrairMensagemErro(error), 'error');
      throw error;
    }
  }

  function abrirCriacao() {
    setHabilidadeEditando(null);
    setModalOpen(true);
  }

  function abrirCriacaoHabilidadeTecnica() {
    setTecnicaTipoSelecionado(TipoTecnicaAmaldicoada.INATA);
    setTecnicaSelecionadaId('');
    setTecnicaSelectorOpen(true);
  }

  function confirmarTecnicaSelecionada() {
    const tecnica = tecnicasDisponiveis.find((item) => item.id === Number(tecnicaSelecionadaId));
    if (!tecnica) {
      showToast('Selecione uma tecnica valida.', 'error');
      return;
    }

    setTecnicaHabilidadesItem(tecnica);
    setTecnicaHabilidadesModalOpen(true);
    setTecnicaSelectorOpen(false);
  }

  function abrirEdicao(habilidade: HabilidadeCatalogo) {
    setHabilidadeEditando(habilidade);
    setModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-app-fg">Gerenciar Habilidades</h2>
            <p className="text-sm text-app-muted">
              Poderes genericos ficam aqui. Habilidades de tecnica usam CRUD dedicado por tecnica.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="secondary" onClick={abrirCriacaoHabilidadeTecnica}>
              <Icon name="technique" className="w-4 h-4 mr-2" />
              Nova habilidade de tecnica
            </Button>
            <Button variant="primary" onClick={abrirCriacao}>
              <Icon name="add" className="w-4 h-4 mr-2" />
              Novo poder generico
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input
            label="Busca"
            value={draftFilters.busca}
            onChange={(e) => setDraftFilters((prev) => ({ ...prev, busca: e.target.value }))}
            placeholder="Nome, origem..."
            icon="search"
          />

          <Select
            label="Tipo"
            value={draftFilters.tipo}
            onChange={(e) =>
              setDraftFilters((prev) => ({
                ...prev,
                tipo: e.target.value as DraftFilters['tipo'],
              }))
            }
          >
            {TIPO_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
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
            {FONTE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>

          {draftFilters.fonte === 'SUPLEMENTO' ? (
            <Select
              label="Suplemento"
              value={draftFilters.suplementoId}
              onChange={(e) =>
                setDraftFilters((prev) => ({ ...prev, suplementoId: e.target.value }))
              }
            >
              <option value="">Todos</option>
              {suplementos.map((suplemento) => (
                <option key={suplemento.id} value={suplemento.id.toString()}>
                  #{suplemento.id} - {suplemento.nome}
                </option>
              ))}
            </Select>
          ) : (
            <Input label="Suplemento" value="" disabled helperText="Somente quando fonte = SUPLEMENTO." />
          )}

          <Select
            label="Itens por pagina"
            value={draftFilters.limite.toString()}
            onChange={(e) =>
              setDraftFilters((prev) => ({ ...prev, limite: Number(e.target.value) }))
            }
          >
            {LIMIT_OPTIONS.map((limite) => (
              <option key={limite} value={limite.toString()}>
                {limite}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="primary" onClick={aplicarFiltros}>
            Aplicar filtros
          </Button>
          <Button variant="secondary" onClick={limparFiltros}>
            Limpar
          </Button>
        </div>
      </Card>

      {erro && <ErrorAlert message={erro} />}

      <Card>
        {loading ? (
          <Loading message="Carregando habilidades..." className="text-app-fg py-8" />
        ) : result.items.length === 0 ? (
          <EmptyState
            variant="card"
            icon="sparkles"
            title="Nenhuma habilidade encontrada"
            description="Ajuste os filtros ou crie uma nova habilidade."
            actionLabel="Nova habilidade"
            onAction={abrirCriacao}
          />
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-app-muted">
              Total: <span className="font-semibold text-app-fg">{result.total}</span> itens
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-app-border text-left text-app-muted">
                    <th className="py-2 pr-2">ID</th>
                    <th className="py-2 pr-2">Nome</th>
                    <th className="py-2 pr-2">Tipo</th>
                    <th className="py-2 pr-2">Fonte</th>
                    <th className="py-2 pr-2">Suplemento</th>
                    <th className="py-2 text-right">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((habilidade) => (
                    <tr key={habilidade.id} className="border-b border-app-border/60">
                      <td className="py-3 pr-2 text-app-muted">#{habilidade.id}</td>
                      <td className="py-3 pr-2">
                        <div className="text-app-fg font-medium">{habilidade.nome}</div>
                        {habilidade.descricao && (
                          <div className="text-xs text-app-muted line-clamp-1">{habilidade.descricao}</div>
                        )}
                      </td>
                      <td className="py-3 pr-2 text-app-fg">{habilidade.tipo}</td>
                      <td className="py-3 pr-2">
                        <Badge size="sm" color={fonteBadgeColor(habilidade.fonte)}>
                          {formatFonte(habilidade.fonte)}
                        </Badge>
                      </td>
                      <td className="py-3 pr-2 text-app-fg">
                        {habilidade.suplementoId
                          ? suplementoNameById.get(habilidade.suplementoId) ?? `#${habilidade.suplementoId}`
                          : '-'}
                      </td>
                      <td className="py-3 text-right">
                        <Button variant="secondary" size="sm" onClick={() => abrirEdicao(habilidade)}>
                          <Icon name="edit" className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-app-muted">
                Pagina {result.page} de {result.totalPages}
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={result.page <= 1}
                  onClick={() => mudarPagina(result.page - 1)}
                  className="flex-1 sm:flex-none"
                >
                  Anterior
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={result.page >= result.totalPages}
                  onClick={() => mudarPagina(result.page + 1)}
                  className="flex-1 sm:flex-none"
                >
                  Proxima
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <ModalHabilidadeAdminForm
        isOpen={modalOpen}
        onClose={(success) => {
          setModalOpen(false);
          setHabilidadeEditando(null);
          if (success) {
            carregarHabilidades();
          }
        }}
        onSubmitCreate={handleCreate}
        onSubmitUpdate={handleUpdate}
        suplementos={suplementos}
        habilidade={habilidadeEditando}
      />

      <SelecionarTecnicaModal
        isOpen={tecnicaSelectorOpen}
        loading={tecnicasLoading}
        tipo={tecnicaTipoSelecionado}
        tecnicas={tecnicasDisponiveis}
        selectedId={tecnicaSelecionadaId}
        onChangeTipo={(value) => {
          setTecnicaTipoSelecionado(value);
          setTecnicaSelecionadaId('');
        }}
        onChangeSelectedId={setTecnicaSelecionadaId}
        onClose={() => setTecnicaSelectorOpen(false)}
        onConfirm={confirmarTecnicaSelecionada}
      />

      <TecnicaHabilidadesModal
        isOpen={tecnicaHabilidadesModalOpen}
        tecnica={tecnicaHabilidadesItem}
        onClose={(success) => {
          setTecnicaHabilidadesModalOpen(false);
          setTecnicaHabilidadesItem(null);
          if (success) {
            carregarHabilidades();
          }
        }}
      />
    </div>
  );
}
