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
import { Card } from '@/components/ui/Card';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon, type IconName } from '@/components/ui/Icon';

type EstatisticasHome = {
  campanhas: number;
  personagens: number;
  homebrews: number;
  artigosLidos: number;
};

type HomeTone = 'primary' | 'secondary' | 'orange' | 'green' | 'cyan' | 'red';

type HomeAction = {
  label: string;
  href: string;
  icon: IconName;
  description: string;
  tone: HomeTone;
};

type HomeSummary = {
  label: string;
  value: number;
  icon: IconName;
  tone: HomeTone;
};

const DEFAULT_STATS: EstatisticasHome = {
  campanhas: 0,
  personagens: 0,
  homebrews: 0,
  artigosLidos: 0,
};

const TONE_STYLES: Record<
  HomeTone,
  {
    icon: string;
    glow: string;
    border: string;
    text: string;
    accent: string;
  }
> = {
  primary: {
    icon: 'bg-app-primary/10 text-app-primary border-app-primary/25',
    glow: 'bg-app-primary/15',
    border: 'hover:border-app-primary/50',
    text: 'text-app-primary',
    accent: 'bg-app-primary',
  },
  secondary: {
    icon: 'bg-app-secondary/10 text-app-secondary border-app-secondary/25',
    glow: 'bg-app-secondary/15',
    border: 'hover:border-app-secondary/50',
    text: 'text-app-secondary',
    accent: 'bg-app-secondary',
  },
  orange: {
    icon: 'bg-app-orange/10 text-app-orange border-app-orange/25',
    glow: 'bg-app-orange/15',
    border: 'hover:border-app-orange/50',
    text: 'text-app-orange',
    accent: 'bg-app-orange',
  },
  green: {
    icon: 'bg-app-success/10 text-app-success border-app-success/25',
    glow: 'bg-app-success/15',
    border: 'hover:border-app-success/50',
    text: 'text-app-success',
    accent: 'bg-app-success',
  },
  cyan: {
    icon: 'bg-app-info/10 text-app-info border-app-info/25',
    glow: 'bg-app-info/15',
    border: 'hover:border-app-info/50',
    text: 'text-app-info',
    accent: 'bg-app-info',
  },
  red: {
    icon: 'bg-app-danger/10 text-app-danger border-app-danger/25',
    glow: 'bg-app-danger/15',
    border: 'hover:border-app-danger/50',
    text: 'text-app-danger',
    accent: 'bg-app-danger',
  },
};

const HERO_ACTIONS: Array<Pick<HomeAction, 'label' | 'href' | 'icon'>> = [
  { label: 'Continuar campanha', href: '/campanhas', icon: 'campaign' },
  { label: 'Abrir personagens', href: '/personagens-base', icon: 'character-gojo' },
  { label: 'Consultar compêndio', href: '/compendio', icon: 'rules' },
];

const SESSION_TOOLS: HomeAction[] = [
  {
    label: 'Nova campanha',
    href: '/campanhas/novo',
    icon: 'campaign',
    description: 'Abra um novo dossiê para reunir mesa, fichas e sessões.',
    tone: 'primary',
  },
  {
    label: 'Novo personagem',
    href: '/personagens-base/novo',
    icon: 'character-gojo',
    description: 'Registre um xamã com clã, classe e técnica preparada.',
    tone: 'secondary',
  },
  {
    label: 'Criar NPC/Ameaça',
    href: '/npcs-ameacas/novo',
    icon: 'curse',
    description: 'Prepare alvos, maldições e obstáculos para a próxima cena.',
    tone: 'red',
  },
  {
    label: 'Novo homebrew',
    href: '/homebrews/novo',
    icon: 'sparkles',
    description: 'Materialize regras, itens e conteúdo próprio da mesa.',
    tone: 'orange',
  },
  {
    label: 'Anotações',
    href: '/anotacoes',
    icon: 'scroll',
    description: 'Organize pistas, segredos e registros da investigação.',
    tone: 'green',
  },
  {
    label: 'Configurações',
    href: '/configuracoes',
    icon: 'settings',
    description: 'Ajuste conta, preferências e segurança do operador.',
    tone: 'cyan',
  },
];

const RULE_GUIDES: HomeAction[] = [
  {
    label: 'Compêndio',
    href: '/compendio',
    icon: 'rules',
    description: 'Regras, artigos e consultas rápidas para a mesa.',
    tone: 'primary',
  },
  {
    label: 'Suplementos',
    href: '/suplementos',
    icon: 'book',
    description: 'Fontes de conteúdo, classes, clãs e opções oficiais.',
    tone: 'secondary',
  },
  {
    label: 'NPCs e Ameaças',
    href: '/npcs-ameacas',
    icon: 'curse',
    description: 'Arquivo de oponentes, aliados e entidades de cena.',
    tone: 'red',
  },
  {
    label: 'Homebrews',
    href: '/homebrews',
    icon: 'sparkles',
    description: 'Conteúdo personalizado publicado ou em preparação.',
    tone: 'orange',
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
      <div className="flex min-h-screen items-center justify-center bg-app-bg">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-app-primary" />
          <p className="text-app-fg">Carregando central de missões...</p>
        </div>
      </div>
    );
  }

  if (!usuario) return null;

  const campanhaPrincipal =
    campanhasRecentes.find((campanha) => campanha.status === 'ATIVA') ??
    campanhasRecentes[0] ??
    null;

  const resumoArquivo: HomeSummary[] = [
    {
      label: 'Campanhas',
      value: stats.campanhas,
      icon: 'campaign',
      tone: 'primary',
    },
    {
      label: 'Personagens',
      value: stats.personagens,
      icon: 'character-gojo',
      tone: 'secondary',
    },
    {
      label: 'Homebrews',
      value: stats.homebrews,
      icon: 'sparkles',
      tone: 'orange',
    },
    {
      label: 'Consultas',
      value: stats.artigosLidos,
      icon: 'rules',
      tone: 'green',
    },
  ];

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-app-bg px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="relative overflow-hidden rounded-3xl border border-app-border/60 bg-app-surface/70 p-6 shadow-2xl shadow-black/10 backdrop-blur md:p-8">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-app-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-app-secondary/20 blur-3xl" />
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-app-primary/70 to-transparent" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.5fr_0.85fr] lg:items-end">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-app-primary/30 bg-app-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.28em] text-app-primary">
                  <Icon name="domain" className="h-4 w-4" />
                  Central de Missões
                </span>
              </div>

              <div className="max-w-3xl space-y-3">
                <h1 className="text-4xl font-black tracking-tight text-app-fg md:text-6xl">
                  E aí, <span className="text-gradient">{usuario.apelido}</span>.
                </h1>
                <p className="text-base font-medium leading-relaxed text-app-muted md:text-lg">
                  Está tendo um pico de energia amaldiçoada hoje. Continue sua missão,
                  prepare sua ficha ou consulte as regras antes da próxima sessão.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {HERO_ACTIONS.map((acao, index) => (
                  <Link key={acao.href} href={acao.href}>
                    <Button
                      variant={index === 0 ? 'primary' : 'glass'}
                      className="w-full gap-2 sm:w-auto"
                    >
                      <Icon name={acao.icon} className="h-4 w-4" />
                      {acao.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-app-border/60 bg-app-bg/45 p-5 shadow-inner">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-app-muted">
                    Status do arquivo
                  </p>
                  <h2 className="mt-1 text-xl font-black text-app-fg">
                    Operação em andamento
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-app-primary/25 bg-app-primary/10 text-app-primary">
                  <Icon name="focus" className="h-6 w-6" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {resumoArquivo.slice(0, 4).map((item) => {
                  const tone = TONE_STYLES[item.tone];
                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-app-border/50 bg-app-surface/70 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-app-muted">
                          {item.label}
                        </span>
                        <Icon name={item.icon} className={`h-4 w-4 ${tone.text}`} />
                      </div>
                      <p className="mt-2 text-2xl font-black text-app-fg">
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </header>

        {erro ? <ErrorAlert message={erro} /> : null}

        <section className="grid gap-8 xl:grid-cols-[1.35fr_0.95fr]">
          <Card
            variant="glass"
            className="relative overflow-hidden !p-6 shadow-xl shadow-black/10 md:!p-7"
          >
            <div className="absolute -right-16 top-8 h-44 w-44 rounded-full bg-app-primary/10 blur-3xl" />
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.26em] text-app-primary">
                    Painel de Missão
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-app-fg md:text-3xl">
                    Continue a operação principal
                  </h2>
                </div>
                <Link href="/campanhas">
                  <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                    Ver campanhas
                  </Button>
                </Link>
              </div>

              {campanhaPrincipal ? (
                <div className="rounded-3xl border border-app-border bg-app-card/70 p-5 shadow-inner md:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-black tracking-tight text-app-fg">
                          {campanhaPrincipal.nome}
                        </h3>
                        <Badge
                          color={obterCorStatusCampanha(campanhaPrincipal.status)}
                          variant="subtle"
                          size="md"
                        >
                          {formatarStatus(campanhaPrincipal.status)}
                        </Badge>
                      </div>

                      <p className="max-w-3xl text-sm leading-relaxed text-app-muted">
                        {campanhaPrincipal.descricao?.trim() ||
                          'Nenhuma descrição registrada. Use a página da campanha para organizar sessões, personagens e participantes.'}
                      </p>

                      <div className="flex flex-wrap gap-2 text-xs font-semibold text-app-muted">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-app-border bg-app-surface/70 px-3 py-1">
                          <Icon name="school" className="h-3.5 w-3.5 text-app-primary" />
                          Mestre: {campanhaPrincipal.dono.apelido}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-app-border bg-app-surface/70 px-3 py-1">
                          <Icon name="characters" className="h-3.5 w-3.5 text-app-secondary" />
                          {campanhaPrincipal._count.membros} membros
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-app-border bg-app-surface/70 px-3 py-1">
                          <Icon
                            name="character-gojo"
                            className="h-3.5 w-3.5 text-app-secondary"
                          />
                          {campanhaPrincipal._count.personagens} personagens
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-app-border bg-app-surface/70 px-3 py-1">
                          <Icon name="scroll" className="h-3.5 w-3.5 text-app-orange" />
                          {campanhaPrincipal._count.sessoes} sessões
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
                      <Link href={`/campanhas/${campanhaPrincipal.id}`}>
                        <Button className="w-full gap-2">
                          <Icon name="campaign" className="h-4 w-4" />
                          Entrar na campanha
                        </Button>
                      </Link>
                      <Link href={`/campanhas/${campanhaPrincipal.id}`}>
                        <Button variant="secondary" className="w-full gap-2">
                          <Icon name="scroll" className="h-4 w-4" />
                          Preparar sessão
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-app-primary/40 bg-app-primary/5 p-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-app-primary/25 bg-app-primary/10 text-app-primary">
                    <Icon name="campaign" className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-black text-app-fg">
                    Nenhuma missão aberta ainda.
                  </h3>
                  <p className="mx-auto mt-2 max-w-xl text-sm text-app-muted">
                    Crie uma campanha para reunir jogadores, fichas, sessões e
                    registros de investigação em um único dossiê.
                  </p>
                  <Link href="/campanhas/novo" className="mt-5 inline-flex">
                    <Button className="gap-2">
                      <Icon name="add" className="h-4 w-4" />
                      Criar campanha
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>

          <Card variant="default" className="flex flex-col gap-5 !p-6 shadow-xl shadow-black/5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-app-secondary">
                  Arquivo de Personagens
                </p>
                <h2 className="mt-1 text-2xl font-black text-app-fg">
                  Meus xamãs
                </h2>
              </div>
              <Link href="/personagens-base">
                <Button variant="ghost" size="sm">
                  Ver tudo
                </Button>
              </Link>
            </div>

            {personagensRecentes.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-app-border bg-app-muted-surface/30 px-4 py-10 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-app-surface shadow-inner">
                  <Icon name="character-gojo" className="h-8 w-8 text-app-muted" />
                </div>
                <p className="font-semibold text-app-fg">
                  Nenhum xamã registrado ainda.
                </p>
                <p className="mt-1 max-w-sm text-sm text-app-muted">
                  Crie sua primeira ficha para entrar em campanha com tudo pronto.
                </p>
                <Link href="/personagens-base/novo" className="mt-5">
                  <Button variant="primary" className="gap-2">
                    <Icon name="add" className="h-4 w-4" />
                    Criar personagem
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {personagensRecentes.map((personagem) => (
                  <Link key={personagem.id} href={`/personagens-base/${personagem.id}`}>
                    <div className="group relative overflow-hidden rounded-2xl border border-app-border bg-app-surface/55 p-4 transition-all duration-300 hover:border-app-secondary/50 hover:bg-app-surface">
                      <div className="absolute left-0 top-0 h-full w-1 origin-top scale-y-0 bg-app-secondary transition-transform duration-300 group-hover:scale-y-100" />
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-black text-app-fg transition-colors group-hover:text-app-secondary">
                            {personagem.nome}
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge color="purple" variant="subtle" size="sm">
                              Nv. {personagem.nivel}
                            </Badge>
                            <Badge color="blue" variant="outline" size="sm">
                              Clã {personagem.cla}
                            </Badge>
                            <Badge color="gray" variant="outline" size="sm">
                              {personagem.classe}
                            </Badge>
                          </div>
                        </div>
                        <Icon
                          name="chevron-right"
                          className="mt-1 h-5 w-5 shrink-0 text-app-muted transition-transform group-hover:translate-x-1 group-hover:text-app-secondary"
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.25fr_0.9fr]">
          <Card variant="glass" className="!p-6 md:!p-7">
            <div className="mb-6 flex flex-col gap-2">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-app-orange">
                Preparar Sessão
              </p>
              <h2 className="text-2xl font-black text-app-fg">
                Ferramentas de mesa
              </h2>
              <p className="max-w-2xl text-sm text-app-muted">
                Abra rapidamente o que normalmente entra na preparação antes de
                narrar uma cena, combate ou investigação.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {SESSION_TOOLS.map((acao) => {
                const tone = TONE_STYLES[acao.tone];
                return (
                  <Link key={acao.href} href={acao.href}>
                    <div
                      className={`group relative h-full overflow-hidden rounded-2xl border border-app-border bg-app-card/60 p-4 transition-all duration-300 ${tone.border}`}
                    >
                      <div
                        className={`absolute -right-10 -top-12 h-28 w-28 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-100 ${tone.glow}`}
                      />
                      <div className="relative z-10 space-y-3">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl border ${tone.icon}`}
                        >
                          <Icon name={acao.icon} className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-black text-app-fg">
                            {acao.label}
                          </h3>
                          <p className="mt-1 text-sm leading-relaxed text-app-muted">
                            {acao.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>

          <Card variant="default" className="!p-6 md:!p-7">
            <div className="mb-6 flex flex-col gap-2">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-app-primary">
                Grimório de Regras
              </p>
              <h2 className="text-2xl font-black text-app-fg">
                Consulta rápida
              </h2>
              <p className="text-sm text-app-muted">
                Caminhos seguros para regras e arquivos já existentes no sistema.
              </p>
            </div>

            <div className="space-y-3">
              {RULE_GUIDES.map((guia) => {
                const tone = TONE_STYLES[guia.tone];
                return (
                  <Link key={guia.href} href={guia.href}>
                    <div className="group flex items-start gap-3 rounded-2xl border border-app-border bg-app-surface/60 p-4 transition-all duration-300 hover:border-app-primary/40 hover:bg-app-surface">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${tone.icon}`}
                      >
                        <Icon name={guia.icon} className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-black text-app-fg">
                          {guia.label}
                        </h3>
                        <p className="mt-1 text-sm text-app-muted">
                          {guia.description}
                        </p>
                      </div>
                      <Icon
                        name="chevron-right"
                        className="mt-2 h-5 w-5 text-app-muted transition-transform group-hover:translate-x-1 group-hover:text-app-primary"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>
        </section>

        <section className="rounded-3xl border border-app-border/60 bg-app-surface/45 p-4 md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-app-muted">
                Resumo do Arquivo
              </p>
              <p className="mt-1 text-sm text-app-muted">
                Uma leitura discreta do que já está registrado nesta conta.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {resumoArquivo.map((item) => {
                const tone = TONE_STYLES[item.tone];
                return (
                  <div
                    key={item.label}
                    className="min-w-32 rounded-2xl border border-app-border bg-app-card/50 px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${tone.accent}`} />
                      <span className="text-xs font-bold text-app-muted">
                        {item.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xl font-black text-app-fg">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
