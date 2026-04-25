import { useCallback, useState } from 'react';
import {
  apiAtualizarRecursosPersonagemSessaoCampanha,
  apiGetSessaoCampanha,
  extrairMensagemErro,
} from '@/lib/api';
import type { SessaoCampanhaDetalhe } from '@/lib/types';
import { clampEntre, parseInteiroComSinal } from '@/lib/campanha/sessao-utils';

export type CampoAjusteRecurso = 'pv' | 'pe' | 'ea' | 'san';
export type AjustesRecursos = Record<CampoAjusteRecurso, string>;

export const AJUSTE_RECURSO_PADRAO: AjustesRecursos = {
  pv: '0',
  pe: '0',
  ea: '0',
  san: '0',
};

type UseSessaoRecursosParams = {
  campanhaId: number;
  sessaoId: number;
  sessaoEncerrada: boolean;
  setDetalhe: (detalhe: SessaoCampanhaDetalhe) => void;
  sincronizarEstadosDerivados: (detalhe: SessaoCampanhaDetalhe) => void;
  setErro: (mensagem: string | null) => void;
  obterAjustesRecursosCard: (personagemCampanhaId: number) => AjustesRecursos;
};

type UseSessaoRecursosReturn = {
  salvandoCardId: number | null;
  campoRecursoPendente: `${number}:${CampoAjusteRecurso}` | null;
  handleAplicarDeltaRecursoCard: (
    card: SessaoCampanhaDetalhe['cards'][number],
    campo: CampoAjusteRecurso,
    delta: number,
  ) => Promise<void>;
  handleAplicarAjustePersonalizadoRecursoCard: (
    card: SessaoCampanhaDetalhe['cards'][number],
    campo: CampoAjusteRecurso,
  ) => Promise<void>;
};

export function useSessaoRecursos({
  campanhaId,
  sessaoId,
  sessaoEncerrada,
  setDetalhe,
  sincronizarEstadosDerivados,
  setErro,
  obterAjustesRecursosCard,
}: UseSessaoRecursosParams): UseSessaoRecursosReturn {
  const [salvandoCardId, setSalvandoCardId] = useState<number | null>(null);
  const [campoRecursoPendente, setCampoRecursoPendente] = useState<
    `${number}:${CampoAjusteRecurso}` | null
  >(null);

  const montarPayloadAjustadoRecursoCard = useCallback(
    (
      card: SessaoCampanhaDetalhe['cards'][number],
      campo: CampoAjusteRecurso,
      delta: number,
    ):
      | {
          pvAtual: number;
          peAtual: number;
          eaAtual: number;
          sanAtual: number;
        }
      | null => {
      if (!card.recursos) return null;

      const base = {
        pvAtual: card.recursos.pvAtual,
        peAtual: card.recursos.peAtual,
        eaAtual: card.recursos.eaAtual,
        sanAtual: card.recursos.sanAtual,
      };
      const pvMaxAtual = card.recursos.pvBarraMaxAtual ?? card.recursos.pvMax;

      switch (campo) {
        case 'pv':
          base.pvAtual = clampEntre(base.pvAtual + delta, 0, pvMaxAtual);
          break;
        case 'pe':
          base.peAtual = clampEntre(base.peAtual + delta, 0, card.recursos.peMax);
          break;
        case 'ea':
          base.eaAtual = clampEntre(base.eaAtual + delta, 0, card.recursos.eaMax);
          break;
        case 'san':
          base.sanAtual = clampEntre(base.sanAtual + delta, 0, card.recursos.sanMax);
          break;
        default:
          return null;
      }

      return base;
    },
    [],
  );

  const handleAplicarDeltaRecursoCard = useCallback(
    async (
      card: SessaoCampanhaDetalhe['cards'][number],
      campo: CampoAjusteRecurso,
      delta: number,
    ) => {
      if (!card.podeEditar || !card.recursos || sessaoEncerrada) return;
      if (!Number.isFinite(delta) || Math.trunc(delta) === 0) return;

      const deltaInteiro = Math.trunc(delta);
      const payload = montarPayloadAjustadoRecursoCard(card, campo, deltaInteiro);
      if (!payload) return;
      const chaveCampo = `${card.personagemCampanhaId}:${campo}` as const;

      setSalvandoCardId(card.personagemCampanhaId);
      setCampoRecursoPendente(chaveCampo);
      setErro(null);
      try {
        await apiAtualizarRecursosPersonagemSessaoCampanha(
          campanhaId,
          sessaoId,
          card.personagemSessaoId,
          payload,
        );
        const atualizado = await apiGetSessaoCampanha(campanhaId, sessaoId);
        setDetalhe(atualizado);
        sincronizarEstadosDerivados(atualizado);
      } catch (error) {
        setErro(extrairMensagemErro(error));
      } finally {
        setSalvandoCardId(null);
        setCampoRecursoPendente(null);
      }
    },
    [
      campanhaId,
      sessaoEncerrada,
      sessaoId,
      setDetalhe,
      setErro,
      sincronizarEstadosDerivados,
      montarPayloadAjustadoRecursoCard,
    ],
  );

  const handleAplicarAjustePersonalizadoRecursoCard = useCallback(
    async (card: SessaoCampanhaDetalhe['cards'][number], campo: CampoAjusteRecurso) => {
      const ajuste = obterAjustesRecursosCard(card.personagemCampanhaId)[campo];
      const delta = parseInteiroComSinal(ajuste);
      if (delta === null || delta === 0) {
        setErro('Informe um ajuste inteiro diferente de zero (ex.: -3, +2).');
        return;
      }

      await handleAplicarDeltaRecursoCard(card, campo, delta);
    },
    [handleAplicarDeltaRecursoCard, obterAjustesRecursosCard, setErro],
  );

  return {
    salvandoCardId,
    campoRecursoPendente,
    handleAplicarDeltaRecursoCard,
    handleAplicarAjustePersonalizadoRecursoCard,
  };
}
