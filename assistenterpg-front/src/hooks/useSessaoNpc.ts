import { useCallback, useState } from 'react';
import {
  apiAdicionarNpcSimplesSessaoCampanha,
  apiAdicionarNpcSessaoCampanha,
  apiAtualizarNpcSessaoCampanha,
  apiRemoverNpcSessaoCampanha,
  extrairMensagemErro,
} from '@/lib/api';
import type { NpcSessaoCampanha, SessaoCampanhaDetalhe } from '@/lib/types';
import type {
  AjustesRecursosNpc,
  CampoAjusteRecursoNpc,
  NpcEditavel,
} from '@/components/campanha/sessao/types';
import {
  clampEntre,
  parseInteiroComSinal,
  parseRecurso,
  parseRecursoOpcional,
} from '@/lib/campanha/sessao-utils';

type UseSessaoNpcParams = {
  campanhaId: number;
  sessaoId: number;
  sessaoEncerrada: boolean;
  edicaoNpcs: Record<number, NpcEditavel>;
  obterAjustesRecursosNpc: (npcSessaoId: number) => AjustesRecursosNpc;
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
  campoRecursoPendente: `${number}:${CampoAjusteRecursoNpc}` | null;
  removendoNpcId: number | null;
  handleAdicionarNpcNaCena: (
    npcAmeacaId: number,
    nomeExibicao: string,
    recursos?: {
      sanAtual?: string;
      sanMax?: string;
      eaAtual?: string;
      eaMax?: string;
      iniciativaValor?: number | null;
    },
  ) => Promise<void>;
  handleAdicionarNpcSimplesNaCena: (payload: {
    nome: string;
    defesa: number;
    pontosVidaMax: number;
    pontosVidaAtual?: number;
    fichaTipo?: NpcSessaoCampanha['fichaTipo'];
    tipo?: NpcSessaoCampanha['tipo'];
    tamanho?: string;
    vd?: number;
    iniciativaValor?: number | null;
    sanAtual?: string;
    sanMax?: string;
    eaAtual?: string;
    eaMax?: string;
    agilidade?: string;
    forca?: string;
    intelecto?: string;
    presenca?: string;
    vigor?: string;
    percepcao?: string;
    iniciativa?: string;
    fortitude?: string;
    reflexos?: string;
    vontade?: string;
    luta?: string;
    jujutsu?: string;
    notasCena?: string;
  }) => Promise<void>;
  handleSalvarNpc: (npc: NpcSessaoCampanha) => Promise<void>;
  handleAplicarDeltaRecursoNpc: (
    npc: NpcSessaoCampanha,
    campo: CampoAjusteRecursoNpc,
    delta: number,
  ) => Promise<void>;
  handleAplicarAjustePersonalizadoRecursoNpc: (
    npc: NpcSessaoCampanha,
    campo: CampoAjusteRecursoNpc,
  ) => Promise<void>;
  handleRemoverNpc: (npcSessaoId: number) => Promise<void>;
};

export function useSessaoNpc({
  campanhaId,
  sessaoId,
  sessaoEncerrada,
  edicaoNpcs,
  obterAjustesRecursosNpc,
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
  const [campoRecursoPendente, setCampoRecursoPendente] = useState<
    `${number}:${CampoAjusteRecursoNpc}` | null
  >(null);
  const [removendoNpcId, setRemovendoNpcId] = useState<number | null>(null);

  const montarPayloadAjustadoNpc = useCallback(
    (
      npc: NpcSessaoCampanha,
      campo: CampoAjusteRecursoNpc,
      delta: number,
    ) => {
      if (!Number.isFinite(delta) || Math.trunc(delta) === 0) return null;
      const deltaInteiro = Math.trunc(delta);
      if (campo === 'pv') {
        return {
          pontosVidaAtual: clampEntre(
            npc.pontosVidaAtual + deltaInteiro,
            0,
            npc.pontosVidaMax,
          ),
        };
      }
      if (campo === 'san') {
        if (npc.sanAtual === null || npc.sanMax === null) return null;
        return {
          sanAtual: clampEntre(npc.sanAtual + deltaInteiro, 0, npc.sanMax),
        };
      }
      if (campo === 'ea') {
        if (npc.eaAtual === null || npc.eaMax === null) return null;
        return {
          eaAtual: clampEntre(npc.eaAtual + deltaInteiro, 0, npc.eaMax),
        };
      }
      return null;
    },
    [],
  );

  const handleAdicionarNpcNaCena = useCallback(
    async (
      npcAmeacaId: number,
      nomeExibicao: string,
      recursos?: {
        sanAtual?: string;
        sanMax?: string;
        eaAtual?: string;
        eaMax?: string;
        iniciativaValor?: number | null;
      },
    ) => {
      if (!Number.isInteger(npcAmeacaId) || npcAmeacaId <= 0) return;

      setAdicionandoNpc(true);
      setErro(null);
      try {
        const sanAtual = parseRecursoOpcional(recursos?.sanAtual ?? '', null);
        const sanMax = parseRecursoOpcional(recursos?.sanMax ?? '', null);
        const eaAtual = parseRecursoOpcional(recursos?.eaAtual ?? '', null);
        const eaMax = parseRecursoOpcional(recursos?.eaMax ?? '', null);
        const iniciativaValor = recursos?.iniciativaValor;
        const payload = {
          npcAmeacaId,
          nomeExibicao: nomeExibicao.trim() || undefined,
          sanAtual: sanAtual ?? undefined,
          sanMax: sanMax ?? undefined,
          eaAtual: eaAtual ?? undefined,
          eaMax: eaMax ?? undefined,
          iniciativaValor,
        };
        const atualizado = await apiAdicionarNpcSessaoCampanha(
          campanhaId,
          sessaoId,
          payload,
        );
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

  const handleAdicionarNpcSimplesNaCena = useCallback(
    async (payload: {
      nome: string;
      defesa: number;
      pontosVidaMax: number;
      pontosVidaAtual?: number;
      fichaTipo?: NpcSessaoCampanha['fichaTipo'];
      tipo?: NpcSessaoCampanha['tipo'];
      tamanho?: string;
      vd?: number;
      iniciativaValor?: number | null;
      sanAtual?: string;
      sanMax?: string;
      eaAtual?: string;
      eaMax?: string;
      agilidade?: string;
      forca?: string;
      intelecto?: string;
      presenca?: string;
      vigor?: string;
      percepcao?: string;
      iniciativa?: string;
      fortitude?: string;
      reflexos?: string;
      vontade?: string;
      luta?: string;
      jujutsu?: string;
      notasCena?: string;
    }) => {
      setAdicionandoNpc(true);
      setErro(null);
      try {
        const sanAtual = parseRecursoOpcional(payload.sanAtual ?? '', null);
        const sanMax = parseRecursoOpcional(payload.sanMax ?? '', null);
        const eaAtual = parseRecursoOpcional(payload.eaAtual ?? '', null);
        const eaMax = parseRecursoOpcional(payload.eaMax ?? '', null);
        const parseOpcional = (value?: string) =>
          value?.trim() ? Number(value) : undefined;

        const atualizado = await apiAdicionarNpcSimplesSessaoCampanha(
          campanhaId,
          sessaoId,
          {
            nome: payload.nome.trim(),
            defesa: payload.defesa,
            pontosVidaMax: payload.pontosVidaMax,
            pontosVidaAtual: payload.pontosVidaAtual,
            fichaTipo: payload.fichaTipo,
            tipo: payload.tipo,
            tamanho: payload.tamanho,
            vd: payload.vd,
            iniciativaValor: payload.iniciativaValor,
            sanAtual: sanAtual ?? undefined,
            sanMax: sanMax ?? undefined,
            eaAtual: eaAtual ?? undefined,
            eaMax: eaMax ?? undefined,
            agilidade: parseOpcional(payload.agilidade),
            forca: parseOpcional(payload.forca),
            intelecto: parseOpcional(payload.intelecto),
            presenca: parseOpcional(payload.presenca),
            vigor: parseOpcional(payload.vigor),
            percepcao: parseOpcional(payload.percepcao),
            iniciativa: parseOpcional(payload.iniciativa),
            fortitude: parseOpcional(payload.fortitude),
            reflexos: parseOpcional(payload.reflexos),
            vontade: parseOpcional(payload.vontade),
            luta: parseOpcional(payload.luta),
            jujutsu: parseOpcional(payload.jujutsu),
            notasCena: payload.notasCena?.trim() || undefined,
          },
        );
        setDetalhe(atualizado);
        sincronizarEstadosDerivados(atualizado);
        onNpcAdicionado?.();
        showToast('NPC simples adicionado na cena.', 'success');
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
            fichaTipo: draft.fichaTipo as NpcSessaoCampanha['fichaTipo'],
            tipo: draft.tipo as NpcSessaoCampanha['tipo'],
            tamanho: draft.tamanho || undefined,
            defesa: parseRecurso(draft.defesa, npc.defesa),
            pontosVidaMax: parseRecurso(draft.pontosVidaMax, npc.pontosVidaMax),
            sanMax: parseRecursoOpcional(draft.sanMax, npc.sanMax),
            eaMax: parseRecursoOpcional(draft.eaMax, npc.eaMax),
            machucado: parseRecursoOpcional(draft.machucado, npc.machucado),
            agilidade: parseRecursoOpcional(
              draft.agilidade,
              npc.atributos?.agilidade ?? null,
            ),
            forca: parseRecursoOpcional(draft.forca, npc.atributos?.forca ?? null),
            intelecto: parseRecursoOpcional(
              draft.intelecto,
              npc.atributos?.intelecto ?? null,
            ),
            presenca: parseRecursoOpcional(
              draft.presenca,
              npc.atributos?.presenca ?? null,
            ),
            vigor: parseRecursoOpcional(draft.vigor, npc.atributos?.vigor ?? null),
            percepcao: parseRecursoOpcional(
              draft.percepcao,
              npc.pericias.find((pericia) => pericia.codigo === 'PERCEPCAO')?.bonus ??
                null,
            ),
            iniciativa: parseRecursoOpcional(
              draft.iniciativa,
              npc.pericias.find((pericia) => pericia.codigo === 'INICIATIVA')?.bonus ??
                null,
            ),
            fortitude: parseRecursoOpcional(
              draft.fortitude,
              npc.pericias.find((pericia) => pericia.codigo === 'FORTITUDE')?.bonus ??
                null,
            ),
            reflexos: parseRecursoOpcional(
              draft.reflexos,
              npc.pericias.find((pericia) => pericia.codigo === 'REFLEXOS')?.bonus ??
                null,
            ),
            vontade: parseRecursoOpcional(
              draft.vontade,
              npc.pericias.find((pericia) => pericia.codigo === 'VONTADE')?.bonus ??
                null,
            ),
            luta: parseRecursoOpcional(
              draft.luta,
              npc.pericias.find((pericia) => pericia.codigo === 'LUTA')?.bonus ??
                null,
            ),
            jujutsu: parseRecursoOpcional(
              draft.jujutsu,
              npc.pericias.find((pericia) => pericia.codigo === 'JUJUTSU')?.bonus ??
                null,
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

  const handleAplicarDeltaRecursoNpc = useCallback(
    async (
      npc: NpcSessaoCampanha,
      campo: CampoAjusteRecursoNpc,
      delta: number,
    ) => {
      if (!npc.podeEditar || sessaoEncerrada) return;

      const payload = montarPayloadAjustadoNpc(npc, campo, delta);
      if (!payload) return;
      const chaveCampo = `${npc.npcSessaoId}:${campo}` as const;

      setSalvandoNpcId(npc.npcSessaoId);
      setCampoRecursoPendente(chaveCampo);
      setErro(null);
      try {
        const atualizado = await apiAtualizarNpcSessaoCampanha(
          campanhaId,
          sessaoId,
          npc.npcSessaoId,
          payload,
        );
        setDetalhe(atualizado);
        sincronizarEstadosDerivados(atualizado);
      } catch (error) {
        setErro(extrairMensagemErro(error));
      } finally {
        setSalvandoNpcId(null);
        setCampoRecursoPendente(null);
      }
    },
    [
      campanhaId,
      montarPayloadAjustadoNpc,
      sessaoEncerrada,
      sessaoId,
      setDetalhe,
      setErro,
      sincronizarEstadosDerivados,
    ],
  );

  const handleAplicarAjustePersonalizadoRecursoNpc = useCallback(
    async (npc: NpcSessaoCampanha, campo: CampoAjusteRecursoNpc) => {
      const ajuste = obterAjustesRecursosNpc(npc.npcSessaoId)[campo];
      const delta = parseInteiroComSinal(ajuste);
      if (delta === null || delta === 0) {
        setErro('Informe um ajuste inteiro diferente de zero (ex.: -3, +2).');
        return;
      }

      await handleAplicarDeltaRecursoNpc(npc, campo, delta);
    },
    [
      handleAplicarDeltaRecursoNpc,
      obterAjustesRecursosNpc,
      setErro,
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
    campoRecursoPendente,
    removendoNpcId,
    handleAdicionarNpcNaCena,
    handleAdicionarNpcSimplesNaCena,
    handleSalvarNpc,
    handleAplicarDeltaRecursoNpc,
    handleAplicarAjustePersonalizadoRecursoNpc,
    handleRemoverNpc,
  };
}
