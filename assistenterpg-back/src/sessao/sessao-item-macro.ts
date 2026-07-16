export const ATRIBUTOS_MACRO_ARMA = ['FOR', 'AGI'] as const;
export type AtributoMacroArma = (typeof ATRIBUTOS_MACRO_ARMA)[number];

export const EMPUNHADURAS_MACRO_ARMA = [
  'LEVE',
  'UMA_MAO',
  'DUAS_MAOS',
] as const;
export type EmpunhaduraMacroArma = (typeof EMPUNHADURAS_MACRO_ARMA)[number];

export type TipoArmaMacro = 'CORPO_A_CORPO' | 'A_DISTANCIA';

export type CondicaoMacroAtiva = {
  nome: string;
};

export type AjusteAutomaticoMacroArma = {
  condicao: string;
  dados: number;
  motivo: string;
};

const EMPUNHADURAS_MACRO_ARMA_SET = new Set<string>(EMPUNHADURAS_MACRO_ARMA);

function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
}

export function normalizarEmpunhadurasMacroArma(
  valor: unknown,
): EmpunhaduraMacroArma[] {
  const bruto =
    typeof valor === 'string'
      ? (() => {
          try {
            return JSON.parse(valor) as unknown;
          } catch {
            return [valor];
          }
        })()
      : valor;
  const lista = Array.isArray(bruto) ? bruto : [];
  return Array.from(
    new Set(
      lista
        .filter((item): item is string => typeof item === 'string')
        .map(normalizarTexto)
        .filter((item): item is EmpunhaduraMacroArma =>
          EMPUNHADURAS_MACRO_ARMA_SET.has(item),
        ),
    ),
  );
}

export function resolverPericiaMacroArma(
  tipoArma: string | null | undefined,
): 'LUTA' | 'PONTARIA' | null {
  if (tipoArma === 'CORPO_A_CORPO') return 'LUTA';
  if (tipoArma === 'A_DISTANCIA') return 'PONTARIA';
  return null;
}

export function resolverAtributoPadraoMacroArma(
  tipoArma: TipoArmaMacro,
): AtributoMacroArma {
  return tipoArma === 'A_DISTANCIA' ? 'AGI' : 'FOR';
}

export function resolverAjustesAutomaticosMacroArma(
  condicoes: CondicaoMacroAtiva[],
  tipoArma: TipoArmaMacro,
  atributoBase: AtributoMacroArma,
): AjusteAutomaticoMacroArma[] {
  const nomes = new Set(
    condicoes.map((condicao) => normalizarTexto(condicao.nome)),
  );
  const ajustes: AjusteAutomaticoMacroArma[] = [];

  if (nomes.has('APAVORADO')) {
    ajustes.push({
      condicao: 'Apavorado',
      dados: -2,
      motivo: 'Penalidade em testes de ataque.',
    });
  } else if (nomes.has('ABALADO')) {
    ajustes.push({
      condicao: 'Abalado',
      dados: -1,
      motivo: 'Penalidade em testes.',
    });
  }
  if (nomes.has('OFUSCADO')) {
    ajustes.push({
      condicao: 'Ofuscado',
      dados: -1,
      motivo: 'Penalidade em testes de ataque.',
    });
  }
  if (tipoArma === 'CORPO_A_CORPO' && nomes.has('CAIDO')) {
    ajustes.push({
      condicao: 'Caído',
      dados: -2,
      motivo: 'Penalidade em ataques corpo a corpo.',
    });
  }
  if (nomes.has('CEGO') && (atributoBase === 'FOR' || atributoBase === 'AGI')) {
    ajustes.push({
      condicao: 'Cego',
      dados: -2,
      motivo: 'Penalidade em testes dependentes de atributo físico.',
    });
  }
  if (atributoBase === 'FOR' || atributoBase === 'AGI') {
    if (nomes.has('FRACO')) {
      ajustes.push({
        condicao: 'Fraco',
        dados: -1,
        motivo: 'Penalidade em testes de atributo físico.',
      });
    } else if (nomes.has('FATIGADO')) {
      ajustes.push({
        condicao: 'Fatigado',
        dados: -1,
        motivo: 'A condição aplica o efeito de Fraco.',
      });
    }
  }

  return ajustes;
}
