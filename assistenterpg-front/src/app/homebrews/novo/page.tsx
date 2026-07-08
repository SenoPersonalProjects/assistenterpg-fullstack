// src/app/homebrews/novo/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { HomebrewForm } from '@/components/suplemento/HomebrewForm';
import { apiCreateHomebrew } from '@/lib/api/homebrews';
import type { CreateHomebrewDto } from '@/lib/api/homebrews';
import { PageHeader } from '@/components/ui/PageHeader';

export default function NovoHomebrewPage() {
  const router = useRouter();

  async function handleSubmit(data: CreateHomebrewDto) {
    try {
      const homebrew = await apiCreateHomebrew(data);
      router.push(`/homebrews/${homebrew.id}`);
    } catch (error) {
      console.error('[NovoHomebrewPage] Erro ao criar:', error);
      throw error;
    }
  }

  function handleCancel() {
    router.push('/homebrews');
  }

  return (
    <main className="min-h-screen bg-app-bg px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          icon="add"
          title="Criar Homebrew"
          description="Crie conteúdo customizado para suas campanhas mantendo os dados estruturados para importação e uso futuro."
          backHref="/homebrews"
          backLabel="Homebrews"
        />

        <HomebrewForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </main>
  );
}
