import { useCallback, useState } from 'react';
import {
  apiCriarRolagemFormulaSessaoCampanha,
  apiEnviarMensagemChatSessaoCampanha,
  criarErroUsuario,
} from '@/lib/api';
import type { MensagemChatSessao, UserErrorState } from '@/lib/types';
import {
  aplicarPeritoPendenteChatLivre,
  construirMensagemDice,
  construirMensagemDiceMultipla,
  criarClientRequestIdRolagem,
  expressoesDiceContemD20,
  extrairDadosRolagemServidor,
  formatarExpressaoDice,
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
    opcoes?: {
      facesPendentes?: number[];
      origemServidor?: boolean;
    },
  ) => void;
  onAtualizarModalAnimado?: (patch: {
    enviando?: boolean;
    enviado?: boolean;
    erro?: string | null;
    payloads?: DiceRollPayload[];
    expressions?: string[];
    origemServidor?: boolean;
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

    const expressionsParsed = resultado.expressions;
    const contemD20 = expressoesDiceContemD20(expressionsParsed);
    const usaFluxoMecanico =
      (contextoRolagem?.tipo ?? 'OUTRO') !== 'OUTRO' ||
      typeof contextoRolagem?.dt === 'number' ||
      Boolean(peritoPendenteChat && contemD20);
    const expressionsPreview = expressionsParsed.map((expression) => {
      const formula = formatarExpressaoDice(expression);
      return expression.label ? `${expression.label}: ${formula}` : formula;
    });
    const facesPendentes = expressionsParsed.map(
      (expression) => expression.termos?.[0]?.faces ?? expression.faces,
    );

    setEnviandoRolagem(true);
    setErro(null);

    const enviarFluxoLegado = async (abrirModal: boolean) => {
      const payloadsBase = expressionsParsed.map((expression) =>
        rolarDados(expression),
      );
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
      const erroTamanho = validarComprimentoMensagemDice(mensagemEnvio);
      if (erroTamanho) throw new Error(erroTamanho);

      if (animacaoModalAtiva && onAbrirModalAnimado && abrirModal) {
        onAbrirModalAnimado(payloadsComBonus, expressions, {
          origemServidor: false,
        });
      } else if (animacaoModalAtiva && onAtualizarModalAnimado) {
        onAtualizarModalAnimado({
          payloads: payloadsComBonus,
          expressions,
          origemServidor: false,
          enviando: true,
          enviado: false,
          erro: null,
        });
      }

      const enviada = await apiEnviarMensagemChatSessaoCampanha(
        campanhaId,
        sessaoId,
        {
          mensagem: mensagemEnvio,
          visibilidade,
          dadosRolagem: { payloads: payloadsComBonus },
          contextoRolagem: {
            ...contextoRolagem,
            expressao: mensagemLimpa,
            ...(peritoChat.consumiu && peritoPendenteChat
              ? {
                  efeitoPendenteId: peritoPendenteChat.id,
                  personagemSessaoId: peritoPendenteChat.personagemSessaoId,
                  personagemCampanhaId:
                    peritoPendenteChat.personagemCampanhaId,
                }
              : {}),
          },
        },
      );
      if (mensagemConfirmouConsumoPerito(enviada)) {
        onRolagemConsumiuPerito?.();
      }
      return enviada;
    };

    if (
      animacaoModalAtiva &&
      onAbrirModalAnimado &&
      !usaFluxoMecanico
    ) {
      onAbrirModalAnimado([], expressionsPreview, {
        facesPendentes,
        origemServidor: true,
      });
    }
    if (animacaoModalAtiva && onAtualizarModalAnimado) {
      onAtualizarModalAnimado({
        enviando: true,
        enviado: false,
        erro: null,
      });
    }

    try {
      let enviada: MensagemChatSessao;
      if (usaFluxoMecanico) {
        enviada = await enviarFluxoLegado(true);
      } else {
        let respostaAutoritativa = true;
        try {
          enviada = await apiCriarRolagemFormulaSessaoCampanha(
            campanhaId,
            sessaoId,
            {
              tipo: 'FORMULA',
              expressao: mensagemLimpa,
              visibilidade,
              contexto: { tipo: 'OUTRO' },
              clientRequestId: criarClientRequestIdRolagem(),
            },
          );
        } catch (error) {
          const erroServidor = criarErroUsuario(error);
          if (
            erroServidor.code !==
            'SESSAO_ROLAGEM_REQUER_FLUXO_MECANICO'
          ) {
            throw error;
          }
          respostaAutoritativa = false;
          enviada = await enviarFluxoLegado(false);
        }

        if (respostaAutoritativa) {
          const dadosServidor = extrairDadosRolagemServidor(
            enviada.dadosRolagem,
          );
          if (!dadosServidor) {
            throw new Error('Resposta autoritativa de rolagem invalida.');
          }
          const expressionsServidor = dadosServidor.payloads.map(
            (payload) => construirMensagemDice(payload).expression,
          );
          if (animacaoModalAtiva && onAtualizarModalAnimado) {
            onAtualizarModalAnimado({
              payloads: dadosServidor.payloads,
              expressions: expressionsServidor,
              origemServidor: true,
            });
          }
        }
      }

      setChat((anterior) => [...anterior, enviada]);
      setMensagem('');
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
