// src/personagem-base/regras-criacao/regras-poderes-efeitos.ts

import { Prisma, AtributoBaseEA } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PoderesGenericosNaoEncontradosException,
  PoderGenericoConfigInvalidaException,
  PoderGenericoPericiaMaximaException,
  PoderGenericoPericiaNivelException,
  HabilidadeRequerEscolhaException,
  HabilidadeConfigInvalidaException,
  ProficienciaNaoEncontradaException,
} from 'src/common/exceptions/personagem.exception';

type PrismaLike = Pick<PrismaService, 'habilidade' | 'proficiencia' | 'pericia'>;

type PoderGenericoInstanciaInput = {
  habilidadeId: number;
  config?: unknown;
};

type HabilidadeConfigInstanciaInput = {
  habilidadeId: number;
  config?: Prisma.JsonValue;
};

type PericiaState = {
  grauTreinamento: number;
  periciaId: number;
  bonusExtra: number;
};

type AtributosBasicos = {
  agilidade: number;
  forca: number;
  intelecto: number;
  presenca: number;
  vigor: number;
};

type AtributoBaseCodigo = 'AGI' | 'FOR' | 'INT' | 'PRE' | 'VIG';

type PoderDb = {
  id: number;
  nome: string;
  mecanicasEspeciais: Prisma.JsonValue | null;
};

type GrauLivre = { tipoGrauCodigo: string; valor: number };

function getMaxNivelTreinoPermitidoPorNivelPersonagem(nivel: number): number {
  // 0=destreinado, 1=treinado (5), 2=graduado (10), 3=veterano (15), 4=expert (20)
  if (nivel >= 16) return 4;
  if (nivel >= 9) return 3;
  if (nivel >= 3) return 2;
  return 1;
}

// JsonValue -> JsonObject (exclui arrays)
function isJsonObject(value: unknown): value is Prisma.JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

type EscolhaPericias = {
  tipo: 'PERICIAS';
  quantidade?: number;
  periciasPermitidas?: string[];
  atributosBasePermitidos?: AtributoBaseCodigo[];
};

type PericiasFixasConfig = {
  periciasFixas?: string[];
  bonusTreinado?: number;
};

type PericiasTreinadasConfig = {
  periciasTreinadas?: string[];
  bonusSeJaTreinado?: number;
};

type PericiasEscolhaConfig = {
  periciasCodigos?: string[];
};

// Extrai com segurança mec.escolha quando for do tipo PERICIAS
function getEscolhaPericias(
  mec: Prisma.JsonValue | null,
): EscolhaPericias | null {
  if (!isJsonObject(mec)) return null;

  const escolha = mec.escolha;
  if (!isJsonObject(escolha)) return null;

  if (escolha.tipo !== 'PERICIAS') return null;

  const periciasPermitidasRaw = escolha.periciasPermitidas;
  const periciasPermitidas = Array.isArray(periciasPermitidasRaw)
    ? periciasPermitidasRaw.filter((p) => typeof p === 'string')
    : undefined;

  const atributosBaseRaw = escolha.atributosBasePermitidos;
  const atributosBasePermitidos = Array.isArray(atributosBaseRaw)
    ? atributosBaseRaw
        .map((attr) => normalizeAtributoBaseCodigo(attr))
        .filter((attr): attr is AtributoBaseCodigo => !!attr)
    : undefined;

  return {
    tipo: 'PERICIAS',
    quantidade:
      typeof escolha.quantidade === 'number' ? escolha.quantidade : undefined,
    periciasPermitidas,
    atributosBasePermitidos,
  };
}

function getStringArrayFromConfig(
  config: unknown,
  field: string,
): string[] | null {
  if (!isJsonObject(config)) return null;

  const value = config[field];
  if (
    !Array.isArray(value) ||
    value.some((entry) => typeof entry !== 'string')
  ) {
    return null;
  }

  return value as string[];
}

function hasEscolhaTipoGrau(mec: Prisma.JsonValue | null): boolean {
  if (!isJsonObject(mec)) return false;
  const escolha = mec.escolha;
  return isJsonObject(escolha) && escolha.tipo === 'TIPO_GRAU';
}

function getPericiasFixasConfig(
  mec: Prisma.JsonValue | null,
): PericiasFixasConfig | null {
  if (!isJsonObject(mec)) return null;

  const periciasFixasRaw = mec.periciasFixas;
  const periciasFixas = Array.isArray(periciasFixasRaw)
    ? periciasFixasRaw.filter((p) => typeof p === 'string')
    : null;

  const bonusTreinadoRaw = mec.bonusTreinado;
  const bonusTreinado =
    typeof bonusTreinadoRaw === 'number' ? bonusTreinadoRaw : undefined;

  if (!periciasFixas || periciasFixas.length === 0) return null;

  return {
    periciasFixas,
    bonusTreinado,
  };
}

function getPericiasTreinadasConfig(
  mec: Prisma.JsonValue | null,
): PericiasTreinadasConfig | null {
  if (!isJsonObject(mec)) return null;

  const periciasTreinadasRaw = mec.periciasTreinadas;
  const periciasTreinadas = Array.isArray(periciasTreinadasRaw)
    ? periciasTreinadasRaw.filter((p) => typeof p === 'string')
    : null;

  const bonusSeJaTreinadoRaw = mec.bonusSeJaTreinado;
  const bonusSeJaTreinado =
    typeof bonusSeJaTreinadoRaw === 'number' ? bonusSeJaTreinadoRaw : undefined;

  if (!periciasTreinadas || periciasTreinadas.length === 0) return null;

  return {
    periciasTreinadas,
    bonusSeJaTreinado,
  };
}

function getTipoGrauCodigo(config: unknown): string | null {
  if (!isJsonObject(config)) return null;

  const codigo = config.tipoGrauCodigo;
  if (typeof codigo !== 'string' || !codigo.trim()) return null;
  return codigo;
}

function resolverValorResistencia(
  valor: unknown,
  atributos?: AtributosBasicos,
): number | null {
  if (typeof valor === 'number') return valor;
  if (!atributos || typeof valor !== 'string') return null;

  const chave = valor.trim().toUpperCase();
  const mapa: Record<string, number | undefined> = {
    AGI: atributos.agilidade,
    AGILIDADE: atributos.agilidade,
    FOR: atributos.forca,
    FORCA: atributos.forca,
    INT: atributos.intelecto,
    INTELECTO: atributos.intelecto,
    PRE: atributos.presenca,
    PRESENCA: atributos.presenca,
    VIG: atributos.vigor,
    VIGOR: atributos.vigor,
  };

  const resultado = mapa[chave];
  return typeof resultado === 'number' ? resultado : null;
}

function normalizeAtributoBaseCodigo(
  valor: unknown,
): AtributoBaseCodigo | null {
  if (typeof valor !== 'string') return null;
  const chave = valor.trim().toUpperCase();
  const mapa: Record<string, AtributoBaseCodigo> = {
    AGI: 'AGI',
    AGILIDADE: 'AGI',
    FOR: 'FOR',
    FORCA: 'FOR',
    INT: 'INT',
    INTELECTO: 'INT',
    PRE: 'PRE',
    PRESENCA: 'PRE',
    VIG: 'VIG',
    VIGOR: 'VIG',
  };
  return mapa[chave] ?? null;
}

export function aplicarBonusPericiasDeHabilidades(
  habilidades: Array<{
    habilidade: { mecanicasEspeciais?: Prisma.JsonValue | null };
  }>,
  periciasMap: Map<string, PericiaState>,
): void {
  for (const hab of habilidades) {
    const mecanicas = hab.habilidade.mecanicasEspeciais;
    if (!isJsonObject(mecanicas)) continue;

    const periciasBonus = mecanicas.periciasBonus;
    if (!isJsonObject(periciasBonus)) continue;

    for (const [codigo, bonus] of Object.entries(periciasBonus)) {
      if (typeof bonus !== 'number' || bonus === 0) continue;
      const pericia = periciasMap.get(codigo);
      if (!pericia) continue;
      pericia.bonusExtra += bonus;
    }
  }
}

export function aplicarEscolhasPericiasDeHabilidades(params: {
  habilidades: Array<{
    habilidade: {
      nome: string;
      mecanicasEspeciais?: Prisma.JsonValue | null;
    };
  }>;
  habilidadesConfig: HabilidadeConfigInstanciaInput[] | undefined;
  periciasMap: Map<string, PericiaState>;
  periciasCatalogo: Map<string, { codigo: string; atributoBase: string }>;
}): void {
  const {
    habilidades,
    habilidadesConfig,
    periciasMap,
    periciasCatalogo,
  } = params;
  if (!habilidades || habilidades.length === 0) return;

  const configPorHabilidade = new Map<number, PericiasEscolhaConfig>();
  for (const inst of habilidadesConfig ?? []) {
    const config = isJsonObject(inst.config) ? inst.config : {};
    configPorHabilidade.set(
      inst.habilidadeId,
      config as PericiasEscolhaConfig,
    );
  }

  for (const hab of habilidades) {
    const mecanicas = hab.habilidade.mecanicasEspeciais ?? null;
    const escolhaMec = getEscolhaPericias(mecanicas);
    if (!escolhaMec) continue;

    const config = configPorHabilidade.get(
      (hab as { habilidadeId?: number }).habilidadeId ?? -1,
    );
    if (!config) {
      throw new HabilidadeRequerEscolhaException(hab.habilidade.nome);
    }

    const qtd =
      typeof escolhaMec.quantidade === 'number' ? escolhaMec.quantidade : 1;
    const codigos = getStringArrayFromConfig(config, 'periciasCodigos');

    if (!codigos) {
      throw new HabilidadeConfigInvalidaException(
        hab.habilidade.nome,
        'periciasCodigos',
        'deve ser array de strings',
      );
    }

    const unicos = Array.from(new Set(codigos));
    if (unicos.length !== codigos.length) {
      throw new HabilidadeConfigInvalidaException(
        hab.habilidade.nome,
        'periciasCodigos',
        'nao permite pericias repetidas na mesma escolha',
      );
    }

    if (codigos.length !== qtd) {
      throw new HabilidadeConfigInvalidaException(
        hab.habilidade.nome,
        'periciasCodigos',
        `exige escolher exatamente ${qtd} pericias`,
        { quantidadeEsperada: qtd, quantidadeRecebida: codigos.length },
      );
    }

    for (const codigo of codigos) {
      const pericia = periciasMap.get(codigo);
      if (!pericia) {
        throw new HabilidadeConfigInvalidaException(
          hab.habilidade.nome,
          'periciasCodigos',
          `pericia "${codigo}" nao existe no sistema`,
        );
      }

      if (
        escolhaMec.periciasPermitidas &&
        !escolhaMec.periciasPermitidas.includes(codigo)
      ) {
        throw new HabilidadeConfigInvalidaException(
          hab.habilidade.nome,
          'periciasCodigos',
          `pericia "${codigo}" nao esta permitida`,
          { permitido: escolhaMec.periciasPermitidas },
        );
      }

      if (escolhaMec.atributosBasePermitidos?.length) {
        const periciaCatalogo = periciasCatalogo.get(codigo);
        const atributo = normalizeAtributoBaseCodigo(
          periciaCatalogo?.atributoBase,
        );
        if (!atributo) {
          throw new HabilidadeConfigInvalidaException(
            hab.habilidade.nome,
            'periciasCodigos',
            `pericia "${codigo}" nao possui atributo base valido`,
          );
        }
        if (!escolhaMec.atributosBasePermitidos.includes(atributo)) {
          throw new HabilidadeConfigInvalidaException(
            hab.habilidade.nome,
            'periciasCodigos',
            `pericia "${codigo}" nao possui atributo base permitido`,
            {
              atributoBase: atributo,
              permitido: escolhaMec.atributosBasePermitidos,
            },
          );
        }
      }
    }

    const bonusEscolha = isJsonObject(mecanicas)
      ? mecanicas.periciasBonusEscolha
      : null;
    const treinadasEscolha = isJsonObject(mecanicas)
      ? mecanicas.periciasTreinadasEscolha
      : null;
    const bonusSeJaTreinadoEscolha = isJsonObject(mecanicas)
      ? mecanicas.bonusSeJaTreinadoEscolha
      : null;

    for (const codigo of codigos) {
      const pericia = periciasMap.get(codigo);
      if (!pericia) continue;

      if (typeof bonusEscolha === 'number' && bonusEscolha !== 0) {
        pericia.bonusExtra += bonusEscolha;
      }

      if (treinadasEscolha === true) {
        const bonusTreinado =
          typeof bonusSeJaTreinadoEscolha === 'number'
            ? bonusSeJaTreinadoEscolha
            : 2;

        if (pericia.grauTreinamento <= 0) {
          pericia.grauTreinamento = 1;
        } else {
          pericia.bonusExtra += bonusTreinado;
        }
      }
    }
  }
}

export async function aplicarEfeitosPoderesEmPericias(
  params: {
    nivel: number;
    poderes: PoderGenericoInstanciaInput[] | undefined;
    periciasMap: Map<string, PericiaState>;
  },
  prisma: PrismaLike,
): Promise<void> {
  const { nivel, poderes, periciasMap } = params;
  if (!poderes || poderes.length === 0) return;

  const idsUnicos = Array.from(new Set(poderes.map((p) => p.habilidadeId)));

  const poderesDb = (await prisma.habilidade.findMany({
    where: { id: { in: idsUnicos }, tipo: 'PODER_GENERICO' },
    select: { id: true, nome: true, mecanicasEspeciais: true },
  })) as PoderDb[];

  const periciasCatalogo = await prisma.pericia.findMany({
    select: { codigo: true, atributoBase: true },
  });
  const periciasCatalogoMap = new Map(
    periciasCatalogo.map((p) => [p.codigo, p] as const),
  );

  if (poderesDb.length !== idsUnicos.length) {
    throw new PoderesGenericosNaoEncontradosException();
  }

  const poderPorId = new Map<number, PoderDb>(
    poderesDb.map((p) => [p.id, p] as const),
  );
  const maxPermitido = getMaxNivelTreinoPermitidoPorNivelPersonagem(nivel);

  for (const inst of poderes) {
    const poderDb = poderPorId.get(inst.habilidadeId);
    if (!poderDb) continue;

    const escolhaMec = getEscolhaPericias(poderDb.mecanicasEspeciais);
    if (escolhaMec) {
      const qtd =
        typeof escolhaMec.quantidade === 'number' ? escolhaMec.quantidade : 2;
      const codigos = getStringArrayFromConfig(inst.config, 'periciasCodigos');

      if (!codigos) {
        throw new PoderGenericoConfigInvalidaException(
          poderDb.nome,
          'periciasCodigos',
          'deve ser array de strings',
        );
      }

      const unicos = Array.from(new Set(codigos));
      if (unicos.length !== codigos.length) {
        throw new PoderGenericoConfigInvalidaException(
          poderDb.nome,
          'periciasCodigos',
          'não permite perícias repetidas na mesma escolha',
        );
      }

      if (codigos.length !== qtd) {
        throw new PoderGenericoConfigInvalidaException(
          poderDb.nome,
          'periciasCodigos',
          `exige escolher exatamente ${qtd} perícias`,
          { quantidadeEsperada: qtd, quantidadeRecebida: codigos.length },
        );
      }

      for (const codigo of codigos) {
        const pericia = periciasMap.get(codigo);
        if (!pericia) {
          throw new PoderGenericoConfigInvalidaException(
            poderDb.nome,
            'periciasCodigos',
            `perícia "${codigo}" não existe no sistema`,
          );
        }

        if (
          escolhaMec.periciasPermitidas &&
          !escolhaMec.periciasPermitidas.includes(codigo)
        ) {
          throw new PoderGenericoConfigInvalidaException(
            poderDb.nome,
            'periciasCodigos',
            `perÃ­cia "${codigo}" nÃ£o estÃ¡ permitida`,
          );
        }

        if (escolhaMec.atributosBasePermitidos?.length) {
          const periciaCatalogo = periciasCatalogoMap.get(codigo);
          const atributo = normalizeAtributoBaseCodigo(
            periciaCatalogo?.atributoBase,
          );
          if (!atributo) {
            throw new PoderGenericoConfigInvalidaException(
              poderDb.nome,
              'periciasCodigos',
              `perÃ­cia "${codigo}" nÃ£o possui atributo base vÃ¡lido`,
            );
          }
          if (!escolhaMec.atributosBasePermitidos.includes(atributo)) {
            throw new PoderGenericoConfigInvalidaException(
              poderDb.nome,
              'periciasCodigos',
              `perÃ­cia "${codigo}" nÃ£o possui atributo base permitido`,
            );
          }
        }

        const proximo = pericia.grauTreinamento + 1;

        if (proximo > maxPermitido) {
          throw new PoderGenericoPericiaNivelException(
            poderDb.nome,
            codigo,
            nivel,
          );
        }

        if (proximo > 4) {
          throw new PoderGenericoPericiaMaximaException(poderDb.nome, codigo);
        }

        pericia.grauTreinamento = proximo;
      }

      const bonusEscolha = isJsonObject(poderDb.mecanicasEspeciais)
        ? poderDb.mecanicasEspeciais.periciasBonusEscolha
        : null;
      const treinadasEscolha = isJsonObject(poderDb.mecanicasEspeciais)
        ? poderDb.mecanicasEspeciais.periciasTreinadasEscolha
        : null;
      const bonusSeJaTreinadoEscolha = isJsonObject(
        poderDb.mecanicasEspeciais,
      )
        ? poderDb.mecanicasEspeciais.bonusSeJaTreinadoEscolha
        : null;

      for (const codigo of codigos) {
        const pericia = periciasMap.get(codigo);
        if (!pericia) continue;

        if (typeof bonusEscolha === 'number' && bonusEscolha !== 0) {
          pericia.bonusExtra += bonusEscolha;
        }

        if (treinadasEscolha === true) {
          const bonusTreinado =
            typeof bonusSeJaTreinadoEscolha === 'number'
              ? bonusSeJaTreinadoEscolha
              : 2;

          if (pericia.grauTreinamento <= 0) {
            pericia.grauTreinamento = 1;
          } else {
            pericia.bonusExtra += bonusTreinado;
          }
        }
      }
    }
    const treinadasConfig = getPericiasTreinadasConfig(
      poderDb.mecanicasEspeciais,
    );
    const fixasConfig = getPericiasFixasConfig(poderDb.mecanicasEspeciais);

    const config = treinadasConfig
      ? {
          pericias: treinadasConfig.periciasTreinadas ?? [],
          bonus: treinadasConfig.bonusSeJaTreinado,
          field: 'periciasTreinadas',
        }
      : fixasConfig
        ? {
            pericias: fixasConfig.periciasFixas ?? [],
            bonus: fixasConfig.bonusTreinado,
            field: 'periciasFixas',
          }
        : null;

    if (config) {
      const bonusTreinado = typeof config.bonus === 'number' ? config.bonus : 2;

      for (const codigo of config.pericias) {
        const pericia = periciasMap.get(codigo);
        if (!pericia) {
          throw new PoderGenericoConfigInvalidaException(
            poderDb.nome,
            config.field,
            `perícia "${codigo}" não existe no sistema`,
          );
        }

        if (pericia.grauTreinamento <= 0) {
          pericia.grauTreinamento = 1;
        } else {
          pericia.bonusExtra += bonusTreinado;
        }
      }
    }
  }
}
/**
 * ✅ CORRIGIDO: Apenas valida, NÃO soma bônus aos graus livres
 * O bônus será calculado dinamicamente em aplicarRegrasDeGraus
 */
export async function aplicarEfeitosPoderesEmGraus(
  params: {
    poderes: PoderGenericoInstanciaInput[] | undefined;
    grausLivres: GrauLivre[];
  },
  prisma: PrismaLike,
): Promise<GrauLivre[]> {
  const { poderes, grausLivres } = params;
  if (!poderes || poderes.length === 0) return grausLivres;

  const idsUnicos = Array.from(new Set(poderes.map((p) => p.habilidadeId)));

  const poderesDb = await prisma.habilidade.findMany({
    where: { id: { in: idsUnicos }, tipo: 'PODER_GENERICO' },
    select: { id: true, nome: true, mecanicasEspeciais: true },
  });

  const poderPorId = new Map(poderesDb.map((p) => [p.id, p]));

  // ✅ APENAS VALIDAR, NÃO SOMAR!
  for (const inst of poderes) {
    const poderDb = poderPorId.get(inst.habilidadeId);
    if (!poderDb) continue;

    if (!hasEscolhaTipoGrau(poderDb.mecanicasEspeciais)) continue;

    const codigo = getTipoGrauCodigo(inst.config);
    if (!codigo) {
      throw new PoderGenericoConfigInvalidaException(
        poderDb.nome,
        'tipoGrauCodigo',
        'exige config.tipoGrauCodigo (string) na instância',
      );
    }

    // ✅ TODO: validar se código existe no catálogo (opcional)
  }

  // ✅ RETORNAR GRAUS LIVRES INALTERADOS
  return grausLivres;
}

/**
 * ✅ GENERALIZADO: Extrai proficiências de qualquer lista de habilidades
 * (poderes genéricos, trilhas, origens, técnicas inatas, etc)
 *
 * Procura por mecanicasEspeciais.proficiencias (array de códigos)
 */
export async function extrairProficienciasDeHabilidades(
  habilidades: Array<{
    habilidade: { mecanicasEspeciais?: Prisma.JsonValue | null; nome?: string };
  }>,
  prisma: PrismaLike,
): Promise<string[]> {
  const profsCodigos = new Set<string>();

  for (const hab of habilidades) {
    const mecanicas = hab.habilidade.mecanicasEspeciais;
    if (!isJsonObject(mecanicas)) continue;

    // ✅ Campo: mecanicasEspeciais.proficiencias (array)
    const profsArray = mecanicas.proficiencias;
    if (!Array.isArray(profsArray)) continue;

    for (const codigo of profsArray) {
      if (typeof codigo === 'string' && codigo.trim()) {
        profsCodigos.add(codigo);
      }
    }
  }

  // Validar que todas as proficiências existem no banco
  if (profsCodigos.size > 0) {
    const profsExistentes = await prisma.proficiencia.findMany({
      where: { codigo: { in: Array.from(profsCodigos) } },
      select: { codigo: true },
    });

    const codigosValidos = new Set(profsExistentes.map((p) => p.codigo));
    for (const codigo of profsCodigos) {
      if (!codigosValidos.has(codigo)) {
        throw new ProficienciaNaoEncontradaException(codigo);
      }
    }
  }

  return Array.from(profsCodigos);
}

/**
 * ✅ ATUALIZADO: Wrapper específico para poderes genéricos (retrocompatibilidade)
 * Agora usa a função genérica internamente
 */
export async function aplicarEfeitosPoderesEmProficiencias(
  params: {
    nivel: number;
    poderes: PoderGenericoInstanciaInput[] | undefined;
    profsExistentes: string[];
  },
  prisma: PrismaLike,
): Promise<string[]> {
  const { poderes } = params;
  if (!poderes || poderes.length === 0) return [];

  const idsUnicos = Array.from(new Set(poderes.map((p) => p.habilidadeId)));

  const poderesDb = await prisma.habilidade.findMany({
    where: { id: { in: idsUnicos }, tipo: 'PODER_GENERICO' },
    select: { id: true, nome: true, mecanicasEspeciais: true },
  });

  if (poderesDb.length !== idsUnicos.length) {
    throw new PoderesGenericosNaoEncontradosException();
  }

  // ✅ Adaptar para o formato esperado por extrairProficienciasDeHabilidades
  const habilidadesComRelacao = poderesDb.map((p) => ({
    habilidade: p,
  }));

  // ✅ Usar função genérica
  const profsDePoderes = await extrairProficienciasDeHabilidades(
    habilidadesComRelacao,
    prisma,
  );

  return profsDePoderes;
}

/**
 * ✅ NOVO: Extrai resistências de habilidades (poderes genéricos, trilhas, origens, técnicas)
 *
 * Procura por mecanicasEspeciais.resistencias (objeto { "BALISTICO": 2, "ENERGIA_AMALDICOADA": 5 })
 *
 * @param habilidades - Lista de habilidades com mecanicasEspeciais
 * @returns Map com código da resistência → valor acumulado
 *
 * @example
 * // Formato esperado em mecanicasEspeciais:
 * {
 *   "resistencias": {
 *     "BALISTICO": 2,
 *     "ENERGIA_AMALDICOADA": 5,
 *     "DANO": 1
 *   }
 * }
 */
export function extrairResistenciasDeHabilidades(
  habilidades: Array<{
    habilidade: { mecanicasEspeciais?: Prisma.JsonValue | null; nome?: string };
  }>,
  atributos?: AtributosBasicos,
): Map<string, number> {
  const resistencias = new Map<string, number>();

  for (const hab of habilidades) {
    const mecanicas = hab.habilidade.mecanicasEspeciais;
    if (!isJsonObject(mecanicas)) continue;

    // ✅ Campo: mecanicasEspeciais.resistencias (objeto)
    const resistenciasObj = mecanicas.resistencias;
    if (!isJsonObject(resistenciasObj)) continue;

    // ✅ Formato esperado: { "BALISTICO": 2, "ENERGIA_AMALDICOADA": 5, "DANO": 1 }
    for (const [codigo, valor] of Object.entries(resistenciasObj)) {
      const valorResolvido = resolverValorResistencia(valor, atributos);
      if (typeof valorResolvido === 'number' && valorResolvido > 0) {
        const atual = resistencias.get(codigo) || 0;
        resistencias.set(codigo, atual + valorResolvido);
      }
    }
  }

  return resistencias;
}

/**
 * ✅ NOVO: Extrai override do atributo-chave de EA/PE a partir das habilidades
 *
 * Espera mecanicasEspeciais.recursos.atributoChaveEa = "INT" | "PRE"
 */
export function extrairAtributoChaveEaDeHabilidades(
  habilidades: Array<{
    habilidade: { mecanicasEspeciais?: Prisma.JsonValue | null; nome?: string };
  }>,
): AtributoBaseEA | null {
  let override: AtributoBaseEA | null = null;

  for (const hab of habilidades) {
    const mecanicas = hab.habilidade.mecanicasEspeciais;
    if (!isJsonObject(mecanicas)) continue;
    const recursos = mecanicas.recursos;
    if (!isJsonObject(recursos)) continue;

    const atributoRaw = recursos.atributoChaveEa;
    const atributo = normalizeAtributoBaseCodigo(atributoRaw);
    if (atributo === 'INT' || atributo === 'PRE') {
      override = atributo as AtributoBaseEA;
    }
  }

  return override;
}

/**
 * ✅ NOVO: Extrai overrides do atributo-base das pericias
 *
 * Espera mecanicasEspeciais.periciasAtributoBase = { VONTADE: "INT", ... }
 */
export function extrairPericiasAtributoBaseOverride(
  habilidades: Array<{
    habilidade: { mecanicasEspeciais?: Prisma.JsonValue | null; nome?: string };
  }>,
): Record<string, AtributoBaseCodigo> {
  const overrides: Record<string, AtributoBaseCodigo> = {};

  for (const hab of habilidades) {
    const mecanicas = hab.habilidade.mecanicasEspeciais;
    if (!isJsonObject(mecanicas)) continue;

    const periciasOverride = mecanicas.periciasAtributoBase;
    if (!isJsonObject(periciasOverride)) continue;

    for (const [codigo, atributoRaw] of Object.entries(periciasOverride)) {
      const atributo = normalizeAtributoBaseCodigo(atributoRaw);
      if (!atributo) continue;
      const codigoNormalizado = codigo.trim().toUpperCase();
      if (!codigoNormalizado) continue;
      overrides[codigoNormalizado] = atributo;
    }
  }

  return overrides;
}

/**
 * ✅ NOVO: Extrai quantidade de barras de PV
 *
 * Espera mecanicasEspeciais.recursos.pvBarrasTotal = number
 */
export function extrairPvBarrasTotalDeHabilidades(
  habilidades: Array<{
    habilidade: { mecanicasEspeciais?: Prisma.JsonValue | null; nome?: string };
  }>,
): number | null {
  let total: number | null = null;

  for (const hab of habilidades) {
    const mecanicas = hab.habilidade.mecanicasEspeciais;
    if (!isJsonObject(mecanicas)) continue;
    const recursos = mecanicas.recursos;
    if (!isJsonObject(recursos)) continue;

    const valorRaw = recursos.pvBarrasTotal;
    if (typeof valorRaw !== 'number' || !Number.isFinite(valorRaw)) continue;
    const valor = Math.trunc(valorRaw);
    if (valor >= 2) {
      total = total === null ? valor : Math.max(total, valor);
    }
  }

  return total;
}
