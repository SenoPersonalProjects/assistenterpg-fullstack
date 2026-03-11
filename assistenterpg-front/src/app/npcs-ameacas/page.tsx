'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/context/ToastContext';
import {
  apiDeleteNpcAmeaca,
  apiGetMeusNpcsAmeacas,
  apiGetNpcAmeaca,
} from '@/lib/api/npcs-ameacas';
import type {
  NpcAmeacaDetalhe,
  NpcAmeacaResumo,
  TipoFichaNpcAmeaca,
  TipoNpcAmeaca,
} from '@/lib/types';
import { extrairMensagemErro } from '@/lib/api/error-handler';
import { NpcAmeacaCard } from '@/components/npc-ameaca/NpcAmeacaCard';
import { NpcAmeacaPageHeader } from '@/components/npc-ameaca/NpcAmeacaPageHeader';
import { NpcAmeacaPreviewModal } from '@/components/npc-ameaca/NpcAmeacaPreviewModal';
import { fichaTipoOptions, tipoNpcOptions } from '@/components/npc-ameaca/npcAmeacaUi';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { Select } from '@/components/ui/Select';

export default function NpcsAmeacasPage() {
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { isOpen, options, confirm, handleClose, handleConfirm } = useConfirm();

  const [lista, setLista] = useState<NpcAmeacaResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [previewAberto, setPreviewAberto] = useState(false);
  const [previewResumo, setPreviewResumo] = useState<NpcAmeacaResumo | null>(null);
  const [previewDetalhe, setPreviewDetalhe] = useState<NpcAmeacaDetalhe | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewErro, setPreviewErro] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItens, setTotalItens] = useState(0);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoNpcAmeaca | 'TODOS'>('TODOS');
  const [filtroFicha, setFiltroFicha] = useState<TipoFichaNpcAmeaca | 'TODOS'>(
    'TODOS',
  );

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);

      const resposta = await apiGetMeusNpcsAmeacas({
        page,
        limit: 12,
        nome: filtroNome || undefined,
        tipo: filtroTipo !== 'TODOS' ? filtroTipo : undefined,
        fichaTipo: filtroFicha !== 'TODOS' ? filtroFicha : undefined,
      });

      setLista(resposta.items);
      setTotalPages(resposta.totalPages);
      setTotalItens(resposta.total);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setLoading(false);
    }
  }, [filtroFicha, filtroNome, filtroTipo, page]);

  useEffect(() => {
    if (!authLoading && !usuario) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && usuario) {
      void carregar();
    }
  }, [authLoading, carregar, router, usuario]);

  function handleDelete(item: NpcAmeacaResumo) {
    confirm({
      title: `Excluir "${item.nome}"?`,
      description: 'Esta ação é irreversível.',
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setDeletingId(item.id);
          await apiDeleteNpcAmeaca(item.id);
          setLista((prev) => prev.filter((npc) => npc.id !== item.id));
          setTotalItens((prev) => Math.max(0, prev - 1));
          if (previewResumo?.id === item.id) {
            setPreviewAberto(false);
            setPreviewResumo(null);
            setPreviewDetalhe(null);
          }
          showToast('Ficha removida com sucesso.', 'success');
        } catch (error) {
          const mensagem = extrairMensagemErro(error);
          setErro(mensagem);
          showToast(mensagem, 'error');
        } finally {
          setDeletingId(null);
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
    router.push(`/npcs-ameacas/${previewResumo.id}`);
  }

  function handlePreviewEdit() {
    if (!previewResumo) return;
    handlePreviewClose();
    router.push(`/npcs-ameacas/${previewResumo.id}/editar`);
  }

  async function handleOpenPreview(item: NpcAmeacaResumo) {
    setPreviewAberto(true);
    setPreviewResumo(item);
    setPreviewDetalhe(null);
    setPreviewErro(null);
    setPreviewLoading(true);

    try {
      const detalhe = await apiGetNpcAmeaca(item.id);
      setPreviewDetalhe(detalhe);
    } catch (error) {
      setPreviewErro(extrairMensagemErro(error));
    } finally {
      setPreviewLoading(false);
    }
  }

  function handleAplicarFiltros() {
    if (page !== 1) {
      setPage(1);
      return;
    }
    void carregar();
  }

  function handleLimparFiltros() {
    setFiltroNome('');
    setFiltroTipo('TODOS');
    setFiltroFicha('TODOS');
    if (page !== 1) {
      setPage(1);
      return;
    }
    void carregar();
  }

  if (authLoading || loading) {
    return (
      <div className="npc-page-shell min-h-screen p-6">
        <Loading message="Carregando fichas..." className="text-app-fg" />
      </div>
    );
  }

  if (!usuario) return null;

  return (
    <>
      <main className="npc-page-shell min-h-screen p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <NpcAmeacaPageHeader
            title="NPC"
            description="Gerencie fichas de aliados ou ameaças para campanhas e sessões."
            badge={
              <Badge color="blue">
                {totalItens} {totalItens === 1 ? 'ficha' : 'fichas'}
              </Badge>
            }
            actions={
              <>
                <Button variant="ghost" onClick={() => router.push('/home')}>
                  <Icon name="back" className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <Button onClick={() => router.push('/npcs-ameacas/novo')}>
                  <Icon name="add" className="mr-2 h-4 w-4" />
                  Novo NPC
                </Button>
              </>
            }
          />

          {erro && <ErrorAlert message={erro} />}

          <Card className="npc-panel space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <Input
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                placeholder="Buscar por nome..."
                className="md:col-span-2"
                icon="search"
              />

              <Select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as TipoNpcAmeaca | 'TODOS')}
              >
                <option value="TODOS">Todos os tipos</option>
                {tipoNpcOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <Select
                value={filtroFicha}
                onChange={(e) =>
                  setFiltroFicha(e.target.value as TipoFichaNpcAmeaca | 'TODOS')
                }
              >
                <option value="TODOS">Aliados ou ameaças</option>
                {fichaTipoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    Somente {option.label.toLowerCase()}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="secondary" onClick={handleLimparFiltros}>
                <Icon name="close" className="mr-2 h-4 w-4" />
                Limpar
              </Button>
              <Button variant="secondary" onClick={handleAplicarFiltros}>
                <Icon name="search" className="mr-2 h-4 w-4" />
                Filtrar
              </Button>
            </div>
          </Card>

          {lista.length === 0 ? (
            <EmptyState
              variant="card"
              icon="curse"
              title="Nenhuma ficha encontrada"
              description="Crie sua primeira ficha de aliado ou ameaça."
              actionLabel="Criar ficha"
              onAction={() => router.push('/npcs-ameacas/novo')}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lista.map((item) => (
                <NpcAmeacaCard
                  key={item.id}
                  npcAmeaca={item}
                  onView={() => void handleOpenPreview(item)}
                  onEdit={() => router.push(`/npcs-ameacas/${item.id}/editar`)}
                  onDelete={() => handleDelete(item)}
                  deleting={deletingId === item.id}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                <Icon name="chevron-left" className="h-4 w-4" />
              </Button>
              <span className="px-3 text-sm text-app-muted">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                <Icon name="chevron-right" className="h-4 w-4" />
              </Button>
            </div>
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
      />

      <NpcAmeacaPreviewModal
        isOpen={previewAberto}
        onClose={handlePreviewClose}
        resumo={previewResumo}
        detalhe={previewDetalhe}
        loading={previewLoading}
        error={previewErro}
        onOpenFull={handlePreviewOpenFull}
        onEdit={handlePreviewEdit}
      />
    </>
  );
}
