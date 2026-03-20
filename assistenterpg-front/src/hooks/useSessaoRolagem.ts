import { useCallback, useState } from 'react';
import { apiEnviarMensagemChatSessaoCampanha, extrairMensagemErro } from '@/lib/api';
import type { MensagemChatSessao } from '@/lib/types';
import {
  construirMensagemDice,
  construirMensagemDiceMultipla,
  parseDiceInput,
  rolarDados,
  validarComprimentoMensagemDice,
} from '@/lib/campanha/sessao-dice';

type UseSessaoRolagemParams = {
  campanhaId: number;
  sessaoId: number;
  mensagem: string;
  setMensagem: (valor: string) => void;
  setChat: (updater: (anterior: MensagemChatSessao[]) => MensagemChatSessao[]) => void;
  setErro: (mensagem: string | null) => void;
};

type UseSessaoRolagemReturn = {
  enviandoRolagem: boolean;
  handleEnviarRolagem: () => Promise<void>;
};

export function useSessaoRolagem({
  campanhaId,
  sessaoId,
  mensagem,
  setMensagem,
  setChat,
  setErro,
}: UseSessaoRolagemParams): UseSessaoRolagemReturn {
  const [enviandoRolagem, setEnviandoRolagem] = useState(false);

  const handleEnviarRolagem = useCallback(async () => {
    const mensagemLimpa = mensagem.trim();
    if (!mensagemLimpa) return;

    const resultado = parseDiceInput(mensagemLimpa);
    if (resultado.erro || !resultado.expressions) {
      setErro(resultado.erro ?? 'Rolagem invalida.');
      return;
    }

    const payloads = resultado.expressions.map((expression) => rolarDados(expression));
    const { mensagem: mensagemEnvio } =
      payloads.length > 1
        ? construirMensagemDiceMultipla(payloads)
        : construirMensagemDice(payloads[0]);
    const erroTamanho = validarComprimentoMensagemDice(mensagemEnvio);
    if (erroTamanho) {
      setErro(erroTamanho);
      return;
    }

    setEnviandoRolagem(true);
    setErro(null);
    try {
      const enviada = await apiEnviarMensagemChatSessaoCampanha(campanhaId, sessaoId, {
        mensagem: mensagemEnvio,
      });
      setChat((anterior) => [...anterior, enviada]);
      setMensagem('');
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setEnviandoRolagem(false);
    }
  }, [campanhaId, mensagem, sessaoId, setChat, setErro, setMensagem]);

  return { enviandoRolagem, handleEnviarRolagem };
}
