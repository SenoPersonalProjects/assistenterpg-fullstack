// src/app/homebrews/[id]/editar/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { HomebrewForm } from '@/components/suplemento/HomebrewForm';
import { apiGetHomebrew, apiUpdateHomebrew } from '@/lib/api/homebrews';
import type { CreateHomebrewDto, HomebrewDetalhado } from '@/lib/api/homebrews';

type Props = {
  params: {
    id: string;
  };
};

export default function EditarHomebrewPage({ params }: Props) {
  const router = useRouter();
  const homebrewId = Number(params.id);

  const [homebrew, setHomebrew] = useState<HomebrewDetalhado | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
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
  }, [homebrewId]);

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
      <div className="min-h-screen bg-app-bg p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <ErrorAlert message={erro ?? 'Homebrew não encontrado'} />
          <Button variant="secondary" onClick={() => router.push('/homebrews')}>
            <Icon name="back" className="w-4 h-4 mr-2" />
            Voltar para homebrews
          </Button>
        </div>
      </div>
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
    <div className="min-h-screen bg-app-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-app-primary/10">
              <Icon name="edit" className="w-6 h-6 text-app-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-app-fg">Editar Homebrew</h1>
              <p className="text-sm text-app-muted mt-0.5">{homebrew.nome}</p>
            </div>
          </div>

          <Button variant="ghost" onClick={() => router.push(`/homebrews/${homebrewId}`)}>
            <Icon name="close" className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </header>

        {/* Formulário */}
        <HomebrewForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialValues={initialValues}
        />
      </div>
    </div>
  );
}
