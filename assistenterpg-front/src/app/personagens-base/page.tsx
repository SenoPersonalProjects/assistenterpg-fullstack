// app/personagens-base/page.tsx
// UX PADRONIZADA - Igual home + campanhas

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useConfirm } from '@/hooks/useConfirm';
import {
  apiGetMeusPersonagensBase,
  apiGetPersonagemBase,
  apiDeletePersonagemBase,
  PersonagemBaseDetalhe,
  PersonagemBaseResumo,
  extrairMensagemErro,
  traduzirErro,
} from '@/lib/api';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { PersonagemBaseListItem } from '@/components/personagem-base/create/PersonagemBaseListItem';
import { ImportarPersonagemJsonModal } from '@/components/personagem-base/create/ImportarPersonagemJsonModal';
import { PersonagemBasePreviewModal } from '@/components/personagem-base/PersonagemBasePreviewModal';
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
  const [previewAberto, setPreviewAberto] = useState(false);
  const [previewResumo, setPreviewResumo] = useState<PersonagemBaseResumo | null>(null);
  const [previewDetalhe, setPreviewDetalhe] = useState<PersonagemBaseDetalhe | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewErro, setPreviewErro] = useState<string | null>(null);

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
      description: 'Esta ação é irreversível!',
      confirmLabel: 'Sim, excluir',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await apiDeletePersonagemBase(personagem.id);
          if (previewResumo?.id === personagem.id) {
            setPreviewAberto(false);
            setPreviewResumo(null);
            setPreviewDetalhe(null);
          }
          await carregarDados(pagina);
        } catch (error) {
          setErro(mensagemErroListaPersonagens(error, 'excluir'));
        }
      },
    });
  }

  function handlePreviewClose() {
    setPreviewAberto(false);
    setPreviewErro(null);
    setPreviewLoading(false);
  }

  function handlePreviewOpenFull() {
    if (!previewResumo) return;
    handlePreviewClose();
    router.push(`/personagens-base/${previewResumo.id}`);
  }

  async function handleOpenPreview(personagem: PersonagemBaseResumo) {
    setPreviewAberto(true);
    setPreviewResumo(personagem);
    setPreviewDetalhe(null);
    setPreviewErro(null);
    setPreviewLoading(true);

    try {
      const detalhe = await apiGetPersonagemBase(personagem.id, false);
      setPreviewDetalhe(detalhe);
    } catch (error) {
      setPreviewErro(`Nao foi possivel carregar a pre-visualizacao. ${extrairMensagemErro(error)}`);
    } finally {
      setPreviewLoading(false);
    }
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
      <main className="min-h-[calc(100vh-4rem)] bg-app-bg p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header - Premium */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-app-secondary/10 shadow-inner">
                <Icon name="characters" className="w-8 h-8 text-app-secondary" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-app-fg tracking-tight">Personagens</h1>
                <p className="text-app-muted font-medium mt-0.5">
                  ({totalItens}) Crie e gerencie fichas reutilizáveis para suas campanhas.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="glass"
                size="sm"
                onClick={() => setImportModalOpen(true)}
                className="font-bold"
              >
                <Icon name="upload" className="w-4 h-4 mr-2" />
                Importar JSON
              </Button>
              <Button 
                variant="primary"
                onClick={() => router.push('/personagens-base/novo')}
                className="font-black bg-app-secondary hover:bg-app-secondary-hover shadow-lg shadow-app-secondary/30"
              >
                <Icon name="add" className="w-4 h-4 mr-2" />
                Novo personagem
              </Button>
            </div>
          </header>

          {erro && <ErrorAlert message={erro} />}

          {/* Lista e Filtros */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <SectionTitle icon="characters">
                Personagens
                <Badge color="purple" size="sm" variant="subtle" className="ml-3">
                  {totalItens}
                </Badge>
              </SectionTitle>

              {loading && personagens.length > 0 && (
                <div className="flex items-center gap-2 text-xs font-bold text-app-muted animate-pulse">
                  <div className="w-2 h-2 bg-app-secondary rounded-full" />
                  Atualizando...
                </div>
              )}
            </div>
             
            {personagens.length === 0 ? (
              <EmptyState 
                variant="card"
                lottie="GHOST_SEARCH"
                title="Nenhum personagem criado"
                description="Você ainda não criou nenhum personagem. Crie uma ficha para usar em campanhas."
              >
                <Button 
                  variant="primary"
                  size="md"
                  onClick={() => router.push('/personagens-base/novo')}
                  className="mt-4 bg-app-secondary hover:bg-app-secondary-hover font-black"
                >
                  <Icon name="add" className="w-4 h-4 mr-2" />
                  Criar primeiro personagem
                </Button>
              </EmptyState>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {personagens.map((p) => (
                  <PersonagemBaseListItem
                    key={p.id}
                    personagem={p}
                    onClick={() => void handleOpenPreview(p)}
                    onDelete={() => handleDeleteClick(p)}
                  />
                ))}
              </div>
            )}

            {totalPaginas > 1 && (
              <Card variant="flat" className="flex items-center justify-between px-6 py-4 mt-8">
                <p className="text-sm font-bold text-app-muted">
                  Página {pagina} de {totalPaginas}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={loading || pagina <= 1}
                    onClick={() => setPagina((prev) => Math.max(1, prev - 1))}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={loading || pagina >= totalPaginas}
                    onClick={() =>
                      setPagina((prev) => Math.min(totalPaginas, prev + 1))
                    }
                  >
                    Próxima
                  </Button>
                </div>
              </Card>
            )}
          </section>

          {/* Guia Rápido */}
          <Card variant="glass" className="!p-8">
            <div className="flex items-start gap-6">
              <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-app-secondary/10 text-app-secondary shadow-inner">
                <Icon name="info" className="h-8 w-8" />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-black text-app-fg">
                  O que são personagens-base?
                </h3>
                <p className="text-app-muted font-medium leading-relaxed max-w-2xl">
                  São fichas reutilizáveis que você cria uma vez e pode usar em várias campanhas.
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { title: 'Criação', text: 'Defina atributos, classe, clã e técnica inata.' },
                    { title: 'Evolução', text: 'Distribua perícias e pontos de aprimoramento.' },
                    { title: 'Reutilização', text: 'Use o mesmo personagem em várias mesas.' },
                  ].map((item) => (
                    <div key={item.title} className="space-y-1">
                      <p className="text-sm font-black text-app-secondary uppercase tracking-widest">{item.title}</p>
                      <p className="text-xs text-app-muted font-medium leading-tight">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Confirm Dialog - Padrão campanhas */}
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
            ATENÇÃO: Esta ação é IRREVERSÍVEL!
          </p>
          <ul className="space-y-1 text-xs text-app-danger/90">
            <li>• Personagem-base excluído permanentemente</li>
            <li>• Todas as instâncias em campanhas removidas</li>
            <li>• Histórico e progresso perdidos</li>
          </ul>
        </div>
      </ConfirmDialog>

      <ImportarPersonagemJsonModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImported={(personagemId) => router.push(`/personagens-base/${personagemId}`)}
      />

      <PersonagemBasePreviewModal
        isOpen={previewAberto}
        onClose={handlePreviewClose}
        resumo={previewResumo}
        detalhe={previewDetalhe}
        loading={previewLoading}
        error={previewErro}
        onOpenFull={handlePreviewOpenFull}
      />
    </>
  );
}
