import type { DuracaoCondicaoSessaoModo, SessaoCampanhaDetalhe } from '@/lib/types';
import type { FormCondicaoSessao } from '@/components/campanha/sessao/types';

export function parseRecurso(valor: string, fallback: number): number {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return fallback;
  return Math.trunc(numero);
}

export function parseInteiroComSinal(valor: string): number | null {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return null;
  return Math.trunc(numero);
}

export function clampEntre(valor: number, minimo: number, maximo: number): number {
  return Math.max(minimo, Math.min(maximo, valor));
}

export function parseInteiroPositivo(
  valor: string,
  fallback: number | null = null,
): number | null {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return fallback;
  const inteiro = Math.trunc(numero);
  return inteiro > 0 ? inteiro : fallback;
}

export function calcularIntervaloPolling(socketConectado: boolean): number {
  return socketConectado ? 15000 : 3000;
}

export function calcularRestanteCooldown(
  agora: number,
  ultimoUso: number,
  cooldownMs: number,
): number {
  return cooldownMs - (agora - ultimoUso);
}

export function calcularIndiceProximoTurno(
  indiceAtual: number | null,
  total: number,
): number | null {
  if (!Number.isFinite(total) || total <= 0) return null;
  if (typeof indiceAtual === 'number' && Number.isFinite(indiceAtual)) {
    return (indiceAtual + 1) % total;
  }
  return 0;
}

type OrdemPayload = {
  ordem: Array<{ tipoParticipante: 'PERSONAGEM' | 'NPC'; id: number }>;
  indiceTurnoAtual?: number;
};

type ResultadoOrdem = {
  payload: OrdemPayload | null;
  erro: string | null;
};

export function montarPayloadOrdemIniciativa(
  ordem: SessaoCampanhaDetalhe['iniciativa']['ordem'],
  indiceTurnoAtual: number | null,
): ResultadoOrdem {
  const payload: OrdemPayload = {
    ordem: ordem.map((participante) => ({
      tipoParticipante: participante.tipoParticipante,
      id:
        participante.tipoParticipante === 'NPC'
          ? (participante.npcSessaoId ?? 0)
          : (participante.personagemSessaoId ?? 0),
    })),
    indiceTurnoAtual: indiceTurnoAtual ?? undefined,
  };

  if (payload.ordem.some((item) => item.id <= 0)) {
    return {
      payload: null,
      erro: 'Nao foi possivel reordenar iniciativa: participante invalido.',
    };
  }

  return { payload, erro: null };
}

type ValidacaoCondicao = {
  condicaoId: number | null;
  duracaoValor: number | null;
  erro: string | null;
};

export function validarAplicacaoCondicao(
  form: Pick<FormCondicaoSessao, 'condicaoId' | 'duracaoModo' | 'duracaoValor'>,
): ValidacaoCondicao {
  const condicaoId = parseInteiroPositivo(form.condicaoId);
  if (!condicaoId) {
    return {
      condicaoId: null,
      duracaoValor: null,
      erro: 'Selecione uma condicao valida para aplicar.',
    };
  }

  const requerDuracaoNumerica = form.duracaoModo !== 'ATE_REMOVER';
  const duracaoValor = requerDuracaoNumerica
    ? parseInteiroPositivo(form.duracaoValor)
    : null;

  if (requerDuracaoNumerica && !duracaoValor) {
    return {
      condicaoId,
      duracaoValor: null,
      erro: 'Informe uma duracao numerica maior que zero.',
    };
  }

  return {
    condicaoId,
    duracaoValor: duracaoValor ?? null,
    erro: null,
  };
}

export const OPCOES_DURACAO_CONDICAO: Array<{
  value: DuracaoCondicaoSessaoModo;
  label: string;
}> = [
  { value: 'ATE_REMOVER', label: 'Ate remover manualmente' },
  { value: 'RODADAS', label: 'Por rodadas da cena' },
  { value: 'TURNOS_ALVO', label: 'Por turnos do alvo' },
];

export const COOLDOWN_USO_HABILIDADE_MS = 2500;
