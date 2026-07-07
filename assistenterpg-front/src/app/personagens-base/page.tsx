// app/personagens-base/page.tsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/context/ToastContext';
import {
  apiDeletePersonagemBase,
  apiExportarPersonagemBase,
  apiGetGuiaImportacaoPersonagemBaseJson,
  apiGetMeusPersonagensBase,
  apiGetPersonagemBase,
  criarErroUsuario,
  type PersonagemBaseDetalhe,
  type PersonagemBaseResumo,
} from '@/lib/api';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { EntityActionsMenu } from '@/components/ui/EntityActionsMenu';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageToolbar } from '@/components/ui/PageToolbar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatsStrip, type StatsStripItem } from '@/components/ui/StatsStrip';
import { PersonagemBaseListItem } from '@/components/personagem-base/create/PersonagemBaseListItem';
import { ImportarPersonagemJsonModal } from '@/components/personagem-base/create/ImportarPersonagemJsonModal';
import { PersonagemBasePreviewModal } from '@/components/personagem-base/PersonagemBasePreviewModal';
import { JsonGuideModal } from '@/components/import-export/JsonGuideModal';
import { resolverListaPaginada } from '@/lib/utils/lista-paginada';

function baixarJsonArquivo(conteudo: unknown, arquivo: string) {
  const blob = new Blob([JSON.stringify(conteudo, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = arquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function mensagemErroListaPersonagens(error: unknown, contexto: 'carregar' | 'excluir'): string {
  const status = Number(
    (error as { status?: number })?.status ??
      (error as { response?: { status?: number } })?.response?.status ??
      (error as { body?: { statusCode?: number } })?.body?.statusCode ??
      0,
  );
  const base = criarErroUsuario(error).message;

  if (status === 404) {
    return contexto === 'carregar'
      ? 'Não foi possível localizar os personagens deste usuário.'
      : 'Este personagem não foi encontrado para exclusão.';
  }

  if (status === 400 || status === 422) {
    return contexto === 'carregar'
      ? `Não foi possível carregar os personagens. ${base}`
      : `Não foi possível excluir o personagem. ${base}`;
  }

  if (status === 403) {
    return 'Você não tem permissão para executar esta ação.';
  }

  return base;
}

export default function PersonagensBasePage() {
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { isOpen, options, confirm, handleClose, handleConfirm } = useConfirm();

  const [personagens, setPersonagens] = useState<PersonagemBaseResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [jsonGuideOpen, setJsonGuideOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItens, setTotalItens] = useState(0);
  const [previewAberto, setPreviewAberto] = useState(false);
  const [previewResumo, setPreviewResumo] = useState<PersonagemBaseResumo | null>(null);
  const [previewDetalhe, setPreviewDetalhe] = useState<PersonagemBaseDetalhe | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewErro, setPreviewErro] = useState<string | null>(null);

  const buscaAtiva = busca.trim().length > 0;

  const personagensFiltrados = useMemo(() => {
    if (!buscaAtiva) return personagens;
    const termo = busca.trim().toLowerCase();
    return personagens.filter((personagem) =>
      [personagem.nome, personagem.cla, personagem.classe]
        .join(' ')
        .toLowerCase()
        .includes(termo),
    );
  }, [busca, buscaAtiva, personagens]);

  const classesDistintas = useMemo(
    () => new Set(personagens.map((personagem) => personagem.classe)).size,
    [personagens],
  );

  const maiorNivel = useMemo(
    () => personagens.reduce((maior, personagem) => Math.max(maior, personagem.nivel), 0),
    [personagens],
  );

  const statsItems: StatsStripItem[] = [
    {
      id: 'total',
      label: 'Total',
      value: totalItens,
      icon: 'character-gojo',
      tone: 'primary',
    },
    {
      id: 'carregados',
      label: 'Carregados',
      value: personagens.length,
      icon: 'list',
      tone: 'default',
      helper: 'nesta página',
    },
    {
      id: 'classes',
      label: 'Classes',
      value: classesDistintas,
      icon: 'class',
      tone: 'warning',
      helper: 'nesta página',
    },
    {
      id: 'maior-nivel',
      label: 'Maior nível',
      value: maiorNivel || '-',
      icon: 'chart-up',
      tone: 'success',
      helper: 'nesta página',
    },
  ];

  const carregarDados = useCallback(async (paginaAtual: number) => {
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
  }, []);

  useEffect(() => {
    if (!authLoading && !usuario) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && usuario) {
      void carregarDados(pagina);
    }
  }, [authLoading, carregarDados, pagina, router, usuario]);

  function handleDeleteClick(personagem: PersonagemBaseResumo) {
    confirm({
      title: `Excluir "${personagem.nome}"?`,
      description: 'Esta ação é irreversível.',
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
      setPreviewErro(
        `Não foi possível carregar a pré-visualização. ${criarErroUsuario(error).message}`,
      );
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleExportarPersonagem(personagem: PersonagemBaseResumo) {
    try {
      const exportacao = await apiExportarPersonagemBase(personagem.id);
      baixarJsonArquivo(exportacao, `personagem-base-${personagem.id}.json`);
      showToast(`JSON de "${personagem.nome}" exportado.`, 'success');
    } catch (error) {
      const mensagem = criarErroUsuario(error);
      showToast(mensagem.message, 'error', { support: mensagem });
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
      <main className="min-h-full bg-app-bg px-4 py-5 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <PageHeader
            eyebrow="Fichas"
            icon="character-gojo"
            title="Personagens"
            description="Gerencie fichas reutilizáveis para preparar campanhas e entrar em sessão com agilidade."
            actions={
              <>
                <Button
                  onClick={() => router.push('/personagens-base/novo')}
                  className="w-full gap-2 bg-app-secondary shadow-app-secondary/20 hover:bg-app-secondary-hover sm:w-auto"
                >
                  <Icon name="add" className="h-4 w-4" />
                  Novo personagem
                </Button>
                <EntityActionsMenu
                  ariaLabel="Ações de personagens"
                  items={[
                    {
                      id: 'import',
                      label: 'Importar JSON',
                      icon: 'upload',
                      onSelect: () => setImportModalOpen(true),
                    },
                    {
                      id: 'guide',
                      label: 'Ajuda JSON',
                      icon: 'info',
                      onSelect: () => setJsonGuideOpen(true),
                    },
                  ]}
                />
              </>
            }
          />

          {erro ? <ErrorAlert message={erro} /> : null}

          <StatsStrip items={statsItems} />

          <PageToolbar>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-app-muted">
                Busca local
              </p>
              <div className="w-full sm:max-w-xl">
                <Input
                  icon="search"
                  placeholder="Nome, clã ou classe..."
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {buscaAtiva ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setBusca('')}
                  className="gap-2"
                >
                  <Icon name="close" className="h-4 w-4" />
                  Limpar
                </Button>
              ) : null}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void carregarDados(pagina)}
                disabled={loading}
                className="gap-2"
              >
                <Icon name="refresh" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Atualizando' : 'Atualizar'}
              </Button>
            </div>
          </PageToolbar>

          <section className="space-y-4">
            <SectionHeader
              icon="character-gojo"
              title="Personagens"
              count={buscaAtiva ? personagensFiltrados.length : totalItens}
              description={
                buscaAtiva
                  ? 'Resultado da busca nos personagens carregados nesta página.'
                  : 'Fichas base disponíveis para preview, abertura e reutilização.'
              }
            />

            {totalItens === 0 ? (
              <EmptyState
                variant="session"
                size="sm"
                icon="character-gojo"
                title="Nenhum personagem criado"
                description="Crie uma ficha para usar em campanhas e manter a evolução organizada."
                action={
                  <Button
                    size="sm"
                    onClick={() => router.push('/personagens-base/novo')}
                    className="gap-2 bg-app-secondary hover:bg-app-secondary-hover"
                  >
                    <Icon name="add" className="h-4 w-4" />
                    Criar primeiro personagem
                  </Button>
                }
              />
            ) : personagensFiltrados.length === 0 ? (
              <EmptyState
                variant="session"
                size="sm"
                icon="search"
                title="Nenhum personagem encontrado"
                description="Nenhum personagem carregado nesta página corresponde ao termo buscado."
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setBusca('')}
                    className="gap-2"
                  >
                    <Icon name="close" className="h-4 w-4" />
                    Limpar busca
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {personagensFiltrados.map((personagem) => (
                  <PersonagemBaseListItem
                    key={personagem.id}
                    personagem={personagem}
                    onClick={() => void handleOpenPreview(personagem)}
                    onDelete={() => handleDeleteClick(personagem)}
                    onExport={() => void handleExportarPersonagem(personagem)}
                  />
                ))}
              </div>
            )}

            {totalPaginas > 1 ? (
              <div className="flex flex-col gap-3 rounded-xl border border-white/5 bg-app-surface/45 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
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
              </div>
            ) : null}
          </section>

          <details className="rounded-xl border border-white/5 bg-app-surface/35 p-4 text-sm text-app-muted">
            <summary className="cursor-pointer text-sm font-black text-app-fg">
              O que são personagens-base?
            </summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {[
                { title: 'Criação', text: 'Defina atributos, classe, clã e técnica inata.' },
                { title: 'Evolução', text: 'Distribua perícias e pontos de aprimoramento.' },
                { title: 'Reutilização', text: 'Use a mesma ficha como base em várias mesas.' },
              ].map((item) => (
                <div key={item.title} className="rounded-lg border border-white/5 bg-app-bg/35 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-app-secondary">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-app-muted">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </details>
        </div>
      </main>

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
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-app-danger">
            <Icon name="warning" className="h-4 w-4" />
            Atenção: esta ação é irreversível.
          </p>
          <ul className="space-y-1 text-xs text-app-danger/90">
            <li>Personagem-base excluído permanentemente.</li>
            <li>Todas as instâncias em campanhas serão removidas.</li>
            <li>Histórico e progresso serão perdidos.</li>
          </ul>
        </div>
      </ConfirmDialog>

      <ImportarPersonagemJsonModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImported={(personagemId) => router.push(`/personagens-base/${personagemId}`)}
        onOpenGuide={() => setJsonGuideOpen(true)}
      />
      <JsonGuideModal
        isOpen={jsonGuideOpen}
        onClose={() => setJsonGuideOpen(false)}
        title="Ajuda JSON de personagens"
        loadGuide={apiGetGuiaImportacaoPersonagemBaseJson}
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
