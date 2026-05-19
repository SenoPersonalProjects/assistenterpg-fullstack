// app/campanhas/novo/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { apiCreateCampanha } from '@/lib/api';
import { CampaignForm } from '@/components/campanha/CampaignForm';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Loading } from '@/components/ui/Loading';

export default function NovaCampanhaPage() {
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!authLoading && !usuario) {
      router.push('/auth/login');
    }
  }, [authLoading, router, usuario]);

  async function handleCreate(data: { nome: string; descricao?: string }) {
    await apiCreateCampanha(data);
    showToast('Campanha criada.', 'success');
    router.push('/campanhas');
  }

  if (authLoading) {
    return <Loading message="Carregando..." className="p-6 text-app-fg" />;
  }

  if (!usuario) return null;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-app-bg p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-app-primary/10 shadow-inner">
              <Icon name="add" className="h-7 w-7 text-app-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-app-fg">Nova campanha</h1>
              <p className="mt-0.5 text-sm font-medium text-app-muted">
                Crie uma campanha para organizar sessões, personagens e membros.
              </p>
            </div>
          </div>

          <Button variant="ghost" onClick={() => router.push('/campanhas')} className="font-bold">
            <Icon name="close" className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
        </header>

        <Card variant="glass" className="!p-6 md:!p-8">
          <CampaignForm onSubmit={handleCreate} />
        </Card>
      </div>
    </main>
  );
}
