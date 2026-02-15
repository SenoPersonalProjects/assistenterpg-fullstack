// app/home/page.tsx
'use client';

import { useEffect, useState } from 'react';
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
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
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
  const [campanhasRecentes, setCampanhasRecentes] = useState<any[]>([]);
  const [personagensRecentes, setPersonagensRecentes] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !usuario) {
      router.push('/auth/login');
    }
  }, [loading, usuario, router]);

  useEffect(() => {
    if (!loading && usuario) {
      carregarDados();
    }
  }, [loading, usuario]);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro(null);
      
      // Buscar dados em paralelo (sem passar token - axios já injeta)
      const [statsData, campanhas, personagens, homebrews] = await Promise.all([
        apiObterEstatisticas(),
        apiGetMinhasCampanhas(),
        apiGetMeusPersonagensBase(),
        apiGetMeusHomebrews({ limite: 10 }).catch(() => ({ items: [], total: 0, page: 1, limit: 10, totalPages: 1 })),
      ]);

      setStats({
        ...statsData,
        homebrews: homebrews.total,
      });
      
      // Pegar apenas as 2 campanhas mais recentes
      setCampanhasRecentes(campanhas.items.slice(0, 2));
      
      // Pegar apenas os 2 personagens mais recentes
      setPersonagensRecentes(personagens.slice(0, 2));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      const mensagem = extrairMensagemErro(error);
      setErro(mensagem);
      showToast(mensagem, 'error');
    } finally {
      setCarregando(false);
    }
  }

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
    <main className="min-h-screen bg-app-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header de Boas-vindas */}
        <header>
          <h1 className="text-4xl font-bold text-app-fg mb-2">
            Bem-vindo, {usuario.apelido}!
          </h1>
          <p className="text-app-muted">
            Aqui está um resumo das suas atividades no Assistente RPG
          </p>
        </header>

        {/* Erro */}
        {erro && <ErrorAlert message={erro} />}

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-app-muted text-sm mb-1">Campanhas Ativas</p>
                <p className="text-3xl font-bold text-app-fg">{stats.campanhas}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Icon name="campaign" className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-app-muted text-sm mb-1">Personagens Criados</p>
                <p className="text-3xl font-bold text-app-fg">{stats.personagens}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Icon name="characters" className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-app-muted text-sm mb-1">Homebrews</p>
                <p className="text-3xl font-bold text-app-fg">{stats.homebrews}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Icon name="sparkles" className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-app-muted text-sm mb-1">Artigos Consultados</p>
                <p className="text-3xl font-bold text-app-fg">{stats.artigosLidos}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Icon name="rules" className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Grid de Conteúdo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Campanhas Recentes */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-app-fg flex items-center gap-2">
                <Icon name="campaign" className="w-5 h-5" />
                Campanhas Recentes
              </h2>
              <Link href="/campanhas">
                <Button variant="ghost" size="sm">Ver todas</Button>
              </Link>
            </div>

            {campanhasRecentes.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="campaign" className="w-12 h-12 mx-auto mb-3 text-app-muted" />
                <p className="text-app-muted mb-4">Você ainda não participa de nenhuma campanha</p>
                <Link href="/campanhas">
                  <Button variant="primary" size="sm">Criar primeira campanha</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {campanhasRecentes.map((campanha) => (
                  <Link key={campanha.id} href={`/campanhas/${campanha.id}`}>
                    <div className="p-4 bg-app-bg rounded-lg hover:bg-app-border/50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-app-fg">{campanha.nome}</h3>
                        <Badge color="blue" size="sm">
                          {campanha._count?.membros || 0} membros
                        </Badge>
                      </div>
                      <p className="text-xs text-app-muted">
                        Status: {campanha.status}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Personagens Recentes */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-app-fg flex items-center gap-2">
                <Icon name="characters" className="w-5 h-5" />
                Personagens Recentes
              </h2>
              <Link href="/personagens-base">
                <Button variant="ghost" size="sm">Ver todos</Button>
              </Link>
            </div>

            {personagensRecentes.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="characters" className="w-12 h-12 mx-auto mb-3 text-app-muted" />
                <p className="text-app-muted mb-4">Você ainda não criou nenhum personagem</p>
                <Link href="/personagens-base/novo">
                  <Button variant="primary" size="sm">Criar primeiro personagem</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {personagensRecentes.map((personagem) => (
                  <Link key={personagem.id} href={`/personagens-base/${personagem.id}`}>
                    <div className="p-4 bg-app-bg rounded-lg hover:bg-app-border/50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-app-fg">{personagem.nome}</h3>
                        <Badge color="purple" size="sm">Nv. {personagem.nivel}</Badge>
                      </div>
                      <p className="text-xs text-app-muted">{personagem.classe}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Ações Rápidas */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-app-fg mb-4 flex items-center gap-2">
            <Icon name="bolt" className="w-5 h-5" />
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Link href="/campanhas">
              <Button variant="secondary" className="w-full justify-start">
                <Icon name="add" className="w-4 h-4 mr-2" />
                Nova Campanha
              </Button>
            </Link>
            <Link href="/personagens-base/novo">
              <Button variant="secondary" className="w-full justify-start">
                <Icon name="add" className="w-4 h-4 mr-2" />
                Novo Personagem
              </Button>
            </Link>
            <Link href="/homebrews/novo">
              <Button variant="secondary" className="w-full justify-start">
                <Icon name="add" className="w-4 h-4 mr-2" />
                Novo Homebrew
              </Button>
            </Link>
            <Link href="/compendio">
              <Button variant="secondary" className="w-full justify-start">
                <Icon name="rules" className="w-4 h-4 mr-2" />
                Consultar Regras
              </Button>
            </Link>
            <Link href="/configuracoes">
              <Button variant="secondary" className="w-full justify-start">
                <Icon name="settings" className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
