const DICE_MARKER_REGEX = /\[\[dice:v1\|([^\]]+)\]\]/;
const DICE_MARKER_V2_REGEX = /\[\[dice:v2\|([^\]]+)\]\]/;
const DICE_MARKER_V3_PREFIX = '[[dice:v3|';
const DICE_MARKER_V3_REGEX = /\[\[dice:v3\|([^\]]+)\]\]/;
const DICE_MARKER_V4_PREFIX = '[[dice:v4|';
const DICE_MARKER_V4_REGEX = /\[\[dice:v4\|([^\]]+)\]\]/;
const DICE_MARKER_V5_PREFIX = '[[dice:v5|';
const DICE_MARKER_V5_REGEX = /\[\[dice:v5\|([^\]]+)\]\]/;

const LIMITE_MENSAGEM_CHAT_DICE = 800;
const LIMITE_DADOS = 30;
const LIMITE_FACES = 1000;
const LIMITE_MODIFICADOR = 10000;
const LIMITE_EXPRESSOES = 8;
const LIMITE_LABEL = 24;
const DICE_TERMO_REGEX = /^(\d+)?(#?)d(\d+)/i;

export type DiceOperador = '+' | '-' | '*' | '/';
export type DiceKeepMode = 'SUM' | 'HIGHEST' | 'LOWEST';

export type DiceTermExpression = {
  quantidade: number;
  faces: number;
  aplicarModificadorPorDado: boolean;
  keepMode?: DiceKeepMode;
};

export type DiceRollTerm = DiceTermExpression & {
  rolagens: number[];
};

export type DiceExpression = {
  quantidade: number;
  faces: number;
  modificador: number;
  operador?: '+' | '-' | '*' | '/';
  keepMode?: DiceKeepMode;
  aplicarModificadorPorDado: boolean;
  label?: string;
  termos?: DiceTermExpression[];
};

export type DiceRollPayload = DiceExpression & {
  rolagens: number[];
  bonusDados?: DiceBonusDado[];
  termos?: DiceRollTerm[];
};

export type DiceBonusDado = {
  origem: string;
  label: string;
  quantidade: number;
  faces: number;
  rolagens: number[];
  efeitoPendenteId?: string;
};

export type DicePeritoPendenteChat = {
  id: string;
  dado: string;
  faces: number;
  personagemSessaoId: number;
  personagemCampanhaId: number;
};

export type DicePeritoChatAplicado = {
  payloads: DiceRollPayload[];
  consumiu: boolean;
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
  bonusTotal: number;
  bonusDados: DiceBonusDado[];
  rolagensBase: number[];
  rolagensFinais: number[];
  indiceEscolhido: number | null;
  termos?: DiceTermResultado[];
};

export type DiceTermResultado = {
  quantidade: number;
  faces: number;
  keepMode: DiceKeepMode;
  aplicarModificadorPorDado: boolean;
  rolagensBase: number[];
  rolagensFinais: number[];
  subtotal: number;
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

export type DadosRolagemFormulaServidorSessao = {
  versao: 1;
  origem: 'SERVIDOR';
  tipo?: 'FORMULA';
  clientRequestId: string;
  expressaoOriginal: string;
  payloads: DiceRollPayload[];
};

export type DadosRolagemPericiaServidorSessao = {
  versao: 1;
  origem: 'SERVIDOR';
  tipo: 'PERICIA_PERSONAGEM';
  clientRequestId: string;
  personagemSessaoId: number;
  personagemCampanhaId: number;
  periciaCodigo: string;
  formulaResolvida: string;
  payloads: DiceRollPayload[];
  resultado: {
    total: number;
    dt: number | null;
    sucesso: boolean | null;
    falhaCritica: boolean;
  };
};

export type DadosRolagemAtaqueServidorSessao = {
  versao: 1;
  origem: 'SERVIDOR';
  tipo: 'ATAQUE_PERSONAGEM';
  clientRequestId: string;
  personagemSessaoId: number;
  personagemCampanhaId: number;
  periciaCodigo: string;
  bonusBase: number;
  bonusEscalada: number;
  formulaResolvida: string;
  payloads: DiceRollPayload[];
  resultado: {
    total: number;
    dt: number | null;
    sucesso: boolean | null;
    falhaCritica: boolean;
  };
};

export type DadosRolagemServidorSessao =
  | DadosRolagemFormulaServidorSessao
  | DadosRolagemPericiaServidorSessao
  | DadosRolagemAtaqueServidorSessao;

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

function encodeJsonPayload(valor: unknown): string {
  return encodeLabel(JSON.stringify(valor));
}

function decodeJsonPayload<T>(valor: string): T | null {
  const texto = decodeLabel(valor);
  if (!texto) return null;
  try {
    return JSON.parse(texto) as T;
  } catch {
    return null;
  }
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

function normalizarEntradaDice(input: string): string {
  return input
    .trim()
    .replace(/\s*([:=])\s*/g, '$1')
    .replace(/\s*([+\-*/])\s*(?=(?:\d+)?#?d|\d)/gi, '$1');
}

function resolverKeepModeResultado(payload: DiceRollPayload): DiceKeepMode {
  const keepMode = normalizarKeepMode(payload.keepMode);
  if (!payload.aplicarModificadorPorDado) return keepMode;
  return keepMode === 'LOWEST' ? 'LOWEST' : 'HIGHEST';
}

function resolverKeepModeTermo(term: DiceTermExpression): DiceKeepMode {
  const keepMode = normalizarKeepMode(term.keepMode);
  if (!term.aplicarModificadorPorDado) return keepMode;
  return keepMode === 'LOWEST' ? 'LOWEST' : 'HIGHEST';
}

function obterTermosExpression(expression: DiceExpression): DiceTermExpression[] {
  if (Array.isArray(expression.termos) && expression.termos.length > 0) {
    return expression.termos;
  }
  return [
    {
      quantidade: expression.quantidade,
      faces: expression.faces,
      aplicarModificadorPorDado: expression.aplicarModificadorPorDado,
      keepMode: expression.keepMode,
    },
  ];
}

function obterTermosPayload(payload: DiceRollPayload): DiceRollTerm[] {
  if (Array.isArray(payload.termos) && payload.termos.length > 0) {
    return payload.termos;
  }
  return [
    {
      quantidade: payload.quantidade,
      faces: payload.faces,
      aplicarModificadorPorDado: payload.aplicarModificadorPorDado,
      keepMode: payload.keepMode,
      rolagens: payload.rolagens,
    },
  ];
}

function payloadEhComposto(payload: DiceRollPayload): boolean {
  return Array.isArray(payload.termos) && payload.termos.length > 1;
}

function expressionEhComposta(expression: DiceExpression): boolean {
  return Array.isArray(expression.termos) && expression.termos.length > 1;
}

function aplicarOperadorTotal(
  totalBase: number,
  operador: DiceOperador,
  modificador: number,
): number {
  switch (operador) {
    case '-':
      return totalBase - modificador;
    case '*':
      return totalBase * modificador;
    case '/':
      return modificador === 0 ? totalBase : Math.trunc(totalBase / modificador);
    default:
      return totalBase + modificador;
  }
}

function calcularResultadoTermo(term: DiceRollTerm): DiceTermResultado {
  const keepMode = resolverKeepModeTermo(term);
  const rolagensBase = term.rolagens;
  const rolagensFinais = rolagensBase;
  if (keepMode === 'SUM') {
    return {
      quantidade: term.quantidade,
      faces: term.faces,
      keepMode,
      aplicarModificadorPorDado: term.aplicarModificadorPorDado,
      rolagensBase,
      rolagensFinais,
      subtotal: rolagensBase.reduce((acc, valor) => acc + valor, 0),
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

  return {
    quantidade: term.quantidade,
    faces: term.faces,
    keepMode,
    aplicarModificadorPorDado: term.aplicarModificadorPorDado,
    rolagensBase,
    rolagensFinais,
    subtotal: rolagensBase[indiceEscolhido] ?? 0,
    indiceEscolhido,
  };
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

function expressaoPossuiGruposSomados(compactado: string): boolean {
  return /d\d+\+(?:\d+)?#?d/i.test(compactado);
}

function parseDiceExpressionComposta(compactado: string): DiceParseResult {
  const termos: DiceTermExpression[] = [];
  let posicao = 0;
  let operador: DiceOperador = '+';
  let modificador = 0;

  while (posicao < compactado.length) {
    const trecho = compactado.slice(posicao);
    const match = trecho.match(DICE_TERMO_REGEX);
    if (!match) {
      return {
        expression: null,
        erro:
          'Sintaxe invalida. Use XdY, X#dY ou grupos somados (ex.: 4#d20+2d6).',
      };
    }

    const quantidade = match[1] ? Number(match[1]) : 1;
    const aplicarModificadorPorDado = match[2] === '#';
    const faces = Number(match[3]);
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      return { expression: null, erro: 'Quantidade de dados deve ser positiva.' };
    }
    if (!Number.isInteger(faces) || faces <= 0) {
      return { expression: null, erro: 'Numero de faces deve ser positivo.' };
    }
    if (faces > LIMITE_FACES) {
      return {
        expression: null,
        erro: `Limite de ${LIMITE_FACES} faces por dado.`,
      };
    }

    termos.push({
      quantidade,
      faces,
      aplicarModificadorPorDado,
      keepMode: aplicarModificadorPorDado ? 'HIGHEST' : 'SUM',
    });
    posicao += match[0].length;
    if (posicao >= compactado.length) break;

    const proximo = compactado[posicao] as DiceOperador | undefined;
    if (proximo === '+' && DICE_TERMO_REGEX.test(compactado.slice(posicao + 1))) {
      posicao += 1;
      continue;
    }

    const modificadorRaw = compactado.slice(posicao);
    const matchModificador = modificadorRaw.match(/^([+\-*/])(\d+)$/);
    if (!matchModificador) {
      return {
        expression: null,
        erro:
          proximo === '-' && DICE_TERMO_REGEX.test(compactado.slice(posicao + 1))
            ? 'Somente + e suportado entre grupos de dados nesta rolagem.'
            : 'Sintaxe invalida. Use XdY, X#dY ou grupos somados (ex.: 4#d20+2d6).',
      };
    }
    operador = matchModificador[1] as DiceOperador;
    modificador = Number(matchModificador[2]);
    posicao = compactado.length;
  }

  const totalDados = termos.reduce((acc, termo) => acc + termo.quantidade, 0);
  if (totalDados > LIMITE_DADOS) {
    return {
      expression: null,
      erro: `Limite de ${LIMITE_DADOS} dados por rolagem.`,
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

  const primeiroTermo = termos[0];
  if (!primeiroTermo || termos.length < 2) {
    return {
      expression: null,
      erro:
        'Sintaxe invalida. Use XdY, X#dY ou grupos somados (ex.: 4#d20+2d6).',
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

export function parseDiceExpression(input: string): DiceParseResult {
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
      erro: 'Sintaxe inválida. Use XdY ou X#dY (ex.: 2d6+3, 2d6*2).',
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
      erro: 'Divisor não pode ser zero.',
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
  const entrada = normalizarEntradaDice(input);
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
  const termosExpression = obterTermosExpression(expression);
  const termos = termosExpression.map((termo) => ({
    ...termo,
    rolagens: Array.from({ length: termo.quantidade }, () => rolarDado(termo.faces)),
  }));
  const primeiroTermo = termos[0];
  const rolagens = primeiroTermo?.rolagens ?? [];
  return {
    ...expression,
    rolagens,
    termos: expressionEhComposta(expression) ? termos : undefined,
  };
}

export function expressoesDiceContemD20(
  expressions: DiceExpression[],
): boolean {
  return expressions.some((expression) =>
    obterTermosExpression(expression).some((termo) => termo.faces === 20),
  );
}

export function criarClientRequestIdRolagem(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hexadecimal = Array.from(bytes, (value) =>
    value.toString(16).padStart(2, '0'),
  ).join('');
  return `${hexadecimal.slice(0, 8)}-${hexadecimal.slice(8, 12)}-${hexadecimal.slice(12, 16)}-${hexadecimal.slice(16, 20)}-${hexadecimal.slice(20)}`;
}

export function extrairDadosRolagemServidor(
  valor: unknown,
): DadosRolagemServidorSessao | null {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return null;
  const registro = valor as Record<string, unknown>;
  if (
    registro.versao !== 1 ||
    registro.origem !== 'SERVIDOR' ||
    typeof registro.clientRequestId !== 'string' ||
    !Array.isArray(registro.payloads)
  ) {
    return null;
  }
  if (
    registro.tipo === 'PERICIA_PERSONAGEM' ||
    registro.tipo === 'ATAQUE_PERSONAGEM'
  ) {
    if (
      !Number.isInteger(registro.personagemSessaoId) ||
      !Number.isInteger(registro.personagemCampanhaId) ||
      typeof registro.periciaCodigo !== 'string' ||
      typeof registro.formulaResolvida !== 'string' ||
      !registro.resultado ||
      typeof registro.resultado !== 'object' ||
      Array.isArray(registro.resultado)
    ) {
      return null;
    }
    if (
      registro.tipo === 'ATAQUE_PERSONAGEM' &&
      (typeof registro.bonusBase !== 'number' ||
        !Number.isFinite(registro.bonusBase) ||
        typeof registro.bonusEscalada !== 'number' ||
        !Number.isFinite(registro.bonusEscalada))
    ) {
      return null;
    }
    return registro as
      | DadosRolagemPericiaServidorSessao
      | DadosRolagemAtaqueServidorSessao;
  }
  if (typeof registro.expressaoOriginal !== 'string') return null;
  return registro as DadosRolagemServidorSessao;
}

export function rolagemFoiGeradaNoServidor(valor: unknown): boolean {
  return extrairDadosRolagemServidor(valor) !== null;
}

export function rolarBonusDado(params: {
  origem: string;
  label: string;
  quantidade?: number;
  faces: number;
  efeitoPendenteId?: string;
}): DiceBonusDado {
  const quantidade = Math.max(1, Math.trunc(params.quantidade ?? 1));
  return {
    origem: params.origem,
    label: params.label,
    quantidade,
    faces: params.faces,
    rolagens: Array.from({ length: quantidade }, () => rolarDado(params.faces)),
    efeitoPendenteId: params.efeitoPendenteId,
  };
}

export function aplicarPeritoPendenteChatLivre(
  payloads: DiceRollPayload[],
  peritoPendente?: DicePeritoPendenteChat | null,
  rolarBonus: typeof rolarBonusDado = rolarBonusDado,
): DicePeritoChatAplicado {
  if (!peritoPendente) {
    return { payloads, consumiu: false };
  }

  let consumiu = false;
  const atualizados = payloads.map((payload) => {
    const temD20 = obterTermosPayload(payload).some((termo) => termo.faces === 20);
    if (consumiu || !temD20) {
      return payload;
    }
    consumiu = true;
    return {
      ...payload,
      bonusDados: [
        ...(payload.bonusDados ?? []),
        rolarBonus({
          origem: 'PERITO',
          label: `Perito +${peritoPendente.dado}`,
          faces: peritoPendente.faces,
          efeitoPendenteId: peritoPendente.id,
        }),
      ],
    };
  });

  return { payloads: atualizados, consumiu };
}

export function obterAvisoPeritoPendenteChat(
  peritoPendente?: DicePeritoPendenteChat | null,
): string | null {
  return peritoPendente
    ? 'Perito pendente: será gasto na próxima rolagem com d20.'
    : null;
}

export function calcularResultadoDice(payload: DiceRollPayload): DiceResultado {
  const keepMode = resolverKeepModeResultado(payload);
  const normalizado = normalizarOperadorModificador(
    payload.operador,
    payload.modificador,
  );
  const rolagensBase = payload.rolagens;
  const bonusDados = Array.isArray(payload.bonusDados) ? payload.bonusDados : [];
  const bonusTotal = bonusDados.reduce(
    (acc, bonus) =>
      acc +
      bonus.rolagens.reduce((totalBonus, valor) => totalBonus + valor, 0),
    0,
  );
  if (payloadEhComposto(payload)) {
    const termos = obterTermosPayload(payload).map((termo) =>
      calcularResultadoTermo(termo),
    );
    const rolagensBaseCompostas = termos.flatMap((termo) => termo.rolagensBase);
    const rolagensFinaisCompostas = termos.flatMap((termo) => termo.rolagensFinais);
    const totalBaseComposto = termos.reduce(
      (acc, termo) => acc + termo.subtotal,
      0,
    );
    const totalSemBonus = aplicarOperadorTotal(
      totalBaseComposto,
      normalizado.operador,
      normalizado.modificador,
    );
    return {
      keepMode: 'SUM',
      total: totalSemBonus + bonusTotal,
      totalBase: totalBaseComposto,
      bonusTotal,
      bonusDados,
      rolagensBase: rolagensBaseCompostas,
      rolagensFinais: rolagensFinaisCompostas,
      indiceEscolhido: null,
      termos,
    };
  }
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
    const totalSemBonus = payload.aplicarModificadorPorDado
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
    const total = totalSemBonus + bonusTotal;
    return {
      keepMode,
      total,
      totalBase,
      bonusTotal,
      bonusDados,
      rolagensBase,
      rolagensFinais,
      indiceEscolhido: null,
    };
  }

  let indiceEscolhido = 0;
  for (let i = 1; i < rolagensBase.length; i += 1) {
    const atual = rolagensFinais[i] ?? rolagensBase[i] ?? 0;
    const escolhido =
      rolagensFinais[indiceEscolhido] ?? rolagensBase[indiceEscolhido] ?? 0;
    if (keepMode === 'HIGHEST') {
      if (atual > escolhido) indiceEscolhido = i;
    } else if (atual < escolhido) {
      indiceEscolhido = i;
    }
  }
  const baseEscolhido = rolagensFinais[indiceEscolhido] ?? rolagensBase[indiceEscolhido] ?? 0;
  const totalSemBonus = payload.aplicarModificadorPorDado
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
  const total = totalSemBonus + bonusTotal;

  return {
    keepMode,
    total,
    totalBase: rolagensBase[indiceEscolhido] ?? 0,
    bonusTotal,
    bonusDados,
    rolagensBase,
    rolagensFinais,
    indiceEscolhido,
  };
}

function payloadTemBonus(payload: DiceRollPayload): boolean {
  return Array.isArray(payload.bonusDados) && payload.bonusDados.length > 0;
}

function formatarTermoDice(term: DiceTermExpression): string {
  const hash = term.aplicarModificadorPorDado ? '#' : '';
  return `${term.quantidade}${hash}d${term.faces}`;
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
  const bonus = Array.isArray((expression as DiceRollPayload).bonusDados)
    ? ((expression as DiceRollPayload).bonusDados ?? [])
        .map((item) => `+${item.quantidade}d${item.faces}`)
        .join('')
    : '';
  const base = expressionEhComposta(expression)
    ? obterTermosExpression(expression).map(formatarTermoDice).join('+')
    : `${expression.quantidade}${hash}d${expression.faces}`;
  return `${base}${modTexto}${bonus}`;
}

export function construirMensagemDice(payload: DiceRollPayload): {
  mensagem: string;
  expression: string;
} {
  const expression = payload.label
    ? `${payload.label}: ${formatarExpressaoDice(payload)}`
    : formatarExpressaoDice(payload);
  const marcador = payloadTemBonus(payload) || payloadEhComposto(payload)
    ? `${DICE_MARKER_V5_PREFIX}${encodePayloadV5([payload])}]]`
    : payload.keepMode && payload.keepMode !== 'SUM'
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

function encodePayloadV5(payloads: DiceRollPayload[]): string {
  return encodeJsonPayload(payloads);
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

function normalizarBonusDados(valor: unknown): DiceBonusDado[] | undefined {
  if (!Array.isArray(valor)) return undefined;
  const bonus: DiceBonusDado[] = [];
  for (const item of valor) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const registro = item as Record<string, unknown>;
    const origem = typeof registro.origem === 'string' ? registro.origem : '';
    const label = typeof registro.label === 'string' ? registro.label : '';
    const quantidade =
      typeof registro.quantidade === 'number'
        ? Math.trunc(registro.quantidade)
        : 0;
    const faces =
      typeof registro.faces === 'number' ? Math.trunc(registro.faces) : 0;
    const rolagens = Array.isArray(registro.rolagens)
      ? registro.rolagens.filter(
          (valorRolagem): valorRolagem is number =>
            typeof valorRolagem === 'number' &&
            Number.isFinite(valorRolagem) &&
            valorRolagem > 0,
        )
      : [];
    if (!origem || !label || quantidade <= 0 || faces <= 0) continue;
    if (rolagens.length !== quantidade) continue;
    bonus.push({
      origem,
      label,
      quantidade,
      faces,
      rolagens,
      efeitoPendenteId:
        typeof registro.efeitoPendenteId === 'string'
          ? registro.efeitoPendenteId
          : undefined,
    });
  }
  return bonus.length > 0 ? bonus : undefined;
}

function normalizarTermosRolagem(valor: unknown): DiceRollTerm[] | undefined {
  if (!Array.isArray(valor)) return undefined;
  const termos: DiceRollTerm[] = [];
  let totalDados = 0;
  for (const item of valor) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return undefined;
    const registro = item as Record<string, unknown>;
    const quantidade =
      typeof registro.quantidade === 'number'
        ? Math.trunc(registro.quantidade)
        : 0;
    const faces =
      typeof registro.faces === 'number' ? Math.trunc(registro.faces) : 0;
    const aplicarModificadorPorDado = registro.aplicarModificadorPorDado === true;
    const keepMode = normalizarKeepMode(registro.keepMode as DiceKeepMode);
    const rolagens = Array.isArray(registro.rolagens)
      ? registro.rolagens.filter(
          (valorRolagem): valorRolagem is number =>
            typeof valorRolagem === 'number' &&
            Number.isFinite(valorRolagem) &&
            valorRolagem > 0,
        )
      : [];
    totalDados += quantidade;
    if (
      quantidade <= 0 ||
      faces <= 0 ||
      faces > LIMITE_FACES ||
      rolagens.length !== quantidade ||
      rolagens.some((valorRolagem) => valorRolagem > faces)
    ) {
      return undefined;
    }
    termos.push({
      quantidade,
      faces,
      aplicarModificadorPorDado,
      keepMode,
      rolagens,
    });
  }
  if (termos.length <= 1 || totalDados > LIMITE_DADOS) return undefined;
  return termos;
}

function decodePayloadV5(serializado: string): DiceRollPayload[] | null {
  const payloads = decodeJsonPayload<unknown>(serializado);
  if (!Array.isArray(payloads)) return null;
  const resultado: DiceRollPayload[] = [];
  for (const payloadRaw of payloads) {
    if (!payloadRaw || typeof payloadRaw !== 'object' || Array.isArray(payloadRaw)) {
      return null;
    }
    const payload = payloadRaw as Record<string, unknown>;
    const quantidade =
      typeof payload.quantidade === 'number' ? Math.trunc(payload.quantidade) : 0;
    const faces = typeof payload.faces === 'number' ? Math.trunc(payload.faces) : 0;
    const modificador =
      typeof payload.modificador === 'number'
        ? Math.trunc(payload.modificador)
        : 0;
    const operador = payload.operador as DiceOperador | undefined;
    const keepMode = normalizarKeepMode(payload.keepMode as DiceKeepMode);
    const aplicarModificadorPorDado = payload.aplicarModificadorPorDado === true;
    const rolagens = Array.isArray(payload.rolagens)
      ? payload.rolagens.filter(
          (valor): valor is number =>
            typeof valor === 'number' && Number.isFinite(valor) && valor > 0,
        )
      : [];
    const termos = normalizarTermosRolagem(payload.termos);
    if (payload.termos !== undefined && !termos) return null;
    if (
      quantidade <= 0 ||
      faces <= 0 ||
      !['+', '-', '*', '/', undefined].includes(operador) ||
      rolagens.length !== quantidade
    ) {
      return null;
    }
    resultado.push({
      quantidade,
      faces,
      modificador,
      operador,
      keepMode,
      aplicarModificadorPorDado,
      rolagens,
      label: typeof payload.label === 'string' ? payload.label : undefined,
      bonusDados: normalizarBonusDados(payload.bonusDados),
      termos,
    });
  }
  return resultado.length > 0 ? resultado : null;
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
  const usaV5 = payloads.some(
    (payload) => payloadTemBonus(payload) || payloadEhComposto(payload),
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
  const matchV5 = texto.match(DICE_MARKER_V5_REGEX);
  if (matchV5) {
    const payloads = decodePayloadV5(matchV5[1]);
    if (!payloads) return null;
    const textoSemMarcador = texto.replace(DICE_MARKER_V5_REGEX, '').trim();
    return { payloads, textoSemMarcador };
  }

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
    DICE_MARKER_V4_REGEX.test(texto) ||
    DICE_MARKER_V5_REGEX.test(texto)
  );
}

export { LIMITE_MENSAGEM_CHAT_DICE };
