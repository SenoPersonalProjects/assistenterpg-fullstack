'use client';

import { useRouter } from 'next/navigation';
import { NpcAmeacaForm } from '@/components/npc-ameaca/NpcAmeacaForm';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { apiCreateNpcAmeaca } from '@/lib/api/npcs-ameacas';
import type { CreateNpcAmeacaPayload } from '@/lib/types';

export default function NovoNpcAmeacaPage() {
  const router = useRouter();

  async function handleSubmit(payload: CreateNpcAmeacaPayload) {
    const criado = await apiCreateNpcAmeaca(payload);
    router.push(`/npcs-ameacas/${criado.id}`);
  }

  function handleCancel() {
    router.push('/npcs-ameacas');
  }

  return (
    <div className="min-h-screen bg-app-bg p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-app-primary/10">
              <Icon name="add" className="h-6 w-6 text-app-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-app-fg">Nova ficha NPC/Ameaca</h1>
              <p className="text-sm text-app-muted">
                Preencha os campos simplificados para criar uma ficha.
              </p>
            </div>
          </div>

          <Button variant="ghost" onClick={handleCancel}>
            <Icon name="close" className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </header>

        <NpcAmeacaForm onSubmit={handleSubmit} onCancel={handleCancel} submitLabel="Criar ficha" />
      </div>
    </div>
  );
}
