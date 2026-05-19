'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePresence } from '@/context/PresenceContext';
import { useToast } from '@/context/ToastContext';
import {
  apiAceitarSolicitacaoAmizade,
  apiCancelarSolicitacaoAmizade,
  apiCriarSolicitacaoAmizade,
  apiListarAmigos,
  apiListarSolicitacoesAmizade,
  apiNotificarAmizadesAtualizadas,
  apiRecusarSolicitacaoAmizade,
  apiRemoverAmizade,
  extrairMensagemErro,
} from '@/lib/api';
import type { AmigoResumo, SolicitacoesAmizade } from '@/lib/types';
import { AddFriendForm } from '@/components/amigos/AddFriendForm';
import { FriendCard } from '@/components/amigos/FriendCard';
import { FriendRequestCard } from '@/components/amigos/FriendRequestCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import { Loading } from '@/components/ui/Loading';

const SOLICITACOES_INICIAIS: SolicitacoesAmizade = {
  recebidas: [],
  enviadas: [],
};

export default function AmigosPage() {
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();
  const { onlineFriendIds, synced } = usePresence();
  const { showToast } = useToast();

  const [amigos, setAmigos] = useState<AmigoResumo[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacoesAmizade>(
    SOLICITACOES_INICIAIS,
  );
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [acaoId, setAcaoId] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);

    try {
      const [amigosData, solicitacoesData] = await Promise.all([
        apiListarAmigos(),
        apiListarSolicitacoesAmizade(),
      ]);
      setAmigos(amigosData);
      setSolicitacoes(solicitacoesData);
      apiNotificarAmizadesAtualizadas(solicitacoesData.recebidas.length);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !usuario) {
      router.push('/auth/login');
      return;
    }

    if (authLoading || !usuario) return;
    void carregar();
  }, [authLoading, carregar, router, usuario]);

  const amigosComPresenca = useMemo(
    () =>
      amigos.map((amigo) => ({
        ...amigo,
        online: synced ? onlineFriendIds.has(amigo.id) : amigo.online,
      })),
    [amigos, onlineFriendIds, synced],
  );

  async function executarAcao(
    id: number,
    acao: () => Promise<void>,
    mensagem: string,
  ) {
    setAcaoId(id);
    setErro(null);
    try {
      await acao();
      showToast(mensagem, 'success');
      await carregar();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setAcaoId(null);
    }
  }

  async function enviarSolicitacao(identificador: string) {
    setErro(null);
    try {
      await apiCriarSolicitacaoAmizade(identificador);
      showToast('Solicitação enviada.', 'success');
      await carregar();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    }
  }

  if (authLoading || loading) {
    return <Loading message="Carregando amigos..." className="p-6 text-app-fg" />;
  }

  if (!usuario) return null;

  const totalAmigos = amigosComPresenca.length;
  const amigosOnline = amigosComPresenca.filter(a => a.online).length;
  const solicitacoesPendentes = solicitacoes.recebidas.length;

  return (
    <main className="min-h-screen bg-app-bg pb-12">
      <div className="bg-app-surface border-b border-app-border pt-8 pb-12 mb-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="mb-6 flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/home')}
              className="text-app-muted hover:text-app-fg"
            >
              <Icon name="back" className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-2xl bg-app-primary/10 border border-app-primary/20 shadow-inner">
                <Icon name="characters" className="w-12 h-12 sm:w-14 sm:h-14 text-app-primary" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-app-fg tracking-tight mb-2">
                  Amigos
                </h1>
                <p className="text-sm font-medium text-app-muted max-w-md">
                  Adicione amigos, veja quem está online e convide-os para participar das suas campanhas.
                </p>
              </div>
            </div>

            <div className="flex bg-app-bg/50 backdrop-blur-md rounded-xl border border-app-border/60 shadow-sm p-2">
              <div className="px-5 py-2 text-center">
                <p className="text-[10px] sm:text-xs text-app-muted font-bold uppercase tracking-widest mb-1">Amigos</p>
                <p className="text-xl sm:text-2xl font-bold text-app-fg">{totalAmigos}</p>
              </div>
              <div className="w-px bg-app-border/60 my-2"></div>
              <div className="px-5 py-2 text-center">
                <p className="text-[10px] sm:text-xs text-app-muted font-bold uppercase tracking-widest mb-1">Online</p>
                <p className="text-xl sm:text-2xl font-bold text-app-success">{amigosOnline}</p>
              </div>
              <div className="w-px bg-app-border/60 my-2"></div>
              <div className="px-5 py-2 text-center">
                <p className="text-[10px] sm:text-xs text-app-muted font-bold uppercase tracking-widest mb-1">Solicitações</p>
                <p className="text-xl sm:text-2xl font-bold text-app-info">{solicitacoesPendentes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {erro && <ErrorAlert message={erro} className="mb-6" />}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-app-primary/15 text-app-primary">
                <Icon name="characters" className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-app-fg tracking-tight">Lista de Amigos</h2>
            </div>

            {amigosComPresenca.length === 0 ? (
              <EmptyState
                variant="card"
                icon="characters"
                title="Nenhum amigo adicionado"
                description="Envie uma solicitação para começar a montar sua lista de amigos."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {amigosComPresenca.map((amigo) => (
                  <FriendCard
                    key={amigo.id}
                    amigo={amigo}
                    removing={acaoId === amigo.id}
                    onRemove={(usuarioId) =>
                      executarAcao(
                        usuarioId,
                        () => apiRemoverAmizade(usuarioId),
                        'Amigo removido.',
                      )
                    }
                  />
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-8">
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-app-secondary/15 text-app-secondary">
                  <Icon name="add" className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-app-fg tracking-tight">Adicionar Amigo</h2>
              </div>
              <div className="rounded-xl border border-app-border bg-app-surface p-5 shadow-sm">
                <AddFriendForm onSubmit={enviarSolicitacao} />
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-app-info/15 text-app-info">
                    <Icon name="bell" className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-app-fg tracking-tight">Solicitações Recebidas</h2>
                </div>
                {solicitacoesPendentes > 0 && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-app-info text-xs font-bold text-white">
                    {solicitacoesPendentes}
                  </span>
                )}
              </div>
              
              {solicitacoes.recebidas.length === 0 ? (
                <EmptyState
                  variant="plain"
                  size="sm"
                  description="Nenhuma solicitação recebida."
                />
              ) : (
                <div className="space-y-3">
                  {solicitacoes.recebidas.map((solicitacao) => (
                    <FriendRequestCard
                      key={solicitacao.id}
                      tipo="recebida"
                      solicitacao={solicitacao}
                      loading={acaoId === solicitacao.id}
                      onAccept={(id) =>
                        executarAcao(
                          id,
                          () => apiAceitarSolicitacaoAmizade(id),
                          'Solicitação aceita.',
                        )
                      }
                      onReject={(id) =>
                        executarAcao(
                          id,
                          () => apiRecusarSolicitacaoAmizade(id),
                          'Solicitação recusada.',
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-app-fg/10 text-app-fg">
                  <Icon name="mail" className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-app-fg tracking-tight">Solicitações Enviadas</h2>
              </div>
              {solicitacoes.enviadas.length === 0 ? (
                <EmptyState
                  variant="plain"
                  size="sm"
                  description="Nenhuma solicitação enviada."
                />
              ) : (
                <div className="space-y-3">
                  {solicitacoes.enviadas.map((solicitacao) => (
                    <FriendRequestCard
                      key={solicitacao.id}
                      tipo="enviada"
                      solicitacao={solicitacao}
                      loading={acaoId === solicitacao.id}
                      onCancel={(id) =>
                        executarAcao(
                          id,
                          () => apiCancelarSolicitacaoAmizade(id),
                          'Solicitação cancelada.',
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
