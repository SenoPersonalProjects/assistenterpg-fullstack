'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { NpcAmeacaForm } from '@/components/npc-ameaca/NpcAmeacaForm';
import { NpcAmeacaPageHeader } from '@/components/npc-ameaca/NpcAmeacaPageHeader';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import { Loading } from '@/components/ui/Loading';
import { apiGetNpcAmeaca, apiUpdateNpcAmeaca } from '@/lib/api/npcs-ameacas';
import { extrairMensagemErro } from '@/lib/api/error-handler';
import type { NpcAmeacaDetalhe, UpdateNpcAmeacaPayload } from '@/lib/types';

export default function EditarNpcAmeacaPage() {
  const params = useParams<{ id?: string | string[] }>();
  const router = useRouter();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(idParam);
  const idValido = Number.isFinite(id);

  const [item, setItem] = useState<NpcAmeacaDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!idValido) {
      setErro('ID inválido.');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setErro(null);
        const dados = await apiGetNpcAmeaca(id);
        setItem(dados);
      } catch (error) {
        setErro(extrairMensagemErro(error));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, idValido]);

  async function handleSubmit(payload: UpdateNpcAmeacaPayload) {
    await apiUpdateNpcAmeaca(id, payload);
    router.push(`/npcs-ameacas/${id}`);
  }

  function handleCancel() {
    router.push(`/npcs-ameacas/${id}`);
  }

  if (loading) {
    return (
      <div className="npc-page-shell min-h-screen p-6">
        <Loading message="Carregando ficha..." className="text-app-fg" />
      </div>
    );
  }

  if (erro || !item) {
    return (
      <div className="npc-page-shell min-h-screen p-6">
        <div className="mx-auto max-w-4xl space-y-4">
          <ErrorAlert message={erro ?? 'Ficha não encontrada.'} />
          <Button variant="secondary" onClick={() => router.push('/npcs-ameacas')}>
            <Icon name="back" className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="npc-page-shell min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <NpcAmeacaPageHeader
          title="Editar NPC"
          description={`Ajuste os dados de "${item.nome}" para a cena.`}
          icon="edit"
          actions={
            <Button variant="ghost" onClick={handleCancel}>
              <Icon name="close" className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          }
        />

        <NpcAmeacaForm
          initialValues={item}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Salvar alterações"
        />
      </div>
    </div>
  );
}
