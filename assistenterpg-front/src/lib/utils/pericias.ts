// lib/utils/pericias.ts
/**
 * Utilitários de perícias (cálculos, validações, formatação)
 */

export type GrauTreinamentoNome = 'Não treinado' | 'Treinado' | 'Graduado' | 'Veterano' | 'Expert';
export type AtributoBaseCodigo = 'AGI' | 'FOR' | 'INT' | 'PRE' | 'VIG';

/**
 * Converte valor numérico de grau para nome legível
 */
export function getNomeGrau(valor: number): GrauTreinamentoNome {
  switch (valor) {
    case 5:
      return 'Treinado';
    case 10:
      return 'Graduado';
    case 15:
      return 'Veterano';
    case 20:
      return 'Expert';
    default:
      return 'Não treinado';
  }
}

/**
 * Converte nome do grau para valor numérico
 */
export function getValorGrau(nome: GrauTreinamentoNome): number {
  switch (nome) {
    case 'Treinado':
      return 5;
    case 'Graduado':
      return 10;
    case 'Veterano':
      return 15;
    case 'Expert':
      return 20;
    default:
      return 0;
  }
}

/**
 * Valida se um grau pode ser aplicado baseado no nível do personagem
 */
export function validarLimiteGrauPorNivel(grauNovo: number, nivel: number): boolean {
  if (grauNovo === 10 && nivel < 3) return false; // Graduado só no nível 3+
  if (grauNovo === 15 && nivel < 9) return false; // Veterano só no nível 9+
  if (grauNovo === 20 && nivel < 16) return false; // Expert só no nível 16+
  return true;
}

/**
 * Retorna os níveis que concedem graus de treinamento
 */
export function getNiveisGrausTreinamento(): number[] {
  return [3, 7, 11, 16];
}

/**
 * Calcula o número máximo de melhorias por nível
 */
export function calcularMaxMelhorias(intelecto: number): number {
  return 2 + intelecto;
}

/**
 * Retorna próximo grau disponível baseado no grau atual
 */
export function getProximoGrau(grauAtual: number): number | null {
  if (grauAtual >= 20) return null; // Já está no máximo
  return grauAtual + 5;
}

/**
 * Valida se uma perícia pode receber melhoria de grau
 */
export function podeReceberMelhoria(
  grauAtual: number,
  grauNovo: number,
  nivel: number,
): { valido: boolean; mensagem?: string } {
  // Verificar se já está no máximo
  if (grauAtual >= 20) {
    return { valido: false, mensagem: 'Perícia já está no grau máximo (Expert)' };
  }

  // Verificar progressão (+5)
  if (grauNovo !== grauAtual + 5) {
    return { valido: false, mensagem: 'Grau deve aumentar em +5' };
  }

  // Verificar limite por nível
  if (!validarLimiteGrauPorNivel(grauNovo, nivel)) {
    const nomeGrau = getNomeGrau(grauNovo);
    return { valido: false, mensagem: `${nomeGrau} requer nível mínimo` };
  }

  return { valido: true };
}

/**
 * Retorna informações sobre limites de grau por nível
 */
export function getLimitesGrauInfo(): {
  graduado: { nivel: number; nome: GrauTreinamentoNome };
  veterano: { nivel: number; nome: GrauTreinamentoNome };
  expert: { nivel: number; nome: GrauTreinamentoNome };
} {
  return {
    graduado: { nivel: 3, nome: 'Graduado' },
    veterano: { nivel: 9, nome: 'Veterano' },
    expert: { nivel: 16, nome: 'Expert' },
  };
}

/**
 * Calcula o bônus total de uma perícia incluindo bonusExtra (fontes fixas duplicadas)
 */
export function calcularBonusGrau(grauTreinamento: number, bonusExtra: number): number {
  return grauTreinamento * 5 + bonusExtra;
}

/**
 * Formata bônus para exibição com sinal
 */
export function formatarBonus(bonus: number): string {
  return bonus >= 0 ? `+${bonus}` : `${bonus}`;
}

/**
 * Agrupa perícias por atributo base
 */
export function agruparPericiasPorAtributo<T extends { atributoBase: AtributoBaseCodigo }>(
  pericias: T[],
): Record<AtributoBaseCodigo, T[]> {
  const grupos: Partial<Record<AtributoBaseCodigo, T[]>> = {};

  for (const pericia of pericias) {
    if (!grupos[pericia.atributoBase]) {
      grupos[pericia.atributoBase] = [];
    }
    grupos[pericia.atributoBase]!.push(pericia);
  }

  return grupos as Record<AtributoBaseCodigo, T[]>;
}

/**
 * Calcula breakdown detalhado do bônus de uma perícia
 */
export function calcularBreakdownPericia(
  grauTreinamento: number,
  bonusExtra: number,
  bonusAtributo: number,
): {
  grauBase: number;
  bonusExtra: number;
  bonusAtributo: number;
  total: number;
  detalhes: string;
} {
  const grauBase = grauTreinamento * 5;
  const total = grauBase + bonusExtra + bonusAtributo;

  const partes: string[] = [];
  if (grauBase > 0) partes.push(`${grauBase} (${getNomeGrau(grauBase)})`);
  if (bonusExtra > 0) partes.push(`+${bonusExtra} (fonte fixa)`);
  partes.push(`${formatarBonus(bonusAtributo)} (atributo)`);

  return {
    grauBase,
    bonusExtra,
    bonusAtributo,
    total,
    detalhes: partes.join(' '),
  };
}

/**
 * Obtém nome completo do atributo base
 */
export function getNomeAtributo(codigo: AtributoBaseCodigo): string {
  switch (codigo) {
    case 'AGI':
      return 'Agilidade';
    case 'FOR':
      return 'Força';
    case 'INT':
      return 'Intelecto';
    case 'PRE':
      return 'Presença';
    case 'VIG':
      return 'Vigor';
  }
}

/**
 * Ordena perícias alfabeticamente
 */
export function ordenarPericiasAlfabeticamente<T extends { nome: string }>(
  pericias: T[],
): T[] {
  return [...pericias].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

/**
 * Calcula o grau atual de uma perícia considerando melhorias de níveis anteriores
 */
export function calcularGrauComMelhorias(
  grauInicial: number,
  bonusExtra: number,
  melhorias: Array<{ periciaCodigo: string; nivel: number }>,
  periciaCodigo: string,
  nivelAtual: number,
): number {
  // Incluir bonusExtra no cálculo base
  let grau = grauInicial * 5 + bonusExtra;

  // Somar melhorias de níveis anteriores ao nível atual
  const melhoriasDaPericias = melhorias.filter(
    (m) => m.periciaCodigo === periciaCodigo && m.nivel < nivelAtual,
  );

  grau += melhoriasDaPericias.length * 5;

  return grau;
}
