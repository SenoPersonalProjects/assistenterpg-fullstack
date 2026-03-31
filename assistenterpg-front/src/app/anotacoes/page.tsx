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
    setEditandoId(nota.id);
    setFormTitulo(nota.titulo);
    setFormConteudo(nota.conteudo);
    setFormCampanhaId(nota.campanha?.id ? String(nota.campanha.id) : '');
    setFormSessaoId(nota.sessao?.id ? String(nota.sessao.id) : '');
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
      <main className="min-h-screen bg-app-bg p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-app-primary/10">
                <Icon name="scroll" className="w-6 h-6 text-app-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-app-fg">Minhas anotacoes</h1>
                <p className="text-sm text-app-muted mt-0.5">
                  Registre ideas, planos e lembretes de campanha.
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/home')}>
              <Icon name="back" className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </header>

          {erro ? <ErrorAlert message={erro} /> : null}

          <Card className="space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="filter" className="h-4 w-4 text-app-muted" />
              <p className="text-sm font-semibold text-app-fg">Filtros</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Select
                label="Campanha"
                value={filtroCampanhaId}
                onChange={(event) => setFiltroCampanhaId(event.target.value)}
              >
                <option value="">Todas as campanhas</option>
                {campanhas.map((campanha) => (
                  <option key={campanha.id} value={campanha.id}>
                    {campanha.nome}
                  </option>
                ))}
              </Select>
              <Select
                label="Sessao"
                value={filtroSessaoId}
                onChange={(event) => setFiltroSessaoId(event.target.value)}
                disabled={!campanhaFiltroSelecionada}
              >
                <option value="">Todas as sessoes</option>
                {sessoesFiltro.map((sessao) => (
                  <option key={sessao.id} value={sessao.id}>
                    {sessao.titulo}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={handleBuscar}>
                Buscar
              </Button>
              <Button size="sm" variant="ghost" onClick={handleLimparFiltros}>
                Limpar filtros
              </Button>
              {filtrosAtivos.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {filtrosAtivos.map((filtro) => (
                    <Badge key={filtro} size="sm" color="gray">
                      {filtro}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="edit" className="h-4 w-4 text-app-muted" />
              <p className="text-sm font-semibold text-app-fg">
                {editandoId ? 'Editar anotacao' : 'Nova anotacao'}
              </p>
            </div>
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
              rows={5}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={handleSalvarNota} disabled={salvando}>
                {salvando ? 'Salvando...' : editandoId ? 'Salvar alteracoes' : 'Criar anotacao'}
              </Button>
              {editandoId ? (
                <Button variant="ghost" onClick={limparFormulario}>
                  Cancelar edicao
                </Button>
              ) : null}
            </div>
          </Card>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-app-muted">
                {totalNotas} anotacao{totalNotas === 1 ? '' : 'es'} encontrada
              </p>
            </div>

            {notas.length === 0 ? (
              <EmptyState
                variant="card"
                icon="scroll"
                title="Nenhuma anotacao encontrada"
                description="Crie uma anotacao para comecar."
              />
            ) : (
              <div className="space-y-3">
                {notas.map((nota) => (
                  <Card key={nota.id} className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-app-fg">{nota.titulo}</p>
                        <p className="text-xs text-app-muted">
                          {formatarDataHora(nota.criadoEm)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="xs" variant="ghost" onClick={() => handleEditar(nota)}>
                          Editar
                        </Button>
                        <Button
                          size="xs"
                          variant="destructive"
                          onClick={() => handleExcluir(nota)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {nota.campanha ? (
                        <Badge size="sm" color="gray">
                          Campanha: {nota.campanha.nome}
                        </Badge>
                      ) : null}
                      {nota.sessao ? (
                        <Badge size="sm" color="blue">
                          Sessao: {nota.sessao.titulo}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-app-muted whitespace-pre-line">
                      {nota.conteudo}
                    </p>
                  </Card>
                ))}
              </div>
            )}

            {totalPaginas > 1 ? (
              <div className="flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={paginaAtual === 1}
                  onClick={() => {
                    const next = Math.max(1, paginaAtual - 1);
                    setPaginaAtual(next);
                    void carregarNotas(next);
                  }}
                >
                  <Icon name="chevron-left" className="w-4 h-4" />
                </Button>
                <span className="text-sm text-app-muted">
                  Pagina {paginaAtual} de {totalPaginas}
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
                >
                  <Icon name="chevron-right" className="w-4 h-4" />
                </Button>
              </div>
            ) : null}
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
    </>
  );
}
