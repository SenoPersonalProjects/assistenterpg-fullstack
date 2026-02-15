// src/personagem-base/engine/personagem-base.engine.ts

// ✅ IMPORTS ATUALIZADOS
import { AtributoBaseEA } from '@prisma/client';

import {
  aplicarRegrasDeGraus,
  calcularGrausLivresExtras,
  calcularGrausLivresMax,
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
    poderesGenericos?: Array<{ habilidadeId: number; config?: any }>;
  },
  prisma: PrismaLike,
) => Promise<HabilidadeComEfeitos>;

type CalcularModsDerivadosFn = (
  habilidades: Array<{ habilidade: { nome: string; mecanicasEspeciais?: any } }>,
  nivel: number,
) => ModDerivados;

function limparUndefined<T extends Record<string, any>>(obj: T): T {
  const out: any = { ...obj };
  for (const k of Object.keys(out)) {
    if (out[k] === undefined) delete out[k];
  }
  return out;
}

// ✅ REFATORADO: Usar exceção customizada
function validarAtributoChaveEa(valor: unknown): asserts valor is AtributoBaseEA {
  const valoresValidos = Object.values(AtributoBaseEA) as string[];
  if (typeof valor !== 'string' || !valoresValidos.includes(valor)) {
    throw new AtributoChaveEaInvalidoException(valor, valoresValidos);
  }
}

function normalizePoderesGenericos(
  poderes: Array<{ habilidadeId: number; config?: any }> | undefined,
): Array<{ habilidadeId: number; config: any }> {
  return (poderes ?? []).map((inst: any) => ({
    ...inst,
    config: inst?.config ?? {},
  }));
}

function limparUndefinedDeepJson<T>(value: T | undefined): T | undefined {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function calcularModificadoresDerivadosPorHabilidadesLocal(
  habilidades: Array<{ habilidade: { nome: string; mecanicasEspeciais?: any } }>,
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
    const m = h.habilidade.mecanicasEspeciais as any;

    if (m?.pvPorNivel && typeof m.pvPorNivel === 'number') {
      mods.pvPorNivelExtra += m.pvPorNivel;
    }

    if (m?.recursos) {
      if (typeof m.recursos.peBase === 'number') {
        mods.peBaseExtra += m.recursos.peBase;
      }

      if (typeof m.recursos.pePorNivelImpar === 'number') {
        const niveisImpares = Math.ceil(nivel / 2);
        mods.peBaseExtra += m.recursos.pePorNivelImpar * niveisImpares;
      }

      if (typeof m.recursos.limitePePorTurnoBonus === 'number') {
        mods.limitePeEaExtra += m.recursos.limitePePorTurnoBonus;
      }
    }

    if (m?.defesa?.bonus && typeof m.defesa.bonus === 'number') {
      mods.defesaExtra += m.defesa.bonus;
    }

    if (m?.inventario?.espacosExtra && typeof m.inventario.espacosExtra === 'number') {
      mods.espacosInventarioExtra += m.inventario.espacosExtra;
    }
  }

  return mods;
}

export async function calcularEstadoFinalPersonagemBase(
  params: EngineParams & {
    prisma: PrismaLike;
    buscarHabilidadesPersonagem: BuscarHabilidadesFn;
    calcularModsDerivadosPorHabilidades?: CalcularModsDerivadosFn;
    itensInventarioCalculados?: ItemInventarioCalculado[];
  },
): Promise<EngineResult> {
  const { dto: dtoIn, strictPassivas, prisma, personagemBaseId, itensInventarioCalculados } = params;

  const poderesGenericosNormalizados = normalizePoderesGenericos(dtoIn.poderesGenericos as any);
  const passivasAtributosConfigLimpo = limparUndefinedDeepJson(dtoIn.passivasAtributosConfig as any);

  const dtoNormalizado: any = {
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
    prisma as any,
  );

  // 1) Perícias base
  const periciasCalculadas = await montarPericiasPersonagem(dtoNormalizado, prisma as any);

  const todasPericias = await prisma.pericia.findMany();
  const mapaPericiasPorId = new Map(todasPericias.map((p) => [p.id, p] as const));
  const mapaPericiasPorCodigo = new Map(todasPericias.map((p) => [p.codigo, p] as const));

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
    prisma as any,
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
    prisma: prisma as any,
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
  const classe = await prisma.classe.findUnique({ where: { id: dtoNormalizado.classeId } });
  const periciasLivres = dtoNormalizado.periciasLivresCodigos ?? [];

  const maxLivresBase = (classe?.periciasLivresBase ?? 0) + dtoNormalizado.intelecto;
  const maxLivresTotal = maxLivresBase + periciasLivresExtras;

  // ✅ REFATORADO: Usar exceção customizada
  if (periciasLivres.length > maxLivresTotal) {
    throw new PericiasLivresExcedemLimiteException(periciasLivres.length, maxLivresTotal, {
      maxBase: maxLivresBase,
      deIntelecto: periciasLivresExtras,
    });
  }

  // 4) Graus de treinamento
  await validarGrausTreinamento(
    dtoNormalizado.nivel,
    dtoNormalizado.intelecto,
    dtoNormalizado.grausTreinamento,
    periciasMapCodigo,
    prisma as any,
  );

  aplicarGrausTreinamento(dtoNormalizado.grausTreinamento, periciasMapCodigo);

  const periciasComCodigo = Array.from(periciasMapCodigo.entries()).map(([codigo, p]) => ({
    codigo,
    grauTreinamento: p.grauTreinamento,
  }));

  // 4.1) Validar trilha/caminho com perícias finais
  await validarTrilhaECaminho(
    dtoNormalizado.classeId,
    dtoNormalizado.trilhaId,
    dtoNormalizado.caminhoId,
    periciasComCodigo,
    prisma as any,
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
    prisma as any,
  );

  const habilidadesParaPersistir = habilidades
    .filter((h) => h.habilidade?.tipo !== 'PODER_GENERICO')
    .map((h) => ({ habilidadeId: h.habilidadeId }));

  // 5.1) Profs de habilidades
  const profsDeHabilidades = await extrairProficienciasDeHabilidades(habilidades as any, prisma as any);

  // 6) Graus de aprimoramento
  const grausUsuario = dtoNormalizado.grausAprimoramento ?? [];
  const pontosUsuario = grausUsuario.reduce((acc: number, g: any) => acc + (g.valor || 0), 0);

  const baseLivres = calcularGrausLivresMax(dtoNormalizado.nivel);
  const extrasLivres = calcularGrausLivresExtras(
    habilidades as any,
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
    prisma as any,
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
        poderes: poderesGenericosNormalizados as any,
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
      prisma as any,
    );
  }

  // 8) Regras de graus
  const grausFinais = await aplicarRegrasDeGraus(
    {
      nivel: dtoNormalizado.nivel,
      habilidades,
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
    new Set([...profsClasseCodigos, ...profsDeHabilidades, ...profsExtrasDeIntelecto]),
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
    prisma as any,
  );

  const calcMods = params.calcularModsDerivadosPorHabilidades ?? calcularModificadoresDerivadosPorHabilidadesLocal;
  const mods = calcMods(habilidades as any, dtoNormalizado.nivel);

  // 11) RESISTÊNCIAS E EQUIPAMENTOS
  const resistenciasDeHabilidades = extrairResistenciasDeHabilidades(habilidades as any);

  let defesaEquipamento = 0;
  let resistenciasDeEquipamentos = new Map<string, number>();

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
    resistenciasFinais.set(codigo, (resistenciasFinais.get(codigo) || 0) + valor);
  }

  for (const [codigo, valor] of resistenciasDeEquipamentos.entries()) {
    resistenciasFinais.set(codigo, (resistenciasFinais.get(codigo) || 0) + valor);
  }

  // Derivados finais (agora com defesa separada)
  const defesaBase = derivadosBase.defesa + mods.defesaExtra;

  const derivadosFinais = {
    ...derivadosBase,
    pvMaximo: derivadosBase.pvMaximo + mods.pvPorNivelExtra * dtoNormalizado.nivel,
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

  const cfg: any = dtoNormalizado.passivasAtributosConfig ?? {};
  const cfgInt2 = cfg.INTII ?? cfg.INT_II ?? cfg.INTII_ ?? undefined;

  if (cfgInt2?.tipoGrauCodigoAprimoramento) {
    bonusHabilidades.push({
      habilidadeNome: 'Intelecto II',
      tipoGrauCodigo: cfgInt2.tipoGrauCodigoAprimoramento,
      valor: 1,
      escalonamentoPorNivel: null,
    });
  }

  return {
    dtoNormalizado: limparUndefined(dtoNormalizado),
    passivasResolvidas,
    passivasAtributosConfigLimpo: (passivasAtributosConfigLimpo as any) ?? null,
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
