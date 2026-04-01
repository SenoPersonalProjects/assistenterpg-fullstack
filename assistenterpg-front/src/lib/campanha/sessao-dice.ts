const DICE_MARKER_REGEX = /\[\[dice:v1\|([^\]]+)\]\]/;
const DICE_MARKER_V2_REGEX = /\[\[dice:v2\|([^\]]+)\]\]/;
const DICE_MARKER_V3_PREFIX = '[[dice:v3|';
const DICE_MARKER_V3_REGEX = /\[\[dice:v3\|([^\]]+)\]\]/;
const DICE_MARKER_V4_PREFIX = '[[dice:v4|';
const DICE_MARKER_V4_REGEX = /\[\[dice:v4\|([^\]]+)\]\]/;

const LIMITE_MENSAGEM_CHAT_DICE = 800;
const LIMITE_DADOS = 30;
const LIMITE_FACES = 1000;
const LIMITE_MODIFICADOR = 10000;
const LIMITE_EXPRESSOES = 8;
const LIMITE_LABEL = 24;

export type DiceOperador = '+' | '-' | '*' | '/';
export type DiceKeepMode = 'SUM' | 'HIGHEST' | 'LOWEST';

export type DiceExpression = {
  quantidade: number;
  faces: number;
  modificador: number;
  operador?: '+' | '-' | '*' | '/';
  keepMode?: DiceKeepMode;
  aplicarModificadorPorDado: boolean;
  label?: string;
};

export type DiceRollPayload = DiceExpression & {
  rolagens: number[];
};

export type DiceMessage = {
  payload: DiceRollPayload;
  expression: string;
  textoSemMarcador: string;
};

export type DiceMessageGroup = {
  payloads: DiceRollPayload[];
  textoSemMarcador: string;
};

export type DiceResultado = {
  keepMode: DiceKeepMode;
  total: number;
  totalBase: number;
  rolagensBase: number[];
  rolagensFinais: number[];
  indiceEscolhido: number | null;
};

export type DiceParseResult = {
  expression: DiceExpression | null;
  erro: string | null;
};

export type DiceParseGroupResult = {
  expressions: DiceExpression[] | null;
  erro: string | null;
};

type NodeBufferLike = {
  from: (input: string, encoding: string) => { toString: (encoding: string) => string };
};

function getNodeBuffer(): NodeBufferLike | undefined {
  if (typeof globalThis === 'undefined') return undefined;
  const maybeBuffer = (globalThis as { Buffer?: NodeBufferLike }).Buffer;
  return maybeBuffer;
}

function encodeLabel(label: string): string {
  const texto = label.trim();
  if (!texto) return '';
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    return window.btoa(unescape(encodeURIComponent(texto)));
  }
  const buffer = getNodeBuffer();
  if (buffer?.from) {
    return buffer.from(texto, 'utf8').toString('base64');
  }
  return texto;
}

function decodeLabel(label: string): string | null {
  if (!label) return null;
  try {
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      return decodeURIComponent(escape(window.atob(label)));
    }
    const buffer = getNodeBuffer();
    if (buffer?.from) {
      return buffer.from(label, 'base64').toString('utf8');
    }
  } catch {
    return null;
  }
  return null;
}

function normalizarOperadorModificador(
  operador: DiceOperador | undefined,
  modificador: number,
): { operador: DiceOperador; modificador: number } {
  if (!operador && modificador < 0) {
    return { operador: '-', modificador: Math.abs(modificador) };
  }
  return { operador: (operador ?? '+') as DiceOperador, modificador };
}

function normalizarKeepMode(keepMode?: DiceKeepMode): DiceKeepMode {
  if (!keepMode) return 'SUM';
  if (keepMode === 'HIGHEST' || keepMode === 'LOWEST') return keepMode;
  return 'SUM';
}


function gerarNumeroSeguro(maximo: number): number {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const limite = Math.floor(0xffffffff / maximo) * maximo;
    const buffer = new Uint32Array(1);
    let valor = 0;
    do {
      window.crypto.getRandomValues(buffer);
      valor = buffer[0] ?? 0;
    } while (valor >= limite);
    return valor % maximo;
  }

  return Math.floor(Math.random() * maximo);
}

function rolarDado(faces: number): number {
  return gerarNumeroSeguro(faces) + 1;
}

function encodeRolls(rolagens: number[]): string {
  return rolagens.map((valor) => valor.toString(36)).join('.');
}

function decodeRolls(valor: string): number[] | null {
  if (!valor) return null;
  const partes = valor.split('.').filter(Boolean);
  if (partes.length === 0) return null;
  const rolagens = partes.map((parte) => Number.parseInt(parte, 36));
  if (rolagens.some((valor) => !Number.isFinite(valor) || valor <= 0)) {
    return null;
  }
  return rolagens.map((valor) => Math.trunc(valor));
}

export function parseDiceExpression(input: string): DiceParseResult {
  const compactado = input.trim().replace(/\s+/g, '');
  if (!compactado) {
    return { expression: null, erro: 'Informe uma rolagem para continuar.' };
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
  const operador = (match[4]?.[0] as DiceOperador | undefined) ?? '+';
  const modificador = match[4] ? Number(match[4].slice(1)) : 0;

  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    return { expression: null, erro: 'Quantidade de dados deve ser positiva.' };
  }
  if (!Number.isInteger(faces) || faces <= 0) {
    return { expression: null, erro: 'Numero de faces deve ser positivo.' };
  }
  if (quantidade > LIMITE_DADOS) {
    return {
      expression: null,
      erro: `Limite de ${LIMITE_DADOS} dados por rolagem.`,
    };
  }
  if (faces > LIMITE_FACES) {
    return {
      expression: null,
      erro: `Limite de ${LIMITE_FACES} faces por dado.`,
    };
  }
  if (!Number.isInteger(modificador) || Math.abs(modificador) > LIMITE_MODIFICADOR) {
    return {
      expression: null,
      erro: `Modificador deve estar entre -${LIMITE_MODIFICADOR} e ${LIMITE_MODIFICADOR}.`,
    };
  }
  if ((operador === '*' || operador === '/') && modificador < 0) {
    return {
      expression: null,
      erro: 'Modificador deve ser positivo para multiplicacao/divisao.',
    };
  }
  if (operador === '/' && modificador === 0) {
    return {
      expression: null,
      erro: 'Divisor nao pode ser zero.',
    };
  }

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

export function parseDiceInput(input: string): DiceParseGroupResult {
  const entrada = input.trim();
  if (!entrada) {
    return { expressions: null, erro: 'Informe uma rolagem para continuar.' };
  }

  const partes = entrada
    .split(/[\s,;|]+/)
    .map((parte) => parte.trim())
    .filter(Boolean);

  if (partes.length === 0) {
    return { expressions: null, erro: 'Informe uma rolagem para continuar.' };
  }

  if (partes.length > LIMITE_EXPRESSOES) {
    return {
      expressions: null,
      erro: `Limite de ${LIMITE_EXPRESSOES} rolagens por mensagem.`,
    };
  }

  const expressions: DiceExpression[] = [];
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
      if (label.length > LIMITE_LABEL) {
        return {
          expressions: null,
          erro: `Label muito longo (max ${LIMITE_LABEL} caracteres).`,
        };
      }
    }

    const resultado = parseDiceExpression(expressaoRaw);
    if (resultado.erro || !resultado.expression) {
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

  return { expressions, erro: null };
}

export function rolarDados(expression: DiceExpression): DiceRollPayload {
  const rolagens = Array.from({ length: expression.quantidade }, () =>
    rolarDado(expression.faces),
  );
  return { ...expression, rolagens };
}

export function calcularResultadoDice(payload: DiceRollPayload): DiceResultado {
  const keepMode = normalizarKeepMode(payload.keepMode);
  const normalizado = normalizarOperadorModificador(
    payload.operador,
    payload.modificador,
  );
  const rolagensBase = payload.rolagens;
  const rolagensFinais = payload.aplicarModificadorPorDado
    ? rolagensBase.map((valor) => {
        switch (normalizado.operador) {
          case '+':
            return valor + normalizado.modificador;
          case '-':
            return valor - normalizado.modificador;
          case '*':
            return valor * normalizado.modificador;
          case '/':
            return normalizado.modificador === 0
              ? valor
              : Math.trunc(valor / normalizado.modificador);
          default:
            return valor + normalizado.modificador;
        }
      })
    : rolagensBase;

  const totalBase = rolagensBase.reduce((acc, valor) => acc + valor, 0);
  if (keepMode === 'SUM') {
    const total = payload.aplicarModificadorPorDado
      ? rolagensFinais.reduce((acc, valor) => acc + valor, 0)
      : (() => {
          switch (normalizado.operador) {
            case '+':
              return totalBase + normalizado.modificador;
            case '-':
              return totalBase - normalizado.modificador;
            case '*':
              return totalBase * normalizado.modificador;
            case '/':
              return normalizado.modificador === 0
                ? totalBase
                : Math.trunc(totalBase / normalizado.modificador);
            default:
              return totalBase + normalizado.modificador;
          }
        })();
    return {
      keepMode,
      total,
      totalBase,
      rolagensBase,
      rolagensFinais,
      indiceEscolhido: null,
    };
  }

  let indiceEscolhido = 0;
  for (let i = 1; i < rolagensBase.length; i += 1) {
    const atual = rolagensBase[i] ?? 0;
    const escolhido = rolagensBase[indiceEscolhido] ?? 0;
    if (keepMode === 'HIGHEST') {
      if (atual > escolhido) indiceEscolhido = i;
    } else if (atual < escolhido) {
      indiceEscolhido = i;
    }
  }
  const baseEscolhido = rolagensFinais[indiceEscolhido] ?? rolagensBase[indiceEscolhido] ?? 0;
  const total = payload.aplicarModificadorPorDado
    ? baseEscolhido
    : (() => {
        switch (normalizado.operador) {
          case '+':
            return baseEscolhido + normalizado.modificador;
          case '-':
            return baseEscolhido - normalizado.modificador;
          case '*':
            return baseEscolhido * normalizado.modificador;
          case '/':
            return normalizado.modificador === 0
              ? baseEscolhido
              : Math.trunc(baseEscolhido / normalizado.modificador);
          default:
            return baseEscolhido + normalizado.modificador;
        }
      })();

  return {
    keepMode,
    total,
    totalBase: rolagensBase[indiceEscolhido] ?? 0,
    rolagensBase,
    rolagensFinais,
    indiceEscolhido,
  };
}

export function formatarExpressaoDice(expression: DiceExpression): string {
  const normalizado = normalizarOperadorModificador(
    expression.operador,
    expression.modificador,
  );
  const mod = normalizado.modificador;
  const operador = normalizado.operador;
  let modTexto = '';
  if (mod !== 0 || operador !== '+') {
    if (operador === '+') {
      modTexto = mod > 0 ? `+${mod}` : String(mod);
    } else if (operador === '-') {
      modTexto = `-${mod}`;
    } else {
      modTexto = `${operador}${mod}`;
    }
  }
  const hash = expression.aplicarModificadorPorDado ? '#' : '';
  return `${expression.quantidade}${hash}d${expression.faces}${modTexto}`;
}

export function construirMensagemDice(payload: DiceRollPayload): {
  mensagem: string;
  expression: string;
} {
  const expression = payload.label
    ? `${payload.label}: ${formatarExpressaoDice(payload)}`
    : formatarExpressaoDice(payload);
  const marcador =
    payload.keepMode && payload.keepMode !== 'SUM'
      ? `${DICE_MARKER_V4_PREFIX}${encodePayloadV4(payload)}]]`
      : `${DICE_MARKER_V3_PREFIX}${encodePayloadV3(payload)}]]`;
  const mensagem = `${expression} ${marcador}`.trim();
  return { mensagem, expression };
}

function encodePayloadV3(payload: DiceRollPayload): string {
  const normalizado = normalizarOperadorModificador(
    payload.operador,
    payload.modificador,
  );
  const base = `${payload.quantidade.toString(36)}|${payload.faces.toString(36)}|${
    normalizado.operador
  }|${normalizado.modificador.toString(36)}|${
    payload.aplicarModificadorPorDado ? 1 : 0
  }|${encodeRolls(payload.rolagens)}`;
  return payload.label ? `${base}|${encodeLabel(payload.label)}` : base;
}

function encodePayloadV4(payload: DiceRollPayload): string {
  const normalizado = normalizarOperadorModificador(
    payload.operador,
    payload.modificador,
  );
  const keepMode = normalizarKeepMode(payload.keepMode);
  const base = `${payload.quantidade.toString(36)}|${payload.faces.toString(36)}|${
    normalizado.operador
  }|${normalizado.modificador.toString(36)}|${
    payload.aplicarModificadorPorDado ? 1 : 0
  }|${encodeRolls(payload.rolagens)}|${keepMode}`;
  return payload.label ? `${base}|${encodeLabel(payload.label)}` : base;
}

function decodePayloadV2(serializado: string): DiceRollPayload | null {
  const partes = serializado.split('|');
  if (partes.length < 5) return null;
  const quantidade = Number.parseInt(partes[0], 36);
  const faces = Number.parseInt(partes[1], 36);
  const modificador = Number.parseInt(partes[2], 36);
  const aplicarModificadorPorDado = partes[3] === '1';
  const rolagens = decodeRolls(partes.slice(4).join('|'));

  if (
    !Number.isInteger(quantidade) ||
    quantidade <= 0 ||
    !Number.isInteger(faces) ||
    faces <= 0 ||
    !Number.isInteger(modificador) ||
    !rolagens ||
    rolagens.length !== quantidade
  ) {
    return null;
  }

  const labelRaw = partes[5] ?? '';
  const labelDecodificado = decodeLabel(labelRaw);
  return {
    quantidade,
    faces,
    modificador,
    aplicarModificadorPorDado,
    rolagens,
    label: labelDecodificado ?? undefined,
  };
}

function decodePayloadV3(serializado: string): DiceRollPayload | null {
  const partes = serializado.split('|');
  if (partes.length < 6) return null;
  const quantidade = Number.parseInt(partes[0], 36);
  const faces = Number.parseInt(partes[1], 36);
  const operador = partes[2] as DiceOperador;
  const modificador = Number.parseInt(partes[3], 36);
  const aplicarModificadorPorDado = partes[4] === '1';
  const rolagens = decodeRolls(partes[5] ?? '');

  if (
    !Number.isInteger(quantidade) ||
    quantidade <= 0 ||
    !Number.isInteger(faces) ||
    faces <= 0 ||
    !['+', '-', '*', '/'].includes(operador) ||
    !Number.isInteger(modificador) ||
    !rolagens ||
    rolagens.length !== quantidade
  ) {
    return null;
  }

  const labelRaw = partes[6] ?? '';
  const labelDecodificado = decodeLabel(labelRaw);

  return {
    quantidade,
    faces,
    modificador,
    operador,
    aplicarModificadorPorDado,
    rolagens,
    label: labelDecodificado ?? undefined,
  };
}

function decodePayloadV4(serializado: string): DiceRollPayload | null {
  const partes = serializado.split('|');
  if (partes.length < 7) return null;
  const quantidade = Number.parseInt(partes[0], 36);
  const faces = Number.parseInt(partes[1], 36);
  const operador = partes[2] as DiceOperador;
  const modificador = Number.parseInt(partes[3], 36);
  const aplicarModificadorPorDado = partes[4] === '1';
  const rolagens = decodeRolls(partes[5] ?? '');
  const keepMode = normalizarKeepMode(partes[6] as DiceKeepMode);

  if (
    !Number.isInteger(quantidade) ||
    quantidade <= 0 ||
    !Number.isInteger(faces) ||
    faces <= 0 ||
    !['+', '-', '*', '/'].includes(operador) ||
    !Number.isInteger(modificador) ||
    !rolagens ||
    rolagens.length !== quantidade
  ) {
    return null;
  }

  const labelRaw = partes[7] ?? '';
  const labelDecodificado = decodeLabel(labelRaw);

  return {
    quantidade,
    faces,
    modificador,
    operador,
    aplicarModificadorPorDado,
    rolagens,
    keepMode,
    label: labelDecodificado ?? undefined,
  };
}

export function construirMensagemDiceMultipla(payloads: DiceRollPayload[]): {
  mensagem: string;
  expression: string;
} {
  const expressao = payloads
    .map((payload) =>
      payload.label
        ? `${payload.label}: ${formatarExpressaoDice(payload)}`
        : formatarExpressaoDice(payload),
    )
    .join(', ');
  const usaV4 = payloads.some(
    (payload) => payload.keepMode && payload.keepMode !== 'SUM',
  );
  const serializado = payloads
    .map((payload) => (usaV4 ? encodePayloadV4(payload) : encodePayloadV3(payload)))
    .join('~');
  const marcador = usaV4
    ? `${DICE_MARKER_V4_PREFIX}${serializado}]]`
    : `${DICE_MARKER_V3_PREFIX}${serializado}]]`;
  const mensagem = `${expressao} ${marcador}`.trim();
  return { mensagem, expression: expressao };
}

export function validarComprimentoMensagemDice(mensagem: string): string | null {
  if (mensagem.length > LIMITE_MENSAGEM_CHAT_DICE) {
    return 'Rolagem grande demais para o chat. Reduza a quantidade de dados.';
  }
  return null;
}

export function parseDiceMessage(texto: string): DiceMessage | null {
  const match = texto.match(DICE_MARKER_REGEX);
  if (!match) return null;

  const partes = match[1].split('|');
  if (partes.length < 5) return null;

  const quantidade = Number(partes[0]);
  const faces = Number(partes[1]);
  const modificador = Number(partes[2]);
  const aplicarModificadorPorDado = partes[3] === '1';
  const rolagens = decodeRolls(partes.slice(4).join('|'));

  if (
    !Number.isInteger(quantidade) ||
    quantidade <= 0 ||
    !Number.isInteger(faces) ||
    faces <= 0 ||
    !Number.isInteger(modificador) ||
    !rolagens ||
    rolagens.length !== quantidade
  ) {
    return null;
  }

  const textoSemMarcador = texto.replace(DICE_MARKER_REGEX, '').trim();
  const payload: DiceRollPayload = {
    quantidade,
    faces,
    modificador,
    aplicarModificadorPorDado,
    rolagens,
  };
  const expression = textoSemMarcador || formatarExpressaoDice(payload);

  return { payload, expression, textoSemMarcador };
}

export function parseDiceMessageGroup(texto: string): DiceMessageGroup | null {
  const matchV4 = texto.match(DICE_MARKER_V4_REGEX);
  if (matchV4) {
    const partes = matchV4[1].split('~').filter(Boolean);
    if (partes.length === 0) return null;
    const payloads: DiceRollPayload[] = [];
    for (const parte of partes) {
      const payload = decodePayloadV4(parte);
      if (!payload) return null;
      payloads.push(payload);
    }
    const textoSemMarcador = texto.replace(DICE_MARKER_V4_REGEX, '').trim();
    return { payloads, textoSemMarcador };
  }

  const matchV3 = texto.match(DICE_MARKER_V3_REGEX);
  if (matchV3) {
    const partes = matchV3[1].split('~').filter(Boolean);
    if (partes.length === 0) return null;
    const payloads: DiceRollPayload[] = [];
    for (const parte of partes) {
      const payload = decodePayloadV3(parte);
      if (!payload) return null;
      payloads.push(payload);
    }
    const textoSemMarcador = texto.replace(DICE_MARKER_V3_REGEX, '').trim();
    return { payloads, textoSemMarcador };
  }

  const matchV2 = texto.match(DICE_MARKER_V2_REGEX);
  if (matchV2) {
    const partes = matchV2[1].split('~').filter(Boolean);
    if (partes.length === 0) return null;
    const payloads: DiceRollPayload[] = [];
    for (const parte of partes) {
      const payload = decodePayloadV2(parte);
      if (!payload) return null;
      payloads.push(payload);
    }
    const textoSemMarcador = texto.replace(DICE_MARKER_V2_REGEX, '').trim();
    return { payloads, textoSemMarcador };
  }

  const mensagemUnica = parseDiceMessage(texto);
  if (!mensagemUnica) return null;
  return { payloads: [mensagemUnica.payload], textoSemMarcador: mensagemUnica.textoSemMarcador };
}

export function ehMensagemDice(texto: string): boolean {
  return (
    DICE_MARKER_REGEX.test(texto) ||
    DICE_MARKER_V2_REGEX.test(texto) ||
    DICE_MARKER_V3_REGEX.test(texto) ||
    DICE_MARKER_V4_REGEX.test(texto)
  );
}

export { LIMITE_MENSAGEM_CHAT_DICE };
