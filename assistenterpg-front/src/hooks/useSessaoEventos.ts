import { useCallback, useState } from 'react';
import {
  apiDesfazerEventoSessaoCampanha,
  apiListarEventosSessaoCampanha,
  extrairMensagemErro,
} from '@/lib/api';
import type { EventoSessaoTimeline, SessaoCampanhaDetalhe } from '@/lib/types';

type UseSessaoEventosParams = {
  idsValidos: boolean;
  usuarioId: number | null | undefined;
  campanhaId: number;
  sessaoId: number;
  setDetalhe: (detalhe: SessaoCampanhaDetalhe) => void;
  sincronizarEstadosDerivados: (detalhe: SessaoCampanhaDetalhe) => void;
  setEventosSessao: (eventos: EventoSessaoTimeline[]) => void;
  setErro: (mensagem: string | null) => void;
  onEventoDesfeito?: () => void;
};

type UseSessaoEventosReturn = {
  desfazendoEventoId: number | null;
  handleDesfazerEvento: (eventoId: number, motivo?: string) => Promise<void>;
};

export function useSessaoEventos({
  idsValidos,
  usuarioId,
  campanhaId,
  sessaoId,
  setDetalhe,
  sincronizarEstadosDerivados,
  setEventosSessao,
  setErro,
  onEventoDesfeito,
}: UseSessaoEventosParams): UseSessaoEventosReturn {
  const [desfazendoEventoId, setDesfazendoEventoId] = useState<number | null>(null);

  const handleDesfazerEvento = useCallback(
    async (eventoId: number, motivo?: string) => {
      if (!idsValidos || !usuarioId) return;

      setDesfazendoEventoId(eventoId);
      setErro(null);
      try {
        const [detalheAtualizada, eventosAtualizados] = await Promise.all([
          apiDesfazerEventoSessaoCampanha(campanhaId, sessaoId, eventoId, {
            motivo: motivo?.trim() || undefined,
          }),
          apiListarEventosSessaoCampanha(campanhaId, sessaoId, {
            limit: 80,
            incluirChat: false,
          }),
        ]);

        setDetalhe(detalheAtualizada);
        sincronizarEstadosDerivados(detalheAtualizada);
        setEventosSessao(eventosAtualizados);
        onEventoDesfeito?.();
      } catch (error) {
        setErro(extrairMensagemErro(error));
      } finally {
        setDesfazendoEventoId(null);
      }
    },
    [
      campanhaId,
      idsValidos,
      onEventoDesfeito,
      sessaoId,
      setDetalhe,
      setErro,
      setEventosSessao,
      sincronizarEstadosDerivados,
      usuarioId,
    ],
  );

  return { desfazendoEventoId, handleDesfazerEvento };
}
