'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/hooks/useConfirm';
import {
  apiArquivarHomebrew,
  apiCreateGrupoHomebrew,
  apiDeleteGrupoHomebrew,
  apiDeleteHomebrew,
  apiExportarGrupoHomebrew,
  apiExportarHomebrew,
  apiGetHomebrew,
  apiGetGuiaImportacaoHomebrewJson,
  apiGetMeusHomebrews,
  apiImportarHomebrewJson,
  apiListarGruposHomebrew,
  apiPublicarHomebrew,
  apiUpdateGrupoHomebrew,
  type FiltrarHomebrewsDto,
  type HomebrewDetalhado,
  type HomebrewGrupoResumo,
  type HomebrewResumo,
  type ImportarHomebrewJsonPayload,
} from '@/lib/api/homebrews';
import { criarErroUsuario } from '@/lib/api/error-handler';
import { StatusPublicacao, TipoHomebrewConteudo } from '@/lib/types/homebrew-enums';
import { HomebrewCard } from '@/components/homebrew/HomebrewCard';
import { HomebrewPreviewModal } from '@/components/homebrew/HomebrewPreviewModal';
import { getHomebrewTipoConfig } from '@/components/homebrew/homebrewUi';
import { JsonImportModal } from '@/components/import-export/JsonImportModal';
import { JsonGuideModal } from '@/components/import-export/JsonGuideModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { EntityActionsMenu } from '@/components/ui/EntityActionsMenu';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageToolbar } from '@/components/ui/PageToolbar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Select } from '@/components/ui/Select';
import { StatsStrip, type StatsStripItem } from '@/components/ui/StatsStrip';
import type { UserErrorState } from '@/lib/types';

const STATUS_LABEL: Record<StatusPublicacao, string> = {
  RASCUNHO: 'Rascunho',
  PUBLICADO: 'Publicado',
  ARQUIVADO: 'Arquivado',
};

function baixarJsonArquivo(conteudo: unknown, arquivo: string) {
  const blob = new Blob([JSON.stringify(conteudo, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = arquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

async function carregarTodasAsHomebrews(): Promise<HomebrewResumo[]> {
  const acumulado: HomebrewResumo[] = [];
  let pagina = 1;
  let totalPages = 1;

  do {
    const resposta = await apiGetMeusHomebrews({ pagina, limite: 100 });
    acumulado.push(...(resposta.items ?? []));
    totalPages = Math.max(1, resposta.totalPages || 1);
    pagina += 1;
  } while (pagina <= totalPages);

  return acumulado;
}

export default function HomebrewsPage() {
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { isOpen, options, confirm, handleClose, handleConfirm } = useConfirm();

  const [homebrews, setHomebrews] = useState<HomebrewResumo[]>([]);
  const [todosHomebrews, setTodosHomebrews] = useState<HomebrewResumo[]>([]);
  const [grupos, setGrupos] = useState<HomebrewGrupoResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<UserErrorState | null>(null);
  const [processando, setProcessando] = useState<number | null>(null);
  const [processandoGrupoId, setProcessandoGrupoId] = useState<number | null>(null);
  const [previewAberto, setPreviewAberto] = useState(false);
  const [previewResumo, setPreviewResumo] = useState<HomebrewResumo | null>(null);
  const [previewDetalhe, setPreviewDetalhe] = useState<HomebrewDetalhado | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewErro, setPreviewErro] = useState<string | null>(null);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalHomebrews, setTotalHomebrews] = useState(0);
  const limite = 12;

  const [filtroNome, setFiltroNome] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoHomebrewConteudo | 'TODOS'>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<StatusPublicacao | 'TODOS'>('TODOS');
  const [filtroGrupoId, setFiltroGrupoId] = useState<number | 'TODOS'>('TODOS');
  const filtroNomeRef = useRef(filtroNome);

  const [modalGrupoAberto, setModalGrupoAberto] = useState(false);
  const [modalImportacaoAberto, setModalImportacaoAberto] = useState(false);
  const [jsonGuideOpen, setJsonGuideOpen] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState<HomebrewGrupoResumo | null>(null);
  const [grupoNome, setGrupoNome] = useState('');
  const [grupoDescricao, setGrupoDescricao] = useState('');
  const [grupoHomebrewIds, setGrupoHomebrewIds] = useState<number[]>([]);
  const [salvandoGrupo, setSalvandoGrupo] = useState(false);

  const valoresTipoFiltro = useMemo<Array<TipoHomebrewConteudo | 'TODOS'>>(
    () => [
      'TODOS',
      TipoHomebrewConteudo.CLA,
      TipoHomebrewConteudo.TRILHA,
      TipoHomebrewConteudo.CAMINHO,
      TipoHomebrewConteudo.ORIGEM,
      TipoHomebrewConteudo.EQUIPAMENTO,
      TipoHomebrewConteudo.PODER_GENERICO,
      TipoHomebrewConteudo.TECNICA_AMALDICOADA,
    ],
    [],
  );

  const valoresStatusFiltro = useMemo<Array<StatusPublicacao | 'TODOS'>>(
    () => ['TODOS', StatusPublicacao.RASCUNHO, StatusPublicacao.PUBLICADO, StatusPublicacao.ARQUIVADO],
    [],
  );

  const resumoStatus = useMemo(
    () =>
      homebrews.reduce(
        (acc, homebrew) => {
          acc.total += 1;
          if (homebrew.status === 'RASCUNHO') acc.rascunhos += 1;
          if (homebrew.status === 'PUBLICADO') acc.publicados += 1;
          if (homebrew.status === 'ARQUIVADO') acc.arquivados += 1;
          return acc;
        },
        { total: 0, rascunhos: 0, publicados: 0, arquivados: 0 },
      ),
    [homebrews],
  );

  const statsItems: StatsStripItem[] = [
    {
      id: 'total',
      label: 'Total',
      value: totalHomebrews,
      icon: 'sparkles',
      tone: 'primary',
    },
    {
      id: 'rascunhos',
      label: 'Rascunhos',
      value: resumoStatus.rascunhos,
      icon: 'edit',
      tone: 'warning',
      helper: 'nesta página',
    },
    {
      id: 'publicados',
      label: 'Publicados',
      value: resumoStatus.publicados,
      icon: 'check',
      tone: 'success',
      helper: 'nesta página',
    },
    {
      id: 'arquivados',
      label: 'Arquivados',
      value: resumoStatus.arquivados,
      icon: 'archive',
      tone: 'default',
      helper: 'nesta página',
    },
  ];

  const homebrewsExibidos = useMemo(() => {
    if (filtroGrupoId === 'TODOS') return homebrews;
    const grupo = grupos.find((item) => item.id === filtroGrupoId);
    if (!grupo) return homebrews;

    const ids = new Set(grupo.homebrewIds);
    return todosHomebrews.filter((homebrew) => ids.has(homebrew.id));
  }, [filtroGrupoId, grupos, homebrews, todosHomebrews]);

  const filtrosAtivos = useMemo(() => {
    const filtros: string[] = [];
    const nomeTrim = filtroNome.trim();

    if (nomeTrim.length > 0) filtros.push(`Nome: ${nomeTrim}`);
    if (filtroTipo !== 'TODOS') filtros.push(`Tipo: ${getHomebrewTipoConfig(filtroTipo).label}`);
    if (filtroStatus !== 'TODOS') filtros.push(`Status: ${STATUS_LABEL[filtroStatus]}`);
    if (filtroGrupoId !== 'TODOS') {
      const grupo = grupos.find((item) => item.id === filtroGrupoId);
      if (grupo) filtros.push(`Grupo: ${grupo.nome}`);
    }

    return filtros;
  }, [filtroGrupoId, filtroNome, filtroStatus, filtroTipo, grupos]);

  const carregarHomebrews = useCallback(
    async (
      nomeBusca: string,
      overrides?: {
        pagina?: number;
        tipo?: TipoHomebrewConteudo | 'TODOS';
        status?: StatusPublicacao | 'TODOS';
      },
    ) => {
      try {
        setLoading(true);
        setErro(null);

        const pagina = overrides?.pagina ?? paginaAtual;
        const tipo = overrides?.tipo ?? filtroTipo;
        const status = overrides?.status ?? filtroStatus;

        const filtros: Omit<FiltrarHomebrewsDto, 'usuarioId'> = { pagina, limite };
        if (nomeBusca) filtros.nome = nomeBusca;
        if (tipo !== 'TODOS') filtros.tipo = tipo;
        if (status !== 'TODOS') filtros.status = status;

        const result = await apiGetMeusHomebrews(filtros);
        setHomebrews(result.items);
        setTotalPaginas(result.totalPages);
        setTotalHomebrews(result.total);
      } catch (error) {
        const mensagem = criarErroUsuario(error);
        setErro(mensagem);
        showToast(mensagem, 'error');
      } finally {
        setLoading(false);
      }
    },
    [filtroStatus, filtroTipo, paginaAtual, showToast],
  );

  const carregarComplementos = useCallback(async () => {
    try {
      const [todos, gruposCarregados] = await Promise.all([
        carregarTodasAsHomebrews(),
        apiListarGruposHomebrew(),
      ]);
      setTodosHomebrews(todos);
      setGrupos(gruposCarregados);
    } catch {
      setTodosHomebrews([]);
      setGrupos([]);
    }
  }, []);

  useEffect(() => {
    filtroNomeRef.current = filtroNome;
  }, [filtroNome]);

  useEffect(() => {
    if (!authLoading && !usuario) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && usuario) {
      void carregarHomebrews(filtroNomeRef.current);
      void carregarComplementos();
    }
  }, [authLoading, carregarComplementos, carregarHomebrews, router, usuario]);

  useEffect(() => {
    if (filtroGrupoId === 'TODOS') {
      void carregarHomebrews(filtroNomeRef.current);
    }
  }, [carregarHomebrews, filtroGrupoId, paginaAtual]);

  function handleBuscar() {
    setPaginaAtual(1);
    void carregarHomebrews(filtroNome, { pagina: 1 });
  }

  function handleLimparFiltros() {
    setFiltroNome('');
    setFiltroTipo('TODOS');
    setFiltroStatus('TODOS');
    setFiltroGrupoId('TODOS');
    setPaginaAtual(1);
    void carregarHomebrews('', { pagina: 1, tipo: 'TODOS', status: 'TODOS' });
  }

  async function handlePublicar(homebrew: HomebrewResumo) {
    try {
      setProcessando(homebrew.id);
      await apiPublicarHomebrew(homebrew.id);
      setHomebrews((prev) =>
        prev.map((h) =>
          h.id === homebrew.id ? { ...h, status: StatusPublicacao.PUBLICADO } : h,
        ),
      );
      setTodosHomebrews((prev) =>
        prev.map((h) =>
          h.id === homebrew.id ? { ...h, status: StatusPublicacao.PUBLICADO } : h,
        ),
      );
      showToast(`Homebrew "${homebrew.nome}" publicado com sucesso!`, 'success');
    } catch (error) {
      const userError = criarErroUsuario(error);
      showToast(userError.message, 'error', { support: userError });
    } finally {
      setProcessando(null);
    }
  }

  async function handleArquivar(homebrew: HomebrewResumo) {
    try {
      setProcessando(homebrew.id);
      await apiArquivarHomebrew(homebrew.id);
      setHomebrews((prev) =>
        prev.map((h) =>
          h.id === homebrew.id ? { ...h, status: StatusPublicacao.ARQUIVADO } : h,
        ),
      );
      setTodosHomebrews((prev) =>
        prev.map((h) =>
          h.id === homebrew.id ? { ...h, status: StatusPublicacao.ARQUIVADO } : h,
        ),
      );
      showToast(`Homebrew "${homebrew.nome}" arquivado.`, 'info');
    } catch (error) {
      const userError = criarErroUsuario(error);
      showToast(userError.message, 'error', { support: userError });
    } finally {
      setProcessando(null);
    }
  }

  function handleDeleteClick(homebrew: HomebrewResumo) {
    confirm({
      title: `Excluir homebrew "${homebrew.nome}"?`,
      description: 'Esta ação é irreversível.',
      confirmLabel: 'Sim, excluir',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await apiDeleteHomebrew(homebrew.id);
          setHomebrews((prev) => prev.filter((h) => h.id !== homebrew.id));
          setTodosHomebrews((prev) => prev.filter((h) => h.id !== homebrew.id));
          setGrupos((prev) =>
            prev.map((grupo) => ({
              ...grupo,
              homebrewIds: grupo.homebrewIds.filter((id) => id !== homebrew.id),
              quantidadeItens: grupo.homebrewIds.includes(homebrew.id)
                ? Math.max(0, grupo.quantidadeItens - 1)
                : grupo.quantidadeItens,
            })),
          );
          if (previewResumo?.id === homebrew.id) {
            setPreviewAberto(false);
            setPreviewResumo(null);
            setPreviewDetalhe(null);
          }
          showToast('Homebrew excluído com sucesso!', 'success');
        } catch (error) {
          const userError = criarErroUsuario(error);
          showToast(userError.message, 'error', { support: userError });
        }
      },
    });
  }

  function handlePreviewClose() {
    setPreviewAberto(false);
    setPreviewErro(null);
    setPreviewLoading(false);
  }

  function handlePreviewOpenFull() {
    if (!previewResumo) return;
    handlePreviewClose();
    router.push(`/homebrews/${previewResumo.id}`);
  }

  function handlePreviewEdit() {
    if (!previewResumo) return;
    handlePreviewClose();
    router.push(`/homebrews/${previewResumo.id}/editar`);
  }

  async function handleOpenPreview(homebrew: HomebrewResumo) {
    setPreviewAberto(true);
    setPreviewResumo(homebrew);
    setPreviewDetalhe(null);
    setPreviewErro(null);
    setPreviewLoading(true);

    try {
      const detalhe = await apiGetHomebrew(homebrew.id);
      setPreviewDetalhe(detalhe);
    } catch (error) {
      setPreviewErro(criarErroUsuario(error).message);
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleExportarHomebrew(homebrew: HomebrewResumo) {
    try {
      setProcessando(homebrew.id);
      const payload = await apiExportarHomebrew(homebrew.id);
      baixarJsonArquivo(payload, `homebrew-${homebrew.codigo}.json`);
      showToast(`JSON de "${homebrew.nome}" exportado.`, 'success');
    } catch (error) {
      const userError = criarErroUsuario(error);
      showToast(userError.message, 'error', { support: userError });
    } finally {
      setProcessando(null);
    }
  }

  async function handleExportarGrupo(grupo: HomebrewGrupoResumo) {
    try {
      setProcessandoGrupoId(grupo.id);
      const payload = await apiExportarGrupoHomebrew(grupo.id);
      baixarJsonArquivo(payload, `grupo-homebrew-${grupo.id}.json`);
      showToast(`Grupo "${grupo.nome}" exportado.`, 'success');
    } catch (error) {
      const userError = criarErroUsuario(error);
      showToast(userError.message, 'error', { support: userError });
    } finally {
      setProcessandoGrupoId(null);
    }
  }

  async function handleImportarJson(payload: Record<string, unknown>) {
    try {
      const resultado = await apiImportarHomebrewJson(payload as ImportarHomebrewJsonPayload);
      await Promise.all([
        carregarHomebrews(filtroNomeRef.current, { pagina: paginaAtual }),
        carregarComplementos(),
      ]);
      if (resultado.importType === 'homebrew-group') {
        showToast(
          `Grupo "${resultado.group?.nome ?? 'importado'}" importado com ${resultado.importedCount} homebrew(s).`,
          'success',
        );
      } else {
        showToast(
          `Homebrew "${resultado.item?.nome ?? 'importado'}" importado com sucesso.`,
          'success',
        );
      }
    } catch (error) {
      throw error;
    }
  }

  function abrirModalNovoGrupo() {
    setGrupoEditando(null);
    setGrupoNome('');
    setGrupoDescricao('');
    setGrupoHomebrewIds([]);
    setModalGrupoAberto(true);
  }

  function abrirModalEditarGrupo(grupo: HomebrewGrupoResumo) {
    setGrupoEditando(grupo);
    setGrupoNome(grupo.nome);
    setGrupoDescricao(grupo.descricao ?? '');
    setGrupoHomebrewIds(grupo.homebrewIds);
    setModalGrupoAberto(true);
  }

  async function handleSalvarGrupo() {
    try {
      setSalvandoGrupo(true);
      const payload = {
        nome: grupoNome.trim(),
        descricao: grupoDescricao.trim() || undefined,
        homebrewIds: [...grupoHomebrewIds].sort((a, b) => a - b),
      };

      if (grupoEditando) {
        const atualizado = await apiUpdateGrupoHomebrew(grupoEditando.id, payload);
        setGrupos((prev) => prev.map((grupo) => (grupo.id === atualizado.id ? atualizado : grupo)));
      } else {
        const criado = await apiCreateGrupoHomebrew(payload);
        setGrupos((prev) => [...prev, criado].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));
      }

      setModalGrupoAberto(false);
      setGrupoEditando(null);
      showToast('Grupo salvo com sucesso.', 'success');
    } catch (error) {
      const userError = criarErroUsuario(error);
      showToast(userError.message, 'error', { support: userError });
    } finally {
      setSalvandoGrupo(false);
    }
  }

  function handleExcluirGrupo(grupo: HomebrewGrupoResumo) {
    confirm({
      title: `Excluir grupo "${grupo.nome}"?`,
      description: 'Os homebrews continuam existindo; apenas o grupo será removido.',
      confirmLabel: 'Excluir grupo',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setProcessandoGrupoId(grupo.id);
          await apiDeleteGrupoHomebrew(grupo.id);
          setGrupos((prev) => prev.filter((item) => item.id !== grupo.id));
          if (filtroGrupoId === grupo.id) {
            setFiltroGrupoId('TODOS');
          }
          showToast('Grupo removido com sucesso.', 'success');
        } catch (error) {
          const userError = criarErroUsuario(error);
          showToast(userError.message, 'error', { support: userError });
        } finally {
          setProcessandoGrupoId(null);
        }
      },
    });
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-full bg-app-bg p-6">
        <Loading message="Carregando homebrews..." className="text-app-fg" />
      </div>
    );
  }

  if (!usuario) return null;

  return (
    <>
      <main className="min-h-full bg-app-bg px-4 py-5 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <PageHeader
            eyebrow="Criação"
            icon="sparkles"
            title="Homebrews"
            description="Conteúdo personalizado para campanhas, organizado em grupos com importação e exportação JSON."
            actions={
              <>
                <Button
                  onClick={() => router.push('/homebrews/novo')}
                  className="w-full gap-2 bg-app-secondary shadow-app-secondary/20 hover:bg-app-secondary-hover sm:w-auto"
                >
                  <Icon name="add" className="h-4 w-4" />
                  Criar Homebrew
                </Button>
                <EntityActionsMenu
                  ariaLabel="Ações de homebrews"
                  items={[
                    {
                      id: 'import',
                      label: 'Importar JSON',
                      icon: 'upload',
                      onSelect: () => setModalImportacaoAberto(true),
                    },
                    {
                      id: 'guide',
                      label: 'Ajuda JSON',
                      icon: 'info',
                      onSelect: () => setJsonGuideOpen(true),
                    },
                  ]}
                />
              </>
            }
          />

          {erro ? <ErrorAlert message={erro} /> : null}

          <StatsStrip items={statsItems} />

          <PageToolbar>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-app-muted">
                Busca
              </p>
              <div className="w-full sm:max-w-md">
                <Input
                  icon="search"
                  placeholder="Buscar por nome..."
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                />
              </div>
            </div>

            <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-3">
              <Select
                value={filtroTipo}
                onChange={(e) => {
                  const value = e.target.value;
                  if (valoresTipoFiltro.includes(value as TipoHomebrewConteudo | 'TODOS')) {
                    setFiltroTipo(value as TipoHomebrewConteudo | 'TODOS');
                  }
                }}
                className="md:w-48"
              >
                <option value="TODOS">Todos os tipos</option>
                <option value={TipoHomebrewConteudo.CLA}>Clã</option>
                <option value={TipoHomebrewConteudo.TRILHA}>Trilha</option>
                <option value={TipoHomebrewConteudo.CAMINHO}>Caminho</option>
                <option value={TipoHomebrewConteudo.ORIGEM}>Origem</option>
                <option value={TipoHomebrewConteudo.EQUIPAMENTO}>Equipamento</option>
                <option value={TipoHomebrewConteudo.PODER_GENERICO}>Poder genérico</option>
                <option value={TipoHomebrewConteudo.TECNICA_AMALDICOADA}>Técnica amaldiçoada</option>
              </Select>

              <Select
                value={filtroStatus}
                onChange={(e) => {
                  const value = e.target.value;
                  if (valoresStatusFiltro.includes(value as StatusPublicacao | 'TODOS')) {
                    setFiltroStatus(value as StatusPublicacao | 'TODOS');
                  }
                }}
                className="md:w-48"
              >
                <option value="TODOS">Todos os status</option>
                <option value={StatusPublicacao.RASCUNHO}>Rascunho</option>
                <option value={StatusPublicacao.PUBLICADO}>Publicado</option>
                <option value={StatusPublicacao.ARQUIVADO}>Arquivado</option>
              </Select>

              <Select
                value={String(filtroGrupoId)}
                onChange={(e) => {
                  const value = e.target.value;
                  setFiltroGrupoId(value === 'TODOS' ? 'TODOS' : Number(value));
                }}
                className="md:w-56"
              >
                <option value="TODOS">Todos os grupos</option>
                {grupos.map((grupo) => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.nome} ({grupo.quantidadeItens})
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Button onClick={handleBuscar} className="gap-2">
                <Icon name="search" className="h-4 w-4" />
                Buscar
              </Button>
              {filtrosAtivos.length > 0 ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLimparFiltros}
                  className="gap-2"
                >
                  <Icon name="close" className="h-4 w-4" />
                  Limpar
                </Button>
              ) : null}
            </div>

            {filtrosAtivos.length > 0 ? (
              <div className="flex w-full flex-wrap items-center gap-2 border-t border-white/5 pt-3">
                {filtrosAtivos.map((filtro) => (
                  <span
                    key={filtro}
                    className="rounded-full border border-white/10 bg-app-muted-surface px-2.5 py-1 text-xs font-bold text-app-muted"
                  >
                    {filtro}
                  </span>
                ))}
              </div>
            ) : null}
          </PageToolbar>

          <section className="space-y-3">
            <SectionHeader
              icon="folder"
              title="Grupos"
              description="Pacotes privados para exportar e reaproveitar nas fichas."
              count={grupos.length}
              action={
                <Button variant="secondary" size="sm" onClick={abrirModalNovoGrupo} className="gap-2">
                  <Icon name="add" className="h-4 w-4" />
                  Novo grupo
                </Button>
              }
            />

            {grupos.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-app-surface/35 px-4 py-6">
                <EmptyState
                  variant="plain"
                  icon="folder"
                  title="Nenhum grupo criado"
                  description="Crie grupos para organizar seus homebrews em pacotes reutilizáveis."
                  actionLabel="Criar grupo"
                  onAction={abrirModalNovoGrupo}
                />
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {grupos.map((grupo) => (
                  <div
                    key={grupo.id}
                    className="space-y-3 rounded-xl border border-white/5 bg-app-surface/45 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-app-fg">{grupo.nome}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-app-muted">
                          {grupo.descricao || 'Sem descrição.'}
                        </p>
                      </div>
                      <Badge color="blue" size="sm">
                        {grupo.quantidadeItens}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {grupo.homebrewIds.slice(0, 3).map((homebrewId) => {
                        const homebrew = todosHomebrews.find((item) => item.id === homebrewId);
                        return (
                          <span
                            key={homebrewId}
                            className="max-w-full truncate rounded-full border border-white/10 bg-app-muted-surface px-2 py-0.5 text-[11px] font-bold text-app-muted"
                          >
                            {homebrew?.nome ?? `#${homebrewId}`}
                          </span>
                        );
                      })}
                      {grupo.homebrewIds.length > 3 ? (
                        <span className="rounded-full border border-white/10 bg-app-muted-surface px-2 py-0.5 text-[11px] font-bold text-app-muted">
                          +{grupo.homebrewIds.length - 3}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2 border-t border-white/5 pt-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setFiltroGrupoId(grupo.id)}
                        className="gap-2"
                      >
                        <Icon name="filter" className="h-4 w-4" />
                        Filtrar
                      </Button>
                      <EntityActionsMenu
                        className="ml-auto"
                        ariaLabel={`Ações do grupo ${grupo.nome}`}
                        items={[
                          {
                            id: 'export',
                            label: 'Exportar JSON',
                            icon: 'download',
                            disabled: processandoGrupoId === grupo.id,
                            onSelect: () => void handleExportarGrupo(grupo),
                          },
                          {
                            id: 'edit',
                            label: 'Editar',
                            icon: 'edit',
                            disabled: processandoGrupoId === grupo.id,
                            onSelect: () => abrirModalEditarGrupo(grupo),
                          },
                          {
                            id: 'delete',
                            label: 'Excluir',
                            icon: 'delete',
                            destructive: true,
                            disabled: processandoGrupoId === grupo.id,
                            onSelect: () => handleExcluirGrupo(grupo),
                          },
                        ]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <SectionHeader
              icon="sparkles"
              title="Homebrews"
              description={
                filtroGrupoId === 'TODOS'
                  ? 'Conteúdos carregados para preview, edição e exportação.'
                  : 'Conteúdos do grupo selecionado.'
              }
              count={
                filtroGrupoId === 'TODOS'
                  ? `${homebrewsExibidos.length} de ${totalHomebrews}`
                  : `${homebrewsExibidos.length} no grupo`
              }
            />

            {homebrewsExibidos.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-app-surface/35 px-4 py-8">
                <EmptyState
                  variant="plain"
                  icon="sparkles"
                  title="Nenhum homebrew encontrado"
                  description={
                    filtroNome || filtroTipo !== 'TODOS' || filtroStatus !== 'TODOS' || filtroGrupoId !== 'TODOS'
                      ? 'Tente ajustar os filtros de busca.'
                      : 'Comece criando seu primeiro conteúdo personalizado!'
                  }
                  actionLabel={filtrosAtivos.length > 0 ? 'Limpar filtros' : 'Criar Homebrew'}
                  onAction={filtrosAtivos.length > 0 ? handleLimparFiltros : () => router.push('/homebrews/novo')}
                />
              </div>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {homebrewsExibidos.map((homebrew) => (
                    <HomebrewCard
                      key={homebrew.id}
                      homebrew={homebrew}
                      onView={() => void handleOpenPreview(homebrew)}
                      onEdit={() => router.push(`/homebrews/${homebrew.id}/editar`)}
                      onPublicar={() => void handlePublicar(homebrew)}
                      onArquivar={() => void handleArquivar(homebrew)}
                      onDelete={() => handleDeleteClick(homebrew)}
                      onExport={() => void handleExportarHomebrew(homebrew)}
                      processando={processando === homebrew.id}
                      isOwner={homebrew.usuarioId === usuario.id}
                    />
                  ))}
                </div>

                {filtroGrupoId === 'TODOS' && totalPaginas > 1 ? (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-app-surface/35 px-3 py-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={paginaAtual === 1}
                      onClick={() => setPaginaAtual((prev) => Math.max(1, prev - 1))}
                    >
                      <Icon name="chevron-left" className="h-4 w-4" />
                    </Button>
                    <span className="px-4 text-sm text-app-muted">
                      Página {paginaAtual} de {totalPaginas}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={paginaAtual === totalPaginas}
                      onClick={() => setPaginaAtual((prev) => Math.min(totalPaginas, prev + 1))}
                    >
                      <Icon name="chevron-right" className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </section>
        </div>
      </main>

      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={options?.title ?? ''}
        description={options?.description ?? ''}
        confirmLabel={options?.confirmLabel}
        cancelLabel={options?.cancelLabel}
        variant={options?.variant}
      />

      <HomebrewPreviewModal
        isOpen={previewAberto}
        onClose={handlePreviewClose}
        resumo={previewResumo}
        detalhe={previewDetalhe}
        loading={previewLoading}
        error={previewErro}
        canEdit={Boolean(previewResumo && usuario && previewResumo.usuarioId === usuario.id)}
        onOpenFull={handlePreviewOpenFull}
        onEdit={handlePreviewEdit}
      />

      <JsonImportModal
        isOpen={modalImportacaoAberto}
        onClose={() => setModalImportacaoAberto(false)}
        title="Importar homebrew via JSON"
        acceptedExportTypes={['homebrew', 'homebrew-group']}
        typeLabels={{
          homebrew: 'Homebrew',
          'homebrew-group': 'Grupo de homebrews',
        }}
        onImport={handleImportarJson}
        onOpenGuide={() => setJsonGuideOpen(true)}
      />

      <JsonGuideModal
        isOpen={jsonGuideOpen}
        onClose={() => setJsonGuideOpen(false)}
        title="Ajuda JSON de homebrews"
        loadGuide={apiGetGuiaImportacaoHomebrewJson}
      />

      <Modal
        isOpen={modalGrupoAberto}
        onClose={() => {
          if (!salvandoGrupo) setModalGrupoAberto(false);
        }}
        title={grupoEditando ? 'Editar grupo de homebrew' : 'Novo grupo de homebrew'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalGrupoAberto(false)} disabled={salvandoGrupo}>
              Cancelar
            </Button>
            <Button onClick={() => void handleSalvarGrupo()} disabled={salvandoGrupo || grupoNome.trim().length === 0}>
              {salvandoGrupo ? 'Salvando...' : 'Salvar grupo'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nome do grupo"
            value={grupoNome}
            onChange={(e) => setGrupoNome(e.target.value)}
            placeholder="Ex.: Pacote de campanha"
          />
          <Input
            label="Descrição"
            value={grupoDescricao}
            onChange={(e) => setGrupoDescricao(e.target.value)}
            placeholder="Opcional"
          />

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-app-fg">Homebrews do grupo</h3>
              <p className="text-xs text-app-muted">Selecione os conteúdos que devem entrar neste pacote.</p>
            </div>

            {todosHomebrews.length === 0 ? (
              <EmptyState
                variant="plain"
                icon="sparkles"
                title="Nenhum homebrew disponível"
                description="Crie homebrews antes de montar grupos."
              />
            ) : (
              <div className="max-h-80 space-y-2 overflow-auto rounded-lg border border-app-border p-3">
                {todosHomebrews.map((homebrew) => (
                  <label
                    key={homebrew.id}
                    className="flex cursor-pointer items-start justify-between gap-3 rounded-md border border-app-border/60 px-3 py-2 hover:border-app-primary/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-app-fg">{homebrew.nome}</p>
                      <p className="text-xs text-app-muted">
                        {homebrew.codigo} • {STATUS_LABEL[homebrew.status]}
                      </p>
                    </div>
                    <Checkbox
                      checked={grupoHomebrewIds.includes(homebrew.id)}
                      onChange={(e) =>
                        setGrupoHomebrewIds((prev) =>
                          e.target.checked ? [...prev, homebrew.id] : prev.filter((id) => id !== homebrew.id),
                        )
                      }
                      aria-label={`Selecionar ${homebrew.nome}`}
                    />
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
