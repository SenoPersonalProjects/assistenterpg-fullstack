'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/context/ToastContext';
import {
  apiCreateGrupoNpcAmeaca,
  apiDeleteGrupoNpcAmeaca,
  apiDeleteNpcAmeaca,
  apiExportarGrupoNpcAmeaca,
  apiExportarNpcAmeaca,
  apiGetGuiaImportacaoNpcAmeacaJson,
  apiGetMeusNpcsAmeacas,
  apiGetNpcAmeaca,
  apiImportarNpcAmeacaJson,
  apiListarGruposNpcAmeaca,
  apiUpdateGrupoNpcAmeaca,
  type ImportarNpcAmeacaJsonPayload,
  type NpcAmeacaGrupoResumo,
} from '@/lib/api/npcs-ameacas';
import type {
  NpcAmeacaDetalhe,
  NpcAmeacaResumo,
  TipoFichaNpcAmeaca,
  TipoNpcAmeaca,
  UserErrorState,
} from '@/lib/types';
import { criarErroUsuario } from '@/lib/api/error-handler';
import { JsonImportModal } from '@/components/import-export/JsonImportModal';
import { JsonGuideModal } from '@/components/import-export/JsonGuideModal';
import { NpcAmeacaCard } from '@/components/npc-ameaca/NpcAmeacaCard';
import { NpcAmeacaPreviewModal } from '@/components/npc-ameaca/NpcAmeacaPreviewModal';
import { fichaTipoOptions, tipoNpcOptions } from '@/components/npc-ameaca/npcAmeacaUi';
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

async function carregarTodosNpcsAmeacas(): Promise<NpcAmeacaResumo[]> {
  const acumulado: NpcAmeacaResumo[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const resposta = await apiGetMeusNpcsAmeacas({ page, limit: 100 });
    acumulado.push(...(resposta.items ?? []));
    totalPages = Math.max(1, resposta.totalPages || 1);
    page += 1;
  } while (page <= totalPages);

  return acumulado;
}

export default function NpcsAmeacasPage() {
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { isOpen, options, confirm, handleClose, handleConfirm } = useConfirm();

  const [lista, setLista] = useState<NpcAmeacaResumo[]>([]);
  const [todosNpcs, setTodosNpcs] = useState<NpcAmeacaResumo[]>([]);
  const [grupos, setGrupos] = useState<NpcAmeacaGrupoResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<UserErrorState | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [processandoGrupoId, setProcessandoGrupoId] = useState<number | null>(null);
  const [previewAberto, setPreviewAberto] = useState(false);
  const [previewResumo, setPreviewResumo] = useState<NpcAmeacaResumo | null>(null);
  const [previewDetalhe, setPreviewDetalhe] = useState<NpcAmeacaDetalhe | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewErro, setPreviewErro] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItens, setTotalItens] = useState(0);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoNpcAmeaca | 'TODOS'>('TODOS');
  const [filtroFicha, setFiltroFicha] = useState<TipoFichaNpcAmeaca | 'TODOS'>('TODOS');
  const [filtroGrupoId, setFiltroGrupoId] = useState<number | 'TODOS'>('TODOS');
  const filtroNomeRef = useRef(filtroNome);

  const [modalGrupoAberto, setModalGrupoAberto] = useState(false);
  const [modalImportacaoAberto, setModalImportacaoAberto] = useState(false);
  const [jsonGuideOpen, setJsonGuideOpen] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState<NpcAmeacaGrupoResumo | null>(null);
  const [grupoNome, setGrupoNome] = useState('');
  const [grupoDescricao, setGrupoDescricao] = useState('');
  const [grupoNpcIds, setGrupoNpcIds] = useState<number[]>([]);
  const [salvandoGrupo, setSalvandoGrupo] = useState(false);

  const listaExibida = useMemo(() => {
    if (filtroGrupoId === 'TODOS') return lista;
    const grupo = grupos.find((item) => item.id === filtroGrupoId);
    if (!grupo) return lista;
    const ids = new Set(grupo.npcAmeacaIds);
    return todosNpcs.filter((npc) => ids.has(npc.id));
  }, [filtroGrupoId, grupos, lista, todosNpcs]);

  const resumoTipos = useMemo(
    () =>
      lista.reduce(
        (acc, item) => {
          acc.total += 1;
          if (item.fichaTipo === 'NPC') acc.npcs += 1;
          if (item.fichaTipo === 'AMEACA') acc.ameacas += 1;
          return acc;
        },
        { total: 0, npcs: 0, ameacas: 0 },
      ),
    [lista],
  );

  const filtrosAtivos = useMemo(() => {
    const filtros: string[] = [];
    if (filtroNome.trim()) filtros.push(`Nome: ${filtroNome.trim()}`);
    if (filtroTipo !== 'TODOS') {
      const tipo = tipoNpcOptions.find((option) => option.value === filtroTipo);
      filtros.push(`Tipo: ${tipo?.label ?? filtroTipo}`);
    }
    if (filtroFicha !== 'TODOS') {
      const ficha = fichaTipoOptions.find((option) => option.value === filtroFicha);
      filtros.push(`Ficha: ${ficha?.label ?? filtroFicha}`);
    }
    if (filtroGrupoId !== 'TODOS') {
      const grupo = grupos.find((item) => item.id === filtroGrupoId);
      if (grupo) filtros.push(`Grupo: ${grupo.nome}`);
    }
    return filtros;
  }, [filtroFicha, filtroGrupoId, filtroNome, filtroTipo, grupos]);

  const statsItems: StatsStripItem[] = [
    {
      id: 'total',
      label: 'Total',
      value: totalItens,
      icon: 'curse',
      tone: 'primary',
    },
    {
      id: 'grupos',
      label: 'Grupos',
      value: grupos.length,
      icon: 'folder',
      tone: 'default',
    },
    {
      id: 'npcs',
      label: 'NPCs',
      value: resumoTipos.npcs,
      icon: 'user',
      tone: 'success',
      helper: 'nesta página',
    },
    {
      id: 'ameacas',
      label: 'Ameaças',
      value: resumoTipos.ameacas,
      icon: 'curse',
      tone: 'warning',
      helper: 'nesta página',
    },
  ];

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);

      const resposta = await apiGetMeusNpcsAmeacas({
        page,
        limit: 12,
        nome: filtroNomeRef.current || undefined,
        tipo: filtroTipo !== 'TODOS' ? filtroTipo : undefined,
        fichaTipo: filtroFicha !== 'TODOS' ? filtroFicha : undefined,
      });

      setLista(resposta.items);
      setTotalPages(resposta.totalPages);
      setTotalItens(resposta.total);
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setLoading(false);
    }
  }, [filtroFicha, filtroTipo, page]);

  const carregarComplementos = useCallback(async () => {
    try {
      const [todos, gruposCarregados] = await Promise.all([
        carregarTodosNpcsAmeacas(),
        apiListarGruposNpcAmeaca(),
      ]);
      setTodosNpcs(todos);
      setGrupos(gruposCarregados);
    } catch {
      setTodosNpcs([]);
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
      void carregar();
      void carregarComplementos();
    }
  }, [authLoading, carregar, carregarComplementos, router, usuario]);

  useEffect(() => {
    if (filtroGrupoId === 'TODOS') {
      void carregar();
    }
  }, [carregar, filtroGrupoId, page]);

  function handleDelete(item: NpcAmeacaResumo) {
    confirm({
      title: `Excluir "${item.nome}"?`,
      description: 'Esta ação é irreversível.',
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setDeletingId(item.id);
          await apiDeleteNpcAmeaca(item.id);
          setLista((prev) => prev.filter((npc) => npc.id !== item.id));
          setTodosNpcs((prev) => prev.filter((npc) => npc.id !== item.id));
          setGrupos((prev) =>
            prev.map((grupo) => ({
              ...grupo,
              npcAmeacaIds: grupo.npcAmeacaIds.filter((id) => id !== item.id),
              quantidadeItens: grupo.npcAmeacaIds.includes(item.id)
                ? Math.max(0, grupo.quantidadeItens - 1)
                : grupo.quantidadeItens,
            })),
          );
          setTotalItens((prev) => Math.max(0, prev - 1));
          if (previewResumo?.id === item.id) {
            setPreviewAberto(false);
            setPreviewResumo(null);
            setPreviewDetalhe(null);
          }
          showToast('Ficha removida com sucesso.', 'success');
        } catch (error) {
          const mensagem = criarErroUsuario(error);
          setErro(mensagem);
          showToast(mensagem, 'error');
        } finally {
          setDeletingId(null);
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
    router.push(`/npcs-ameacas/${previewResumo.id}`);
  }

  function handlePreviewEdit() {
    if (!previewResumo) return;
    handlePreviewClose();
    router.push(`/npcs-ameacas/${previewResumo.id}/editar`);
  }

  async function handleOpenPreview(item: NpcAmeacaResumo) {
    setPreviewAberto(true);
    setPreviewResumo(item);
    setPreviewDetalhe(null);
    setPreviewErro(null);
    setPreviewLoading(true);

    try {
      const detalhe = await apiGetNpcAmeaca(item.id);
      setPreviewDetalhe(detalhe);
    } catch (error) {
      setPreviewErro(criarErroUsuario(error).message);
    } finally {
      setPreviewLoading(false);
    }
  }

  function handleAplicarFiltros() {
    setPage(1);
    if (filtroGrupoId === 'TODOS') {
      void carregar();
    }
  }

  function handleLimparFiltros() {
    setFiltroNome('');
    filtroNomeRef.current = '';
    setFiltroTipo('TODOS');
    setFiltroFicha('TODOS');
    setFiltroGrupoId('TODOS');
    setPage(1);
    void carregar();
  }

  async function handleExportarNpc(item: NpcAmeacaResumo) {
    try {
      setDeletingId(item.id);
      const payload = await apiExportarNpcAmeaca(item.id);
      baixarJsonArquivo(payload, `npc-ameaca-${item.id}.json`);
      showToast(`JSON de "${item.nome}" exportado.`, 'success');
    } catch (error) {
      const userError = criarErroUsuario(error);
      showToast(userError.message, 'error', { support: userError });
    } finally {
      setDeletingId(null);
    }
  }

  async function handleExportarGrupo(grupo: NpcAmeacaGrupoResumo) {
    try {
      setProcessandoGrupoId(grupo.id);
      const payload = await apiExportarGrupoNpcAmeaca(grupo.id);
      baixarJsonArquivo(payload, `grupo-npcs-${grupo.id}.json`);
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
      const resultado = await apiImportarNpcAmeacaJson(payload as ImportarNpcAmeacaJsonPayload);
      await Promise.all([carregar(), carregarComplementos()]);

      if (resultado.importType === 'npc-ameaca-group') {
        showToast(
          `Grupo "${resultado.group?.nome ?? 'importado'}" importado com ${resultado.importedCount} ficha(s).`,
          'success',
        );
      } else {
        showToast(`Ficha "${resultado.item?.nome ?? 'importada'}" importada com sucesso.`, 'success');
      }
    } catch (error) {
      throw error;
    }
  }

  function abrirModalNovoGrupo() {
    setGrupoEditando(null);
    setGrupoNome('');
    setGrupoDescricao('');
    setGrupoNpcIds([]);
    setModalGrupoAberto(true);
  }

  function abrirModalEditarGrupo(grupo: NpcAmeacaGrupoResumo) {
    setGrupoEditando(grupo);
    setGrupoNome(grupo.nome);
    setGrupoDescricao(grupo.descricao ?? '');
    setGrupoNpcIds(grupo.npcAmeacaIds);
    setModalGrupoAberto(true);
  }

  async function handleSalvarGrupo() {
    try {
      setSalvandoGrupo(true);
      const payload = {
        nome: grupoNome.trim(),
        descricao: grupoDescricao.trim() || undefined,
        npcAmeacaIds: [...grupoNpcIds].sort((a, b) => a - b),
      };

      if (grupoEditando) {
        const atualizado = await apiUpdateGrupoNpcAmeaca(grupoEditando.id, payload);
        setGrupos((prev) => prev.map((grupo) => (grupo.id === atualizado.id ? atualizado : grupo)));
      } else {
        const criado = await apiCreateGrupoNpcAmeaca(payload);
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

  function handleExcluirGrupo(grupo: NpcAmeacaGrupoResumo) {
    confirm({
      title: `Excluir grupo "${grupo.nome}"?`,
      description: 'As fichas continuam existindo; apenas o grupo será removido.',
      confirmLabel: 'Excluir grupo',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setProcessandoGrupoId(grupo.id);
          await apiDeleteGrupoNpcAmeaca(grupo.id);
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

  if (authLoading || (loading && lista.length === 0 && totalItens === 0)) {
    return (
      <div className="min-h-full bg-app-bg p-6">
        <Loading message="Carregando fichas..." className="text-app-fg" />
      </div>
    );
  }

  if (!usuario) return null;

  const mostrarSecaoGrupos = grupos.length > 0 || totalItens > 0;

  return (
    <>
      <main className="min-h-full bg-app-bg px-4 py-5 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <PageHeader
            eyebrow="Biblioteca do mestre"
            icon="curse"
            title="NPCs e Ameaças"
            description="Prepare fichas, grupos privados e exportações para usar antes ou durante a sessão."
            actions={
              <>
                <Button
                  onClick={() => router.push('/npcs-ameacas/novo')}
                  className="w-full gap-2 sm:w-auto"
                >
                  <Icon name="add" className="h-4 w-4" />
                  Criar NPC/Ameaça
                </Button>
                <EntityActionsMenu
                  ariaLabel="Ações de NPCs e ameaças"
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
                    {
                      id: 'group',
                      label: 'Criar grupo',
                      icon: 'folder',
                      onSelect: abrirModalNovoGrupo,
                    },
                  ]}
                />
              </>
            }
          />

          {erro ? <ErrorAlert message={erro} /> : null}

          <StatsStrip items={statsItems} />

          <PageToolbar>
            <div className="grid w-full gap-3 md:grid-cols-[minmax(12rem,1fr)_11rem_12rem_13rem_auto] md:items-end">
              <Input
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                placeholder="Buscar por nome..."
                icon="search"
                onKeyDown={(e) => e.key === 'Enter' && handleAplicarFiltros()}
              />

              <Select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as TipoNpcAmeaca | 'TODOS')}
              >
                <option value="TODOS">Todos os tipos</option>
                {tipoNpcOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <Select
                value={filtroFicha}
                onChange={(e) => setFiltroFicha(e.target.value as TipoFichaNpcAmeaca | 'TODOS')}
              >
                <option value="TODOS">Aliados ou ameaças</option>
                {fichaTipoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    Somente {option.label.toLowerCase()}
                  </option>
                ))}
              </Select>

              <Select
                value={String(filtroGrupoId)}
                onChange={(e) => {
                  const value = e.target.value;
                  setFiltroGrupoId(value === 'TODOS' ? 'TODOS' : Number(value));
                }}
              >
                <option value="TODOS">Todos os grupos</option>
                {grupos.map((grupo) => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.nome} ({grupo.quantidadeItens})
                  </option>
                ))}
              </Select>

              <Button onClick={handleAplicarFiltros} className="gap-2">
                <Icon name="search" className="h-4 w-4" />
                Buscar
              </Button>
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
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={handleLimparFiltros}
                  className="gap-1"
                >
                  <Icon name="close" className="h-3 w-3" />
                  Limpar filtros
                </Button>
              </div>
            ) : null}
          </PageToolbar>

          {mostrarSecaoGrupos ? (
            <section className="space-y-4">
              <SectionHeader
                icon="folder"
                title="Grupos"
                count={grupos.length}
                description="Pacotes privados de fichas para filtrar, exportar e reaproveitar."
                action={
                  <Button variant="secondary" size="sm" onClick={abrirModalNovoGrupo} className="gap-2">
                    <Icon name="add" className="h-4 w-4" />
                    Novo grupo
                  </Button>
                }
              />

              {grupos.length === 0 ? (
                <EmptyState
                  variant="session"
                  size="sm"
                  icon="folder"
                  title="Nenhum grupo criado"
                  description="Crie grupos para preparar pacotes de fichas por missão, cena ou arco."
                  action={
                    <Button variant="secondary" size="sm" onClick={abrirModalNovoGrupo} className="gap-2">
                      <Icon name="add" className="h-4 w-4" />
                      Criar grupo
                    </Button>
                  }
                />
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {grupos.map((grupo) => {
                    const processando = processandoGrupoId === grupo.id;
                    return (
                      <div
                        key={grupo.id}
                        className="flex min-w-0 flex-col gap-3 rounded-xl border border-white/5 bg-app-surface/45 p-4 shadow-sm shadow-black/5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-black text-app-fg">
                              {grupo.nome}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-app-muted">
                              {grupo.descricao || 'Sem descrição.'}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full border border-white/10 bg-app-muted-surface px-2.5 py-1 text-xs font-black text-app-muted">
                            {grupo.quantidadeItens}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {grupo.npcAmeacaIds.slice(0, 3).map((npcId) => {
                            const npc = todosNpcs.find((item) => item.id === npcId);
                            return (
                              <span
                                key={npcId}
                                className="max-w-full truncate rounded-lg border border-white/5 bg-app-bg/45 px-2 py-1 text-xs font-semibold text-app-muted"
                              >
                                {npc?.nome ?? `#${npcId}`}
                              </span>
                            );
                          })}
                          {grupo.npcAmeacaIds.length > 3 ? (
                            <span className="rounded-lg border border-white/5 bg-app-bg/45 px-2 py-1 text-xs font-semibold text-app-muted">
                              +{grupo.npcAmeacaIds.length - 3}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setFiltroGrupoId(grupo.id);
                              setPage(1);
                            }}
                            className="gap-2"
                          >
                            <Icon name="filter" className="h-4 w-4" />
                            Filtrar
                          </Button>
                          <EntityActionsMenu
                            ariaLabel={`Ações do grupo ${grupo.nome}`}
                            items={[
                              {
                                id: 'export',
                                label: 'Exportar JSON',
                                icon: 'download',
                                onSelect: () => void handleExportarGrupo(grupo),
                                disabled: processando,
                              },
                              {
                                id: 'edit',
                                label: 'Editar',
                                icon: 'edit',
                                onSelect: () => abrirModalEditarGrupo(grupo),
                                disabled: processando,
                              },
                              {
                                id: 'delete',
                                label: 'Excluir',
                                icon: 'delete',
                                onSelect: () => handleExcluirGrupo(grupo),
                                destructive: true,
                                disabled: processando,
                              },
                            ]}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ) : null}

          <section className="space-y-4">
            <SectionHeader
              icon="curse"
              title="Fichas"
              count={
                filtroGrupoId === 'TODOS'
                  ? `${listaExibida.length} de ${totalItens}`
                  : `${listaExibida.length} no grupo`
              }
              description="NPCs e ameaças prontos para consulta, edição ou sessão."
            />

            {listaExibida.length === 0 ? (
              <EmptyState
                variant="session"
                size="sm"
                icon={filtrosAtivos.length > 0 ? 'search' : 'curse'}
                title={
                  filtrosAtivos.length > 0
                    ? 'Nenhuma ficha encontrada'
                    : 'Nenhuma ficha criada'
                }
                description={
                  filtrosAtivos.length > 0
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Crie sua primeira ficha de aliado ou ameaça para montar encontros com mais rapidez.'
                }
                action={
                  filtrosAtivos.length > 0 ? (
                    <Button variant="secondary" size="sm" onClick={handleLimparFiltros} className="gap-2">
                      <Icon name="close" className="h-4 w-4" />
                      Limpar filtros
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => router.push('/npcs-ameacas/novo')} className="gap-2">
                      <Icon name="add" className="h-4 w-4" />
                      Criar ficha
                    </Button>
                  )
                }
              />
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {listaExibida.map((item) => (
                    <NpcAmeacaCard
                      key={item.id}
                      npcAmeaca={item}
                      onView={() => void handleOpenPreview(item)}
                      onEdit={() => router.push(`/npcs-ameacas/${item.id}/editar`)}
                      onDelete={() => handleDelete(item)}
                      onExport={() => void handleExportarNpc(item)}
                      deleting={deletingId === item.id}
                    />
                  ))}
                </div>

                {filtroGrupoId === 'TODOS' && totalPages > 1 ? (
                  <div className="flex flex-col gap-3 rounded-xl border border-white/5 bg-app-surface/45 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-bold text-app-muted">
                      Página {page} de {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                      >
                        Próxima
                      </Button>
                    </div>
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

      <NpcAmeacaPreviewModal
        isOpen={previewAberto}
        onClose={handlePreviewClose}
        resumo={previewResumo}
        detalhe={previewDetalhe}
        loading={previewLoading}
        error={previewErro}
        onOpenFull={handlePreviewOpenFull}
        onEdit={handlePreviewEdit}
      />

      <JsonImportModal
        isOpen={modalImportacaoAberto}
        onClose={() => setModalImportacaoAberto(false)}
        title="Importar NPC/Ameaça via JSON"
        acceptedExportTypes={['npc-ameaca', 'npc-ameaca-group']}
        typeLabels={{
          'npc-ameaca': 'NPC/Ameaça',
          'npc-ameaca-group': 'Grupo de NPCs/Ameaças',
        }}
        onImport={handleImportarJson}
        onOpenGuide={() => setJsonGuideOpen(true)}
      />

      <JsonGuideModal
        isOpen={jsonGuideOpen}
        onClose={() => setJsonGuideOpen(false)}
        title="Ajuda JSON de NPCs e ameaças"
        loadGuide={apiGetGuiaImportacaoNpcAmeacaJson}
      />

      <Modal
        isOpen={modalGrupoAberto}
        onClose={() => {
          if (!salvandoGrupo) setModalGrupoAberto(false);
        }}
        title={grupoEditando ? 'Editar grupo de NPCs/Ameaças' : 'Novo grupo de NPCs/Ameaças'}
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
            placeholder="Ex.: Inimigos da missão"
          />
          <Input
            label="Descrição"
            value={grupoDescricao}
            onChange={(e) => setGrupoDescricao(e.target.value)}
            placeholder="Opcional"
          />

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-app-fg">Fichas do grupo</h3>
              <p className="text-xs text-app-muted">Selecione quais NPCs/Ameaças entram neste pacote.</p>
            </div>

            {todosNpcs.length === 0 ? (
              <EmptyState
                variant="plain"
                icon="curse"
                title="Nenhuma ficha disponível"
                description="Crie fichas antes de montar grupos."
              />
            ) : (
              <div className="max-h-80 space-y-2 overflow-auto rounded-lg border border-app-border p-3">
                {todosNpcs.map((npc) => (
                  <label
                    key={npc.id}
                    className="flex cursor-pointer items-start justify-between gap-3 rounded-md border border-app-border/60 px-3 py-2 hover:border-app-primary/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-app-fg">{npc.nome}</p>
                      <p className="text-xs text-app-muted">
                        {npc.fichaTipo} - {npc.tipo}
                      </p>
                    </div>
                    <Checkbox
                      checked={grupoNpcIds.includes(npc.id)}
                      onChange={(e) =>
                        setGrupoNpcIds((prev) =>
                          e.target.checked ? [...prev, npc.id] : prev.filter((id) => id !== npc.id),
                        )
                      }
                      aria-label={`Selecionar ${npc.nome}`}
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
