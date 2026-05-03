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
} from '@/lib/types';
import { extrairMensagemErro } from '@/lib/api/error-handler';
import { NpcAmeacaCard } from '@/components/npc-ameaca/NpcAmeacaCard';
import { NpcAmeacaPageHeader } from '@/components/npc-ameaca/NpcAmeacaPageHeader';
import { NpcAmeacaPreviewModal } from '@/components/npc-ameaca/NpcAmeacaPreviewModal';
import { fichaTipoOptions, tipoNpcOptions } from '@/components/npc-ameaca/npcAmeacaUi';
import { JsonImportModal } from '@/components/import-export/JsonImportModal';
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
  const [erro, setErro] = useState<string | null>(null);
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
      setErro(extrairMensagemErro(error));
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
          const mensagem = extrairMensagemErro(error);
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
      setPreviewErro(extrairMensagemErro(error));
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
      showToast(extrairMensagemErro(error), 'error');
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
      showToast(extrairMensagemErro(error), 'error');
    } finally {
      setProcessandoGrupoId(null);
    }
  }

  async function handleImportarJson(payload: Record<string, unknown>) {
    try {
      const resultado = await apiImportarNpcAmeacaJson(
        payload as ImportarNpcAmeacaJsonPayload,
      );
      await Promise.all([carregar(), carregarComplementos()]);

      if (resultado.importType === 'npc-ameaca-group') {
        showToast(
          `Grupo "${resultado.group?.nome ?? 'importado'}" importado com ${resultado.importedCount} ficha(s).`,
          'success',
        );
      } else {
        showToast(
          `Ficha "${resultado.item?.nome ?? 'importada'}" importada com sucesso.`,
          'success',
        );
      }
    } catch (error) {
      throw new Error(extrairMensagemErro(error));
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
      showToast(extrairMensagemErro(error), 'error');
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
          showToast(extrairMensagemErro(error), 'error');
        } finally {
          setProcessandoGrupoId(null);
        }
      },
    });
  }

  if (authLoading || loading) {
    return (
      <div className="npc-page-shell min-h-screen p-6">
        <Loading message="Carregando fichas..." className="text-app-fg" />
      </div>
    );
  }

  if (!usuario) return null;

  return (
    <>
      <main className="npc-page-shell min-h-screen p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <NpcAmeacaPageHeader
            title="NPC"
            description="Gerencie fichas, organize grupos privados e importe/exporte em JSON."
            badge={
              <Badge color="blue">
                {totalItens} {totalItens === 1 ? 'ficha' : 'fichas'}
              </Badge>
            }
            actions={
              <>
                <Button variant="ghost" onClick={() => router.push('/home')}>
                  <Icon name="back" className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <Button variant="secondary" onClick={() => setModalImportacaoAberto(true)}>
                  <Icon name="upload" className="mr-2 h-4 w-4" />
                  Importar JSON
                </Button>
                <Button onClick={() => router.push('/npcs-ameacas/novo')}>
                  <Icon name="add" className="mr-2 h-4 w-4" />
                  Novo NPC
                </Button>
              </>
            }
          />

          {erro && <ErrorAlert message={erro} />}

          <Card className="npc-panel space-y-4">
            <div className="grid gap-3 md:grid-cols-5">
              <Input
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                placeholder="Buscar por nome..."
                className="md:col-span-2"
                icon="search"
              />

              <Select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as TipoNpcAmeaca | 'TODOS')}>
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
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
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

              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="secondary" onClick={() => setModalImportacaoAberto(true)}>
                  <Icon name="upload" className="mr-2 h-4 w-4" />
                  Importar JSON
                </Button>
                <Button variant="ghost" onClick={abrirModalNovoGrupo}>
                  <Icon name="folder" className="mr-2 h-4 w-4" />
                  Novo grupo
                </Button>
                <Button variant="secondary" onClick={handleLimparFiltros}>
                  <Icon name="close" className="mr-2 h-4 w-4" />
                  Limpar
                </Button>
                <Button variant="secondary" onClick={handleAplicarFiltros}>
                  <Icon name="search" className="mr-2 h-4 w-4" />
                  Filtrar
                </Button>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-app-fg">Grupos de NPCs/Ameaças</h2>
                <p className="text-sm text-app-muted">
                  Monte pacotes privados de fichas para exportar e reaproveitar.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setModalImportacaoAberto(true)}>
                  <Icon name="upload" className="mr-2 h-4 w-4" />
                  Importar JSON
                </Button>
                <Button variant="secondary" onClick={abrirModalNovoGrupo}>
                  <Icon name="add" className="mr-2 h-4 w-4" />
                  Novo grupo
                </Button>
              </div>
            </div>

            {grupos.length === 0 ? (
                <EmptyState
                  variant="plain"
                icon="folder"
                title="Nenhum grupo criado"
                description="Crie grupos para organizar suas fichas em pacotes reutilizáveis."
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
                      {grupo.npcAmeacaIds.slice(0, 4).map((npcId) => {
                        const npc = todosNpcs.find((item) => item.id === npcId);
                        return (
                          <Badge key={npcId} color="gray" size="sm">
                            {npc?.nome ?? `#${npcId}`}
                          </Badge>
                        );
                      })}
                      {grupo.npcAmeacaIds.length > 4 ? (
                        <Badge color="gray" size="sm">
                          +{grupo.npcAmeacaIds.length - 4}
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
          </Card>

          {listaExibida.length === 0 ? (
            <EmptyState
              variant="card"
              icon="curse"
              title="Nenhuma ficha encontrada"
              description="Crie sua primeira ficha de aliado ou ameaça."
              actionLabel="Criar ficha"
              onAction={() => router.push('/npcs-ameacas/novo')}
            />
          ) : (
            <>
              <p className="text-xs text-app-muted">
                {filtroGrupoId === 'TODOS'
                  ? `Mostrando ${listaExibida.length} de ${totalItens} fichas`
                  : `Mostrando ${listaExibida.length} fichas do grupo selecionado`}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            </>
          )}

          {filtroGrupoId === 'TODOS' && totalPages > 1 ? (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                <Icon name="chevron-left" className="h-4 w-4" />
              </Button>
              <span className="px-3 text-sm text-app-muted">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                <Icon name="chevron-right" className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
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
                        {npc.fichaTipo} • {npc.tipo}
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
