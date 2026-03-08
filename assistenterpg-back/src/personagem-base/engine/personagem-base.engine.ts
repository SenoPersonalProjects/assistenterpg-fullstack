// src/personagem-base/engine/personagem-base.engine.ts

// ✅ IMPORTS ATUALIZADOS
import { AtributoBaseEA, Prisma } from '@prisma/client';
import {
  CreatePersonagemBaseDto,
  PassivaIntelectoConfigDto,
} from '../dto/create-personagem-base.dto';

import {
  aplicarRegrasDeGraus,
  calcularGrausLivresExtras,
  calcularGrausLivresMax,
  HabilidadePersonagem,
  MecanicasEspeciaisHabilidade,
} from '../regras-criacao/regras-graus-aprimoramento';

import {
  aplicarEfeitosPassivasIntelectoEmPericiasEProficiencias,
  aplicarIntelectoEmGraus,
  resolverPassivasAtributos,
  validarAtributos,
} from '../regras-criacao/regras-atributos';

import { validarOrigemClaTecnica } from '../regras-criacao/regras-origem-cla';
import { validarTrilhaECaminho } from '../regras-criacao/regras-trilha';
import { montarPericiasPersonagem } from '../regras-criacao/regras-pericias';

import {
  aplicarGrausTreinamento,
  validarGrausTreinamento,
} from '../regras-criacao/regras-graus-treinamento';

import { validarPoderesGenericos } from '../regras-criacao/regras-poderes';

import {
  aplicarEfeitosPoderesEmGraus,
  aplicarEfeitosPoderesEmPericias,
  extrairProficienciasDeHabilidades,
  extrairResistenciasDeHabilidades,
} from '../regras-criacao/regras-poderes-efeitos';

import {
  calcularAtributosDerivados,
  calcularBloqueioEsquiva,
} from '../regras-criacao/regras-derivados';

import {
  EngineParams,
  EngineResult,
  HabilidadeComEfeitos,
  ModDerivados,
  PericiaState,
  PrismaLike,
  ItemInventarioCalculado,
} from './personagem-base.engine.types';

// ✅ NOVO: Importar exceções customizadas
import {
  AtributoChaveEaInvalidoException,
  PericiasLivresExcedemLimiteException,
  GrausAprimoramentoExcedemTotalException,
} from 'src/common/exceptions/personagem.exception';

type BuscarHabilidadesFn = (
  params: {
    nivel: number;
    origemId: number;
    classeId: number;
    trilhaId?: number | null;
    caminhoId?: number | null;
    tecnicaInataId?: number | null;
    estudouEscolaTecnica: boolean;
    poderesGenericos?: PoderGenericoNormalizado[];
  },
  prisma: PrismaLike,
) => Promise<HabilidadeComEfeitos>;

type CalcularModsDerivadosFn = (
  habilidades: HabilidadeComEfeitos,
  nivel: number,
) => ModDerivados;

type PoderGenericoEntrada = { habilidadeId: number; config?: Prisma.JsonValue };
type PoderGenericoNormalizado = {
  habilidadeId: number;
  config: Prisma.JsonValue;
};
type DtoNormalizado = CreatePersonagemBaseDto & {
  poderesGenericos?: PoderGenericoNormalizado[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getNestedRecord(
  value: Record<string, unknown> | null | undefined,
  key: string,
): Record<string, unknown> | null {
  if (!value) return null;
  const nested = value[key];
  return isRecord(nested) ? nested : null;
}

function getNumberField(
  value: Record<string, unknown> | null | undefined,
  key: string,
): number | null {
  if (!value) return null;
  const current = value[key];
  return typeof current === 'number' ? current : null;
}

// ✅ REFATORADO: Usar exceção customizada
function validarAtributoChaveEa(
  valor: unknown,
): asserts valor is AtributoBaseEA {
  const valoresValidos = Object.values(AtributoBaseEA) as string[];
  if (typeof valor !== 'string' || !valoresValidos.includes(valor)) {
    throw new AtributoChaveEaInvalidoException(valor, valoresValidos);
  }
}

function normalizePoderesGenericos(
  poderes: PoderGenericoEntrada[] | undefined,
): PoderGenericoNormalizado[] {
  return (poderes ?? []).map((inst) => ({
    habilidadeId: inst.habilidadeId,
    config: inst.config ?? {},
  }));
}

function limparUndefinedDeepJson<T>(value: T | undefined): T | undefined {
  if (value === undefined) return undefined;
  const normalized: unknown = JSON.parse(JSON.stringify(value));
  return normalized as T;
}

function getLegacyInt2Config(value: unknown): PassivaIntelectoConfigDto | null {
  if (!isRecord(value)) return null;

  const candidates = [value.INTII, value.INT_II, value.INTII_];
  for (const candidate of candidates) {
    if (!isRecord(candidate)) continue;
    const tipoGrauCodigoAprimoramento = candidate.tipoGrauCodigoAprimoramento;
    const periciaCodigoTreino = candidate.periciaCodigoTreino;
    const periciasCodigos = candidate.periciasCodigos;
    const proficienciasCodigos = candidate.proficienciasCodigos;

    return {
      tipoGrauCodigoAprimoramento:
        typeof tipoGrauCodigoAprimoramento === 'string'
          ? tipoGrauCodigoAprimoramento
          : undefined,
      periciaCodigoTreino:
        typeof periciaCodigoTreino === 'string'
          ? periciaCodigoTreino
          : undefined,
      periciasCodigos:
        Array.isArray(periciasCodigos) &&
        periciasCodigos.every((v) => typeof v === 'string')
          ? periciasCodigos
          : undefined,
      proficienciasCodigos:
        Array.isArray(proficienciasCodigos) &&
        proficienciasCodigos.every((v) => typeof v === 'string')
          ? proficienciasCodigos
          : undefined,
    };
  }

  return null;
}

function calcularModificadoresDerivadosPorHabilidadesLocal(
  habilidades: HabilidadeComEfeitos,
  nivel: number,
): ModDerivados {
  const mods: ModDerivados = {
    pvPorNivelExtra: 0,
    peBaseExtra: 0,
    limitePeEaExtra: 0,
    defesaExtra: 0,
    espacosInventarioExtra: 0,
  };

  for (const h of habilidades) {
    const mecanicas = isRecord(h.habilidade.mecanicasEspeciais)
      ? h.habilidade.mecanicasEspeciais
      : null;
    const recursos = getNestedRecord(mecanicas, 'recursos');
    const defesa = getNestedRecord(mecanicas, 'defesa');
    const inventario = getNestedRecord(mecanicas, 'inventario');
    const pvPorNivel = getNumberField(mecanicas, 'pvPorNivel');
    const peBase = getNumberField(recursos, 'peBase');
    const pePorNivelImpar = getNumberField(recursos, 'pePorNivelImpar');
    const limitePePorTurnoBonus = getNumberField(
      recursos,
      'limitePePorTurnoBonus',
    );
    const defesaBonus = getNumberField(defesa, 'bonus');
    const espacosExtra = getNumberField(inventario, 'espacosExtra');

    if (pvPorNivel !== null) {
      mods.pvPorNivelExtra += pvPorNivel;
    }

    if (peBase !== null) {
      mods.peBaseExtra += peBase;
    }

    if (pePorNivelImpar !== null) {
      const niveisImpares = Math.ceil(nivel / 2);
      mods.peBaseExtra += pePorNivelImpar * niveisImpares;
    }

    if (limitePePorTurnoBonus !== null) {
      mods.limitePeEaExtra += limitePePorTurnoBonus;
    }

    if (defesaBonus !== null) {
      mods.defesaExtra += defesaBonus;
    }

    if (espacosExtra !== null) {
      mods.espacosInventarioExtra += espacosExtra;
    }
  }

  return mods;
}

function toEscalonamentoPorNivel(
  value: Prisma.JsonValue | null,
): { niveis: number[] } | null {
  if (!isRecord(value)) return null;
  const niveis = value.niveis;
  if (!Array.isArray(niveis) || niveis.some((n) => typeof n !== 'number')) {
    return null;
  }
  return { niveis: niveis as number[] };
}

function toMecanicasEspeciaisHabilidade(
  value: Prisma.JsonValue | null | undefined,
): MecanicasEspeciaisHabilidade | null {
  if (!isRecord(value)) return null;
  return value as unknown as MecanicasEspeciaisHabilidade;
}

function normalizarHabilidadesParaGraus(
  habilidades: HabilidadeComEfeitos,
): HabilidadePersonagem[] {
  return habilidades.map((h) => ({
    habilidadeId: h.habilidadeId,
    habilidade: {
      nome: h.habilidade.nome,
      tipo: h.habilidade.tipo,
      mecanicasEspeciais: toMecanicasEspeciaisHabilidade(
        h.habilidade.mecanicasEspeciais,
      ),
      efeitosGrau: (h.habilidade.efeitosGrau ?? []).map((efeito) => ({
        tipoGrauCodigo: efeito.tipoGrauCodigo,
        valor: efeito.valor,
        escalonamentoPorNivel: toEscalonamentoPorNivel(
          efeito.escalonamentoPorNivel,
        ),
      })),
    },
  }));
}

export async function calcularEstadoFinalPersonagemBase(
  params: EngineParams & {
    prisma: PrismaLike;
    buscarHabilidadesPersonagem: BuscarHabilidadesFn;
    calcularModsDerivadosPorHabilidades?: CalcularModsDerivadosFn;
    itensInventarioCalculados?: ItemInventarioCalculado[];
  },
): Promise<EngineResult> {
  const {
    dto: dtoIn,
    strictPassivas,
    prisma,
    personagemBaseId,
    itensInventarioCalculados,
  } = params;

  const poderesGenericosNormalizados = normalizePoderesGenericos(
    dtoIn.poderesGenericos,
  );
  const passivasAtributosConfigLimpo = limparUndefinedDeepJson(
    dtoIn.passivasAtributosConfig,
  );

  const dtoNormalizado: DtoNormalizado = {
    ...dtoIn,
    poderesGenericos: poderesGenericosNormalizados,
    passivasAtributosConfig: passivasAtributosConfigLimpo,
  };

  validarAtributoChaveEa(dtoNormalizado.atributoChaveEa);

  validarAtributos({
    nivel: dtoNormalizado.nivel,
    agilidade: dtoNormalizado.agilidade,
    forca: dtoNormalizado.forca,
    intelecto: dtoNormalizado.intelecto,
    presenca: dtoNormalizado.presenca,
    vigor: dtoNormalizado.vigor,
  });

  await validarOrigemClaTecnica(
    dtoNormalizado.claId,
    dtoNormalizado.origemId,
    dtoNormalizado.tecnicaInataId,
    prisma,
  );

  // 1) Perícias base
  const periciasCalculadas = await montarPericiasPersonagem(
    dtoNormalizado,
    prisma,
  );

  const todasPericias = await prisma.pericia.findMany();
  const mapaPericiasPorId = new Map(
    todasPericias.map((p) => [p.id, p] as const),
  );
  const periciasMapCodigo = new Map<string, PericiaState>();
  for (const p of periciasCalculadas) {
    const pericia = mapaPericiasPorId.get(p.periciaId);
    if (!pericia) continue;

    periciasMapCodigo.set(pericia.codigo, {
      grauTreinamento: p.grauTreinamento,
      periciaId: p.periciaId,
      bonusExtra: p.bonusExtra,
    });
  }

  // 2) Poderes alterando perícias
  await aplicarEfeitosPoderesEmPericias(
    {
      nivel: dtoNormalizado.nivel,
      poderes: poderesGenericosNormalizados,
      periciasMap: periciasMapCodigo,
    },
    prisma,
  );

  // 3) Passivas
  const passivasResolvidas = await resolverPassivasAtributos({
    atributos: {
      agilidade: dtoNormalizado.agilidade,
      forca: dtoNormalizado.forca,
      intelecto: dtoNormalizado.intelecto,
      presenca: dtoNormalizado.presenca,
      vigor: dtoNormalizado.vigor,
    },
    passivasAtributosAtivos: dtoNormalizado.passivasAtributosAtivos,
    strict: strictPassivas,
    prisma,
  });

  const passivasCodigosAtivos = passivasResolvidas.passivaCodigos ?? [];

  // 3.1) Intelecto (extras em pericias/profs e periciasLivresExtras)
  const profsPayloadCodigos = dtoNormalizado.proficienciasCodigos ?? [];
  const { profsExtrasFinal: profsExtrasDeIntelecto, periciasLivresExtras } =
    aplicarEfeitosPassivasIntelectoEmPericiasEProficiencias({
      passivasAtivasCodigos: passivasCodigosAtivos,
      passivasConfig: dtoNormalizado.passivasAtributosConfig,
      periciasMap: periciasMapCodigo,
      profsExtrasPayload: profsPayloadCodigos,
    });

  // 3.2) Validar limite de perícias livres
  const classe = await prisma.classe.findUnique({
    where: { id: dtoNormalizado.classeId },
  });
  const periciasLivres = dtoNormalizado.periciasLivresCodigos ?? [];

  const maxLivresBase =
    (classe?.periciasLivresBase ?? 0) + dtoNormalizado.intelecto;
  const maxLivresTotal = maxLivresBase + periciasLivresExtras;

  // ✅ REFATORADO: Usar exceção customizada
  if (periciasLivres.length > maxLivresTotal) {
    throw new PericiasLivresExcedemLimiteException(
      periciasLivres.length,
      maxLivresTotal,
      {
        maxBase: maxLivresBase,
        deIntelecto: periciasLivresExtras,
      },
    );
  }

  // 4) Graus de treinamento
  await validarGrausTreinamento(
    dtoNormalizado.nivel,
    dtoNormalizado.intelecto,
    dtoNormalizado.grausTreinamento,
    periciasMapCodigo,
    prisma,
  );

  aplicarGrausTreinamento(dtoNormalizado.grausTreinamento, periciasMapCodigo);

  const periciasComCodigo = Array.from(periciasMapCodigo.entries()).map(
    ([codigo, p]) => ({
      codigo,
      grauTreinamento: p.grauTreinamento,
    }),
  );

  // 4.1) Validar trilha/caminho com perícias finais
  await validarTrilhaECaminho(
    dtoNormalizado.classeId,
    dtoNormalizado.trilhaId,
    dtoNormalizado.caminhoId,
    periciasComCodigo,
    prisma,
  );

  // 5) Habilidades
  const habilidades = await params.buscarHabilidadesPersonagem(
    {
      nivel: dtoNormalizado.nivel,
      origemId: dtoNormalizado.origemId,
      classeId: dtoNormalizado.classeId,
      trilhaId: dtoNormalizado.trilhaId,
      caminhoId: dtoNormalizado.caminhoId,
      tecnicaInataId: dtoNormalizado.tecnicaInataId,
      estudouEscolaTecnica: dtoNormalizado.estudouEscolaTecnica,
      poderesGenericos: poderesGenericosNormalizados,
    },
    prisma,
  );

  const habilidadesParaPersistir = habilidades
    .filter((h) => h.habilidade?.tipo !== 'PODER_GENERICO')
    .map((h) => ({ habilidadeId: h.habilidadeId }));
  const habilidadesParaGraus = normalizarHabilidadesParaGraus(habilidades);

  // 5.1) Profs de habilidades
  const profsDeHabilidades = await extrairProficienciasDeHabilidades(
    habilidades,
    prisma,
  );

  // 6) Graus de aprimoramento
  const grausUsuario = dtoNormalizado.grausAprimoramento ?? [];
  const pontosUsuario = grausUsuario.reduce(
    (acc: number, g) => acc + (g.valor || 0),
    0,
  );

  const baseLivres = calcularGrausLivresMax(dtoNormalizado.nivel);
  const extrasLivres = calcularGrausLivresExtras(
    habilidadesParaGraus,
    dtoNormalizado.nivel,
    dtoNormalizado.passivasAtributosConfig,
  );
  const maxTotalLivres = baseLivres + extrasLivres.totalExtras;

  // ✅ REFATORADO: Usar exceção customizada
  if (pontosUsuario > maxTotalLivres) {
    throw new GrausAprimoramentoExcedemTotalException(
      dtoNormalizado.nivel,
      pontosUsuario,
      maxTotalLivres,
      {
        base: baseLivres,
        extras: extrasLivres.totalExtras,
      },
    );
  }

  const grausComPoderes = await aplicarEfeitosPoderesEmGraus(
    { poderes: poderesGenericosNormalizados, grausLivres: grausUsuario },
    prisma,
  );

  const grausComIntelecto = aplicarIntelectoEmGraus({
    passivasAtivasCodigos: passivasCodigosAtivos,
    passivasConfig: dtoNormalizado.passivasAtributosConfig,
    graus: grausComPoderes ?? [],
  });

  // 7) Validar poderes
  if ((poderesGenericosNormalizados?.length ?? 0) > 0) {
    await validarPoderesGenericos(
      {
        nivel: dtoNormalizado.nivel,
        poderes: poderesGenericosNormalizados,
        pericias: periciasComCodigo,
        atributos: {
          agilidade: dtoNormalizado.agilidade,
          forca: dtoNormalizado.forca,
          intelecto: dtoNormalizado.intelecto,
          presenca: dtoNormalizado.presenca,
          vigor: dtoNormalizado.vigor,
        },
        graus: grausComIntelecto ?? [],
      },
      prisma,
    );
  }

  // 8) Regras de graus
  const grausFinais = aplicarRegrasDeGraus(
    {
      nivel: dtoNormalizado.nivel,
      habilidades: habilidadesParaGraus,
      poderes: poderesGenericosNormalizados,
      passivasAtributosConfig: dtoNormalizado.passivasAtributosConfig,
    },
    grausComIntelecto,
  );

  // 9) Profs finais (classe + habilidades + intelecto)
  const profsClasse = await prisma.classeProficiencia.findMany({
    where: { classeId: dtoNormalizado.classeId },
    include: { proficiencia: true },
  });
  const profsClasseCodigos = profsClasse.map((cp) => cp.proficiencia.codigo);

  const profsFinais = Array.from(
    new Set([
      ...profsClasseCodigos,
      ...profsDeHabilidades,
      ...profsExtrasDeIntelecto,
    ]),
  );

  // 10) Derivados
  const derivadosBase = await calcularAtributosDerivados(
    {
      nivel: dtoNormalizado.nivel,
      classeId: dtoNormalizado.classeId,
      agilidade: dtoNormalizado.agilidade,
      forca: dtoNormalizado.forca,
      intelecto: dtoNormalizado.intelecto,
      presenca: dtoNormalizado.presenca,
      vigor: dtoNormalizado.vigor,
      atributoChaveEa: dtoNormalizado.atributoChaveEa,
      passivasAtributoIds: passivasResolvidas.passivaIds,
    },
    prisma,
  );

  const calcMods =
    params.calcularModsDerivadosPorHabilidades ??
    calcularModificadoresDerivadosPorHabilidadesLocal;
  const mods = calcMods(habilidades, dtoNormalizado.nivel);

  // 11) RESISTÊNCIAS E EQUIPAMENTOS
  const resistenciasDeHabilidades =
    extrairResistenciasDeHabilidades(habilidades);

  let defesaEquipamento = 0;
  const resistenciasDeEquipamentos = new Map<string, number>();

  if (personagemBaseId) {
    const personagemComResistencias = await prisma.personagemBase.findUnique({
      where: { id: personagemBaseId },
      select: {
        defesaEquipamento: true,
        resistencias: {
          include: {
            resistenciaTipo: true,
          },
        },
      },
    });

    if (personagemComResistencias) {
      defesaEquipamento = personagemComResistencias.defesaEquipamento || 0;

      personagemComResistencias.resistencias.forEach((r) => {
        resistenciasDeEquipamentos.set(r.resistenciaTipo.codigo, r.valor);
      });
    }
  }

  // Consolidar resistências (somar habilidades + equipamentos)
  const resistenciasFinais = new Map<string, number>();

  for (const [codigo, valor] of resistenciasDeHabilidades.entries()) {
    resistenciasFinais.set(
      codigo,
      (resistenciasFinais.get(codigo) || 0) + valor,
    );
  }

  for (const [codigo, valor] of resistenciasDeEquipamentos.entries()) {
    resistenciasFinais.set(
      codigo,
      (resistenciasFinais.get(codigo) || 0) + valor,
    );
  }

  // Derivados finais (agora com defesa separada)
  const defesaBase = derivadosBase.defesa + mods.defesaExtra;

  const derivadosFinais = {
    ...derivadosBase,
    pvMaximo:
      derivadosBase.pvMaximo + mods.pvPorNivelExtra * dtoNormalizado.nivel,
    peMaximo: derivadosBase.peMaximo + mods.peBaseExtra,
    limitePeEaPorTurno: derivadosBase.limitePeEaPorTurno + mods.limitePeEaExtra,
    defesaBase,
    defesaEquipamento,
    defesaTotal: defesaBase + defesaEquipamento,
  };

  // Recalcular bloqueio e esquiva com perícias finais
  const { bloqueio, esquiva } = calcularBloqueioEsquiva({
    defesa: derivadosFinais.defesaTotal,
    periciasMap: periciasMapCodigo,
  });

  derivadosFinais.bloqueio = bloqueio;
  derivadosFinais.esquiva = esquiva;

  // Calcular espaços de inventário
  const espacosInventarioBase = dtoNormalizado.forca * 5;
  const espacosInventarioExtra = mods.espacosInventarioExtra;
  const espacosInventarioTotal = espacosInventarioBase + espacosInventarioExtra;

  // Helpers p/ preview: bônus por habilidade
  const bonusHabilidades = habilidades.flatMap((h) =>
    (h.habilidade.efeitosGrau ?? []).map((efeito) => ({
      habilidadeNome: h.habilidade.nome,
      tipoGrauCodigo: efeito.tipoGrauCodigo,
      valor: efeito.valor,
      escalonamentoPorNivel: efeito.escalonamentoPorNivel,
    })),
  );

  const cfgInt2 =
    dtoNormalizado.passivasAtributosConfig?.INT_II ??
    getLegacyInt2Config(dtoNormalizado.passivasAtributosConfig);
  const tipoGrauCodigoAprimoramento = cfgInt2?.tipoGrauCodigoAprimoramento;

  if (typeof tipoGrauCodigoAprimoramento === 'string') {
    bonusHabilidades.push({
      habilidadeNome: 'Intelecto II',
      tipoGrauCodigo: tipoGrauCodigoAprimoramento,
      valor: 1,
      escalonamentoPorNivel: null,
    });
  }

  return {
    dtoNormalizado,
    passivasResolvidas,
    passivasAtributosConfigLimpo: passivasAtributosConfigLimpo ?? null,
    poderesGenericosNormalizados,

    periciasMapCodigo,
    periciasComCodigo,

    habilidades,
    habilidadesParaPersistir,

    profsFinais,
    grausFinais,
    grausTreinamento: dtoNormalizado.grausTreinamento,

    derivadosFinais,

    espacosInventario: {
      base: espacosInventarioBase,
      extra: espacosInventarioExtra,
      total: espacosInventarioTotal,
    },

    resistenciasFinais,
    resistenciasDetalhadas: {
      deEquipamentos: resistenciasDeEquipamentos,
      deHabilidades: resistenciasDeHabilidades,
    },

    itensInventarioCalculados,

    bonusHabilidades,

    grausLivresInfo: {
      base: baseLivres,
      deHabilidades: extrasLivres.deHabilidades,
      deIntelecto: extrasLivres.deIntelecto,
      total: maxTotalLivres,
      gastos: pontosUsuario,
    },

    periciasLivresInfo: {
      base: maxLivresBase,
      deIntelecto: periciasLivresExtras,
      total: maxLivresTotal,
    },
  };
}
