'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  apiListarSessoesAgendadasCampanha,
  apiListarSessoesCampanha,
  type SessaoAgendadaResumo,
  type SessaoCampanhaResumo,
} from '@/lib/api';
import type { CampaignTab } from '@/lib/campanhas/campaign-tabs.helpers';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { InviteFriendsPanel } from '@/components/campanha/InviteFriendsPanel';
import { InviteMemberForm } from '@/components/campanha/InviteMemberForm';

export type MembroCampanhaDto = {
  id: number;
  papel: string;
  usuarioId: number;
  usuario: { id: number; apelido: string };
};

export type CampanhaDetalheDto = {
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

const CAMPAIGN_TABS: Array<{
  id: CampaignTab;
  label: string;
  icon: 'info' | 'scroll' | 'character-gojo' | 'characters';
}> = [
  { id: 'visao-geral', label: 'Visão geral', icon: 'info' },
  { id: 'sessoes', label: 'Sessões', icon: 'scroll' },
  { id: 'personagens', label: 'Personagens', icon: 'character-gojo' },
  { id: 'membros', label: 'Membros', icon: 'characters' },
];

export function CampaignHero({
  campanha,
  corStatus,
  dataCriacao,
  usuarioEhMestre,
  usuarioEhDono,
  onBack,
  onGoToSessions,
  onOpenInvite,
}: {
  campanha: CampanhaDetalheDto;
  corStatus: 'green' | 'yellow' | 'red';
  dataCriacao: string;
  usuarioEhMestre: boolean;
  usuarioEhDono: boolean;
  onBack: () => void;
  onGoToSessions: () => void;
  onOpenInvite: () => void;
}) {
  return (
    <div className="relative mb-5 overflow-hidden border-b border-app-border bg-app-surface py-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-app-primary/50 to-transparent" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-app-muted hover:text-app-fg"
          >
            <Icon name="back" className="mr-2 h-4 w-4" />
            Voltar para campanhas
          </Button>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-app-primary/20 bg-app-primary/10 shadow-inner sm:h-20 sm:w-20">
              <Icon name="campaign" className="h-9 w-9 text-app-primary sm:h-10 sm:w-10" />
            </div>
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-extrabold tracking-tight text-app-fg sm:text-3xl">
                  {campanha.nome}
                </h1>
                <Badge color={corStatus} size="lg" className="shadow-sm">
                  {campanha.status}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-app-muted">
                <span className="flex items-center gap-1.5">
                  <Icon name="id" className="h-4 w-4" />
                  Mestre:{' '}
                  <strong className="text-app-fg">{campanha.dono.apelido}</strong>
                </span>
                <span className="hidden h-1.5 w-1.5 rounded-full bg-app-border sm:inline-block" />
                <span>Criada em {dataCriacao}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <div className="grid grid-cols-3 rounded-xl border border-app-border/60 bg-app-bg/50 p-1.5 text-center shadow-sm backdrop-blur-md">
              <CampaignCounter label="Membros" value={campanha._count.membros} />
              <CampaignCounter label="Personagens" value={campanha._count.personagens} />
              <CampaignCounter label="Sessões" value={campanha._count.sessoes} />
            </div>
            {usuarioEhMestre || usuarioEhDono ? (
              <div className="flex flex-wrap gap-2">
                {usuarioEhMestre ? (
                  <>
                    <Button size="sm" onClick={onGoToSessions}>
                      <Icon name="calendar" className="mr-2 h-4 w-4" />
                      Agendar sessão
                    </Button>
                    <Button size="sm" variant="secondary" onClick={onGoToSessions}>
                      <Icon name="play" className="mr-2 h-4 w-4" />
                      Iniciar sessão
                    </Button>
                  </>
                ) : null}
                {usuarioEhDono ? (
                  <Button size="sm" variant="ghost" onClick={onOpenInvite}>
                    <Icon name="add" className="mr-2 h-4 w-4" />
                    Convidar membro
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CampaignNextSessionBanner({
  campanhaId,
  refreshKey,
  onGoToSessions,
  onEnterSession,
}: {
  campanhaId: number;
  refreshKey: number;
  onGoToSessions: () => void;
  onEnterSession: (sessaoId: number) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [sessoes, setSessoes] = useState<SessaoCampanhaResumo[]>([]);
  const [agendamentos, setAgendamentos] = useState<SessaoAgendadaResumo[]>([]);

  useEffect(() => {
    let cancelado = false;

    async function carregarResumo() {
      setLoading(true);
      try {
        const [agendadas, abertas] = await Promise.all([
          apiListarSessoesAgendadasCampanha(campanhaId),
          apiListarSessoesCampanha(campanhaId),
        ]);
        if (cancelado) return;
        setAgendamentos(agendadas);
        setSessoes(abertas);
      } catch {
        if (!cancelado) {
          setAgendamentos([]);
          setSessoes([]);
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    void carregarResumo();
    return () => {
      cancelado = true;
    };
  }, [campanhaId, refreshKey]);

  const sessaoAberta = useMemo(
    () =>
      sessoes.find(
        (sessao) => !sessao.encerradoEm && sessao.status !== 'ENCERRADA',
      ),
    [sessoes],
  );

  const proximaSessao = useMemo(() => {
    const agora = Date.now();
    return agendamentos
      .filter(
        (sessao) =>
          sessao.status === 'AGENDADA' && new Date(sessao.inicioEm).getTime() >= agora,
      )
      .sort(
        (a, b) =>
          new Date(a.inicioEm).getTime() - new Date(b.inicioEm).getTime(),
      )[0];
  }, [agendamentos]);

  if (loading) {
    return (
      <Card variant="glass" className="flex items-center gap-3 text-sm text-app-muted">
        <Icon name="spinner" className="h-4 w-4" />
        Lendo o quadro de missão...
      </Card>
    );
  }

  if (sessaoAberta) {
    return (
      <Card
        variant="glass"
        className="flex flex-col gap-3 border-app-primary/30 bg-app-primary/10 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-app-primary/20 text-app-primary">
            <Icon name="play" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-app-primary">
              Sessão em andamento
            </p>
            <h2 className="text-base font-semibold text-app-fg">
              {sessaoAberta.titulo}
            </h2>
            <p className="text-sm text-app-muted">
              Lobby aberto desde {formatarDataHoraCurta(sessaoAberta.iniciadoEm)}.
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => onEnterSession(sessaoAberta.id)}>
          Entrar no lobby
        </Button>
      </Card>
    );
  }

  return (
    <Card
      variant="glass"
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-app-info/15 text-app-info">
          <Icon name="calendar" className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-app-muted">
            Próxima sessão
          </p>
          {proximaSessao ? (
            <>
              <h2 className="text-base font-semibold text-app-fg">
                {proximaSessao.titulo} — {formatarDataHoraCurta(proximaSessao.inicioEm)}
              </h2>
              <p className="text-sm text-app-muted">
                Dossiê pronto para a próxima chamada da campanha.
              </p>
            </>
          ) : (
            <p className="text-sm text-app-muted">Nenhuma próxima sessão agendada.</p>
          )}
        </div>
      </div>
      <Button size="sm" variant="secondary" onClick={onGoToSessions}>
        Ver sessões
      </Button>
    </Card>
  );
}

export function CampaignTabs({
  activeTab,
  onChange,
}: {
  activeTab: CampaignTab;
  onChange: (tab: CampaignTab) => void;
}) {
  return (
    <nav
      aria-label="Navegação interna da campanha"
      className="overflow-x-auto rounded-2xl border border-app-border bg-app-surface/70 p-1"
    >
      <div className="flex min-w-max gap-1">
        {CAMPAIGN_TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              aria-pressed={active}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50 ${
                active
                  ? 'bg-app-primary text-white shadow-[0_0_18px_rgba(var(--primary-rgb),0.25)]'
                  : 'text-app-muted hover:bg-app-primary/10 hover:text-app-fg'
              }`}
            >
              <Icon name={tab.icon} className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function CampaignOverviewTab({
  campanha,
  usuarioEhDono,
  onOpenInvite,
  onChangeTab,
}: {
  campanha: CampanhaDetalheDto;
  usuarioEhDono: boolean;
  onOpenInvite: () => void;
  onChangeTab: (tab: CampaignTab) => void;
}) {
  const participantesPreview = campanha.membros.slice(0, 5);
  const participantesRestantes = Math.max(0, campanha.membros.length - 5);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
      <Card variant="glass" className="space-y-5">
        <SectionHeader
          icon="info"
          title="Dossiê da campanha"
          description="Resumo rápido para retomar a missão sem vasculhar a página inteira."
        />
        {campanha.descricao ? (
          <p className="text-sm leading-relaxed text-app-muted whitespace-pre-wrap">
            {campanha.descricao}
          </p>
        ) : (
          <EmptyState
            variant="plain"
            description="Esta campanha ainda não possui uma descrição."
            size="sm"
          />
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <OverviewShortcut
            icon="scroll"
            label="Sessões"
            value={campanha._count.sessoes}
            onClick={() => onChangeTab('sessoes')}
          />
          <OverviewShortcut
            icon="character-gojo"
            label="Personagens"
            value={campanha._count.personagens}
            onClick={() => onChangeTab('personagens')}
          />
          <OverviewShortcut
            icon="characters"
            label="Membros"
            value={campanha._count.membros}
            onClick={() => onChangeTab('membros')}
          />
        </div>
      </Card>

      <Card variant="glass" className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <SectionHeader
            icon="characters"
            title="Participantes"
            description="Equipe atual do dossiê."
          />
          {usuarioEhDono ? (
            <Button size="xs" variant="ghost" onClick={onOpenInvite}>
              Convidar
            </Button>
          ) : null}
        </div>
        <div className="space-y-2">
          {participantesPreview.map((membro) => (
            <div
              key={membro.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-app-border/60 bg-app-bg/40 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-app-fg">
                  {membro.usuario.apelido}
                </p>
                <p className="text-xs text-app-muted">
                  {membro.usuarioId === campanha.donoId ? 'Mestre principal' : membro.papel}
                </p>
              </div>
              <Badge color={membro.usuarioId === campanha.donoId ? 'purple' : 'gray'}>
                {membro.usuarioId === campanha.donoId ? 'Dono' : membro.papel}
              </Badge>
            </div>
          ))}
          {participantesRestantes > 0 ? (
            <button
              type="button"
              onClick={() => onChangeTab('membros')}
              className="w-full rounded-xl border border-dashed border-app-border px-3 py-2 text-sm font-semibold text-app-primary transition-colors hover:border-app-primary/50 hover:bg-app-primary/10"
            >
              Ver mais {participantesRestantes} participante(s)
            </button>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

export function CampaignInviteModal({
  isOpen,
  campanhaId,
  onClose,
  onInvite,
  onInviteFriend,
}: {
  isOpen: boolean;
  campanhaId: number;
  onClose: () => void;
  onInvite: (data: {
    email?: string;
    apelido?: string;
    usuarioId?: number;
    papel: 'MESTRE' | 'JOGADOR' | 'OBSERVADOR';
  }) => Promise<void>;
  onInviteFriend: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Convidar membro" size="xl">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card variant="flat" className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-app-fg">
              Convite direto
            </h3>
            <p className="text-sm text-app-muted">
              Envie por email, apelido ou identificador do usuário e defina o papel.
            </p>
          </div>
          <InviteMemberForm onInvite={onInvite} />
        </Card>

        <Card variant="flat" className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-app-fg">
              Convidar amigos
            </h3>
            <p className="text-sm text-app-muted">
              Use sua lista de contatos para chamar alguém para a mesa.
            </p>
          </div>
          <InviteFriendsPanel campanhaId={campanhaId} onInvite={onInviteFriend} />
        </Card>
      </div>
    </Modal>
  );
}

export function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: 'info' | 'scroll' | 'character-gojo' | 'characters';
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-app-primary/10 text-app-primary">
        <Icon name={icon} className="h-4 w-4" />
      </div>
      <div>
        <h2 className="text-lg font-bold tracking-tight text-app-fg">{title}</h2>
        {description ? (
          <p className="text-sm text-app-muted">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

function CampaignCounter({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-r border-app-border/60 px-3 py-1.5 last:border-r-0 sm:px-5">
      <p className="mb-0.5 text-[0.65rem] font-bold uppercase tracking-widest text-app-muted">
        {label}
      </p>
      <p className="text-lg font-bold text-app-fg sm:text-xl">{value}</p>
    </div>
  );
}

function OverviewShortcut({
  icon,
  label,
  value,
  onClick,
}: {
  icon: 'scroll' | 'character-gojo' | 'characters';
  label: string;
  value: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-app-border bg-app-bg/40 p-4 text-left transition-all hover:border-app-primary/40 hover:bg-app-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50"
    >
      <Icon name={icon} className="mb-3 h-5 w-5 text-app-primary" />
      <p className="text-2xl font-bold text-app-fg">{value}</p>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-app-muted">
        {label}
      </p>
    </button>
  );
}

function formatarDataHoraCurta(value: string): string {
  const data = new Date(value);
  if (Number.isNaN(data.getTime())) return 'data indefinida';

  const hoje = new Date();
  const mesmoDia =
    data.getFullYear() === hoje.getFullYear() &&
    data.getMonth() === hoje.getMonth() &&
    data.getDate() === hoje.getDate();
  const hora = data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (mesmoDia) return `Hoje, ${hora}`;

  return `${data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })} às ${hora}`;
}
