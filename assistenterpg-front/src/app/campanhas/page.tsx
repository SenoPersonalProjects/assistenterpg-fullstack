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
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { extrairMensagemErro } from '@/lib/api/error-handler';
import { resolverListaPaginada } from '@/lib/utils/lista-paginada';

type CampanhaStat = {
  label: string;
  value: number;
  icon: IconName;
  className: string;
};

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

  const estatisticasRapidas: CampanhaStat[] = [
    {
      label: 'Total',
      value: totalCampanhas,
      icon: 'campaign',
      className: 'bg-app-primary/10 text-app-primary',
    },
    {
      label: 'Ativas',
      value: resumoStatus.ativas,
      icon: 'check',
      className: 'bg-app-success/10 text-app-success',
    },
    {
      label: 'Pausadas',
      value: resumoStatus.pausadas,
      icon: 'pause',
      className: 'bg-app-warning/10 text-app-warning',
    },
    {
      label: 'Encerradas',
      value: resumoStatus.encerradas,
      icon: 'fail',
      className: 'bg-app-danger/10 text-app-danger',
    },
  ];

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
        <div className="mx-auto max-w-7xl space-y-8">
          <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-app-primary/10 shadow-inner">
                <Icon name="campaign" className="h-8 w-8 text-app-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight text-app-fg">Campanhas</h1>
                <p className="mt-0.5 font-medium text-app-muted">
                  Organize suas campanhas e acompanhe suas mesas.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => router.push('/campanhas/novo')} className="font-black">
                <Icon name="add" className="mr-2 h-4 w-4" />
                Nova campanha
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/home')}
                className="font-bold"
              >
                <Icon name="back" className="mr-2 h-4 w-4" />
                Painel
              </Button>
            </div>
          </header>

          {erro ? <ErrorAlert message={erro} /> : null}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {estatisticasRapidas.map((stat) => (
              <Card key={stat.label} variant="glass" className="!p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.className}`}>
                    <Icon name={stat.icon} className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase leading-none tracking-widest text-app-muted">
                      {stat.label}
                    </p>
                    <p className="text-xl font-black leading-none text-app-fg">{stat.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card variant="glass" className="!p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-app-primary/10 p-2">
                  <Icon name="filter" className="h-5 w-5 text-app-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-app-fg">Filtrar campanhas</h2>
                  <p className="text-sm font-medium text-app-muted">
                    Busque campanhas carregadas nesta página.
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-xl">
                <Input
                  icon="search"
                  placeholder="Nome da campanha..."
                  value={filtroNome}
                  onChange={(event) => setFiltroNome(event.target.value)}
                />
                {filtroAtivo ? (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setFiltroNome('')}
                    className="font-bold sm:w-auto"
                  >
                    <Icon name="close" className="mr-2 h-4 w-4" />
                    Limpar
                  </Button>
                ) : null}
              </div>
            </div>
          </Card>

          <section className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SectionTitle icon="campaign">
                Campanhas
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
                <Icon name="refresh" className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </div>

            {totalCampanhas === 0 ? (
              <EmptyState
                variant="card"
                lottie="EMPTY_BOX"
                title="Nenhuma campanha criada"
                description="Você ainda não criou nenhuma campanha. Crie uma campanha para organizar sua mesa."
                actionLabel="Criar primeira campanha"
                onAction={() => router.push('/campanhas/novo')}
              />
            ) : campanhasFiltradas.length === 0 ? (
              <EmptyState
                variant="card"
                lottie="GHOST_SEARCH"
                title="Nenhuma campanha encontrada"
                description="Tente ajustar a busca. Nenhuma campanha carregada nesta página tem esse nome."
                actionLabel="Limpar filtro"
                onAction={() => setFiltroNome('')}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
              <Card variant="flat" className="flex items-center justify-between px-6 py-4">
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
              </Card>
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
