'use client';

import { useState } from 'react';
import type { RefObject } from 'react';
import { SessionPanel } from '@/components/campanha/sessao/SessionPanel';
import { Icon } from '@/components/ui/Icon';
import {
  SessionSidebarTabs,
  type SessionSidebarTabId,
} from '@/components/campanha/sessao/SessionSidebarTabs';
import { ParticipantsPanel } from '@/components/campanha/sessao/ParticipantsPanel';
import { TimelinePanel } from '@/components/campanha/sessao/TimelinePanel';
import { ChatPanel } from '@/components/campanha/sessao/ChatPanel';
import { DiceChatPanel } from '@/components/campanha/sessao/DiceChatPanel';
import { SessionNotesPanel } from '@/components/campanha/sessao/SessionNotesPanel';
import { SessionItemsPanel } from '@/components/campanha/sessao/SessionItemsPanel';
import type {
  EventoSessaoTimeline,
  MensagemChatSessao,
  SessaoCampanhaDetalhe,
} from '@/lib/types';

type SessionSidebarPanelProps = {
  activeTab: SessionSidebarTabId;
  onChangeTab: (tab: SessionSidebarTabId) => void;
  chat: MensagemChatSessao[];
  rolagens: MensagemChatSessao[];
  eventosSessao: EventoSessaoTimeline[];
  participantes: SessaoCampanhaDetalhe['participantes'];
  personagens: SessaoCampanhaDetalhe['cards'];
  npcs: SessaoCampanhaDetalhe['npcs'];
  onlineSet: Set<number>;
  campanhaId: number;
  sessaoId: number;
  cenaId: number | null;
  sessaoEncerrada: boolean;
  podeControlarSessao: boolean;
  desfazendoEventoId: number | null;
  erroEventos?: string | null;
  erroChat?: string | null;
  erroRolagens?: string | null;
  enviandoMensagem: boolean;
  enviandoRolagem: boolean;
  mensagem: string;
  mensagemRolagem: string;
  usuarioId?: number | null;
  animacaoModalAtiva: boolean;
  onToggleAnimacaoModal: (ativo: boolean) => void;
  fimChatRef: RefObject<HTMLDivElement | null>;
  onMensagemChange: (mensagem: string) => void;
  onEnviarMensagem: () => void;
  onMensagemRolagemChange: (mensagem: string) => void;
  onEnviarRolagem: () => void;
  onAbrirDetalhes: (evento: EventoSessaoTimeline) => void;
  onDesfazerEvento: (evento: EventoSessaoTimeline) => void;
  realtimeStatus?: 'online' | 'reconnecting' | 'polling';
};

export function SessionSidebarPanel({
  activeTab,
  onChangeTab,
  chat,
  rolagens,
  eventosSessao,
  participantes,
  personagens,
  npcs,
  onlineSet,
  campanhaId,
  sessaoId,
  cenaId,
  sessaoEncerrada,
  podeControlarSessao,
  desfazendoEventoId,
  erroEventos,
  erroChat,
  erroRolagens,
  enviandoMensagem,
  enviandoRolagem,
  mensagem,
  mensagemRolagem,
  usuarioId,
  animacaoModalAtiva,
  onToggleAnimacaoModal,
  fimChatRef,
  onMensagemChange,
  onEnviarMensagem,
  onMensagemRolagemChange,
  onEnviarRolagem,
  onAbrirDetalhes,
  onDesfazerEvento,
  realtimeStatus,
}: SessionSidebarPanelProps) {
  const statusTempoReal = realtimeStatus ?? 'polling';
  const labelTempoReal =
    statusTempoReal === 'online'
      ? 'Conectado'
      : statusTempoReal === 'reconnecting'
        ? 'Reconectando'
        : 'Atualizacao periodica';
  const classeTempoReal =
    statusTempoReal === 'online'
      ? 'text-app-success'
      : statusTempoReal === 'reconnecting'
        ? 'text-app-warning'
        : '';
  const mostrarEventos = podeControlarSessao;
  const tabAtiva =
    !mostrarEventos && activeTab === 'eventos' ? 'chat' : activeTab;
  const [totalAnotacoes, setTotalAnotacoes] = useState(0);
  const [totalItens, setTotalItens] = useState(0);

  return (
    <SessionPanel
      title="Painel lateral"
      subtitle={
        mostrarEventos
          ? 'Chat, rolagens, anotacoes, eventos e participantes da sessao.'
          : 'Chat, rolagens, anotacoes e participantes da sessao.'
      }
      tone="aside"
      right={
        <span className={`session-panel-meta ${classeTempoReal}`}>
          <Icon
            name={statusTempoReal === 'online' ? 'bolt' : 'refresh'}
            className="h-3.5 w-3.5"
          />
          {labelTempoReal}
        </span>
      }
    >
      <SessionSidebarTabs
        activeTab={tabAtiva}
        onChange={onChangeTab}
        totalChat={chat.length}
        totalRolagens={rolagens.length}
        totalAnotacoes={totalAnotacoes}
        totalItens={totalItens}
        totalEventos={eventosSessao.length}
        totalParticipantes={participantes.length}
        mostrarEventos={mostrarEventos}
      >
        {tabAtiva === 'participantes' ? (
          <ParticipantsPanel participantes={participantes} onlineSet={onlineSet} />
        ) : null}

        {tabAtiva === 'eventos' && mostrarEventos ? (
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

        {tabAtiva === 'chat' ? (
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

        {tabAtiva === 'rolagens' ? (
          <DiceChatPanel
            chat={rolagens}
            mensagem={mensagemRolagem}
            enviandoMensagem={enviandoRolagem}
            sessaoEncerrada={sessaoEncerrada}
            usuarioId={usuarioId}
            erro={erroRolagens}
            animacaoModalAtiva={animacaoModalAtiva}
            onToggleAnimacaoModal={onToggleAnimacaoModal}
            onMensagemChange={onMensagemRolagemChange}
            onEnviarMensagem={onEnviarRolagem}
          />
        ) : null}

        {tabAtiva === 'anotacoes' ? (
          <SessionNotesPanel
            campanhaId={campanhaId}
            sessaoId={sessaoId}
            onCountChange={setTotalAnotacoes}
          />
        ) : null}

        {tabAtiva === 'itens' ? (
          <SessionItemsPanel
            campanhaId={campanhaId}
            sessaoId={sessaoId}
            cenaId={cenaId}
            personagens={personagens}
            npcs={npcs}
            usuarioId={usuarioId}
            onCountChange={setTotalItens}
          />
        ) : null}
      </SessionSidebarTabs>
    </SessionPanel>
  );
}
