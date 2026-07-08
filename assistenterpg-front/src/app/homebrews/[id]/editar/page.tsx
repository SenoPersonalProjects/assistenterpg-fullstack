// src/app/homebrews/[id]/editar/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { HomebrewForm } from '@/components/suplemento/HomebrewForm';
import { apiGetHomebrew, apiUpdateHomebrew } from '@/lib/api/homebrews';
import type { CreateHomebrewDto, HomebrewDetalhado } from '@/lib/api/homebrews';

export default function EditarHomebrewPage() {
  const params = useParams<{ id?: string | string[] }>();
  const router = useRouter();
  const homebrewIdParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const homebrewId = Number(homebrewIdParam);
  const homebrewIdValido = Number.isFinite(homebrewId);

  const [homebrew, setHomebrew] = useState<HomebrewDetalhado | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!homebrewIdValido) {
      setErro('ID de homebrew inválido.');
      setCarregando(false);
      return;
    }

    (async () => {
      try {
        setCarregando(true);
        const data = await apiGetHomebrew(homebrewId);
        setHomebrew(data);
      } catch (err: unknown) {
        console.error('[EditarHomebrewPage] Erro ao carregar:', err);
        setErro(err instanceof Error ? err.message : 'Erro ao carregar homebrew');
      } finally {
        setCarregando(false);
      }
    })();
  }, [homebrewId, homebrewIdValido]);

  async function handleSubmit(data: CreateHomebrewDto) {
    try {
      await apiUpdateHomebrew(homebrewId, data);
      router.push(`/homebrews/${homebrewId}`);
    } catch (error) {
      console.error('[EditarHomebrewPage] Erro ao salvar:', error);
      throw error;
    }
  }

  function handleCancel() {
    router.push(`/homebrews/${homebrewId}`);
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-app-bg p-6">
        <div className="max-w-4xl mx-auto">
          <Loading message="Carregando homebrew..." />
        </div>
      </div>
    );
  }

  if (erro || !homebrew) {
    return (
      <main className="min-h-screen bg-app-bg px-4 py-6 sm:px-6">
        <EmptyState
          variant="card"
          icon="sparkles"
          title="Homebrew não encontrado"
          description={erro ?? 'Não foi possível carregar o conteúdo para edição.'}
          actionLabel="Voltar para homebrews"
          onAction={() => router.push('/homebrews')}
        />
      </main>
    );
  }

  const initialValues = {
    nome: homebrew.nome,
    descricao: homebrew.descricao ?? '',
    tipo: homebrew.tipo,
    status: homebrew.status,
    tags: homebrew.tags ?? [],
    versao: homebrew.versao,
    dados: homebrew.dados,
  };

  return (
    <main className="min-h-screen bg-app-bg px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          icon="edit"
          title="Editar Homebrew"
          description={homebrew.nome}
          backHref={`/homebrews/${homebrewId}`}
          backLabel="Detalhe"
        />

        <HomebrewForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialValues={initialValues}
        />
      </div>
    </main>
  );
}
