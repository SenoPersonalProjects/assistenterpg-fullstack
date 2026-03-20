import { useCallback, useEffect, useRef, useState } from 'react';
import { apiAtualizarOrdemIniciativaSessaoCampanha, extrairMensagemErro } from '@/lib/api';
import type { SessaoCampanhaDetalhe } from '@/lib/types';
import { montarPayloadOrdemIniciativa } from '@/lib/campanha/sessao-utils';

type UseSessaoIniciativaParams = {
  campanhaId: number;
  sessaoId: number;
  detalhe: SessaoCampanhaDetalhe | null;
  podeControlarSessao: boolean;
  sessaoEncerrada: boolean;
  setDetalhe: (detalhe: SessaoCampanhaDetalhe) => void;
  sincronizarEstadosDerivados: (detalhe: SessaoCampanhaDetalhe) => void;
  setErro: (mensagem: string | null) => void;
};

type UseSessaoIniciativaReturn = {
  reordenandoIniciativa: boolean;
  sucessoReordenacao: boolean;
  indiceIniciativaArrastado: number | null;
  indiceIniciativaHover: number | null;
  setIndiceIniciativaArrastado: (indice: number | null) => void;
  setIndiceIniciativaHover: (indice: number | null) => void;
  handleMoverIniciativa: (indiceAtual: number, direcao: 'SUBIR' | 'DESCER') => Promise<void>;
  handleDropIniciativa: (indiceDestino: number) => Promise<void>;
};

export function useSessaoIniciativa({
  campanhaId,
  sessaoId,
  detalhe,
  podeControlarSessao,
  sessaoEncerrada,
  setDetalhe,
  sincronizarEstadosDerivados,
  setErro,
}: UseSessaoIniciativaParams): UseSessaoIniciativaReturn {
  const [reordenandoIniciativa, setReordenandoIniciativa] = useState(false);
  const [sucessoReordenacao, setSucessoReordenacao] = useState(false);
  const [indiceIniciativaArrastado, setIndiceIniciativaArrastado] = useState<
    number | null
  >(null);
  const [indiceIniciativaHover, setIndiceIniciativaHover] = useState<number | null>(
    null,
  );
  const timeoutSucessoRef = useRef<number | null>(null);

  const exibirSucessoReordenacao = useCallback(() => {
    setSucessoReordenacao(true);
    if (timeoutSucessoRef.current) {
      window.clearTimeout(timeoutSucessoRef.current);
    }
    timeoutSucessoRef.current = window.setTimeout(() => {
      setSucessoReordenacao(false);
      timeoutSucessoRef.current = null;
    }, 1800);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutSucessoRef.current) {
        window.clearTimeout(timeoutSucessoRef.current);
      }
    };
  }, []);

  const handleMoverIniciativa = useCallback(
    async (indiceAtual: number, direcao: 'SUBIR' | 'DESCER') => {
      if (!detalhe || !podeControlarSessao) return;
      if (sessaoEncerrada || reordenandoIniciativa) return;

      const ordemAtual = detalhe.iniciativa.ordem;
      const deslocamento = direcao === 'SUBIR' ? -1 : 1;
      const indiceDestino = indiceAtual + deslocamento;
      if (indiceDestino < 0 || indiceDestino >= ordemAtual.length) {
        return;
      }

      const novaOrdem = [...ordemAtual];
      const [movido] = novaOrdem.splice(indiceAtual, 1);
      novaOrdem.splice(indiceDestino, 0, movido);

      const resultado = montarPayloadOrdemIniciativa(
        novaOrdem,
        detalhe.iniciativa.indiceAtual,
      );
      if (resultado.erro || !resultado.payload) {
        setErro(resultado.erro);
        return;
      }

      setReordenandoIniciativa(true);
      setErro(null);
      try {
        const atualizado = await apiAtualizarOrdemIniciativaSessaoCampanha(
          campanhaId,
          sessaoId,
          resultado.payload,
        );
        setDetalhe(atualizado);
        sincronizarEstadosDerivados(atualizado);
        exibirSucessoReordenacao();
      } catch (error) {
        setErro(extrairMensagemErro(error));
      } finally {
        setReordenandoIniciativa(false);
      }
    },
    [
      campanhaId,
      detalhe,
      exibirSucessoReordenacao,
      podeControlarSessao,
      reordenandoIniciativa,
      sessaoEncerrada,
      sessaoId,
      setDetalhe,
      setErro,
      sincronizarEstadosDerivados,
    ],
  );

  const handleDropIniciativa = useCallback(
    async (indiceDestino: number) => {
      if (!detalhe || !podeControlarSessao) return;
      if (sessaoEncerrada || reordenandoIniciativa) return;
      if (indiceIniciativaArrastado === null) return;

      const ordemAtual = detalhe.iniciativa.ordem;
      if (
        indiceIniciativaArrastado < 0 ||
        indiceIniciativaArrastado >= ordemAtual.length ||
        indiceDestino < 0 ||
        indiceDestino >= ordemAtual.length
      ) {
        return;
      }

      if (indiceIniciativaArrastado === indiceDestino) {
        return;
      }

      const novaOrdem = [...ordemAtual];
      const [movido] = novaOrdem.splice(indiceIniciativaArrastado, 1);
      novaOrdem.splice(indiceDestino, 0, movido);

      const resultado = montarPayloadOrdemIniciativa(
        novaOrdem,
        detalhe.iniciativa.indiceAtual,
      );
      if (resultado.erro || !resultado.payload) {
        setErro(resultado.erro);
        return;
      }

      setReordenandoIniciativa(true);
      setErro(null);
      try {
        const atualizado = await apiAtualizarOrdemIniciativaSessaoCampanha(
          campanhaId,
          sessaoId,
          resultado.payload,
        );
        setDetalhe(atualizado);
        sincronizarEstadosDerivados(atualizado);
        exibirSucessoReordenacao();
      } catch (error) {
        setErro(extrairMensagemErro(error));
      } finally {
        setReordenandoIniciativa(false);
        setIndiceIniciativaArrastado(null);
        setIndiceIniciativaHover(null);
      }
    },
    [
      campanhaId,
      detalhe,
      exibirSucessoReordenacao,
      indiceIniciativaArrastado,
      podeControlarSessao,
      reordenandoIniciativa,
      sessaoEncerrada,
      sessaoId,
      setDetalhe,
      setErro,
      sincronizarEstadosDerivados,
    ],
  );

  return {
    reordenandoIniciativa,
    sucessoReordenacao,
    indiceIniciativaArrastado,
    indiceIniciativaHover,
    setIndiceIniciativaArrastado,
    setIndiceIniciativaHover,
    handleMoverIniciativa,
    handleDropIniciativa,
  };
}
