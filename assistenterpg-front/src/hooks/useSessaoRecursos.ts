import {
  useCallback,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import {
  apiAtualizarRecursosPersonagemSessaoCampanha,
  criarErroUsuario,
} from '@/lib/api';
import type {
  AtualizacaoRecursosSessaoCampanha,
  CampoRecursoSessaoCampanha,
  SessaoCampanhaDetalhe,
  UserErrorState,
} from '@/lib/types';
import { clampEntre, parseInteiroComSinal } from '@/lib/campanha/sessao-utils';
import { criarClientRequestIdRolagem } from '@/lib/campanha/sessao-dice';
import {
  aplicarAtualizacaoIncrementalSessao,
  criarAtualizacaoOtimistaRecurso,
} from '@/lib/campanha/sessao-atualizacoes';

export type CampoAjusteRecurso = 'pv' | 'pe' | 'ea' | 'san';
export type AjustesRecursos = Record<CampoAjusteRecurso, string>;

export const AJUSTE_RECURSO_PADRAO: AjustesRecursos = {
  pv: '0',
  pe: '0',
  ea: '0',
  san: '0',
};

const CAMPO_API_POR_RECURSO: Record<
  CampoAjusteRecurso,
  CampoRecursoSessaoCampanha
> = {
  pv: 'pvAtual',
  pe: 'peAtual',
  ea: 'eaAtual',
  san: 'sanAtual',
};

type UseSessaoRecursosParams = {
  campanhaId: number;
  sessaoId: number;
  sessaoEncerrada: boolean;
  setDetalhe: Dispatch<SetStateAction<SessaoCampanhaDetalhe | null>>;
  setErro: (mensagem: UserErrorState | null) => void;
  obterAjustesRecursosCard: (personagemCampanhaId: number) => AjustesRecursos;
  registrarMutacaoLocal: (mutacaoId: string) => void;
  aplicarAtualizacaoAutoritativa: (
    atualizacao: AtualizacaoRecursosSessaoCampanha,
  ) => void;
  sincronizarCompleto: () => void | Promise<void>;
};

type UseSessaoRecursosReturn = {
  camposRecursosPendentes: ReadonlySet<string>;
  handleAplicarDeltaRecursoCard: (
    card: SessaoCampanhaDetalhe['cards'][number],
    campo: CampoAjusteRecurso,
    delta: number,
  ) => Promise<void>;
  handleAplicarAjustePersonalizadoRecursoCard: (
    card: SessaoCampanhaDetalhe['cards'][number],
    campo: CampoAjusteRecurso,
  ) => Promise<void>;
};

export function useSessaoRecursos({
  campanhaId,
  sessaoId,
  sessaoEncerrada,
  setDetalhe,
  setErro,
  obterAjustesRecursosCard,
  registrarMutacaoLocal,
  aplicarAtualizacaoAutoritativa,
  sincronizarCompleto,
}: UseSessaoRecursosParams): UseSessaoRecursosReturn {
  const pendentesRef = useRef(new Set<string>());
  const [camposRecursosPendentes, setCamposRecursosPendentes] = useState<
    ReadonlySet<string>
  >(() => new Set());

  const atualizarPendencia = useCallback((chave: string, pendente: boolean) => {
    const proximo = new Set(pendentesRef.current);
    if (pendente) {
      proximo.add(chave);
    } else {
      proximo.delete(chave);
    }
    pendentesRef.current = proximo;
    setCamposRecursosPendentes(proximo);
  }, []);

  const calcularValorAjustado = useCallback(
    (
      card: SessaoCampanhaDetalhe['cards'][number],
      campo: CampoAjusteRecurso,
      delta: number,
    ): { campoApi: CampoRecursoSessaoCampanha; anterior: number; valor: number } | null => {
      if (!card.recursos) return null;
      const campoApi = CAMPO_API_POR_RECURSO[campo];
      const anterior = card.recursos[campoApi];
      const maximo =
        campo === 'pv'
          ? (card.recursos.pvBarraMaxAtual ?? card.recursos.pvMax)
          : card.recursos[
              `${campoApi.slice(0, -5)}Max` as 'peMax' | 'eaMax' | 'sanMax'
            ];
      return {
        campoApi,
        anterior,
        valor: clampEntre(anterior + delta, 0, maximo),
      };
    },
    [],
  );

  const handleAplicarDeltaRecursoCard = useCallback(
    async (
      card: SessaoCampanhaDetalhe['cards'][number],
      campo: CampoAjusteRecurso,
      delta: number,
    ) => {
      if (!card.podeEditar || !card.recursos || sessaoEncerrada) return;
      if (!Number.isFinite(delta) || Math.trunc(delta) === 0) return;

      const ajuste = calcularValorAjustado(card, campo, Math.trunc(delta));
      if (!ajuste || ajuste.valor === ajuste.anterior) return;
      const chaveCampo = `${card.personagemCampanhaId}:${campo}`;
      if (pendentesRef.current.has(chaveCampo)) return;

      const mutacaoId = criarClientRequestIdRolagem();
      registrarMutacaoLocal(mutacaoId);
      atualizarPendencia(chaveCampo, true);
      setErro(null);
      setDetalhe((atual) =>
        atual
          ? aplicarAtualizacaoIncrementalSessao(
              atual,
              criarAtualizacaoOtimistaRecurso({
                campanhaId,
                sessaoId,
                personagemSessaoId: card.personagemSessaoId,
                personagemCampanhaId: card.personagemCampanhaId,
                mutacaoId,
                campo: ajuste.campoApi,
                valor: ajuste.valor,
              }),
            )
          : atual,
      );

      try {
        const atualizacao =
          await apiAtualizarRecursosPersonagemSessaoCampanha(
            campanhaId,
            sessaoId,
            card.personagemSessaoId,
            {
              clientRequestId: mutacaoId,
              [ajuste.campoApi]: ajuste.valor,
              [`${ajuste.campoApi}Esperado`]: ajuste.anterior,
            },
          );
        aplicarAtualizacaoAutoritativa(atualizacao);
      } catch (error) {
        setDetalhe((atual) =>
          atual
            ? aplicarAtualizacaoIncrementalSessao(
                atual,
                criarAtualizacaoOtimistaRecurso({
                  campanhaId,
                  sessaoId,
                  personagemSessaoId: card.personagemSessaoId,
                  personagemCampanhaId: card.personagemCampanhaId,
                  mutacaoId,
                  campo: ajuste.campoApi,
                  valor: ajuste.anterior,
                }),
              )
            : atual,
        );
        setErro(criarErroUsuario(error));
        await sincronizarCompleto();
      } finally {
        atualizarPendencia(chaveCampo, false);
      }
    },
    [
      aplicarAtualizacaoAutoritativa,
      atualizarPendencia,
      calcularValorAjustado,
      campanhaId,
      registrarMutacaoLocal,
      sessaoEncerrada,
      sessaoId,
      setDetalhe,
      setErro,
      sincronizarCompleto,
    ],
  );

  const handleAplicarAjustePersonalizadoRecursoCard = useCallback(
    async (
      card: SessaoCampanhaDetalhe['cards'][number],
      campo: CampoAjusteRecurso,
    ) => {
      const ajuste = obterAjustesRecursosCard(card.personagemCampanhaId)[campo];
      const delta = parseInteiroComSinal(ajuste);
      if (delta === null || delta === 0) {
        setErro('Informe um ajuste inteiro diferente de zero (ex.: -3, +2).');
        return;
      }
      await handleAplicarDeltaRecursoCard(card, campo, delta);
    },
    [handleAplicarDeltaRecursoCard, obterAjustesRecursosCard, setErro],
  );

  return {
    camposRecursosPendentes,
    handleAplicarDeltaRecursoCard,
    handleAplicarAjustePersonalizadoRecursoCard,
  };
}
