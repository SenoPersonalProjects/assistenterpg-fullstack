import { useCallback, useState } from 'react';
import {
  apiAplicarCondicaoSessaoCampanha,
  apiRemoverCondicaoSessaoCampanha,
  extrairMensagemErro,
} from '@/lib/api';
import type { SessaoCampanhaDetalhe } from '@/lib/types';
import type { AlvoCondicoesModal, FormCondicaoSessao } from '@/components/campanha/sessao/types';
import { validarAplicacaoCondicao } from '@/lib/campanha/sessao-utils';

type UseSessaoCondicoesParams = {
  campanhaId: number;
  sessaoId: number;
  sessaoEncerrada: boolean;
  podeControlarSessao: boolean;
  setDetalhe: (detalhe: SessaoCampanhaDetalhe) => void;
  sincronizarEstadosDerivados: (detalhe: SessaoCampanhaDetalhe) => void;
  setErro: (mensagem: string | null) => void;
  showToast: (mensagem: string, tipo?: 'success' | 'error' | 'warning' | 'info') => void;
};

type UseSessaoCondicoesReturn = {
  formCondicaoPorAlvo: Record<string, FormCondicaoSessao>;
  formCondicaoPadrao: FormCondicaoSessao;
  obterFormCondicaoAlvo: (alvoTipo: 'PERSONAGEM' | 'NPC', alvoId: number) => FormCondicaoSessao;
  atualizarCampoFormCondicao: (
    alvoTipo: 'PERSONAGEM' | 'NPC',
    alvoId: number,
    campo: keyof FormCondicaoSessao,
    valor: string,
  ) => void;
  acaoCondicaoPendente: string | null;
  handleAplicarCondicao: (alvoTipo: 'PERSONAGEM' | 'NPC', alvoId: number) => Promise<void>;
  handleRemoverCondicao: (
    alvoTipo: 'PERSONAGEM' | 'NPC',
    alvoId: number,
    condicaoSessaoId: number,
  ) => Promise<void>;
  chaveAlvoCondicao: (alvoTipo: 'PERSONAGEM' | 'NPC', alvoId: number) => string;
  chaveAcaoAplicarCondicao: (alvoTipo: 'PERSONAGEM' | 'NPC', alvoId: number) => string;
  chaveAcaoRemoverCondicao: (condicaoSessaoId: number) => string;
};

const FORM_CONDICAO_PADRAO: FormCondicaoSessao = {
  condicaoId: '',
  duracaoModo: 'ATE_REMOVER',
  duracaoValor: '1',
  origemDescricao: '',
  observacao: '',
  motivoRemocao: '',
};

export function useSessaoCondicoes({
  campanhaId,
  sessaoId,
  sessaoEncerrada,
  podeControlarSessao,
  setDetalhe,
  sincronizarEstadosDerivados,
  setErro,
  showToast,
}: UseSessaoCondicoesParams): UseSessaoCondicoesReturn {
  const [formCondicaoPorAlvo, setFormCondicaoPorAlvo] = useState<
    Record<string, FormCondicaoSessao>
  >({});
  const [acaoCondicaoPendente, setAcaoCondicaoPendente] = useState<string | null>(
    null,
  );

  const chaveAlvoCondicao = useCallback(
    (alvoTipo: 'PERSONAGEM' | 'NPC', alvoId: number) => `${alvoTipo}:${alvoId}`,
    [],
  );

  const chaveAcaoAplicarCondicao = useCallback(
    (alvoTipo: 'PERSONAGEM' | 'NPC', alvoId: number) =>
      `aplicar:${alvoTipo}:${alvoId}`,
    [],
  );

  const chaveAcaoRemoverCondicao = useCallback(
    (condicaoSessaoId: number) => `remover:${condicaoSessaoId}`,
    [],
  );

  const obterFormCondicaoAlvo = useCallback(
    (alvoTipo: 'PERSONAGEM' | 'NPC', alvoId: number): FormCondicaoSessao =>
      formCondicaoPorAlvo[chaveAlvoCondicao(alvoTipo, alvoId)] ?? FORM_CONDICAO_PADRAO,
    [chaveAlvoCondicao, formCondicaoPorAlvo],
  );

  const atualizarCampoFormCondicao = useCallback(
    (
      alvoTipo: 'PERSONAGEM' | 'NPC',
      alvoId: number,
      campo: keyof FormCondicaoSessao,
      valor: string,
    ) => {
      const chave = chaveAlvoCondicao(alvoTipo, alvoId);
      setFormCondicaoPorAlvo((estadoAtual) => ({
        ...estadoAtual,
        [chave]: {
          ...(estadoAtual[chave] ?? FORM_CONDICAO_PADRAO),
          [campo]: valor,
        },
      }));
    },
    [chaveAlvoCondicao],
  );

  const handleAplicarCondicao = useCallback(
    async (alvoTipo: 'PERSONAGEM' | 'NPC', alvoId: number) => {
      if (!podeControlarSessao || sessaoEncerrada) return;

      const form = obterFormCondicaoAlvo(alvoTipo, alvoId);
      const validacao = validarAplicacaoCondicao(form);

      if (validacao.erro || !validacao.condicaoId) {
        setErro(validacao.erro);
        return;
      }

      const chaveAcao = chaveAcaoAplicarCondicao(alvoTipo, alvoId);
      setAcaoCondicaoPendente(chaveAcao);
      setErro(null);
      try {
        const atualizado = await apiAplicarCondicaoSessaoCampanha(
          campanhaId,
          sessaoId,
          {
            condicaoId: validacao.condicaoId,
            alvoTipo,
            personagemSessaoId: alvoTipo === 'PERSONAGEM' ? alvoId : undefined,
            npcSessaoId: alvoTipo === 'NPC' ? alvoId : undefined,
            duracaoModo: form.duracaoModo,
            duracaoValor: validacao.duracaoValor ?? undefined,
            origemDescricao: form.origemDescricao.trim() || undefined,
            observacao: form.observacao.trim() || undefined,
          },
        );
        setDetalhe(atualizado);
        sincronizarEstadosDerivados(atualizado);
        showToast('Condicao aplicada.', 'success');
      } catch (error) {
        setErro(extrairMensagemErro(error));
      } finally {
        setAcaoCondicaoPendente(null);
      }
    },
    [
      campanhaId,
      chaveAcaoAplicarCondicao,
      obterFormCondicaoAlvo,
      podeControlarSessao,
      sessaoEncerrada,
      sessaoId,
      setDetalhe,
      setErro,
      showToast,
      sincronizarEstadosDerivados,
    ],
  );

  const handleRemoverCondicao = useCallback(
    async (
      alvoTipo: 'PERSONAGEM' | 'NPC',
      alvoId: number,
      condicaoSessaoId: number,
    ) => {
      if (!podeControlarSessao || sessaoEncerrada) return;

      const form = obterFormCondicaoAlvo(alvoTipo, alvoId);
      const chaveAcao = chaveAcaoRemoverCondicao(condicaoSessaoId);
      setAcaoCondicaoPendente(chaveAcao);
      setErro(null);
      try {
        const atualizado = await apiRemoverCondicaoSessaoCampanha(
          campanhaId,
          sessaoId,
          condicaoSessaoId,
          {
            motivo: form.motivoRemocao.trim() || undefined,
          },
        );
        setDetalhe(atualizado);
        sincronizarEstadosDerivados(atualizado);
        showToast('Condicao removida.', 'success');
      } catch (error) {
        setErro(extrairMensagemErro(error));
      } finally {
        setAcaoCondicaoPendente(null);
      }
    },
    [
      campanhaId,
      chaveAcaoRemoverCondicao,
      obterFormCondicaoAlvo,
      podeControlarSessao,
      sessaoEncerrada,
      sessaoId,
      setDetalhe,
      setErro,
      showToast,
      sincronizarEstadosDerivados,
    ],
  );

  return {
    formCondicaoPorAlvo,
    formCondicaoPadrao: FORM_CONDICAO_PADRAO,
    obterFormCondicaoAlvo,
    atualizarCampoFormCondicao,
    acaoCondicaoPendente,
    handleAplicarCondicao,
    handleRemoverCondicao,
    chaveAlvoCondicao,
    chaveAcaoAplicarCondicao,
    chaveAcaoRemoverCondicao,
  };
}

export type { AlvoCondicoesModal };
