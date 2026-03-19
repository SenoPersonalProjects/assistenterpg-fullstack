import { useCallback, useState } from 'react';
import {
  apiAdicionarNpcSessaoCampanha,
  apiAtualizarNpcSessaoCampanha,
  apiRemoverNpcSessaoCampanha,
  extrairMensagemErro,
} from '@/lib/api';
import type { NpcSessaoCampanha, SessaoCampanhaDetalhe } from '@/lib/types';
import type {
  AjustesRecursosNpc,
  CampoAjusteRecursoNpc,
  NpcEditavel,
} from '@/components/campanha/sessao/types';
import {
  clampEntre,
  parseInteiroComSinal,
  parseRecurso,
  parseRecursoOpcional,
} from '@/lib/campanha/sessao-utils';

type UseSessaoNpcParams = {
  campanhaId: number;
  sessaoId: number;
  sessaoEncerrada: boolean;
  edicaoNpcs: Record<number, NpcEditavel>;
  obterAjustesRecursosNpc: (npcSessaoId: number) => AjustesRecursosNpc;
  setDetalhe: (detalhe: SessaoCampanhaDetalhe) => void;
  sincronizarEstadosDerivados: (detalhe: SessaoCampanhaDetalhe) => void;
  setErro: (mensagem: string | null) => void;
  showToast: (mensagem: string, tipo?: 'success' | 'error' | 'warning' | 'info') => void;
  onNpcAdicionado?: () => void;
  onRemocaoConfirmada?: () => void;
  textoSeguro: (value: string | null | undefined) => string;
};

type UseSessaoNpcReturn = {
  adicionandoNpc: boolean;
  salvandoNpcId: number | null;
  campoRecursoPendente: `${number}:${CampoAjusteRecursoNpc}` | null;
  removendoNpcId: number | null;
  handleAdicionarNpcNaCena: (
    npcAmeacaId: number,
    nomeExibicao: string,
    recursos?: {
      sanAtual?: string;
      sanMax?: string;
      eaAtual?: string;
      eaMax?: string;
      iniciativaValor?: number | null;
    },
  ) => Promise<void>;
  handleSalvarNpc: (npc: NpcSessaoCampanha) => Promise<void>;
  handleAplicarDeltaRecursoNpc: (
    npc: NpcSessaoCampanha,
    campo: CampoAjusteRecursoNpc,
    delta: number,
  ) => Promise<void>;
  handleAplicarAjustePersonalizadoRecursoNpc: (
    npc: NpcSessaoCampanha,
    campo: CampoAjusteRecursoNpc,
  ) => Promise<void>;
  handleRemoverNpc: (npcSessaoId: number) => Promise<void>;
};

export function useSessaoNpc({
  campanhaId,
  sessaoId,
  sessaoEncerrada,
  edicaoNpcs,
  obterAjustesRecursosNpc,
  setDetalhe,
  sincronizarEstadosDerivados,
  setErro,
  showToast,
  onNpcAdicionado,
  onRemocaoConfirmada,
  textoSeguro,
}: UseSessaoNpcParams): UseSessaoNpcReturn {
  const [adicionandoNpc, setAdicionandoNpc] = useState(false);
  const [salvandoNpcId, setSalvandoNpcId] = useState<number | null>(null);
  const [campoRecursoPendente, setCampoRecursoPendente] = useState<
    `${number}:${CampoAjusteRecursoNpc}` | null
  >(null);
  const [removendoNpcId, setRemovendoNpcId] = useState<number | null>(null);

  const montarPayloadAjustadoNpc = useCallback(
    (
      npc: NpcSessaoCampanha,
      campo: CampoAjusteRecursoNpc,
      delta: number,
    ) => {
      if (!Number.isFinite(delta) || Math.trunc(delta) === 0) return null;
      const deltaInteiro = Math.trunc(delta);
      if (campo === 'pv') {
        return {
          pontosVidaAtual: clampEntre(
            npc.pontosVidaAtual + deltaInteiro,
            0,
            npc.pontosVidaMax,
          ),
        };
      }
      if (campo === 'san') {
        if (npc.sanAtual === null || npc.sanMax === null) return null;
        return {
          sanAtual: clampEntre(npc.sanAtual + deltaInteiro, 0, npc.sanMax),
        };
      }
      if (campo === 'ea') {
        if (npc.eaAtual === null || npc.eaMax === null) return null;
        return {
          eaAtual: clampEntre(npc.eaAtual + deltaInteiro, 0, npc.eaMax),
        };
      }
      return null;
    },
    [],
  );

  const handleAdicionarNpcNaCena = useCallback(
    async (
      npcAmeacaId: number,
      nomeExibicao: string,
      recursos?: {
        sanAtual?: string;
        sanMax?: string;
        eaAtual?: string;
        eaMax?: string;
        iniciativaValor?: number | null;
      },
    ) => {
      if (!Number.isInteger(npcAmeacaId) || npcAmeacaId <= 0) return;

      setAdicionandoNpc(true);
      setErro(null);
      try {
        const sanAtual = parseRecursoOpcional(recursos?.sanAtual ?? '', null);
        const sanMax = parseRecursoOpcional(recursos?.sanMax ?? '', null);
        const eaAtual = parseRecursoOpcional(recursos?.eaAtual ?? '', null);
        const eaMax = parseRecursoOpcional(recursos?.eaMax ?? '', null);
        const iniciativaValor = recursos?.iniciativaValor;
        const payload = {
          npcAmeacaId,
          nomeExibicao: nomeExibicao.trim() || undefined,
          sanAtual: sanAtual ?? undefined,
          sanMax: sanMax ?? undefined,
          eaAtual: eaAtual ?? undefined,
          eaMax: eaMax ?? undefined,
          iniciativaValor,
        };
        const atualizado = await apiAdicionarNpcSessaoCampanha(
          campanhaId,
          sessaoId,
          payload,
        );
        setDetalhe(atualizado);
        sincronizarEstadosDerivados(atualizado);
        onNpcAdicionado?.();
        showToast('Aliado ou ameaca adicionado na cena.', 'success');
      } catch (error) {
        setErro(extrairMensagemErro(error));
      } finally {
        setAdicionandoNpc(false);
      }
    },
    [
      campanhaId,
      onNpcAdicionado,
      sessaoId,
      setDetalhe,
      setErro,
      showToast,
      sincronizarEstadosDerivados,
    ],
  );

  const handleSalvarNpc = useCallback(
    async (npc: NpcSessaoCampanha) => {
      const draft = edicaoNpcs[npc.npcSessaoId];
      if (!draft) return;

      setSalvandoNpcId(npc.npcSessaoId);
      setErro(null);
      try {
        const atualizado = await apiAtualizarNpcSessaoCampanha(
          campanhaId,
          sessaoId,
          npc.npcSessaoId,
          {
            defesa: parseRecurso(draft.defesa, npc.defesa),
            pontosVidaMax: parseRecurso(draft.pontosVidaMax, npc.pontosVidaMax),
            sanMax: parseRecursoOpcional(draft.sanMax, npc.sanMax),
            eaMax: parseRecursoOpcional(draft.eaMax, npc.eaMax),
            machucado: parseRecursoOpcional(draft.machucado, npc.machucado),
            notasCena: draft.notasCena,
          },
        );
        setDetalhe(atualizado);
        sincronizarEstadosDerivados(atualizado);
        showToast(`Ficha de ${textoSeguro(npc.nome)} atualizada.`, 'success');
      } catch (error) {
        setErro(extrairMensagemErro(error));
      } finally {
        setSalvandoNpcId(null);
      }
    },
    [
      campanhaId,
      edicaoNpcs,
      sessaoId,
      setDetalhe,
      setErro,
      showToast,
      sincronizarEstadosDerivados,
      textoSeguro,
    ],
  );

  const handleAplicarDeltaRecursoNpc = useCallback(
    async (
      npc: NpcSessaoCampanha,
      campo: CampoAjusteRecursoNpc,
      delta: number,
    ) => {
      if (!npc.podeEditar || sessaoEncerrada) return;

      const payload = montarPayloadAjustadoNpc(npc, campo, delta);
      if (!payload) return;
      const chaveCampo = `${npc.npcSessaoId}:${campo}` as const;

      setSalvandoNpcId(npc.npcSessaoId);
      setCampoRecursoPendente(chaveCampo);
      setErro(null);
      try {
        const atualizado = await apiAtualizarNpcSessaoCampanha(
          campanhaId,
          sessaoId,
          npc.npcSessaoId,
          payload,
        );
        setDetalhe(atualizado);
        sincronizarEstadosDerivados(atualizado);
      } catch (error) {
        setErro(extrairMensagemErro(error));
      } finally {
        setSalvandoNpcId(null);
        setCampoRecursoPendente(null);
      }
    },
    [
      campanhaId,
      montarPayloadAjustadoNpc,
      sessaoEncerrada,
      sessaoId,
      setDetalhe,
      setErro,
      sincronizarEstadosDerivados,
    ],
  );

  const handleAplicarAjustePersonalizadoRecursoNpc = useCallback(
    async (npc: NpcSessaoCampanha, campo: CampoAjusteRecursoNpc) => {
      const ajuste = obterAjustesRecursosNpc(npc.npcSessaoId)[campo];
      const delta = parseInteiroComSinal(ajuste);
      if (delta === null || delta === 0) {
        setErro('Informe um ajuste inteiro diferente de zero (ex.: -3, +2).');
        return;
      }

      await handleAplicarDeltaRecursoNpc(npc, campo, delta);
    },
    [
      handleAplicarDeltaRecursoNpc,
      obterAjustesRecursosNpc,
      setErro,
    ],
  );

  const handleRemoverNpc = useCallback(
    async (npcSessaoId: number) => {
      setRemovendoNpcId(npcSessaoId);
      setErro(null);
      try {
        const atualizado = await apiRemoverNpcSessaoCampanha(
          campanhaId,
          sessaoId,
          npcSessaoId,
        );
        setDetalhe(atualizado);
        sincronizarEstadosDerivados(atualizado);
        onRemocaoConfirmada?.();
        showToast('Aliado ou ameaca removido da cena.', 'warning');
      } catch (error) {
        setErro(extrairMensagemErro(error));
      } finally {
        setRemovendoNpcId(null);
      }
    },
    [
      campanhaId,
      onRemocaoConfirmada,
      sessaoId,
      setDetalhe,
      setErro,
      showToast,
      sincronizarEstadosDerivados,
    ],
  );

  return {
    adicionandoNpc,
    salvandoNpcId,
    campoRecursoPendente,
    removendoNpcId,
    handleAdicionarNpcNaCena,
    handleSalvarNpc,
    handleAplicarDeltaRecursoNpc,
    handleAplicarAjustePersonalizadoRecursoNpc,
    handleRemoverNpc,
  };
}
