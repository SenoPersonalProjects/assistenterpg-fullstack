// src/personagem-base/regras-criacao/regras-atributos.ts

import { AtributoBase, AtributoPassiva, PrismaClient } from '@prisma/client';

// ✅ Exceções customizadas
import {
  AtributoNaoInteiroException,
  AtributoForaDoLimiteException,
  SomatorioAtributosInvalidoException,
  PassivasExcedemLimiteException,
  PassivasNaoElegiveisException,
  PassivasEscolhaNecessariaException,
  CatalogoPassivasInconsisteException,
  PassivaRequisitoNaoAtendidoException,
  PassivasDuplicadasException,
  PassivasLimiteAtributoExcedidoException,
  PassivaInexistenteException,
  PassivasIntelectoConfigInvalidaException,
  PassivaIntelectoPericiaInexistenteException,
  PassivaIntelectoTreinoNecessarioException,
  PassivaIntelectoGrauExcedeMaximoException,
} from 'src/common/exceptions/personagem.exception';

/**
 * ✅ Calcula o total de pontos de atributos esperado para um nível
 */
export function calcularTotalAtributosEsperado(nivel: number): number {
  const base = 9;
  const marcos = [4, 7, 10, 13, 16, 19];
  const bonus = marcos.filter((m) => nivel >= m).length;
  return base + bonus;
}

/**
 * ✅ Valida se os atributos do personagem estão corretos
 */
export function validarAtributos(params: {
  nivel: number;
  agilidade: number;
  forca: number;
  intelecto: number;
  presenca: number;
  vigor: number;
}): void {
  const { nivel, agilidade, forca, intelecto, presenca, vigor } = params;
  const attrs = { agilidade, forca, intelecto, presenca, vigor };

  // Validar se são inteiros e estão na faixa [0, 7]
  for (const [nome, v] of Object.entries(attrs)) {
    if (!Number.isInteger(v)) {
      throw new AtributoNaoInteiroException(nome, v);
    }
    if (v < 0 || v > 7) {
      throw new AtributoForaDoLimiteException(nome, v);
    }
  }

  // Validar soma total
  const soma = agilidade + forca + intelecto + presenca + vigor;
  const esperado = calcularTotalAtributosEsperado(nivel);

  if (soma !== esperado) {
    throw new SomatorioAtributosInvalidoException(nivel, soma, esperado);
  }
}

// ============================================================================
// ✅ PASSIVAS DE ATRIBUTOS
// ============================================================================

export type AtributosValores = {
  agilidade: number;
  forca: number;
  intelecto: number;
  presenca: number;
  vigor: number;
};

function getValorAtributoBase(
  atributos: AtributosValores,
  base: AtributoBase,
): number {
  switch (base) {
    case AtributoBase.AGI:
      return atributos.agilidade;
    case AtributoBase.FOR:
      return atributos.forca;
    case AtributoBase.INT:
      return atributos.intelecto;
    case AtributoBase.PRE:
      return atributos.presenca;
    case AtributoBase.VIG:
      return atributos.vigor;
    default:
      return 0;
  }
}

function mapBaseToPassiva(base: AtributoBase): AtributoPassiva {
  switch (base) {
    case AtributoBase.AGI:
      return AtributoPassiva.AGILIDADE;
    case AtributoBase.FOR:
      return AtributoPassiva.FORCA;
    case AtributoBase.INT:
      return AtributoPassiva.INTELECTO;
    case AtributoBase.PRE:
      return AtributoPassiva.PRESENCA;
    case AtributoBase.VIG:
      return AtributoPassiva.VIGOR;
    default:
      return AtributoPassiva.AGILIDADE;
  }
}

export function listarAtributosElegiveisPassivas(
  atributos: AtributosValores,
): AtributoBase[] {
  const ordem: AtributoBase[] = [
    AtributoBase.AGI,
    AtributoBase.FOR,
    AtributoBase.INT,
    AtributoBase.PRE,
    AtributoBase.VIG,
  ];

  return ordem.filter((a) => getValorAtributoBase(atributos, a) >= 3);
}

function normalizarListaAtributosBase(valor: unknown): AtributoBase[] {
  if (!Array.isArray(valor)) return [];
  const set = new Set<AtributoBase>();

  for (const v of valor) {
    if (typeof v !== 'string') continue;
    if ((Object.values(AtributoBase) as string[]).includes(v)) {
      set.add(v as AtributoBase);
    }
  }

  return Array.from(set);
}

function niveisPorValorAtributo(valor: number): Array<1 | 2> {
  if (valor >= 6) return [1, 2];
  if (valor >= 3) return [1];
  return [];
}

export type PassivaIntelectoConfig = {
  periciasCodigos?: string[];
  proficienciasCodigos?: string[];
  periciaCodigoTreino?: string;
  tipoGrauCodigoAprimoramento?: string;
};

export type PassivasAtributoConfig = {
  INT_I?: PassivaIntelectoConfig;
  INT_II?: PassivaIntelectoConfig;
};

export type ResolverPassivasResult = {
  elegiveis: AtributoBase[];
  ativos: AtributoBase[];
  passivaIds: number[];
  passivaCodigos: string[];
  needsChoice: boolean;
};

type ResolverPassivasParams = {
  atributos: AtributosValores;
  prisma: PrismaClient;
  passivasAtributosAtivos?: unknown;
  strict?: boolean;
};

export async function resolverPassivasAtributos(
  params: ResolverPassivasParams,
): Promise<ResolverPassivasResult> {
  const { atributos, prisma, strict = false } = params;

  const elegiveis = listarAtributosElegiveisPassivas(atributos);
  const escolhidos = normalizarListaAtributosBase(
    params.passivasAtributosAtivos,
  );

  if (escolhidos.length > 2) {
    throw new PassivasExcedemLimiteException(escolhidos.length, elegiveis);
  }

  if (escolhidos.length > 0 && escolhidos.some((a) => !elegiveis.includes(a))) {
    throw new PassivasNaoElegiveisException(escolhidos, elegiveis);
  }

  const needsChoice = elegiveis.length > 2 && escolhidos.length !== 2;

  if (needsChoice) {
    if (strict) {
      throw new PassivasEscolhaNecessariaException(elegiveis);
    }

    return {
      elegiveis,
      ativos: [],
      passivaIds: [],
      passivaCodigos: [],
      needsChoice: true,
    };
  }

  const ativos = elegiveis.length <= 2 ? elegiveis : escolhidos;

  const filtros: Array<{ atributo: AtributoPassiva; nivel: 1 | 2 }> = [];
  for (const a of ativos) {
    const valor = getValorAtributoBase(atributos, a);
    const niveis = niveisPorValorAtributo(valor);
    const atributoPassiva = mapBaseToPassiva(a);

    for (const nivel of niveis) {
      filtros.push({ atributo: atributoPassiva, nivel });
    }
  }

  if (filtros.length === 0) {
    return {
      elegiveis,
      ativos,
      passivaIds: [],
      passivaCodigos: [],
      needsChoice: false,
    };
  }

  const passivas = await prisma.passivaAtributo.findMany({
    where: {
      OR: filtros.map((f) => ({
        atributo: f.atributo,
        nivel: f.nivel,
      })),
    },
  });

  if (passivas.length !== filtros.length) {
    throw new CatalogoPassivasInconsisteException();
  }

  const passivaIds = passivas.map((p) => p.id);
  const passivaCodigos = passivas.map((p) => p.codigo);

  return { elegiveis, ativos, passivaIds, passivaCodigos, needsChoice: false };
}

// ============================================================================
// ✅ LEGADO: validação por IDs
// ============================================================================

interface ValidarPassivasParams {
  passivasIds: number[];
  atributos: AtributosValores;
  prisma: PrismaClient;
}

export async function validarPassivasAtributos({
  passivasIds,
  atributos,
  prisma,
}: ValidarPassivasParams): Promise<void> {
  if (!passivasIds || passivasIds.length === 0) return;

  const passivas = await prisma.passivaAtributo.findMany({
    where: { id: { in: passivasIds } },
  });

  if (passivas.length !== passivasIds.length) {
    throw new PassivaInexistenteException();
  }

  const atributosMap: Record<AtributoPassiva, number> = {
    AGILIDADE: atributos.agilidade,
    FORCA: atributos.forca,
    INTELECTO: atributos.intelecto,
    PRESENCA: atributos.presenca,
    VIGOR: atributos.vigor,
  };

  for (const passiva of passivas) {
    const valorAtributo = atributosMap[passiva.atributo];
    if (valorAtributo < passiva.requisito) {
      throw new PassivaRequisitoNaoAtendidoException(
        passiva.nome,
        passiva.atributo,
        passiva.requisito,
        valorAtributo,
      );
    }
  }

  const porAtributo = passivas.reduce(
    (acc, p) => {
      if (!acc[p.atributo]) acc[p.atributo] = [];
      acc[p.atributo].push(p);
      return acc;
    },
    {} as Record<string, typeof passivas>,
  );

  const atributosComPassivas = Object.keys(porAtributo);
  if (atributosComPassivas.length > 2) {
    throw new PassivasLimiteAtributoExcedidoException(
      atributosComPassivas.length,
      atributosComPassivas,
    );
  }

  for (const [atributo, passivasDoAtributo] of Object.entries(porAtributo)) {
    if (passivasDoAtributo.length > 2) {
      throw new PassivasDuplicadasException(
        atributo,
        passivasDoAtributo.length,
      );
    }

    const niveis = new Set(passivasDoAtributo.map((p) => p.nivel));
    if (niveis.size !== passivasDoAtributo.length) {
      throw new PassivasDuplicadasException(
        atributo,
        passivasDoAtributo.length,
      );
    }
  }
}

export function calcularEfeitosPassivas(passivas: Array<{ efeitos: any }>): {
  deslocamentoExtra: number;
  reacoesExtra: number;
  peExtra: number;
  eaExtra: number;
  limitePeEaExtra: number;
  pvExtraLimitePeEa: boolean;
  rodadasMorrendoExtra: number;
  rodadasEnlouquecendoExtra: number;
  passosDanoCorpoACorpo: number;
  dadosDanoCorpoACorpo: number;
  periciasExtras: number;
  proficienciasExtras: number;
  grauTreinamentoExtra: number;
  grauAprimoramentoExtra: number;
} {
  const efeitos = {
    deslocamentoExtra: 0,
    reacoesExtra: 0,
    peExtra: 0,
    eaExtra: 0,
    limitePeEaExtra: 0,
    pvExtraLimitePeEa: false,
    rodadasMorrendoExtra: 0,
    rodadasEnlouquecendoExtra: 0,
    passosDanoCorpoACorpo: 0,
    dadosDanoCorpoACorpo: 0,
    periciasExtras: 0,
    proficienciasExtras: 0,
    grauTreinamentoExtra: 0,
    grauAprimoramentoExtra: 0,
  };

  for (const passiva of passivas) {
    const efeitosPassiva = passiva.efeitos;

    if (efeitosPassiva.deslocamento) {
      efeitos.deslocamentoExtra = Math.max(
        efeitos.deslocamentoExtra,
        efeitosPassiva.deslocamento,
      );
    }
    if (efeitosPassiva.reacoes) {
      efeitos.reacoesExtra += efeitosPassiva.reacoes;
    }
    if (efeitosPassiva.passosDanoCorpoACorpo) {
      efeitos.passosDanoCorpoACorpo = Math.max(
        efeitos.passosDanoCorpoACorpo,
        efeitosPassiva.passosDanoCorpoACorpo,
      );
    }
    if (efeitosPassiva.dadosDanoCorpoACorpo) {
      efeitos.dadosDanoCorpoACorpo += efeitosPassiva.dadosDanoCorpoACorpo;
    }
    if (efeitosPassiva.periciasExtras) {
      efeitos.periciasExtras = Math.max(
        efeitos.periciasExtras,
        efeitosPassiva.periciasExtras,
      );
    }
    if (efeitosPassiva.proficienciasExtras) {
      efeitos.proficienciasExtras = Math.max(
        efeitos.proficienciasExtras,
        efeitosPassiva.proficienciasExtras,
      );
    }
    if (efeitosPassiva.grauTreinamentoExtra) {
      efeitos.grauTreinamentoExtra += efeitosPassiva.grauTreinamentoExtra;
    }
    if (efeitosPassiva.grauAprimoramentoExtra) {
      efeitos.grauAprimoramentoExtra += efeitosPassiva.grauAprimoramentoExtra;
    }
    if (efeitosPassiva.rodadasEnlouquecendo) {
      efeitos.rodadasEnlouquecendoExtra += efeitosPassiva.rodadasEnlouquecendo;
    }
    if (efeitosPassiva.peExtra) {
      efeitos.peExtra += efeitosPassiva.peExtra;
    }
    if (efeitosPassiva.eaExtra) {
      efeitos.eaExtra += efeitosPassiva.eaExtra;
    }
    if (efeitosPassiva.limitePeEaExtra) {
      efeitos.limitePeEaExtra += efeitosPassiva.limitePeEaExtra;
    }
    if (efeitosPassiva.rodadasMorrendo) {
      efeitos.rodadasMorrendoExtra += efeitosPassiva.rodadasMorrendo;
    }
    if (efeitosPassiva.pvExtraLimitePeEa === true) {
      efeitos.pvExtraLimitePeEa = true;
    }
  }

  return efeitos;
}

// ============================================================================
// ✅ INTELECTO
// ============================================================================

export function aplicarEfeitosPassivasIntelectoEmPericiasEProficiencias(params: {
  passivasAtivasCodigos: string[];
  passivasConfig: PassivasAtributoConfig | null | undefined;
  periciasMap: Map<
    string,
    { grauTreinamento: number; periciaId: number; bonusExtra: number }
  >;
  profsExtrasPayload: string[];
}): {
  profsExtrasFinal: string[];
  periciasLivresExtras: number;
} {
  const {
    passivasAtivasCodigos,
    passivasConfig,
    periciasMap,
    profsExtrasPayload,
  } = params;

  const cfg = passivasConfig ?? {};
  const profsExtras = new Set(profsExtrasPayload);
  let periciasLivresExtras = 0;

  const temIntI = passivasAtivasCodigos.includes('INT_I');
  const temIntII = passivasAtivasCodigos.includes('INT_II');

  const aplicarIntelectoUnitario = (codigoPassiva: 'INT_I' | 'INT_II') => {
    const conf = cfg[codigoPassiva];
    if (!conf) return;

    const periciasCodigos = conf.periciasCodigos ?? [];
    const profsCodigos = conf.proficienciasCodigos ?? [];

    const maxTotal = codigoPassiva === 'INT_I' ? 1 : 2;
    const totalEscolhas = periciasCodigos.length + profsCodigos.length;

    if (totalEscolhas > maxTotal) {
      throw new PassivasIntelectoConfigInvalidaException(
        codigoPassiva,
        maxTotal,
      );
    }

    const periciasLivresDestaPassiva = maxTotal - totalEscolhas;
    periciasLivresExtras += periciasLivresDestaPassiva;

    for (const codigo of periciasCodigos) {
      const entry = periciasMap.get(codigo);
      if (!entry) {
        throw new PassivaIntelectoPericiaInexistenteException(
          codigoPassiva,
          codigo,
        );
      }
    }

    for (const codigo of profsCodigos) {
      profsExtras.add(codigo);
    }

    if (conf.periciaCodigoTreino) {
      const entry = periciasMap.get(conf.periciaCodigoTreino);
      if (!entry) {
        throw new PassivaIntelectoPericiaInexistenteException(
          codigoPassiva,
          conf.periciaCodigoTreino,
        );
      }
      entry.grauTreinamento += 1;
      periciasMap.set(conf.periciaCodigoTreino, entry);
    } else {
      throw new PassivaIntelectoTreinoNecessarioException(codigoPassiva);
    }
  };

  if (temIntI) aplicarIntelectoUnitario('INT_I');
  if (temIntII) aplicarIntelectoUnitario('INT_II');

  return {
    profsExtrasFinal: Array.from(profsExtras),
    periciasLivresExtras,
  };
}

export function aplicarIntelectoEmGraus(params: {
  passivasAtivasCodigos: string[];
  passivasConfig: PassivasAtributoConfig | null | undefined;
  graus: { tipoGrauCodigo: string; valor: number }[];
}): { tipoGrauCodigo: string; valor: number }[] {
  const { passivasAtivasCodigos, passivasConfig, graus } = params;

  if (!passivasAtivasCodigos.includes('INT_II')) return graus;

  const cfg = passivasConfig ?? {};
  const conf = cfg.INT_II;
  if (!conf?.tipoGrauCodigoAprimoramento) return graus;

  const alvo = conf.tipoGrauCodigoAprimoramento;

  const idx = graus.findIndex((g) => g.tipoGrauCodigo === alvo);
  if (idx >= 0) {
    const atual = graus[idx].valor;
    const novo = atual + 1;

    if (novo > 5) {
      throw new PassivaIntelectoGrauExcedeMaximoException(alvo, novo, 5);
    }

    const copy = [...graus];
    copy[idx] = { ...copy[idx], valor: novo };
    return copy;
  }

  return [...graus, { tipoGrauCodigo: alvo, valor: 1 }];
}
