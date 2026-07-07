// app/campanhas/page.tsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  apiDeleteCampanha,
  apiGetCampanhaById,
  apiGetMinhasCampanhas,
  type CampanhaResumo,
} from '@/lib/api';
import { useConfirm } from '@/hooks/useConfirm';
import { CampaignCard } from '@/components/campanha/CampaignCard';
import {
  CampaignPreviewModal,
  type CampanhaPreviewDetalhe,
} from '@/components/campanha/CampaignPreviewModal';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageToolbar } from '@/components/ui/PageToolbar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatsStrip, type StatsStripItem } from '@/components/ui/StatsStrip';
import { criarErroUsuario } from '@/lib/api/error-handler';
import { resolverListaPaginada } from '@/lib/utils/lista-paginada';
import type { UserErrorState } from '@/lib/types';

export default function CampanhasPage() {
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { isOpen, options, confirm, handleClose, handleConfirm } = useConfirm();

  const [campanhas, setCampanhas] = useState<CampanhaResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<UserErrorState | null>(null);
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
    return campanhas.filter((campanha) => campanha.nome.toLowerCase().includes(termo));
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

  const estatisticasRapidas: StatsStripItem[] = [
    {
      id: 'total',
      label: 'Total',
      value: totalCampanhas,
      icon: 'campaign',
      tone: 'primary',
      helper: 'em todas as páginas',
    },
    {
      id: 'ativas',
      label: 'Ativas',
      value: resumoStatus.ativas,
      icon: 'check',
      tone: 'success',
      helper: 'nesta página',
    },
    {
      id: 'pausadas',
      label: 'Pausadas',
      value: resumoStatus.pausadas,
      icon: 'pause',
      tone: 'warning',
      helper: 'nesta página',
    },
    {
      id: 'encerradas',
      label: 'Encerradas',
      value: resumoStatus.encerradas,
      icon: 'fail',
      tone: 'danger',
      helper: 'nesta página',
    },
  ];

  const totalExibido = filtroAtivo ? campanhasFiltradas.length : totalCampanhas;

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
      const mensagem = criarErroUsuario(error);
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

  function handleDeleteClick(campanha: CampanhaResumo) {
    confirm({
      title: `Excluir campanha "${campanha.nome}"?`,
      description: 'Esta ação é irreversível.',
      confirmLabel: 'Excluir',
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
          showToast('Campanha excluída.', 'success');
        } catch (error) {
          const mensagem = criarErroUsuario(error);
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
      setPreviewErro(criarErroUsuario(error).message);
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
      <main className="min-h-full bg-app-bg px-4 py-5 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <PageHeader
            backHref="/home"
            backLabel="Painel"
            eyebrow="Mesa"
            icon="campaign"
            title="Campanhas"
            description="Organize suas mesas, acompanhe status e retome a preparação sem disputar espaço com a navegação."
            actions={
              <Button onClick={() => router.push('/campanhas/novo')} className="w-full gap-2 sm:w-auto">
                <Icon name="add" className="h-4 w-4" />
                Nova campanha
              </Button>
            }
          />

          {erro ? <ErrorAlert message={erro} /> : null}

          <StatsStrip items={estatisticasRapidas} />

          <PageToolbar>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-app-muted">
                Busca
              </p>
              <div className="w-full sm:max-w-xl">
                <Input
                  icon="search"
                  placeholder="Nome da campanha..."
                  value={filtroNome}
                  onChange={(event) => setFiltroNome(event.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {filtroAtivo ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setFiltroNome('')}
                  className="gap-2"
                >
                  <Icon name="close" className="h-4 w-4" />
                  Limpar
                </Button>
              ) : null}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void carregarDados(pagina)}
                disabled={loading}
                className="gap-2"
              >
                <Icon name="refresh" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Atualizando' : 'Atualizar'}
              </Button>
            </div>
          </PageToolbar>

          <section className="space-y-4">
            <SectionHeader
              icon="campaign"
              title="Campanhas"
              count={totalExibido}
              description={
                filtroAtivo
                  ? 'Resultado da busca nas campanhas carregadas nesta página.'
                  : 'Lista de campanhas da sua conta.'
              }
            />

            {totalCampanhas === 0 ? (
              <EmptyState
                variant="session"
                size="sm"
                icon="campaign"
                title="Nenhuma campanha criada"
                description="Crie uma campanha para organizar mesa, participantes, fichas e sessões em um único lugar."
                action={
                  <Button onClick={() => router.push('/campanhas/novo')} size="sm" className="gap-2">
                    <Icon name="add" className="h-4 w-4" />
                    Criar primeira campanha
                  </Button>
                }
              />
            ) : campanhasFiltradas.length === 0 ? (
              <EmptyState
                variant="session"
                size="sm"
                icon="search"
                title="Nenhuma campanha encontrada"
                description="Nenhuma campanha carregada nesta página corresponde ao termo buscado."
                action={
                  <Button variant="secondary" onClick={() => setFiltroNome('')} size="sm" className="gap-2">
                    <Icon name="close" className="h-4 w-4" />
                    Limpar filtro
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {campanhasFiltradas.map((campanha) => (
                  <CampaignCard
                    key={campanha.id}
                    campanha={campanha}
                    onView={() => void handleOpenPreview(campanha)}
                    onDelete={() => handleDeleteClick(campanha)}
                  />
                ))}
              </div>
            )}

            {totalPaginas > 1 ? (
              <div className="flex flex-col gap-3 rounded-xl border border-white/5 bg-app-surface/45 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-bold text-app-muted">
                  Página {pagina} de {totalPaginas}
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
                    onClick={() => setPagina((prev) => Math.min(totalPaginas, prev + 1))}
                  >
                    Próxima
                  </Button>
                </div>
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
      >
        <div className="rounded border border-app-danger/40 bg-app-danger/5 p-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-app-danger">
            <Icon name="warning" className="h-4 w-4" />
            Atenção: esta ação é irreversível.
          </p>
          <ul className="space-y-1 text-xs text-app-danger/90">
            <li>Todos os membros serão removidos.</li>
            <li>Todas as sessões serão excluídas.</li>
            <li>Todos os personagens da campanha serão excluídos.</li>
            <li>Todos os convites serão cancelados.</li>
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
