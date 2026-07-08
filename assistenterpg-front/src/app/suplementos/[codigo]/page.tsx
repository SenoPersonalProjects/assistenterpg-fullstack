'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  apiAtivarSuplemento,
  apiDeleteSuplemento,
  apiDesativarSuplemento,
  apiGetCatalogosBasicos,
  apiGetSuplementoByCodigo,
  apiGetTodasModificacoes,
  SuplementoCatalogo,
  OrigemCatalogo,
  TrilhaCatalogo,
  TecnicaAmaldicoadaCatalogo,
  HabilidadeCatalogo,
  ModificacaoCatalogo,
  EquipamentoResumoDto,
} from '@/lib/api';
import {
  apiAdminGetTrilhas,
  apiAdminGetTecnicasAmaldicoadas,
  apiAdminGetHabilidades,
  apiAdminGetEquipamentos,
} from '@/lib/api/suplemento-conteudos';
import { criarErroUsuario } from '@/lib/api/error-handler';
import { useConfirm } from '@/hooks/useConfirm';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EntityActionsMenu } from '@/components/ui/EntityActionsMenu';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageToolbar } from '@/components/ui/PageToolbar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatsStrip } from '@/components/ui/StatsStrip';
import { ModalSuplementoForm } from '@/components/suplemento/ModalSuplementoForm';
import type { UserErrorState } from '@/lib/types';

type AbaSuplemento =
  | 'RESUMO'
  | 'ORIGENS'
  | 'PODERES'
  | 'TRILHAS'
  | 'EQUIPAMENTOS'
  | 'TECNICAS'
  | 'MODIFICACOES';

const ABAS: AbaSuplemento[] = [
  'RESUMO',
  'ORIGENS',
  'PODERES',
  'TRILHAS',
  'EQUIPAMENTOS',
  'TECNICAS',
  'MODIFICACOES',
];

const ABA_LABELS: Record<AbaSuplemento, string> = {
  RESUMO: 'Resumo',
  ORIGENS: 'Origens',
  PODERES: 'Poderes',
  TRILHAS: 'Trilhas',
  EQUIPAMENTOS: 'Equipamentos',
  TECNICAS: 'Técnicas',
  MODIFICACOES: 'Modificações',
};

function formatarData(valor?: string) {
  if (!valor) return 'Não informado';
  return new Date(valor).toLocaleDateString('pt-BR');
}

type ContentSectionProps = {
  title: string;
  description: string;
  count?: number;
  children: ReactNode;
};

function ContentSection({ title, description, count, children }: ContentSectionProps) {
  return (
    <section className="space-y-3">
      <SectionHeader title={title} description={description} count={count} icon="book" />
      <div className="rounded-xl border border-white/5 bg-app-surface/45 p-3 sm:p-4">
        {children}
      </div>
    </section>
  );
}

type ContentRowProps = {
  title: string;
  description?: string | null;
  badges?: ReactNode;
  meta?: ReactNode;
};

function ContentRow({ title, description, badges, meta }: ContentRowProps) {
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-lg border border-white/5 bg-app-bg/55 p-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="truncate text-sm font-bold text-app-fg">{title}</p>
        {description ? (
          <p className="line-clamp-2 text-xs font-medium leading-relaxed text-app-muted">
            {description}
          </p>
        ) : null}
        {badges ? <div className="flex flex-wrap gap-1.5 pt-1">{badges}</div> : null}
      </div>
      {meta ? <div className="shrink-0 text-right text-xs text-app-muted">{meta}</div> : null}
    </div>
  );
}

export default function SuplementoDetalhePage() {
  const router = useRouter();
  const params = useParams<{ codigo: string }>();
  const { usuario, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { isOpen, options, confirm, handleClose, handleConfirm } = useConfirm();

  const codigo = typeof params?.codigo === 'string' ? params.codigo : '';

  const [suplemento, setSuplemento] = useState<SuplementoCatalogo | null>(null);
  const [origens, setOrigens] = useState<OrigemCatalogo[]>([]);
  const [poderes, setPoderes] = useState<HabilidadeCatalogo[]>([]);
  const [trilhas, setTrilhas] = useState<TrilhaCatalogo[]>([]);
  const [equipamentos, setEquipamentos] = useState<EquipamentoResumoDto[]>([]);
  const [tecnicas, setTecnicas] = useState<TecnicaAmaldicoadaCatalogo[]>([]);
  const [modificacoes, setModificacoes] = useState<ModificacaoCatalogo[]>([]);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<UserErrorState | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<AbaSuplemento>('RESUMO');
  const [processando, setProcessando] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);

  const carregarConteudo = useCallback(async () => {
    if (!codigo) return;

    try {
      setLoading(true);
      setErro(null);

      const suplementoDados = await apiGetSuplementoByCodigo(codigo);
      const suplementoId = suplementoDados.id;

      const [
        catalogosBasicos,
        trilhasData,
        poderesData,
        equipamentosData,
        tecnicasData,
        modificacoesData,
      ] = await Promise.all([
        apiGetCatalogosBasicos(),
        apiAdminGetTrilhas(),
        apiAdminGetHabilidades({ tipo: 'PODER_GENERICO', suplementoId, pagina: 1, limite: 200 }),
        apiAdminGetEquipamentos({ suplementoId, pagina: 1, limite: 100 }),
        apiAdminGetTecnicasAmaldicoadas({ suplementoId }),
        apiGetTodasModificacoes({ suplementoId, limitePorPagina: 100 }),
      ]);

      setSuplemento(suplementoDados);
      setOrigens(
        (catalogosBasicos.origens ?? []).filter((item) => item.suplementoId === suplementoId),
      );
      setTrilhas((trilhasData ?? []).filter((item) => item.suplementoId === suplementoId));
      setPoderes(poderesData?.items ?? []);
      setEquipamentos(equipamentosData?.items ?? []);
      setTecnicas(
        (Array.isArray(tecnicasData) ? tecnicasData : []).filter(
          (item) => item.suplementoId === suplementoId,
        ),
      );
      setModificacoes(modificacoesData ?? []);
    } catch (error) {
      const mensagem = criarErroUsuario(error);
      setErro(mensagem);
      showToast(mensagem, 'error');
    } finally {
      setLoading(false);
    }
  }, [codigo, showToast]);

  useEffect(() => {
    if (!authLoading && !usuario) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && usuario) {
      carregarConteudo();
    }
  }, [authLoading, usuario, router, carregarConteudo]);

  const totalConteudos =
    origens.length +
    poderes.length +
    trilhas.length +
    equipamentos.length +
    tecnicas.length +
    modificacoes.length;

  const statsItems = useMemo(
    () => [
      {
        id: 'conteudos',
        label: 'Conteúdos',
        value: totalConteudos,
        icon: 'book' as const,
        helper: 'itens carregados',
      },
      {
        id: 'origens',
        label: 'Origens',
        value: origens.length,
        icon: 'story' as const,
      },
      {
        id: 'trilhas',
        label: 'Trilhas',
        value: trilhas.length,
        icon: 'school' as const,
      },
      {
        id: 'tecnicas',
        label: 'Técnicas',
        value: tecnicas.length,
        icon: 'technique' as const,
        tone: 'primary' as const,
      },
      {
        id: 'status',
        label: 'Status',
        value: suplemento?.ativo ? 'Ativo' : suplemento?.status ?? 'Indefinido',
        icon: 'check' as const,
        tone: suplemento?.ativo ? ('success' as const) : ('default' as const),
      },
    ],
    [origens.length, suplemento?.ativo, suplemento?.status, tecnicas.length, totalConteudos, trilhas.length],
  );

  async function handleAtivar() {
    if (!suplemento) return;

    try {
      setProcessando(true);
      await apiAtivarSuplemento(suplemento.id);
      setSuplemento((prev) => (prev ? { ...prev, ativo: true } : prev));
      showToast(`Suplemento "${suplemento.nome}" ativado!`, 'success');
    } catch (error) {
      const mensagem = criarErroUsuario(error);
      showToast(mensagem, 'error');
    } finally {
      setProcessando(false);
    }
  }

  async function handleDesativar() {
    if (!suplemento) return;

    try {
      setProcessando(true);
      await apiDesativarSuplemento(suplemento.id);
      setSuplemento((prev) => (prev ? { ...prev, ativo: false } : prev));
      showToast(`Suplemento "${suplemento.nome}" desativado.`, 'info');
    } catch (error) {
      const mensagem = criarErroUsuario(error);
      showToast(mensagem, 'error');
    } finally {
      setProcessando(false);
    }
  }

  function handleDelete() {
    if (!suplemento) return;

    confirm({
      title: 'Excluir suplemento',
      description: `Tem certeza que deseja excluir "${suplemento.nome}"? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setProcessando(true);
          await apiDeleteSuplemento(suplemento.id);
          showToast('Suplemento excluído com sucesso!', 'success');
          router.push('/suplementos');
        } catch (error) {
          const mensagem = criarErroUsuario(error);
          showToast(mensagem, 'error');
        } finally {
          setProcessando(false);
        }
      },
    });
  }

  function handleModalClose(sucesso?: boolean) {
    setModalEditarAberto(false);
    if (sucesso) {
      void carregarConteudo();
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-app-bg p-6">
        <Loading message="Carregando suplemento..." className="text-app-fg" />
      </div>
    );
  }

  if (!suplemento) {
    return (
      <main className="min-h-screen bg-app-bg px-4 py-6 sm:px-6">
        <EmptyState
          variant="card"
          icon="book"
          title="Suplemento não encontrado"
          description="Não foi possível carregar os dados solicitados."
          actionLabel="Voltar"
          onAction={() => router.push('/suplementos')}
        />
      </main>
    );
  }

  const isAdmin = usuario?.role === 'ADMIN';
  const podeAtivar = suplemento.status === 'PUBLICADO' && !suplemento.ativo;
  const podeDesativar = Boolean(suplemento.ativo);

  const headerActions = (
    <>
      {!isAdmin && podeAtivar ? (
        <Button size="sm" onClick={handleAtivar} disabled={processando}>
          <Icon name={processando ? 'loading' : 'check'} className="mr-2 h-4 w-4" />
          Ativar suplemento
        </Button>
      ) : null}
      {!isAdmin && podeDesativar ? (
        <Button size="sm" variant="secondary" onClick={handleDesativar} disabled={processando}>
          <Icon name={processando ? 'loading' : 'archive'} className="mr-2 h-4 w-4" />
          Desativar
        </Button>
      ) : null}
      {isAdmin ? (
        <EntityActionsMenu
          ariaLabel="Ações administrativas do suplemento"
          items={[
            {
              id: 'edit',
              label: 'Editar',
              icon: 'edit',
              onSelect: () => setModalEditarAberto(true),
              disabled: processando,
            },
            {
              id: 'delete',
              label: processando ? 'Excluindo...' : 'Excluir',
              icon: processando ? 'loading' : 'delete',
              onSelect: handleDelete,
              disabled: processando,
              destructive: true,
            },
          ]}
        />
      ) : null}
    </>
  );

  return (
    <main className="min-h-screen bg-app-bg px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <PageHeader
          icon="book"
          eyebrow="Suplemento oficial"
          title={suplemento.nome}
          description={suplemento.descricao ?? 'Biblioteca oficial de regras e conteúdo adicional.'}
          backHref="/suplementos"
          backLabel="Suplementos"
          actions={headerActions}
        />

        <div className="flex flex-wrap gap-2">
          <Badge color={suplemento.status === 'PUBLICADO' ? 'green' : 'gray'} size="sm">
            {suplemento.status}
          </Badge>
          <Badge color="gray" size="sm">
            Código {suplemento.codigo}
          </Badge>
          <Badge color="gray" size="sm">
            v{suplemento.versao}
          </Badge>
          {suplemento.autor ? (
            <Badge color="blue" size="sm">
              {suplemento.autor}
            </Badge>
          ) : null}
        </div>

        {suplemento.tags && suplemento.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {suplemento.tags.map((tag) => (
              <Badge key={tag} color="blue" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        <StatsStrip items={statsItems} />

        {erro ? <ErrorAlert message={erro} /> : null}

        <PageToolbar className="items-stretch sm:items-center">
          <div className="flex min-w-0 flex-wrap gap-2">
            {ABAS.map((aba) => (
              <Button
                key={aba}
                type="button"
                size="sm"
                variant={abaAtiva === aba ? 'primary' : 'secondary'}
                onClick={() => setAbaAtiva(aba)}
                aria-pressed={abaAtiva === aba}
                className="px-3"
              >
                {ABA_LABELS[aba]}
              </Button>
            ))}
          </div>
        </PageToolbar>

        {abaAtiva === 'RESUMO' ? (
          <ContentSection
            title="Resumo do suplemento"
            description="Visão rápida do conteúdo carregado para consulta."
            count={totalConteudos}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: 'Poderes genéricos', value: poderes.length },
                { label: 'Equipamentos', value: equipamentos.length },
                { label: 'Modificações', value: modificacoes.length },
                { label: 'Criado em', value: formatarData(suplemento.criadoEm) },
                { label: 'Atualizado em', value: formatarData(suplemento.atualizadoEm) },
                { label: 'Publicação', value: suplemento.status },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-white/5 bg-app-bg/55 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-app-muted">
                    {item.label}
                  </p>
                  <p className="mt-1 truncate text-sm font-bold text-app-fg">{item.value}</p>
                </div>
              ))}
            </div>
          </ContentSection>
        ) : null}

        {abaAtiva === 'ORIGENS' ? (
          <ContentSection
            title="Origens"
            description="Históricos e pontos de partida associados ao suplemento."
            count={origens.length}
          >
            {origens.length === 0 ? (
              <EmptyState
                variant="session"
                size="sm"
                icon="info"
                title="Sem origens"
                description="Não há origens associadas a este suplemento."
              />
            ) : (
              <div className="grid gap-2">
                {origens.map((origem) => (
                  <ContentRow key={origem.id} title={origem.nome} description={origem.descricao} />
                ))}
              </div>
            )}
          </ContentSection>
        ) : null}

        {abaAtiva === 'PODERES' ? (
          <ContentSection
            title="Poderes genéricos"
            description="Habilidades disponíveis como conteúdo adicional."
            count={poderes.length}
          >
            {poderes.length === 0 ? (
              <EmptyState
                variant="session"
                size="sm"
                icon="info"
                title="Sem poderes"
                description="Não há poderes genéricos associados a este suplemento."
              />
            ) : (
              <div className="grid gap-2">
                {poderes.map((poder) => (
                  <ContentRow key={poder.id} title={poder.nome} description={poder.descricao} />
                ))}
              </div>
            )}
          </ContentSection>
        ) : null}

        {abaAtiva === 'TRILHAS' ? (
          <ContentSection
            title="Trilhas"
            description="Progressões e caminhos de classe incluídos neste conteúdo."
            count={trilhas.length}
          >
            {trilhas.length === 0 ? (
              <EmptyState
                variant="session"
                size="sm"
                icon="info"
                title="Sem trilhas"
                description="Não há trilhas associadas a este suplemento."
              />
            ) : (
              <div className="grid gap-2">
                {trilhas.map((trilha) => (
                  <ContentRow key={trilha.id} title={trilha.nome} description={trilha.descricao} />
                ))}
              </div>
            )}
          </ContentSection>
        ) : null}

        {abaAtiva === 'EQUIPAMENTOS' ? (
          <ContentSection
            title="Equipamentos"
            description="Itens e recursos prontos para uso em fichas e campanhas."
            count={equipamentos.length}
          >
            {equipamentos.length === 0 ? (
              <EmptyState
                variant="session"
                size="sm"
                icon="info"
                title="Sem equipamentos"
                description="Não há equipamentos associados a este suplemento."
              />
            ) : (
              <div className="grid gap-2 lg:grid-cols-2">
                {equipamentos.map((equipamento) => (
                  <ContentRow
                    key={equipamento.id}
                    title={equipamento.nome}
                    badges={
                      <>
                        <Badge color="gray" size="sm">
                          {equipamento.tipo}
                        </Badge>
                        {equipamento.categoria ? (
                          <Badge color="blue" size="sm">
                            Cat. {equipamento.categoria}
                          </Badge>
                        ) : null}
                      </>
                    }
                  />
                ))}
              </div>
            )}
          </ContentSection>
        ) : null}

        {abaAtiva === 'TECNICAS' ? (
          <ContentSection
            title="Técnicas"
            description="Técnicas amaldiçoadas e variações associadas ao suplemento."
            count={tecnicas.length}
          >
            {tecnicas.length === 0 ? (
              <EmptyState
                variant="session"
                size="sm"
                icon="info"
                title="Sem técnicas"
                description="Não há técnicas associadas a este suplemento."
              />
            ) : (
              <div className="grid gap-2">
                {tecnicas.map((tecnica) => (
                  <ContentRow
                    key={tecnica.id}
                    title={tecnica.nome}
                    description={tecnica.descricao}
                  />
                ))}
              </div>
            )}
          </ContentSection>
        ) : null}

        {abaAtiva === 'MODIFICACOES' ? (
          <ContentSection
            title="Modificações"
            description="Ajustes e extensões aplicáveis ao conteúdo do sistema."
            count={modificacoes.length}
          >
            {modificacoes.length === 0 ? (
              <EmptyState
                variant="session"
                size="sm"
                icon="info"
                title="Sem modificações"
                description="Não há modificações associadas a este suplemento."
              />
            ) : (
              <div className="grid gap-2">
                {modificacoes.map((mod) => (
                  <ContentRow key={mod.id} title={mod.nome} description={mod.descricao} />
                ))}
              </div>
            )}
          </ContentSection>
        ) : null}
      </div>

      <ModalSuplementoForm
        isOpen={modalEditarAberto}
        onClose={handleModalClose}
        suplemento={suplemento}
      />

      {options ? (
        <ConfirmDialog
          isOpen={isOpen}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title={options.title}
          description={options.description}
          confirmLabel={options.confirmLabel}
          cancelLabel={options.cancelLabel}
          variant={options.variant}
        />
      ) : null}
    </main>
  );
}
