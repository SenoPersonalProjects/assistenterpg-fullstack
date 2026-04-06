import type {
  HabilidadeTecnicaSessaoCampanha,
  PericiaSessaoCampanha,
  VariacaoHabilidadeSessaoCampanha,
} from '../types/campanha.types';
import type { AtributoBaseCodigo } from '../utils/pericias';
import {
  calcularDadosPericiaPorAtributo,
  resolverValorAtributoBase,
} from '../utils/pericias';

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

export type DadoDanoSessao = {
  quantidade: number;
  dado: string;
  tipo: string;
};

export type EscalonamentoDanoSessao = {
  quantidade: number;
  dado: string;
  tipo: string;
};

export type TesteHabilidadeResolvido = {
  pericias: string[];
  periciaNomeExibida: string;
  atributoBase?: string | null;
  dados: number;
  bonus: number;
  keepMode: 'HIGHEST' | 'LOWEST';
};

function normalizarTextoComparacao(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function normalizarTestesExigidos(testes: unknown): string[] {
  if (!testes) return [];
  if (Array.isArray(testes)) {
    return testes.filter((item): item is string => typeof item === 'string');
  }
  if (typeof testes === 'string') {
    return [testes];
  }
  return [];
}

function limparDescricaoTeste(texto: string): string {
  return texto.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
}

function separarPericias(texto: string): string[] {
  return texto
    .split(/\s*(?:\bcom\b|\be\b|\/|,|\+)\s*/i)
    .map((parte) => parte.trim())
    .filter(Boolean);
}

export function resolverTesteHabilidade(
  testesExigidos: unknown,
  pericias: PericiaSessaoCampanha[],
  atributos:
    | {
        agilidade: number;
        forca: number;
        intelecto: number;
        presenca: number;
        vigor: number;
      }
    | null
    | undefined,
): TesteHabilidadeResolvido | null {
  const listaTestes = normalizarTestesExigidos(testesExigidos);
  if (listaTestes.length === 0) return null;
  const testeBruto = limparDescricaoTeste(listaTestes.join(', '));
  if (!testeBruto) return null;
  const nomesPericias = separarPericias(testeBruto);
  if (nomesPericias.length === 0) return null;

  const periciasEncontradas = nomesPericias.map((nome) => {
    const chave = normalizarTextoComparacao(nome);
    return pericias.find(
      (pericia) => normalizarTextoComparacao(pericia.nome) === chave,
    );
  });

  if (periciasEncontradas.some((item) => !item)) {
    return null;
  }

  let somaDados = 0;
  let somaBonus = 0;
  let usarLowest = false;

  for (const pericia of periciasEncontradas) {
    if (!pericia) continue;
    const atributoCodigo = pericia.atributoBase as AtributoBaseCodigo;
    const valorAtributo = resolverValorAtributoBase(
      atributos,
      atributoCodigo,
    ) ?? 0;
    const { dados, keepMode } = calcularDadosPericiaPorAtributo(valorAtributo);
    somaDados += dados;
    somaBonus += pericia.bonusTotal ?? 0;
    if (keepMode === 'LOWEST') usarLowest = true;
  }

  const quantidadePericias = periciasEncontradas.length || 1;
  const dados = Math.max(1, Math.trunc(somaDados / quantidadePericias));
  const bonus = Math.trunc(somaBonus / quantidadePericias);
  const keepMode = usarLowest ? 'LOWEST' : 'HIGHEST';
  const periciaNomeExibida =
    nomesPericias.length === 2
      ? `${nomesPericias[0]} com ${nomesPericias[1]}`
      : nomesPericias.join(' + ');

  return {
    pericias: nomesPericias,
    periciaNomeExibida,
    atributoBase: nomesPericias.length === 1 ? periciasEncontradas[0]?.atributoBase : null,
    dados,
    bonus,
    keepMode,
  };
}

function parseNumeroSeguro(valor: unknown): number | null {
  if (typeof valor === 'number' && Number.isFinite(valor)) {
    return Math.trunc(valor);
  }
  if (typeof valor === 'string' && valor.trim()) {
    const numero = Number(valor);
    if (Number.isFinite(numero)) return Math.trunc(numero);
  }
  return null;
}

function parseDadoFaces(valor: unknown): number | null {
  if (typeof valor === 'number' && Number.isFinite(valor)) {
    return Math.trunc(valor);
  }
  if (typeof valor === 'string') {
    const match = valor.trim().match(/(\d+)/);
    if (match?.[1]) {
      const faces = Number(match[1]);
      if (Number.isFinite(faces)) return Math.trunc(faces);
    }
  }
  return null;
}

export function normalizarDadosDano(valor: unknown): DadoDanoSessao[] {
  if (!Array.isArray(valor)) return [];
  const dados: DadoDanoSessao[] = [];
  for (const item of valor) {
    if (!item || typeof item !== 'object') continue;
    const entrada = item as { quantidade?: unknown; dado?: unknown; tipo?: unknown };
    const quantidade = parseNumeroSeguro(entrada.quantidade) ?? 0;
    const faces = parseDadoFaces(entrada.dado);
    const tipo = typeof entrada.tipo === 'string' ? entrada.tipo : '';
    if (quantidade > 0 && faces && faces > 0) {
      dados.push({ quantidade, dado: `d${faces}`, tipo });
    }
  }
  return dados;
}

export function normalizarEscalonamentoDano(
  valor: unknown,
): EscalonamentoDanoSessao | null {
  if (!valor || typeof valor !== 'object') return null;
  const entrada = valor as { quantidade?: unknown; dado?: unknown; tipo?: unknown };
  const quantidade = parseNumeroSeguro(entrada.quantidade) ?? 0;
  const faces = parseDadoFaces(entrada.dado);
  const tipo = typeof entrada.tipo === 'string' ? entrada.tipo : '';
  if (quantidade > 0 && faces && faces > 0) {
    return { quantidade, dado: `d${faces}`, tipo };
  }
  return null;
}
