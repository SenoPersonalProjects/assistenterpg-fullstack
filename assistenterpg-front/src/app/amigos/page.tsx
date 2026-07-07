'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AddFriendForm } from '@/components/amigos/AddFriendForm';
import { FriendCard } from '@/components/amigos/FriendCard';
import { FriendRequestCard } from '@/components/amigos/FriendRequestCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { EntityActionsMenu } from '@/components/ui/EntityActionsMenu';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageToolbar } from '@/components/ui/PageToolbar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatsStrip, type StatsStripItem } from '@/components/ui/StatsStrip';
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
import type { AmigoResumo, SolicitacoesAmizade, UserErrorState } from '@/lib/types';

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
  const [busca, setBusca] = useState('');

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

  const termoBusca = busca.trim().toLocaleLowerCase('pt-BR');

  const amigosFiltrados = useMemo(() => {
    if (!termoBusca) return amigosComPresenca;
    return amigosComPresenca.filter((amigo) =>
      amigo.apelido.toLocaleLowerCase('pt-BR').includes(termoBusca),
    );
  }, [amigosComPresenca, termoBusca]);

  const recebidasFiltradas = useMemo(() => {
    if (!termoBusca) return solicitacoes.recebidas;
    return solicitacoes.recebidas.filter((solicitacao) =>
      solicitacao.usuario.apelido.toLocaleLowerCase('pt-BR').includes(termoBusca),
    );
  }, [solicitacoes.recebidas, termoBusca]);

  const enviadasFiltradas = useMemo(() => {
    if (!termoBusca) return solicitacoes.enviadas;
    return solicitacoes.enviadas.filter((solicitacao) =>
      solicitacao.usuario.apelido.toLocaleLowerCase('pt-BR').includes(termoBusca),
    );
  }, [solicitacoes.enviadas, termoBusca]);

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
  const temBusca = termoBusca.length > 0;

  const statsItems: StatsStripItem[] = [
    {
      id: 'friends',
      label: 'Amigos',
      value: totalAmigos,
      icon: 'characters',
      tone: 'primary',
    },
    {
      id: 'online',
      label: 'Online',
      value: amigosOnline,
      icon: 'wifi',
      tone: 'success',
    },
    {
      id: 'received',
      label: 'Recebidas',
      value: solicitacoesRecebidas,
      icon: 'bell',
    },
    {
      id: 'sent',
      label: 'Enviadas',
      value: solicitacoesEnviadas,
      icon: 'mail',
    },
  ];

  return (
    <main className="min-h-full bg-app-bg px-4 py-5 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          eyebrow="Social"
          icon="characters"
          title="Amigos"
          description="Gerencie sua lista de contatos, acompanhe presença online e responda convites de amizade."
          actions={
            <EntityActionsMenu
              ariaLabel="Ações de amigos"
              items={[
                {
                  id: 'refresh',
                  label: 'Atualizar',
                  icon: 'refresh',
                  onSelect: () => void carregar(),
                },
              ]}
            />
          }
        />

        {erro ? <ErrorAlert message={erro} /> : null}

        <StatsStrip items={statsItems} />

        <PageToolbar>
          <div className="min-w-0 flex-1">
            <Input
              label="Busca local"
              placeholder="Buscar por apelido"
              icon="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </div>

          {temBusca ? (
            <Button size="sm" variant="ghost" onClick={() => setBusca('')}>
              Limpar busca
            </Button>
          ) : null}
        </PageToolbar>

        <section className="rounded-xl border border-white/5 bg-app-surface/45 p-4">
          <SectionHeader
            icon="add"
            title="Adicionar amigo"
            description="Envie um convite por email ou apelido exato."
            className="mb-4"
          />
          <AddFriendForm onSubmit={enviarSolicitacao} />
        </section>

        <section className="space-y-4">
          <SectionHeader
            icon="characters"
            title="Amigos"
            count={temBusca ? `${amigosFiltrados.length}/${totalAmigos}` : totalAmigos}
            description={
              amigosOnline > 0
                ? `${amigosOnline} ${amigosOnline === 1 ? 'amigo online' : 'amigos online'} agora.`
                : 'Lista de contatos para convites e campanhas.'
            }
          />

          {amigosFiltrados.length === 0 ? (
            <EmptyState
              variant="card"
              size="sm"
              icon={temBusca ? 'search' : 'characters'}
              title={temBusca ? 'Nenhum amigo encontrado' : 'Nenhum amigo adicionado'}
              description={
                temBusca
                  ? 'Limpe a busca para voltar à lista completa.'
                  : 'Envie uma solicitação para começar a montar sua lista de amigos.'
              }
              action={
                temBusca ? (
                  <Button size="sm" variant="secondary" onClick={() => setBusca('')}>
                    Limpar busca
                  </Button>
                ) : null
              }
            />
          ) : (
            <div className="space-y-3">
              {amigosFiltrados.map((amigo) => (
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

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <SectionHeader
              icon="bell"
              title="Solicitações recebidas"
              count={temBusca ? `${recebidasFiltradas.length}/${solicitacoesRecebidas}` : solicitacoesRecebidas}
              description="Convites aguardando sua resposta."
            />

            {recebidasFiltradas.length === 0 ? (
              <EmptyState
                variant="plain"
                size="sm"
                icon={temBusca ? 'search' : 'bell'}
                description={
                  temBusca
                    ? 'Nenhuma solicitação recebida corresponde à busca.'
                    : 'Nenhuma solicitação recebida.'
                }
              />
            ) : (
              <div className="space-y-3">
                {recebidasFiltradas.map((solicitacao) => (
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
            <SectionHeader
              icon="mail"
              title="Solicitações enviadas"
              count={temBusca ? `${enviadasFiltradas.length}/${solicitacoesEnviadas}` : solicitacoesEnviadas}
              description="Convites enviados que ainda estão pendentes."
            />

            {enviadasFiltradas.length === 0 ? (
              <EmptyState
                variant="plain"
                size="sm"
                icon={temBusca ? 'search' : 'mail'}
                description={
                  temBusca
                    ? 'Nenhuma solicitação enviada corresponde à busca.'
                    : 'Nenhuma solicitação enviada.'
                }
              />
            ) : (
              <div className="space-y-3">
                {enviadasFiltradas.map((solicitacao) => (
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
