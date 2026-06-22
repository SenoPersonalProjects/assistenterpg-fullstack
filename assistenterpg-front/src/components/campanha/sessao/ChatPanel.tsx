'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { DiceMessageCard } from '@/components/campanha/sessao/DiceMessageCard';
import type { MensagemChatSessao, UserErrorState } from '@/lib/types';
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
  erro?: UserErrorState | null;
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
      ? 'session-chat__counter session-chat__counter--danger'
      : mensagem.length >= limiteAviso
        ? 'session-chat__counter session-chat__counter--warn'
        : 'session-chat__counter';

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
        const bubbleClassName = `session-chat__bubble${
          diceGroup ? ' session-chat__bubble--dice' : ''
        }`;

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: ehMinhaMensagem ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`session-chat__message${
              ehMinhaMensagem ? ' session-chat__message--self' : ''
            }${!mostrarCabecalho ? ' session-chat__message--grouped' : ''}`}
          >
            {mostrarCabecalho ? (
              <div className="session-chat__header">
                <span className="session-chat__author">
                  {ehMinhaMensagem ? 'Você' : autorLabel}
                </span>
                {personagemNome ? (
                  <span className="session-chat__meta">({personagemNome})</span>
                ) : null}
                <span className="session-chat__meta">
                  {formatarDataHora(item.criadoEm)}
                </span>
              </div>
            ) : null}
            <div className={bubbleClassName}>
              {diceGroup ? (
                <div className="session-chat__dice-list">
                  {diceGroup.payloads.map((payload, idx) => (
                    <DiceMessageCard key={`${item.id}-dice-${idx}`} payload={payload} />
                  ))}
                </div>
              ) : (
                <p className="session-chat__text">{textoSeguro(item.mensagem)}</p>
              )}
            </div>
          </motion.div>
        );
      }),
    [chat, usuarioId],
  );

  return (
    <div className="session-chat">
      {erro ? <ErrorAlert message={erro} /> : null}

      <div ref={scrollRef} className="session-chat__scroll" onScroll={handleScroll}>
        {chat.length === 0 ? (
          <EmptyState
            variant="session"
            size="sm"
            icon="chat"
            title="Sem mensagens"
            description="Inicie a conversa da sessão."
          />
        ) : (
          <>
            {mensagensRenderizadas}
            <div ref={fimChatRef} />
          </>
        )}
      </div>

      <AnimatePresence>
        {mostrarPular ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="session-chat__jump"
          >
            <Button size="xs" variant="secondary" onClick={handlePularParaFim}>
              <Icon name="chevron-down" className="mr-1 h-3 w-3" />
              Novas mensagens
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="session-chat__input-row">
        <textarea
          ref={textareaRef}
          value={mensagem}
          onChange={(event) => onMensagemChange(event.target.value)}
          maxLength={LIMITE_MENSAGEM_CHAT}
          disabled={sessaoEncerrada || enviandoMensagem}
          rows={1}
          placeholder={sessaoEncerrada ? 'Sessão encerrada' : 'Digite uma mensagem...'}
          className="session-chat__input"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleEnviar();
            }
          }}
        />
        <div className="session-chat__footer">
          <div className="session-chat__footer-meta">
            <span className="session-chat__hint">
              {sessaoEncerrada ? 'Modo leitura' : 'Shift+Enter para quebra'}
            </span>
            <span className={contadorClasse}>
              {mensagem.length}/{LIMITE_MENSAGEM_CHAT}
            </span>
          </div>
          <Button onClick={handleEnviar} disabled={!podeEnviar}>
            <Icon
              name={enviandoMensagem ? 'spinner' : 'forward'}
              className={`mr-1.5 h-4 w-4 ${enviandoMensagem ? 'animate-spin' : ''}`}
            />
            {enviandoMensagem ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
