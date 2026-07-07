'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NotePaperCard } from '@/components/anotacoes/NotePaperCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
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
import { Textarea } from '@/components/ui/Textarea';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/hooks/useConfirm';
import {
  apiAtualizarAnotacao,
  apiCriarAnotacao,
  apiExcluirAnotacao,
  apiGetMinhasCampanhas,
  apiListarAnotacoes,
  apiListarSessoesCampanha,
  criarErroUsuario,
  type AnotacaoResumo,
  type CampanhaResumo,
  type SessaoCampanhaResumo,
} from '@/lib/api';
import type { UserErrorState } from '@/lib/types';
import { formatarDataHora } from '@/lib/utils/formatters';

const LIMITE_PAGINA = 20;

export default function AnotacoesPage() {
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { isOpen, options, confirm, handleClose, handleConfirm } = useConfirm();

  const [notas, setNotas] = useState<AnotacaoResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<UserErrorState | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalNotas, setTotalNotas] = useState(0);

  const [campanhas, setCampanhas] = useState<CampanhaResumo[]>([]);
  const [sessoesFiltro, setSessoesFiltro] = useState<SessaoCampanhaResumo[]>([]);
  const [sessoesForm, setSessoesForm] = useState<SessaoCampanhaResumo[]>([]);

  const [filtroCampanhaId, setFiltroCampanhaId] = useState('');
  const [filtroSessaoId, setFiltroSessaoId] = useState('');
  const [buscaLocal, setBuscaLocal] = useState('');

  const [formTitulo, setFormTitulo] = useState('');
  const [formConteudo, setFormConteudo] = useState('');
  const [formCampanhaId, setFormCampanhaId] = useState('');
  const [formSessaoId, setFormSessaoId] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [modalFormularioAberto, setModalFormularioAberto] = useState(false);
  const [notaVisualizada, setNotaVisualizada] = useState<AnotacaoResumo | null>(null);

  const campanhaFiltroSelecionada = filtroCampanhaId
    ? Number(filtroCampanhaId)
    : null;
  const sessaoFiltroSelecionada = filtroSessaoId ? Number(filtroSessaoId) : null;
  const campanhaFormSelecionada = formCampanhaId ? Number(formCampanhaId) : null;
  const sessaoFormSelecionada = formSessaoId ? Number(formSessaoId) : null;

  const carregamentoInicial = authLoading || loading;

  const filtrosAtivos = useMemo(() => {
    const filtros: string[] = [];
    if (campanhaFiltroSelecionada) {
      const campanha = campanhas.find((item) => item.id === campanhaFiltroSelecionada);
      filtros.push(campanha ? `Campanha: ${campanha.nome}` : `Campanha ${campanhaFiltroSelecionada}`);
    }
    if (sessaoFiltroSelecionada) {
      const sessao = sessoesFiltro.find((item) => item.id === sessaoFiltroSelecionada);
      filtros.push(sessao ? `Sessão: ${sessao.titulo}` : `Sessão ${sessaoFiltroSelecionada}`);
    }
    if (buscaLocal.trim()) {
      filtros.push(`Busca: ${buscaLocal.trim()}`);
    }
    return filtros;
  }, [buscaLocal, campanhaFiltroSelecionada, campanhas, sessaoFiltroSelecionada, sessoesFiltro]);

  const notasFiltradas = useMemo(() => {
    const termo = buscaLocal.trim().toLowerCase();
    if (!termo) return notas;

    return notas.filter((nota) => {
      const campos = [
        nota.titulo,
        nota.conteudo,
        nota.campanha?.nome,
        nota.sessao?.titulo,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return campos.includes(termo);
    });
  }, [buscaLocal, notas]);

  const notaSelecionada = useMemo(() => {
    if (!notaVisualizada) return null;
    const notaAtual = notas.find((nota) => nota.id === notaVisualizada.id) ?? notaVisualizada;
    return notasFiltradas.some((nota) => nota.id === notaAtual.id) ? notaAtual : null;
  }, [notaVisualizada, notas, notasFiltradas]);

  const statsItems: StatsStripItem[] = useMemo(
    () => [
      {
        id: 'total',
        label: 'Total',
        value: totalNotas,
        icon: 'scroll',
        tone: 'primary',
      },
      {
        id: 'loaded',
        label: 'Carregadas',
        value: notas.length,
        icon: 'list',
        helper: 'nesta página',
      },
      {
        id: 'campaigns',
        label: 'Com campanha',
        value: notas.filter((nota) => Boolean(nota.campanha)).length,
        icon: 'campaign',
        tone: 'success',
      },
      {
        id: 'sessions',
        label: 'Com sessão',
        value: notas.filter((nota) => Boolean(nota.sessao)).length,
        icon: 'calendar',
      },
    ],
    [notas, totalNotas],
  );

  const carregarNotas = useCallback(
    async (
      pagina = paginaAtual,
      overrides?: { campanhaId?: number | null; sessaoId?: number | null },
    ) => {
      try {
        setLoading(true);
        setErro(null);
        const campanhaId =
          overrides?.campanhaId !== undefined
            ? overrides.campanhaId
            : campanhaFiltroSelecionada;
        const sessaoId =
          overrides?.sessaoId !== undefined
            ? overrides.sessaoId
            : sessaoFiltroSelecionada;
        const resposta = await apiListarAnotacoes({
          campanhaId: campanhaId ?? undefined,
          sessaoId: sessaoId ?? undefined,
          pagina,
          limite: LIMITE_PAGINA,
        });
        setNotas(resposta.items);
        setTotalPaginas(resposta.totalPages);
        setTotalNotas(resposta.total);
      } catch (error) {
        const mensagem = criarErroUsuario(error);
        setErro(mensagem);
        showToast(mensagem, 'error');
      } finally {
        setLoading(false);
      }
    },
    [campanhaFiltroSelecionada, paginaAtual, sessaoFiltroSelecionada, showToast],
  );

  const carregarCampanhas = useCallback(async () => {
    try {
      const resposta = await apiGetMinhasCampanhas({ page: 1, limit: 100 });
      setCampanhas(resposta.items);
    } catch (error) {
      showToast(criarErroUsuario(error), 'error');
    }
  }, [showToast]);

  const carregarSessoes = useCallback(
    async (campanhaId: number, tipo: 'filtro' | 'form') => {
      try {
        const lista = await apiListarSessoesCampanha(campanhaId);
        if (tipo === 'filtro') {
          setSessoesFiltro(lista);
        } else {
          setSessoesForm(lista);
        }
      } catch (error) {
        showToast(criarErroUsuario(error), 'error');
      }
    },
    [showToast],
  );

  useEffect(() => {
    if (!authLoading && !usuario) {
      router.push('/auth/login');
      return;
    }
    if (authLoading || !usuario) return;

    void carregarCampanhas();
    void carregarNotas(1);
  }, [authLoading, usuario, router, carregarCampanhas, carregarNotas]);

  useEffect(() => {
    if (campanhaFiltroSelecionada) {
      void carregarSessoes(campanhaFiltroSelecionada, 'filtro');
    } else {
      setSessoesFiltro([]);
      setFiltroSessaoId('');
    }
  }, [campanhaFiltroSelecionada, carregarSessoes]);

  useEffect(() => {
    if (campanhaFormSelecionada) {
      void carregarSessoes(campanhaFormSelecionada, 'form');
    } else {
      setSessoesForm([]);
      setFormSessaoId('');
    }
  }, [campanhaFormSelecionada, carregarSessoes]);

  function limparFormulario() {
    setFormTitulo('');
    setFormConteudo('');
    setFormCampanhaId('');
    setFormSessaoId('');
    setEditandoId(null);
  }

  function abrirModalCriacao() {
    limparFormulario();
    setNotaVisualizada(null);
    setModalFormularioAberto(true);
  }

  function fecharModalFormulario() {
    if (salvando) return;
    setModalFormularioAberto(false);
    limparFormulario();
  }

  async function handleSalvarNota() {
    const titulo = formTitulo.trim();
    const conteudo = formConteudo.trim();

    if (!titulo || !conteudo) {
      showToast('Preencha título e conteúdo.', 'warning');
      return;
    }

    setSalvando(true);
    try {
      if (editandoId) {
        await apiAtualizarAnotacao(editandoId, {
          titulo,
          conteudo,
          campanhaId: campanhaFormSelecionada ?? null,
          sessaoId: sessaoFormSelecionada ?? null,
        });
        showToast('Anotação atualizada.', 'success');
      } else {
        await apiCriarAnotacao({
          titulo,
          conteudo,
          campanhaId: campanhaFormSelecionada ?? null,
          sessaoId: sessaoFormSelecionada ?? null,
        });
        showToast('Anotação criada.', 'success');
      }

      setModalFormularioAberto(false);
      setNotaVisualizada(null);
      limparFormulario();
      await carregarNotas(1);
      setPaginaAtual(1);
    } catch (error) {
      showToast(criarErroUsuario(error), 'error');
    } finally {
      setSalvando(false);
    }
  }

  function handleEditar(nota: AnotacaoResumo) {
    setNotaVisualizada(null);
    setEditandoId(nota.id);
    setFormTitulo(nota.titulo);
    setFormConteudo(nota.conteudo);
    setFormCampanhaId(nota.campanha?.id ? String(nota.campanha.id) : '');
    setFormSessaoId(nota.sessao?.id ? String(nota.sessao.id) : '');
    setModalFormularioAberto(true);
  }

  function handleExcluir(nota: AnotacaoResumo) {
    confirm({
      title: `Excluir anotação "${nota.titulo}"?`,
      description: 'Esta ação é irreversível.',
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await apiExcluirAnotacao(nota.id);
          setNotas((prev) => prev.filter((item) => item.id !== nota.id));
          setTotalNotas((prev) => Math.max(0, prev - 1));
          setNotaVisualizada((atual) => (atual?.id === nota.id ? null : atual));
          showToast('Anotação removida.', 'success');
        } catch (error) {
          showToast(criarErroUsuario(error), 'error');
        }
      },
    });
  }

  function handleBuscar() {
    setPaginaAtual(1);
    setNotaVisualizada(null);
    void carregarNotas(1);
  }

  function handleLimparFiltros() {
    setFiltroCampanhaId('');
    setFiltroSessaoId('');
    setBuscaLocal('');
    setPaginaAtual(1);
    setNotaVisualizada(null);
    void carregarNotas(1, { campanhaId: null, sessaoId: null });
  }

  function handleMudarPagina(proximaPagina: number) {
    setPaginaAtual(proximaPagina);
    setNotaVisualizada(null);
    void carregarNotas(proximaPagina);
  }

  if (carregamentoInicial) {
    return <Loading message="Carregando anotações..." className="p-6 text-app-fg" />;
  }

  if (!usuario) return null;

  const temFiltrosAtivos = filtrosAtivos.length > 0;
  const listaVazia = notasFiltradas.length === 0;
  const descricaoLista = buscaLocal.trim()
    ? 'Busca local aplicada nas anotações carregadas nesta página.'
    : 'Selecione uma anotação para consultar o conteúdo sem perder a lista.';

  return (
    <>
      <main className="min-h-full bg-app-bg px-4 py-5 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <PageHeader
            backHref="/home"
            backLabel="Painel"
            eyebrow="Mesa"
            icon="scroll"
            title="Anotações"
            description="Registre pistas, decisões e lembretes de campanha para consultar rápido durante a sessão."
            actions={
              <>
                <Button onClick={abrirModalCriacao}>
                  <Icon name="add" className="mr-2 h-4 w-4" />
                  Nova anotação
                </Button>
                <EntityActionsMenu
                  ariaLabel="Ações de anotações"
                  items={[
                    {
                      id: 'refresh',
                      label: 'Atualizar',
                      icon: 'refresh',
                      onSelect: () => void carregarNotas(paginaAtual),
                    },
                  ]}
                />
              </>
            }
          />

          {erro ? <ErrorAlert message={erro} /> : null}

          <StatsStrip items={statsItems} />

          <PageToolbar>
            <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-[minmax(13rem,1fr)_minmax(11rem,0.7fr)_minmax(11rem,0.7fr)]">
              <Input
                label="Busca local"
                placeholder="Título, conteúdo, campanha ou sessão"
                icon="search"
                value={buscaLocal}
                onChange={(event) => setBuscaLocal(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleBuscar();
                }}
              />

              <Select
                label="Campanha"
                value={filtroCampanhaId}
                onChange={(event) => setFiltroCampanhaId(event.target.value)}
              >
                <option value="">Todas</option>
                {campanhas.map((campanha) => (
                  <option key={campanha.id} value={campanha.id}>
                    {campanha.nome}
                  </option>
                ))}
              </Select>

              <Select
                label="Sessão"
                value={filtroSessaoId}
                onChange={(event) => setFiltroSessaoId(event.target.value)}
                disabled={!campanhaFiltroSelecionada}
              >
                <option value="">Todas</option>
                {sessoesFiltro.map((sessao) => (
                  <option key={sessao.id} value={sessao.id}>
                    {sessao.titulo}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex shrink-0 flex-wrap items-end gap-2">
              <Button size="sm" variant="secondary" onClick={handleBuscar}>
                <Icon name="search" className="mr-2 h-4 w-4" />
                Buscar
              </Button>
              {temFiltrosAtivos ? (
                <Button size="sm" variant="ghost" onClick={handleLimparFiltros}>
                  Limpar
                </Button>
              ) : null}
            </div>

            {temFiltrosAtivos ? (
              <div className="flex basis-full flex-wrap gap-2 border-t border-white/5 pt-3">
                {filtrosAtivos.map((filtro) => (
                  <Badge key={filtro} size="xs" color="purple" variant="subtle">
                    {filtro}
                  </Badge>
                ))}
              </div>
            ) : null}
          </PageToolbar>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)]">
            <section className="min-w-0 space-y-4">
              <SectionHeader
                icon="list"
                title="Notas"
                count={buscaLocal.trim() ? `${notasFiltradas.length}/${notas.length}` : totalNotas}
                description={descricaoLista}
                action={
                  loading ? (
                    <span className="text-xs font-black uppercase tracking-[0.16em] text-app-muted">
                      Atualizando...
                    </span>
                  ) : null
                }
              />

              {listaVazia ? (
                <EmptyState
                  variant="card"
                  size="sm"
                  icon={temFiltrosAtivos ? 'search' : 'scroll'}
                  title={temFiltrosAtivos ? 'Nenhuma anotação encontrada' : 'Nenhuma anotação criada'}
                  description={
                    temFiltrosAtivos
                      ? 'Ajuste a busca ou limpe os filtros para voltar à lista carregada.'
                      : 'Crie a primeira anotação para registrar pistas, decisões e ideias de sessão.'
                  }
                  action={
                    temFiltrosAtivos ? (
                      <Button size="sm" variant="secondary" onClick={handleLimparFiltros}>
                        Limpar filtros
                      </Button>
                    ) : (
                      <Button size="sm" onClick={abrirModalCriacao}>
                        Nova anotação
                      </Button>
                    )
                  }
                />
              ) : (
                <div className="space-y-3">
                  {notasFiltradas.map((nota) => (
                    <NotePaperCard
                      key={nota.id}
                      nota={nota}
                      onOpen={setNotaVisualizada}
                      onEdit={handleEditar}
                      onDelete={handleExcluir}
                    />
                  ))}
                </div>
              )}

              {totalPaginas > 1 ? (
                <div className="flex items-center justify-center gap-4 rounded-xl border border-white/5 bg-app-surface/45 p-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={paginaAtual === 1}
                    onClick={() => handleMudarPagina(Math.max(1, paginaAtual - 1))}
                    className="h-9 w-9 !p-0"
                  >
                    <Icon name="chevron-left" className="h-4 w-4" />
                  </Button>
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-app-muted">
                    Página {paginaAtual} / {totalPaginas}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={paginaAtual === totalPaginas}
                    onClick={() => handleMudarPagina(Math.min(totalPaginas, paginaAtual + 1))}
                    className="h-9 w-9 !p-0"
                  >
                    <Icon name="chevron-right" className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
            </section>

            <aside className="min-w-0 xl:sticky xl:top-20 xl:self-start">
              {notaSelecionada ? (
                <article className="overflow-hidden rounded-xl border border-white/5 bg-app-surface/55 shadow-sm shadow-black/5">
                  <div className="border-b border-white/5 p-4">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-app-primary">
                          Leitura
                        </p>
                        <h2 className="mt-1 truncate text-xl font-black text-app-fg">
                          {notaSelecionada.titulo}
                        </h2>
                      </div>
                      <EntityActionsMenu
                        ariaLabel={`Ações da anotação ${notaSelecionada.titulo}`}
                        items={[
                          {
                            id: 'edit',
                            label: 'Editar',
                            icon: 'edit',
                            onSelect: () => handleEditar(notaSelecionada),
                          },
                          {
                            id: 'delete',
                            label: 'Excluir',
                            icon: 'delete',
                            destructive: true,
                            onSelect: () => handleExcluir(notaSelecionada),
                          },
                        ]}
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Badge size="xs" color="gray" variant="subtle">
                        Criada em {formatarDataHora(notaSelecionada.criadoEm)}
                      </Badge>
                      {notaSelecionada.atualizadoEm !== notaSelecionada.criadoEm ? (
                        <Badge size="xs" color="blue" variant="subtle">
                          Atualizada em {formatarDataHora(notaSelecionada.atualizadoEm)}
                        </Badge>
                      ) : null}
                      {notaSelecionada.campanha ? (
                        <Badge size="xs" color="gray" variant="subtle">
                          Campanha: {notaSelecionada.campanha.nome}
                        </Badge>
                      ) : null}
                      {notaSelecionada.sessao ? (
                        <Badge size="xs" color="blue" variant="subtle">
                          Sessão: {notaSelecionada.sessao.titulo}
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  <div className="max-h-[34rem] overflow-y-auto p-4">
                    <div className="whitespace-pre-line text-sm leading-relaxed text-app-fg">
                      {notaSelecionada.conteudo}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-white/5 p-4">
                    <Button size="sm" variant="secondary" onClick={() => handleEditar(notaSelecionada)}>
                      <Icon name="edit" className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setNotaVisualizada(null)}>
                      Fechar leitura
                    </Button>
                  </div>
                </article>
              ) : (
                <EmptyState
                  variant="card"
                  size="sm"
                  icon="eye"
                  title="Selecione uma anotação"
                  description="O conteúdo aparece aqui para consulta rápida enquanto a lista permanece visível."
                />
              )}
            </aside>
          </div>
        </div>
      </main>

      <Modal
        isOpen={modalFormularioAberto}
        onClose={fecharModalFormulario}
        title={editandoId ? 'Editar anotação' : 'Criar anotação'}
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={fecharModalFormulario} disabled={salvando}>
              Cancelar
            </Button>
            <Button onClick={handleSalvarNota} disabled={salvando}>
              {salvando ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Criar anotação'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Título"
              value={formTitulo}
              onChange={(event) => setFormTitulo(event.target.value)}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <Select
                label="Campanha (opcional)"
                value={formCampanhaId}
                onChange={(event) => setFormCampanhaId(event.target.value)}
              >
                <option value="">Nenhuma</option>
                {campanhas.map((campanha) => (
                  <option key={campanha.id} value={campanha.id}>
                    {campanha.nome}
                  </option>
                ))}
              </Select>
              <Select
                label="Sessão (opcional)"
                value={formSessaoId}
                onChange={(event) => setFormSessaoId(event.target.value)}
                disabled={!campanhaFormSelecionada}
              >
                <option value="">Nenhuma</option>
                {sessoesForm.map((sessao) => (
                  <option key={sessao.id} value={sessao.id}>
                    {sessao.titulo}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <Textarea
            label="Conteúdo"
            value={formConteudo}
            onChange={(event) => setFormConteudo(event.target.value)}
            rows={8}
          />
        </div>
      </Modal>

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
    </>
  );
}
