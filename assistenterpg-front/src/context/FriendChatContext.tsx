'use client';

import {
  createContext,
  FormEvent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  apiEnviarMensagemAmigo,
  apiListarConversasAmigos,
  apiListarMensagensAmigo,
  apiMarcarConversaAmigoComoLida,
  type ChatConversa,
  type ChatMensagem,
} from '@/lib/api/chat-amigos';
import {
  conectarSocketChatAmigos,
  type EventoChatLeitura,
} from '@/lib/realtime/chat-amigos-socket';

type FriendChatContextType = {
  unreadCount: number;
  openChat: (amigoId?: number) => void;
};

const FriendChatContext = createContext<FriendChatContextType | undefined>(
  undefined,
);

const PUBLIC_PREFIXES = ['/auth'];

function isPublicPath(pathname: string | null) {
  if (!pathname) return true;
  return (
    pathname === '/' || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

function ordenarMensagens(mensagens: ChatMensagem[]) {
  return [...mensagens].sort((a, b) => a.id - b.id);
}

function upsertMensagem(
  mensagens: ChatMensagem[],
  mensagem: ChatMensagem,
): ChatMensagem[] {
  const existe = mensagens.some((item) => item.id === mensagem.id);
  return ordenarMensagens(
    existe
      ? mensagens.map((item) => (item.id === mensagem.id ? mensagem : item))
      : [...mensagens, mensagem],
  );
}

export function FriendChatProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const pathname = usePathname();
  const hidden = !usuario || isPublicPath(pathname);
  const [open, setOpen] = useState(false);
  const [loadingConversas, setLoadingConversas] = useState(false);
  const [conversas, setConversas] = useState<ChatConversa[]>([]);
  const [selectedAmigoId, setSelectedAmigoId] = useState<number | null>(null);
  const [mensagens, setMensagens] = useState<Record<number, ChatMensagem[]>>({});
  const [cursors, setCursors] = useState<Record<number, number | null>>({});
  const [loadingMensagens, setLoadingMensagens] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const selectedAmigoIdRef = useRef<number | null>(null);
  const openRef = useRef(false);

  useEffect(() => {
    selectedAmigoIdRef.current = selectedAmigoId;
  }, [selectedAmigoId]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const unreadCount = useMemo(
    () => conversas.reduce((total, conversa) => total + conversa.naoLidas, 0),
    [conversas],
  );

  const carregarConversas = useCallback(async () => {
    if (!usuario) return;

    setLoadingConversas(true);
    try {
      const lista = await apiListarConversasAmigos();
      setConversas(lista);
      setSelectedAmigoId((atual) => atual ?? lista[0]?.amigo.id ?? null);
    } finally {
      setLoadingConversas(false);
    }
  }, [usuario]);

  useEffect(() => {
    if (!usuario) {
      setConversas([]);
      setMensagens({});
      setCursors({});
      setSelectedAmigoId(null);
      setOpen(false);
      return;
    }

    void carregarConversas();
  }, [usuario, carregarConversas]);

  const carregarMensagens = useCallback(
    async (amigoId: number, append = false) => {
      setLoadingMensagens(true);
      try {
        const pagina = await apiListarMensagensAmigo(amigoId, {
          cursor: append ? cursors[amigoId] : undefined,
          limit: 50,
        });
        setMensagens((atual) => ({
          ...atual,
          [amigoId]: append
            ? ordenarMensagens([...(pagina.itens ?? []), ...(atual[amigoId] ?? [])])
            : pagina.itens,
        }));
        setCursors((atual) => ({ ...atual, [amigoId]: pagina.nextCursor }));
      } finally {
        setLoadingMensagens(false);
      }
    },
    [cursors],
  );

  const marcarComoLida = useCallback(async (amigoId: number) => {
    try {
      await apiMarcarConversaAmigoComoLida(amigoId);
      setConversas((atuais) =>
        atuais.map((conversa) =>
          conversa.amigo.id === amigoId ? { ...conversa, naoLidas: 0 } : conversa,
        ),
      );
    } catch {
      // A leitura sera sincronizada na proxima carga.
    }
  }, []);

  useEffect(() => {
    if (!open || !selectedAmigoId) return;
    if (!mensagens[selectedAmigoId]) {
      void carregarMensagens(selectedAmigoId);
    }
    void marcarComoLida(selectedAmigoId);
  }, [carregarMensagens, marcarComoLida, mensagens, open, selectedAmigoId]);

  useEffect(() => {
    if (!usuario) return;

    const socket = conectarSocketChatAmigos();

    const handleMensagem = (mensagem: ChatMensagem) => {
      const amigoId =
        mensagem.autorId === usuario.id
          ? mensagem.destinatarioId
          : mensagem.autorId;

      setMensagens((atuais) => ({
        ...atuais,
        [amigoId]: upsertMensagem(atuais[amigoId] ?? [], mensagem),
      }));
      setConversas((atuais) =>
        atuais.map((conversa) =>
          conversa.amigo.id === amigoId
            ? {
                ...conversa,
                conversaId: mensagem.conversaId,
                ultimaMensagem: mensagem,
                atualizadoEm: mensagem.criadoEm,
                naoLidas:
                  openRef.current && selectedAmigoIdRef.current === amigoId
                    ? 0
                    : conversa.naoLidas + (mensagem.autorId === usuario.id ? 0 : 1),
              }
            : conversa,
        ),
      );

      if (openRef.current && selectedAmigoIdRef.current === amigoId) {
        void marcarComoLida(amigoId);
      }
    };

    const handleLeitura = (payload: EventoChatLeitura) => {
      if (payload.usuarioId !== usuario.id) return;
      setConversas((atuais) =>
        atuais.map((conversa) =>
          conversa.amigo.id === payload.amigoId
            ? { ...conversa, naoLidas: 0 }
            : conversa,
        ),
      );
    };

    socket.on('chat:mensagem', handleMensagem);
    socket.on('chat:leitura', handleLeitura);

    return () => {
      socket.off('chat:mensagem', handleMensagem);
      socket.off('chat:leitura', handleLeitura);
      socket.disconnect();
    };
  }, [marcarComoLida, usuario]);

  const openChat = useCallback(
    (amigoId?: number) => {
      setOpen(true);
      if (typeof amigoId === 'number') {
        setSelectedAmigoId(amigoId);
      }
      if (conversas.length === 0) {
        void carregarConversas();
      }
    },
    [carregarConversas, conversas.length],
  );

  const enviarMensagem = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedAmigoId || !draft.trim() || sending) return;

    const texto = draft.trim();
    setDraft('');
    setSending(true);
    try {
      const resultado = await apiEnviarMensagemAmigo(selectedAmigoId, texto);
      setMensagens((atuais) => ({
        ...atuais,
        [selectedAmigoId]: upsertMensagem(
          atuais[selectedAmigoId] ?? [],
          resultado.mensagem,
        ),
      }));
      setConversas((atuais) =>
        atuais.map((conversa) =>
          conversa.amigo.id === selectedAmigoId
            ? {
                ...conversa,
                conversaId: resultado.conversa.id,
                ultimaMensagem: resultado.mensagem,
                atualizadoEm: resultado.mensagem.criadoEm,
                naoLidas: 0,
              }
            : conversa,
        ),
      );
    } catch {
      setDraft(texto);
    } finally {
      setSending(false);
    }
  };

  const selectedConversa = conversas.find(
    (conversa) => conversa.amigo.id === selectedAmigoId,
  );
  const mensagensSelecionadas = selectedAmigoId
    ? mensagens[selectedAmigoId] ?? []
    : [];

  return (
    <FriendChatContext.Provider value={{ unreadCount, openChat }}>
      {children}
      {!hidden && (
        <div className="fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-3">
          {open && (
            <div className="flex h-[min(640px,calc(100vh-7rem))] w-[min(920px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-app-border bg-app-card shadow-2xl shadow-black/30">
              <aside className="w-72 shrink-0 border-r border-app-border bg-app-surface/80 p-3 max-sm:w-28">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-app-muted">
                      Amigos
                    </p>
                    <h2 className="text-lg font-bold text-app-fg max-sm:hidden">
                      Chat
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-app-muted hover:bg-app-border/40 hover:text-app-fg"
                    aria-label="Fechar chat"
                  >
                    <Icon name="close" className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2 overflow-y-auto pr-1">
                  {loadingConversas ? (
                    <div className="rounded-xl border border-app-border bg-app-bg/60 p-3 text-sm text-app-muted">
                      Carregando...
                    </div>
                  ) : conversas.length === 0 ? (
                    <div className="rounded-xl border border-app-border bg-app-bg/60 p-3 text-xs text-app-muted">
                      Adicione amigos para conversar.
                    </div>
                  ) : (
                    conversas.map((conversa) => {
                      const active = conversa.amigo.id === selectedAmigoId;
                      return (
                        <button
                          key={conversa.amigo.id}
                          type="button"
                          onClick={() => setSelectedAmigoId(conversa.amigo.id)}
                          className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                            active
                              ? 'border-app-primary bg-app-primary/12 text-app-fg'
                              : 'border-transparent text-app-muted hover:border-app-border hover:bg-app-bg/70 hover:text-app-fg'
                          }`}
                        >
                          <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-app-primary/15 text-app-primary">
                            <Icon name="user" className="h-5 w-5" />
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-app-card ${
                                conversa.online ? 'bg-app-success' : 'bg-app-muted'
                              }`}
                            />
                          </span>
                          <span className="min-w-0 flex-1 max-sm:hidden">
                            <span className="block truncate text-sm font-semibold">
                              {conversa.amigo.apelido}
                            </span>
                            <span className="block truncate text-xs text-app-muted">
                              {conversa.ultimaMensagem?.conteudo ?? 'Sem mensagens'}
                            </span>
                          </span>
                          {conversa.naoLidas > 0 && (
                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-app-primary px-1.5 text-xs font-bold text-white">
                              {conversa.naoLidas}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </aside>

              <section className="flex min-w-0 flex-1 flex-col bg-app-bg">
                {selectedConversa ? (
                  <>
                    <header className="flex items-center justify-between border-b border-app-border bg-app-surface/80 px-4 py-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-app-fg">
                          {selectedConversa.amigo.apelido}
                        </h3>
                        <p className="text-xs text-app-muted">
                          {selectedConversa.online ? 'Online' : 'Offline'}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          if (selectedAmigoId) void carregarMensagens(selectedAmigoId);
                        }}
                      >
                        Atualizar
                      </Button>
                    </header>

                    <div className="flex-1 overflow-y-auto p-4">
                      {cursors[selectedConversa.amigo.id] && (
                        <div className="mb-4 text-center">
                          <Button
                            type="button"
                            variant="secondary"
                            size="xs"
                            disabled={loadingMensagens}
                            onClick={() =>
                              carregarMensagens(selectedConversa.amigo.id, true)
                            }
                          >
                            Carregar anteriores
                          </Button>
                        </div>
                      )}

                      {loadingMensagens && mensagensSelecionadas.length === 0 ? (
                        <p className="text-sm text-app-muted">Carregando mensagens...</p>
                      ) : mensagensSelecionadas.length === 0 ? (
                          <EmptyState
                          title="Sem mensagens"
                          description="Envie a primeira mensagem para esse amigo."
                          icon="chat"
                          size="sm"
                        />
                      ) : (
                        <div className="space-y-3">
                          {mensagensSelecionadas.map((mensagem) => {
                            const minha = mensagem.autorId === usuario?.id;
                            return (
                              <div
                                key={mensagem.id}
                                className={`flex ${minha ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                                    minha
                                      ? 'bg-app-primary text-white'
                                      : 'border border-app-border bg-app-card text-app-fg'
                                  }`}
                                >
                                  <p className="whitespace-pre-wrap break-words">
                                    {mensagem.conteudo}
                                  </p>
                                  <time
                                    className={`mt-1 block text-[10px] ${
                                      minha ? 'text-white/70' : 'text-app-muted'
                                    }`}
                                  >
                                    {new Date(mensagem.criadoEm).toLocaleTimeString(
                                      'pt-BR',
                                      { hour: '2-digit', minute: '2-digit' },
                                    )}
                                  </time>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <form
                      onSubmit={enviarMensagem}
                      className="border-t border-app-border bg-app-surface/80 p-3"
                    >
                      <div className="flex gap-2">
                        <textarea
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                          rows={1}
                          maxLength={2000}
                          placeholder="Mensagem..."
                          className="min-h-11 flex-1 resize-none rounded-xl border border-app-border bg-app-card px-3 py-2 text-sm text-app-fg outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/30"
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                              event.preventDefault();
                              event.currentTarget.form?.requestSubmit();
                            }
                          }}
                        />
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!draft.trim() || sending}
                          className="shrink-0"
                        >
                          <Icon name="chat" className="mr-2 h-4 w-4" />
                          Enviar
                        </Button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center p-6">
                    <EmptyState
                      title="Nenhum amigo para conversar"
                      description="Quando você adicionar amigos, as conversas aparecem aqui."
                      icon="chat"
                      size="sm"
                    />
                  </div>
                )}
              </section>
            </div>
          )}

          <button
            type="button"
            onClick={() => openChat()}
            className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-app-primary/40 bg-app-primary text-white shadow-xl shadow-[rgba(var(--primary-rgb),0.35)] transition hover:-translate-y-0.5 hover:bg-app-primary-hover focus:outline-none focus:ring-2 focus:ring-app-primary/50 focus:ring-offset-2 focus:ring-offset-app-bg"
            aria-label="Abrir chat de amigos"
          >
            <Icon name="chat" className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-app-danger px-1.5 text-xs font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      )}
    </FriendChatContext.Provider>
  );
}

export function useFriendChat() {
  const ctx = useContext(FriendChatContext);
  if (!ctx) {
    throw new Error('useFriendChat deve ser usado dentro de FriendChatProvider');
  }
  return ctx;
}
