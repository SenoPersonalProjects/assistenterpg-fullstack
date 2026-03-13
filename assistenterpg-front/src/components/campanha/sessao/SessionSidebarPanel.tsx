'use client';

import type { RefObject } from 'react';
import { Badge } from '@/components/ui/Badge';
import { SessionPanel } from '@/components/campanha/sessao/SessionPanel';
import {
  SessionSidebarTabs,
  type SessionSidebarTabId,
} from '@/components/campanha/sessao/SessionSidebarTabs';
import { ParticipantsPanel } from '@/components/campanha/sessao/ParticipantsPanel';
import { TimelinePanel } from '@/components/campanha/sessao/TimelinePanel';
import { ChatPanel } from '@/components/campanha/sessao/ChatPanel';
import type {
  EventoSessaoTimeline,
  MensagemChatSessao,
  SessaoCampanhaDetalhe,
} from '@/lib/types';

type SessionSidebarPanelProps = {
  activeTab: SessionSidebarTabId;
  onChangeTab: (tab: SessionSidebarTabId) => void;
  chat: MensagemChatSessao[];
  eventosSessao: EventoSessaoTimeline[];
  participantes: SessaoCampanhaDetalhe['participantes'];
  onlineSet: Set<number>;
  sessaoEncerrada: boolean;
  podeControlarSessao: boolean;
  desfazendoEventoId: number | null;
  erroEventos?: string | null;
  erroChat?: string | null;
  enviandoMensagem: boolean;
  mensagem: string;
  usuarioId?: number | null;
  fimChatRef: RefObject<HTMLDivElement | null>;
  onMensagemChange: (mensagem: string) => void;
  onEnviarMensagem: () => void;
  onAbrirDetalhes: (evento: EventoSessaoTimeline) => void;
  onDesfazerEvento: (evento: EventoSessaoTimeline) => void;
  realtimeAtivo: boolean;
};

export function SessionSidebarPanel({
  activeTab,
  onChangeTab,
  chat,
  eventosSessao,
  participantes,
  onlineSet,
  sessaoEncerrada,
  podeControlarSessao,
  desfazendoEventoId,
  erroEventos,
  erroChat,
  enviandoMensagem,
  mensagem,
  usuarioId,
  fimChatRef,
  onMensagemChange,
  onEnviarMensagem,
  onAbrirDetalhes,
  onDesfazerEvento,
  realtimeAtivo,
}: SessionSidebarPanelProps) {
  return (
    <SessionPanel
      title="Painel lateral"
      subtitle="Chat, eventos e participantes da sessao."
      right={
        <Badge color={realtimeAtivo ? 'cyan' : 'yellow'} size="sm">
          {realtimeAtivo ? 'Tempo real' : 'Atualizacao periodica'}
        </Badge>
      }
    >
      <SessionSidebarTabs
        activeTab={activeTab}
        onChange={onChangeTab}
        totalChat={chat.length}
        totalEventos={eventosSessao.length}
        totalParticipantes={participantes.length}
      >
        {activeTab === 'participantes' ? (
          <ParticipantsPanel participantes={participantes} onlineSet={onlineSet} />
        ) : null}

        {activeTab === 'eventos' ? (
          <TimelinePanel
            eventosSessao={eventosSessao}
            sessaoEncerrada={sessaoEncerrada}
            podeControlarSessao={podeControlarSessao}
            desfazendoEventoId={desfazendoEventoId}
            erro={erroEventos}
            onAbrirDetalhes={onAbrirDetalhes}
            onDesfazerEvento={onDesfazerEvento}
          />
        ) : null}

        {activeTab === 'chat' ? (
          <ChatPanel
            chat={chat}
            mensagem={mensagem}
            enviandoMensagem={enviandoMensagem}
            sessaoEncerrada={sessaoEncerrada}
            usuarioId={usuarioId}
            erro={erroChat}
            onMensagemChange={onMensagemChange}
            onEnviarMensagem={onEnviarMensagem}
            fimChatRef={fimChatRef}
          />
        ) : null}
      </SessionSidebarTabs>
    </SessionPanel>
  );
}
