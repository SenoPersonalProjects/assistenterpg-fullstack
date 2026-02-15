// src/app/homebrews/novo/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { HomebrewForm } from '@/components/suplemento/HomebrewForm';
import { apiCreateHomebrew } from '@/lib/api/homebrews';
import type { CreateHomebrewDto } from '@/lib/api/homebrews';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';

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
    <div className="min-h-screen bg-app-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-app-primary/10">
              <Icon name="add" className="w-6 h-6 text-app-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-app-fg">Criar Homebrew</h1>
              <p className="text-sm text-app-muted mt-0.5">
                Crie conteúdo customizado para suas campanhas
              </p>
            </div>
          </div>

          <Button variant="ghost" onClick={() => router.push('/homebrews')}>
            <Icon name="close" className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </header>

        {/* Formulário */}
        <HomebrewForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}
