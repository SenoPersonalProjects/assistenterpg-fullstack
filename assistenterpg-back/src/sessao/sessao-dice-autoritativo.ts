import { randomInt } from 'crypto';

export const LIMITES_DICE_SESSAO = {
  mensagem: 800,
  dados: 30,
  faces: 1000,
  modificador: 10000,
  expressoes: 8,
  label: 24,
} as const;

export type DiceOperadorServidor = '+' | '-' | '*' | '/';
export type DiceKeepModeServidor = 'SUM' | 'HIGHEST' | 'LOWEST';

export type DiceTermExpressionServidor = {
  quantidade: number;
  faces: number;
  aplicarModificadorPorDado: boolean;
  keepMode?: DiceKeepModeServidor;
};

export type DiceRollTermServidor = DiceTermExpressionServidor & {
  rolagens: number[];
};

export type DiceBonusDadoServidor = {
  origem: string;
  label: string;
  quantidade: number;
  faces: number;
  rolagens: number[];
  efeitoPendenteId?: string;
};

export type DiceExpressionServidor = {
  quantidade: number;
  faces: number;
  modificador: number;
  operador?: DiceOperadorServidor;
  keepMode?: DiceKeepModeServidor;
  aplicarModificadorPorDado: boolean;
  label?: string;
  termos?: DiceTermExpressionServidor[];
};

export type DiceRollPayloadServidor = Omit<DiceExpressionServidor, 'termos'> & {
  rolagens: number[];
  bonusDados?: DiceBonusDadoServidor[];
  termos?: DiceRollTermServidor[];
};

export type DiceResultadoTermoServidor = {
  subtotal: number;
  indiceEscolhido: number | null;
};

export type DiceResultadoServidor = {
  totalBase: number;
  bonusTotal: number;
  total: number;
  termos: DiceResultadoTermoServidor[];
};

export type DiceParseGroupServidor = {
  expressions: DiceExpressionServidor[] | null;
  erro: string | null;
};

export type GeradorDadoServidor = (faces: number) => number;

const DICE_TERMO_REGEX = /^(\d+)?(#?)d(\d+)/i;
const DICE_MARKER_V3_PREFIX = '[[dice:v3|';
const DICE_MARKER_V4_PREFIX = '[[dice:v4|';
const DICE_MARKER_V5_PREFIX = '[[dice:v5|';

function normalizarEntradaDice(input: string): string {
  return input
    .trim()
    .replace(/\s*([:=])\s*/g, '$1')
    .replace(/\s*([+\-*/])\s*(?=(?:\d+)?#?d|\d)/gi, '$1');
}

function expressaoPossuiGruposSomados(compactado: string): boolean {
  return /d\d+\+(?:\d+)?#?d/i.test(compactado);
}

function validarTermo(quantidade: number, faces: number): string | null {
  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    return 'Quantidade de dados deve ser positiva.';
  }
  if (!Number.isInteger(faces) || faces <= 0) {
    return 'Numero de faces deve ser positivo.';
  }
  if (faces > LIMITES_DICE_SESSAO.faces) {
    return `Limite de ${LIMITES_DICE_SESSAO.faces} faces por dado.`;
  }
  return null;
}

function validarModificador(
  operador: DiceOperadorServidor,
  modificador: number,
): string | null {
  if (
    !Number.isInteger(modificador) ||
    Math.abs(modificador) > LIMITES_DICE_SESSAO.modificador
  ) {
    return `Modificador deve estar entre -${LIMITES_DICE_SESSAO.modificador} e ${LIMITES_DICE_SESSAO.modificador}.`;
  }
  if (operador === '/' && modificador === 0) {
    return 'Divisor nao pode ser zero.';
  }
  return null;
}

function parseDiceExpressionComposta(compactado: string): {
  expression: DiceExpressionServidor | null;
  erro: string | null;
} {
  const termos: DiceTermExpressionServidor[] = [];
  let posicao = 0;
  let operador: DiceOperadorServidor = '+';
  let modificador = 0;

  while (posicao < compactado.length) {
    const trecho = compactado.slice(posicao);
    const match = trecho.match(DICE_TERMO_REGEX);
    if (!match) {
      return {
        expression: null,
        erro: 'Sintaxe invalida. Use XdY, X#dY ou grupos somados (ex.: 4#d20+2d6).',
      };
    }

    const quantidade = match[1] ? Number(match[1]) : 1;
    const aplicarModificadorPorDado = match[2] === '#';
    const faces = Number(match[3]);
    const erroTermo = validarTermo(quantidade, faces);
    if (erroTermo) return { expression: null, erro: erroTermo };

    termos.push({
      quantidade,
      faces,
      aplicarModificadorPorDado,
      keepMode: aplicarModificadorPorDado ? 'HIGHEST' : 'SUM',
    });
    posicao += match[0].length;
    if (posicao >= compactado.length) break;

    const proximo = compactado[posicao] as DiceOperadorServidor | undefined;
    if (
      proximo === '+' &&
      DICE_TERMO_REGEX.test(compactado.slice(posicao + 1))
    ) {
      posicao += 1;
      continue;
    }

    const matchModificador = compactado
      .slice(posicao)
      .match(/^([+\-*/])(\d+)$/);
    if (!matchModificador) {
      return {
        expression: null,
        erro:
          proximo === '-' &&
          DICE_TERMO_REGEX.test(compactado.slice(posicao + 1))
            ? 'Somente + e suportado entre grupos de dados nesta rolagem.'
            : 'Sintaxe invalida. Use XdY, X#dY ou grupos somados (ex.: 4#d20+2d6).',
      };
    }
    operador = matchModificador[1] as DiceOperadorServidor;
    modificador = Number(matchModificador[2]);
    posicao = compactado.length;
  }

  const totalDados = termos.reduce(
    (total, termo) => total + termo.quantidade,
    0,
  );
  if (totalDados > LIMITES_DICE_SESSAO.dados) {
    return {
      expression: null,
      erro: `Limite de ${LIMITES_DICE_SESSAO.dados} dados por rolagem.`,
    };
  }
  const erroModificador = validarModificador(operador, modificador);
  if (erroModificador) return { expression: null, erro: erroModificador };

  const primeiroTermo = termos[0];
  if (!primeiroTermo || termos.length < 2) {
    return {
      expression: null,
      erro: 'Sintaxe invalida. Use XdY, X#dY ou grupos somados (ex.: 4#d20+2d6).',
    };
  }

  return {
    expression: {
      quantidade: primeiroTermo.quantidade,
      faces: primeiroTermo.faces,
      modificador,
      operador,
      aplicarModificadorPorDado: primeiroTermo.aplicarModificadorPorDado,
      keepMode: primeiroTermo.keepMode,
      termos,
    },
    erro: null,
  };
}

function parseDiceExpression(input: string): {
  expression: DiceExpressionServidor | null;
  erro: string | null;
} {
  const compactado = input.trim().replace(/\s+/g, '');
  if (!compactado) {
    return { expression: null, erro: 'Informe uma rolagem para continuar.' };
  }
  if (expressaoPossuiGruposSomados(compactado)) {
    return parseDiceExpressionComposta(compactado);
  }

  const match = compactado.match(/^(\d+)?(#?)d(\d+)([+\-*/]\d+)?$/i);
  if (!match) {
    return {
      expression: null,
      erro: 'Sintaxe invalida. Use XdY ou X#dY (ex.: 2d6+3, 2d6*2).',
    };
  }

  const quantidade = match[1] ? Number(match[1]) : 1;
  const aplicarModificadorPorDado = match[2] === '#';
  const faces = Number(match[3]);
  const operador = (match[4]?.[0] as DiceOperadorServidor | undefined) ?? '+';
  const modificador = match[4] ? Number(match[4].slice(1)) : 0;
  const erroTermo = validarTermo(quantidade, faces);
  if (erroTermo) return { expression: null, erro: erroTermo };
  if (quantidade > LIMITES_DICE_SESSAO.dados) {
    return {
      expression: null,
      erro: `Limite de ${LIMITES_DICE_SESSAO.dados} dados por rolagem.`,
    };
  }
  const erroModificador = validarModificador(operador, modificador);
  if (erroModificador) return { expression: null, erro: erroModificador };

  return {
    expression: {
      quantidade,
      faces,
      modificador,
      operador,
      aplicarModificadorPorDado,
    },
    erro: null,
  };
}

export function parseDiceInputServidor(input: string): DiceParseGroupServidor {
  const entrada = normalizarEntradaDice(input);
  if (!entrada) {
    return { expressions: null, erro: 'Informe uma rolagem para continuar.' };
  }

  const partes = entrada
    .split(/[\s,;|]+/)
    .map((parte) => parte.trim())
    .filter(Boolean);
  if (partes.length > LIMITES_DICE_SESSAO.expressoes) {
    return {
      expressions: null,
      erro: `Limite de ${LIMITES_DICE_SESSAO.expressoes} rolagens por mensagem.`,
    };
  }

  const expressions: DiceExpressionServidor[] = [];
  for (const parte of partes) {
    let label: string | null = null;
    let expressaoRaw = parte;
    const matchLabel = parte.match(/^([^:=]+)[:=](.+)$/);
    if (matchLabel) {
      label = matchLabel[1]?.trim() ?? null;
      expressaoRaw = matchLabel[2]?.trim() ?? '';
      if (!label) {
        return {
          expressions: null,
          erro: `Erro em "${parte}": informe um label antes de ":" ou "=".`,
        };
      }
      if (label.length > LIMITES_DICE_SESSAO.label) {
        return {
          expressions: null,
          erro: `Label muito longo (max ${LIMITES_DICE_SESSAO.label} caracteres).`,
        };
      }
    }

    const resultado = parseDiceExpression(expressaoRaw);
    if (!resultado.expression || resultado.erro) {
      return {
        expressions: null,
        erro: resultado.erro
          ? `Erro em "${parte}": ${resultado.erro}`
          : `Erro em "${parte}".`,
      };
    }
    expressions.push({
      ...resultado.expression,
      label: label ?? undefined,
    });
  }

  return expressions.length > 0
    ? { expressions, erro: null }
    : { expressions: null, erro: 'Informe uma rolagem para continuar.' };
}

export function parseDiceFontePersistidaServidor(
  input: string,
): DiceExpressionServidor | null {
  const texto = input.trim();
  if (!texto) return null;

  const termoDado = '(?:\\d+)?#?d\\d+';
  const gruposDados = `${termoDado}(?:\\s*\\+\\s*${termoDado})*`;
  const comFlatInicial = new RegExp(`(\\d+)\\s*\\+\\s*(${gruposDados})`, 'i');
  const comDadoInicial = new RegExp(
    `(${gruposDados}(?:\\s*[+\\-*/]\\s*\\d+)?)`,
    'i',
  );
  const matchFlat = texto.match(comFlatInicial);
  const match = matchFlat ?? texto.match(comDadoInicial);
  if (!match?.[0]) return null;

  const prefixo = texto.slice(0, match.index ?? 0);
  const restante = texto.slice((match.index ?? 0) + match[0].length);
  const possuiOutroDado = new RegExp(termoDado, 'i');
  if (possuiOutroDado.test(prefixo) || possuiOutroDado.test(restante)) {
    return null;
  }

  const expressaoNormalizada = matchFlat
    ? `${matchFlat[2]?.replace(/\s+/g, '')}+${matchFlat[1]}`
    : match[1]?.replace(/\s+/g, '');
  if (!expressaoNormalizada) return null;

  const resultado = parseDiceInputServidor(expressaoNormalizada);
  if (
    resultado.erro ||
    !resultado.expressions ||
    resultado.expressions.length !== 1
  ) {
    return null;
  }
  return resultado.expressions[0] ?? null;
}

function obterTermosExpression(
  expression: DiceExpressionServidor,
): DiceTermExpressionServidor[] {
  return expression.termos?.length
    ? expression.termos
    : [
        {
          quantidade: expression.quantidade,
          faces: expression.faces,
          aplicarModificadorPorDado: expression.aplicarModificadorPorDado,
          keepMode: expression.keepMode,
        },
      ];
}

export function rolarDadosServidor(
  expression: DiceExpressionServidor,
  gerarDado: GeradorDadoServidor = (faces) => randomInt(1, faces + 1),
): DiceRollPayloadServidor {
  const termos = obterTermosExpression(expression).map((termo) => ({
    ...termo,
    rolagens: Array.from({ length: termo.quantidade }, () => {
      const valor = gerarDado(termo.faces);
      if (!Number.isInteger(valor) || valor < 1 || valor > termo.faces) {
        throw new Error('Gerador de dados retornou um valor invalido.');
      }
      return valor;
    }),
  }));
  const primeiroTermo = termos[0];
  return {
    ...expression,
    rolagens: primeiroTermo?.rolagens ?? [],
    termos: expression.termos?.length ? termos : undefined,
  };
}

export function expressaoDiceContemD20(
  expressions: DiceExpressionServidor[],
): boolean {
  return expressions.some((expression) =>
    obterTermosExpression(expression).some((termo) => termo.faces === 20),
  );
}

function calcularSubtotalTermo(
  termo: DiceRollTermServidor,
): DiceResultadoTermoServidor {
  const keepMode = termo.aplicarModificadorPorDado
    ? termo.keepMode === 'LOWEST'
      ? 'LOWEST'
      : 'HIGHEST'
    : (termo.keepMode ?? 'SUM');
  if (keepMode === 'SUM') {
    return {
      subtotal: termo.rolagens.reduce((total, valor) => total + valor, 0),
      indiceEscolhido: null,
    };
  }

  let indiceEscolhido = 0;
  for (let indice = 1; indice < termo.rolagens.length; indice += 1) {
    const atual = termo.rolagens[indice] ?? 0;
    const escolhido = termo.rolagens[indiceEscolhido] ?? 0;
    if (
      (keepMode === 'HIGHEST' && atual > escolhido) ||
      (keepMode === 'LOWEST' && atual < escolhido)
    ) {
      indiceEscolhido = indice;
    }
  }
  return {
    subtotal: termo.rolagens[indiceEscolhido] ?? 0,
    indiceEscolhido,
  };
}

export function calcularResultadoDiceServidor(
  payload: DiceRollPayloadServidor,
): DiceResultadoServidor {
  const termos = payload.termos?.length
    ? payload.termos
    : [
        {
          quantidade: payload.quantidade,
          faces: payload.faces,
          aplicarModificadorPorDado: payload.aplicarModificadorPorDado,
          keepMode: payload.keepMode,
          rolagens: payload.rolagens,
        },
      ];
  const resultadosTermos = termos.map(calcularSubtotalTermo);
  const totalBase = resultadosTermos.reduce(
    (total, termo) => total + termo.subtotal,
    0,
  );
  const bonusTotal = (payload.bonusDados ?? []).reduce(
    (total, bonus) =>
      total + bonus.rolagens.reduce((subtotal, valor) => subtotal + valor, 0),
    0,
  );
  const operador = payload.operador ?? '+';
  const totalSemBonus =
    operador === '-'
      ? totalBase - payload.modificador
      : operador === '*'
        ? totalBase * payload.modificador
        : operador === '/'
          ? Math.trunc(totalBase / payload.modificador)
          : totalBase + payload.modificador;
  return {
    totalBase,
    bonusTotal,
    total: totalSemBonus + bonusTotal,
    termos: resultadosTermos,
  };
}

function formatarTermoDice(termo: DiceTermExpressionServidor): string {
  return `${termo.quantidade}${termo.aplicarModificadorPorDado ? '#' : ''}d${termo.faces}`;
}

export function formatarExpressaoDiceServidor(
  expression: DiceExpressionServidor,
): string {
  const operador = expression.operador ?? '+';
  let modificadorTexto = '';
  if (expression.modificador !== 0 || operador !== '+') {
    modificadorTexto =
      operador === '+'
        ? `+${expression.modificador}`
        : `${operador}${expression.modificador}`;
  }
  const base = expression.termos?.length
    ? expression.termos.map(formatarTermoDice).join('+')
    : formatarTermoDice(expression);
  return `${base}${modificadorTexto}`;
}

function encodeRolls(rolagens: number[]): string {
  return rolagens.map((valor) => valor.toString(36)).join('.');
}

function encodeLabel(label: string): string {
  return Buffer.from(label.trim(), 'utf8').toString('base64');
}

function encodePayloadV3(payload: DiceRollPayloadServidor): string {
  const operador = payload.operador ?? '+';
  const base = `${payload.quantidade.toString(36)}|${payload.faces.toString(36)}|${operador}|${payload.modificador.toString(36)}|${payload.aplicarModificadorPorDado ? 1 : 0}|${encodeRolls(payload.rolagens)}`;
  return payload.label ? `${base}|${encodeLabel(payload.label)}` : base;
}

function encodePayloadV4(payload: DiceRollPayloadServidor): string {
  const operador = payload.operador ?? '+';
  const keepMode = payload.keepMode ?? 'SUM';
  const base = `${payload.quantidade.toString(36)}|${payload.faces.toString(36)}|${operador}|${payload.modificador.toString(36)}|${payload.aplicarModificadorPorDado ? 1 : 0}|${encodeRolls(payload.rolagens)}|${keepMode}`;
  return payload.label ? `${base}|${encodeLabel(payload.label)}` : base;
}

function encodePayloadV5(payloads: DiceRollPayloadServidor[]): string {
  return Buffer.from(JSON.stringify(payloads), 'utf8').toString('base64');
}

export function construirMensagemDiceServidor(
  payloads: DiceRollPayloadServidor[],
): { mensagem: string; expressions: string[] } {
  const expressions = payloads.map((payload) => {
    const expressao = formatarExpressaoDiceServidor(payload);
    return payload.label ? `${payload.label}: ${expressao}` : expressao;
  });
  const usaV5 = payloads.some(
    (payload) =>
      (payload.termos?.length ?? 0) > 1 ||
      (payload.bonusDados?.length ?? 0) > 0,
  );
  const usaV4 = payloads.some(
    (payload) => payload.keepMode && payload.keepMode !== 'SUM',
  );
  const serializado = usaV5
    ? encodePayloadV5(payloads)
    : payloads
        .map((payload) =>
          usaV4 ? encodePayloadV4(payload) : encodePayloadV3(payload),
        )
        .join('~');
  const marcador = usaV5
    ? `${DICE_MARKER_V5_PREFIX}${serializado}]]`
    : usaV4
      ? `${DICE_MARKER_V4_PREFIX}${serializado}]]`
      : `${DICE_MARKER_V3_PREFIX}${serializado}]]`;
  return {
    mensagem: `${expressions.join(', ')} ${marcador}`.trim(),
    expressions,
  };
}
