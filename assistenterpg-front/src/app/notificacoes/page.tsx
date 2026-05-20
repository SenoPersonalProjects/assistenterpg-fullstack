'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PendingNotificationsPanel } from '@/components/notificacoes/PendingNotificationsPanel';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/context/AuthContext';

export default function NotificacoesPage() {
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !usuario) {
      router.push('/auth/login');
    }
  }, [authLoading, router, usuario]);

  if (authLoading) {
    return (
      <Loading message="Carregando notificações..." className="p-6 text-app-fg" />
    );
  }

  if (!usuario) return null;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-app-bg p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-app-primary/20 bg-app-primary/10 text-app-primary shadow-sm">
              <Icon name="bell" className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-app-fg">
                Notificações
              </h1>
              <p className="mt-1 text-sm text-app-muted">
                Veja pedidos de amizade e convites de campanha pendentes.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push('/home')}
          >
            <Icon name="back" className="mr-2 h-4 w-4" />
            Painel
          </Button>
        </header>

        <PendingNotificationsPanel feedback="inline" />
      </div>
    </main>
  );
}
