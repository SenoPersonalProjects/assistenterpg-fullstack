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
      <main className="min-h-screen bg-app-bg p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-app-primary/10">
                <Icon name="campaign" className="w-6 h-6 text-app-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-app-fg">Minhas campanhas</h1>
                <p className="text-sm text-app-muted mt-0.5">
                  Gerencie suas campanhas ativas, pausadas e encerradas.
                </p>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              <Icon name="back" className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </header>

          {erro && <ErrorAlert message={erro} />}

          <section>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-app-primary/10 text-app-primary">
                  <Icon name="campaign" className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-app-muted">Total de campanhas</p>
                  <p className="text-lg font-semibold text-app-fg">{totalCampanhas}</p>
                </div>
              </Card>
              <Card className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-app-success/10 text-app-success">
                  <Icon name="check" className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-app-muted">Ativas (página)</p>
                  <p className="text-lg font-semibold text-app-fg">{resumoStatus.ativas}</p>
                </div>
              </Card>
              <Card className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-app-warning/10 text-app-warning">
                  <Icon name="pause" className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-app-muted">Pausadas (página)</p>
                  <p className="text-lg font-semibold text-app-fg">{resumoStatus.pausadas}</p>
                </div>
              </Card>
              <Card className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-app-danger/10 text-app-danger">
                  <Icon name="fail" className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-app-muted">Encerradas (página)</p>
                  <p className="text-lg font-semibold text-app-fg">{resumoStatus.encerradas}</p>
                </div>
              </Card>
            </div>
            <p className="text-xs text-app-muted mt-2">
              Resumo da página atual • {campanhas.length} campanhas carregadas
            </p>
          </section>

          <section>
            <div className="rounded-lg border border-app-border bg-app-surface p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-app-primary/10 text-app-primary">
                  <Icon name="add" className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-app-fg">Criar nova campanha</h2>
                  <p className="text-sm text-app-muted">
                    Defina um nome e uma descrição para organizar sua próxima mesa.
                  </p>
                </div>
              </div>
              <div className="max-w-xl">
                <CampaignForm onSubmit={handleCreate} />
              </div>
            </div>
          </section>

          <section>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <SectionTitle icon="campaign">
                <span>Campanhas</span>
                <Badge color="gray" size="sm" className="ml-2">
                  {filtroAtivo ? campanhasFiltradas.length : totalCampanhas}
                </Badge>
              </SectionTitle>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="min-w-[220px]">
                  <Input
                    icon="search"
                    placeholder="Buscar campanha..."
                    value={filtroNome}
                    onChange={(e) => setFiltroNome(e.target.value)}
                  />
                </div>
                {filtroAtivo && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setFiltroNome('')}
                  >
                    <Icon name="close" className="w-3 h-3 mr-1" />
                    Limpar
                  </Button>
                )}
                {loading && campanhas.length > 0 && (
                  <span className="text-xs text-app-muted">Atualizando...</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void carregarDados(pagina)}
                  disabled={loading}
                >
                  <Icon name="refresh" className="w-4 h-4 mr-1" />
                  Atualizar
                </Button>
              </div>
            </div>

            {filtroAtivo && (
              <p className="text-xs text-app-muted mt-1">
                Mostrando {campanhasFiltradas.length} de {campanhas.length} campanhas nesta página
              </p>
            )}

            {totalCampanhas === 0 ? (
              <div className="mt-4">
                <EmptyState
                  variant="card"
                  icon="campaign"
                  title="Nenhuma campanha criada"
                  description="Crie sua primeira campanha usando o formulário acima!"
                />
              </div>
            ) : campanhasFiltradas.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  variant="card"
                  icon="search"
                  title="Nenhuma campanha encontrada"
                  description="Tente ajustar o termo de busca para encontrar sua campanha."
                  actionLabel="Limpar filtro"
                  onAction={() => setFiltroNome('')}
                />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
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
              <div className="mt-6 flex items-center justify-between rounded-lg border border-app-border bg-app-surface px-4 py-3">
                <p className="text-sm text-app-muted">
                  Página {pagina} de {totalPaginas}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={loading || pagina <= 1}
                    onClick={() => setPagina((prev) => Math.max(1, prev - 1))}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={loading || pagina >= totalPaginas}
                    onClick={() =>
                      setPagina((prev) => Math.min(totalPaginas, prev + 1))
                    }
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </section>

          {totalCampanhas === 0 && (
            <section>
              <div className="rounded-lg border border-app-border bg-app-surface p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-app-primary/10">
                    <Icon name="info" className="h-6 w-6 text-app-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-app-fg mb-2">Como funcionam as campanhas?</h3>
                    <p className="text-sm text-app-muted leading-relaxed mb-4">
                      Campanhas são a forma de organizar suas histórias e aventuras no sistema Jujutsu Kaisen RPG.
                      Cada campanha tem seus próprios personagens, sessões e progresso.
                    </p>
                    <ul className="space-y-2.5">
                      <li className="flex items-start gap-2.5 text-sm text-app-muted">
                        <Icon name="check" className="w-5 h-5 text-app-success flex-shrink-0 mt-0.5" />
                        <span>Convide jogadores e gerencie membros da mesa</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-app-muted">
                        <Icon name="check" className="w-5 h-5 text-app-success flex-shrink-0 mt-0.5" />
                        <span>Adicione personagens-base à campanha para jogar</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-app-muted">
                        <Icon name="check" className="w-5 h-5 text-app-success flex-shrink-0 mt-0.5" />
                        <span>Registre sessões e acompanhe o progresso da história</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-app-muted">
                        <Icon name="check" className="w-5 h-5 text-app-success flex-shrink-0 mt-0.5" />
                        <span>Controle o status: Ativa, Pausada ou Encerrada</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          )}
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
