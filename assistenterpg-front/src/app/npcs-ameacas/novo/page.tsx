'use client';

import { useRouter } from 'next/navigation';
import { NpcAmeacaForm } from '@/components/npc-ameaca/NpcAmeacaForm';
import { PageHeader } from '@/components/ui/PageHeader';
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
    <main className="min-h-screen bg-app-bg px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          icon="curse"
          title="Criar NPC/Ameaça"
          description="Crie uma ficha simplificada de aliado, coadjuvante ou ameaça para mesa."
          backHref="/npcs-ameacas"
          backLabel="NPCs e Ameaças"
        />

        <NpcAmeacaForm onSubmit={handleSubmit} onCancel={handleCancel} submitLabel="Criar ficha" />
      </div>
    </main>
  );
}
