// app/home/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { 
  apiObterEstatisticas, 
  apiGetMinhasCampanhas, 
  apiGetMeusPersonagensBase 
} from '@/lib/api';
import { apiGetMeusHomebrews } from '@/lib/api/homebrews';
import { extrairMensagemErro } from '@/lib/api/error-handler';
import type { CampanhaResumo, PersonagemBaseResumo } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import Link from 'next/link';

export default function HomePage() {
  const { usuario, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [stats, setStats] = useState({ 
    campanhas: 0, 
    personagens: 0, 
    homebrews: 0,
    artigosLidos: 0 
  });
  const [campanhasRecentes, setCampanhasRecentes] = useState<CampanhaResumo[]>([]);
  const [personagensRecentes, setPersonagensRecentes] = useState<PersonagemBaseResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const statsCards: Array<{
    label: string;
    value: number;
    icon: IconName;
    color: 'blue' | 'purple' | 'orange' | 'green';
  }> = [
    { label: 'Campanhas', value: stats.campanhas, icon: 'campaign', color: 'blue' },
    { label: 'Personagens', value: stats.personagens, icon: 'characters', color: 'purple' },
    { label: 'Homebrews', value: stats.homebrews, icon: 'sparkles', color: 'orange' },
    { label: 'Consultas', value: stats.artigosLidos, icon: 'rules', color: 'green' },
  ];
  const atalhos: Array<{
    label: string;
    href: string;
    icon: IconName;
  }> = [
    { label: 'Nova Campanha', href: '/campanhas', icon: 'add' },
    { label: 'Novo Personagem', href: '/personagens-base/novo', icon: 'add' },
    { label: 'Novo Homebrew', href: '/homebrews/novo', icon: 'add' },
    { label: 'Consultar Regras', href: '/compendio', icon: 'rules' },
    { label: 'Configurações', href: '/configuracoes', icon: 'settings' },
  ];

  useEffect(() => {
    if (!loading && !usuario) {
      router.push('/auth/login');
    }
  }, [loading, usuario, router]);

  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      
      // Buscar dados em paralelo (sem passar token - axios já injeta)
      const [statsData, campanhas, personagens, homebrews] = await Promise.all([
        apiObterEstatisticas(),
        apiGetMinhasCampanhas({ page: 1, limit: 2 }),
        apiGetMeusPersonagensBase({ page: 1, limit: 2 }),
        apiGetMeusHomebrews({ limite: 10 }).catch(() => ({ items: [], total: 0, page: 1, limit: 10, totalPages: 1 })),
      ]);

      setStats({
        ...statsData,
        homebrews: homebrews.total,
      });
      
      setCampanhasRecentes(campanhas.items);
      setPersonagensRecentes(personagens.items);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      const mensagem = extrairMensagemErro(error);
      setErro(mensagem);
      showToast(mensagem, 'error');
    } finally {
      setCarregando(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!loading && usuario) {
      carregarDados();
    }
  }, [loading, usuario, carregarDados]);

  if (loading || carregando) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-app-primary mx-auto mb-4"></div>
          <p className="text-app-fg">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!usuario) return null;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-app-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header de Boas-vindas */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black text-app-fg tracking-tight">
              E aí, <span className="text-gradient">{usuario.apelido}</span>!
            </h1>
            <p className="text-lg text-app-muted font-medium">
              RPGzinho hoje?
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge color="purple" variant="solid" size="lg" className="shadow-lg shadow-app-secondary/20">
              PlaceHolder
            </Badge>
          </div>
        </header>

        {/* Erro */}
        {erro && <ErrorAlert message={erro} />}

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat) => (
            <Card key={stat.label} variant="glass" className="relative overflow-hidden group">
              <div className={`absolute -right-4 -top-4 w-24 h-24 bg-app-${stat.color}/10 rounded-full blur-2xl group-hover:bg-app-${stat.color}/20 transition-all duration-500`} />
              <div className="relative flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-app-muted text-xs font-bold uppercase tracking-widest">{stat.label}</span>
                  <Icon name={stat.icon} className={`w-5 h-5 text-app-${stat.color}`} />
                </div>
                <span className="text-3xl font-black text-app-fg tracking-tighter">{stat.value}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Grid de Conteúdo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Campanhas Recentes */}
          <Card variant="default" className="flex flex-col gap-6 !p-6 shadow-xl shadow-black/5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-app-fg flex items-center gap-3">
                <div className="p-2 bg-app-primary/10 rounded-xl">
                  <Icon name="campaign" className="w-6 h-6 text-app-primary" />
                </div>
                Campanhas
              </h2>
              <Link href="/campanhas">
                <Button variant="ghost" size="sm" className="font-bold">Ver tudo</Button>
              </Link>
            </div>

            {campanhasRecentes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-app-muted-surface/30 rounded-2xl border border-dashed border-app-border">
                <div className="w-16 h-16 bg-app-surface rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <Icon name="campaign" className="w-8 h-8 text-app-muted" />
                </div>
                <p className="text-app-muted font-medium mb-6">Nenhuma campanha por aqui ainda, mermão.</p>
                <Link href="/campanhas">
                  <Button variant="primary" className="shadow-lg shadow-app-primary/30">
                    <Icon name="add" className="w-4 h-4 mr-2" />
                    Iniciar Jornada
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {campanhasRecentes.map((campanha) => (
                  <Link key={campanha.id} href={`/campanhas/${campanha.id}`}>
                    <div className="group relative p-5 bg-app-surface/50 hover:bg-app-surface rounded-2xl border border-app-border transition-all duration-300 cursor-pointer overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-app-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                      <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-1">
                          <h3 className="font-bold text-app-fg group-hover:text-app-primary transition-colors text-lg">{campanha.nome}</h3>
                          <p className="text-xs text-app-muted font-medium flex items-center gap-2">
                             Status: <Badge color="blue" size="xs" variant="subtle">{campanha.status}</Badge>
                          </p>
                        </div>
                        <div className="flex -space-x-2">
                          {[...Array(Math.min(campanha._count?.membros || 0, 3))].map((_, i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-app-surface bg-app-muted-surface flex items-center justify-center text-[10px] font-bold text-app-muted">
                              {i === 2 && (campanha._count?.membros || 0) > 3 ? `+${(campanha._count?.membros || 0) - 2}` : ''}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Personagens Recentes */}
          <Card variant="default" className="flex flex-col gap-6 !p-6 shadow-xl shadow-black/5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-app-fg flex items-center gap-3">
                <div className="p-2 bg-app-secondary/10 rounded-xl">
                  <Icon name="characters" className="w-6 h-6 text-app-secondary" />
                </div>
                Personagens
              </h2>
              <Link href="/personagens-base">
                <Button variant="ghost" size="sm" className="font-bold">Ver tudo</Button>
              </Link>
            </div>

            {personagensRecentes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-app-muted-surface/30 rounded-2xl border border-dashed border-app-border">
                <div className="w-16 h-16 bg-app-surface rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <Icon name="characters" className="w-8 h-8 text-app-muted" />
                </div>
                <p className="text-app-muted font-medium mb-6">Seus heróis ainda estão na névoa.</p>
                <Link href="/personagens-base/novo">
                  <Button variant="primary" className="bg-app-secondary hover:bg-app-secondary-hover shadow-lg shadow-app-secondary/30">
                    <Icon name="add" className="w-4 h-4 mr-2" />
                    Manifestar Personagem
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {personagensRecentes.map((personagem) => (
                  <Link key={personagem.id} href={`/personagens-base/${personagem.id}`}>
                    <div className="group relative p-5 bg-app-surface/50 hover:bg-app-surface rounded-2xl border border-app-border transition-all duration-300 cursor-pointer overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-app-secondary scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                      <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-1">
                          <h3 className="font-bold text-app-fg group-hover:text-app-secondary transition-colors text-lg">{personagem.nome}</h3>
                          <p className="text-xs text-app-muted font-bold tracking-wide uppercase">{personagem.classe}</p>
                        </div>
                        <Badge color="purple" variant="solid" size="md" className="font-black">Nv. {personagem.nivel}</Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Ações Rápidas */}
        <Card variant="glass" className="!p-8">
          <h2 className="text-2xl font-black text-app-fg mb-6 flex items-center gap-3">
            <Icon name="bolt" className="w-6 h-6 text-app-orange" />
            Atalhos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {atalhos.map((acao) => (
              <Link key={acao.label} href={acao.href}>
                <Button variant="secondary" className="w-full !justify-start !p-4 h-auto rounded-2xl group hover:shadow-lg transition-all duration-300">
                  <div className="p-2 bg-app-muted-surface rounded-xl mr-3 group-hover:bg-app-surface transition-colors">
                    <Icon name={acao.icon} className="w-5 h-5 text-app-muted group-hover:text-app-primary" />
                  </div>
                  <span className="font-bold text-app-fg/80 group-hover:text-app-fg">{acao.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
