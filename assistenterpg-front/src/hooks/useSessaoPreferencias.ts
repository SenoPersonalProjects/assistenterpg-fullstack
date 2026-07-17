import { useCallback, useState } from 'react';
import {
  carregarPreferenciasSessao,
  salvarPreferenciasSessao,
  type AbaDetalheCard,
  type PreferenciasSessaoLobby,
} from '@/lib/campanha/sessao-preferencias';

type UseSessaoPreferenciasParams = {
  idsValidos: boolean;
  usuarioId?: number | null;
  campanhaId: number;
  sessaoId: number;
};

export function useSessaoPreferencias({
  idsValidos,
  usuarioId,
  campanhaId,
  sessaoId,
}: UseSessaoPreferenciasParams) {
  const [, setPreferenciasVersion] = useState(0);

  const preferenciasAtual = (() => {
    if (!idsValidos || typeof usuarioId !== 'number') {
      return {
        abasDetalheCard: {},
        tecnicasInatasAbertas: {},
        tecnicasNaoInatasAbertas: {},
        macrosArmas: {},
        macrosPersonalizadas: {},
      };
    }

    return carregarPreferenciasSessao(usuarioId, campanhaId, sessaoId);
  })();

  const salvarPreferencias = useCallback(
    (proximo: Partial<PreferenciasSessaoLobby>) => {
      if (!idsValidos || typeof usuarioId !== 'number') return;

      const base = carregarPreferenciasSessao(usuarioId, campanhaId, sessaoId);
      const final = { ...base, ...proximo };
      salvarPreferenciasSessao(usuarioId, campanhaId, sessaoId, final);
      setPreferenciasVersion((versao) => versao + 1);
    },
    [campanhaId, idsValidos, sessaoId, usuarioId],
  );

  const setAbasDetalheCard = useCallback(
    (
      atualizacao:
        | Record<number, AbaDetalheCard>
        | ((estado: Record<number, AbaDetalheCard>) => Record<number, AbaDetalheCard>),
    ) => {
      const valor =
        typeof atualizacao === 'function'
          ? atualizacao(preferenciasAtual.abasDetalheCard)
          : atualizacao;
      salvarPreferencias({ abasDetalheCard: valor });
    },
    [preferenciasAtual.abasDetalheCard, salvarPreferencias],
  );

  const setTecnicasInatasAbertas = useCallback(
    (
      atualizacao:
        | Record<number, boolean>
        | ((estado: Record<number, boolean>) => Record<number, boolean>),
    ) => {
      const valor =
        typeof atualizacao === 'function'
          ? atualizacao(preferenciasAtual.tecnicasInatasAbertas)
          : atualizacao;
      salvarPreferencias({ tecnicasInatasAbertas: valor });
    },
    [preferenciasAtual.tecnicasInatasAbertas, salvarPreferencias],
  );

  const setTecnicasNaoInatasAbertas = useCallback(
    (
      atualizacao:
        | Record<number, boolean>
        | ((estado: Record<number, boolean>) => Record<number, boolean>),
    ) => {
      const valor =
        typeof atualizacao === 'function'
          ? atualizacao(preferenciasAtual.tecnicasNaoInatasAbertas)
          : atualizacao;
      salvarPreferencias({ tecnicasNaoInatasAbertas: valor });
    },
    [preferenciasAtual.tecnicasNaoInatasAbertas, salvarPreferencias],
  );

  const setMacrosArmas = useCallback(
    (
      atualizacao:
        | PreferenciasSessaoLobby['macrosArmas']
        | ((
            estado: PreferenciasSessaoLobby['macrosArmas'],
          ) => PreferenciasSessaoLobby['macrosArmas']),
    ) => {
      const valor =
        typeof atualizacao === 'function'
          ? atualizacao(preferenciasAtual.macrosArmas)
          : atualizacao;
      salvarPreferencias({ macrosArmas: valor });
    },
    [preferenciasAtual.macrosArmas, salvarPreferencias],
  );

  const setMacrosPersonalizadas = useCallback(
    (
      atualizacao:
        | PreferenciasSessaoLobby['macrosPersonalizadas']
        | ((estado: PreferenciasSessaoLobby['macrosPersonalizadas']) => PreferenciasSessaoLobby['macrosPersonalizadas']),
    ) => {
      const valor = typeof atualizacao === 'function'
        ? atualizacao(preferenciasAtual.macrosPersonalizadas)
        : atualizacao;
      salvarPreferencias({ macrosPersonalizadas: valor });
    },
    [preferenciasAtual.macrosPersonalizadas, salvarPreferencias],
  );

  return {
    abasDetalheCard: preferenciasAtual.abasDetalheCard,
    setAbasDetalheCard,
    tecnicasInatasAbertas: preferenciasAtual.tecnicasInatasAbertas,
    setTecnicasInatasAbertas,
    tecnicasNaoInatasAbertas: preferenciasAtual.tecnicasNaoInatasAbertas,
    setTecnicasNaoInatasAbertas,
    macrosArmas: preferenciasAtual.macrosArmas,
    setMacrosArmas,
    macrosPersonalizadas: preferenciasAtual.macrosPersonalizadas,
    setMacrosPersonalizadas,
  };
}
