// app/notificacoes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  apiAceitarConvite,
  apiListarConvitesPendentes,
  apiNotificarConvitesPendentesAtualizados,
  apiRecusarConvite,
  ConviteCampanha,
  extrairMensagemErro,
  traduzirErro,
} from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Icon } from '@/components/ui/Icon';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';

function rotuloPapelConvite(papel: ConviteCampanha['papel']): string {
  if (papel === 'MESTRE') return 'Mestre';
  if (papel === 'OBSERVADOR') return 'Observador';
  return 'Jogador';
}

function mensagemErroConvites(error: unknown): string {
  const status = Number(
    (error as { status?: number })?.status ??
      (error as { response?: { status?: number } })?.response?.status ??
      (error as { body?: { statusCode?: number } })?.body?.statusCode ??
      0,
  );
  const code = (error as { body?: { code?: string } })?.body?.code;
  return traduzirErro(code, extrairMensagemErro(error), status);
}

export default function NotificacoesPage() {
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();

  const [convites, setConvites] = useState<ConviteCampanha[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [mensagemAcao, setMensagemAcao] = useState<string | null>(null);
  const [codigoEmAcao, setCodigoEmAcao] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !usuario) {
      router.push('/auth/login');
      return;
    }
    if (authLoading || !usuario) return;

    async function carregar() {
      setLoading(true);
      setErro(null);
      setErroAcao(null);
      try {
        const data = await apiListarConvitesPendentes();
        setConvites(data);
      } catch (error) {
        setErro(`Erro ao carregar notificacoes. ${mensagemErroConvites(error)}`);
      } finally {
        setLoading(false);
      }
    }

    void carregar();
  }, [authLoading, usuario, router]);

  async function handleAceitar(codigo: string) {
    setErroAcao(null);
    setMensagemAcao(null);
    setCodigoEmAcao(codigo);

    try {
      await apiAceitarConvite(codigo);
      setConvites((prev) => {
        const proximo = prev.filter((convite) => convite.codigo !== codigo);
        apiNotificarConvitesPendentesAtualizados(proximo.length);
        return proximo;
      });
      setMensagemAcao('Convite aceito com sucesso.');
    } catch (error) {
      setErroAcao(`Nao foi possivel aceitar o convite. ${mensagemErroConvites(error)}`);
    } finally {
      setCodigoEmAcao(null);
    }
  }

  async function handleRecusar(codigo: string) {
    setErroAcao(null);
    setMensagemAcao(null);
    setCodigoEmAcao(codigo);

    try {
      await apiRecusarConvite(codigo);
      setConvites((prev) => {
        const proximo = prev.filter((convite) => convite.codigo !== codigo);
        apiNotificarConvitesPendentesAtualizados(proximo.length);
        return proximo;
      });
      setMensagemAcao('Convite recusado com sucesso.');
    } catch (error) {
      setErroAcao(`Nao foi possivel recusar o convite. ${mensagemErroConvites(error)}`);
    } finally {
      setCodigoEmAcao(null);
    }
  }

  if (authLoading || loading) {
    return (
      <Loading message="Carregando notificacoes..." className="p-6 text-app-fg" />
    );
  }

  if (!usuario) return null;

  return (
    <main className="min-h-screen bg-app-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-app-primary/10">
              <Icon name="bell" className="w-6 h-6 text-app-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-app-fg">Notificacoes</h1>
              <p className="text-sm text-app-muted mt-0.5">
                Veja convites pendentes e outras notificacoes da sua conta.
              </p>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={() => router.push('/home')}>
            <Icon name="back" className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </header>

        {erro && <ErrorAlert message={erro} />}
        {erroAcao && <ErrorAlert message={erroAcao} />}
        {mensagemAcao && (
          <p className="text-sm text-app-success rounded-md border border-app-success/30 bg-app-success/10 px-3 py-2">
            {mensagemAcao}
          </p>
        )}

        <section className="space-y-3">
          <SectionTitle>Convites de campanha</SectionTitle>

          {convites.length === 0 ? (
            <EmptyState
              variant="card"
              icon="campaign"
              title="Nenhum convite pendente"
              description="Quando alguem te convidar para uma campanha, o convite vai aparecer aqui."
            />
          ) : (
            <div className="space-y-3">
              {convites.map((convite) => {
                const data = new Date(convite.criadoEm).toLocaleDateString('pt-BR');
                const bloqueado = codigoEmAcao === convite.codigo;

                return (
                  <Card key={convite.id} className="flex flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-app-muted uppercase tracking-wide mb-1 flex items-center gap-1.5">
                          <Icon name="campaign" className="w-4 h-4" />
                          Convite de campanha
                        </p>
                        <p className="font-semibold text-app-fg">
                          {convite.campanha?.nome ?? 'Campanha'}
                        </p>
                        <p className="text-xs text-app-muted">Convite em {data}</p>
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
                    <div className="flex flex-wrap gap-2 justify-end">
                      <Button
                        size="sm"
                        disabled={bloqueado}
                        onClick={() => handleAceitar(convite.codigo)}
                      >
                        {bloqueado ? 'Processando...' : 'Aceitar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={bloqueado}
                        onClick={() => handleRecusar(convite.codigo)}
                      >
                        {bloqueado ? 'Processando...' : 'Recusar'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
