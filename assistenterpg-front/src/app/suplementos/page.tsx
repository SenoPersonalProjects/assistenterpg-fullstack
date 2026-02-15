// src/app/suplementos/page.tsx
'use client';

import { useEffect, useState } from 'react';
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
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
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

  useEffect(() => {
    if (!authLoading && !usuario) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && usuario) {
      carregarSuplementos();
    }
  }, [authLoading, usuario, router]);

  async function carregarSuplementos() {
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
  }

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
    <main className="min-h-screen bg-app-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-app-primary/10">
              <Icon name="book" className="w-6 h-6 text-app-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-app-fg">
                Suplementos Oficiais
              </h1>
              <p className="text-sm text-app-muted mt-0.5">
                {isAdmin
                  ? 'Gerenciar suplementos do sistema'
                  : 'Ative ou desative suplementos para expandir seu jogo'}
              </p>
            </div>
          </div>

          {/* Botão Admin */}
          {isAdmin && (
            <Button variant="primary" onClick={handleNovo}>
              <Icon name="add" className="w-5 h-5 mr-2" />
              Novo Suplemento
            </Button>
          )}
        </header>

        {/* Erro */}
        {erro && <ErrorAlert message={erro} />}

        {/* Filtros */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar suplementos..."
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={filtroStatus === 'TODOS' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFiltroStatus('TODOS')}
              >
                Todos
              </Button>
              <Button
                variant={filtroStatus === 'ATIVOS' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFiltroStatus('ATIVOS')}
              >
                Ativos
              </Button>
              <Button
                variant={filtroStatus === 'INATIVOS' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFiltroStatus('INATIVOS')}
              >
                Inativos
              </Button>
            </div>
          </div>
        </Card>

        {/* Lista de suplementos */}
        {suplementosFiltrados.length === 0 ? (
          <EmptyState
            variant="card"
            icon="book"
            title="Nenhum suplemento encontrado"
            description={
              filtroNome || filtroStatus !== 'TODOS'
                ? 'Tente ajustar os filtros de busca.'
                : 'Não há suplementos disponíveis no momento.'
            }
            actionLabel={isAdmin ? 'Criar Suplemento' : undefined}
            onAction={isAdmin ? handleNovo : undefined}
          >
            {isAdmin && (
              <div className="flex items-center justify-center gap-2 text-app-muted text-sm">
                <Icon name="add" className="w-4 h-4" />
                <span>Clique no botão abaixo para criar o primeiro suplemento</span>
              </div>
            )}
          </EmptyState>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suplementosFiltrados.map((s) => (
              <SuplementoCard
                key={s.id}
                suplemento={s}
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

        {/* Card de ajuda */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-app-primary/10">
              <Icon name="info" className="h-6 w-6 text-app-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-app-fg mb-2">
                O que são Suplementos?
              </h3>
              <p className="text-sm text-app-muted leading-relaxed mb-4">
                Suplementos são expansões oficiais que adicionam novos conteúdos ao sistema
                Jujutsu Kaisen RPG: clãs, classes, trilhas, equipamentos e muito mais.
              </p>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2.5 text-sm text-app-muted">
                  <Icon
                    name="check"
                    className="w-5 h-5 text-app-success flex-shrink-0 mt-0.5"
                  />
                  <span>
                    Ative suplementos para liberar novos conteúdos na criação de personagens
                  </span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-app-muted">
                  <Icon
                    name="check"
                    className="w-5 h-5 text-app-success flex-shrink-0 mt-0.5"
                  />
                  <span>Desative quando quiser voltar ao sistema base</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-app-muted">
                  <Icon
                    name="check"
                    className="w-5 h-5 text-app-success flex-shrink-0 mt-0.5"
                  />
                  <span>Todo conteúdo é balanceado e testado pela equipe</span>
                </li>
              </ul>
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
