// src/personagem-base/regras-criacao/regras-poderes-efeitos.ts

import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PoderesGenericosNaoEncontradosException,
  PoderGenericoConfigInvalidaException,
  PoderGenericoPericiaMaximaException,
  PoderGenericoPericiaNivelException,
  ProficienciaNaoEncontradaException,
} from 'src/common/exceptions/personagem.exception';

type PrismaLike = Pick<PrismaService, 'habilidade' | 'proficiencia'>;

type PoderGenericoInstanciaInput = {
  habilidadeId: number;
  config?: unknown;
};

type PericiaState = {
  grauTreinamento: number;
  periciaId: number;
  bonusExtra: number;
};

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

type EscolhaPericias = { tipo: 'PERICIAS'; quantidade?: number };

// Extrai com segurança mec.escolha quando for do tipo PERICIAS
function getEscolhaPericias(
  mec: Prisma.JsonValue | null,
): EscolhaPericias | null {
  if (!isJsonObject(mec)) return null;

  const escolha = mec.escolha;
  if (!isJsonObject(escolha)) return null;

  if (escolha.tipo !== 'PERICIAS') return null;
  return {
    tipo: 'PERICIAS',
    quantidade:
      typeof escolha.quantidade === 'number' ? escolha.quantidade : undefined,
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

function getTipoGrauCodigo(config: unknown): string | null {
  if (!isJsonObject(config)) return null;

  const codigo = config.tipoGrauCodigo;
  if (typeof codigo !== 'string' || !codigo.trim()) return null;
  return codigo;
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
    if (!escolhaMec) continue;

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
      if (typeof valor === 'number' && valor > 0) {
        const atual = resistencias.get(codigo) || 0;
        resistencias.set(codigo, atual + valor);
      }
    }
  }

  return resistencias;
}
