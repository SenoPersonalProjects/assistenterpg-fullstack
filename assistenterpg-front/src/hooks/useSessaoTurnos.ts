import { useCallback, useRef, useState } from 'react';
import {
  apiAvancarTurnoSessaoCampanha,
  apiPularTurnoSessaoCampanha,
  apiReprocessarEfeitosTurnoSessaoCampanha,
  apiVoltarTurnoSessaoCampanha,
} from '@/lib/api';
import {
  criarErroControleTurno,
  montarPrecondicaoControleTurno,
} from '@/lib/campanha/sessao-turnos';
import type { SessaoCampanhaDetalhe, UserErrorState } from '@/lib/types';
import type { AcaoControleTurno } from '@/components/campanha/sessao/types';

const labelParticipanteIniciativa = (turno: SessaoCampanhaDetalhe['turnoAtual']) => {
  if (!turno) return 'sem turno definido';
  if (turno.tipoParticipante === 'NPC') {
    return `${turno.nomePersonagem} (Aliado/Ameaça)`;
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
  setErro: (mensagem: UserErrorState | null) => void;
  showToast: (mensagem: string, tipo?: 'success' | 'error' | 'warning' | 'info') => void;
};

type UseSessaoTurnosReturn = {
  acaoTurnoPendente: AcaoControleTurno | null;
  reprocessandoEfeitosTurno: boolean;
  handleControleTurno: (acao: AcaoControleTurno) => Promise<void>;
  handleReprocessarEfeitosTurno: () => Promise<void>;
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
  const acaoTurnoPendenteRef = useRef<AcaoControleTurno | null>(null);
  const [reprocessandoEfeitosTurno, setReprocessandoEfeitosTurno] =
    useState(false);

  const handleControleTurno = useCallback(
    async (acao: AcaoControleTurno) => {
      if (!detalhe || !detalhe.controleTurnosAtivo) return;
      if (detalhe.efeitosTurnoPendentes) return;
      if (acaoTurnoPendenteRef.current) return;

      acaoTurnoPendenteRef.current = acao;
      setAcaoTurnoPendente(acao);
      setErro(null);
      try {
        const precondicao = montarPrecondicaoControleTurno(detalhe);
        const atualizado =
          acao === 'VOLTAR'
            ? await apiVoltarTurnoSessaoCampanha(
                campanhaId,
                sessaoId,
                precondicao,
              )
            : acao === 'PULAR'
              ? await apiPularTurnoSessaoCampanha(
                  campanhaId,
                  sessaoId,
                  precondicao,
                )
              : await apiAvancarTurnoSessaoCampanha(
                  campanhaId,
                  sessaoId,
                  precondicao,
                );
        setDetalhe(atualizado);
        sincronizarEstadosDerivados(atualizado);
        if (atualizado.efeitosTurnoPendentes) {
          showToast(
            'Turno atualizado, mas os efeitos automáticos precisam ser reprocessados.',
            'warning',
          );
        } else {
          showToast(
            `Turno atualizado: ${labelParticipanteIniciativa(atualizado.turnoAtual)}.`,
            'success',
          );
        }
      } catch (error) {
        setErro(criarErroControleTurno(error));
      } finally {
        acaoTurnoPendenteRef.current = null;
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

  const handleReprocessarEfeitosTurno = useCallback(async () => {
    const pendencia = detalhe?.efeitosTurnoPendentes;
    if (!pendencia || reprocessandoEfeitosTurno) return;
    setReprocessandoEfeitosTurno(true);
    setErro(null);
    try {
      const atualizado = await apiReprocessarEfeitosTurnoSessaoCampanha(
        campanhaId,
        sessaoId,
        pendencia.eventoId,
      );
      setDetalhe(atualizado);
      sincronizarEstadosDerivados(atualizado);
      showToast('Efeitos automáticos do turno concluídos.', 'success');
    } catch (error) {
      setErro(criarErroControleTurno(error));
      showToast(
        'Os efeitos automáticos continuam pendentes. Tente novamente.',
        'warning',
      );
    } finally {
      setReprocessandoEfeitosTurno(false);
    }
  }, [
    campanhaId,
    detalhe?.efeitosTurnoPendentes,
    reprocessandoEfeitosTurno,
    sessaoId,
    setDetalhe,
    setErro,
    showToast,
    sincronizarEstadosDerivados,
  ]);

  return {
    acaoTurnoPendente,
    reprocessandoEfeitosTurno,
    handleControleTurno,
    handleReprocessarEfeitosTurno,
  };
}
