import { useCallback, useState } from 'react';
import {
  carregarLayoutSessaoLobby,
  salvarLayoutSessaoLobby,
} from '@/lib/campanha/sessao-layout-preferences';
import type { SessionSidebarTabId } from '@/components/campanha/sessao/SessionSidebarTabs';

type UseSessaoLayoutParams = {
  idsValidos: boolean;
  usuarioId: number | null | undefined;
  campanhaId: number;
  sessaoId: number;
};

type UseSessaoLayoutReturn = {
  colunaEsquerdaRecolhida: boolean;
  setColunaEsquerdaRecolhida: (valor: boolean) => void;
  colunaDireitaRecolhida: boolean;
  setColunaDireitaRecolhida: (valor: boolean) => void;
  abaPainelDireitoAtiva: SessionSidebarTabId;
  setAbaPainelDireitoAtiva: (valor: SessionSidebarTabId) => void;
};

export function useSessaoLayout({
  idsValidos,
  usuarioId,
  campanhaId,
  sessaoId,
}: UseSessaoLayoutParams): UseSessaoLayoutReturn {
  const [layoutAtual, setLayoutAtual] = useState(() => {
    if (!idsValidos || typeof usuarioId !== 'number') {
      return {
        colunaEsquerdaRecolhida: false,
        colunaDireitaRecolhida: false,
        abaDireitaAtiva: 'chat' as SessionSidebarTabId,
      };
    }

    return carregarLayoutSessaoLobby(usuarioId, campanhaId, sessaoId);
  });

  const salvarLayout = useCallback(
    (proximo: Partial<{
      colunaEsquerdaRecolhida: boolean;
      colunaDireitaRecolhida: boolean;
      abaDireitaAtiva: SessionSidebarTabId;
    }>) => {
      if (!idsValidos || typeof usuarioId !== 'number') return;

      setLayoutAtual((anterior) => {
        const layoutFinal = { ...anterior, ...proximo };
        salvarLayoutSessaoLobby(usuarioId, campanhaId, sessaoId, {
          colunaEsquerdaRecolhida: layoutFinal.colunaEsquerdaRecolhida,
          colunaDireitaRecolhida: layoutFinal.colunaDireitaRecolhida,
          abaDireitaAtiva: layoutFinal.abaDireitaAtiva,
        });
        return layoutFinal;
      });
    },
    [campanhaId, idsValidos, sessaoId, usuarioId],
  );

  const setColunaEsquerdaRecolhida = useCallback(
    (valor: boolean) => {
      salvarLayout({ colunaEsquerdaRecolhida: valor });
    },
    [salvarLayout],
  );

  const setColunaDireitaRecolhida = useCallback(
    (valor: boolean) => {
      salvarLayout({ colunaDireitaRecolhida: valor });
    },
    [salvarLayout],
  );

  const setAbaPainelDireitoAtiva = useCallback(
    (valor: SessionSidebarTabId) => {
      salvarLayout({ abaDireitaAtiva: valor });
    },
    [salvarLayout],
  );

  return {
    colunaEsquerdaRecolhida: layoutAtual.colunaEsquerdaRecolhida,
    setColunaEsquerdaRecolhida,
    colunaDireitaRecolhida: layoutAtual.colunaDireitaRecolhida,
    setColunaDireitaRecolhida,
    abaPainelDireitoAtiva: layoutAtual.abaDireitaAtiva,
    setAbaPainelDireitoAtiva,
  };
}
