import { useCallback, useState } from 'react';
import {
  apiAdicionarNpcSessaoCampanha,
  apiAtualizarNpcSessaoCampanha,
  apiRemoverNpcSessaoCampanha,
  extrairMensagemErro,
} from '@/lib/api';
import type { NpcSessaoCampanha, SessaoCampanhaDetalhe } from '@/lib/types';
import type { NpcEditavel } from '@/components/campanha/sessao/types';
import { parseRecurso } from '@/lib/campanha/sessao-utils';

type UseSessaoNpcParams = {
  campanhaId: number;
  sessaoId: number;
  edicaoNpcs: Record<number, NpcEditavel>;
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
  removendoNpcId: number | null;
  handleAdicionarNpcNaCena: (npcAmeacaId: number, nomeExibicao: string) => Promise<void>;
  handleSalvarNpc: (npc: NpcSessaoCampanha) => Promise<void>;
  handleRemoverNpc: (npcSessaoId: number) => Promise<void>;
};

export function useSessaoNpc({
  campanhaId,
  sessaoId,
  edicaoNpcs,
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
  const [removendoNpcId, setRemovendoNpcId] = useState<number | null>(null);

  const handleAdicionarNpcNaCena = useCallback(
    async (npcAmeacaId: number, nomeExibicao: string) => {
      if (!Number.isInteger(npcAmeacaId) || npcAmeacaId <= 0) return;

      setAdicionandoNpc(true);
      setErro(null);
      try {
        const atualizado = await apiAdicionarNpcSessaoCampanha(campanhaId, sessaoId, {
          npcAmeacaId,
          nomeExibicao: nomeExibicao.trim() || undefined,
        });
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
            vd: parseRecurso(draft.vd, npc.vd),
            defesa: parseRecurso(draft.defesa, npc.defesa),
            pontosVidaAtual: parseRecurso(draft.pontosVidaAtual, npc.pontosVidaAtual),
            pontosVidaMax: parseRecurso(draft.pontosVidaMax, npc.pontosVidaMax),
            deslocamentoMetros: parseRecurso(
              draft.deslocamentoMetros,
              npc.deslocamentoMetros,
            ),
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
    removendoNpcId,
    handleAdicionarNpcNaCena,
    handleSalvarNpc,
    handleRemoverNpc,
  };
}
