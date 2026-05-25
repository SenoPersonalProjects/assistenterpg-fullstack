import { apiClient } from './axios-client';

export type ChatAmigoResumo = {
  id: number;
  apelido: string;
};

export type ChatMensagem = {
  id: number;
  conversaId: number;
  autorId: number;
  destinatarioId: number;
  conteudo: string;
  removidoEm: string | null;
  criadoEm: string;
};

export type ChatConversa = {
  amigo: ChatAmigoResumo;
  conversaId: number | null;
  ultimaMensagem: ChatMensagem | null;
  naoLidas: number;
  atualizadoEm: string;
  online: boolean;
};

export type ChatMensagensPage = {
  itens: ChatMensagem[];
  nextCursor: number | null;
};

export type EnviarMensagemResponse = {
  conversa: {
    id: number;
    usuarioAId: number;
    usuarioBId: number;
    atualizadoEm: string;
  };
  mensagem: ChatMensagem;
};

export async function apiListarConversasAmigos(): Promise<ChatConversa[]> {
  const { data } = await apiClient.get<ChatConversa[]>('/chat-amigos/conversas');
  return data;
}

export async function apiListarMensagensAmigo(
  amigoId: number,
  params?: { cursor?: number | null; limit?: number },
): Promise<ChatMensagensPage> {
  const { data } = await apiClient.get<ChatMensagensPage>(
    `/chat-amigos/conversas/${amigoId}/mensagens`,
    {
      params: {
        cursor: params?.cursor ?? undefined,
        limit: params?.limit,
      },
    },
  );
  return data;
}

export async function apiEnviarMensagemAmigo(
  amigoId: number,
  conteudo: string,
): Promise<EnviarMensagemResponse> {
  const { data } = await apiClient.post<EnviarMensagemResponse>(
    `/chat-amigos/conversas/${amigoId}/mensagens`,
    { conteudo },
  );
  return data;
}

export async function apiMarcarConversaAmigoComoLida(amigoId: number) {
  const { data } = await apiClient.post<{
    ok: boolean;
    conversaId: number | null;
    lidaAteMensagemId: number | null;
    amigoId: number;
  }>(`/chat-amigos/conversas/${amigoId}/lida`);
  return data;
}
