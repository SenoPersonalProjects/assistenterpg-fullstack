import { useCallback, useState } from 'react';
import { apiEnviarMensagemChatSessaoCampanha, extrairMensagemErro } from '@/lib/api';
import type { MensagemChatSessao } from '@/lib/types';
import {
  construirMensagemDice,
  construirMensagemDiceMultipla,
  parseDiceInput,
  rolarDados,
  validarComprimentoMensagemDice,
  type DiceRollPayload,
} from '@/lib/campanha/sessao-dice';

type UseSessaoRolagemParams = {
  campanhaId: number;
  sessaoId: number;
  mensagem: string;
  visibilidade?: 'PUBLICA' | 'SECRETA_MESTRE';
  contextoRolagem?: {
    tipo?: 'ATAQUE' | 'PERICIA' | 'DANO' | 'OUTRO';
    dt?: number;
  };
  bonusEscaladaDados?: number;
  setMensagem: (valor: string) => void;
  setChat: (updater: (anterior: MensagemChatSessao[]) => MensagemChatSessao[]) => void;
  setErro: (mensagem: string | null) => void;
  animacaoModalAtiva?: boolean;
  onAbrirModalAnimado?: (
    payloads: DiceRollPayload[],
    expressions: string[],
  ) => void;
  onAtualizarModalAnimado?: (patch: {
    enviando?: boolean;
    enviado?: boolean;
    erro?: string | null;
  }) => void;
};

type UseSessaoRolagemReturn = {
  enviandoRolagem: boolean;
  handleEnviarRolagem: () => Promise<void>;
};

export function useSessaoRolagem({
  campanhaId,
  sessaoId,
  mensagem,
  visibilidade = 'PUBLICA',
  contextoRolagem,
  bonusEscaladaDados = 0,
  setMensagem,
  setChat,
  setErro,
  animacaoModalAtiva = false,
  onAbrirModalAnimado,
  onAtualizarModalAnimado,
}: UseSessaoRolagemParams): UseSessaoRolagemReturn {
  const [enviandoRolagem, setEnviandoRolagem] = useState(false);

  const handleEnviarRolagem = useCallback(async () => {
    const mensagemLimpa = mensagem.trim();
    if (!mensagemLimpa) return;

    const resultado = parseDiceInput(mensagemLimpa);
    if (resultado.erro || !resultado.expressions) {
      setErro(resultado.erro ?? 'Rolagem inválida.');
      return;
    }

    const payloadsBase = resultado.expressions.map((expression) => rolarDados(expression));
    const deveAplicarEscalada =
      contextoRolagem?.tipo === 'ATAQUE' &&
      typeof bonusEscaladaDados === 'number' &&
      bonusEscaladaDados > 0;
    const payloads = deveAplicarEscalada
      ? payloadsBase.map((payload) => ({
          ...payload,
          modificador: payload.modificador + bonusEscaladaDados,
        }))
      : payloadsBase;
    const { mensagem: mensagemEnvio } =
      payloads.length > 1
        ? construirMensagemDiceMultipla(payloads)
        : construirMensagemDice(payloads[0]);
    const expressions = payloads.map((payload) => construirMensagemDice(payload).expression);

    if (animacaoModalAtiva && onAbrirModalAnimado) {
      onAbrirModalAnimado(payloads, expressions);
    }
    const erroTamanho = validarComprimentoMensagemDice(mensagemEnvio);
    if (erroTamanho) {
      setErro(erroTamanho);
      if (animacaoModalAtiva && onAtualizarModalAnimado) {
        onAtualizarModalAnimado({ enviando: false, enviado: false, erro: erroTamanho });
      }
      return;
    }

    setEnviandoRolagem(true);
    setErro(null);
    if (animacaoModalAtiva && onAtualizarModalAnimado) {
      onAtualizarModalAnimado({ enviando: true, enviado: false, erro: null });
    }
    try {
      const enviada = await apiEnviarMensagemChatSessaoCampanha(campanhaId, sessaoId, {
        mensagem: mensagemEnvio,
        visibilidade,
        dadosRolagem: {
          payloads,
        },
        contextoRolagem: {
          ...contextoRolagem,
          expressao: mensagemLimpa,
        },
      });
      setChat((anterior) => [...anterior, enviada]);
      setMensagem('');
      if (animacaoModalAtiva && onAtualizarModalAnimado) {
        onAtualizarModalAnimado({ enviando: false, enviado: true, erro: null });
      }
    } catch (error) {
      const mensagemErro = extrairMensagemErro(error);
      setErro(mensagemErro);
      if (animacaoModalAtiva && onAtualizarModalAnimado) {
        onAtualizarModalAnimado({ enviando: false, enviado: false, erro: mensagemErro });
      }
    } finally {
      setEnviandoRolagem(false);
    }
  }, [
    animacaoModalAtiva,
    bonusEscaladaDados,
    campanhaId,
    contextoRolagem,
    mensagem,
    onAbrirModalAnimado,
    onAtualizarModalAnimado,
    sessaoId,
    setChat,
    setErro,
    setMensagem,
    visibilidade,
  ]);

  return { enviandoRolagem, handleEnviarRolagem };
}
