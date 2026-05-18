// src/app/suplementos/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  apiGetSuplementos,
  apiAtivarSuplemento,
  apiDesativarSuplemento,
  apiDeleteSuplemento,
  SuplementoCatalogo,
} from '@/lib/api/suplementos';
import { extrairMensagemErro } from '@/lib/api/error-handler';
import { SuplementoCard } from '@/components/suplemento/SuplementoCard';
import { ModalSuplementoForm } from '@/components/suplemento/ModalSuplementoForm';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function SuplementosPage() {
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { isOpen, options, confirm, handleClose, handleConfirm } = useConfirm();

  const [suplementos, setSuplementos] = useState<SuplementoCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [processando, setProcessando] = useState<number | null>(null);

  // Modal admin
  const [modalAberto, setModalAberto] = useState(false);
  const [suplementoEditando, setSuplementoEditando] = useState<SuplementoCatalogo | null>(null);

  // Filtros
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'ATIVOS' | 'INATIVOS'>('TODOS');

  const isAdmin = usuario?.role === 'ADMIN';

  const carregarSuplementos = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = await apiGetSuplementos();
      setSuplementos(data);
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
      carregarSuplementos();
    }
  }, [authLoading, usuario, router, carregarSuplementos]);

  async function handleAtivar(suplemento: SuplementoCatalogo) {
    try {
      setProcessando(suplemento.id);
      await apiAtivarSuplemento(suplemento.id);
      setSuplementos((prev) =>
        prev.map((s) => (s.id === suplemento.id ? { ...s, ativo: true } : s))
      );
      showToast(`Suplemento "${suplemento.nome}" ativado!`, 'success');
    } catch (error) {
      const mensagem = extrairMensagemErro(error);
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
        prev.map((s) => (s.id === suplemento.id ? { ...s, ativo: false } : s))
      );
      showToast(`Suplemento "${suplemento.nome}" desativado.`, 'info');
    } catch (error) {
      const mensagem = extrairMensagemErro(error);
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
      title: 'Deletar Suplemento',
      description: `Tem certeza que deseja deletar "${suplemento.nome}"? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Deletar',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setProcessando(suplemento.id);
          await apiDeleteSuplemento(suplemento.id);
          setSuplementos((prev) => prev.filter((s) => s.id !== suplemento.id));
          showToast('Suplemento deletado com sucesso!', 'success');
        } catch (error) {
          const mensagem = extrairMensagemErro(error);
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

  const suplementosFiltrados = suplementos.filter((s) => {
    if (filtroNome && !s.nome.toLowerCase().includes(filtroNome.toLowerCase())) {
      return false;
    }

    if (filtroStatus === 'ATIVOS' && !s.ativo) return false;
    if (filtroStatus === 'INATIVOS' && s.ativo) return false;

    if (!isAdmin && s.status !== 'PUBLICADO') {
      return false;
    }

    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-app-bg p-6">
        <Loading message="Carregando suplementos..." className="text-app-fg" />
      </div>
    );
  }

  if (!usuario) return null;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-app-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-app-primary/10 shadow-inner">
              <Icon name="book" className="w-8 h-8 text-app-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-app-fg tracking-tight">
                Suplementos
              </h1>
              <p className="text-app-muted font-medium mt-0.5 max-w-md">
                {isAdmin
                  ? 'Gerencie os suplementos do sistema.'
                  : 'Ative ou desative suplementos para expandir seu jogo.'}
              </p>
            </div>
          </div>

          {/* Botão Admin */}
          {isAdmin && (
            <Button variant="primary" onClick={handleNovo} className="font-black shadow-lg shadow-app-primary/20">
              <Icon name="add" className="w-5 h-5 mr-2" />
              Novo suplemento
            </Button>
          )}
        </header>

        {/* Erro */}
        {erro && <ErrorAlert message={erro} />}

        {/* Filtros Premium */}
        <Card variant="glass" className="!p-6">
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <Input
                label="Nome do suplemento"
                placeholder="Ex: Sobrevivendo ao Jujutsu..."
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                icon="search"
              />
            </div>

            <div className="flex bg-app-muted-surface p-1 rounded-xl border border-app-border/40">
              {[
                { id: 'TODOS', label: 'Todos' },
                { id: 'ATIVOS', label: 'Ativos' },
                { id: 'INATIVOS', label: 'Inativos' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFiltroStatus(tab.id as any)}
                  className={`
                    px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all
                    ${filtroStatus === tab.id 
                      ? 'bg-app-surface text-app-primary shadow-sm' 
                      : 'text-app-muted hover:text-app-fg'}
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Lista de suplementos */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <SectionTitle icon="book">
              Suplementos disponíveis
              <Badge color="blue" size="sm" variant="subtle" className="ml-3">
                {suplementosFiltrados.length}
              </Badge>
            </SectionTitle>
          </div>

          {suplementosFiltrados.length === 0 ? (
            <EmptyState
              variant="card"
              icon="book"
              title="Nenhum suplemento encontrado"
              description="Nenhum suplemento encontrado. Tente mudar o nome ou o filtro de status."
              actionLabel={isAdmin ? 'Criar suplemento' : undefined}
              onAction={isAdmin ? handleNovo : undefined}
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {suplementosFiltrados.map((s) => (
                <SuplementoCard
                  key={s.id}
                  suplemento={s}
                  onOpen={() => handleOpen(s)}
                  onAtivar={() => handleAtivar(s)}
                  onDesativar={() => handleDesativar(s)}
                  onEdit={isAdmin ? () => handleEdit(s) : undefined}
                  onDelete={isAdmin ? () => handleDelete(s) : undefined}
                  processando={processando === s.id}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </section>

        {/* Card de ajuda */}
        <Card variant="glass" className="!p-8">
          <div className="flex items-start gap-6">
            <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-app-primary/10 text-app-primary shadow-inner">
              <Icon name="info" className="h-8 w-8" />
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-black text-app-fg">
                O que são Suplementos?
              </h3>
              <p className="text-app-muted font-medium leading-relaxed max-w-2xl">
                Suplementos são conteúdos oficiais que adicionam novas opções ao sistema Jujutsu Kaisen RPG: clãs, classes, trilhas, equipamentos e mais.
              </p>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { title: 'Conteúdo', text: 'Novas opções para criação de personagens.' },
                  { title: 'Controle', text: 'Ative e desative quando quiser.' },
                  { title: 'Equilíbrio', text: 'Conteúdo revisado para funcionar com o sistema base.' },
                ].map((item) => (
                  <div key={item.title} className="space-y-1">
                    <p className="text-sm font-black text-app-primary uppercase tracking-widest">{item.title}</p>
                    <p className="text-xs text-app-muted font-medium">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal Admin */}
      {isAdmin && (
        <ModalSuplementoForm
          isOpen={modalAberto}
          onClose={handleModalClose}
          suplemento={suplementoEditando}
        />
      )}

      {/* Dialog de Confirmação */}
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
