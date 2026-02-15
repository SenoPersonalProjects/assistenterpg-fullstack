// app/notificacoes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  apiListarConvitesPendentes,
  apiAceitarConvite,
  apiRecusarConvite,
  ConviteCampanha,
} from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Icon } from '@/components/ui/Icon';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NotificacoesPage() {
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();

  const [convites, setConvites] = useState<ConviteCampanha[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !usuario) {
      router.push('/auth/login');
      return;
    }
    if (authLoading || !usuario) return;

    async function carregar() {
      setLoading(true);
      setErro(null);
      try {

        const data = await apiListarConvitesPendentes();
        setConvites(data);
      } catch {
        setErro('Erro ao carregar notificações');
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [authLoading, usuario, router]);

  async function handleAceitar(codigo: string) {
    try {
      await apiAceitarConvite(codigo);
      setConvites(prev => prev.filter(c => c.codigo !== codigo));
    } catch {
      // opcional: tratar erro com toast/alerta
    }
  }

  async function handleRecusar(codigo: string) {
    try {
      await apiRecusarConvite(codigo);
      setConvites(prev => prev.filter(c => c.codigo !== codigo));
    } catch {
      // opcional: tratar erro com toast/alerta
    }
  }

  if (authLoading || loading) {
    return (
      <Loading
        message="Carregando notificações..."
        className="p-6 text-app-fg"
      />
    );
  }

  if (!usuario) return null;

  return (
    <main className="min-h-screen bg-app-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ✅ Header com ícone e botão voltar */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-app-primary/10">
              <Icon name="bell" className="w-6 h-6 text-app-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-app-fg">
                Notificações
              </h1>
              <p className="text-sm text-app-muted mt-0.5">
                Veja convites pendentes e outras notificações da sua conta.
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
          >
            <Icon name="back" className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </header>

        {/* ✅ Erro no topo, se houver */}
        {erro && <ErrorAlert message={erro} />}

        {/* ✅ Seção de convites de campanha */}
        <section className="space-y-3">
          <SectionTitle>Convites de campanha</SectionTitle>

          {convites.length === 0 ? (
            <EmptyState
              variant="card"
              icon="campaign"
              title="Nenhum convite pendente"
              description="Quando alguém te convidar para uma campanha, o convite vai aparecer aqui."
            />
          ) : (
            <div className="space-y-3">
              {convites.map(convite => {
                const data = new Date(convite.criadoEm).toLocaleDateString(
                  'pt-BR',
                );
                return (
                  <Card
                    key={convite.id}
                    className="flex flex-col gap-3 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-app-muted uppercase tracking-wide mb-1 flex items-center gap-1.5">
                          <Icon name="campaign" className="w-4 h-4" />
                          Convite de campanha
                        </p>
                        <p className="font-semibold text-app-fg">
                          {convite.campanha?.nome ?? 'Campanha'}
                        </p>
                        <p className="text-xs text-app-muted">
                          Convite em {data}
                        </p>
                        {convite.campanha?.dono && (
                          <p className="text-xs text-app-muted">
                            Dono: {convite.campanha.dono.apelido}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleAceitar(convite.codigo)}
                      >
                        Aceitar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRecusar(convite.codigo)}
                      >
                        Recusar
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
