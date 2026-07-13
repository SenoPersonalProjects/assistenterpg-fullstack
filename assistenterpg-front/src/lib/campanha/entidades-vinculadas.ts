import type {
  CapacidadeEntidadeVinculada,
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

export function formatarUsoCapacidadeEntidadeVinculada(
  capacidade: CapacidadeEntidadeVinculada,
  chave: 'cadastro' | 'ativo',
): string {
  const valor = capacidade[chave];
  const maximo = valor.maximo === null ? 'sem limite' : valor.maximo;
  const unidade = valor.unidade === 'VAGAS' ? ' vagas' : '';
  return `${valor.usado}/${maximo}${unidade}`;
}

export function resolverFluxoCriacaoEntidadeVinculada(
  capacidade: CapacidadeEntidadeVinculada | null | undefined,
) {
  return {
    habilitado: capacidade?.habilitado === true,
    permiteCriacaoManual: capacidade?.permiteCriarNovos === true,
    permiteTemplates: capacidade?.usaTemplates === true,
    bloqueado:
      !capacidade?.habilitado ||
      (!capacidade.permiteCriarNovos && !capacidade.usaTemplates),
  };
}
