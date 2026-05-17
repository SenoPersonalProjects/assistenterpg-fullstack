'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  extrairMensagemErro,
  type CampanhaResumo,
  type SessaoCampanhaResumo,
  type AnotacaoResumo,
} from '@/lib/api';
import { formatarDataHora } from '@/lib/utils/formatters';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Icon } from '@/components/ui/Icon';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { NotePaperCard } from '@/components/anotacoes/NotePaperCard';

const LIMITE_PAGINA = 20;

export default function AnotacoesPage() {
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { isOpen, options, confirm, handleClose, handleConfirm } = useConfirm();

  const [notas, setNotas] = useState<AnotacaoResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalNotas, setTotalNotas] = useState(0);

  const [campanhas, setCampanhas] = useState<CampanhaResumo[]>([]);
  const [sessoesFiltro, setSessoesFiltro] = useState<SessaoCampanhaResumo[]>([]);
  const [sessoesForm, setSessoesForm] = useState<SessaoCampanhaResumo[]>([]);

  const [filtroCampanhaId, setFiltroCampanhaId] = useState('');
  const [filtroSessaoId, setFiltroSessaoId] = useState('');

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
      const camp = campanhas.find((c) => c.id === campanhaFiltroSelecionada);
      filtros.push(camp ? `Campanha: ${camp.nome}` : `Campanha ${campanhaFiltroSelecionada}`);
    }
    if (sessaoFiltroSelecionada) {
      const sessao = sessoesFiltro.find((s) => s.id === sessaoFiltroSelecionada);
      filtros.push(sessao ? `Sessao: ${sessao.titulo}` : `Sessao ${sessaoFiltroSelecionada}`);
    }
    return filtros;
  }, [campanhaFiltroSelecionada, sessaoFiltroSelecionada, campanhas, sessoesFiltro]);

  const carregarNotas = useCallback(async (
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
      const mensagem = extrairMensagemErro(error);
      setErro(mensagem);
      showToast(mensagem, 'error');
    } finally {
      setLoading(false);
    }
  }, [campanhaFiltroSelecionada, paginaAtual, sessaoFiltroSelecionada, showToast]);

  const carregarCampanhas = useCallback(async () => {
    try {
      const resposta = await apiGetMinhasCampanhas({ page: 1, limit: 100 });
      setCampanhas(resposta.items);
    } catch (error) {
      showToast(extrairMensagemErro(error), 'error');
    }
  }, [showToast]);

  const carregarSessoes = useCallback(async (
    campanhaId: number,
    tipo: 'filtro' | 'form',
  ) => {
    try {
      const lista = await apiListarSessoesCampanha(campanhaId);
      if (tipo === 'filtro') {
        setSessoesFiltro(lista);
      } else {
        setSessoesForm(lista);
      }
    } catch (error) {
      showToast(extrairMensagemErro(error), 'error');
    }
  }, [showToast]);

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
      showToast('Preencha titulo e conteudo.', 'warning');
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
        showToast('Anotacao atualizada.', 'success');
      } else {
        await apiCriarAnotacao({
          titulo,
          conteudo,
          campanhaId: campanhaFormSelecionada ?? null,
          sessaoId: sessaoFormSelecionada ?? null,
        });
        showToast('Anotacao criada.', 'success');
      }

      setModalFormularioAberto(false);
      setNotaVisualizada(null);
      limparFormulario();
      await carregarNotas(1);
      setPaginaAtual(1);
    } catch (error) {
      showToast(extrairMensagemErro(error), 'error');
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
      title: `Excluir anotacao "${nota.titulo}"?`,
      description: 'Esta acao e irreversivel.',
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await apiExcluirAnotacao(nota.id);
          setNotas((prev) => prev.filter((item) => item.id !== nota.id));
          setTotalNotas((prev) => Math.max(0, prev - 1));
          setNotaVisualizada((atual) => (atual?.id === nota.id ? null : atual));
          showToast('Anotacao removida.', 'success');
        } catch (error) {
          showToast(extrairMensagemErro(error), 'error');
        }
      },
    });
  }

  function handleBuscar() {
    setPaginaAtual(1);
    void carregarNotas(1);
  }

  function handleLimparFiltros() {
    setFiltroCampanhaId('');
    setFiltroSessaoId('');
    setPaginaAtual(1);
    void carregarNotas(1, { campanhaId: null, sessaoId: null });
  }

  if (carregamentoInicial) {
    return <Loading message="Carregando anotacoes..." className="p-6 text-app-fg" />;
  }

  if (!usuario) return null;

  return (
    <>
      <main className="min-h-[calc(100vh-4rem)] bg-app-bg p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-app-orange/10 shadow-inner">
                <Icon name="scroll" className="w-8 h-8 text-app-orange" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-app-fg tracking-tight">Grimório de Notas</h1>
                <p className="text-app-muted font-medium mt-0.5">
                  Não deixe o conhecimento se perder no vazio.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button onClick={abrirModalCriacao} className="font-black shadow-lg shadow-app-primary/20">
                <Icon name="add" className="mr-2 h-4 w-4" />
                Manifestar Ideia
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push('/home')} className="font-bold">
                <Icon name="back" className="mr-2 h-4 w-4" />
                Painel
              </Button>
            </div>
          </header>

          {erro ? <ErrorAlert message={erro} /> : null}

          <Card variant="glass" className="!p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-app-primary/10 rounded-xl">
                <Icon name="filter" className="h-5 w-5 text-app-primary" />
              </div>
              <h2 className="text-xl font-black text-app-fg">Sintonizar Pensamentos</h2>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-end">
              <Select
                label="Qual a Campanha?"
                value={filtroCampanhaId}
                onChange={(event) => setFiltroCampanhaId(event.target.value)}
              >
                <option value="">Todas as realidades</option>
                {campanhas.map((campanha) => (
                  <option key={campanha.id} value={campanha.id}>
                    {campanha.nome}
                  </option>
                ))}
              </Select>
              
              <Select
                label="Qual a Sessão?"
                value={filtroSessaoId}
                onChange={(event) => setFiltroSessaoId(event.target.value)}
                disabled={!campanhaFiltroSelecionada}
              >
                <option value="">Todos os momentos</option>
                {sessoesFiltro.map((sessao) => (
                  <option key={sessao.id} value={sessao.id}>
                    {sessao.titulo}
                  </option>
                ))}
              </Select>

              <div className="flex gap-2">
                <Button size="md" onClick={handleBuscar} className="flex-1 font-bold">
                  Sintonizar
                </Button>
                {filtrosAtivos.length > 0 && (
                  <Button size="md" variant="ghost" onClick={handleLimparFiltros} className="font-bold">
                    Resetar
                  </Button>
                )}
              </div>
            </div>

            {filtrosAtivos.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-app-border/30">
                {filtrosAtivos.map((filtro) => (
                  <Badge key={filtro} size="sm" color="purple" variant="subtle" className="font-bold">
                    {filtro}
                  </Badge>
                ))}
              </div>
            )}
          </Card>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <SectionTitle icon="scroll">
                Fragmentos de Memória
                <Badge color="gray" size="sm" variant="subtle" className="ml-3">
                  {totalNotas}
                </Badge>
              </SectionTitle>

              {loading && (
                <div className="text-xs font-black text-app-muted animate-pulse uppercase tracking-widest">
                  Canalizando...
                </div>
              )}
            </div>

            {notas.length === 0 ? (
              <EmptyState
                variant="card"
                icon="scroll"
                title="O mural está em silêncio"
                description="Mermão, nenhuma nota por aqui. Que tal registrar aquele plano mirabolante que você acabou de ter?"
                actionLabel="Começar Grimório"
                onAction={abrirModalCriacao}
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {notas.map((nota) => (
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
              <Card variant="flat" className="flex items-center justify-center gap-6 py-4">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={paginaAtual === 1}
                  onClick={() => {
                    const next = Math.max(1, paginaAtual - 1);
                    setPaginaAtual(next);
                    void carregarNotas(next);
                  }}
                  className="rounded-full w-10 h-10 !p-0"
                >
                  <Icon name="chevron-left" className="h-5 w-5" />
                </Button>
                <span className="text-sm font-black text-app-fg uppercase tracking-widest">
                  Plano {paginaAtual} / {totalPaginas}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={paginaAtual === totalPaginas}
                  onClick={() => {
                    const next = Math.min(totalPaginas, paginaAtual + 1);
                    setPaginaAtual(next);
                    void carregarNotas(next);
                  }}
                  className="rounded-full w-10 h-10 !p-0"
                >
                  <Icon name="chevron-right" className="h-5 w-5" />
                </Button>
              </Card>
            ) : null}
          </section>
        </div>
      </main>

      <Modal
        isOpen={modalFormularioAberto}
        onClose={fecharModalFormulario}
        title={editandoId ? 'Editar anotacao' : 'Criar anotacao'}
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={fecharModalFormulario} disabled={salvando}>
              Cancelar
            </Button>
            <Button onClick={handleSalvarNota} disabled={salvando}>
              {salvando ? 'Salvando...' : editandoId ? 'Salvar alteracoes' : 'Criar anotacao'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Titulo"
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
                label="Sessao (opcional)"
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
            label="Conteudo"
            value={formConteudo}
            onChange={(event) => setFormConteudo(event.target.value)}
            rows={8}
          />
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(notaVisualizada)}
        onClose={() => setNotaVisualizada(null)}
        title={notaVisualizada?.titulo ?? 'Anotacao'}
        size="lg"
        footer={
          notaVisualizada ? (
            <>
              <Button variant="ghost" onClick={() => setNotaVisualizada(null)}>
                Fechar
              </Button>
              <Button variant="secondary" onClick={() => handleEditar(notaVisualizada)}>
                <Icon name="edit" className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button variant="destructive" onClick={() => handleExcluir(notaVisualizada)}>
                <Icon name="delete" className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </>
          ) : null
        }
      >
        {notaVisualizada ? (
          <article className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge size="sm" color="gray">
                Criada em {formatarDataHora(notaVisualizada.criadoEm)}
              </Badge>
              {notaVisualizada.atualizadoEm !== notaVisualizada.criadoEm ? (
                <Badge size="sm" color="blue">
                  Atualizada em {formatarDataHora(notaVisualizada.atualizadoEm)}
                </Badge>
              ) : null}
              {notaVisualizada.campanha ? (
                <Badge size="sm" color="gray">
                  Campanha: {notaVisualizada.campanha.nome}
                </Badge>
              ) : null}
              {notaVisualizada.sessao ? (
                <Badge size="sm" color="blue">
                  Sessao: {notaVisualizada.sessao.titulo}
                </Badge>
              ) : null}
            </div>
            <div className="rounded-xl border border-app-border bg-app-card p-4 text-sm leading-relaxed text-app-fg whitespace-pre-line">
              {notaVisualizada.conteudo}
            </div>
          </article>
        ) : null}
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
