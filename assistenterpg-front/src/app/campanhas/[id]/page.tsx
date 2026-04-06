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
import { SectionTitle } from '@/components/ui/SectionTitle';
import { CampaignHeader } from '@/components/campanha/CampaignHeader';
import { CampaignMembersSection } from '@/components/campanha/CampaignMembersSection';
import { CampaignCharactersSection } from '@/components/campanha/CampaignCharactersSection';
import { CampaignSessionsSection } from '@/components/campanha/CampaignSessionsSection';
import { InviteMemberForm } from '@/components/campanha/InviteMemberForm';
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

  return (
    <main className="min-h-screen bg-app-bg p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ✅ Header alinhado ao restante do app */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-app-primary/10">
              <Icon name="campaign" className="w-6 h-6 text-app-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-app-fg">
                {campanha.nome}
              </h1>
              <p className="text-sm text-app-muted mt-0.5">
                Campanha criada por {campanha.dono.apelido} em {dataCriacao}.
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/campanhas')}
          >
            <Icon name="back" className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </header>

        {/* ✅ Resumo principal (mantendo seu CampaignHeader para consistência) */}
        <CampaignHeader
          donoApelido={campanha.dono.apelido}
          criadoEm={dataCriacao}
          totalMembros={campanha._count.membros}
          totalPersonagens={campanha._count.personagens}
          totalSessoes={campanha._count.sessoes}
          status={campanha.status}
        />

        {/* ✅ Descrição em card, com estado vazio elegante */}
        <section className="space-y-2">
          <SectionTitle icon="info">Descrição</SectionTitle>
          {campanha.descricao ? (
            <Card>
              <p className="text-sm text-app-muted leading-relaxed">
                {campanha.descricao}
              </p>
            </Card>
          ) : (
            <EmptyState
              description="Esta campanha ainda não possui uma descrição."
              variant="plain"
            />
          )}
        </section>

        {/* ✅ Membros */}
        <section>
          <SectionTitle icon="characters">Membros da campanha</SectionTitle>
          <CampaignMembersSection
            membros={campanha.membros}
            donoId={campanha.donoId}
          />
        </section>

        <section>
          <SectionTitle icon="id">Personagens da campanha</SectionTitle>
          <CampaignCharactersSection
            campanhaId={campanha.id}
            usuarioId={usuario?.id ?? 0}
            usuarioEhMestre={Boolean(usuarioEhMestre)}
            onTotalPersonagensChange={handleTotalPersonagensChange}
          />
        </section>

        {/* ✅ Convites (somente dono) */}
        {usuario?.id === campanha.donoId && (
          <section>
            <div className="rounded-lg border border-app-border bg-app-surface p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-app-primary/10 text-app-primary">
                  <Icon name="add" className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-app-fg">
                    Convidar membros
                  </h2>
                  <p className="text-sm text-app-muted">
                    Envie convites para jogadores ou observadores entrarem na campanha.
                  </p>
                </div>
              </div>
              <InviteMemberForm onInvite={handleInvite} />
            </div>
          </section>
        )}

        {/* ✅ Sessões */}
        <section>
          <SectionTitle icon="scroll">Sessões</SectionTitle>
          <CampaignSessionsSection
            campanhaId={campanha.id}
            usuarioEhMestre={Boolean(usuarioEhMestre)}
            onTotalSessoesChange={handleTotalSessoesChange}
          />
        </section>

        {/* ✅ Botão de voltar no final da página */}
        <div className="pt-2">
          <Button
            variant="ghost"
            onClick={() => router.push('/campanhas')}
          >
            <Icon name="back" className="w-4 h-4 mr-2" />
            Voltar para campanhas
          </Button>
        </div>
      </div>
    </main>
  );
}
