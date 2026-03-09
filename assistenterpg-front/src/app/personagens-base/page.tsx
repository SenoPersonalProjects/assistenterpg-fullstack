// app/personagens-base/page.tsx
// UX PADRONIZADA - Igual home + campanhas

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useConfirm } from '@/hooks/useConfirm';
import {
  apiGetMeusPersonagensBase,
  apiDeletePersonagemBase,
  PersonagemBaseResumo,
  extrairMensagemErro,
  traduzirErro,
} from '@/lib/api';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { PersonagemBaseListItem } from '@/components/personagem-base/create/PersonagemBaseListItem';
import { ImportarPersonagemJsonModal } from '@/components/personagem-base/create/ImportarPersonagemJsonModal';
import { resolverListaPaginada } from '@/lib/utils/lista-paginada';

function mensagemErroListaPersonagens(error: unknown, contexto: 'carregar' | 'excluir'): string {
  const status = Number(
    (error as { status?: number })?.status ??
      (error as { response?: { status?: number } })?.response?.status ??
      (error as { body?: { statusCode?: number } })?.body?.statusCode ??
      0,
  );
  const code = (error as { body?: { code?: string } })?.body?.code;
  const base = traduzirErro(code, extrairMensagemErro(error), status);

  if (status === 404) {
    return contexto === 'carregar'
      ? 'Nao foi possivel localizar os personagens deste usuario.'
      : 'Este personagem nao foi encontrado para exclusao.';
  }

  if (status === 400 || status === 422) {
    return contexto === 'carregar'
      ? `Nao foi possivel carregar os personagens. ${base}`
      : `Nao foi possivel excluir o personagem. ${base}`;
  }

  if (status === 403) {
    return 'Voce nao tem permissao para executar esta acao.';
  }

  return base;
}

export default function PersonagensBasePage() {
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();
  const { isOpen, options, confirm, handleClose, handleConfirm } = useConfirm();

  const [personagens, setPersonagens] = useState<PersonagemBaseResumo[]>([]);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItens, setTotalItens] = useState(0);

  useEffect(() => {
    if (!authLoading && !usuario) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && usuario) {
      carregarDados(pagina);
    }
  }, [authLoading, usuario, router, pagina]);

  async function carregarDados(paginaAtual: number) {
    try {
      setErro(null);
      setLoading(true);

      const personagensRes = await apiGetMeusPersonagensBase({
        page: paginaAtual,
        limit: 12,
      });
      const listaResolvida = resolverListaPaginada(paginaAtual, {
        items: personagensRes.items,
        total: personagensRes.total,
        totalPages: personagensRes.totalPages,
      });

      if (listaResolvida.acao === 'ajustar-pagina') {
        setPagina(listaResolvida.pagina);
        return;
      }

      setPersonagens(listaResolvida.items);
      setTotalPaginas(listaResolvida.totalPaginas);
      setTotalItens(listaResolvida.total);
    } catch (e) {
      setErro(mensagemErroListaPersonagens(e, 'carregar'));
    } finally {
      setLoading(false);
    }
  }

  function handleDeleteClick(personagem: PersonagemBaseResumo) {
    confirm({
      title: `Excluir "${personagem.nome}"?`,
      description: 'Esta aÃ§Ã£o Ã© irreversÃ­vel!',
      confirmLabel: 'Sim, excluir',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await apiDeletePersonagemBase(personagem.id);
          await carregarDados(pagina);
        } catch (error) {
          setErro(mensagemErroListaPersonagens(error, 'excluir'));
        }
      },
    });
  }

  if (authLoading || (loading && personagens.length === 0 && totalItens === 0)) {
    return (
      <Loading
        message="Carregando personagens..."
        className="p-6 text-app-fg"
      />
    );
  }

  if (!usuario) return null;

  return (
    <>
      <main className="min-h-screen bg-app-bg p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header - PadrÃ£o home/campanhas */}
          <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-app-primary/10">
                <Icon name="characters" className="w-6 h-6 text-app-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-app-fg">
                  Meus personagens-base
                </h1>
                <p className="text-sm text-app-muted mt-0.5">
                  ({totalItens}) Crie fichas reutilizÃ¡veis para suas campanhas
                </p>
              </div>
            </div>

            <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
              <Button
                variant="secondary"
                onClick={() => setImportModalOpen(true)}
                className="flex-1 sm:flex-none"
              >
                <Icon name="upload" className="w-4 h-4 mr-2" />
                Importar JSON
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/')}
                className="flex-1 sm:flex-none"
              >
                <Icon name="back" className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button 
                variant="primary"
                onClick={() => router.push('/personagens-base/novo')}
                className="flex-1 sm:flex-none"
              >
                <Icon name="add" className="w-4 h-4 mr-2" />
                Novo personagem
              </Button>
            </div>
          </header>

          {/* Erro */}
          {erro && <ErrorAlert message={erro} />}

          {/* Lista */}
          <section>
            <SectionTitle>
              Personagens-base ({totalItens})
            </SectionTitle>

            {loading && personagens.length > 0 && (
              <p className="mt-2 text-sm text-app-muted">Atualizando lista...</p>
            )}
             
            {personagens.length === 0 ? (
              <EmptyState 
                variant="card"
                icon="characters"
                title="Nenhum personagem criado"
                description="Crie seu primeiro personagem-base para usar em campanhas!"
              >
                <Button 
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/personagens-base/novo')}
                  className="mt-4"
                >
                  <Icon name="add" className="w-4 h-4 mr-2" />
                  Criar primeiro personagem
                </Button>
              </EmptyState>
            ) : (
              <div className="grid gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3">
                {personagens.map((p) => (
                  <PersonagemBaseListItem
                    key={p.id}
                    personagem={p}
                    onClick={() => router.push(`/personagens-base/${p.id}`)}
                    onDelete={() => handleDeleteClick(p)}
                  />
                ))}
              </div>
            )}

            {totalPaginas > 1 && (
              <div className="mt-6 flex flex-col gap-3 rounded-lg border border-app-border bg-app-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-app-muted">
                  Pagina {pagina} de {totalPaginas}
                </p>
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={loading || pagina <= 1}
                    onClick={() => setPagina((prev) => Math.max(1, prev - 1))}
                    className="flex-1 sm:flex-none"
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={loading || pagina >= totalPaginas}
                    onClick={() =>
                      setPagina((prev) => Math.min(totalPaginas, prev + 1))
                    }
                    className="flex-1 sm:flex-none"
                  >
                    Proxima
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* Card de ajuda - sÃ³ quando vazio */}
          {personagens.length === 0 && (
            <section>
              <div className="rounded-lg border border-app-border bg-app-surface p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-app-primary/10">
                    <Icon name="info" className="h-6 w-6 text-app-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-app-fg mb-2">
                      O que sÃ£o personagens-base?
                    </h3>
                    <p className="text-sm text-app-muted leading-relaxed mb-4">
                      SÃ£o fichas reutilizÃ¡veis que vocÃª cria uma vez e usa em vÃ¡rias campanhas.
                    </p>
                    <ul className="space-y-2.5 text-sm text-app-muted">
                      <li className="flex items-start gap-2.5">
                        <Icon name="check" className="w-5 h-5 text-app-success flex-shrink-0 mt-0.5" />
                        <span>Defina atributos, classe, clÃ£ e tÃ©cnica inata</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Icon name="check" className="w-5 h-5 text-app-success flex-shrink-0 mt-0.5" />
                        <span>Escolha perÃ­cias e distribua pontos de aprimoramento</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Icon name="check" className="w-5 h-5 text-app-success flex-shrink-0 mt-0.5" />
                        <span>Reutilize em qualquer campanha sem recriar</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Confirm Dialog - PadrÃ£o campanhas */}
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={options?.title ?? ''}
        description={options?.description ?? ''}
        confirmLabel={options?.confirmLabel}
        cancelLabel={options?.cancelLabel}
        variant={options?.variant}
      >
        <div className="rounded border border-app-danger/40 bg-app-danger/5 p-3">
          <p className="text-xs font-semibold text-app-danger mb-2 flex items-center gap-1.5">
            <Icon name="warning" className="w-4 h-4" />
            ATENÃ‡ÃƒO: Esta aÃ§Ã£o Ã© IRREVERSÃVEL!
          </p>
          <ul className="space-y-1 text-xs text-app-danger/90">
            <li>â€¢ Personagem-base excluÃ­do permanentemente</li>
            <li>â€¢ Todas as instÃ¢ncias em campanhas removidas</li>
            <li>â€¢ HistÃ³rico e progresso perdidos</li>
          </ul>
        </div>
      </ConfirmDialog>

      <ImportarPersonagemJsonModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImported={(personagemId) => router.push(`/personagens-base/${personagemId}`)}
      />
    </>
  );
}

