import {
  LIMITES_DICE_SESSAO,
  type DiceExpressionServidor,
} from './sessao-dice-autoritativo';

export type FonteDanoHabilidadePersistida = {
  dadosDano: unknown;
  danoFlat: number | null | undefined;
  danoFlatTipo: string | null | undefined;
  escalonamentoDano: unknown;
  acumulosAplicados: number;
};

export type ResultadoFonteDanoHabilidade = {
  expressoes: DiceExpressionServidor[] | null;
  erro: string | null;
};

type DadoDanoNormalizado = {
  quantidade: number;
  faces: number;
  tipo: string;
};

function normalizarTextoComparacao(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function normalizarChavePericiaHabilidade(texto: string): string {
  return normalizarTextoComparacao(texto).replace(/\s+/g, ' ');
}

export function extrairPericiasTesteHabilidadePersistido(
  testesExigidos: unknown,
): string[] {
  const lista = Array.isArray(testesExigidos)
    ? testesExigidos.filter((item): item is string => typeof item === 'string')
    : typeof testesExigidos === 'string'
      ? [testesExigidos]
      : [];
  const texto = lista
    .join(', ')
    .replace(/\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!texto) return [];

  return texto
    .split(/\s*(?:\bcom\b|\be\b|\/|,|\+)\s*/i)
    .map((parte) => parte.trim())
    .filter(Boolean);
}

function normalizarDadoDano(entrada: unknown): DadoDanoNormalizado | null {
  if (!entrada || typeof entrada !== 'object' || Array.isArray(entrada)) {
    return null;
  }
  const registro = entrada as Record<string, unknown>;
  const quantidade = Number(registro.quantidade);
  const dado = typeof registro.dado === 'string' ? registro.dado.trim() : '';
  const matchDado = dado.match(/^d(\d+)$/i);
  const tipo = typeof registro.tipo === 'string' ? registro.tipo.trim() : '';
  if (
    !Number.isInteger(quantidade) ||
    quantidade <= 0 ||
    quantidade > LIMITES_DICE_SESSAO.dados ||
    !matchDado
  ) {
    return null;
  }
  const faces = Number(matchDado[1]);
  if (
    !Number.isInteger(faces) ||
    faces <= 0 ||
    faces > LIMITES_DICE_SESSAO.faces
  ) {
    return null;
  }
  return { quantidade, faces, tipo: tipo || 'Dano' };
}

function expressaoDanoFlat(
  danoFlat: number,
  tipo: string,
): DiceExpressionServidor {
  const modificador = danoFlat - 1;
  return {
    quantidade: 1,
    faces: 1,
    modificador: Math.abs(modificador),
    operador: modificador < 0 ? '-' : '+',
    aplicarModificadorPorDado: false,
    label: tipo.slice(0, LIMITES_DICE_SESSAO.label),
  };
}

export function resolverFonteDanoHabilidadePersistida(
  fonte: FonteDanoHabilidadePersistida,
): ResultadoFonteDanoHabilidade {
  const entradasBase = Array.isArray(fonte.dadosDano) ? fonte.dadosDano : [];
  const dadosBase: DadoDanoNormalizado[] = [];
  for (const entrada of entradasBase) {
    const dado = normalizarDadoDano(entrada);
    if (!dado) {
      return {
        expressoes: null,
        erro: 'A habilidade possui dados de dano persistidos em formato invalido.',
      };
    }
    dadosBase.push(dado);
  }

  const acumulosExtras = Math.max(0, Math.trunc(fonte.acumulosAplicados) - 1);
  if (acumulosExtras > 0 && fonte.escalonamentoDano) {
    const escalonamento = normalizarDadoDano(fonte.escalonamentoDano);
    if (!escalonamento) {
      return {
        expressoes: null,
        erro: 'A habilidade possui escalonamento de dano persistido em formato invalido.',
      };
    }
    dadosBase.push({
      ...escalonamento,
      quantidade: escalonamento.quantidade * acumulosExtras,
    });
  }

  const agrupados = new Map<string, DadoDanoNormalizado>();
  for (const dado of dadosBase) {
    const chave = `${normalizarTextoComparacao(dado.tipo)}::${dado.faces}`;
    const atual = agrupados.get(chave);
    const quantidade = (atual?.quantidade ?? 0) + dado.quantidade;
    if (quantidade > LIMITES_DICE_SESSAO.dados) {
      return {
        expressoes: null,
        erro: `O dano excede o limite de ${LIMITES_DICE_SESSAO.dados} dados por tipo.`,
      };
    }
    agrupados.set(chave, { ...dado, quantidade });
  }

  if (agrupados.size > LIMITES_DICE_SESSAO.expressoes) {
    return {
      expressoes: null,
      erro: `O dano excede o limite de ${LIMITES_DICE_SESSAO.expressoes} expressoes.`,
    };
  }

  const danoFlat = Number.isFinite(fonte.danoFlat)
    ? Math.trunc(fonte.danoFlat as number)
    : 0;
  const tipoFlat = fonte.danoFlatTipo?.trim() || 'Dano';
  const expressoes = [...agrupados.values()].map(
    (dado): DiceExpressionServidor => ({
      quantidade: dado.quantidade,
      faces: dado.faces,
      modificador: 0,
      operador: '+',
      aplicarModificadorPorDado: false,
      label: dado.tipo.slice(0, LIMITES_DICE_SESSAO.label),
    }),
  );

  if (danoFlat !== 0 && expressoes.length > 0) {
    const primeira = expressoes[0];
    expressoes[0] = {
      ...primeira,
      modificador: Math.abs(danoFlat),
      operador: danoFlat < 0 ? '-' : '+',
    };
  } else if (danoFlat > 0) {
    expressoes.push(expressaoDanoFlat(danoFlat, tipoFlat));
  }

  if (expressoes.length === 0) {
    return {
      expressoes: null,
      erro: 'A habilidade nao possui dano estruturado para rolagem no servidor.',
    };
  }
  return { expressoes, erro: null };
}
