import { useCallback, useState } from 'react';
import {
  carregarFiltroSustentadasLobby,
  salvarFiltroSustentadasLobby,
} from '@/lib/campanha/sessao-filtro-sustentadas';

type UseSessaoFiltroSustentadasParams = {
  idsValidos: boolean;
  usuarioId?: number | null;
  campanhaId: number;
  sessaoId: number;
};

export function useSessaoFiltroSustentadas({
  idsValidos,
  usuarioId,
  campanhaId,
  sessaoId,
}: UseSessaoFiltroSustentadasParams) {
  const [, setFiltroVersion] = useState(0);

  const filtroAtual = (() => {
    if (!idsValidos || typeof usuarioId !== 'number') {
      return {};
    }

    return carregarFiltroSustentadasLobby(usuarioId, campanhaId, sessaoId);
  })();

  const setMostrarSomenteSustentadas = useCallback(
    (
      atualizacao:
        | Record<number, boolean>
        | ((estado: Record<number, boolean>) => Record<number, boolean>),
    ) => {
      if (!idsValidos || typeof usuarioId !== 'number') return;

      const valor =
        typeof atualizacao === 'function' ? atualizacao(filtroAtual) : atualizacao;
      salvarFiltroSustentadasLobby(usuarioId, campanhaId, sessaoId, valor);
      setFiltroVersion((versao) => versao + 1);
    },
    [campanhaId, filtroAtual, idsValidos, sessaoId, usuarioId],
  );

  return { mostrarSomenteSustentadas: filtroAtual, setMostrarSomenteSustentadas };
}
