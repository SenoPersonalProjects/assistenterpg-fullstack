import type { CampoModificadorPersonagemCampanha } from '@prisma/client';

export const GRAU_TREINAMENTO_MINIMO = 0;
export const GRAU_TREINAMENTO_MAXIMO = 4;

type ModificadorNarrativoEfetivo = {
  campo: CampoModificadorPersonagemCampanha;
  valor: number;
  ativo?: boolean | null;
  periciaCodigo?: string | null;
  tipoGrauCodigo?: string | null;
  atributoCodigo?: string | null;
  resistenciaTipoId?: number | null;
};

export function calcularBonusPorAtributoNarrativos(
  modificadores: ModificadorNarrativoEfetivo[] | null | undefined,
): Map<string, number> {
  const deltas = new Map<string, number>();
  for (const modificador of modificadores ?? []) {
    if (modificador.ativo === false || modificador.campo !== 'ATRIBUTO') continue;
    const codigo = normalizarCodigo(modificador.atributoCodigo);
    if (codigo) deltas.set(codigo, (deltas.get(codigo) ?? 0) + normalizarInteiro(modificador.valor));
  }
  return deltas;
}

export function calcularBonusPorResistenciaNarrativos(
  modificadores: ModificadorNarrativoEfetivo[] | null | undefined,
): Map<number, number> {
  const deltas = new Map<number, number>();
  for (const modificador of modificadores ?? []) {
    if (modificador.ativo === false || modificador.campo !== 'RESISTENCIA' || !modificador.resistenciaTipoId) continue;
    const id = modificador.resistenciaTipoId;
    deltas.set(id, (deltas.get(id) ?? 0) + normalizarInteiro(modificador.valor));
  }
  return deltas;
}

export function calcularVulnerabilidadesNarrativas(
  modificadores: ModificadorNarrativoEfetivo[] | null | undefined,
): Map<number, number> {
  const deltas = new Map<number, number>();
  for (const modificador of modificadores ?? []) {
    if (modificador.ativo === false || modificador.campo !== 'VULNERABILIDADE' || !modificador.resistenciaTipoId) continue;
    const id = modificador.resistenciaTipoId;
    deltas.set(id, (deltas.get(id) ?? 0) + 1);
  }
  return deltas;
}

export function calcularBonusDtFeiticosNarrativo(
  modificadores: ModificadorNarrativoEfetivo[] | null | undefined,
): number {
  return (modificadores ?? []).reduce(
    (total, modificador) => total + (modificador.ativo === false || modificador.campo !== 'BONUS_DT_FEITICOS' ? 0 : normalizarInteiro(modificador.valor)),
    0,
  );
}

export function calcularDeltasPericiaBonusNarrativos(
  modificadores: ModificadorNarrativoEfetivo[] | null | undefined,
): Map<string, number> {
  const deltas = new Map<string, number>();
  for (const modificador of modificadores ?? []) {
    if (modificador.ativo === false || modificador.campo !== 'PERICIA_BONUS') continue;
    const codigo = normalizarCodigo(modificador.periciaCodigo);
    if (codigo) deltas.set(codigo, (deltas.get(codigo) ?? 0) + normalizarInteiro(modificador.valor));
  }
  return deltas;
}

type PericiaBaseNarrativa = {
  grauTreinamento?: number | null;
  bonusExtra?: number | null;
  pericia?: {
    codigo?: string | null;
    nome?: string | null;
    atributoBase?: string | null;
  } | null;
};

type GrauBaseNarrativo = {
  valor?: number | null;
  tipoGrau?: {
    codigo?: string | null;
    nome?: string | null;
  } | null;
};

export type PericiaEfetivaCampanha = {
  codigo: string;
  nome: string;
  atributoBase: string;
  grauTreinamento: number;
  bonusTreinamento: number;
  bonusOutros: number;
  bonusTotal: number;
};

export type GrauAprimoramentoEfetivoCampanha = {
  tipoGrauCodigo: string;
  tipoGrauNome: string;
  valor: number;
};

function normalizarCodigo(codigo?: string | null): string {
  return typeof codigo === 'string' ? codigo.trim() : '';
}

function normalizarInteiro(valor: unknown, fallback = 0): number {
  const numero = Number(valor);
  return Number.isFinite(numero) ? Math.trunc(numero) : fallback;
}

export function limitarGrauTreinamentoNarrativo(valor: number): number {
  return Math.max(
    GRAU_TREINAMENTO_MINIMO,
    Math.min(GRAU_TREINAMENTO_MAXIMO, Math.trunc(valor)),
  );
}

export function limitarGrauAprimoramentoNarrativo(valor: number): number {
  return Math.max(0, Math.trunc(valor));
}

export function calcularDeltasPericiaNarrativos(
  modificadores: ModificadorNarrativoEfetivo[] | null | undefined,
): Map<string, number> {
  const deltas = new Map<string, number>();

  for (const modificador of modificadores ?? []) {
    if (
      modificador.ativo === false ||
      modificador.campo !== 'PERICIA_TREINAMENTO'
    ) {
      continue;
    }

    const codigo = normalizarCodigo(modificador.periciaCodigo);
    if (!codigo) continue;
    deltas.set(
      codigo,
      (deltas.get(codigo) ?? 0) + normalizarInteiro(modificador.valor),
    );
  }

  return deltas;
}

export function calcularDeltasGrausNarrativos(
  modificadores: ModificadorNarrativoEfetivo[] | null | undefined,
): Map<string, number> {
  const deltas = new Map<string, number>();

  for (const modificador of modificadores ?? []) {
    if (
      modificador.ativo === false ||
      modificador.campo !== 'GRAU_APRIMORAMENTO'
    ) {
      continue;
    }

    const codigo = normalizarCodigo(modificador.tipoGrauCodigo);
    if (!codigo) continue;
    deltas.set(
      codigo,
      (deltas.get(codigo) ?? 0) + normalizarInteiro(modificador.valor),
    );
  }

  return deltas;
}

export function calcularGrauTreinamentoEfetivo(
  grauBase: number,
  delta = 0,
): number {
  return limitarGrauTreinamentoNarrativo(
    normalizarInteiro(grauBase) + normalizarInteiro(delta),
  );
}

export function calcularGrauAprimoramentoEfetivo(
  grauBase: number,
  delta = 0,
): number {
  return limitarGrauAprimoramentoNarrativo(
    normalizarInteiro(grauBase) + normalizarInteiro(delta),
  );
}

export function resolverPericiasEfetivasCampanha(
  periciasBase: PericiaBaseNarrativa[] | null | undefined,
  modificadores: ModificadorNarrativoEfetivo[] | null | undefined,
): PericiaEfetivaCampanha[] {
  const deltas = calcularDeltasPericiaNarrativos(modificadores);
  const deltasBonus = calcularDeltasPericiaBonusNarrativos(modificadores);
  const mapa = new Map<
    string,
    {
      codigo: string;
      nome: string;
      atributoBase: string;
      grauTreinamento: number;
      bonusExtra: number;
    }
  >();

  for (const periciaBase of periciasBase ?? []) {
    const codigo = normalizarCodigo(periciaBase.pericia?.codigo);
    if (!codigo) continue;

    const grauBase = normalizarInteiro(periciaBase.grauTreinamento);
    const grauTreinamento = calcularGrauTreinamentoEfetivo(
      grauBase,
      deltas.get(codigo) ?? 0,
    );
    mapa.set(codigo, {
      codigo,
      nome: periciaBase.pericia?.nome?.trim() || codigo,
      atributoBase: periciaBase.pericia?.atributoBase?.trim() || '',
      grauTreinamento,
      bonusExtra: normalizarInteiro(periciaBase.bonusExtra),
    });
  }

  for (const [codigo, delta] of deltas.entries()) {
    if (mapa.has(codigo)) continue;
    const grauTreinamento = calcularGrauTreinamentoEfetivo(0, delta);
    if (grauTreinamento <= 0) continue;
    mapa.set(codigo, {
      codigo,
      nome: codigo,
      atributoBase: '',
      grauTreinamento,
      bonusExtra: 0,
    });
  }

  return Array.from(mapa.values())
    .map((pericia) => {
      const bonusTreinamento = pericia.grauTreinamento * 5;
      return {
        codigo: pericia.codigo,
        nome: pericia.nome,
        atributoBase: pericia.atributoBase,
        grauTreinamento: pericia.grauTreinamento,
        bonusTreinamento,
        bonusOutros: pericia.bonusExtra + (deltasBonus.get(pericia.codigo) ?? 0),
        bonusTotal: bonusTreinamento + pericia.bonusExtra + (deltasBonus.get(pericia.codigo) ?? 0),
      };
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

export function resolverGrausAprimoramentoEfetivosCampanha(
  grausBase: GrauBaseNarrativo[] | null | undefined,
  modificadores: ModificadorNarrativoEfetivo[] | null | undefined,
): GrauAprimoramentoEfetivoCampanha[] {
  const deltas = calcularDeltasGrausNarrativos(modificadores);
  const mapa = new Map<
    string,
    { tipoGrauCodigo: string; tipoGrauNome: string; valor: number }
  >();

  for (const grauBase of grausBase ?? []) {
    const codigo = normalizarCodigo(grauBase.tipoGrau?.codigo);
    if (!codigo) continue;
    mapa.set(codigo, {
      tipoGrauCodigo: codigo,
      tipoGrauNome: grauBase.tipoGrau?.nome?.trim() || codigo,
      valor: calcularGrauAprimoramentoEfetivo(
        normalizarInteiro(grauBase.valor),
        deltas.get(codigo) ?? 0,
      ),
    });
  }

  for (const [codigo, delta] of deltas.entries()) {
    if (mapa.has(codigo)) continue;
    const valor = calcularGrauAprimoramentoEfetivo(0, delta);
    if (valor <= 0) continue;
    mapa.set(codigo, {
      tipoGrauCodigo: codigo,
      tipoGrauNome: codigo,
      valor,
    });
  }

  return Array.from(mapa.values()).sort((a, b) =>
    a.tipoGrauNome.localeCompare(b.tipoGrauNome, 'pt-BR'),
  );
}
