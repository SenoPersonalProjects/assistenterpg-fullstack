'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { DiceMessageCard } from '@/components/campanha/sessao/DiceMessageCard';
import type { MensagemChatSessao } from '@/lib/types';
import { textoSeguro } from '@/lib/campanha/sessao-formatters';
import { parseDiceMessageGroup } from '@/lib/campanha/sessao-dice';
import { formatarDataHora } from '@/lib/utils/formatters';

const LIMIAR_AGRUPAMENTO_MS = 5 * 60 * 1000;
const ALTURA_MAX_TEXTAREA = 120;
const LIMITE_MENSAGEM_CHAT = 120;

type ChatPanelProps = {
  chat: MensagemChatSessao[];
  mensagem: string;
  enviandoMensagem: boolean;
  sessaoEncerrada: boolean;
  usuarioId?: number | null;
  erro?: string | null;
  onMensagemChange: (mensagem: string) => void;
  onEnviarMensagem: () => void;
  fimChatRef: RefObject<HTMLDivElement | null>;
};

export function ChatPanel({
  chat,
  mensagem,
  enviandoMensagem,
  sessaoEncerrada,
  usuarioId,
  erro,
  onMensagemChange,
  onEnviarMensagem,
  fimChatRef,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [autoScrollAtivo, setAutoScrollAtivo] = useState(true);

  const podeEnviar =
    !sessaoEncerrada && !enviandoMensagem && mensagem.trim().length > 0;
  const ultimaMensagem = chat[chat.length - 1];
  const ultimaEhMinha =
    typeof usuarioId === 'number' &&
    ultimaMensagem?.autor.usuarioId === usuarioId;
  const mostrarPular = !autoScrollAtivo && chat.length > 0;
  const limiteAviso = Math.floor(LIMITE_MENSAGEM_CHAT * 0.8);
  const contadorClasse =
    mensagem.length >= LIMITE_MENSAGEM_CHAT
      ? 'text-app-danger'
      : mensagem.length >= limiteAviso
        ? 'text-app-warning'
        : 'text-app-muted';

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const altura = Math.min(textarea.scrollHeight, ALTURA_MAX_TEXTAREA);
    textarea.style.height = `${altura}px`;
  }, [mensagem]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    if (autoScrollAtivo || ultimaEhMinha) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: autoScrollAtivo ? 'smooth' : 'auto',
      });
    }
  }, [chat.length, autoScrollAtivo, ultimaEhMinha]);

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const distancia =
      container.scrollHeight - (container.scrollTop + container.clientHeight);
    setAutoScrollAtivo(distancia < 100);
  };

  const handleEnviar = () => {
    if (!podeEnviar) return;
    setAutoScrollAtivo(true);
    onEnviarMensagem();
  };

  const handlePularParaFim = () => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    setAutoScrollAtivo(true);
  };

  const mensagensRenderizadas = useMemo(
    () =>
      chat.map((item, index) => {
        const apelido = textoSeguro(item.autor.apelido);
        const personagemNome = textoSeguro(item.autor.personagemNome);
        const autorLabel = apelido || 'Autor desconhecido';
        const autorKey = `${item.autor.usuarioId ?? 'anon'}:${apelido}:${personagemNome}`;
        const anterior = index > 0 ? chat[index - 1] : null;
        const anteriorKey = anterior
          ? `${anterior.autor.usuarioId ?? 'anon'}:${textoSeguro(
              anterior.autor.apelido,
            )}:${textoSeguro(anterior.autor.personagemNome)}`
          : null;
        const dataAtual = new Date(item.criadoEm);
        const dataAnterior = anterior ? new Date(anterior.criadoEm) : null;
        const diffMs =
          dataAnterior &&
          !Number.isNaN(dataAnterior.getTime()) &&
          !Number.isNaN(dataAtual.getTime())
            ? dataAtual.getTime() - dataAnterior.getTime()
            : null;
        const mesmoAutor = anteriorKey === autorKey;
        const dentroDoAgrupamento = diffMs !== null && diffMs <= LIMIAR_AGRUPAMENTO_MS;
        const mostrarCabecalho = !anterior || !mesmoAutor || !dentroDoAgrupamento;
        const ehMinhaMensagem =
          typeof usuarioId === 'number' && item.autor.usuarioId === usuarioId;

        const diceGroup = parseDiceMessageGroup(item.mensagem);

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: ehMinhaMensagem ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex flex-col ${ehMinhaMensagem ? 'items-end' : 'items-start'} ${
              mostrarCabecalho ? 'mt-4' : 'mt-0.5'
            }`}
          >
            {mostrarCabecalho && (
              <div className={`mb-1 flex items-center gap-2 px-1 text-[10px] font-black uppercase tracking-widest text-app-muted ${ehMinhaMensagem ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className={ehMinhaMensagem ? 'text-app-primary' : 'text-app-fg'}>
                  {ehMinhaMensagem ? 'Você' : autorLabel}
                </span>
                {personagemNome && (
                  <span className="opacity-50">· {personagemNome}</span>
                )}
                <span className="text-[9px] opacity-40">{formatarDataHora(item.criadoEm)}</span>
              </div>
            )}

            <div className={`relative max-w-[90%] rounded-2xl px-3 py-2 text-sm shadow-sm transition-all ${
              diceGroup
                ? 'bg-transparent p-0 shadow-none'
                : ehMinhaMensagem
                  ? 'rounded-tr-none bg-app-primary text-white'
                  : 'rounded-tl-none bg-app-surface border border-app-border/10 text-app-fg'
            }`}>
              {diceGroup ? (
                <div className="flex flex-col gap-2 w-full">
                  {diceGroup.payloads.map((payload, idx) => (
                    <DiceMessageCard key={`${item.id}-dice-${idx}`} payload={payload} />
                  ))}
                </div>
              ) : (
                <p className="leading-relaxed font-medium">{textoSeguro(item.mensagem)}</p>
              )}
            </div>
          </motion.div>
        );
      }),
    [chat, usuarioId],
  );

  return (
    <div className="relative flex h-[600px] flex-col rounded-2xl border border-app-border/10 bg-app-bg/30">
      {erro && <ErrorAlert message={erro} className="rounded-none border-0 border-b border-app-danger/20" />}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-2 scrollbar-none space-y-1"
        onScroll={handleScroll}
      >
        {chat.length === 0 ? (
          <div className="flex h-full items-center justify-center opacity-40">
            <EmptyState
              variant="session"
              size="sm"
              icon="chat"
              title="Sem mensagens"
              description="Inicie a conversa da sessão."
              className="text-center"
            />
          </div>
        ) : (
          <>
            {mensagensRenderizadas}
            <div ref={fimChatRef} />
          </>
        )}
      </div>

      <AnimatePresence>
        {mostrarPular && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-32 left-1/2 z-30 -translate-x-1/2"
          >
            <Button
              size="xs"
              variant="secondary"
              onClick={handlePularParaFim}
              className="rounded-full font-black uppercase tracking-widest shadow-2xl ring-2 ring-app-primary/20"
            >
              <Icon name="chevron-down" className="mr-1 h-3 w-3" />
              Novas mensagens
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-3 bg-app-surface/40 backdrop-blur-md border-t border-app-border/10 rounded-b-2xl">
        <div className="relative group">
          <textarea
            ref={textareaRef}
            value={mensagem}
            onChange={(event) => onMensagemChange(event.target.value)}
            maxLength={LIMITE_MENSAGEM_CHAT}
            disabled={sessaoEncerrada || enviandoMensagem}
            rows={1}
            placeholder={sessaoEncerrada ? "Sessão encerrada" : "Digite uma mensagem..."}
            className="w-full resize-none rounded-xl border border-app-border/10 bg-app-bg/50 px-4 py-3 pr-12 text-sm font-medium transition-all focus:border-app-primary/50 focus:bg-app-bg focus:outline-none focus:ring-4 focus:ring-app-primary/10 disabled:opacity-50"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleEnviar();
              }
            }}
          />
          <button
            onClick={handleEnviar}
            disabled={!podeEnviar}
            className={`absolute right-2 top-2 h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
              podeEnviar
                ? 'bg-app-primary text-white shadow-lg shadow-app-primary/20 hover:scale-105 active:scale-95'
                : 'bg-app-muted-surface text-app-muted opacity-50'
            }`}
          >
            <Icon name={enviandoMensagem ? "spinner" : "forward"} className={`h-4 w-4 ${enviandoMensagem ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between px-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-app-muted opacity-60">
            {sessaoEncerrada ? 'Leitura Apenas' : 'Shift+Enter para quebra'}
          </span>
          <span className={`text-[9px] font-black uppercase tracking-widest ${contadorClasse}`}>
            {mensagem.length}/{LIMITE_MENSAGEM_CHAT}
          </span>
        </div>
      </div>
    </div>
  );
}
