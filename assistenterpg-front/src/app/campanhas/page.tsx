// app/campanhas/page.tsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  apiGetMinhasCampanhas,
  apiCreateCampanha,
  apiGetCampanhaById,
  apiDeleteCampanha,
  CampanhaResumo,
} from '@/lib/api';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { CampaignForm } from '@/components/campanha/CampaignForm';
import { CampaignCard } from '@/components/campanha/CampaignCard';
import {
  CampaignPreviewModal,
  type CampanhaPreviewDetalhe,
} from '@/components/campanha/CampaignPreviewModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { extrairMensagemErro } from '@/lib/api/error-handler';
import { resolverListaPaginada } from '@/lib/utils/lista-paginada';

export default function CampanhasPage() {
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { isOpen, options, confirm, handleClose, handleConfirm } = useConfirm();

  const [campanhas, setCampanhas] = useState<CampanhaResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalCampanhas, setTotalCampanhas] = useState(0);
  const [previewAberto, setPreviewAberto] = useState(false);
  const [previewResumo, setPreviewResumo] = useState<CampanhaResumo | null>(null);
  const [previewDetalhe, setPreviewDetalhe] = useState<CampanhaPreviewDetalhe | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewErro, setPreviewErro] = useState<string | null>(null);
  const [filtroNome, setFiltroNome] = useState('');

  const filtroAtivo = filtroNome.trim().length > 0;

  const campanhasFiltradas = useMemo(() => {
    if (!filtroAtivo) return campanhas;
    const termo = filtroNome.trim().toLowerCase();
    return campanhas.filter((campanha) =>
      campanha.nome.toLowerCase().includes(termo),
    );
  }, [campanhas, filtroAtivo, filtroNome]);

  const resumoStatus = useMemo(
    () =>
      campanhas.reduce(
        (acc, campanha) => {
          acc.total += 1;
          if (campanha.status === 'ATIVA') acc.ativas += 1;
          else if (campanha.status === 'PAUSADA') acc.pausadas += 1;
          else acc.encerradas += 1;
          return acc;
        },
        { total: 0, ativas: 0, pausadas: 0, encerradas: 0 },
      ),
    [campanhas],
  );

  const carregarDados = useCallback(async (paginaAtual: number) => {
    try {
      setLoading(true);
      const dados = await apiGetMinhasCampanhas({ page: paginaAtual, limit: 12 });
      const listaResolvida = resolverListaPaginada(paginaAtual, {
        items: dados.items,
        total: dados.total,
        totalPages: dados.totalPages,
      });

      if (listaResolvida.acao === 'ajustar-pagina') {
        setPagina(listaResolvida.pagina);
        return;
      }

      setCampanhas(listaResolvida.items);
      setTotalCampanhas(listaResolvida.total);
      setTotalPaginas(listaResolvida.totalPaginas);
      setErro(null);
    } catch (error) {
      const mensagem = extrairMensagemErro(error);
      setErro(mensagem);
      showToast(mensagem, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!authLoading && !usuario) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && usuario) {
      void carregarDados(pagina);
    }
  }, [authLoading, usuario, router, carregarDados, pagina]);

  async function handleCreate(data: { nome: string; descricao?: string }) {
    await apiCreateCampanha(data);
    showToast('Campanha criada com sucesso.', 'success');

    if (pagina !== 1) {
      setPagina(1);
      return;
    }

    await carregarDados(1);
  }

  function handleDeleteClick(campanha: CampanhaResumo) {
    confirm({
      title: `Tem certeza que deseja excluir a campanha "${campanha.nome}"?`,
      description: 'Esta ação é irreversível!',
      confirmLabel: 'Sim, excluir',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await apiDeleteCampanha(campanha.id);
          if (previewResumo?.id === campanha.id) {
            setPreviewAberto(false);
            setPreviewResumo(null);
            setPreviewDetalhe(null);
          }
          await carregarDados(pagina);
          showToast('Campanha excluída com sucesso.', 'success');
        } catch (error) {
          const mensagem = extrairMensagemErro(error);
          setErro(mensagem);
          showToast(mensagem, 'error');
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
    router.push(`/campanhas/${previewResumo.id}`);
  }

  async function handleOpenPreview(campanha: CampanhaResumo) {
    setPreviewAberto(true);
    setPreviewResumo(campanha);
    setPreviewDetalhe(null);
    setPreviewErro(null);
    setPreviewLoading(true);

    try {
      const detalhe = await apiGetCampanhaById<CampanhaPreviewDetalhe>(campanha.id);
      setPreviewDetalhe(detalhe);
    } catch (error) {
      setPreviewErro(extrairMensagemErro(error));
    } finally {
      setPreviewLoading(false);
    }
  }

  if (authLoading || (loading && campanhas.length === 0 && totalCampanhas === 0)) {
    return <Loading message="Carregando campanhas..." className="p-6 text-app-fg" />;
  }

  if (!usuario) return null;

  return (
    <>
      <main className="min-h-[calc(100vh-4rem)] bg-app-bg p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-app-primary/10 shadow-inner">
                <Icon name="campaign" className="w-8 h-8 text-app-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-app-fg tracking-tight">Campanhas</h1>
                <p className="text-app-muted font-medium mt-0.5">
                  Organize suas campanhas.
                </p>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={() => router.push('/home')} className="font-bold">
              <Icon name="back" className="w-4 h-4 mr-2" />
              Painel Inicial
            </Button>
          </header>

          {erro && <ErrorAlert message={erro} />}

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total', value: totalCampanhas, icon: 'campaign', color: 'blue' },
              { label: 'Ativas', value: resumoStatus.ativas, icon: 'check', color: 'green' },
              { label: 'Pausadas', value: resumoStatus.pausadas, icon: 'pause', color: 'yellow' },
              { label: 'Encerradas', value: resumoStatus.encerradas, icon: 'fail', color: 'red' },
            ].map((stat) => (
              <Card key={stat.label} variant="glass" className="!p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-app-${stat.color}/10 text-app-${stat.color}`}>
                    <Icon name={stat.icon as any} className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-app-muted leading-none mb-1">{stat.label}</p>
                    <p className="text-xl font-black text-app-fg leading-none">{stat.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna da Esquerda: Criação e Filtros */}
            <div className="lg:col-span-1 space-y-6">
              <Card variant="default" className="!p-6 shadow-xl shadow-black/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-app-primary/10 rounded-xl">
                    <Icon name="add" className="w-5 h-5 text-app-primary" />
                  </div>
                  <h2 className="text-xl font-black text-app-fg">Nova Jornada</h2>
                </div>
                <CampaignForm onSubmit={handleCreate} />
              </Card>

              <Card variant="glass" className="!p-6">
                <h3 className="text-sm font-bold text-app-fg uppercase tracking-widest mb-4">Filtrar Pensamentos</h3>
                <div className="space-y-4">
                  <Input
                    icon="search"
                    placeholder="Nome da campanha..."
                    value={filtroNome}
                    onChange={(e) => setFiltroNome(e.target.value)}
                  />
                  {filtroAtivo && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setFiltroNome('')}
                      className="w-full"
                    >
                      <Icon name="close" className="w-4 h-4 mr-2" />
                      Limpar Filtro
                    </Button>
                  )}
                </div>
              </Card>
            </div>

            {/* Coluna da Direita: Lista de Campanhas */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <SectionTitle icon="campaign">
                  Mundo em Expansão
                  <Badge color="gray" size="sm" variant="subtle" className="ml-3">
                    {filtroAtivo ? campanhasFiltradas.length : totalCampanhas}
                  </Badge>
                </SectionTitle>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void carregarDados(pagina)}
                  disabled={loading}
                  className="font-bold"
                >
                  <Icon name="refresh" className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Sincronizando...' : 'Atualizar'}
                </Button>
              </div>

              {totalCampanhas === 0 ? (
                <EmptyState
                  variant="card"
                  lottie="EMPTY_BOX"
                  title="O vazio te espera"
                  description="Você ainda não tem nenhuma campanha. Por que não cria uma?"
                />
              ) : campanhasFiltradas.length === 0 ? (
                <EmptyState
                  variant="card"
                  lottie="GHOST_SEARCH"
                  title="Nada encontrado"
                  description="Tente ajustar sua busca. Não encontramos nada com esse nome."
                  actionLabel="Limpar filtro"
                  onAction={() => setFiltroNome('')}
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {campanhasFiltradas.map((c) => (
                    <CampaignCard
                      key={c.id}
                      campanha={c}
                      onView={() => void handleOpenPreview(c)}
                      onDelete={() => handleDeleteClick(c)}
                    />
                  ))}
                </div>
              )}

              {totalPaginas > 1 && (
                <Card variant="flat" className="flex items-center justify-between px-6 py-4">
                  <p className="text-sm font-bold text-app-muted">
                    Plano {pagina} de {totalPaginas}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={loading || pagina <= 1}
                      onClick={() => setPagina((prev) => Math.max(1, prev - 1))}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={loading || pagina >= totalPaginas}
                      onClick={() =>
                        setPagina((prev) => Math.min(totalPaginas, prev + 1))
                      }
                    >
                      Próxima
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
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
      >
        <div className="rounded border border-app-danger/40 bg-app-danger/5 p-3">
          <p className="text-xs font-semibold text-app-danger mb-2 flex items-center gap-1.5">
            <Icon name="warning" className="w-4 h-4" />
            ATENÇÃO: Esta ação é IRREVERSÍVEL!
          </p>
          <ul className="space-y-1 text-xs text-app-danger/90">
            <li>• Todos os membros serão removidos</li>
            <li>• Todas as sessões serão excluídas</li>
            <li>• Todos os personagens da campanha serão excluídos</li>
            <li>• Todos os convites serão cancelados</li>
          </ul>
        </div>
      </ConfirmDialog>

      <CampaignPreviewModal
        isOpen={previewAberto}
        onClose={handlePreviewClose}
        resumo={previewResumo}
        detalhe={previewDetalhe}
        loading={previewLoading}
        error={previewErro}
        onOpenFull={handlePreviewOpenFull}
      />
    </>
  );
}
