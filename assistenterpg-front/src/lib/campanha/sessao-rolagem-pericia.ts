import type { RolagemPericiaSessaoPayload } from '@/components/campanha/sessao/types';

export type IntencaoRolagemPericiaPersonagem = {
  tipo: 'PERICIA_PERSONAGEM';
  personagemSessaoId: number;
  periciaCodigo: string;
  visibilidade?: 'PUBLICA' | 'SECRETA_MESTRE';
  contexto?: { dt?: number };
  clientRequestId: string;
};

export type IntencaoRolagemAtaquePersonagem = {
  tipo: 'ATAQUE_PERSONAGEM';
  personagemSessaoId: number;
  periciaCodigo: string;
  visibilidade?: 'PUBLICA' | 'SECRETA_MESTRE';
  contexto?: { dt?: number };
  clientRequestId: string;
};

export const PERICIAS_ATAQUE_PERSONAGEM = [
  'LUTA',
  'PONTARIA',
  'JUJUTSU',
] as const;

const PERICIAS_ATAQUE_PERSONAGEM_SET = new Set<string>(
  PERICIAS_ATAQUE_PERSONAGEM,
);

export function periciaPermiteAtaqueSessao(
  periciaCodigo?: string | null,
): boolean {
  return PERICIAS_ATAQUE_PERSONAGEM_SET.has(
    periciaCodigo?.trim().toUpperCase() ?? '',
  );
}

export const periciaPermiteAtaquePersonagem = periciaPermiteAtaqueSessao;

export function deveUsarRolagemPericiaAutoritativa(
  payload: RolagemPericiaSessaoPayload,
): boolean {
  return (
    payload.alvoTipo === 'PERSONAGEM' && payload.tipoRolagem !== 'ATAQUE'
  );
}

export function deveUsarRolagemAtaqueAutoritativa(
  payload: RolagemPericiaSessaoPayload,
): boolean {
  return (
    payload.alvoTipo === 'PERSONAGEM' &&
    payload.tipoRolagem === 'ATAQUE'
  );
}

export function montarIntencaoRolagemPericiaPersonagem(
  payload: RolagemPericiaSessaoPayload,
  visibilidade: 'PUBLICA' | 'SECRETA_MESTRE',
  clientRequestId: string,
): IntencaoRolagemPericiaPersonagem {
  if (
    !Number.isInteger(payload.personagemSessaoId) ||
    Number(payload.personagemSessaoId) <= 0 ||
    !payload.periciaCodigo?.trim()
  ) {
    throw new Error('Personagem ou perícia inválidos para a rolagem.');
  }
  return {
    tipo: 'PERICIA_PERSONAGEM',
    personagemSessaoId: Number(payload.personagemSessaoId),
    periciaCodigo: payload.periciaCodigo.trim().toUpperCase(),
    visibilidade,
    clientRequestId,
  };
}

export function montarIntencaoRolagemAtaquePersonagem(
  payload: RolagemPericiaSessaoPayload,
  visibilidade: 'PUBLICA' | 'SECRETA_MESTRE',
  clientRequestId: string,
): IntencaoRolagemAtaquePersonagem {
  if (
    !Number.isInteger(payload.personagemSessaoId) ||
    Number(payload.personagemSessaoId) <= 0 ||
    !periciaPermiteAtaqueSessao(payload.periciaCodigo)
  ) {
    throw new Error('Personagem ou pericia invalidos para o ataque.');
  }
  return {
    tipo: 'ATAQUE_PERSONAGEM',
    personagemSessaoId: Number(payload.personagemSessaoId),
    periciaCodigo: payload.periciaCodigo!.trim().toUpperCase(),
    visibilidade,
    clientRequestId,
  };
}
