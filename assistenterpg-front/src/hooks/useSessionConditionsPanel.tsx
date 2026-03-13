import { useCallback } from 'react';
import { SessionConditionsPanel } from '@/components/campanha/sessao/SessionConditionsPanel';
import type { AlvoCondicoesModal, FormCondicaoSessao } from '@/components/campanha/sessao/types';
import type {
  CondicaoAtivaSessaoCampanha,
  CondicaoCatalogo,
  SessaoCampanhaDetalhe,
} from '@/lib/types';

type UseSessionConditionsPanelParams = {
  catalogoCondicoes: CondicaoCatalogo[];
  obterFormCondicaoAlvo: (
    alvoTipo: 'PERSONAGEM' | 'NPC',
    alvoId: number,
  ) => FormCondicaoSessao;
  chaveAcaoAplicarCondicao: (
    alvoTipo: 'PERSONAGEM' | 'NPC',
    alvoId: number,
  ) => string;
  chaveAcaoRemoverCondicao: (condicaoSessaoId: number) => string;
  podeControlarSessao: boolean;
  sessaoEncerrada: boolean;
  acaoCondicaoPendente: string | null;
  erro?: string | null;
  onAbrirModal: (modal: AlvoCondicoesModal) => void;
  onRemoverCondicao: (
    alvoTipo: 'PERSONAGEM' | 'NPC',
    alvoId: number,
    condicao: CondicaoAtivaSessaoCampanha,
    modo: 'inline' | 'accordion',
  ) => void;
};

export function useSessionConditionsPanel({
  catalogoCondicoes,
  obterFormCondicaoAlvo,
  chaveAcaoAplicarCondicao,
  chaveAcaoRemoverCondicao,
  podeControlarSessao,
  sessaoEncerrada,
  acaoCondicaoPendente,
  erro,
  onAbrirModal,
  onRemoverCondicao,
}: UseSessionConditionsPanelParams) {
  return useCallback(
    (
      alvoTipo: 'PERSONAGEM' | 'NPC',
      alvoId: number,
      nomeAlvo: string,
      condicoesAtivas: SessaoCampanhaDetalhe['cards'][number]['condicoesAtivas'],
      modo: 'inline' | 'accordion' = 'accordion',
    ) => {
      const form = obterFormCondicaoAlvo(alvoTipo, alvoId);
      const chaveAplicar = chaveAcaoAplicarCondicao(alvoTipo, alvoId);

      return (
        <SessionConditionsPanel
          condicoesAtivas={condicoesAtivas}
          catalogoCondicoes={catalogoCondicoes}
          formCondicao={form}
          podeControlarSessao={podeControlarSessao}
          sessaoEncerrada={sessaoEncerrada}
          acaoCondicaoPendente={acaoCondicaoPendente}
          chaveAcaoAplicar={chaveAplicar}
          chaveAcaoRemover={chaveAcaoRemoverCondicao}
          onAbrirModal={() =>
            onAbrirModal({
              alvoTipo,
              alvoId,
              nomeAlvo,
              condicoesAtivas,
            })
          }
          onRemoverCondicao={(condicao) =>
            onRemoverCondicao(alvoTipo, alvoId, condicao, modo)
          }
          modo={modo}
          erro={erro}
        />
      );
    },
    [
      acaoCondicaoPendente,
      catalogoCondicoes,
      chaveAcaoAplicarCondicao,
      chaveAcaoRemoverCondicao,
      erro,
      obterFormCondicaoAlvo,
      onAbrirModal,
      onRemoverCondicao,
      podeControlarSessao,
      sessaoEncerrada,
    ],
  );
}
