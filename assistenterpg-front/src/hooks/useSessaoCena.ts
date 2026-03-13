import { useCallback, useState } from 'react';
import { apiAtualizarCenaSessaoCampanha, extrairMensagemErro } from '@/lib/api';
import type { SessaoCampanhaDetalhe, TipoCenaSessaoCampanha } from '@/lib/types';

type UseSessaoCenaParams = {
  campanhaId: number;
  sessaoId: number;
  detalhe: SessaoCampanhaDetalhe | null;
  setDetalhe: (detalhe: SessaoCampanhaDetalhe) => void;
  sincronizarEstadosDerivados: (detalhe: SessaoCampanhaDetalhe) => void;
  setErro: (mensagem: string | null) => void;
  showToast: (mensagem: string, tipo?: 'success' | 'error' | 'warning' | 'info') => void;
};

type UseSessaoCenaReturn = {
  atualizandoCena: boolean;
  handleAtualizarCena: (cenaTipo: TipoCenaSessaoCampanha, cenaNome: string) => Promise<void>;
};

export function useSessaoCena({
  campanhaId,
  sessaoId,
  detalhe,
  setDetalhe,
  sincronizarEstadosDerivados,
  setErro,
  showToast,
}: UseSessaoCenaParams): UseSessaoCenaReturn {
  const [atualizandoCena, setAtualizandoCena] = useState(false);

  const handleAtualizarCena = useCallback(
    async (cenaTipo: TipoCenaSessaoCampanha, cenaNome: string) => {
      if (!detalhe) return;

      setAtualizandoCena(true);
      setErro(null);
      try {
        const atualizado = await apiAtualizarCenaSessaoCampanha(campanhaId, sessaoId, {
          tipo: cenaTipo,
          nome: cenaNome.trim() || undefined,
        });
        setDetalhe(atualizado);
        sincronizarEstadosDerivados(atualizado);
        showToast('Cena atualizada com sucesso.', 'success');
      } catch (error) {
        setErro(extrairMensagemErro(error));
      } finally {
        setAtualizandoCena(false);
      }
    },
    [
      campanhaId,
      detalhe,
      sessaoId,
      setDetalhe,
      setErro,
      showToast,
      sincronizarEstadosDerivados,
    ],
  );

  return { atualizandoCena, handleAtualizarCena };
}
