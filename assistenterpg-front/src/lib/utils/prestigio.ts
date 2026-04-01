// lib/utils/prestigio.ts
/**
 * Utilitários de prestígio e Grau Xamã
 */

export type GrauXama = {
  grau: string;
  nome: string;
  limiteCredito: string;
  limitesPorCategoria: Record<string, number>;
};

export type NivelPrestigioCla = {
  nome: string;
  descricao: string;
};

const ORDEM_GRAUS_XAMA: GrauXama[] = [
  {
    grau: 'ESPECIAL',
    nome: 'Especial',
    limiteCredito: 'ILIMITADO',
    limitesPorCategoria: {
      '0': 999,
      '4': 5,
      '3': 4,
      '2': 4,
      '1': 3,
      ESPECIAL: 3,
    },
  },
  {
    grau: 'GRAU_1',
    nome: 'Grau 1',
    limiteCredito: 'ALTO',
    limitesPorCategoria: {
      '0': 999,
      '4': 5,
      '3': 4,
      '2': 3,
      '1': 2,
      ESPECIAL: 2,
    },
  },
  {
    grau: 'SEMI_1',
    nome: 'Semi-1',
    limiteCredito: 'MEDIO',
    limitesPorCategoria: {
      '0': 999,
      '4': 4,
      '3': 2,
      '2': 2,
      '1': 1,
      ESPECIAL: 1,
    },
  },
  {
    grau: 'GRAU_2',
    nome: 'Grau 2',
    limiteCredito: 'MEDIO',
    limitesPorCategoria: {
      '0': 999,
      '4': 4,
      '3': 2,
      '2': 2,
      '1': 1,
      ESPECIAL: 0,
    },
  },
  {
    grau: 'GRAU_3',
    nome: 'Grau 3',
    limiteCredito: 'MEDIO',
    limitesPorCategoria: {
      '0': 999,
      '4': 3,
      '3': 1,
      '2': 1,
      '1': 0,
      ESPECIAL: 0,
    },
  },
  {
    grau: 'GRAU_4',
    nome: 'Grau 4',
    limiteCredito: 'BAIXO',
    limitesPorCategoria: {
      '0': 999,
      '4': 2,
      '3': 0,
      '2': 0,
      '1': 0,
      ESPECIAL: 0,
    },
  },
];

/**
 * ✅ SINCRONIZADO COM BACKEND (prisma/seeds/catalogos/graus-xama.ts)
 * ✅ CORRIGIDO: Incluído categoria '0' (CATEGORIA_0) - sempre ilimitada
 * 
 * Encontra o grau correto baseado no prestígio do personagem.
 * Usado no frontend antes de persistir (wizard).
 * Após persistir, sempre usar dados do backend.
 */
export function getGrauXamaPorPrestigio(prestigio: number): GrauXama {
  // Encontrar o grau elegível (maior prestígio que o personagem possui)
  return (
    ORDEM_GRAUS_XAMA.find((g) => prestigio >= getPrestigioMinimoPorGrau(g.grau)) ||
    ORDEM_GRAUS_XAMA[ORDEM_GRAUS_XAMA.length - 1] // Fallback para GRAU_4
  );
}

export function getLimiteCreditoComBonus(
  grau: string,
  bonus: number,
): string {
  const bonusNormalizado = Math.max(0, Math.floor(bonus || 0));
  const indiceBase = ORDEM_GRAUS_XAMA.findIndex((g) => g.grau === grau);
  if (indiceBase < 0) {
    return ORDEM_GRAUS_XAMA[ORDEM_GRAUS_XAMA.length - 1].limiteCredito;
  }

  const indiceFinal = Math.max(0, indiceBase - bonusNormalizado);
  return ORDEM_GRAUS_XAMA[indiceFinal]?.limiteCredito ?? ORDEM_GRAUS_XAMA[indiceBase].limiteCredito;
}

/**
 * Retorna prestigio mínimo para cada grau
 * ✅ SINCRONIZADO COM BACKEND (prisma/seeds/catalogos/graus-xama.ts)
 */
function getPrestigioMinimoPorGrau(grau: string): number {
  const minimos: Record<string, number> = {
    ESPECIAL: 200,
    GRAU_1: 120,
    SEMI_1: 90,
    GRAU_2: 60,
    GRAU_3: 30,
    GRAU_4: 0,
  };
  return minimos[grau] || 0;
}

/**
 * Formatação visual do grau
 */
export function formatarGrauXama(grau: string): string {
  const nomes: Record<string, string> = {
    GRAU_4: 'Grau 4',
    GRAU_3: 'Grau 3',
    GRAU_2: 'Grau 2',
    SEMI_1: 'Semi-1',
    GRAU_1: 'Grau 1',
    ESPECIAL: 'Especial',
  };
  return nomes[grau] || grau;
}

/**
 * Nível de prestígio no clã
 */
export function getNivelPrestigioCla(prestigio: number): NivelPrestigioCla {
  if (prestigio >= 80)
    return {
      nome: 'Líder do Clã',
      descricao: 'Máxima autoridade',
    };
  if (prestigio >= 50) return { nome: 'Alto', descricao: 'Muito respeitado' };
  if (prestigio >= 30) return { nome: 'Médio', descricao: 'Bem reconhecido' };
  if (prestigio >= 10) return { nome: 'Básico', descricao: 'Membro comum' };
  if (prestigio === 0) return { nome: 'Nenhum', descricao: 'Sem prestígio' };
  return { nome: 'Negativo', descricao: 'Vergonha do clã' };
}
