import type { RolagemPericiaSessaoPayload } from '@/components/campanha/sessao/types';

export type IntencaoRolagemPericiaPersonagem = {
  tipo: 'PERICIA_PERSONAGEM';
  personagemSessaoId: number;
  periciaCodigo: string;
  visibilidade?: 'PUBLICA' | 'SECRETA_MESTRE';
  contexto?: { dt?: number };
  clientRequestId: string;
};

export function deveUsarRolagemPericiaAutoritativa(
  payload: RolagemPericiaSessaoPayload,
): boolean {
  return payload.alvoTipo === 'PERSONAGEM';
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
