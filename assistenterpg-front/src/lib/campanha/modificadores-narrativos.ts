import type {
  CampoModificadorPersonagemCampanha,
  ModificadorPersonagemCampanha,
} from "@/lib/types/campanha.types";

export function limitarGrauTreinamentoNarrativo(valor: number): number {
  return Math.max(0, Math.min(4, Math.trunc(valor)));
}

export function limitarGrauAprimoramentoNarrativo(valor: number): number {
  return Math.max(0, Math.trunc(valor));
}

export function calcularPreviewTreinamentoNarrativo(
  valorAtual: number,
  delta: number,
) {
  return {
    atual: valorAtual,
    proximo: limitarGrauTreinamentoNarrativo(valorAtual + delta),
  };
}

export function calcularPreviewGrauNarrativo(valorAtual: number, delta: number) {
  return {
    atual: valorAtual,
    proximo: limitarGrauAprimoramentoNarrativo(valorAtual + delta),
  };
}

export function formatarValorComSinal(valor: number): string {
  return valor > 0 ? `+${valor}` : String(valor);
}

export function formatarValorModificadorNarrativo(
  campo: CampoModificadorPersonagemCampanha,
  valor: number,
): string {
  if (campo === "PERICIA_TREINAMENTO") {
    const unidade = Math.abs(valor) === 1 ? "nível" : "níveis";
    return `${formatarValorComSinal(valor)} ${unidade}`;
  }

  if (campo === "GRAU_APRIMORAMENTO") {
    const unidade = Math.abs(valor) === 1 ? "grau" : "graus";
    return `${formatarValorComSinal(valor)} ${unidade}`;
  }

  if (campo === "PERICIA_BONUS") {
    return formatarValorComSinal(valor);
  }

  return formatarValorComSinal(valor);
}

export function obterAlvoModificadorNarrativo(
  modificador: ModificadorPersonagemCampanha,
): string | null {
  if (modificador.campo === "PERICIA_TREINAMENTO" || modificador.campo === "PERICIA_BONUS") {
    return modificador.pericia?.nome ?? modificador.periciaCodigo ?? null;
  }

  if (modificador.campo === "GRAU_APRIMORAMENTO") {
    return modificador.tipoGrau?.nome ?? modificador.tipoGrauCodigo ?? null;
  }

  if (modificador.campo === "ATRIBUTO") {
    return modificador.atributoCodigo ?? null;
  }

  return null;
}
