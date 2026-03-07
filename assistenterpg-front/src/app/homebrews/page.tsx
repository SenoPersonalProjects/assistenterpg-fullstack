// src/app/homebrews/page.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/hooks/useConfirm';
import {
  apiGetMeusHomebrews,
  apiDeleteHomebrew,
  apiPublicarHomebrew,
  apiArquivarHomebrew,
  HomebrewResumo,
} from '@/lib/api/homebrews';
import type { FiltrarHomebrewsDto } from '@/lib/api/homebrews';
import { TipoHomebrewConteudo, StatusPublicacao } from '@/lib/types/homebrew-enums';
import { extrairMensagemErro } from '@/lib/api/error-handler';
import { HomebrewCard } from '@/components/homebrew/HomebrewCard';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Card } from '@/components/ui/Card';

export default function HomebrewsPage() {
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { isOpen, options, confirm, handleClose, handleConfirm } = useConfirm();

  const [homebrews, setHomebrews] = useState<HomebrewResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [processando, setProcessando] = useState<number | null>(null);

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const limite = 12;

  // Filtros
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoHomebrewConteudo | 'TODOS'>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<StatusPublicacao | 'TODOS'>('TODOS');
  const filtroNomeRef = useRef(filtroNome);

  const valoresTipoFiltro = useMemo<Array<TipoHomebrewConteudo | 'TODOS'>>(
    () => [
      'TODOS',
      TipoHomebrewConteudo.CLA,
      TipoHomebrewConteudo.TRILHA,
      TipoHomebrewConteudo.CAMINHO,
      TipoHomebrewConteudo.ORIGEM,
      TipoHomebrewConteudo.EQUIPAMENTO,
      TipoHomebrewConteudo.PODER_GENERICO,
      TipoHomebrewConteudo.TECNICA_AMALDICOADA,
    ],
    [],
  );
  const valoresStatusFiltro = useMemo<Array<StatusPublicacao | 'TODOS'>>(
    () => ['TODOS', StatusPublicacao.RASCUNHO, StatusPublicacao.PUBLICADO, StatusPublicacao.ARQUIVADO],
    [],
  );

  const carregarHomebrews = useCallback(async (nomeBusca: string) => {
    try {
      setLoading(true);
      setErro(null);

      const filtros: Omit<FiltrarHomebrewsDto, 'usuarioId'> = {
        pagina: paginaAtual,
        limite,
      };

      if (nomeBusca) filtros.nome = nomeBusca;
      if (filtroTipo !== 'TODOS') filtros.tipo = filtroTipo;
      if (filtroStatus !== 'TODOS') filtros.status = filtroStatus;

      const result = await apiGetMeusHomebrews(filtros);
      setHomebrews(result.items);
      setTotalPaginas(result.totalPages);
    } catch (error) {
      const mensagem = extrairMensagemErro(error);
      setErro(mensagem);
      showToast(mensagem, 'error');
    } finally {
      setLoading(false);
    }
  }, [paginaAtual, filtroTipo, filtroStatus, showToast]);

  useEffect(() => {
    filtroNomeRef.current = filtroNome;
  }, [filtroNome]);

  useEffect(() => {
    if (!authLoading && !usuario) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && usuario) {
      carregarHomebrews(filtroNomeRef.current);
    }
  }, [authLoading, usuario, router, carregarHomebrews]);

  function handleBuscar() {
    setPaginaAtual(1);
    carregarHomebrews(filtroNome);
  }

  async function handlePublicar(homebrew: HomebrewResumo) {
    try {
      setProcessando(homebrew.id);
      await apiPublicarHomebrew(homebrew.id);

      setHomebrews((prev) =>
        prev.map((h) => (h.id === homebrew.id ? { ...h, status: 'PUBLICADO' as StatusPublicacao } : h))
      );

      showToast(`Homebrew "${homebrew.nome}" publicado com sucesso!`, 'success');
    } catch (error) {
      const mensagem = extrairMensagemErro(error);
      showToast(mensagem, 'error');
    } finally {
      setProcessando(null);
    }
  }

  async function handleArquivar(homebrew: HomebrewResumo) {
    try {
      setProcessando(homebrew.id);
      await apiArquivarHomebrew(homebrew.id);

      setHomebrews((prev) =>
        prev.map((h) => (h.id === homebrew.id ? { ...h, status: 'ARQUIVADO' as StatusPublicacao } : h))
      );

      showToast(`Homebrew "${homebrew.nome}" arquivado.`, 'info');
    } catch (error) {
      const mensagem = extrairMensagemErro(error);
      showToast(mensagem, 'error');
    } finally {
      setProcessando(null);
    }
  }

  function handleDeleteClick(homebrew: HomebrewResumo) {
    confirm({
      title: `Excluir homebrew "${homebrew.nome}"?`,
      description: 'Esta ação é irreversível!',
      confirmLabel: 'Sim, excluir',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await apiDeleteHomebrew(homebrew.id);
          setHomebrews((prev) => prev.filter((h) => h.id !== homebrew.id));
          showToast('Homebrew excluído com sucesso!', 'success');
        } catch (error) {
          const mensagem = extrairMensagemErro(error);
          showToast(mensagem, 'error');
        }
      },
    });
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-app-bg p-6">
        <Loading message="Carregando homebrews..." className="text-app-fg" />
      </div>
    );
  }

  if (!usuario) return null;

  return (
    <>
      <div className="min-h-screen bg-app-bg p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-app-primary/10">
                <Icon name="sparkles" className="w-6 h-6 text-app-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-app-fg">Meus Homebrews</h1>
                <p className="text-sm text-app-muted mt-0.5">
                  Crie conteúdo personalizado para suas campanhas
                </p>
              </div>
            </div>

            <Button onClick={() => router.push('/homebrews/novo')}>
              <Icon name="add" className="w-4 h-4 mr-2" />
              Criar Homebrew
            </Button>
          </header>

          {/* Erro */}
          {erro && <ErrorAlert message={erro} />}

          {/* Filtros */}
          <Card>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1">
                <Input
                  placeholder="Buscar por nome..."
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
                />
              </div>

              {/* Tipo */}
                <Select
                  value={filtroTipo}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (valoresTipoFiltro.includes(value as TipoHomebrewConteudo | 'TODOS')) {
                      setFiltroTipo(value as TipoHomebrewConteudo | 'TODOS');
                    }
                  }}
                  className="md:w-48"
                >
                <option value="TODOS">Todos os tipos</option>
                <option value={TipoHomebrewConteudo.CLA}>Clã</option>
                <option value={TipoHomebrewConteudo.TRILHA}>Trilha</option>
                <option value={TipoHomebrewConteudo.CAMINHO}>Caminho</option>
                <option value={TipoHomebrewConteudo.ORIGEM}>Origem</option>
                <option value={TipoHomebrewConteudo.EQUIPAMENTO}>Equipamento</option>
                <option value={TipoHomebrewConteudo.PODER_GENERICO}>Poder Genérico</option>
                <option value={TipoHomebrewConteudo.TECNICA_AMALDICOADA}>Técnica Amaldiçoada</option>
              </Select>

              {/* Status */}
                <Select
                  value={filtroStatus}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (valoresStatusFiltro.includes(value as StatusPublicacao | 'TODOS')) {
                      setFiltroStatus(value as StatusPublicacao | 'TODOS');
                    }
                  }}
                  className="md:w-48"
                >
                <option value="TODOS">Todos os status</option>
                <option value={StatusPublicacao.RASCUNHO}>Rascunho</option>
                <option value={StatusPublicacao.PUBLICADO}>Publicado</option>
                <option value={StatusPublicacao.ARQUIVADO}>Arquivado</option>
              </Select>

              {/* Botão buscar */}
              <Button variant="primary" onClick={handleBuscar}>
                <Icon name="search" className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>
          </Card>

          {/* Lista de homebrews */}
          {homebrews.length === 0 ? (
            <EmptyState
              variant="card"
              icon="sparkles"
              title="Nenhum homebrew encontrado"
              description={
                filtroNome || filtroTipo !== 'TODOS' || filtroStatus !== 'TODOS'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando seu primeiro conteúdo personalizado!'
              }
              actionLabel="Criar Homebrew"
              onAction={() => router.push('/homebrews/novo')}
            />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {homebrews.map((h) => (
                  <HomebrewCard
                    key={h.id}
                    homebrew={h}
                    onEdit={() => router.push(`/homebrews/${h.id}/editar`)}
                    onPublicar={() => handlePublicar(h)}
                    onArquivar={() => handleArquivar(h)}
                    onDelete={() => handleDeleteClick(h)}
                    processando={processando === h.id}
                    isOwner={h.usuarioId === usuario.id}
                  />
                ))}
              </div>

              {/* Paginação */}
              {totalPaginas > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={paginaAtual === 1}
                    onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                  >
                    <Icon name="chevron-left" className="w-4 h-4" />
                  </Button>

                  <span className="text-sm text-app-muted px-4">
                    Página {paginaAtual} de {totalPaginas}
                  </span>

                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={paginaAtual === totalPaginas}
                    onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
                  >
                    <Icon name="chevron-right" className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Card de ajuda */}
          {homebrews.length === 0 && (
            <Card>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-app-primary/10">
                  <Icon name="info" className="h-6 w-6 text-app-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-app-fg mb-2">O que são Homebrews?</h3>
                  <p className="text-sm text-app-muted leading-relaxed mb-4">
                    Homebrews são conteúdos personalizados criados por você: clãs, técnicas, equipamentos e muito mais.
                    Perfeito para adaptar o sistema ao seu estilo de jogo!
                  </p>
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-2.5 text-sm text-app-muted">
                      <Icon name="check" className="w-5 h-5 text-app-success flex-shrink-0 mt-0.5" />
                      <span>Crie conteúdo único para suas campanhas</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-app-muted">
                      <Icon name="check" className="w-5 h-5 text-app-success flex-shrink-0 mt-0.5" />
                      <span>Salve como rascunho e publique quando estiver pronto</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-app-muted">
                      <Icon name="check" className="w-5 h-5 text-app-success flex-shrink-0 mt-0.5" />
                      <span>Edite e versione seu conteúdo ao longo do tempo</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de confirmação */}
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={options?.title ?? ''}
        description={options?.description ?? ''}
        confirmLabel={options?.confirmLabel}
        cancelLabel={options?.cancelLabel}
        variant={options?.variant}
      />
    </>
  );
}
