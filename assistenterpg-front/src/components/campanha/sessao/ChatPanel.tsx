'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import type { MensagemChatSessao } from '@/lib/types';
import { textoSeguro } from '@/lib/campanha/sessao-formatters';
import { formatarDataHora } from '@/lib/utils/formatters';

const LIMIAR_AGRUPAMENTO_MS = 5 * 60 * 1000;
const ALTURA_MAX_TEXTAREA = 180;
const LIMITE_MENSAGEM_CHAT = 100;

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
  const enviandoRef = useRef(false);
  const [autoScrollAtivo, setAutoScrollAtivo] = useState(true);
  const [sucessoEnvio, setSucessoEnvio] = useState(false);

  const podeEnviar =
    !sessaoEncerrada && !enviandoMensagem && mensagem.trim().length > 0;
  const ultimaMensagem = chat[chat.length - 1];
  const ultimaEhMinha =
    typeof usuarioId === 'number' &&
    ultimaMensagem?.autor.usuarioId === usuarioId;
  const mostrarPular = !autoScrollAtivo && chat.length > 0;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const altura = Math.min(textarea.scrollHeight, ALTURA_MAX_TEXTAREA);
    textarea.style.height = `${altura}px`;
  }, [mensagem]);

  useEffect(() => {
    const estavaEnviando = enviandoRef.current;
    if (estavaEnviando && !enviandoMensagem && mensagem.trim() === '' && !erro) {
      const showId = window.setTimeout(() => setSucessoEnvio(true), 0);
      const hideId = window.setTimeout(() => setSucessoEnvio(false), 2000);
      return () => {
        window.clearTimeout(showId);
        window.clearTimeout(hideId);
      };
    }
    enviandoRef.current = enviandoMensagem;
  }, [enviandoMensagem, mensagem, erro]);

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
    setAutoScrollAtivo(distancia < 80);
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

        return (
          <div
            key={item.id}
            className={`session-chat__message${
              ehMinhaMensagem ? ' session-chat__message--self' : ''
            }${!mostrarCabecalho ? ' session-chat__message--grouped' : ''}`}
          >
            {mostrarCabecalho ? (
              <div className="session-chat__header">
                <span className="session-chat__author">
                  {ehMinhaMensagem ? 'Voce' : autorLabel}
                </span>
                {personagemNome ? (
                  <span className="session-chat__meta">({personagemNome})</span>
                ) : null}
                <span className="session-chat__meta">
                  {formatarDataHora(item.criadoEm)}
                </span>
              </div>
            ) : null}
            <div className="session-chat__bubble">
              <p className="session-chat__text">{textoSeguro(item.mensagem)}</p>
            </div>
          </div>
        );
      }),
    [chat, usuarioId],
  );

  return (
    <div className="session-chat">
      {erro ? <ErrorAlert message={erro} /> : null}
      {sucessoEnvio ? (
        <p className="session-chat__hint session-chat__hint--success">
          Mensagem enviada.
        </p>
      ) : null}
      {sessaoEncerrada ? (
        <p className="session-chat__hint">
          Sessao encerrada. O chat esta em modo leitura.
        </p>
      ) : null}
      <div ref={scrollRef} className="session-chat__scroll" onScroll={handleScroll}>
        {chat.length === 0 ? (
          <EmptyState
            variant="plain"
            size="sm"
            icon="chat"
            title="Sem mensagens"
            description="Inicie a conversa da sessao."
            className="text-center"
          />
        ) : (
          mensagensRenderizadas
        )}
        <div ref={fimChatRef} />
      </div>

      {mostrarPular ? (
        <div className="session-chat__jump">
          <Button size="xs" variant="ghost" onClick={handlePularParaFim}>
            Pular para o fim
          </Button>
        </div>
      ) : null}

      <div className="session-chat__input-row">
        <label className="text-sm font-medium text-app-fg">Mensagem</label>
        <textarea
          ref={textareaRef}
          value={mensagem}
          onChange={(event) => onMensagemChange(event.target.value)}
          maxLength={LIMITE_MENSAGEM_CHAT}
          disabled={sessaoEncerrada || enviandoMensagem}
          rows={2}
          placeholder="Digite uma mensagem... (Enter envia, Shift+Enter quebra linha)"
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
            Enter envia • Shift+Enter quebra linha
          </span>
          <span className="session-chat__counter">
            {mensagem.length}/{LIMITE_MENSAGEM_CHAT}
          </span>
        </div>
        <Button onClick={handleEnviar} disabled={!podeEnviar}>
          {enviandoMensagem ? 'Enviando...' : 'Enviar'}
        </Button>
      </div>
      </div>
    </div>
  );
}
