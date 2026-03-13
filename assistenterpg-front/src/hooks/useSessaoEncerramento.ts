import { useCallback, useState } from 'react';
import { apiEncerrarSessaoCampanha, extrairMensagemErro } from '@/lib/api';
import type { SessaoCampanhaDetalhe } from '@/lib/types';

type UseSessaoEncerramentoParams = {
  campanhaId: number;
  sessaoId: number;
  detalhe: SessaoCampanhaDetalhe | null;
  setDetalhe: (detalhe: SessaoCampanhaDetalhe) => void;
  sincronizarEstadosDerivados: (detalhe: SessaoCampanhaDetalhe) => void;
  setErro: (mensagem: string | null) => void;
  showToast: (mensagem: string, tipo?: 'success' | 'error' | 'warning' | 'info') => void;
  onEncerramentoConfirmado?: () => void;
};

type UseSessaoEncerramentoReturn = {
  encerrandoSessao: boolean;
  handleEncerrarSessao: () => Promise<void>;
};

export function useSessaoEncerramento({
  campanhaId,
  sessaoId,
  detalhe,
  setDetalhe,
  sincronizarEstadosDerivados,
  setErro,
  showToast,
  onEncerramentoConfirmado,
}: UseSessaoEncerramentoParams): UseSessaoEncerramentoReturn {
  const [encerrandoSessao, setEncerrandoSessao] = useState(false);

  const handleEncerrarSessao = useCallback(async () => {
    if (!detalhe || detalhe.status === 'ENCERRADA') return;

    setEncerrandoSessao(true);
    setErro(null);
    try {
      const atualizado = await apiEncerrarSessaoCampanha(campanhaId, sessaoId);
      setDetalhe(atualizado);
      sincronizarEstadosDerivados(atualizado);
      onEncerramentoConfirmado?.();
      showToast('Sessao encerrada.', 'warning');
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setEncerrandoSessao(false);
    }
  }, [
    campanhaId,
    detalhe,
    onEncerramentoConfirmado,
    sessaoId,
    setDetalhe,
    setErro,
    showToast,
    sincronizarEstadosDerivados,
  ]);

  return { encerrandoSessao, handleEncerrarSessao };
}
