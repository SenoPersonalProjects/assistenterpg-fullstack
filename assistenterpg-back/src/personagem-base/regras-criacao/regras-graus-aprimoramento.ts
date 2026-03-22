// src/personagem-base/regras-criacao/regras-graus-aprimoramento.ts

import { PassivasAtributoConfigDto } from '../dto/create-personagem-base.dto';
import {
  GrauAprimoramentoNaoInteiroException,
  GrauAprimoramentoForaDoLimiteException,
  GrauAprimoramentoExcedeMaximoComBonusException,
  GrauAprimoramentoExcedeMaximoComPoderesException,
} from 'src/common/exceptions/personagem.exception';

export function calcularGrausLivresMax(nivel: number): number {
  const marcos = [2, 8, 14, 18];
  return marcos.filter((m) => nivel >= m).length;
}

export type GrauLivre = { tipoGrauCodigo: string; valor: number };

/**
 * ✅ Interface para efeitos de grau de habilidades
 */
export interface EfeitoGrauHabilidade {
  tipoGrauCodigo: string;
  valor: number;
  escalonamentoPorNivel?: {
    niveis: number[];
  } | null;
}

/**
 * ✅ Interface para mecânicas especiais de habilidades
 */
export interface MecanicasEspeciaisHabilidade {
  graus_livres?: {
    quantidade: number;
    escalonamentoPorNivel?: {
      niveis: number[];
    } | null;
    escolhas_permitidas?: string[];
  };
  escolha?: {
    tipo: string;
    [key: string]: unknown;
  };
  acoes?: Record<string, string>;
  itens?: Record<string, number>;
  escolhas?: Record<string, boolean>;
  inventario?: {
    espacosExtra?: number;
    somarIntelecto?: boolean;
  };
}

/**
 * ✅ Interface para habilidades do personagem
 */
export interface HabilidadePersonagem {
  habilidadeId: number;
  habilidade: {
    nome: string;
    tipo?: string;
    efeitosGrau: EfeitoGrauHabilidade[];
    mecanicasEspeciais?: MecanicasEspeciaisHabilidade | null;
  };
}

/**
 * ✅ Novo helper: calcula pontos livres extras (habilidades + Intelecto II)
 */
export function calcularGrausLivresExtras(
  habilidades: HabilidadePersonagem[],
  nivelPersonagem: number,
  passivasAtributosConfig?: PassivasAtributoConfigDto | null,
): {
  deHabilidades: number;
  deIntelecto: number;
  totalExtras: number;
} {
  const deHabilidades = calcularGrausLivresDeHabilidades(
    habilidades,
    nivelPersonagem,
  );

  const deIntelecto = passivasAtributosConfig?.INT_II
    ?.tipoGrauCodigoAprimoramento
    ? 1
    : 0;

  return {
    deHabilidades,
    deIntelecto,
    totalExtras: deHabilidades + deIntelecto,
  };
}

/**
 * ✅ NOVO: Calcula bônus de graus vindos de poderes genéricos com escolha dinâmica
 * (Ex.: Treinamento Específico escolhe um tipo de grau via config)
 */
export function calcularBonusGrausDePoderesGenericos(
  poderes: Array<{ habilidadeId: number; config?: unknown }>,
  habilidades: HabilidadePersonagem[],
): Map<string, number> {
  const bonusMap = new Map<string, number>();

  const habPorId = new Map(
    habilidades.map((h) => [h.habilidadeId, h.habilidade]),
  );

  for (const inst of poderes) {
    const hab = habPorId.get(inst.habilidadeId);
    if (!hab) continue;

    const mec = hab.mecanicasEspeciais;
    if (mec?.escolha?.tipo !== 'TIPO_GRAU') continue;

    const codigo =
      typeof inst.config === 'object' &&
      inst.config !== null &&
      !Array.isArray(inst.config)
        ? (inst.config as Record<string, unknown>).tipoGrauCodigo
        : undefined;
    if (typeof codigo !== 'string') continue;

    const atual = bonusMap.get(codigo) ?? 0;
    bonusMap.set(codigo, atual + 1);
  }

  return bonusMap;
}

export function aplicarRegrasDeGraus(
  params: {
    nivel: number;
    habilidades: HabilidadePersonagem[];
    poderes?: Array<{ habilidadeId: number; config?: unknown }>; // ✅ NOVO
    passivasAtributosConfig?: PassivasAtributoConfigDto | null;
  },
  grausLivres: GrauLivre[],
): GrauLivre[] {
  const { nivel, habilidades, poderes } = params;

  // 0) Normalizar: somar duplicados por código (entrada do usuário já tratada)
  const mapa = new Map<string, number>();
  for (const g of grausLivres ?? []) {
    mapa.set(g.tipoGrauCodigo, (mapa.get(g.tipoGrauCodigo) ?? 0) + g.valor);
  }

  // Bônus fixos por habilidades (efeitosGrau)
  const bonusHabilidades = calcularBonusDeHabilidades(habilidades, nivel);

  // ✅ NOVO: Bônus de poderes genéricos (escolha dinâmica)
  const bonusPoderes = calcularBonusGrausDePoderesGenericos(
    poderes ?? [],
    habilidades,
  );

  // Apenas informativo, usado em logs/preview
  // 1) Validar faixa atual (0–5) ANTES dos bônus de habilidades
  for (const [codigo, valor] of mapa.entries()) {
    if (!Number.isInteger(valor)) {
      throw new GrauAprimoramentoNaoInteiroException(codigo, valor);
    }
    if (valor < 0 || valor > 5) {
      throw new GrauAprimoramentoForaDoLimiteException(codigo, valor);
    }
  }

  // 2) Aplicar bônus de habilidades (classe, trilha, etc.)
  for (const [codigo, bonus] of bonusHabilidades.entries()) {
    const atual = mapa.get(codigo) ?? 0;
    const novo = atual + bonus;

    // Validar que bônus não ultrapassa 5
    if (novo > 5) {
      throw new GrauAprimoramentoExcedeMaximoComBonusException(
        codigo,
        novo,
        bonus,
      );
    }

    mapa.set(codigo, novo);
  }

  // ✅ NOVO: 3) Aplicar bônus de poderes genéricos
  for (const [codigo, bonus] of bonusPoderes.entries()) {
    const atual = mapa.get(codigo) ?? 0;
    const novo = atual + bonus;

    // Validar que bônus não ultrapassa 5
    if (novo > 5) {
      throw new GrauAprimoramentoExcedeMaximoComPoderesException(
        codigo,
        novo,
        bonus,
      );
    }

    mapa.set(codigo, novo);
  }

  // 4) Retornar (filtrar zeros para não criar registros inúteis)
  return Array.from(mapa.entries())
    .filter(([, valor]) => valor > 0)
    .map(([tipoGrauCodigo, valor]) => ({ tipoGrauCodigo, valor }));
}

/**
 * ✅ Calcula bônus de graus concedidos por habilidades do personagem
 */
function calcularBonusDeHabilidades(
  habilidades: HabilidadePersonagem[],
  nivelPersonagem: number,
): Map<string, number> {
  const bonusMapa = new Map<string, number>();

  for (const hab of habilidades) {
    for (const efeito of hab.habilidade.efeitosGrau) {
      const { tipoGrauCodigo, valor, escalonamentoPorNivel } = efeito;

      let bonusTotal = valor;

      // Se tem escalonamento por nível
      if (escalonamentoPorNivel?.niveis) {
        const niveisAtingidos = escalonamentoPorNivel.niveis.filter(
          (n) => nivelPersonagem >= n,
        ).length;
        bonusTotal = niveisAtingidos * valor;
      }

      const atual = bonusMapa.get(tipoGrauCodigo) ?? 0;
      bonusMapa.set(tipoGrauCodigo, atual + bonusTotal);
    }
  }

  return bonusMapa;
}

/**
 * ✅ Calcula graus livres adicionais concedidos por habilidades
 * (Ex.: Saber Ampliado da trilha Graduado)
 */
function calcularGrausLivresDeHabilidades(
  habilidades: HabilidadePersonagem[],
  nivelPersonagem: number,
): number {
  let total = 0;

  for (const hab of habilidades) {
    const mecanicas = hab.habilidade.mecanicasEspeciais;

    if (mecanicas?.graus_livres) {
      const { quantidade, escalonamentoPorNivel } = mecanicas.graus_livres;

      if (escalonamentoPorNivel?.niveis) {
        const niveisAtingidos = escalonamentoPorNivel.niveis.filter(
          (n) => nivelPersonagem >= n,
        ).length;
        total += niveisAtingidos * quantidade;
      } else {
        total += quantidade;
      }
    }
  }

  return total;
}
