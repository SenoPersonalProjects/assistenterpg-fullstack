// app/campanhas/[id]/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  apiCriarConvite,
  apiGetCampanhaById,
  criarErroUsuario,
  formatarErroComContexto,
} from '@/lib/api';
import {
  CampaignInviteModal,
  CampaignNextSessionBanner,
  CampaignOverviewTab,
  CampaignTabs,
  type CampanhaDetalheDto,
} from '@/components/campanha/CampaignDetailHub';
import {
  normalizarCampaignTab,
  type CampaignTab,
} from '@/lib/campanhas/campaign-tabs.helpers';
import { CampaignMembersSection } from '@/components/campanha/CampaignMembersSection';
import { CampaignCharactersSection } from '@/components/campanha/CampaignCharactersSection';
import { CampaignScheduledSessionsSection } from '@/components/campanha/CampaignScheduledSessionsSection';
import { CampaignSessionsSection } from '@/components/campanha/CampaignSessionsSection';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatsStrip } from '@/components/ui/StatsStrip';

function mensagemErroCarregarCampanha(error: unknown): string {
  const status = Number(
    (error as { status?: number })?.status ??
      (error as { response?: { status?: number } })?.response?.status ??
      (error as { body?: { statusCode?: number } })?.body?.statusCode ??
      0,
  );
  const base = criarErroUsuario(error).message;

  if (status === 404) {
    return formatarErroComContexto('Campanha não encontrada.', error, {
      incluirEndpoint: true,
      incluirRequestId: true,
    });
  }

  if (status === 403) {
    return formatarErroComContexto(
      'Você não tem permissão para acessar esta campanha.',
      error,
      {
        incluirEndpoint: true,
        incluirRequestId: true,
      },
    );
  }

  if (status === 400 || status === 422) {
    return formatarErroComContexto(
      `Não foi possível carregar a campanha. ${base}`,
      error,
      {
        incluirEndpoint: true,
        incluirRequestId: true,
      },
    );
  }

  return formatarErroComContexto(base, error, {
    incluirEndpoint: true,
    incluirRequestId: true,
  });
}

function mensagemErroConvidarMembro(error: unknown): string {
  const status = Number(
    (error as { status?: number })?.status ??
      (error as { response?: { status?: number } })?.response?.status ??
      (error as { body?: { statusCode?: number } })?.body?.statusCode ??
      0,
  );
  const base = criarErroUsuario(error).message;

  if (status === 409) {
    return formatarErroComContexto(
      'Não foi possível enviar o convite. Usuário já é membro.',
      error,
      {
        incluirEndpoint: true,
        incluirRequestId: true,
      },
    );
  }

  if (status === 400 || status === 422) {
    return formatarErroComContexto(
      `Não foi possível enviar o convite. ${base}`,
      error,
      {
        incluirEndpoint: true,
        incluirRequestId: true,
      },
    );
  }

  return formatarErroComContexto(base, error, {
    incluirEndpoint: true,
    incluirRequestId: true,
  });
}

export default function CampanhaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { usuario, loading: authLoading } = useAuth();

  const [campanha, setCampanha] = useState<CampanhaDetalheDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [conviteAberto, setConviteAberto] = useState(false);
  const [resumoRefreshKey, setResumoRefreshKey] = useState(0);
  const abaAtiva = normalizarCampaignTab(searchParams.get('tab'));

  const carregarCampanha = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setErro(null);
    try {
      const data = await apiGetCampanhaById<CampanhaDetalheDto>(id);
      setCampanha(data);
    } catch (error) {
      setErro(mensagemErroCarregarCampanha(error));
      setCampanha(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const atualizarResumoAgenda = useCallback(() => {
    setResumoRefreshKey((atual) => atual + 1);
  }, []);

  const setAbaAtiva = useCallback(
    (tab: CampaignTab) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', tab);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleTotalPersonagensChange = useCallback((total: number) => {
    setCampanha((anterior) => {
      if (!anterior || anterior._count.personagens === total) return anterior;
      return {
        ...anterior,
        _count: {
          ...anterior._count,
          personagens: total,
        },
      };
    });
  }, []);

  const handleTotalSessoesChange = useCallback((total: number) => {
    setCampanha((anterior) => {
      if (!anterior || anterior._count.sessoes === total) return anterior;
      return {
        ...anterior,
        _count: {
          ...anterior._count,
          sessoes: total,
        },
      };
    });
  }, []);

  useEffect(() => {
    if (!authLoading && !usuario) {
      router.push('/auth/login');
      return;
    }
    if (!id || authLoading || !usuario) return;
    void carregarCampanha();
  }, [id, authLoading, usuario, router, carregarCampanha]);

  async function handleInvite(data: {
    email?: string;
    apelido?: string;
    usuarioId?: number;
    papel: 'MESTRE' | 'JOGADOR' | 'OBSERVADOR';
  }) {
    if (!campanha) {
      throw new Error('Campanha não carregada');
    }

    if (usuario?.id !== campanha.donoId) {
      throw new Error('Apenas o dono pode enviar convites');
    }

    try {
      await apiCriarConvite(campanha.id, data);
      setConviteAberto(false);
      await carregarCampanha();
    } catch (error) {
      throw new Error(mensagemErroConvidarMembro(error));
    }
  }

  if (authLoading || loading) {
    return (
      <Loading message="Carregando campanha..." className="p-6 text-app-fg" />
    );
  }

  if (!campanha) {
    return (
      <main className="min-h-screen bg-app-bg p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {erro ? <ErrorAlert message={erro} /> : null}
          {!erro ? (
            <EmptyState
              variant="card"
              icon="campaign"
              title="Campanha não encontrada"
              description="Verifique se o link está correto ou volte para a lista de campanhas."
            />
          ) : null}
          <Button variant="ghost" onClick={() => router.push('/campanhas')}>
            <Icon name="back" className="mr-2 h-4 w-4" />
            Voltar para campanhas
          </Button>
        </div>
      </main>
    );
  }

  const dataCriacao = new Date(campanha.criadoEm).toLocaleDateString('pt-BR');
  const papelDoUsuario =
    campanha.membros.find((membro) => membro.usuarioId === usuario?.id)?.papel ??
    null;
  const usuarioEhDono = usuario?.id === campanha.donoId;
  const usuarioEhMestre = usuarioEhDono || papelDoUsuario === 'MESTRE';

  const corStatus =
    campanha.status === 'ATIVA'
      ? 'green'
      : campanha.status === 'PAUSADA'
        ? 'yellow'
        : 'red';
  const statusTone =
    campanha.status === 'ATIVA'
      ? 'success'
      : campanha.status === 'PAUSADA'
        ? 'warning'
        : 'danger';
  const campaignStats = [
    {
      id: 'membros',
      label: 'Membros',
      value: campanha._count.membros,
      icon: 'characters' as const,
      tone: 'primary' as const,
    },
    {
      id: 'personagens',
      label: 'Personagens',
      value: campanha._count.personagens,
      icon: 'character-gojo' as const,
    },
    {
      id: 'sessoes',
      label: 'Sessões',
      value: campanha._count.sessoes,
      icon: 'scroll' as const,
    },
    {
      id: 'status',
      label: 'Status',
      value: campanha.status,
      icon: 'status' as const,
      tone: statusTone as 'success' | 'warning' | 'danger',
      helper: `Criada em ${dataCriacao}`,
    },
  ];

  return (
    <main className="min-h-screen bg-app-bg pb-12">
      <div className="border-b border-white/5 bg-app-surface/35">
        <div className="mx-auto max-w-7xl space-y-4 px-4 py-5 sm:px-6">
          <PageHeader
            icon="campaign"
            title={campanha.nome}
            eyebrow="Campanha"
            description={
              campanha.descricao ??
              `Mesa de ${campanha.dono.apelido}, criada em ${dataCriacao}.`
            }
            backHref="/campanhas"
            backLabel="Campanhas"
            className="border-b-0 pb-0"
            actions={
              <>
                <Badge color={corStatus} size="sm" variant="outline">
                  {campanha.status}
                </Badge>
                {usuarioEhMestre ? (
                  <Button size="sm" onClick={() => setAbaAtiva('sessoes')}>
                    <Icon name="calendar" className="mr-2 h-4 w-4" />
                    Sessões
                  </Button>
                ) : null}
                {usuarioEhDono ? (
                  <Button size="sm" variant="secondary" onClick={() => setConviteAberto(true)}>
                    <Icon name="add" className="mr-2 h-4 w-4" />
                    Convidar
                  </Button>
                ) : null}
              </>
            }
          />
          <StatsStrip items={campaignStats} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-5 px-4 pt-5 sm:px-6">
        <CampaignNextSessionBanner
          campanhaId={campanha.id}
          refreshKey={resumoRefreshKey}
          onGoToSessions={() => setAbaAtiva('sessoes')}
          onEnterSession={(sessaoId) =>
            router.push(`/campanhas/${campanha.id}/sessoes/${sessaoId}`)
          }
        />

        <CampaignTabs activeTab={abaAtiva} onChange={setAbaAtiva} />

        {abaAtiva === 'visao-geral' ? (
          <CampaignOverviewTab
            campanha={campanha}
            usuarioEhDono={Boolean(usuarioEhDono)}
            onOpenInvite={() => setConviteAberto(true)}
            onChangeTab={setAbaAtiva}
          />
        ) : null}

        {abaAtiva === 'sessoes' ? (
          <section className="space-y-6">
            <CampaignScheduledSessionsSection
              campanhaId={campanha.id}
              usuarioEhMestre={Boolean(usuarioEhMestre)}
              onAgendaChange={atualizarResumoAgenda}
              onSessaoAberta={() => {
                handleTotalSessoesChange(campanha._count.sessoes + 1);
                atualizarResumoAgenda();
              }}
            />
            <CampaignSessionsSection
              campanhaId={campanha.id}
              usuarioEhMestre={Boolean(usuarioEhMestre)}
              onTotalSessoesChange={handleTotalSessoesChange}
              onSessoesChange={atualizarResumoAgenda}
            />
          </section>
        ) : null}

        {abaAtiva === 'personagens' ? (
          <section className="space-y-4">
            <SectionHeader
              icon="character-gojo"
              title="Personagens da campanha"
              description="Fichas vinculadas a esta missão, com recursos e ações de mesa."
            />
            <CampaignCharactersSection
              campanhaId={campanha.id}
              usuarioId={usuario?.id ?? 0}
              usuarioEhMestre={Boolean(usuarioEhMestre)}
              onTotalPersonagensChange={handleTotalPersonagensChange}
            />
          </section>
        ) : null}

        {abaAtiva === 'membros' ? (
          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SectionHeader
                icon="characters"
                title="Membros da campanha"
                description="Participantes, papéis e convites do grupo."
              />
              {usuarioEhDono ? (
                <Button size="sm" onClick={() => setConviteAberto(true)}>
                  <Icon name="add" className="mr-2 h-4 w-4" />
                  Convidar membro
                </Button>
              ) : null}
            </div>
            <CampaignMembersSection
              membros={campanha.membros}
              donoId={campanha.donoId}
            />
          </section>
        ) : null}
      </div>

      <CampaignInviteModal
        isOpen={conviteAberto}
        campanhaId={campanha.id}
        onClose={() => setConviteAberto(false)}
        onInvite={handleInvite}
        onInviteFriend={() => {
          setConviteAberto(false);
          void carregarCampanha();
        }}
      />
    </main>
  );
}
