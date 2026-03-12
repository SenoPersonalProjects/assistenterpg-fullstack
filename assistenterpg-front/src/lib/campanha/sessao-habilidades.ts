import type {
  HabilidadeTecnicaSessaoCampanha,
  VariacaoHabilidadeSessaoCampanha,
} from '../types/campanha.types';

export type CustoExibicaoSessao = {
  custoEA: number;
  custoPE: number;
  duracao: string | null;
  sustentada: boolean;
  escalonavel: boolean;
  acumulosMaximos: number;
  escalonamentoCustoEA: number;
  escalonamentoCustoPE: number;
  custoSustentacaoEA: number | null;
  custoSustentacaoPE: number | null;
};

function normalizar(valor: number | null | undefined, fallback = 0): number {
  return Number.isFinite(valor) ? Math.max(0, Math.trunc(Number(valor))) : fallback;
}

export function duracaoEhSustentada(duracao: string | null | undefined): boolean {
  if (!duracao) return false;

  const normalizado = duracao
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();

  return (
    normalizado.includes('SUSTENTAD') ||
    normalizado.includes('SUSTAIN') ||
    normalizado.includes('CONCENTRACAO')
  );
}

export function formatarCustos(custoEA: number, custoPE: number): string {
  const partes: string[] = [];
  if (custoEA > 0) partes.push(`EA ${custoEA}`);
  if (custoPE > 0) partes.push(`PE ${custoPE}`);
  if (partes.length === 0) return 'Sem custo';
  return partes.join(' | ');
}

export function resolverCustoExibicaoSessao(
  habilidade: HabilidadeTecnicaSessaoCampanha,
  variacao?: VariacaoHabilidadeSessaoCampanha,
): CustoExibicaoSessao {
  const baseEA = normalizar(habilidade.custoEA, 0);
  const basePE = normalizar(habilidade.custoPE, 0);

  let custoEA = baseEA;
  let custoPE = basePE;
  let duracao = habilidade.duracao;
  let custoSustentacaoEA = habilidade.custoSustentacaoEA;
  let custoSustentacaoPE = habilidade.custoSustentacaoPE;
  let escalonaPorGrau = habilidade.escalonaPorGrau;
  let escalonamentoCustoEA = habilidade.escalonamentoCustoEA;
  let escalonamentoCustoPE = habilidade.escalonamentoCustoPE;
  let acumulosMaximos = habilidade.acumulosMaximos;

  if (variacao) {
    if (variacao.substituiCustos) {
      custoEA = normalizar(variacao.custoEA, custoEA);
      custoPE = normalizar(variacao.custoPE, custoPE);
    } else {
      custoEA += normalizar(variacao.custoEA, 0);
      custoPE += normalizar(variacao.custoPE, 0);
    }
    if (variacao.duracao) duracao = variacao.duracao;
    if (typeof variacao.custoSustentacaoEA === 'number') {
      custoSustentacaoEA = variacao.custoSustentacaoEA;
    }
    if (typeof variacao.custoSustentacaoPE === 'number') {
      custoSustentacaoPE = variacao.custoSustentacaoPE;
    }
    if (typeof variacao.escalonaPorGrau === 'boolean') {
      escalonaPorGrau = variacao.escalonaPorGrau;
    }
    if (typeof variacao.escalonamentoCustoEA === 'number') {
      escalonamentoCustoEA = variacao.escalonamentoCustoEA;
    }
    if (typeof variacao.escalonamentoCustoPE === 'number') {
      escalonamentoCustoPE = variacao.escalonamentoCustoPE;
    }
    acumulosMaximos = variacao.acumulosMaximos;
  }

  const sustentada = duracaoEhSustentada(duracao);
  const escalonavel = Boolean(escalonaPorGrau) && acumulosMaximos > 0;

  return {
    custoEA,
    custoPE,
    duracao: duracao ?? null,
    sustentada,
    escalonavel,
    acumulosMaximos,
    escalonamentoCustoEA: escalonavel ? normalizar(escalonamentoCustoEA, 1) || 1 : 0,
    escalonamentoCustoPE: escalonavel ? normalizar(escalonamentoCustoPE, 0) : 0,
    custoSustentacaoEA: sustentada ? normalizar(custoSustentacaoEA, 1) : null,
    custoSustentacaoPE: sustentada ? normalizar(custoSustentacaoPE, 0) : null,
  };
}
