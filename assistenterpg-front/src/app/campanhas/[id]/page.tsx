// app/campanhas/[id]/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  apiCriarConvite,
  apiGetCampanhaById,
  extrairMensagemErro,
  formatarErroComContexto,
  traduzirErro,
} from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CampaignMembersSection } from '@/components/campanha/CampaignMembersSection';
import { CampaignCharactersSection } from '@/components/campanha/CampaignCharactersSection';
import { CampaignSessionsSection } from '@/components/campanha/CampaignSessionsSection';
import { InviteMemberForm } from '@/components/campanha/InviteMemberForm';
import { InviteFriendsPanel } from '@/components/campanha/InviteFriendsPanel';
import { Icon } from '@/components/ui/Icon';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';

type MembroCampanhaDto = {
  id: number;
  papel: string;
  usuarioId: number;
  usuario: { id: number; apelido: string };
};

type CampanhaDetalheDto = {
  id: number;
  nome: string;
  descricao: string | null;
  status: string;
  criadoEm: string;
  donoId: number;
  dono: { id: number; apelido: string };
  membros: MembroCampanhaDto[];
  _count: { membros: number; personagens: number; sessoes: number };
};

function mensagemErroCarregarCampanha(error: unknown): string {
  const status = Number(
    (error as { status?: number })?.status ??
      (error as { response?: { status?: number } })?.response?.status ??
      (error as { body?: { statusCode?: number } })?.body?.statusCode ??
      0,
  );
  const code = (error as { body?: { code?: string } })?.body?.code;
  const base = traduzirErro(code, extrairMensagemErro(error), status);

  if (status === 404) {
    return formatarErroComContexto('Campanha nao encontrada.', error, {
      incluirEndpoint: true,
      incluirRequestId: true,
    });
  }

  if (status === 403) {
    return formatarErroComContexto(
      'Voce nao tem permissao para acessar esta campanha.',
      error,
      {
        incluirEndpoint: true,
        incluirRequestId: true,
      },
    );
  }

  if (status === 400 || status === 422) {
    return formatarErroComContexto(`Nao foi possivel carregar a campanha. ${base}`, error, {
      incluirEndpoint: true,
      incluirRequestId: true,
    });
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
  const code = (error as { body?: { code?: string } })?.body?.code;
  const base = traduzirErro(code, extrairMensagemErro(error), status);

  if (status === 409) {
    return formatarErroComContexto('Nao foi possivel enviar o convite. Usuario ja e membro.', error, {
      incluirEndpoint: true,
      incluirRequestId: true,
    });
  }

  if (status === 400 || status === 422) {
    return formatarErroComContexto(`Nao foi possivel enviar o convite. ${base}`, error, {
      incluirEndpoint: true,
      incluirRequestId: true,
    });
  }

  return formatarErroComContexto(base, error, {
    incluirEndpoint: true,
    incluirRequestId: true,
  });
}

export default function CampanhaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();

  const [campanha, setCampanha] = useState<CampanhaDetalheDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

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

    async function carregar() {
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
    }

    carregar();
  }, [id, authLoading, usuario, router]);

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
    } catch (error) {
      throw new Error(mensagemErroConvidarMembro(error));
    }
  }

  if (authLoading || loading) {
    return (
      <Loading
        message="Carregando campanha..."
        className="p-6 text-app-fg"
      />
    );
  }

  if (!campanha) {
    return (
      <main className="min-h-screen bg-app-bg p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {erro && <ErrorAlert message={erro} />}
          {!erro && (
            <EmptyState
              variant="card"
              icon="campaign"
              title="Campanha não encontrada"
              description="Verifique se o link está correto ou volte para a lista de campanhas."
            />
          )}
          <Button
            variant="ghost"
            onClick={() => router.push('/campanhas')}
          >
            <Icon name="back" className="w-4 h-4 mr-2" />
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
  const usuarioEhMestre =
    usuario?.id === campanha.donoId || papelDoUsuario === 'MESTRE';

  const corStatus =
    campanha.status === 'ATIVA'
      ? 'green'
      : campanha.status === 'PAUSADA'
        ? 'yellow'
        : 'red';

  return (
    <main className="min-h-screen bg-app-bg pb-12">
      <div className="bg-app-surface border-b border-app-border pt-8 pb-12 mb-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="mb-6 flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/campanhas')}
              className="text-app-muted hover:text-app-fg"
            >
              <Icon name="back" className="w-4 h-4 mr-2" />
              Voltar para campanhas
            </Button>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-2xl bg-app-primary/10 border border-app-primary/20 shadow-inner">
                <Icon name="campaign" className="w-12 h-12 sm:w-14 sm:h-14 text-app-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-app-fg tracking-tight">
                    {campanha.nome}
                  </h1>
                  <Badge color={corStatus} size="lg" className="shadow-sm">
                    {campanha.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium text-app-muted flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Icon name="id" className="w-4 h-4" />
                    Mestre: <strong className="text-app-fg">{campanha.dono.apelido}</strong>
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-app-border"></span>
                  <span>Criada em {dataCriacao}</span>
                </div>
              </div>
            </div>

            <div className="flex bg-app-bg/50 backdrop-blur-md rounded-xl border border-app-border/60 shadow-sm p-2">
              <div className="px-5 py-2 text-center">
                <p className="text-[10px] sm:text-xs text-app-muted font-bold uppercase tracking-widest mb-1">Membros</p>
                <p className="text-xl sm:text-2xl font-bold text-app-fg">{campanha._count.membros}</p>
              </div>
              <div className="w-px bg-app-border/60 my-2"></div>
              <div className="px-5 py-2 text-center">
                <p className="text-[10px] sm:text-xs text-app-muted font-bold uppercase tracking-widest mb-1">Personagens</p>
                <p className="text-xl sm:text-2xl font-bold text-app-fg">{campanha._count.personagens}</p>
              </div>
              <div className="w-px bg-app-border/60 my-2"></div>
              <div className="px-5 py-2 text-center">
                <p className="text-[10px] sm:text-xs text-app-muted font-bold uppercase tracking-widest mb-1">Sessões</p>
                <p className="text-xl sm:text-2xl font-bold text-app-fg">{campanha._count.sessoes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-app-info/15 text-app-info">
                  <Icon name="scroll" className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-app-fg tracking-tight">Sessões da Campanha</h2>
              </div>
              <CampaignSessionsSection
                campanhaId={campanha.id}
                usuarioEhMestre={Boolean(usuarioEhMestre)}
                onTotalSessoesChange={handleTotalSessoesChange}
              />
            </section>

            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-app-secondary/15 text-app-secondary">
                  <Icon name="character-gojo" className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-app-fg tracking-tight">Personagens</h2>
              </div>
              <CampaignCharactersSection
                campanhaId={campanha.id}
                usuarioId={usuario?.id ?? 0}
                usuarioEhMestre={Boolean(usuarioEhMestre)}
                onTotalPersonagensChange={handleTotalPersonagensChange}
              />
            </section>
          </div>

          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-app-fg/10 text-app-fg">
                  <Icon name="info" className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-app-fg tracking-tight">Sobre a Campanha</h2>
              </div>
              {campanha.descricao ? (
                <Card className="bg-app-surface/60 border-app-border/50 shadow-sm hover:shadow transition-shadow duration-200">
                  <p className="text-sm text-app-muted leading-relaxed whitespace-pre-wrap">
                    {campanha.descricao}
                  </p>
                </Card>
              ) : (
                <EmptyState
                  variant="plain"
                  description="Esta campanha ainda não possui uma descrição."
                  size="sm"
                />
              )}
            </section>

            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-app-fg/10 text-app-fg">
                  <Icon name="characters" className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-app-fg tracking-tight">Participantes</h2>
              </div>
              <CampaignMembersSection
                membros={campanha.membros}
                donoId={campanha.donoId}
              />
            </section>

            {usuario?.id === campanha.donoId && (
              <section>
                <div className="rounded-xl border border-app-border bg-app-surface p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-app-primary/10 text-app-primary">
                      <Icon name="add" className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-app-fg tracking-tight">
                        Convidar membros
                      </h3>
                      <p className="text-xs text-app-muted mt-0.5">
                        Envie convites para o grupo.
                      </p>
                    </div>
                  </div>
                  <InviteMemberForm onInvite={handleInvite} />
                  <div className="my-5 h-px bg-app-border" />
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-app-fg">
                        Convidar amigos
                      </h4>
                      <p className="text-xs text-app-muted">
                        Envie convites para pessoas da sua lista de amigos.
                      </p>
                    </div>
                    <InviteFriendsPanel campanhaId={campanha.id} />
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
