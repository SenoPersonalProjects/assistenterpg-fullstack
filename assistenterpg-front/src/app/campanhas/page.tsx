// app/campanhas/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  apiGetMinhasCampanhas,
  apiCreateCampanha,
  apiDeleteCampanha,
  CampanhaResumo,
} from '@/lib/api';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { CampaignForm } from '@/components/campanha/CampaignForm';
import { CampaignCard } from '@/components/campanha/CampaignCard';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { extrairMensagemErro } from '@/lib/api/error-handler';

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

  const carregarDados = useCallback(async (paginaAtual: number) => {
    try {
      setLoading(true);
      const dados = await apiGetMinhasCampanhas({ page: paginaAtual, limit: 12 });
      const totalPaginasCalculado = Math.max(1, dados.totalPages);

      if (
        dados.items.length === 0 &&
        paginaAtual > 1 &&
        totalPaginasCalculado < paginaAtual
      ) {
        setPagina(totalPaginasCalculado);
        return;
      }

      setCampanhas(dados.items);
      setTotalCampanhas(dados.total);
      setTotalPaginas(totalPaginasCalculado);
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
            <div className="rounded-lg border border-app-border bg-app-surface p-6">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="add" className="w-5 h-5 text-app-primary" />
                <h2 className="text-lg font-semibold text-app-fg">Criar nova campanha</h2>
              </div>
              <div className="max-w-xl">
                <CampaignForm onSubmit={handleCreate} />
              </div>
            </div>
          </section>

          <section>
            <SectionTitle>Campanhas ({totalCampanhas})</SectionTitle>

            {loading && campanhas.length > 0 && (
              <p className="mt-2 text-sm text-app-muted">Atualizando lista...</p>
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
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                {campanhas.map((c) => (
                  <CampaignCard key={c.id} campanha={c} onDelete={() => handleDeleteClick(c)} />
                ))}
              </div>
            )}

            {totalPaginas > 1 && (
              <div className="mt-6 flex items-center justify-between rounded-lg border border-app-border bg-app-surface px-4 py-3">
                <p className="text-sm text-app-muted">
                  Pagina {pagina} de {totalPaginas}
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
                    Proxima
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
    </>
  );
}
