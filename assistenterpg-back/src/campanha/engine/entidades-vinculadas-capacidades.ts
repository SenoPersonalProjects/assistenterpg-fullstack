import {
  ModoVinculadoTecnica,
  TipoEntidadeVinculadaPersonagem,
} from '@prisma/client';

export type PapelCalculoVinculado = 'AGIL' | 'FLEXIVEL' | 'TANQUE';

export type ConfigVinculadoNormalizada = {
  id: number;
  tecnicaId: number;
  tecnicaCodigo: string;
  tecnicaNome: string;
  tipoVinculado: TipoEntidadeVinculadaPersonagem;
  modo: ModoVinculadoTecnica;
  limiteCadastro: number | null;
  limiteAtivo: number | null;
  unidadeCadastro: 'QUANTIDADE' | 'VAGAS';
  unidadeAtivo: 'QUANTIDADE' | 'VAGAS';
  permiteCriarNovos: boolean;
  usaTemplates: boolean;
  tipoGrauCodigo: string | null;
  regraCalculo: string | null;
  versaoRegra: string;
};

export type DistribuicaoVinculado = {
  agilidade: number;
  forca: number;
  intelecto: number;
  presenca: number;
  vigor: number;
  luta: number;
  pontaria: number;
  jujutsu: number;
  fortitude: number;
  reflexos: number;
  vontade: number;
  percepcao?: number;
  periciasExtras?: Record<string, number>;
};

type CalcularAutomaticoInput = {
  tipo: TipoEntidadeVinculadaPersonagem;
  nivel: number;
  grau: number;
  maiorAtributoDono: number;
  testeJujutsuDono: number;
  limitePeEaPorTurno: number;
  papel: PapelCalculoVinculado;
  distribuicao: DistribuicaoVinculado;
  motivoRecalculo?: string | null;
};

const VALORES_SHIKIGAMI = [5, 7, 9, 11, 13] as const;
const VALORES_CORPO = [3, 5, 7, 9, 11] as const;
const VALORES_ATAQUE_SHIKIGAMI = [20, 25, 30, 40, 50] as const;
const VALORES_RESISTENCIA_SHIKIGAMI = [20, 25, 30, 40, 50] as const;
const VALORES_RESISTENCIA_CORPO = [12, 20, 25, 30, 35] as const;

export function resolverIndiceFaixaNivel(nivel: number): number {
  if (nivel >= 17) return 4;
  if (nivel >= 13) return 3;
  if (nivel >= 9) return 2;
  if (nivel >= 5) return 1;
  return 0;
}

export function resolverLimiteVagasCorpos(nivel: number): number {
  return resolverIndiceFaixaNivel(nivel) + 1;
}

export function resolverTetoAtributoVinculado(
  nivel: number,
  maiorAtributoDono: number,
): number {
  const tetoNivel = nivel >= 16 ? 7 : nivel >= 13 ? 5 : 3;
  return Math.max(0, Math.min(tetoNivel, maiorAtributoDono));
}

function resolverTetoAtaqueShikigami(nivel: number): number {
  if (nivel >= 16) return 30;
  if (nivel >= 13) return 24;
  if (nivel >= 7) return 18;
  return 12;
}

function resolverTetoResistenciaShikigami(nivel: number): number {
  if (nivel >= 16) return 22;
  if (nivel >= 13) return 18;
  return 13;
}

function resolverTetoResistenciaCorpo(nivel: number): number {
  if (nivel >= 20) return 20;
  if (nivel >= 16) return 18;
  if (nivel >= 13) return 15;
  return 12;
}

function soma(valores: number[]): number {
  return valores.reduce((total, valor) => total + Math.max(0, valor), 0);
}

function saldo(maximo: number, distribuido: number) {
  return {
    pendente: Math.max(0, maximo - distribuido),
    excedente: Math.max(0, distribuido - maximo),
  };
}

function calcularDerivados(input: CalcularAutomaticoInput): {
  pontosVidaMax: number;
  defesa: number;
  rd: number;
} {
  const { agilidade, vigor } = input.distribuicao;
  const teste = Math.max(0, input.testeJujutsuDono);

  if (input.tipo === TipoEntidadeVinculadaPersonagem.SHIKIGAMI) {
    if (input.papel === 'AGIL') {
      return {
        pontosVidaMax: 10 + vigor + (vigor + 2) * input.nivel,
        defesa: 12 + agilidade,
        rd: vigor + Math.floor(teste / 6),
      };
    }
    if (input.papel === 'TANQUE') {
      return {
        pontosVidaMax: 28 + vigor + (vigor + 4) * input.nivel,
        defesa: 8 + agilidade,
        rd: 4 + vigor + Math.floor(teste / 2),
      };
    }
    return {
      pontosVidaMax: 18 + vigor + (vigor + 4) * input.nivel,
      defesa: 10 + agilidade,
      rd: 2 + vigor + Math.floor(teste / 4),
    };
  }

  if (input.papel === 'AGIL') {
    return {
      pontosVidaMax: 8 + vigor + (vigor + 2) * input.nivel,
      defesa: 5 + agilidade,
      rd: vigor + Math.floor(teste / 6),
    };
  }
  if (input.papel === 'TANQUE') {
    return {
      pontosVidaMax: 28 + vigor + (vigor + 4) * input.nivel,
      defesa: 8 + agilidade,
      rd: 4 + vigor + Math.floor(teste / 2),
    };
  }
  return {
    pontosVidaMax: 16 + vigor + (vigor + 3) * input.nivel,
    defesa: 10 + agilidade,
    rd: 2 + vigor + Math.floor(teste / 4),
  };
}

export function calcularFichaAutomaticaVinculado(
  input: CalcularAutomaticoInput,
) {
  const indice = resolverIndiceFaixaNivel(input.nivel);
  const ehShikigami = input.tipo === TipoEntidadeVinculadaPersonagem.SHIKIGAMI;
  const atributosMax =
    (ehShikigami ? VALORES_SHIKIGAMI[indice] : VALORES_CORPO[indice]) +
    input.grau;
  const ataquesMax = ehShikigami
    ? VALORES_ATAQUE_SHIKIGAMI[indice] + input.grau * 5
    : 0;
  const resistenciasMax =
    (ehShikigami
      ? VALORES_RESISTENCIA_SHIKIGAMI[indice]
      : VALORES_RESISTENCIA_CORPO[indice]) +
    input.grau * 5;
  const atributosDistribuidos = soma([
    input.distribuicao.agilidade,
    input.distribuicao.forca,
    input.distribuicao.intelecto,
    input.distribuicao.presenca,
    input.distribuicao.vigor,
  ]);
  const ataquesDistribuidos = ehShikigami
    ? soma([
        input.distribuicao.luta,
        input.distribuicao.pontaria,
        input.distribuicao.jujutsu,
        input.distribuicao.percepcao ?? 0,
        ...Object.entries(input.distribuicao.periciasExtras ?? {})
          .filter(([codigo]) => !['PONTARIA', 'PERCEPCAO'].includes(codigo.trim().toUpperCase()))
          .map(([, valor]) => valor),
      ])
    : 0;
  const resistenciasDistribuidas = soma([
    input.distribuicao.fortitude,
    input.distribuicao.reflexos,
    input.distribuicao.vontade,
  ]);
  const atributosSaldo = saldo(atributosMax, atributosDistribuidos);
  const ataquesSaldo = saldo(ataquesMax, ataquesDistribuidos);
  const resistenciasSaldo = saldo(resistenciasMax, resistenciasDistribuidas);
  const derivados = calcularDerivados(input);

  return {
    ativo: true,
    versaoRegra: '1.0.0',
    motivoRecalculo: input.motivoRecalculo ?? null,
    nivelReferencia: input.nivel,
    grauReferencia: input.grau,
    papel: input.papel,
    personagemSnapshot: {
      nivel: input.nivel,
      maiorAtributo: input.maiorAtributoDono,
      testeJujutsu: input.testeJujutsuDono,
      limitePeEaPorTurno: input.limitePeEaPorTurno,
    },
    pools: {
      atributosMax,
      atributosDistribuidos,
      ataquesMax,
      ataquesDistribuidos,
      resistenciasMax,
      resistenciasDistribuidas,
      tetoAtributo: resolverTetoAtributoVinculado(
        input.nivel,
        input.maiorAtributoDono,
      ),
      tetoAtaque: ehShikigami ? resolverTetoAtaqueShikigami(input.nivel) : null,
      tetoResistencia: ehShikigami
        ? resolverTetoResistenciaShikigami(input.nivel)
        : resolverTetoResistenciaCorpo(input.nivel),
    },
    pendencias: {
      atributos: atributosSaldo.pendente,
      ataques: ataquesSaldo.pendente,
      resistencias: resistenciasSaldo.pendente,
    },
    excedentes: {
      atributos: atributosSaldo.excedente,
      ataques: ataquesSaldo.excedente,
      resistencias: resistenciasSaldo.excedente,
    },
    derivados,
    cargasSugeridas:
      input.tipo === TipoEntidadeVinculadaPersonagem.CORPO_AMALDICOADO
        ? Math.max(0, input.limitePeEaPorTurno)
        : null,
  };
}

function registro(valor: unknown): Record<string, unknown> {
  return valor && typeof valor === 'object' && !Array.isArray(valor)
    ? (valor as Record<string, unknown>)
    : {};
}

function lerLimite(
  limitesJson: unknown,
  chave: 'cadastro' | 'ativo',
  nivel: number,
): { valor: number | null; unidade: 'QUANTIDADE' | 'VAGAS' } {
  const limite = registro(registro(limitesJson)[chave]);
  if (limite.tipo === 'ILIMITADO') {
    return { valor: null, unidade: 'QUANTIDADE' };
  }
  if (limite.tipo === 'VAGAS_POR_NIVEL') {
    return { valor: resolverLimiteVagasCorpos(nivel), unidade: 'VAGAS' };
  }
  const valor = Number(limite.valor);
  return {
    valor: Number.isFinite(valor) ? Math.max(0, Math.floor(valor)) : 0,
    unidade: 'QUANTIDADE',
  };
}

export function normalizarConfigVinculado(
  config: {
    id: number;
    tecnicaId: number;
    tipoVinculado: TipoEntidadeVinculadaPersonagem;
    modo: ModoVinculadoTecnica;
    limitesJson: unknown;
    regrasJson: unknown;
    calculoJson: unknown;
    tecnica: { codigo: string; nome: string };
  },
  nivel: number,
): ConfigVinculadoNormalizada {
  const regras = registro(config.regrasJson);
  const calculo = registro(config.calculoJson);
  const cadastro = lerLimite(config.limitesJson, 'cadastro', nivel);
  const ativo = lerLimite(config.limitesJson, 'ativo', nivel);
  return {
    id: config.id,
    tecnicaId: config.tecnicaId,
    tecnicaCodigo: config.tecnica.codigo,
    tecnicaNome: config.tecnica.nome,
    tipoVinculado: config.tipoVinculado,
    modo: config.modo,
    limiteCadastro: cadastro.valor,
    limiteAtivo: ativo.valor,
    unidadeCadastro: cadastro.unidade,
    unidadeAtivo: ativo.unidade,
    permiteCriarNovos:
      regras.permiteCriarNovos === true ||
      config.modo === ModoVinculadoTecnica.CRIAVEL ||
      config.modo === ModoVinculadoTecnica.HIBRIDO,
    usaTemplates:
      regras.usaTemplates === true ||
      config.modo === ModoVinculadoTecnica.PREDEFINIDOS ||
      config.modo === ModoVinculadoTecnica.HIBRIDO,
    tipoGrauCodigo:
      typeof regras.tipoGrauCodigo === 'string' ? regras.tipoGrauCodigo : null,
    regraCalculo: typeof calculo.regra === 'string' ? calculo.regra : null,
    versaoRegra: typeof calculo.versao === 'string' ? calculo.versao : '1.0.0',
  };
}

export function lerPontariaVinculado(periciasEspeciais: unknown): number {
  const valor = registro(periciasEspeciais).pontaria;
  return typeof valor === 'number' && Number.isFinite(valor)
    ? Math.max(0, Math.floor(valor))
    : 0;
}
