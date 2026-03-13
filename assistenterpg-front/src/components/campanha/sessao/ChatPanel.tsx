'use client';

import type { RefObject } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { MensagemChatSessao } from '@/lib/types';
import { textoSeguro } from '@/lib/campanha/sessao-formatters';
import { formatarDataHora } from '@/lib/utils/formatters';

type ChatPanelProps = {
  chat: MensagemChatSessao[];
  mensagem: string;
  enviandoMensagem: boolean;
  sessaoEncerrada: boolean;
  onMensagemChange: (mensagem: string) => void;
  onEnviarMensagem: () => void;
  fimChatRef: RefObject<HTMLDivElement | null>;
};

export function ChatPanel({
  chat,
  mensagem,
  enviandoMensagem,
  sessaoEncerrada,
  onMensagemChange,
  onEnviarMensagem,
  fimChatRef,
}: ChatPanelProps) {
  const podeEnviar =
    !sessaoEncerrada && !enviandoMensagem && mensagem.trim().length > 0;

  return (
    <div className="space-y-2">
      <div className="h-[420px] overflow-y-auto rounded border border-app-border p-3 space-y-2 bg-app-bg">
        {chat.length === 0 ? (
          <p className="text-xs text-app-muted">
            Nenhuma mensagem ainda. Inicie a conversa da sessao.
          </p>
        ) : (
          chat.map((item) => (
            <div
              key={item.id}
              className="rounded border border-app-border bg-app-surface px-2 py-1.5"
            >
              <p className="text-xs text-app-muted">
                {textoSeguro(item.autor.apelido)}
                {item.autor.personagemNome
                  ? ` (${textoSeguro(item.autor.personagemNome)})`
                  : ''}{' '}
                | {formatarDataHora(item.criadoEm)}
              </p>
              <p className="text-sm text-app-fg whitespace-pre-wrap">
                {textoSeguro(item.mensagem)}
              </p>
            </div>
          ))
        )}
        <div ref={fimChatRef} />
      </div>

      <Input
        label="Mensagem"
        value={mensagem}
        onChange={(event) => onMensagemChange(event.target.value)}
        maxLength={1000}
        disabled={sessaoEncerrada || enviandoMensagem}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onEnviarMensagem();
          }
        }}
      />

      <Button onClick={onEnviarMensagem} disabled={!podeEnviar}>
        {enviandoMensagem ? 'Enviando...' : 'Enviar'}
      </Button>
    </div>
  );
}

