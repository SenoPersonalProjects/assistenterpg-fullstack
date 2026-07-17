import type { MacroPersonalizadaTipo, Prisma } from '@prisma/client';
import {
  formatarExpressaoDiceServidor,
  LIMITES_DICE_SESSAO,
  parseDiceInputServidor,
  type DiceExpressionServidor,
} from '../sessao/sessao-dice-autoritativo';

export const MACRO_PERSONAGEM_CONFIG_VERSAO = 1;
export const MACRO_PERSONAGEM_LIMITE_ATIVAS = 50;
export const MACRO_PERSONAGEM_NOME_MAX = 80;
export const MACRO_PERSONAGEM_DESCRICAO_MAX = 500;
export const MACRO_PERSONAGEM_FORMULA_DANO_MAX = 120;
export const MACRO_PERSONAGEM_FORMULA_LIVRE_MAX = 200;
export const MACRO_PERSONAGEM_FLAT_ATAQUE_MAX = 100;
export const MACRO_PERSONAGEM_DADOS_ATAQUE_MAX = 10;
export const MACRO_PERSONAGEM_MODIFICADOR_DANO_MAX = 1000;
export const MACRO_PERSONAGEM_CRITICO_MIN = 2;
export const MACRO_PERSONAGEM_CRITICO_MAX = 5;
export const MACRO_PERSONAGEM_DT_MAX = 100000;
export const MACRO_PERSONAGEM_TERMOS_DANO_MAX = 4;
export const MACRO_PERSONAGEM_EXPRESSOES_LIVRES_MAX = 4;

export const ATRIBUTOS_MACRO_PERSONAGEM = [
  'AGI',
  'FOR',
  'INT',
  'PRE',
  'VIG',
] as const;
export type AtributoMacroPersonagem =
  (typeof ATRIBUTOS_MACRO_PERSONAGEM)[number];

export const CATEGORIAS_ATAQUE_MACRO_PERSONAGEM = [
  'CORPO_A_CORPO',
  'A_DISTANCIA',
  'OUTRO',
] as const;
export type CategoriaAtaqueMacroPersonagem =
  (typeof CATEGORIAS_ATAQUE_MACRO_PERSONAGEM)[number];

export type MacroAtaqueConfigV1 = {
  periciaCodigo: string;
  atributoBase?: AtributoMacroPersonagem;
  categoriaAtaque: CategoriaAtaqueMacroPersonagem;
  ajusteFlatPadrao: number;
  ajusteDadosPadrao: number;
  dtPadrao?: number;
};

export type MacroDanoConfigV1 = {
  formulaBase: string;
  tipoDano?: string;
  ajusteFlatPadrao: number;
  criticoMultiplicador?: number;
};

export type MacroFormulaLivreConfigV1 = {
  formula: string;
};

export type MacroPersonalizadaConfigV1 =
  | MacroAtaqueConfigV1
  | MacroDanoConfigV1
  | MacroFormulaLivreConfigV1;

export class MacroPersonalizadaConfigError extends Error {}

function registro(valor: unknown): Record<string, unknown> {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) {
    throw new MacroPersonalizadaConfigError('config deve ser um objeto.');
  }
  return valor as Record<string, unknown>;
}

function validarChaves(
  config: Record<string, unknown>,
  permitidas: readonly string[],
): void {
  const extras = Object.keys(config).filter(
    (chave) => !permitidas.includes(chave),
  );
  if (extras.length > 0) {
    throw new MacroPersonalizadaConfigError(
      `Campos de config nao permitidos: ${extras.join(', ')}.`,
    );
  }
}

function inteiro(
  valor: unknown,
  campo: string,
  minimo: number,
  maximo: number,
  opcional = false,
): number | undefined {
  if ((valor === undefined || valor === null) && opcional) return undefined;
  if (
    !Number.isInteger(valor) ||
    Number(valor) < minimo ||
    Number(valor) > maximo
  ) {
    throw new MacroPersonalizadaConfigError(
      `${campo} deve ser inteiro entre ${minimo} e ${maximo}.`,
    );
  }
  return Number(valor);
}

function texto(
  valor: unknown,
  campo: string,
  maximo: number,
  opcional = false,
): string | undefined {
  if ((valor === undefined || valor === null || valor === '') && opcional) {
    return undefined;
  }
  if (typeof valor !== 'string') {
    throw new MacroPersonalizadaConfigError(`${campo} deve ser texto.`);
  }
  const normalizado = valor.trim();
  if (!normalizado || normalizado.length > maximo) {
    throw new MacroPersonalizadaConfigError(
      `${campo} deve ter entre 1 e ${maximo} caracteres.`,
    );
  }
  return normalizado;
}

function termosExpressao(expressao: DiceExpressionServidor) {
  return expressao.termos?.length
    ? expressao.termos
    : [
        {
          quantidade: expressao.quantidade,
          faces: expressao.faces,
          aplicarModificadorPorDado: expressao.aplicarModificadorPorDado,
          keepMode: expressao.keepMode,
        },
      ];
}

export function obterModificadorAssinadoMacro(
  expressao: DiceExpressionServidor,
): number {
  return expressao.operador === '-'
    ? -expressao.modificador
    : expressao.modificador;
}

export function normalizarFormulaDanoMacro(formula: unknown): {
  formula: string;
  expressao: DiceExpressionServidor;
} {
  const textoFormula = texto(
    formula,
    'formulaBase',
    MACRO_PERSONAGEM_FORMULA_DANO_MAX,
  )!;
  const parse = parseDiceInputServidor(textoFormula);
  if (parse.erro || !parse.expressions || parse.expressions.length !== 1) {
    throw new MacroPersonalizadaConfigError(
      parse.erro ?? 'A formula de dano deve conter uma expressao.',
    );
  }
  const expressao = parse.expressions[0];
  const termos = termosExpressao(expressao);
  if (
    termos.length > MACRO_PERSONAGEM_TERMOS_DANO_MAX ||
    termos.some((termo) => termo.aplicarModificadorPorDado)
  ) {
    throw new MacroPersonalizadaConfigError(
      `Dano aceita ate ${MACRO_PERSONAGEM_TERMOS_DANO_MAX} termos sem #d.`,
    );
  }
  if (
    expressao.operador !== undefined &&
    !['+', '-'].includes(expressao.operador)
  ) {
    throw new MacroPersonalizadaConfigError(
      'Dano aceita somente dados somados e modificador flat.',
    );
  }
  if (
    Math.abs(obterModificadorAssinadoMacro(expressao)) >
    MACRO_PERSONAGEM_MODIFICADOR_DANO_MAX
  ) {
    throw new MacroPersonalizadaConfigError(
      `O modificador da formula deve estar entre -${MACRO_PERSONAGEM_MODIFICADOR_DANO_MAX} e ${MACRO_PERSONAGEM_MODIFICADOR_DANO_MAX}.`,
    );
  }
  return { formula: formatarExpressaoDiceServidor(expressao), expressao };
}

export function normalizarFormulaLivreMacro(formula: unknown): string {
  const textoFormula = texto(
    formula,
    'formula',
    MACRO_PERSONAGEM_FORMULA_LIVRE_MAX,
  )!;
  const parse = parseDiceInputServidor(textoFormula);
  if (parse.erro || !parse.expressions) {
    throw new MacroPersonalizadaConfigError(parse.erro ?? 'Formula invalida.');
  }
  if (parse.expressions.length > MACRO_PERSONAGEM_EXPRESSOES_LIVRES_MAX) {
    throw new MacroPersonalizadaConfigError(
      `Formula livre aceita ate ${MACRO_PERSONAGEM_EXPRESSOES_LIVRES_MAX} expressoes.`,
    );
  }
  return parse.expressions
    .map((expressao) => {
      const base = formatarExpressaoDiceServidor(expressao);
      return expressao.label ? `${expressao.label}:${base}` : base;
    })
    .join(';');
}

export function normalizarConfigMacroPersonalizada(
  tipo: MacroPersonalizadaTipo,
  valor: unknown,
): MacroPersonalizadaConfigV1 {
  const config = registro(valor);
  if (tipo === 'ATAQUE_PERICIA') {
    validarChaves(config, [
      'periciaCodigo',
      'atributoBase',
      'categoriaAtaque',
      'ajusteFlatPadrao',
      'ajusteDadosPadrao',
      'dtPadrao',
    ]);
    const periciaCodigo = texto(
      config.periciaCodigo,
      'periciaCodigo',
      80,
    )!.toUpperCase();
    const atributoBase = config.atributoBase;
    if (
      atributoBase !== undefined &&
      !ATRIBUTOS_MACRO_PERSONAGEM.includes(
        atributoBase as AtributoMacroPersonagem,
      )
    ) {
      throw new MacroPersonalizadaConfigError('atributoBase invalido.');
    }
    if (
      !CATEGORIAS_ATAQUE_MACRO_PERSONAGEM.includes(
        config.categoriaAtaque as CategoriaAtaqueMacroPersonagem,
      )
    ) {
      throw new MacroPersonalizadaConfigError('categoriaAtaque invalida.');
    }
    const dtPadrao = inteiro(
      config.dtPadrao,
      'dtPadrao',
      0,
      MACRO_PERSONAGEM_DT_MAX,
      true,
    );
    return {
      periciaCodigo,
      ...(atributoBase
        ? { atributoBase: atributoBase as AtributoMacroPersonagem }
        : {}),
      categoriaAtaque: config.categoriaAtaque as CategoriaAtaqueMacroPersonagem,
      ajusteFlatPadrao: inteiro(
        config.ajusteFlatPadrao,
        'ajusteFlatPadrao',
        -MACRO_PERSONAGEM_FLAT_ATAQUE_MAX,
        MACRO_PERSONAGEM_FLAT_ATAQUE_MAX,
      )!,
      ajusteDadosPadrao: inteiro(
        config.ajusteDadosPadrao,
        'ajusteDadosPadrao',
        -MACRO_PERSONAGEM_DADOS_ATAQUE_MAX,
        MACRO_PERSONAGEM_DADOS_ATAQUE_MAX,
      )!,
      ...(dtPadrao !== undefined ? { dtPadrao } : {}),
    };
  }

  if (tipo === 'DANO_FORMULA') {
    validarChaves(config, [
      'formulaBase',
      'tipoDano',
      'ajusteFlatPadrao',
      'criticoMultiplicador',
    ]);
    const formula = normalizarFormulaDanoMacro(config.formulaBase);
    const ajusteFlatPadrao = inteiro(
      config.ajusteFlatPadrao,
      'ajusteFlatPadrao',
      -MACRO_PERSONAGEM_FLAT_ATAQUE_MAX,
      MACRO_PERSONAGEM_FLAT_ATAQUE_MAX,
    )!;
    if (
      Math.abs(
        obterModificadorAssinadoMacro(formula.expressao) + ajusteFlatPadrao,
      ) > MACRO_PERSONAGEM_MODIFICADOR_DANO_MAX
    ) {
      throw new MacroPersonalizadaConfigError(
        `Formula e flat padrao excedem ${MACRO_PERSONAGEM_MODIFICADOR_DANO_MAX}.`,
      );
    }
    const tipoDano = texto(config.tipoDano, 'tipoDano', 40, true);
    const criticoMultiplicador = inteiro(
      config.criticoMultiplicador,
      'criticoMultiplicador',
      MACRO_PERSONAGEM_CRITICO_MIN,
      MACRO_PERSONAGEM_CRITICO_MAX,
      true,
    );
    return {
      formulaBase: formula.formula,
      ...(tipoDano ? { tipoDano } : {}),
      ajusteFlatPadrao,
      ...(criticoMultiplicador !== undefined ? { criticoMultiplicador } : {}),
    };
  }

  if (tipo === 'FORMULA_LIVRE') {
    validarChaves(config, ['formula']);
    return { formula: normalizarFormulaLivreMacro(config.formula) };
  }

  throw new MacroPersonalizadaConfigError('Tipo de macro nao suportado.');
}

export function configMacroParaPrisma(
  config: MacroPersonalizadaConfigV1,
): Prisma.InputJsonValue {
  return config as Prisma.InputJsonValue;
}

export function contarDadosExpressaoMacro(
  expressao: DiceExpressionServidor,
): number {
  return termosExpressao(expressao).reduce(
    (total, termo) => total + termo.quantidade,
    0,
  );
}

export function validarTetoDadosMacro(quantidade: number): void {
  if (quantidade > LIMITES_DICE_SESSAO.dados) {
    throw new MacroPersonalizadaConfigError(
      `A rolagem excede o limite de ${LIMITES_DICE_SESSAO.dados} dados.`,
    );
  }
}
