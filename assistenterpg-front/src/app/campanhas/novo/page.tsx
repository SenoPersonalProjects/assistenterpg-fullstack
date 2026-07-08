// app/campanhas/novo/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { apiCreateCampanha } from '@/lib/api';
import { CampaignForm } from '@/components/campanha/CampaignForm';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';

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
    <main className="min-h-[calc(100vh-4rem)] bg-app-bg px-4 py-6 md:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          icon="add"
          title="Nova campanha"
          description="Crie uma mesa para organizar sessões, personagens e membros."
          backHref="/campanhas"
          backLabel="Campanhas"
        />

        <CampaignForm onSubmit={handleCreate} onCancel={() => router.push('/campanhas')} />
      </div>
    </main>
  );
}
