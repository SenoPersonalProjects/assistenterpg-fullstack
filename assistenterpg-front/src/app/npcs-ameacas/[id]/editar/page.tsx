'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { NpcAmeacaForm } from '@/components/npc-ameaca/NpcAmeacaForm';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { apiGetNpcAmeaca, apiUpdateNpcAmeaca } from '@/lib/api/npcs-ameacas';
import { criarErroUsuario } from '@/lib/api/error-handler';
import type { NpcAmeacaDetalhe, UpdateNpcAmeacaPayload, UserErrorState } from '@/lib/types';

function mensagemErroState(erro: UserErrorState | null | undefined): string {
  if (!erro) return '';
  return typeof erro === 'string' ? erro : erro.message;
}

export default function EditarNpcAmeacaPage() {
  const params = useParams<{ id?: string | string[] }>();
  const router = useRouter();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(idParam);
  const idValido = Number.isFinite(id);

  const [item, setItem] = useState<NpcAmeacaDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<UserErrorState | null>(null);

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
        setErro(criarErroUsuario(error));
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
      <main className="min-h-screen bg-app-bg px-4 py-6 sm:px-6">
        <Loading message="Carregando ficha..." className="text-app-fg" />
      </main>
    );
  }

  if (erro || !item) {
    return (
      <main className="min-h-screen bg-app-bg px-4 py-6 sm:px-6">
        <EmptyState
          variant="card"
          icon="curse"
          title="Ficha não encontrada"
          description={mensagemErroState(erro) || 'A ficha não existe ou você não tem acesso a ela.'}
          action={
            <Button variant="primary" onClick={() => router.push('/npcs-ameacas')}>
              Voltar para NPCs e Ameaças
            </Button>
          }
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-app-bg px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          icon="edit"
          title="Editar NPC/Ameaça"
          description={`Ajuste os dados de "${item.nome}" para a cena.`}
          backHref={`/npcs-ameacas/${item.id}`}
          backLabel="Ficha"
        />

        <NpcAmeacaForm
          initialValues={item}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Salvar alterações"
        />
      </div>
    </main>
  );
}
