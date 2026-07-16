import { useCallback, useState } from 'react';
import { apiEnviarMensagemTextoSessaoCampanha, criarErroUsuario } from '@/lib/api';
import type { MensagemChatSessao, UserErrorState } from '@/lib/types';

const LIMITE_MENSAGEM_CHAT = 100;

type UseSessaoChatParams = {
  campanhaId: number;
  sessaoId: number;
  mensagem: string;
  setMensagem: (valor: string) => void;
  setChat: (updater: (anterior: MensagemChatSessao[]) => MensagemChatSessao[]) => void;
  setErro: (mensagem: UserErrorState | null) => void;
};

type UseSessaoChatReturn = {
  enviandoMensagem: boolean;
  handleEnviarMensagem: () => Promise<void>;
};

export function useSessaoChat({
  campanhaId,
  sessaoId,
  mensagem,
  setMensagem,
  setChat,
  setErro,
}: UseSessaoChatParams): UseSessaoChatReturn {
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);

  const handleEnviarMensagem = useCallback(async () => {
    const mensagemLimpa = mensagem.trim();
    if (!mensagemLimpa) return;
    if (mensagemLimpa.length > LIMITE_MENSAGEM_CHAT) {
      setErro(`Mensagem deve ter no máximo ${LIMITE_MENSAGEM_CHAT} caracteres.`);
      return;
    }

    setEnviandoMensagem(true);
    setErro(null);
    try {
      const enviada = await apiEnviarMensagemTextoSessaoCampanha(campanhaId, sessaoId, {
        mensagem: mensagemLimpa,
      });
      setChat((anterior) => [...anterior, enviada]);
      setMensagem('');
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setEnviandoMensagem(false);
    }
  }, [campanhaId, mensagem, sessaoId, setChat, setErro, setMensagem]);

  return { enviandoMensagem, handleEnviarMensagem };
}
