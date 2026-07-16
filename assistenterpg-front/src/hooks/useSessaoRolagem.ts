import { useCallback, useState } from 'react';
import {
  apiCriarRolagemFormulaSessaoCampanha,
  criarErroUsuario,
} from '@/lib/api';
import type { MensagemChatSessao, UserErrorState } from '@/lib/types';
import {
  construirMensagemDice,
  criarClientRequestIdRolagem,
  extrairDadosRolagemServidor,
  formatarExpressaoDice,
  parseDiceInput,
  type DiceRollPayload,
} from '@/lib/campanha/sessao-dice';

type UseSessaoRolagemParams = {
  campanhaId: number;
  sessaoId: number;
  mensagem: string;
  visibilidade?: 'PUBLICA' | 'SECRETA_MESTRE';
  setMensagem: (valor: string) => void;
  setChat: (updater: (anterior: MensagemChatSessao[]) => MensagemChatSessao[]) => void;
  setErro: (mensagem: UserErrorState | null) => void;
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

export function useSessaoRolagem({
  campanhaId,
  sessaoId,
  mensagem,
  visibilidade = 'PUBLICA',
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

    const expressionsParsed = resultado.expressions;
    const expressionsPreview = expressionsParsed.map((expression) => {
      const formula = formatarExpressaoDice(expression);
      return expression.label ? `${expression.label}: ${formula}` : formula;
    });
    const facesPendentes = expressionsParsed.map(
      (expression) => expression.termos?.[0]?.faces ?? expression.faces,
    );

    setEnviandoRolagem(true);
    setErro(null);

    if (animacaoModalAtiva && onAbrirModalAnimado) {
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
      const enviada = await apiCriarRolagemFormulaSessaoCampanha(
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
      const dadosServidor = extrairDadosRolagemServidor(enviada.dadosRolagem);
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
    campanhaId,
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
