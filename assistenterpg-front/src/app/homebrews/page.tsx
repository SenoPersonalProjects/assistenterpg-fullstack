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
  apiGetMeusHomebrews,
  apiListarGruposHomebrew,
  apiPublicarHomebrew,
  apiUpdateGrupoHomebrew,
  type FiltrarHomebrewsDto,
  type HomebrewDetalhado,
  type HomebrewGrupoResumo,
  type HomebrewResumo,
} from '@/lib/api/homebrews';
import { extrairMensagemErro } from '@/lib/api/error-handler';
import { StatusPublicacao, TipoHomebrewConteudo } from '@/lib/types/homebrew-enums';
import { HomebrewCard } from '@/components/homebrew/HomebrewCard';
import { HomebrewPreviewModal } from '@/components/homebrew/HomebrewPreviewModal';
import { getHomebrewTipoConfig } from '@/components/homebrew/homebrewUi';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';

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
  const [erro, setErro] = useState<string | null>(null);
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
        const mensagem = extrairMensagemErro(error);
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
      showToast(extrairMensagemErro(error), 'error');
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
      showToast(extrairMensagemErro(error), 'error');
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
          showToast(extrairMensagemErro(error), 'error');
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
      setPreviewErro(extrairMensagemErro(error));
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
      showToast(extrairMensagemErro(error), 'error');
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
      showToast(extrairMensagemErro(error), 'error');
    } finally {
      setProcessandoGrupoId(null);
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
      showToast(extrairMensagemErro(error), 'error');
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
          showToast(extrairMensagemErro(error), 'error');
        } finally {
          setProcessandoGrupoId(null);
        }
      },
    });
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-app-bg p-6">
        <Loading message="Carregando homebrews..." className="text-app-fg" />
      </div>
    );
  }

  if (!usuario) return null;

  return (
    <>
      <div className="min-h-screen bg-app-bg p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-app-primary/10">
                <Icon name="sparkles" className="h-6 w-6 text-app-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-app-fg">Meus Homebrews</h1>
                <p className="mt-0.5 text-sm text-app-muted">
                  Crie conteúdo personalizado, agrupe pacotes e exporte em JSON.
                </p>
              </div>
            </div>

            <Button onClick={() => router.push('/homebrews/novo')}>
              <Icon name="add" className="mr-2 h-4 w-4" />
              Criar Homebrew
            </Button>
          </header>

          {erro && <ErrorAlert message={erro} />}

          <section>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-app-primary/10 text-app-primary">
                  <Icon name="sparkles" className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-app-muted">Total de homebrews</p>
                  <p className="text-lg font-semibold text-app-fg">{totalHomebrews}</p>
                </div>
              </Card>
              <Card className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-app-warning/10 text-app-warning">
                  <Icon name="edit" className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-app-muted">Rascunhos (página)</p>
                  <p className="text-lg font-semibold text-app-fg">{resumoStatus.rascunhos}</p>
                </div>
              </Card>
              <Card className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-app-success/10 text-app-success">
                  <Icon name="check" className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-app-muted">Publicados (página)</p>
                  <p className="text-lg font-semibold text-app-fg">{resumoStatus.publicados}</p>
                </div>
              </Card>
              <Card className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-app-secondary/10 text-app-secondary">
                  <Icon name="archive" className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-app-muted">Arquivados (página)</p>
                  <p className="text-lg font-semibold text-app-fg">{resumoStatus.arquivados}</p>
                </div>
              </Card>
            </div>
            <p className="mt-2 text-xs text-app-muted">
              Resumo da página atual • {homebrews.length} homebrews carregados
            </p>
          </section>

          <Card>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <Input
                  icon="search"
                  placeholder="Buscar por nome..."
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                />
              </div>

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

              <Button variant="primary" onClick={handleBuscar}>
                <Icon name="search" className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {filtrosAtivos.length > 0 ? (
                filtrosAtivos.map((filtro) => (
                  <Badge key={filtro} color="gray" size="sm">
                    {filtro}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-app-muted">Nenhum filtro aplicado</span>
              )}
            </div>
            {filtrosAtivos.length > 0 ? (
              <Button variant="ghost" size="xs" onClick={handleLimparFiltros}>
                <Icon name="close" className="mr-1 h-3 w-3" />
                Limpar filtros
              </Button>
            ) : null}
          </div>

          <Card>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-app-fg">Grupos de homebrew</h2>
                  <p className="text-sm text-app-muted">
                    Organize seus homebrews em pacotes privados para exportar e reutilizar nas fichas.
                  </p>
                </div>
                <Button variant="secondary" onClick={abrirModalNovoGrupo}>
                  <Icon name="add" className="mr-2 h-4 w-4" />
                  Novo grupo
                </Button>
              </div>

              {grupos.length === 0 ? (
                <EmptyState
                  variant="plain"
                  icon="folder"
                  title="Nenhum grupo criado"
                  description="Crie grupos para organizar seus homebrews em pacotes reutilizáveis."
                  actionLabel="Criar grupo"
                  onAction={abrirModalNovoGrupo}
                />
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {grupos.map((grupo) => (
                    <Card key={grupo.id} className="space-y-3">
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

                      <div className="flex flex-wrap gap-2">
                        {grupo.homebrewIds.slice(0, 4).map((homebrewId) => {
                          const homebrew = todosHomebrews.find((item) => item.id === homebrewId);
                          return (
                            <Badge key={homebrewId} color="gray" size="sm">
                              {homebrew?.nome ?? `#${homebrewId}`}
                            </Badge>
                          );
                        })}
                        {grupo.homebrewIds.length > 4 ? (
                          <Badge color="gray" size="sm">
                            +{grupo.homebrewIds.length - 4}
                          </Badge>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setFiltroGrupoId(grupo.id)}>
                          <Icon name="filter" className="mr-1 h-4 w-4" />
                          Filtrar
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => void handleExportarGrupo(grupo)}
                          disabled={processandoGrupoId === grupo.id}
                        >
                          <Icon name="download" className="mr-1 h-4 w-4" />
                          JSON
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => abrirModalEditarGrupo(grupo)}
                          disabled={processandoGrupoId === grupo.id}
                        >
                          <Icon name="edit" className="mr-1 h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-app-danger hover:bg-app-danger/10"
                          onClick={() => handleExcluirGrupo(grupo)}
                          disabled={processandoGrupoId === grupo.id}
                        >
                          <Icon name="delete" className="mr-1 h-4 w-4" />
                          Excluir
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {homebrewsExibidos.length === 0 ? (
            <EmptyState
              variant="card"
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
          ) : (
            <>
              <p className="text-xs text-app-muted">
                {filtroGrupoId === 'TODOS'
                  ? `Mostrando ${homebrewsExibidos.length} de ${totalHomebrews} homebrews`
                  : `Mostrando ${homebrewsExibidos.length} homebrews do grupo selecionado`}
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                <div className="mt-6 flex items-center justify-center gap-2">
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
        </div>
      </div>

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
