import { Prisma, TipoEquipamento, TipoModificacao } from '@prisma/client';
import type { PrismaClient, GrauFeiticeiro } from '@prisma/client';
import type { LimitesPorCategoria } from './_types';

// =======================
// UTILITÁRIOS BÁSICOS
// =======================

export function jsonOrNull(
  value: Prisma.InputJsonValue | null | undefined,
): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  if (value === undefined || value === null) return Prisma.JsonNull;
  return value;
}

export function seedError(message: string): Error {
  return new Error(`[seed] ${message}`);
}

// =======================
// LOOKUPS GENÉRICOS
// =======================

export async function requireByNome<T extends { id: number }>(
  prisma: PrismaClient,
  model:
    | 'classe'
    | 'cla'
    | 'origem'
    | 'habilidade'
    | 'trilha'
    | 'caminho'
    | 'alinhamento',
  nome: string,
): Promise<T> {
  const row = await (prisma as any)[model].findUnique({ where: { nome } });
  if (!row) throw seedError(`${model} não encontrado por nome: "${nome}"`);
  return row as T;
}

export async function requireByCodigo<T extends { id: number; codigo: string }>(
  prisma: PrismaClient,
  model:
    | 'pericia'
    | 'proficiencia'
    | 'tipoGrau'
    | 'resistenciaTipo'
    | 'passivaAtributo'
    | 'habilidade',
  codigo: string,
): Promise<T> {
  const row = await (prisma as any)[model].findUnique({ where: { codigo } });
  if (!row) throw seedError(`${model} não encontrado por código: "${codigo}"`);
  return row as T;
}

export async function requireEquipamentoByCodigo<T extends { id: number }>(
  prisma: PrismaClient,
  codigo: string,
): Promise<T> {
  const row = await prisma.equipamentoCatalogo.findUnique({ where: { codigo } });
  if (!row) throw seedError(`equipamentoCatalogo não encontrado por código: "${codigo}"`);
  return row as unknown as T;
}

// =======================
// CACHE DE LOOKUPS
// =======================

export function createLookupCache(prisma: PrismaClient) {
  const cacheNum = new Map<string, number>();
  const cacheStr = new Map<string, string>();

  const key = (model: string, field: string, value: string) => `${model}:${field}:${value}`;

  return {
    async classeId(nome: string) {
      const k = key('classe', 'nome', nome);
      if (cacheNum.has(k)) return cacheNum.get(k)!;
      const row = await requireByNome<{ id: number }>(prisma, 'classe', nome);
      cacheNum.set(k, row.id);
      return row.id;
    },

    async claId(nome: string) {
      const k = key('cla', 'nome', nome);
      if (cacheNum.has(k)) return cacheNum.get(k)!;
      const row = await requireByNome<{ id: number }>(prisma, 'cla', nome);
      cacheNum.set(k, row.id);
      return row.id;
    },

    async origemId(nome: string) {
      const k = key('origem', 'nome', nome);
      if (cacheNum.has(k)) return cacheNum.get(k)!;
      const row = await requireByNome<{ id: number }>(prisma, 'origem', nome);
      cacheNum.set(k, row.id);
      return row.id;
    },

    async habilidadeId(nome: string) {
      const k = key('habilidade', 'nome', nome);
      if (cacheNum.has(k)) return cacheNum.get(k)!;
      const row = await requireByNome<{ id: number }>(prisma, 'habilidade', nome);
      cacheNum.set(k, row.id);
      return row.id;
    },

    async habilidadeCodigo(codigo: string) {
      const k = key('habilidade', 'codigo', codigo);
      if (cacheNum.has(k)) return cacheNum.get(k)!;
      const row = await requireByCodigo<{ id: number; codigo: string }>(
        prisma,
        'habilidade',
        codigo,
      );
      cacheNum.set(k, row.id);
      return row.id;
    },

    async trilhaId(nome: string) {
      const k = key('trilha', 'nome', nome);
      if (cacheNum.has(k)) return cacheNum.get(k)!;
      const row = await requireByNome<{ id: number }>(prisma, 'trilha', nome);
      cacheNum.set(k, row.id);
      return row.id;
    },

    async caminhoId(nome: string) {
      const k = key('caminho', 'nome', nome);
      if (cacheNum.has(k)) return cacheNum.get(k)!;
      const row = await requireByNome<{ id: number }>(prisma, 'caminho', nome);
      cacheNum.set(k, row.id);
      return row.id;
    },

    async periciaId(codigo: string) {
      const k = key('pericia', 'codigo', codigo);
      if (cacheNum.has(k)) return cacheNum.get(k)!;
      const row = await requireByCodigo<{ id: number; codigo: string }>(prisma, 'pericia', codigo);
      cacheNum.set(k, row.id);
      return row.id;
    },

    async proficienciaId(codigo: string) {
      const k = key('proficiencia', 'codigo', codigo);
      if (cacheNum.has(k)) return cacheNum.get(k)!;
      const row = await requireByCodigo<{ id: number; codigo: string }>(
        prisma,
        'proficiencia',
        codigo,
      );
      cacheNum.set(k, row.id);
      return row.id;
    },

    // Observação: em HabilidadeEfeitoGrau, a FK é por "tipoGrauCodigo" (string),
    // então aqui faz sentido retornar o próprio código (e cachear string).
    async tipoGrauCodigo(codigo: string) {
      const k = key('tipoGrau', 'codigo', codigo);
      if (cacheStr.has(k)) return cacheStr.get(k)!;
      const row = await requireByCodigo<{ id: number; codigo: string }>(prisma, 'tipoGrau', codigo);
      cacheStr.set(k, row.codigo);
      return row.codigo;
    },

    async resistenciaTipoId(codigo: string) {
      const k = key('resistenciaTipo', 'codigo', codigo);
      if (cacheNum.has(k)) return cacheNum.get(k)!;
      const row = await requireByCodigo<{ id: number; codigo: string }>(
        prisma,
        'resistenciaTipo',
        codigo,
      );
      cacheNum.set(k, row.id);
      return row.id;
    },

    async alinhamentoId(nome: string) {
      const k = key('alinhamento', 'nome', nome);
      if (cacheNum.has(k)) return cacheNum.get(k)!;
      const row = await requireByNome<{ id: number }>(prisma, 'alinhamento', nome);
      cacheNum.set(k, row.id);
      return row.id;
    },

    async equipamentoId(codigo: string) {
      const k = key('equipamentoCatalogo', 'codigo', codigo);
      if (cacheNum.has(k)) return cacheNum.get(k)!;
      const row = await requireEquipamentoByCodigo<{ id: number }>(prisma, codigo);
      cacheNum.set(k, row.id);
      return row.id;
    },

    async grauFeiticeiroLimiteId(grau: GrauFeiticeiro) {
      const k = key('grauFeiticeiroLimite', 'grau', grau);
      if (cacheNum.has(k)) return cacheNum.get(k)!;

      const row = await prisma.grauFeiticeiroLimite.findUnique({
        where: { grau },
      });

      if (!row) throw seedError(`grauFeiticeiroLimite não encontrado por grau: "${grau}"`);
      cacheNum.set(k, row.id);
      return row.id;
    },
  };
}

// =======================
// HELPERS DE INVENTÁRIO
// =======================

export function calcularEspacosInventario(forca: number): number {
  if (forca <= 0) return 2;
  return forca * 5;
}

export function calcularLimiteCargaMaxima(forca: number): number {
  return calcularEspacosInventario(forca) * 2;
}

// compat: mantém o nome antigo, mas direciona pro correto
export function calcularLimiteCaregaMaxima(forca: number): number {
  return calcularLimiteCargaMaxima(forca);
}

export function verificarSobrecarregado(espacosUsados: number, forca: number): boolean {
  const capacidade = calcularEspacosInventario(forca);
  const limiteMaximo = calcularLimiteCargaMaxima(forca);
  return espacosUsados > capacidade && espacosUsados <= limiteMaximo;
}

export function verificarUltrapassouLimite(espacosUsados: number, forca: number): boolean {
  return espacosUsados > calcularLimiteCargaMaxima(forca);
}

// =======================
// HELPERS DE LIMITES POR GRAU
// =======================

function normalizarLimitesPorCategoria(
  limites: unknown,
): LimitesPorCategoria | null {
  if (limites === null || limites === undefined) return null;

  // Caso venha como string (ex: do seed antigo)
  if (typeof limites === 'string') {
    try {
      const obj = JSON.parse(limites);
      if (obj && typeof obj === 'object') return obj as LimitesPorCategoria;
      return null;
    } catch {
      return null;
    }
  }

  // Caso venha como objeto JSON (Prisma Json)
  if (typeof limites === 'object') {
    return limites as LimitesPorCategoria;
  }

  return null;
}

export function obterLimiteCategoria(
  limitesPorCategoria: LimitesPorCategoria | Prisma.JsonValue | string | null | undefined,
  categoria: number | string,
): number {
  const limites = normalizarLimitesPorCategoria(limitesPorCategoria);
  if (!limites) return 0;

  const limite = (limites as any)[String(categoria)];
  return typeof limite === 'number' ? limite : 999;
}

export function validarLimiteCategoria(
  limitesPorCategoria: LimitesPorCategoria | Prisma.JsonValue | string | null | undefined,
  categoria: number | string,
  quantidadeAtual: number,
): boolean {
  const limite = obterLimiteCategoria(limitesPorCategoria, categoria);
  return quantidadeAtual <= limite;
}

export function descricaoGrauFeiticeiro(grau: GrauFeiticeiro): string {
  const desc: Record<GrauFeiticeiro, string> = {
    GRAU_4: 'Grau 4',
    GRAU_3: 'Grau 3',
    GRAU_2: 'Grau 2',
    SEMI_1: 'Semi-1',
    GRAU_1: 'Grau 1',
    ESPECIAL: 'Especial',
  };
  return desc[grau] ?? String(grau);
}

// =======================
// HELPERS DE DANOS
// =======================

export function parsarDanoComFlat(danoStr: string): { valorFlat: number; rolagem: string } {
  const s = danoStr.trim();

  // 2d6+3
  let m = s.match(/^(\d+d\d+)\s*\+\s*(\d+)$/i);
  if (m) return { rolagem: m[1], valorFlat: parseInt(m[2], 10) };

  // 3+2d6
  m = s.match(/^(\d+)\s*\+\s*(\d+d\d+)$/i);
  if (m) return { rolagem: m[2], valorFlat: parseInt(m[1], 10) };

  // só dado: 2d6
  m = s.match(/^(\d+d\d+)$/i);
  if (m) return { rolagem: m[1], valorFlat: 0 };

  // só flat: 3
  m = s.match(/^(\d+)$/);
  if (m) return { rolagem: '0d0', valorFlat: parseInt(m[1], 10) };

  // fallback: mantém como rolagem
  return { rolagem: s, valorFlat: 0 };
}

export function validarFormatoDano(danoStr: string): boolean {
  const s = danoStr.trim();
  return (
    /^(\d+d\d+)(\s*\+\s*\d+)?$/i.test(s) ||
    /^(\d+)(\s*\+\s*\d+d\d+)?$/i.test(s)
  );
}

// =======================
// HELPERS DE MODIFICAÇÕES
// =======================

export function calcularCategoriaComModificacao(categoriaOriginal: number, temModificacao: boolean): number {
  if (!temModificacao) return categoriaOriginal;
  return categoriaOriginal + 1;
}

export function validarModificacaoAplicavel(
  tipoModificacao: TipoModificacao,
  tipoEquipamento: TipoEquipamento,
): boolean {
  const mapeamento: Record<TipoModificacao, TipoEquipamento[]> = {
    CORPO_A_CORPO_E_DISPARO: [TipoEquipamento.ARMA],
    ARMA_FOGO: [TipoEquipamento.ARMA],
    MUNICAO: [TipoEquipamento.MUNICAO],
    PROTECAO: [TipoEquipamento.PROTECAO],
    ACESSORIO: [TipoEquipamento.ACESSORIO],
  };

  const tiposPermitidos = mapeamento[tipoModificacao] ?? [];
  return tiposPermitidos.includes(tipoEquipamento);
}
