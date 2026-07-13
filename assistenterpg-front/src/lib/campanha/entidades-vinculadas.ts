import type {
  EntidadeVinculadaPersonagem,
  EstadoEntidadeVinculadaPersonagem,
} from '@/lib/types';

const ESTADOS_FINAIS: EstadoEntidadeVinculadaPersonagem[] = [
  'DESTRUIDO',
  'SELADO',
  'DESCARREGADO',
  'ARQUIVADO',
];

export function validarPontosVidaEntidadeVinculada(
  pontosVidaMax: number,
  pontosVidaAtual: number,
): string | null {
  if (!Number.isInteger(pontosVidaMax) || pontosVidaMax < 1) {
    return 'PV maximo deve ser pelo menos 1.';
  }
  if (!Number.isInteger(pontosVidaAtual) || pontosVidaAtual < 0) {
    return 'PV atual deve ser pelo menos 0.';
  }
  if (pontosVidaAtual > pontosVidaMax) {
    return 'PV atual nao pode ser maior que o PV maximo.';
  }
  return null;
}

export function entidadeVinculadaAtivaNestaSessao(
  entidade: Pick<
    EntidadeVinculadaPersonagem,
    'ativoNestaSessao' | 'instanciasAtivas'
  >,
): boolean {
  return (
    entidade.ativoNestaSessao === true ||
    (entidade.instanciasAtivas?.length ?? 0) > 0
  );
}

export function podeInvocarEntidadeVinculada(
  entidade: Pick<
    EntidadeVinculadaPersonagem,
    'estado' | 'ativoNestaSessao' | 'instanciasAtivas'
  >,
  sessaoEncerrada: boolean,
): boolean {
  if (sessaoEncerrada) return false;
  if (ESTADOS_FINAIS.includes(entidade.estado)) return false;
  return !entidadeVinculadaAtivaNestaSessao(entidade);
}
