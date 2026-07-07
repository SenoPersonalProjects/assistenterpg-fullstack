// src/app/suplementos/page.tsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  apiAtivarSuplemento,
  apiDeleteSuplemento,
  apiDesativarSuplemento,
  apiGetSuplementos,
  type SuplementoCatalogo,
} from '@/lib/api/suplementos';
import { criarErroUsuario } from '@/lib/api/error-handler';
import { SuplementoCard } from '@/components/suplemento/SuplementoCard';
import { ModalSuplementoForm } from '@/components/suplemento/ModalSuplementoForm';
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
import { useConfirm } from '@/hooks/useConfirm';
import type { UserErrorState } from '@/lib/types';

type FiltroStatus = 'TODOS' | 'ATIVOS' | 'INATIVOS';

const STATUS_TABS: Array<{ id: FiltroStatus; label: string }> = [
  { id: 'TODOS', label: 'Todos' },
  { id: 'ATIVOS', label: 'Ativos' },
  { id: 'INATIVOS', label: 'Inativos' },
];

export default function SuplementosPage() {
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { isOpen, options, confirm, handleClose, handleConfirm } = useConfirm();

  const [suplementos, setSuplementos] = useState<SuplementoCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<UserErrorState | null>(null);
  const [processando, setProcessando] = useState<number | null>(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [suplementoEditando, setSuplementoEditando] = useState<SuplementoCatalogo | null>(null);

  const [filtroNome, setFiltroNome] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('TODOS');

  const isAdmin = usuario?.role === 'ADMIN';

  const carregarSuplementos = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = await apiGetSuplementos();
      setSuplementos(data);
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
      carregarSuplementos();
    }
  }, [authLoading, usuario, router, carregarSuplementos]);

  async function handleAtivar(suplemento: SuplementoCatalogo) {
    try {
      setProcessando(suplemento.id);
      await apiAtivarSuplemento(suplemento.id);
      setSuplementos((prev) =>
        prev.map((s) => (s.id === suplemento.id ? { ...s, ativo: true } : s)),
      );
      showToast(`Suplemento "${suplemento.nome}" ativado!`, 'success');
    } catch (error) {
      const mensagem = criarErroUsuario(error);
      showToast(mensagem, 'error');
    } finally {
      setProcessando(null);
    }
  }

  async function handleDesativar(suplemento: SuplementoCatalogo) {
    try {
      setProcessando(suplemento.id);
      await apiDesativarSuplemento(suplemento.id);
      setSuplementos((prev) =>
        prev.map((s) => (s.id === suplemento.id ? { ...s, ativo: false } : s)),
      );
      showToast(`Suplemento "${suplemento.nome}" desativado.`, 'info');
    } catch (error) {
      const mensagem = criarErroUsuario(error);
      showToast(mensagem, 'error');
    } finally {
      setProcessando(null);
    }
  }

  function handleEdit(suplemento: SuplementoCatalogo) {
    setSuplementoEditando(suplemento);
    setModalAberto(true);
  }

  function handleOpen(suplemento: SuplementoCatalogo) {
    router.push(`/suplementos/${suplemento.codigo}`);
  }

  function handleDelete(suplemento: SuplementoCatalogo) {
    confirm({
      title: 'Excluir suplemento',
      description: `Tem certeza que deseja excluir "${suplemento.nome}"? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setProcessando(suplemento.id);
          await apiDeleteSuplemento(suplemento.id);
          setSuplementos((prev) => prev.filter((s) => s.id !== suplemento.id));
          showToast('Suplemento excluído com sucesso!', 'success');
        } catch (error) {
          const mensagem = criarErroUsuario(error);
          showToast(mensagem, 'error');
        } finally {
          setProcessando(null);
        }
      },
    });
  }

  function handleNovo() {
    setSuplementoEditando(null);
    setModalAberto(true);
  }

  function handleModalClose(sucesso?: boolean) {
    setModalAberto(false);
    setSuplementoEditando(null);
    if (sucesso) {
      carregarSuplementos();
    }
  }

  function handleLimparFiltros() {
    setFiltroNome('');
    setFiltroStatus('TODOS');
  }

  const suplementosVisiveis = useMemo(
    () => suplementos.filter((suplemento) => isAdmin || suplemento.status === 'PUBLICADO'),
    [isAdmin, suplementos],
  );

  const suplementosFiltrados = useMemo(() => {
    const termo = filtroNome.trim().toLowerCase();

    return suplementosVisiveis.filter((suplemento) => {
      if (termo && !suplemento.nome.toLowerCase().includes(termo)) {
        return false;
      }

      if (filtroStatus === 'ATIVOS' && !suplemento.ativo) return false;
      if (filtroStatus === 'INATIVOS' && suplemento.ativo) return false;

      return true;
    });
  }, [filtroNome, filtroStatus, suplementosVisiveis]);

  const filtrosAtivos = filtroNome.trim().length > 0 || filtroStatus !== 'TODOS';

  const statsItems: StatsStripItem[] = [
    {
      id: 'total',
      label: 'Total visível',
      value: suplementosVisiveis.length,
      icon: 'book',
      tone: 'primary',
    },
    {
      id: 'ativos',
      label: 'Ativos',
      value: suplementosVisiveis.filter((suplemento) => suplemento.ativo).length,
      icon: 'check',
      tone: 'success',
    },
    {
      id: 'inativos',
      label: 'Inativos',
      value: suplementosVisiveis.filter((suplemento) => !suplemento.ativo).length,
      icon: 'close',
      tone: 'default',
    },
    {
      id: 'publicados',
      label: 'Publicados',
      value: suplementosVisiveis.filter((suplemento) => suplemento.status === 'PUBLICADO').length,
      icon: 'library',
      tone: 'warning',
    },
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-full bg-app-bg p-6">
        <Loading message="Carregando suplementos..." className="text-app-fg" />
      </div>
    );
  }

  if (!usuario) return null;

  return (
    <main className="min-h-full bg-app-bg px-4 py-5 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          eyebrow="Biblioteca oficial"
          icon="book"
          title="Suplementos"
          description={
            isAdmin
              ? 'Gerencie suplementos oficiais, publicação e disponibilidade para o sistema.'
              : 'Ative, desative e consulte suplementos oficiais para expandir seu jogo.'
          }
          actions={
            isAdmin ? (
              <Button onClick={handleNovo} className="w-full gap-2 sm:w-auto">
                <Icon name="add" className="h-4 w-4" />
                Novo suplemento
              </Button>
            ) : undefined
          }
        />

        {erro ? <ErrorAlert message={erro} /> : null}

        <StatsStrip items={statsItems} />

        <PageToolbar>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-app-muted">
              Busca
            </p>
            <div className="w-full sm:max-w-md">
              <Input
                placeholder="Ex: Sobrevivendo ao Jujutsu..."
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                icon="search"
              />
            </div>
          </div>

          <div className="flex w-full flex-wrap gap-1 rounded-xl border border-white/5 bg-app-muted-surface p-1 sm:w-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFiltroStatus(tab.id)}
                className={[
                  'rounded-lg px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition-colors',
                  filtroStatus === tab.id
                    ? 'bg-app-surface text-app-primary shadow-sm'
                    : 'text-app-muted hover:text-app-fg',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {filtrosAtivos ? (
            <Button variant="secondary" size="sm" onClick={handleLimparFiltros} className="gap-2">
              <Icon name="close" className="h-4 w-4" />
              Limpar
            </Button>
          ) : null}
        </PageToolbar>

        <section className="space-y-3">
          <SectionHeader
            icon="book"
            title="Suplementos disponíveis"
            description="Conteúdos oficiais disponíveis para consulta e ativação."
            count={suplementosFiltrados.length}
          />

          {suplementosFiltrados.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-app-surface/35 px-4 py-8">
              <EmptyState
                variant="plain"
                icon="book"
                title="Nenhum suplemento encontrado"
                description={
                  filtrosAtivos
                    ? 'Tente limpar a busca ou mudar o filtro de status.'
                    : 'Nenhum suplemento disponível no momento.'
                }
                actionLabel={filtrosAtivos ? 'Limpar filtros' : isAdmin ? 'Criar suplemento' : undefined}
                onAction={filtrosAtivos ? handleLimparFiltros : isAdmin ? handleNovo : undefined}
              />
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {suplementosFiltrados.map((suplemento) => (
                <SuplementoCard
                  key={suplemento.id}
                  suplemento={suplemento}
                  onOpen={() => handleOpen(suplemento)}
                  onAtivar={() => handleAtivar(suplemento)}
                  onDesativar={() => handleDesativar(suplemento)}
                  onEdit={isAdmin ? () => handleEdit(suplemento) : undefined}
                  onDelete={isAdmin ? () => handleDelete(suplemento) : undefined}
                  processando={processando === suplemento.id}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </section>

        <details className="rounded-xl border border-white/5 bg-app-surface/35 p-4 text-sm text-app-muted">
          <summary className="cursor-pointer text-sm font-black text-app-fg">
            O que são suplementos?
          </summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {[
              { title: 'Conteúdo', text: 'Novas opções para criação de personagens.' },
              { title: 'Controle', text: 'Ative e desative quando quiser.' },
              { title: 'Equilíbrio', text: 'Conteúdo revisado para funcionar com o sistema base.' },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-white/5 bg-app-bg/35 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-app-primary">
                  {item.title}
                </p>
                <p className="mt-1 text-xs font-medium leading-relaxed text-app-muted">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </details>
      </div>

      {isAdmin ? (
        <ModalSuplementoForm
          isOpen={modalAberto}
          onClose={handleModalClose}
          suplemento={suplementoEditando}
        />
      ) : null}

      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={options?.title || ''}
        description={options?.description || ''}
        confirmLabel={options?.confirmLabel}
        cancelLabel={options?.cancelLabel}
        variant={options?.variant}
      />
    </main>
  );
}
