'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  apiAceitarConvite,
  apiAceitarSolicitacaoAmizade,
  apiListarConvitesPendentes,
  apiListarSolicitacoesAmizade,
  apiNotificarAmizadesAtualizadas,
  apiNotificarConvitesPendentesAtualizados,
  apiRecusarConvite,
  apiRecusarSolicitacaoAmizade,
  criarErroUsuario,
} from '@/lib/api';
import type { ConviteCampanha, SolicitacaoAmizadeResumo } from '@/lib/types';
import { useToast } from '@/context/ToastContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import { Loading } from '@/components/ui/Loading';

type FeedbackMode = 'inline' | 'toast' | 'none';

type PendingNotificationsPanelProps = {
  compact?: boolean;
  feedback?: FeedbackMode;
  showViewAllAction?: boolean;
  className?: string;
  onTotalsChange?: (total: number) => void;
  onViewAll?: () => void;
};

type ActionId =
  | { tipo: 'convite'; id: string }
  | { tipo: 'amizade'; id: number }
  | null;

function rotuloPapelConvite(papel: ConviteCampanha['papel']): string {
  if (papel === 'MESTRE') return 'Mestre';
  if (papel === 'OBSERVADOR') return 'Observador';
  return 'Jogador';
}

function mensagemErroNotificacao(error: unknown): string {
  return criarErroUsuario(error).message;
}

function formatarData(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR');
}

function publicarTotais(
  convites: ConviteCampanha[],
  solicitacoes: SolicitacaoAmizadeResumo[],
  onTotalsChange?: (total: number) => void,
) {
  apiNotificarConvitesPendentesAtualizados(convites.length);
  apiNotificarAmizadesAtualizadas(solicitacoes.length);
  onTotalsChange?.(convites.length + solicitacoes.length);
}

function actionMatches(action: ActionId, tipo: 'convite', id: string): boolean;
function actionMatches(action: ActionId, tipo: 'amizade', id: number): boolean;
function actionMatches(
  action: ActionId,
  tipo: 'convite' | 'amizade',
  id: string | number,
): boolean {
  return action?.tipo === tipo && action.id === id;
}

export function PendingNotificationsPanel({
  compact = false,
  feedback = 'inline',
  showViewAllAction = false,
  className = '',
  onTotalsChange,
  onViewAll,
}: PendingNotificationsPanelProps) {
  const { showToast } = useToast();
  const [convites, setConvites] = useState<ConviteCampanha[]>([]);
  const [solicitacoesAmizade, setSolicitacoesAmizade] = useState<
    SolicitacaoAmizadeResumo[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [mensagemAcao, setMensagemAcao] = useState<string | null>(null);
  const [acaoEmAndamento, setAcaoEmAndamento] = useState<ActionId>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    setErroAcao(null);

    try {
      const [convitesData, amizadesData] = await Promise.all([
        apiListarConvitesPendentes(),
        apiListarSolicitacoesAmizade(),
      ]);
      const amizadesRecebidas = amizadesData.recebidas;
      setConvites(convitesData);
      setSolicitacoesAmizade(amizadesRecebidas);
      publicarTotais(convitesData, amizadesRecebidas, onTotalsChange);
    } catch (error) {
      setErro(`Erro ao carregar notificações. ${mensagemErroNotificacao(error)}`);
    } finally {
      setLoading(false);
    }
  }, [onTotalsChange]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  function concluirAcao(
    proximoConvites: ConviteCampanha[],
    proximasSolicitacoes: SolicitacaoAmizadeResumo[],
    mensagem: string,
  ) {
    setConvites(proximoConvites);
    setSolicitacoesAmizade(proximasSolicitacoes);
    publicarTotais(proximoConvites, proximasSolicitacoes, onTotalsChange);

    if (feedback === 'toast') {
      showToast(mensagem, 'success');
    } else if (feedback === 'inline') {
      setMensagemAcao(mensagem);
    }
  }

  async function executarAcao(
    action: ActionId,
    acao: () => Promise<void>,
    mensagem: string,
    atualizar: () => {
      convites: ConviteCampanha[];
      solicitacoes: SolicitacaoAmizadeResumo[];
    },
  ) {
    setErroAcao(null);
    setMensagemAcao(null);
    setAcaoEmAndamento(action);

    try {
      await acao();
      const proximo = atualizar();
      concluirAcao(proximo.convites, proximo.solicitacoes, mensagem);
    } catch (error) {
      const mensagemErro = mensagemErroNotificacao(error);
      if (feedback === 'toast') {
        showToast(mensagemErro, 'error');
      } else {
        setErroAcao(mensagemErro);
      }
    } finally {
      setAcaoEmAndamento(null);
    }
  }

  async function aceitarConvite(codigo: string) {
    await executarAcao(
      { tipo: 'convite', id: codigo },
      () => apiAceitarConvite(codigo),
      'Convite aceito.',
      () => ({
        convites: convites.filter((convite) => convite.codigo !== codigo),
        solicitacoes: solicitacoesAmizade,
      }),
    );
  }

  async function recusarConvite(codigo: string) {
    await executarAcao(
      { tipo: 'convite', id: codigo },
      () => apiRecusarConvite(codigo),
      'Convite recusado.',
      () => ({
        convites: convites.filter((convite) => convite.codigo !== codigo),
        solicitacoes: solicitacoesAmizade,
      }),
    );
  }

  async function aceitarAmizade(id: number) {
    await executarAcao(
      { tipo: 'amizade', id },
      () => apiAceitarSolicitacaoAmizade(id),
      'Solicitação de amizade aceita.',
      () => ({
        convites,
        solicitacoes: solicitacoesAmizade.filter(
          (solicitacao) => solicitacao.id !== id,
        ),
      }),
    );
  }

  async function recusarAmizade(id: number) {
    await executarAcao(
      { tipo: 'amizade', id },
      () => apiRecusarSolicitacaoAmizade(id),
      'Solicitação de amizade recusada.',
      () => ({
        convites,
        solicitacoes: solicitacoesAmizade.filter(
          (solicitacao) => solicitacao.id !== id,
        ),
      }),
    );
  }

  if (loading) {
    return (
      <div className={className}>
        <Loading
          message="Carregando notificações..."
          size={compact ? 'sm' : 'md'}
          className={compact ? 'p-6' : 'p-8'}
        />
      </div>
    );
  }

  const totalPendentes = convites.length + solicitacoesAmizade.length;
  const sectionSpacing = compact ? 'space-y-3' : 'space-y-4';
  const cardPadding = compact ? '!p-3' : '!p-4';

  return (
    <div className={`${compact ? 'space-y-4' : 'space-y-6'} ${className}`}>
      {erro && <ErrorAlert message={erro} />}
      {erroAcao && <ErrorAlert message={erroAcao} />}
      {feedback === 'inline' && mensagemAcao && (
        <p className="rounded-md border border-app-success/30 bg-app-success/10 px-3 py-2 text-sm text-app-success">
          {mensagemAcao}
        </p>
      )}

      {totalPendentes === 0 && (
        <EmptyState
          variant={compact ? 'plain' : 'card'}
          size={compact ? 'sm' : 'md'}
          icon="bell"
          title={compact ? undefined : 'Nenhuma notificação pendente'}
          description="Pedidos de amizade e convites de campanha aparecem aqui."
        />
      )}

      {solicitacoesAmizade.length > 0 && (
        <section className={sectionSpacing}>
          <div className="flex items-center justify-between gap-3">
            <h3
              className={`flex items-center gap-2 font-bold text-app-fg ${
                compact ? 'text-sm' : 'text-lg'
              }`}
            >
              <Icon name="characters" className="h-4 w-4 text-app-primary" />
              Solicitações de amizade
            </h3>
            <Badge color="purple" size="sm">
              {solicitacoesAmizade.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {solicitacoesAmizade.map((solicitacao) => {
              const bloqueado = actionMatches(
                acaoEmAndamento,
                'amizade',
                solicitacao.id,
              );

              return (
                <Card
                  key={solicitacao.id}
                  variant="glass"
                  className={`flex flex-col gap-3 ${cardPadding}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-app-muted">
                        <Icon name="characters" className="h-4 w-4" />
                        Pedido de amizade
                      </p>
                      <p className="mt-1 truncate font-semibold text-app-fg">
                        {solicitacao.usuario.apelido}
                      </p>
                      <p className="text-xs text-app-muted">
                        Recebido em {formatarData(solicitacao.criadoEm)}
                      </p>
                    </div>
                    <Badge color="purple" size="sm">
                      Amizade
                    </Badge>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      size={compact ? 'xs' : 'sm'}
                      disabled={bloqueado}
                      onClick={() => aceitarAmizade(solicitacao.id)}
                    >
                      {bloqueado ? 'Processando...' : 'Aceitar'}
                    </Button>
                    <Button
                      size={compact ? 'xs' : 'sm'}
                      variant="ghost"
                      disabled={bloqueado}
                      onClick={() => recusarAmizade(solicitacao.id)}
                    >
                      Recusar
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {convites.length > 0 && (
        <section className={sectionSpacing}>
          <div className="flex items-center justify-between gap-3">
            <h3
              className={`flex items-center gap-2 font-bold text-app-fg ${
                compact ? 'text-sm' : 'text-lg'
              }`}
            >
              <Icon name="campaign" className="h-4 w-4 text-app-primary" />
              Convites de campanha
            </h3>
            <Badge color="blue" size="sm">
              {convites.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {convites.map((convite) => {
              const bloqueado = actionMatches(
                acaoEmAndamento,
                'convite',
                convite.codigo,
              );

              return (
                <Card
                  key={convite.id}
                  variant="glass"
                  className={`flex flex-col gap-3 ${cardPadding}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-app-muted">
                        <Icon name="campaign" className="h-4 w-4" />
                        Convite de campanha
                      </p>
                      <p className="mt-1 truncate font-semibold text-app-fg">
                        {convite.campanha?.nome ?? 'Campanha'}
                      </p>
                      <p className="text-xs text-app-muted">
                        Recebido em {formatarData(convite.criadoEm)}
                      </p>
                      {convite.campanha?.dono && (
                        <p className="text-xs text-app-muted">
                          Dono: {convite.campanha.dono.apelido}
                        </p>
                      )}
                    </div>
                    <Badge color="blue" size="sm">
                      {rotuloPapelConvite(convite.papel)}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      size={compact ? 'xs' : 'sm'}
                      disabled={bloqueado}
                      onClick={() => aceitarConvite(convite.codigo)}
                    >
                      {bloqueado ? 'Processando...' : 'Aceitar'}
                    </Button>
                    <Button
                      size={compact ? 'xs' : 'sm'}
                      variant="ghost"
                      disabled={bloqueado}
                      onClick={() => recusarConvite(convite.codigo)}
                    >
                      Recusar
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {showViewAllAction && onViewAll && (
        <div className="border-t border-app-border pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={onViewAll}
          >
            Ver todas
          </Button>
        </div>
      )}
    </div>
  );
}
