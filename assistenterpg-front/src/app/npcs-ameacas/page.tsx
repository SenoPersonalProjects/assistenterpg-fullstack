'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/context/ToastContext';
import { apiDeleteNpcAmeaca, apiGetMeusNpcsAmeacas } from '@/lib/api/npcs-ameacas';
import type { NpcAmeacaResumo, TipoFichaNpcAmeaca, TipoNpcAmeaca } from '@/lib/types';
import { extrairMensagemErro } from '@/lib/api/error-handler';
import { NpcAmeacaCard } from '@/components/npc-ameaca/NpcAmeacaCard';
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

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
      description: 'Esta acao e irreversivel.',
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setDeletingId(item.id);
          await apiDeleteNpcAmeaca(item.id);
          setLista((prev) => prev.filter((npc) => npc.id !== item.id));
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-app-bg p-6">
        <Loading message="Carregando NPCs/Ameacas..." className="text-app-fg" />
      </div>
    );
  }

  if (!usuario) return null;

  return (
    <>
      <main className="min-h-screen bg-app-bg p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-app-primary/10">
                <Icon name="curse" className="h-6 w-6 text-app-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-app-fg">NPCs e Ameacas</h1>
                <p className="text-sm text-app-muted">
                  Fichas simplificadas para encontros, cenas e combate.
                </p>
              </div>
            </div>

            <Button onClick={() => router.push('/npcs-ameacas/novo')}>
              <Icon name="add" className="h-4 w-4 mr-2" />
              Nova ficha
            </Button>
          </header>

          {erro && <ErrorAlert message={erro} />}

          <Card>
            <div className="grid gap-3 md:grid-cols-4">
              <Input
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                placeholder="Buscar por nome..."
                className="md:col-span-2"
              />

              <Select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as TipoNpcAmeaca | 'TODOS')}
              >
                <option value="TODOS">Todos os tipos</option>
                <option value="HUMANO">Humano</option>
                <option value="FEITICEIRO">Feiticeiro</option>
                <option value="MALDICAO">Maldicao</option>
                <option value="ANIMAL">Animal</option>
                <option value="HIBRIDO">Hibrido</option>
                <option value="OUTRO">Outro</option>
              </Select>

              <Select
                value={filtroFicha}
                onChange={(e) =>
                  setFiltroFicha(e.target.value as TipoFichaNpcAmeaca | 'TODOS')
                }
              >
                <option value="TODOS">NPC + Ameaca</option>
                <option value="NPC">Somente NPC</option>
                <option value="AMEACA">Somente Ameaca</option>
              </Select>
            </div>

            <div className="mt-3 flex justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setPage(1);
                  void carregar();
                }}
              >
                <Icon name="search" className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </Card>

          {lista.length === 0 ? (
            <EmptyState
              variant="card"
              icon="curse"
              title="Nenhuma ficha encontrada"
              description="Crie sua primeira ficha simplificada de NPC/Ameaca."
              actionLabel="Criar ficha"
              onAction={() => router.push('/npcs-ameacas/novo')}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lista.map((item) => (
                <NpcAmeacaCard
                  key={item.id}
                  npcAmeaca={item}
                  onView={() => router.push(`/npcs-ameacas/${item.id}`)}
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
                Pagina {page} de {totalPages}
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
    </>
  );
}
