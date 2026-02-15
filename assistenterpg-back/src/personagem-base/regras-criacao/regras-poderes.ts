// src/personagem-base/regras-criacao/regras-poderes.ts

import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  PoderesGenericosExcedemSlotsException,
  PoderesGenericosNaoEncontradosException,
  PoderGenericoNaoRepetivelException,
  PoderGenericoRequisitoNivelException,
  PoderGenericoRequerEscolhaException,
  PoderGenericoConfigInvalidaException,
  PoderGenericoRequisitoPericiaException,
  PoderGenericoRequisitoAtributoException,
  PoderGenericoRequisitoGrauException,
  PoderGenericoRequisitoPoderException,
} from 'src/common/exceptions/personagem.exception';

type PrismaLike = PrismaService | Prisma.TransactionClient;

// ============================================================================
// Tipos de requisitos (JSON)
// ============================================================================
type RequisitoPericia = { codigo: string; grauMinimo: number; alternativa?: boolean };
type RequisitoGrau = { tipoGrauCodigo: string; valorMinimo: number };

type RequisitosPoder = {
  nivelMinimo?: number;
  pericias?: RequisitoPericia[];
  atributos?: {
    agilidade?: number;
    forca?: number;
    intelecto?: number;
    presenca?: number;
    vigor?: number;
    alternativa?: boolean; // se true, é OU entre os atributos informados
  };
  graus?: RequisitoGrau[];
  poderesPreRequisitos?: string[];

  [k: string]: unknown;
};

function isRequisitosPoder(value: unknown): value is RequisitosPoder {
  // Prisma.JsonNull/DbNull são objetos especiais; e requisitos pode ser null.
  // Queremos aceitar apenas objetos "normais" com chaves, e ignorar JsonNull.
  if (!value) return false;
  if (typeof value !== 'object') return false;

  const v = value as Record<string, unknown>;
  return (
    'nivelMinimo' in v ||
    'pericias' in v ||
    'atributos' in v ||
    'graus' in v ||
    'poderesPreRequisitos' in v
  );
}

// ============================================================================
// Tipos de mecânicas especiais (JSON)
// ============================================================================
type MecanicasEspeciaisPoder = {
  repetivel?: boolean;
  escolha?: { tipo: string; quantidade?: number };
  [k: string]: unknown;
};

function isMecanicasEspeciaisPoder(value: unknown): value is MecanicasEspeciaisPoder {
  if (!value) return false;
  if (typeof value !== 'object') return false;

  const v = value as Record<string, unknown>;
  return 'repetivel' in v || 'escolha' in v;
}

// ============================================================================
// Payload (instâncias)
// ============================================================================
export type PoderGenericoInstanciaInput = {
  habilidadeId: number;
  config?: any; // Json
};

/**
 * ✅ Calcula quantos slots de poderes genéricos o personagem tem disponível
 * Níveis que concedem poderes: 3, 6, 9, 12, 15, 18
 */
export function calcularSlotsPoderesGenericos(nivel: number): number {
  const niveisQueDaoPoder = [3, 6, 9, 12, 15, 18];
  return niveisQueDaoPoder.filter((n) => nivel >= n).length;
}

/**
 * ✅ Busca todos os poderes genéricos disponíveis no catálogo
 * Usado tanto na API pública quanto na validação interna
 */
export async function buscarPoderesGenericosDisponiveis(
  prisma: PrismaLike,
): Promise<
  Array<{
    id: number;
    nome: string;
    descricao: string | null;
    requisitos: Prisma.JsonValue | null;
    mecanicasEspeciais?: Prisma.JsonValue | null;
  }>
> {
  const poderes = await prisma.habilidade.findMany({
    where: { tipo: 'PODER_GENERICO' },
    select: {
      id: true,
      nome: true,
      descricao: true,
      requisitos: true,
      mecanicasEspeciais: true,
    },
    orderBy: { nome: 'asc' },
  });

  return poderes;
}

/**
 * ✅ Valida se os poderes selecionados respeitam:
 * - Quantidade de slots disponíveis (baseado no nível)
 * - Repetição (somente se mecanicasEspeciais.repetivel=true)
 * - Pré-requisitos de perícias/atributos/graus/outros poderes (via requisitos)
 * - Config obrigatória quando houver mecanicasEspeciais.escolha
 *
 * Observação: validação estrutural de config está completa para escolha tipo PERICIAS.
 * Para outros tipos, exige config presente (e deixa TODO para validação específica).
 */
export async function validarPoderesGenericos(
  params: {
    nivel: number;
    poderes: PoderGenericoInstanciaInput[];
    pericias: Array<{ codigo: string; grauTreinamento: number }>;
    atributos: {
      agilidade: number;
      forca: number;
      intelecto: number;
      presenca: number;
      vigor: number;
    };
    graus: Array<{ tipoGrauCodigo: string; valor: number }>;
  },
  prisma: PrismaLike,
): Promise<void> {
  const { nivel, poderes, pericias, atributos, graus } = params;

  if (!poderes || poderes.length === 0) return;

  // 1) slots
  const slotsDisponiveis = calcularSlotsPoderesGenericos(nivel);
  if (poderes.length > slotsDisponiveis) {
    throw new PoderesGenericosExcedemSlotsException(nivel, slotsDisponiveis, poderes.length);
  }

  // 2) buscar poderes do catálogo (ids únicos)
  const idsUnicos = Array.from(new Set(poderes.map((p) => p.habilidadeId)));

  const poderesDb = await prisma.habilidade.findMany({
    where: {
      id: { in: idsUnicos },
      tipo: 'PODER_GENERICO',
    },
    select: {
      id: true,
      nome: true,
      requisitos: true,
      mecanicasEspeciais: true,
    },
  });

  if (poderesDb.length !== idsUnicos.length) {
    throw new PoderesGenericosNaoEncontradosException();
  }

  const poderPorId = new Map(poderesDb.map((p) => [p.id, p]));

  // 3) repetição (somente quando repetivel=true)
  const contagem = new Map<number, number>();
  for (const inst of poderes) {
    contagem.set(inst.habilidadeId, (contagem.get(inst.habilidadeId) ?? 0) + 1);
  }

  for (const [habilidadeId, qtd] of contagem.entries()) {
    if (qtd <= 1) continue;

    const poderDb = poderPorId.get(habilidadeId);
    const mecRaw = poderDb?.mecanicasEspeciais;

    const mec = isMecanicasEspeciaisPoder(mecRaw) ? (mecRaw as MecanicasEspeciaisPoder) : null;
    const repetivel = !!mec?.repetivel;

    if (!repetivel) {
      throw new PoderGenericoNaoRepetivelException(poderDb?.nome ?? String(habilidadeId));
    }
  }

  // 4) mapas de pré-requisitos
  const periciasMap = new Map(pericias.map((p) => [p.codigo, p.grauTreinamento]));
  const grausMap = new Map(graus.map((g) => [g.tipoGrauCodigo, g.valor]));

  // Pré-requisitos de poderes: validar contra nomes dos poderes selecionados (instâncias)
  const nomesPoderesSelecionados = new Set(poderesDb.map((p) => p.nome));

  // 5) validar requisitos (por poder único do catálogo)
  for (const poder of poderesDb) {
    const rawReq = poder.requisitos;

    if (isRequisitosPoder(rawReq)) {
      const requisitos: RequisitosPoder = rawReq;

      if (requisitos.nivelMinimo && nivel < requisitos.nivelMinimo) {
        throw new PoderGenericoRequisitoNivelException(poder.nome, requisitos.nivelMinimo);
      }

      if (requisitos.pericias && Array.isArray(requisitos.pericias)) {
        validarPericias(poder.nome, requisitos.pericias, periciasMap);
      }

      if (requisitos.atributos) {
        validarAtributos(poder.nome, requisitos.atributos, atributos);
      }

      if (requisitos.graus && Array.isArray(requisitos.graus)) {
        validarGraus(poder.nome, requisitos.graus, grausMap);
      }

      if (requisitos.poderesPreRequisitos && Array.isArray(requisitos.poderesPreRequisitos)) {
        validarPoderesPreRequisitos(
          poder.nome,
          requisitos.poderesPreRequisitos,
          nomesPoderesSelecionados,
        );
      }
    }
  }

  // 6) validar config por instância (quando houver escolha)
  // Fazemos por instância para permitir repetição com configs diferentes.
  for (const inst of poderes) {
    const poderDb = poderPorId.get(inst.habilidadeId);
    if (!poderDb) continue;

    const mecRaw = poderDb.mecanicasEspeciais;
    if (!isMecanicasEspeciaisPoder(mecRaw)) continue;

    const mec = mecRaw as MecanicasEspeciaisPoder;
    const escolha = mec.escolha;

    if (!escolha) continue;

    // Config obrigatória quando há escolha
    if (inst.config == null) {
      throw new PoderGenericoRequerEscolhaException(poderDb.nome);
    }

    // Implementação completa: PERICIAS
    if (escolha.tipo === 'PERICIAS') {
      const qtd = typeof escolha.quantidade === 'number' ? escolha.quantidade : 2;
      await validarConfigPericias(poderDb.nome, inst.config, qtd, prisma);
      continue;
    }

    // Para outros tipos, por enquanto só exige presença de config (TODO validar estrutura)
    // Se você quiser travar forte, dá pra trocar por throw NotImplemented.
  }
}

async function validarConfigPericias(
  poderNome: string,
  config: any,
  quantidade: number,
  prisma: PrismaLike,
): Promise<void> {
  const codigos = config?.periciasCodigos;

  if (!Array.isArray(codigos) || codigos.some((c) => typeof c !== 'string')) {
    throw new PoderGenericoConfigInvalidaException(
      poderNome,
      'periciasCodigos',
      'deve ser array de strings',
    );
  }

  const unicos = Array.from(new Set(codigos));
  if (unicos.length !== codigos.length) {
    throw new PoderGenericoConfigInvalidaException(
      poderNome,
      'periciasCodigos',
      'não permite perícias repetidas na mesma escolha',
    );
  }

  if (codigos.length !== quantidade) {
    throw new PoderGenericoConfigInvalidaException(
      poderNome,
      'periciasCodigos',
      `exige escolher exatamente ${quantidade} perícias`,
      { quantidadeEsperada: quantidade, quantidadeRecebida: codigos.length },
    );
  }

  const periciasDb = await prisma.pericia.findMany({
    where: { codigo: { in: codigos } },
    select: { codigo: true },
  });
  const setDb = new Set(periciasDb.map((p) => p.codigo));

  for (const codigo of codigos) {
    if (!setDb.has(codigo)) {
      throw new PoderGenericoConfigInvalidaException(
        poderNome,
        'periciasCodigos',
        `perícia "${codigo}" não existe`,
        { codigoInvalido: codigo },
      );
    }
  }
}

/**
 * ✅ Valida perícias
 * Suporta requisitos alternativos (OU) quando alternativa=true
 * Caso contrário, todas as perícias devem ser atendidas (E)
 */
function validarPericias(
  poderNome: string,
  periciasReq: RequisitoPericia[],
  periciasMap: Map<string, number>,
): void {
  const temAlternativa = periciasReq.some((req) => req.alternativa);

  if (temAlternativa) {
    const atendeuAlguma = periciasReq.some((req) => {
      const grauAtual = periciasMap.get(req.codigo) ?? 0;
      return grauAtual >= req.grauMinimo;
    });

    if (!atendeuAlguma) {
      const opcoes = periciasReq.map((req) => req.codigo).join(' ou ');
      throw new PoderGenericoRequisitoPericiaException(poderNome, opcoes);
    }
  } else {
    for (const req of periciasReq) {
      const grauAtual = periciasMap.get(req.codigo) ?? 0;
      if (grauAtual < req.grauMinimo) {
        throw new PoderGenericoRequisitoPericiaException(
          poderNome,
          `${req.codigo} (grau ${req.grauMinimo}+)`,
        );
      }
    }
  }
}

/**
 * ✅ Valida atributos
 * Suporta requisitos alternativos (OU) quando alternativa=true
 * Caso contrário, todos os atributos devem ser atendidos (E)
 */
function validarAtributos(
  poderNome: string,
  atributosReq: NonNullable<RequisitosPoder['atributos']>,
  atributos: {
    agilidade: number;
    forca: number;
    intelecto: number;
    presenca: number;
    vigor: number;
  },
): void {
  const alternativa = atributosReq.alternativa;

  const entries = Object.entries(atributosReq).filter(([k]) => k !== 'alternativa') as Array<
    [keyof Omit<NonNullable<RequisitosPoder['atributos']>, 'alternativa'>, number]
  >;

  if (alternativa) {
    const atendeuAlgum = entries.some(([atrib, valorMin]) => {
      const valorAtual = atributos[atrib] ?? 0;
      return valorAtual >= valorMin;
    });

    if (!atendeuAlgum) {
      const opcoes = entries.map(([k, v]) => `${String(k).toUpperCase()} ${v}+`).join(' ou ');
      throw new PoderGenericoRequisitoAtributoException(poderNome, opcoes);
    }
  } else {
    for (const [atrib, valorMin] of entries) {
      const valorAtual = atributos[atrib] ?? 0;
      if (valorAtual < valorMin) {
        throw new PoderGenericoRequisitoAtributoException(
          poderNome,
          `${String(atrib).toUpperCase()} ${valorMin}+`,
        );
      }
    }
  }
}

/**
 * ✅ Valida graus de aprimoramento
 * Verifica se o personagem possui o grau mínimo necessário
 */
function validarGraus(
  poderNome: string,
  grausReq: RequisitoGrau[],
  grausMap: Map<string, number>,
): void {
  for (const req of grausReq) {
    const grauAtual = grausMap.get(req.tipoGrauCodigo) ?? 0;
    if (grauAtual < req.valorMinimo) {
      throw new PoderGenericoRequisitoGrauException(
        poderNome,
        req.tipoGrauCodigo,
        req.valorMinimo,
      );
    }
  }
}

/**
 * ✅ Valida pré-requisitos de outros poderes
 * Aqui valida contra o conjunto de poderes selecionados/possuídos pelo personagem.
 */
function validarPoderesPreRequisitos(
  poderNome: string,
  poderesReq: string[],
  poderesSelecionados: Set<string>,
): void {
  for (const nomeReq of poderesReq) {
    if (!poderesSelecionados.has(nomeReq)) {
      throw new PoderGenericoRequisitoPoderException(poderNome, nomeReq);
    }
  }
}
