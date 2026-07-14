import type {
  RolagemAtaqueNpcAcaoSessaoPayload,
  RolagemDanoNpcAcaoSessaoPayload,
  RolagemPericiaSessaoPayload,
} from '@/components/campanha/sessao/types';
import { periciaPermiteAtaqueSessao } from './sessao-rolagem-pericia';

type VisibilidadeRolagem = 'PUBLICA' | 'SECRETA_MESTRE';

export function deveUsarRolagemPericiaNpcAutoritativa(
  payload: RolagemPericiaSessaoPayload,
): boolean {
  return payload.alvoTipo === 'NPC' && payload.tipoRolagem !== 'ATAQUE';
}

export function deveUsarRolagemAtaqueNpcAutoritativa(
  payload: RolagemPericiaSessaoPayload,
): boolean {
  return (
    payload.alvoTipo === 'NPC' &&
    payload.tipoRolagem === 'ATAQUE' &&
    periciaPermiteAtaqueSessao(payload.periciaCodigo)
  );
}

export function montarIntencaoRolagemPericiaNpc(
  payload: RolagemPericiaSessaoPayload,
  visibilidade: VisibilidadeRolagem,
  clientRequestId: string,
) {
  if (
    !Number.isInteger(payload.npcSessaoId) ||
    Number(payload.npcSessaoId) <= 0 ||
    !payload.periciaCodigo?.trim()
  ) {
    throw new Error('NPC ou pericia invalidos para a rolagem.');
  }
  return {
    tipo: 'PERICIA_NPC' as const,
    npcSessaoId: Number(payload.npcSessaoId),
    periciaCodigo: payload.periciaCodigo.trim().toUpperCase(),
    visibilidade,
    clientRequestId,
  };
}

export function montarIntencaoRolagemAtaqueNpcPericia(
  payload: RolagemPericiaSessaoPayload,
  visibilidade: VisibilidadeRolagem,
  clientRequestId: string,
) {
  if (
    !Number.isInteger(payload.npcSessaoId) ||
    Number(payload.npcSessaoId) <= 0 ||
    !periciaPermiteAtaqueSessao(payload.periciaCodigo)
  ) {
    throw new Error('NPC ou pericia invalidos para o ataque.');
  }
  return {
    tipo: 'ATAQUE_NPC' as const,
    origemAtaque: 'PERICIA' as const,
    npcSessaoId: Number(payload.npcSessaoId),
    periciaCodigo: payload.periciaCodigo!.trim().toUpperCase(),
    visibilidade,
    clientRequestId,
  };
}

export function montarIntencaoRolagemAtaqueNpcAcao(
  payload: RolagemAtaqueNpcAcaoSessaoPayload,
  visibilidade: VisibilidadeRolagem,
  clientRequestId: string,
) {
  if (
    !Number.isInteger(payload.npcSessaoId) ||
    payload.npcSessaoId <= 0 ||
    !Number.isInteger(payload.acaoIndice) ||
    payload.acaoIndice < 0
  ) {
    throw new Error('NPC ou acao invalidos para o ataque.');
  }
  return {
    tipo: 'ATAQUE_NPC' as const,
    origemAtaque: 'ACAO' as const,
    npcSessaoId: payload.npcSessaoId,
    acaoIndice: payload.acaoIndice,
    visibilidade,
    clientRequestId,
  };
}

export function montarIntencaoRolagemDanoNpcAcao(
  payload: RolagemDanoNpcAcaoSessaoPayload,
  visibilidade: VisibilidadeRolagem,
  clientRequestId: string,
) {
  if (
    !Number.isInteger(payload.npcSessaoId) ||
    payload.npcSessaoId <= 0 ||
    !Number.isInteger(payload.acaoIndice) ||
    payload.acaoIndice < 0
  ) {
    throw new Error('NPC ou acao invalidos para a rolagem de dano.');
  }
  return {
    tipo: 'DANO_NPC' as const,
    origemDano: 'ACAO' as const,
    npcSessaoId: payload.npcSessaoId,
    acaoIndice: payload.acaoIndice,
    visibilidade,
    clientRequestId,
  };
}
