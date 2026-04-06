import { useCallback, useState } from 'react';
import {
  apiEncerrarSustentacaoHabilidadeSessaoCampanha,
  apiUsarHabilidadeSessaoCampanha,
  extrairMensagemErro,
  formatarErroComContexto,
} from '@/lib/api';
import type { SessaoCampanhaDetalhe } from '@/lib/types';
import { calcularRestanteCooldown } from '@/lib/campanha/sessao-utils';

type UseSessaoHabilidadesParams = {
  campanhaId: number;
  sessaoId: number;
  sessaoEncerrada: boolean;
  setDetalhe: (detalhe: SessaoCampanhaDetalhe) => void;
  sincronizarEstadosDerivados: (detalhe: SessaoCampanhaDetalhe) => void;
  setErro: (mensagem: string | null) => void;
  cooldownMs: number;
};

type UseSessaoHabilidadesReturn = {
  acaoHabilidadePendente: string | null;
  handleUsarHabilidade: (
    personagemSessaoId: number,
    habilidadeTecnicaId: number,
    variacaoHabilidadeId?: number,
    acumulos?: number,
  ) => Promise<void>;
  handleEncerrarSustentacao: (personagemSessaoId: number, sustentacaoId: number) => Promise<void>;
};

function montarChaveUsoHabilidade(
  personagemSessaoId: number,
  habilidadeTecnicaId: number,
  variacaoHabilidadeId?: number,
): string {
  return `usar:${personagemSessaoId}:${habilidadeTecnicaId}:${variacaoHabilidadeId ?? 'base'}`;
}

function montarChaveEncerrarSustentacao(
  personagemSessaoId: number,
  sustentacaoId: number,
): string {
  return `encerrar:${personagemSessaoId}:${sustentacaoId}`;
}

export function useSessaoHabilidades({
  campanhaId,
  sessaoId,
  sessaoEncerrada,
  setDetalhe,
  sincronizarEstadosDerivados,
  setErro,
  cooldownMs,
}: UseSessaoHabilidadesParams): UseSessaoHabilidadesReturn {
  const [acaoHabilidadePendente, setAcaoHabilidadePendente] = useState<string | null>(null);
  const [ultimoUsoHabilidadeMs, setUltimoUsoHabilidadeMs] = useState<
    Record<string, number>
  >({});

  const handleUsarHabilidade = useCallback(
    async (
      personagemSessaoId: number,
      habilidadeTecnicaId: number,
      variacaoHabilidadeId?: number,
      acumulos?: number,
    ) => {
      if (sessaoEncerrada) return;

      const chave = montarChaveUsoHabilidade(
        personagemSessaoId,
        habilidadeTecnicaId,
        variacaoHabilidadeId,
      );
      const agora = Date.now();
      const ultimoUso = ultimoUsoHabilidadeMs[chave] ?? 0;
      const restanteCooldown = calcularRestanteCooldown(agora, ultimoUso, cooldownMs);
      if (restanteCooldown > 0) {
        setErro(`Aguarde ${Math.ceil(restanteCooldown / 1000)}s antes de usar novamente.`);
        return;
      }

      setAcaoHabilidadePendente(chave);
      setUltimoUsoHabilidadeMs((estadoAtual) => ({
        ...estadoAtual,
        [chave]: agora,
      }));
      setErro(null);
      try {
        const atualizado = await apiUsarHabilidadeSessaoCampanha(
          campanhaId,
          sessaoId,
          personagemSessaoId,
          {
            habilidadeTecnicaId,
            variacaoHabilidadeId,
            acumulos: (() => {
              if (typeof acumulos !== 'number' || !Number.isFinite(acumulos)) {
                return undefined;
              }
              const normalizado = Math.trunc(acumulos);
              if (normalizado <= 0) return undefined;
              return Math.max(1, normalizado);
            })(),
          },
        );
        setDetalhe(atualizado);
        sincronizarEstadosDerivados(atualizado);
      } catch (error) {
        const mensagem = extrairMensagemErro(error);
        setErro(
          formatarErroComContexto(mensagem, error, {
            incluirCode: true,
            incluirStatus: true,
            incluirRequestId: true,
          }),
        );
      } finally {
        setAcaoHabilidadePendente(null);
      }
    },
    [
      campanhaId,
      cooldownMs,
      sessaoEncerrada,
      sessaoId,
      setDetalhe,
      setErro,
      sincronizarEstadosDerivados,
      ultimoUsoHabilidadeMs,
    ],
  );

  const handleEncerrarSustentacao = useCallback(
    async (personagemSessaoId: number, sustentacaoId: number) => {
      if (sessaoEncerrada) return;

      const chave = montarChaveEncerrarSustentacao(personagemSessaoId, sustentacaoId);
      setAcaoHabilidadePendente(chave);
      setErro(null);
      try {
        const atualizado = await apiEncerrarSustentacaoHabilidadeSessaoCampanha(
          campanhaId,
          sessaoId,
          personagemSessaoId,
          sustentacaoId,
        );
        setDetalhe(atualizado);
        sincronizarEstadosDerivados(atualizado);
      } catch (error) {
        const mensagem = extrairMensagemErro(error);
        setErro(
          formatarErroComContexto(mensagem, error, {
            incluirCode: true,
            incluirStatus: true,
            incluirRequestId: true,
          }),
        );
      } finally {
        setAcaoHabilidadePendente(null);
      }
    },
    [
      campanhaId,
      sessaoEncerrada,
      sessaoId,
      setDetalhe,
      setErro,
      sincronizarEstadosDerivados,
    ],
  );

  return { acaoHabilidadePendente, handleUsarHabilidade, handleEncerrarSustentacao };
}
