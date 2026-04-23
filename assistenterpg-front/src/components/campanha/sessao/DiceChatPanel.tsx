'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { DiceMessageCard } from '@/components/campanha/sessao/DiceMessageCard';
import type { MensagemChatSessao } from '@/lib/types';
import { textoSeguro } from '@/lib/campanha/sessao-formatters';
import { parseDiceMessageGroup } from '@/lib/campanha/sessao-dice';
import { formatarDataHora } from '@/lib/utils/formatters';

const LIMIAR_AGRUPAMENTO_MS = 5 * 60 * 1000;
const ALTURA_MAX_TEXTAREA = 120;
const LIMITE_MENSAGEM_ROLAGEM = 60;

type DiceChatPanelProps = {
  chat: MensagemChatSessao[];
  mensagem: string;
  enviandoMensagem: boolean;
  sessaoEncerrada: boolean;
  usuarioId?: number | null;
  erro?: string | null;
  animacaoModalAtiva: boolean;
  onToggleAnimacaoModal: (ativo: boolean) => void;
  onMensagemChange: (mensagem: string) => void;
  onEnviarMensagem: () => void;
};

export function DiceChatPanel({
  chat,
  mensagem,
  enviandoMensagem,
  sessaoEncerrada,
  usuarioId,
  erro,
  animacaoModalAtiva,
  onToggleAnimacaoModal,
  onMensagemChange,
  onEnviarMensagem,
}: DiceChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const enviandoRef = useRef(false);
  const [autoScrollAtivo, setAutoScrollAtivo] = useState(true);
  const [sucessoEnvio, setSucessoEnvio] = useState(false);
  const [ajudaAberta, setAjudaAberta] = useState(false);
  const fimListaRef = useRef<HTMLDivElement | null>(null);

  const podeEnviar =
    !sessaoEncerrada && !enviandoMensagem && mensagem.trim().length > 0;
  const ultimaMensagem = chat[chat.length - 1];
  const ultimaEhMinha =
    typeof usuarioId === 'number' &&
    ultimaMensagem?.autor.usuarioId === usuarioId;
  const mostrarPular = !autoScrollAtivo && chat.length > 0;
  const limiteAviso = Math.floor(LIMITE_MENSAGEM_ROLAGEM * 0.8);
  const contadorClasse =
    mensagem.length >= LIMITE_MENSAGEM_ROLAGEM
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
        const diceGroup = parseDiceMessageGroup(item.mensagem);
        const bubbleClassName = `session-chat__bubble${
          diceGroup ? ' session-chat__bubble--dice' : ''
        }`;

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
          </div>
        );
      }),
    [chat, usuarioId],
  );

  return (
    <div className="session-chat">
      {erro ? <ErrorAlert message={erro} /> : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="session-chat__hint">
          Sintaxe: XdY ou X#dY. Espacos em operadores sao ignorados (ex.: d20 + 5).
        </p>
        <div className="flex items-center gap-3">
          <Checkbox
            checked={animacaoModalAtiva}
            onChange={(event) => onToggleAnimacaoModal(event.target.checked)}
            label="Abrir rolagem animada"
          />
          <Button type="button" size="xs" variant="ghost" onClick={() => setAjudaAberta(true)}>
            Ajuda
          </Button>
        </div>
      </div>
      {sucessoEnvio ? (
        <p className="session-chat__hint session-chat__hint--success">
          Rolagem enviada.
        </p>
      ) : null}
      {enviandoMensagem ? (
        <p className="session-chat__hint">Enviando rolagem...</p>
      ) : null}
      {sessaoEncerrada ? (
        <p className="session-chat__hint">
          Sessao encerrada. O chat de rolagens esta em modo leitura.
        </p>
      ) : null}
      <div ref={scrollRef} className="session-chat__scroll" onScroll={handleScroll}>
        {chat.length === 0 ? (
          <EmptyState
            variant="session"
            size="sm"
            icon="dice"
            title="Sem rolagens"
            description="Envie a primeira rolagem de dados."
            className="text-left"
          />
        ) : (
          mensagensRenderizadas
        )}
        <div ref={fimListaRef} />
      </div>

      {mostrarPular ? (
        <div className="session-chat__jump">
          <Button size="xs" variant="ghost" onClick={handlePularParaFim}>
            Pular para o fim
          </Button>
        </div>
      ) : null}

      <div className="session-chat__input-row">
        <label className="text-sm font-medium text-app-fg">Rolagem</label>
        <textarea
          ref={textareaRef}
          value={mensagem}
          onChange={(event) => onMensagemChange(event.target.value)}
          maxLength={LIMITE_MENSAGEM_ROLAGEM}
          disabled={sessaoEncerrada || enviandoMensagem}
          rows={1}
          placeholder="Ex.: 2d6+3 ou 4#d8-1"
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
            <span className="session-chat__hint">Enter envia</span>
            <span className={contadorClasse}>
              {mensagem.length}/{LIMITE_MENSAGEM_ROLAGEM}
            </span>
          </div>
          <Button onClick={handleEnviar} disabled={!podeEnviar}>
            {enviandoMensagem ? 'Enviando...' : 'Rolar'}
          </Button>
        </div>
      </div>

      <Modal
        isOpen={ajudaAberta}
        onClose={() => setAjudaAberta(false)}
        title="Ajuda de rolagens"
        size="md"
      >
        <div className="space-y-4 text-sm text-app-fg">
          <div className="space-y-2">
            <p className="font-semibold text-app-fg">Sintaxe basica</p>
            <p>Use XdY para rolar X dados com Y faces.</p>
            <p>
              Use # antes do d para aplicar o modificador em cada dado, mostrar
              valores individuais e destacar o melhor resultado.
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-app-fg">Modificadores</p>
            <p>Use +, -, * ou / no total; com #, o modificador vale para cada dado.</p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-app-fg">Separadores</p>
            <p>Separe multiplas rolagens com espaco, virgula, ponto-e-virgula ou |.</p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-app-fg">Labels (opcional)</p>
            <p>Use nome:expressao para identificar rolagens (sem espacos no nome).</p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-app-fg">Exemplos</p>
            <div className="grid gap-2 rounded-lg border border-app-border bg-app-surface/80 p-3 text-xs text-app-fg">
              <span><strong>d20</strong> (atalho de 1d20)</span>
              <span><strong>2d6+3</strong> (soma total +3)</span>
              <span><strong>4#d8-1</strong> (cada dado -1; destaca o melhor)</span>
              <span><strong>1d6 + 3</strong> (espacos sao aceitos)</span>
              <span><strong>Ataque:d20+5 Defesa:d20+2</strong></span>
              <span><strong>d6 | d6 | d6</strong></span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
