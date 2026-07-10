import { useCallback, useState } from 'react';
import { apiEnviarMensagemChatSessaoCampanha, criarErroUsuario } from '@/lib/api';
import type { MensagemChatSessao, UserErrorState } from '@/lib/types';
import {
  aplicarPeritoPendenteChatLivre,
  construirMensagemDice,
  construirMensagemDiceMultipla,
  parseDiceInput,
  rolarDados,
  validarComprimentoMensagemDice,
  type DicePeritoPendenteChat,
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
    personagemSessaoId?: number;
    personagemCampanhaId?: number;
    periciaCodigo?: string;
    efeitoPendenteId?: string;
    peritoDadoFaces?: number;
  };
  bonusEscaladaDados?: number;
  peritoPendenteChat?: DicePeritoPendenteChat | null;
  setMensagem: (valor: string) => void;
  setChat: (updater: (anterior: MensagemChatSessao[]) => MensagemChatSessao[]) => void;
  setErro: (mensagem: UserErrorState | null) => void;
  onRolagemConsumiuPerito?: () => void;
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

function mensagemConfirmouConsumoPerito(mensagem: MensagemChatSessao): boolean {
  const ajustes = mensagem.ajustesAplicados;
  if (!Array.isArray(ajustes)) return false;
  return ajustes.some((ajuste) => {
    if (typeof ajuste !== 'object' || ajuste === null) return false;
    return (ajuste as { tipo?: unknown }).tipo === 'PERITO';
  });
}

export function useSessaoRolagem({
  campanhaId,
  sessaoId,
  mensagem,
  visibilidade = 'PUBLICA',
  contextoRolagem,
  bonusEscaladaDados = 0,
  peritoPendenteChat = null,
  setMensagem,
  setChat,
  setErro,
  onRolagemConsumiuPerito,
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
    const peritoChat = aplicarPeritoPendenteChatLivre(
      payloads,
      peritoPendenteChat,
    );
    const payloadsComBonus = peritoChat.payloads;
    const { mensagem: mensagemEnvio } =
      payloadsComBonus.length > 1
        ? construirMensagemDiceMultipla(payloadsComBonus)
        : construirMensagemDice(payloadsComBonus[0]);
    const expressions = payloadsComBonus.map(
      (payload) => construirMensagemDice(payload).expression,
    );

    if (animacaoModalAtiva && onAbrirModalAnimado) {
      onAbrirModalAnimado(payloadsComBonus, expressions);
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
          payloads: payloadsComBonus,
        },
        contextoRolagem: {
          ...contextoRolagem,
          expressao: mensagemLimpa,
          ...(peritoChat.consumiu && peritoPendenteChat
            ? {
                efeitoPendenteId: peritoPendenteChat.id,
                personagemSessaoId: peritoPendenteChat.personagemSessaoId,
                personagemCampanhaId: peritoPendenteChat.personagemCampanhaId,
              }
            : {}),
        },
      });
      setChat((anterior) => [...anterior, enviada]);
      setMensagem('');
      if (mensagemConfirmouConsumoPerito(enviada)) {
        onRolagemConsumiuPerito?.();
      }
      if (animacaoModalAtiva && onAtualizarModalAnimado) {
        onAtualizarModalAnimado({ enviando: false, enviado: true, erro: null });
      }
    } catch (error) {
      const userError = criarErroUsuario(error);
      const mensagemErro = userError.message;
      setErro(userError);
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
    onRolagemConsumiuPerito,
    peritoPendenteChat,
    sessaoId,
    setChat,
    setErro,
    setMensagem,
    visibilidade,
  ]);

  return { enviandoRolagem, handleEnviarRolagem };
}
