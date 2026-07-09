// app/home/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  apiGetMeusPersonagensBase,
  apiGetMinhasCampanhas,
  apiObterEstatisticas,
} from '@/lib/api';
import { apiGetMeusHomebrews } from '@/lib/api/homebrews';
import { criarErroUsuario } from '@/lib/api/error-handler';
import type {
  CampanhaResumo,
  PersonagemBaseResumo,
  UserErrorState,
} from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon, type IconName } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatsStrip, type StatsStripItem } from '@/components/ui/StatsStrip';

type EstatisticasHome = {
  campanhas: number;
  personagens: number;
  homebrews: number;
  artigosLidos: number;
};

type QuickShortcut = {
  label: string;
  href: string;
  icon: IconName;
  helper: string;
};

const DEFAULT_STATS: EstatisticasHome = {
  campanhas: 0,
  personagens: 0,
  homebrews: 0,
  artigosLidos: 0,
};

const QUICK_SHORTCUTS: QuickShortcut[] = [
  {
    label: 'Campanhas',
    href: '/campanhas',
    icon: 'campaign',
    helper: 'Mesas e sessões',
  },
  {
    label: 'Personagens',
    href: '/personagens-base',
    icon: 'character-gojo',
    helper: 'Fichas base',
  },
  {
    label: 'NPCs e Ameaças',
    href: '/npcs-ameacas',
    icon: 'curse',
    helper: 'Elenco e perigos',
  },
  {
    label: 'Notas',
    href: '/anotacoes',
    icon: 'scroll',
    helper: 'Registros da mesa',
  },
  {
    label: 'Compêndio',
    href: '/compendio',
    icon: 'rules',
    helper: 'Regras rápidas',
  },
  {
    label: 'Mundo',
    href: '/mundo',
    icon: 'map',
    helper: 'Atlas e locais',
  },
];

function obterCorStatusCampanha(
  status: string,
): 'green' | 'yellow' | 'red' | 'purple' {
  if (status === 'ATIVA') return 'green';
  if (status === 'PAUSADA') return 'yellow';
  if (status === 'ENCERRADA') return 'red';
  return 'purple';
}

function formatarStatus(status: string): string {
  return status
    .toLowerCase()
    .split('_')
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(' ');
}

export default function HomePage() {
  const { usuario, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [stats, setStats] = useState<EstatisticasHome>(DEFAULT_STATS);
  const [campanhasRecentes, setCampanhasRecentes] = useState<CampanhaResumo[]>([]);
  const [personagensRecentes, setPersonagensRecentes] = useState<
    PersonagemBaseResumo[]
  >([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<UserErrorState | null>(null);

  useEffect(() => {
    if (!loading && !usuario) {
      router.push('/auth/login');
    }
  }, [loading, usuario, router]);

  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      const [statsData, campanhas, personagens, homebrews] = await Promise.all([
        apiObterEstatisticas(),
        apiGetMinhasCampanhas({ page: 1, limit: 4 }),
        apiGetMeusPersonagensBase({ page: 1, limit: 4 }),
        apiGetMeusHomebrews({ limite: 10 }).catch(() => ({
          items: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        })),
      ]);

      setStats({
        ...statsData,
        homebrews: homebrews.total,
      });

      setCampanhasRecentes(campanhas.items);
      setPersonagensRecentes(personagens.items);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      const mensagem = criarErroUsuario(error);
      setErro(mensagem);
      showToast(mensagem, 'error');
    } finally {
      setCarregando(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!loading && usuario) {
      void carregarDados();
    }
  }, [loading, usuario, carregarDados]);

  if (loading || carregando) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Icon name="spinner" className="mx-auto mb-4 h-10 w-10 text-app-primary" />
          <p className="text-sm font-semibold text-app-muted">
            Carregando central de missões...
          </p>
        </div>
      </div>
    );
  }

  if (!usuario) return null;

  const campanhaPrincipal =
    campanhasRecentes.find((campanha) => campanha.status === 'ATIVA') ??
    campanhasRecentes[0] ??
    null;

  const statsItems: StatsStripItem[] = [
    {
      id: 'campanhas',
      label: 'Campanhas',
      value: stats.campanhas,
      icon: 'campaign',
      tone: 'primary',
    },
    {
      id: 'personagens',
      label: 'Personagens',
      value: stats.personagens,
      icon: 'character-gojo',
      tone: 'default',
    },
    {
      id: 'homebrews',
      label: 'Homebrews',
      value: stats.homebrews,
      icon: 'sparkles',
      tone: 'warning',
    },
    {
      id: 'consultas',
      label: 'Consultas',
      value: stats.artigosLidos,
      icon: 'rules',
      tone: 'success',
    },
  ];

  const continueHref = campanhaPrincipal
    ? `/campanhas/${campanhaPrincipal.id}`
    : '/campanhas/novo';
  const continueLabel = campanhaPrincipal ? 'Continuar campanha' : 'Nova campanha';

  return (
    <main className="min-h-full bg-app-bg px-4 py-5 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          eyebrow="Painel operacional"
          icon="domain"
          title="Central de Missões"
          description={`Retome campanhas, fichas e consultas essenciais sem perder tempo, ${usuario.apelido}.`}
          actions={
            <>
              <Button
                onClick={() => router.push(continueHref)}
                className="w-full gap-2 sm:w-auto"
              >
                <Icon name={campanhaPrincipal ? 'play' : 'add'} className="h-4 w-4" />
                {continueLabel}
              </Button>
              {campanhaPrincipal ? (
                <Button
                  variant="secondary"
                  onClick={() => router.push('/campanhas/novo')}
                  className="w-full gap-2 sm:w-auto"
                >
                  <Icon name="add" className="h-4 w-4" />
                  Nova campanha
                </Button>
              ) : null}
              <Button
                variant="ghost"
                onClick={() => router.push('/compendio')}
                className="w-full gap-2 sm:w-auto"
              >
                <Icon name="rules" className="h-4 w-4" />
                Consultar compêndio
              </Button>
            </>
          }
        />

        {erro ? <ErrorAlert message={erro} /> : null}

        <StatsStrip items={statsItems} />

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
          <div className="space-y-4">
            <SectionHeader
              icon="campaign"
              title="Continuar operacao"
              description="A campanha mais pronta para você retomar agora."
              action={
                <Button variant="ghost" size="sm" onClick={() => router.push('/campanhas')}>
                  Ver campanhas
                </Button>
              }
            />

            {campanhaPrincipal ? (
              <div className="rounded-xl border border-white/5 bg-app-surface/55 p-4 shadow-sm shadow-black/5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-xl font-black tracking-tight text-app-fg md:text-2xl">
                        {campanhaPrincipal.nome}
                      </h2>
                      <Badge
                        color={obterCorStatusCampanha(campanhaPrincipal.status)}
                        variant="subtle"
                        size="sm"
                      >
                        {formatarStatus(campanhaPrincipal.status)}
                      </Badge>
                    </div>

                    <p className="line-clamp-2 max-w-3xl text-sm leading-relaxed text-app-muted">
                      {campanhaPrincipal.descricao?.trim() ||
                        'Sem descrição registrada. Abra a campanha para organizar sessões, personagens e participantes.'}
                    </p>

                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-app-muted">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-app-bg/45 px-2.5 py-1">
                        <Icon name="user" className="h-3.5 w-3.5 text-app-primary" />
                        {campanhaPrincipal.dono.apelido}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-app-bg/45 px-2.5 py-1">
                        <Icon name="characters" className="h-3.5 w-3.5 text-app-muted" />
                        {campanhaPrincipal._count.membros} membros
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-app-bg/45 px-2.5 py-1">
                        <Icon name="id" className="h-3.5 w-3.5 text-app-muted" />
                        {campanhaPrincipal._count.personagens} personagens
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-app-bg/45 px-2.5 py-1">
                        <Icon name="scroll" className="h-3.5 w-3.5 text-app-muted" />
                        {campanhaPrincipal._count.sessoes} sessões
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => router.push(`/campanhas/${campanhaPrincipal.id}`)}
                    className="w-full shrink-0 gap-2 sm:w-auto"
                  >
                    <Icon name="campaign" className="h-4 w-4" />
                    Abrir campanha
                  </Button>
                </div>
              </div>
            ) : (
              <EmptyState
                variant="session"
                size="sm"
                icon="campaign"
                title="Nenhuma campanha em andamento"
                description="Crie uma campanha para reunir mesa, fichas, sessões e registros em um único dossiê."
                action={
                  <Button
                    size="sm"
                    onClick={() => router.push('/campanhas/novo')}
                    className="gap-2"
                  >
                    <Icon name="add" className="h-4 w-4" />
                    Criar campanha
                  </Button>
                }
              />
            )}
          </div>

          <div className="space-y-4">
            <SectionHeader
              icon="grid"
              title="Atalhos rápidos"
              description="Rotas frequentes para preparar ou consultar a mesa."
            />

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {QUICK_SHORTCUTS.map((atalho) => (
                <Link
                  key={atalho.href}
                  href={atalho.href}
                  className="group flex min-w-0 items-center gap-3 rounded-xl border border-white/5 bg-app-surface/45 px-3 py-2.5 transition-colors hover:border-app-primary/25 hover:bg-app-surface/70"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-app-muted-surface text-app-muted transition-colors group-hover:bg-app-primary/10 group-hover:text-app-primary">
                    <Icon name={atalho.icon} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-black text-app-fg">
                      {atalho.label}
                    </span>
                    <span className="block truncate text-xs font-semibold text-app-muted">
                      {atalho.helper}
                    </span>
                  </span>
                  <Icon
                    name="chevron-right"
                    className="h-4 w-4 shrink-0 text-app-muted transition-transform group-hover:translate-x-0.5 group-hover:text-app-primary"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader
            icon="character-gojo"
            title="Personagens recentes"
            count={personagensRecentes.length}
            description="Fichas acessadas recentemente para continuar a preparação."
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/personagens-base')}
              >
                Ver todos
              </Button>
            }
          />

          {personagensRecentes.length === 0 ? (
            <EmptyState
              variant="session"
              size="sm"
              icon="character-gojo"
              title="Nenhum personagem registrado"
              description="Crie sua primeira ficha para deixar um personagem pronto para campanha."
              action={
                <Button
                  size="sm"
                  onClick={() => router.push('/personagens-base/novo')}
                  className="gap-2"
                >
                  <Icon name="add" className="h-4 w-4" />
                  Criar personagem
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {personagensRecentes.map((personagem) => (
                <Link
                  key={personagem.id}
                  href={`/personagens-base/${personagem.id}`}
                  className="group rounded-xl border border-white/5 bg-app-surface/45 p-3 transition-colors hover:border-app-secondary/25 hover:bg-app-surface/70"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-black text-app-fg transition-colors group-hover:text-app-secondary">
                        {personagem.nome}
                      </h3>
                      <p className="mt-1 truncate text-xs font-semibold text-app-muted">
                        {personagem.cla} / {personagem.classe}
                      </p>
                    </div>
                    <Icon
                      name="chevron-right"
                      className="mt-1 h-4 w-4 shrink-0 text-app-muted transition-transform group-hover:translate-x-0.5 group-hover:text-app-secondary"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge color="purple" variant="subtle" size="sm">
                      Nv. {personagem.nivel}
                    </Badge>
                    <Badge color="gray" variant="outline" size="sm">
                      Ficha base
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
