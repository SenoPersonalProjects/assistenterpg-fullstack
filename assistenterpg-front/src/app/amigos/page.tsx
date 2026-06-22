'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AddFriendForm } from '@/components/amigos/AddFriendForm';
import { FriendCard } from '@/components/amigos/FriendCard';
import { FriendRequestCard } from '@/components/amigos/FriendRequestCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import { Loading } from '@/components/ui/Loading';
import { SectionTitle } from '@/components/ui/SectionTitle';
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
  criarErroUsuario,
} from '@/lib/api';
import type { AmigoResumo, SolicitacoesAmizade , UserErrorState } from '@/lib/types';

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
  const [erro, setErro] = useState<UserErrorState | null>(null);
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
      setErro(criarErroUsuario(error));
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
      setErro(criarErroUsuario(error));
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
      setErro(criarErroUsuario(error));
    }
  }

  if (authLoading || loading) {
    return <Loading message="Carregando amigos..." className="p-6 text-app-fg" />;
  }

  if (!usuario) return null;

  const totalAmigos = amigosComPresenca.length;
  const amigosOnline = amigosComPresenca.filter((amigo) => amigo.online).length;
  const solicitacoesRecebidas = solicitacoes.recebidas.length;
  const solicitacoesEnviadas = solicitacoes.enviadas.length;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-app-bg p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-app-primary/20 bg-app-primary/10 text-app-primary shadow-sm">
              <Icon name="characters" className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-app-fg">
                Amigos
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-app-muted">
                Adicione amigos, veja quem está online e convide pessoas para suas campanhas.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.push('/home')}
            >
              <Icon name="back" className="mr-2 h-4 w-4" />
              Painel
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={carregar}>
              <Icon name="refresh" className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </header>

        {erro && <ErrorAlert message={erro} />}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card variant="glass" className="!p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-app-muted">
              Amigos
            </p>
            <p className="mt-2 text-3xl font-black text-app-fg">{totalAmigos}</p>
          </Card>
          <Card variant="glass" className="!p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-app-muted">
              Online
            </p>
            <p className="mt-2 text-3xl font-black text-app-success">
              {amigosOnline}
            </p>
          </Card>
          <Card variant="glass" className="!p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-app-muted">
              Recebidas
            </p>
            <p className="mt-2 text-3xl font-black text-app-info">
              {solicitacoesRecebidas}
            </p>
          </Card>
          <Card variant="glass" className="!p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-app-muted">
              Enviadas
            </p>
            <p className="mt-2 text-3xl font-black text-app-secondary">
              {solicitacoesEnviadas}
            </p>
          </Card>
        </section>

        <Card variant="glass" className="!p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <SectionTitle icon="add">Adicionar amigo</SectionTitle>
            <Badge color="blue" size="sm">
              Busca exata
            </Badge>
          </div>
          <AddFriendForm onSubmit={enviarSolicitacao} />
        </Card>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <SectionTitle icon="characters">Amigos</SectionTitle>
              <Badge color="gray" size="sm">
                {totalAmigos}
              </Badge>
            </div>
            {amigosOnline > 0 && (
              <Badge color="green" size="sm">
                {amigosOnline} online
              </Badge>
            )}
          </div>

          {amigosComPresenca.length === 0 ? (
            <EmptyState
              variant="card"
              icon="characters"
              title="Nenhum amigo adicionado"
              description="Envie uma solicitação para começar a montar sua lista de amigos."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <SectionTitle icon="bell">Solicitações recebidas</SectionTitle>
              {solicitacoesRecebidas > 0 && (
                <Badge color="cyan" size="sm">
                  {solicitacoesRecebidas}
                </Badge>
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
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <SectionTitle icon="mail">Solicitações enviadas</SectionTitle>
              {solicitacoesEnviadas > 0 && (
                <Badge color="purple" size="sm">
                  {solicitacoesEnviadas}
                </Badge>
              )}
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
          </div>
        </section>
      </div>
    </main>
  );
}
