import { useCallback, useState } from 'react';
import {
  apiAvancarTurnoSessaoCampanha,
  apiPularTurnoSessaoCampanha,
  apiVoltarTurnoSessaoCampanha,
  extrairMensagemErro,
} from '@/lib/api';
import type { SessaoCampanhaDetalhe } from '@/lib/types';
import type { AcaoControleTurno } from '@/components/campanha/sessao/types';

const labelParticipanteIniciativa = (turno: SessaoCampanhaDetalhe['turnoAtual']) => {
  if (!turno) return 'sem turno definido';
  if (turno.tipoParticipante === 'NPC') {
    return `${turno.nomePersonagem} (Aliado/Ameaca)`;
  }
  if (turno.nomeJogador) {
    return `${turno.nomePersonagem} (${turno.nomeJogador})`;
  }
  return turno.nomePersonagem;
};

type UseSessaoTurnosParams = {
  campanhaId: number;
  sessaoId: number;
  detalhe: SessaoCampanhaDetalhe | null;
  setDetalhe: (detalhe: SessaoCampanhaDetalhe) => void;
  sincronizarEstadosDerivados: (detalhe: SessaoCampanhaDetalhe) => void;
  setErro: (mensagem: string | null) => void;
  showToast: (mensagem: string, tipo?: 'success' | 'error' | 'warning' | 'info') => void;
};

type UseSessaoTurnosReturn = {
  acaoTurnoPendente: AcaoControleTurno | null;
  handleControleTurno: (acao: AcaoControleTurno) => Promise<void>;
};

export function useSessaoTurnos({
  campanhaId,
  sessaoId,
  detalhe,
  setDetalhe,
  sincronizarEstadosDerivados,
  setErro,
  showToast,
}: UseSessaoTurnosParams): UseSessaoTurnosReturn {
  const [acaoTurnoPendente, setAcaoTurnoPendente] = useState<AcaoControleTurno | null>(
    null,
  );

  const handleControleTurno = useCallback(
    async (acao: AcaoControleTurno) => {
      if (!detalhe || !detalhe.controleTurnosAtivo) return;

      setAcaoTurnoPendente(acao);
      setErro(null);
      try {
        const atualizado =
          acao === 'VOLTAR'
            ? await apiVoltarTurnoSessaoCampanha(campanhaId, sessaoId)
            : acao === 'PULAR'
              ? await apiPularTurnoSessaoCampanha(campanhaId, sessaoId)
              : await apiAvancarTurnoSessaoCampanha(campanhaId, sessaoId);
        setDetalhe(atualizado);
        sincronizarEstadosDerivados(atualizado);
        showToast(`Turno atualizado: ${labelParticipanteIniciativa(atualizado.turnoAtual)}.`, 'success');
      } catch (error) {
        setErro(extrairMensagemErro(error));
      } finally {
        setAcaoTurnoPendente(null);
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

  return { acaoTurnoPendente, handleControleTurno };
}
