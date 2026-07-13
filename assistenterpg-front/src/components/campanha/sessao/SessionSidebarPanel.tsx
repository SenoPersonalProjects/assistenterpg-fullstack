'use client';

import { useCallback, useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SessionPanel } from '@/components/campanha/sessao/SessionPanel';
import { Icon, type IconName } from '@/components/ui/Icon';
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
import { SessionReportPanel } from '@/components/campanha/sessao/SessionReportPanel';
import type {
  EventoSessaoTimeline,
  MensagemChatSessao,
  SessaoCampanhaRelatorio,
  SessaoCampanhaDetalhe,
  UserErrorState,
} from '@/lib/types';
import {
  apiCriarSolicitacaoAmizadePorUsuarioId,
  apiListarAmigos,
  apiListarSolicitacoesAmizade,
  criarErroUsuario,
} from '@/lib/api';

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
  relatorioSessao: SessaoCampanhaRelatorio | null;
  loadingRelatorio?: boolean;
  erroRelatorio?: UserErrorState | null;
  podeControlarSessao: boolean;
  desfazendoEventoId: number | null;
  erroEventos?: UserErrorState | null;
  erroChat?: UserErrorState | null;
  erroRolagens?: UserErrorState | null;
  enviandoMensagem: boolean;
  enviandoRolagem: boolean;
  mensagem: string;
  mensagemRolagem: string;
  rolagemSecreta?: boolean;
  contextoRolagem?: 'ATAQUE' | 'PERICIA' | 'DANO' | 'OUTRO';
  dtRolagem?: string;
  bonusEscaladaDados?: number;
  peritoPendenteChatLabel?: string | null;
  usuarioId?: number | null;
  animacaoModalAtiva: boolean;
  onToggleAnimacaoModal: (ativo: boolean) => void;
  fimChatRef: RefObject<HTMLDivElement | null>;
  onMensagemChange: (mensagem: string) => void;
  onEnviarMensagem: () => void;
  onMensagemRolagemChange: (mensagem: string) => void;
  onToggleRolagemSecreta?: (ativo: boolean) => void;
  onContextoRolagemChange?: (contexto: 'ATAQUE' | 'PERICIA' | 'DANO' | 'OUTRO') => void;
  onDtRolagemChange?: (valor: string) => void;
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
  relatorioSessao,
  loadingRelatorio = false,
  erroRelatorio,
  podeControlarSessao,
  desfazendoEventoId,
  erroEventos,
  erroChat,
  erroRolagens,
  enviandoMensagem,
  enviandoRolagem,
  mensagem,
  mensagemRolagem,
  rolagemSecreta,
  contextoRolagem,
  dtRolagem,
  bonusEscaladaDados,
  peritoPendenteChatLabel,
  usuarioId,
  animacaoModalAtiva,
  onToggleAnimacaoModal,
  fimChatRef,
  onMensagemChange,
  onEnviarMensagem,
  onMensagemRolagemChange,
  onToggleRolagemSecreta,
  onContextoRolagemChange,
  onDtRolagemChange,
  onEnviarRolagem,
  onAbrirDetalhes,
  onDesfazerEvento,
  realtimeStatus,
}: SessionSidebarPanelProps) {
  const statusTempoReal = realtimeStatus ?? 'polling';
  const statusConfig: Record<
    'online' | 'reconnecting' | 'polling',
    { label: string; color: string; icon: IconName }
  > = {
    online: { label: 'Conectado', color: 'text-app-success', icon: 'bolt' },
    reconnecting: { label: 'Reconectando', color: 'text-app-warning', icon: 'refresh' },
    polling: { label: 'Sincronizado', color: 'text-app-muted', icon: 'refresh' },
  };
  const statusAtual = statusConfig[statusTempoReal];

  const mostrarEventos = podeControlarSessao;
  const tabAtiva = !mostrarEventos && activeTab === 'eventos' ? 'chat' : activeTab;

  const [totalAnotacoes, setTotalAnotacoes] = useState(0);
  const [totalItens, setTotalItens] = useState(0);
  const [amigoIds, setAmigoIds] = useState<Set<number>>(() => new Set());
  const [solicitacoesEnviadasIds, setSolicitacoesEnviadasIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [solicitacoesRecebidasIds, setSolicitacoesRecebidasIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [carregandoAmizades, setCarregandoAmizades] = useState(false);
  const [amizadeAcaoUsuarioId, setAmizadeAcaoUsuarioId] = useState<number | null>(
    null,
  );
  const [erroAmizades, setErroAmizades] = useState<UserErrorState | null>(null);

  const carregarRelacionamentosParticipantes = useCallback(async () => {
    if (!usuarioId) return;

    setCarregandoAmizades(true);
    setErroAmizades(null);
    try {
      const [amigos, solicitacoes] = await Promise.all([
        apiListarAmigos(),
        apiListarSolicitacoesAmizade(),
      ]);
      setAmigoIds(new Set(amigos.map((amigo) => amigo.id)));
      setSolicitacoesEnviadasIds(
        new Set(solicitacoes.enviadas.map((solicitacao) => solicitacao.usuario.id)),
      );
      setSolicitacoesRecebidasIds(
        new Set(solicitacoes.recebidas.map((solicitacao) => solicitacao.usuario.id)),
      );
    } catch (error) {
      setErroAmizades(criarErroUsuario(error));
    } finally {
      setCarregandoAmizades(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    if (tabAtiva !== 'participantes') return;
    void carregarRelacionamentosParticipantes();
  }, [carregarRelacionamentosParticipantes, tabAtiva]);

  const handleEnviarSolicitacaoParticipante = useCallback(
    async (participanteUsuarioId: number) => {
      if (!usuarioId || participanteUsuarioId === usuarioId) return;

      setAmizadeAcaoUsuarioId(participanteUsuarioId);
      setErroAmizades(null);
      try {
        await apiCriarSolicitacaoAmizadePorUsuarioId(participanteUsuarioId);
        setSolicitacoesEnviadasIds((estadoAtual) => {
          const proximo = new Set(estadoAtual);
          proximo.add(participanteUsuarioId);
          return proximo;
        });
        await carregarRelacionamentosParticipantes();
      } catch (error) {
        setErroAmizades(criarErroUsuario(error));
      } finally {
        setAmizadeAcaoUsuarioId(null);
      }
    },
    [carregarRelacionamentosParticipantes, usuarioId],
  );

  return (
    <SessionPanel
      title="Painel lateral"
      subtitle="Chat, rolagens, anotações, itens e participantes da sessão."
      tone="aside"
      right={
        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${statusAtual.color}`}>
          <Icon name={statusAtual.icon} className="h-3 w-3" />
          {statusAtual.label}
        </div>
      }
    >
      <SessionSidebarTabs
        activeTab={tabAtiva}
        onChange={onChangeTab}
        totalChat={chat.length}
        totalRolagens={rolagens.length}
        totalAnotacoes={totalAnotacoes}
        totalItens={totalItens}
        totalRelatorio={relatorioSessao?.personagens.length ?? 0}
        mostrarRelatorio={sessaoEncerrada}
        totalEventos={eventosSessao.length}
        totalParticipantes={participantes.length}
        mostrarEventos={mostrarEventos}
      >
        <div className="mt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={tabAtiva}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {tabAtiva === 'participantes' && (
                <ParticipantsPanel
                  participantes={participantes}
                  onlineSet={onlineSet}
                  usuarioAtualId={usuarioId ?? null}
                  amigoIds={amigoIds}
                  solicitacoesEnviadasIds={solicitacoesEnviadasIds}
                  solicitacoesRecebidasIds={solicitacoesRecebidasIds}
                  carregandoAmizades={carregandoAmizades}
                  amizadeAcaoUsuarioId={amizadeAcaoUsuarioId}
                  erroAmizades={erroAmizades}
                  onEnviarSolicitacao={handleEnviarSolicitacaoParticipante}
                />
              )}

              {tabAtiva === 'eventos' && mostrarEventos && (
                <TimelinePanel
                  eventosSessao={eventosSessao}
                  sessaoEncerrada={sessaoEncerrada}
                  podeControlarSessao={podeControlarSessao}
                  desfazendoEventoId={desfazendoEventoId}
                  erro={erroEventos}
                  onAbrirDetalhes={onAbrirDetalhes}
                  onDesfazerEvento={onDesfazerEvento}
                />
              )}

              {tabAtiva === 'chat' && (
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
              )}

              {tabAtiva === 'rolagens' && (
                <DiceChatPanel
                  chat={rolagens}
                  mensagem={mensagemRolagem}
                  enviandoMensagem={enviandoRolagem}
                  sessaoEncerrada={sessaoEncerrada}
                  usuarioId={usuarioId}
                  erro={erroRolagens}
                  animacaoModalAtiva={animacaoModalAtiva}
                  podeUsarRolagemSecreta={podeControlarSessao}
                  rolagemSecreta={rolagemSecreta}
                  contextoRolagem={contextoRolagem}
                  dtRolagem={dtRolagem}
                  bonusEscaladaDados={bonusEscaladaDados}
                  peritoPendenteChatLabel={peritoPendenteChatLabel}
                  onToggleAnimacaoModal={onToggleAnimacaoModal}
                  onToggleRolagemSecreta={onToggleRolagemSecreta}
                  onContextoRolagemChange={onContextoRolagemChange}
                  onDtRolagemChange={onDtRolagemChange}
                  onMensagemChange={onMensagemRolagemChange}
                  onEnviarMensagem={onEnviarRolagem}
                />
              )}

              {tabAtiva === 'anotacoes' && (
                <SessionNotesPanel
                  campanhaId={campanhaId}
                  sessaoId={sessaoId}
                  onCountChange={setTotalAnotacoes}
                />
              )}

              {tabAtiva === 'itens' && (
                <SessionItemsPanel
                  campanhaId={campanhaId}
                  sessaoId={sessaoId}
                  cenaId={cenaId}
                  sessaoEncerrada={sessaoEncerrada}
                  personagens={personagens}
                  npcs={npcs}
                  usuarioId={usuarioId}
                  onCountChange={setTotalItens}
                />
              )}

              {tabAtiva === 'relatorio' && sessaoEncerrada && (
                <SessionReportPanel
                  relatorio={relatorioSessao}
                  loading={loadingRelatorio}
                  erro={erroRelatorio}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </SessionSidebarTabs>
    </SessionPanel>
  );
}
