'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { NpcAmeacaForm } from '@/components/npc-ameaca/NpcAmeacaForm';
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
      setErro('ID invalido.');
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
      <div className="min-h-screen bg-app-bg p-6">
        <Loading message="Carregando ficha..." className="text-app-fg" />
      </div>
    );
  }

  if (erro || !item) {
    return (
      <div className="min-h-screen bg-app-bg p-6">
        <div className="mx-auto max-w-4xl space-y-4">
          <ErrorAlert message={erro ?? 'Ficha nao encontrada.'} />
          <Button variant="secondary" onClick={() => router.push('/npcs-ameacas')}>
            <Icon name="back" className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-app-primary/10">
              <Icon name="edit" className="h-6 w-6 text-app-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-app-fg">Editar NPC/Ameaca</h1>
              <p className="text-sm text-app-muted">{item.nome}</p>
            </div>
          </div>

          <Button variant="ghost" onClick={handleCancel}>
            <Icon name="close" className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </header>

        <NpcAmeacaForm
          initialValues={item}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Salvar alteracoes"
        />
      </div>
    </div>
  );
}
