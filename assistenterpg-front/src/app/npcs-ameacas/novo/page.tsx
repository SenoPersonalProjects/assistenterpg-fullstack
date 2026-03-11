'use client';

import { useRouter } from 'next/navigation';
import { NpcAmeacaForm } from '@/components/npc-ameaca/NpcAmeacaForm';
import { NpcAmeacaPageHeader } from '@/components/npc-ameaca/NpcAmeacaPageHeader';
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
    <div className="npc-page-shell min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <NpcAmeacaPageHeader
          title="Novo NPC"
          description="Crie uma ficha simplificada de aliado ou ameaça."
          icon="add"
          actions={
            <Button variant="ghost" onClick={handleCancel}>
              <Icon name="close" className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          }
        />

        <NpcAmeacaForm onSubmit={handleSubmit} onCancel={handleCancel} submitLabel="Criar ficha" />
      </div>
    </div>
  );
}
