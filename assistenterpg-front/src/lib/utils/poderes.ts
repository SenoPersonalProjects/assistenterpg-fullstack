// lib/utils/poderes.ts
/**
 * UtilitÃ¡rios de poderes genÃ©ricos (validaÃ§Ãµes, requisitos)
 */

export type AtributoBaseCodigo = 'AGI' | 'FOR' | 'INT' | 'PRE' | 'VIG';

type RequisitoPericia = { codigo: string; grauMinimo: number; alternativa?: boolean };
type RequisitoGrau = { tipoGrauCodigo: string; valorMinimo: number };
type RequisitosAtributos = {
  alternativa?: boolean;
  [atributo: string]: number | boolean | undefined;
};
type RequisitosPoder = {
  nivelMinimo?: number;
  pericias?: RequisitoPericia[];
  atributos?: RequisitosAtributos;
  graus?: RequisitoGrau[];
  poderesPreRequisitos?: string[];
};

/**
 * Calcula quantos slots de poderes genÃ©ricos o personagem tem
 */
export function calcularSlotsPoderes(nivel: number): number {
  const niveisQueDaoPoder = [3, 6, 9, 12, 15, 18];
  return niveisQueDaoPoder.filter((n) => nivel >= n).length;
}

/**
 * Valida se o personagem atende aos requisitos de um poder genÃ©rico
 */
export function validarRequisitosPoder(
  requisitos: unknown | null | undefined,
  personagem: {
    nivel: number;
    pericias: Array<{ codigo: string; grauTreinamento: number }>;
    atributos: {
      agilidade: number;
      forca: number;
      intelecto: number;
      presenca: number;
      vigor: number;
    };
    graus: Record<string, number>;
    // Aceita IDs diretos OU instÃ¢ncias com { habilidadeId }
    poderesSelecionados: number[] | Array<{ habilidadeId: number }>;
    todosPoderes: Array<{ id: number; nome: string; requisitos?: unknown }>;
  },
): { atende: boolean; motivoNaoAtende?: string } {
  if (!requisitos || typeof requisitos !== 'object') return { atende: true };
  const requisitosObj = requisitos as RequisitosPoder;

  // Normaliza para array de IDs
  const idsSelecionados = personagem.poderesSelecionados.map((p) =>
    typeof p === 'number' ? p : p.habilidadeId,
  );

  // Validar nÃ­vel mÃ­nimo
  if (requisitosObj.nivelMinimo && personagem.nivel < requisitosObj.nivelMinimo) {
    return {
      atende: false,
      motivoNaoAtende: `Requer nÃ­vel ${requisitosObj.nivelMinimo}+`,
    };
  }

  // Validar perÃ­cias
  if (requisitosObj.pericias && Array.isArray(requisitosObj.pericias)) {
    const resultadoPericias = validarPericiasRequisito(
      requisitosObj.pericias,
      personagem.pericias,
    );
    if (!resultadoPericias.atende) return resultadoPericias;
  }

  // Validar atributos
  if (requisitosObj.atributos) {
    const resultadoAtributos = validarAtributosRequisito(
      requisitosObj.atributos,
      personagem.atributos,
    );
    if (!resultadoAtributos.atende) return resultadoAtributos;
  }

  // Validar graus
  if (requisitosObj.graus && Array.isArray(requisitosObj.graus)) {
    const resultadoGraus = validarGrausRequisito(requisitosObj.graus, personagem.graus);
    if (!resultadoGraus.atende) return resultadoGraus;
  }

  // Validar prÃ©-requisitos de outros poderes
  if (requisitosObj.poderesPreRequisitos && Array.isArray(requisitosObj.poderesPreRequisitos)) {
    const resultadoPoderes = validarPoderesPreRequisitos(
      requisitosObj.poderesPreRequisitos,
      idsSelecionados,
      personagem.todosPoderes,
    );
    if (!resultadoPoderes.atende) return resultadoPoderes;
  }

  return { atende: true };
}

/**
 * Valida perÃ­cias (suporta requisitos alternativos)
 */
function validarPericiasRequisito(
  periciasReq: Array<{ codigo: string; grauMinimo: number; alternativa?: boolean }>,
  pericias: Array<{ codigo: string; grauTreinamento: number }>,
): { atende: boolean; motivoNaoAtende?: string } {
  const periciasMap = new Map(pericias.map((p) => [p.codigo, p.grauTreinamento]));
  const temAlternativa = periciasReq.some((req) => req.alternativa);

  if (temAlternativa) {
    // OU: pelo menos uma deve ser atendida
    const atendeuAlguma = periciasReq.some((req) => {
      const grauAtual = periciasMap.get(req.codigo) ?? 0;
      return grauAtual >= req.grauMinimo;
    });

    if (!atendeuAlguma) {
      const opcoes = periciasReq.map((req) => req.codigo).join(' ou ');
      return {
        atende: false,
        motivoNaoAtende: `Requer ${opcoes} (grau ${periciasReq[0].grauMinimo}+)`,
      };
    }
  } else {
    // E: todas devem ser atendidas
    for (const req of periciasReq) {
      const grauAtual = periciasMap.get(req.codigo) ?? 0;

      if (grauAtual < req.grauMinimo) {
        return {
          atende: false,
          motivoNaoAtende: `Requer ${req.codigo} (grau ${req.grauMinimo}+)`,
        };
      }
    }
  }

  return { atende: true };
}

/**
 * Valida atributos (suporta requisitos alternativos)
 */
function validarAtributosRequisito(
  atributosReq: RequisitosAtributos,
  atributos: {
    agilidade: number;
    forca: number;
    intelecto: number;
    presenca: number;
    vigor: number;
  },
): { atende: boolean; motivoNaoAtende?: string } {
  const alternativa = atributosReq.alternativa;

  if (alternativa) {
    // OU: pelo menos um deve ser atendido
    const atendeuAlgum = Object.entries(atributosReq).some(([atrib, valorMin]) => {
      if (atrib === 'alternativa') return false;
      const valorAtual = atributos[atrib.toLowerCase() as keyof typeof atributos] ?? 0;
      return valorAtual >= (valorMin as number);
    });

    if (!atendeuAlgum) {
      const opcoes = Object.keys(atributosReq)
        .filter((k) => k !== 'alternativa')
        .map((k) => `${k.toUpperCase()} ${atributosReq[k]}+`)
        .join(' ou ');
      return { atende: false, motivoNaoAtende: `Requer ${opcoes}` };
    }
  } else {
    // E: todos devem ser atendidos
    for (const [atrib, valorMin] of Object.entries(atributosReq)) {
      if (atrib === 'alternativa') continue;

      const valorAtual = atributos[atrib.toLowerCase() as keyof typeof atributos] ?? 0;

      if (valorAtual < (valorMin as number)) {
        return {
          atende: false,
          motivoNaoAtende: `Requer ${atrib.toUpperCase()} ${valorMin}+`,
        };
      }
    }
  }

  return { atende: true };
}

/**
 * Valida graus de aprimoramento
 */
function validarGrausRequisito(
  grausReq: Array<{ tipoGrauCodigo: string; valorMinimo: number }>,
  graus: Record<string, number>,
): { atende: boolean; motivoNaoAtende?: string } {
  for (const req of grausReq) {
    const grauAtual = graus[req.tipoGrauCodigo] ?? 0;

    if (grauAtual < req.valorMinimo) {
      return {
        atende: false,
        motivoNaoAtende: `Requer ${req.tipoGrauCodigo} ${req.valorMinimo}+`,
      };
    }
  }

  return { atende: true };
}

/**
 * Valida prÃ©-requisitos de outros poderes
 */
function validarPoderesPreRequisitos(
  poderesReq: string[],
  poderesSelecionadosIds: number[],
  todosPoderes: Array<{ id: number; nome: string }>,
): { atende: boolean; motivoNaoAtende?: string } {
  const poderesMap = new Map(
    todosPoderes.filter((p) => poderesSelecionadosIds.includes(p.id)).map((p) => [p.nome, p.id]),
  );

  for (const nomeReq of poderesReq) {
    if (!poderesMap.has(nomeReq)) {
      return {
        atende: false,
        motivoNaoAtende: `Requer o poder "${nomeReq}"`,
      };
    }
  }

  return { atende: true };
}

/**
 * ObtÃ©m nÃ­veis que concedem poderes genÃ©ricos
 */
export function getNiveisQueDaoPoder(): number[] {
  return [3, 6, 9, 12, 15, 18];
}

/**
 * Verifica se um nÃ­vel especÃ­fico concede poder genÃ©rico
 */
export function nivelConcedePoder(nivel: number): boolean {
  return getNiveisQueDaoPoder().includes(nivel);
}

