import { BadRequestException } from '@nestjs/common';

type PrismaPericiaLookup = {
  pericia: {
    findUnique(args: {
      where: { codigo: string };
      select: { codigo: true };
    }): Promise<{ codigo: string } | null>;
  };
};

type ModificacaoComCodigo = {
  codigo: string | null | undefined;
};

export type EstadoItemInventarioNormalizado = {
  periciaCodigo?: string | null;
  funcoesAdicionaisPericias?: string[];
};

export const CODIGOS_EQUIPAMENTOS_PERICIA_PERSONALIZADA = new Set([
  'KIT_PERICIA_PERSONALIZADO',
  'UTENSILIO_PERSONALIZADO',
  'VESTIMENTA_PERSONALIZADA',
]);

export const CODIGO_MOD_FUNCAO_ADICIONAL = 'MOD_FUNCAO_ADICIONAL';

const CODIGOS_PERICIAS_PROIBIDAS_ITEM_PERSONALIZADO = new Set([
  'LUTA',
  'PONTARIA',
]);

export function equipamentoUsaPericiaPersonalizada(equipamento: {
  codigo: string | null | undefined;
}): boolean {
  return (
    typeof equipamento.codigo === 'string' &&
    CODIGOS_EQUIPAMENTOS_PERICIA_PERSONALIZADA.has(equipamento.codigo)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizarPericiaCodigo(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const codigoNormalizado = value.trim().toUpperCase();
  return codigoNormalizado.length > 0 ? codigoNormalizado : null;
}

function extrairPericiaCodigoDoEstado(estado: unknown): string | null {
  if (!isRecord(estado)) return null;
  return normalizarPericiaCodigo(estado.periciaCodigo);
}

function extrairFuncoesAdicionaisDoEstado(estado: unknown): string[] {
  if (!isRecord(estado)) return [];
  const raw = estado.funcoesAdicionaisPericias;
  if (!Array.isArray(raw)) return [];

  return raw
    .map((codigo) => normalizarPericiaCodigo(codigo))
    .filter((codigo): codigo is string => Boolean(codigo));
}

async function validarPericiaExiste(
  db: PrismaPericiaLookup,
  periciaCodigo: string,
  mensagemErro: string,
): Promise<void> {
  const periciaExiste = await db.pericia.findUnique({
    where: { codigo: periciaCodigo },
    select: { codigo: true },
  });

  if (!periciaExiste) {
    throw new BadRequestException(mensagemErro);
  }
}

export function itemTemFuncaoAdicional(params: {
  modificacoes: ModificacaoComCodigo[];
  estado?: unknown;
}): boolean {
  const possuiModificacao = params.modificacoes.some(
    (mod) => mod.codigo === CODIGO_MOD_FUNCAO_ADICIONAL,
  );
  if (possuiModificacao) return true;

  return extrairFuncoesAdicionaisDoEstado(params.estado).length > 0;
}

export function contarInstanciasFuncaoAdicional(estado: unknown): number {
  return extrairFuncoesAdicionaisDoEstado(estado).length;
}

export async function validarENormalizarEstadoItemPersonalizado(
  db: PrismaPericiaLookup,
  equipamento: { codigo: string | null | undefined },
  estado: unknown,
  options?: {
    modificacoes?: ModificacaoComCodigo[];
    periciaBaseBonificada?: string | null | undefined;
  },
): Promise<EstadoItemInventarioNormalizado> {
  const resultado: EstadoItemInventarioNormalizado = {
    ...(isRecord(estado) ? estado : {}),
  };

  if (equipamentoUsaPericiaPersonalizada(equipamento)) {
    const periciaCodigo = extrairPericiaCodigoDoEstado(estado);

    if (!periciaCodigo) {
      throw new BadRequestException(
        'Itens personalizados exigem a selecao de uma pericia beneficiada.',
      );
    }

    if (CODIGOS_PERICIAS_PROIBIDAS_ITEM_PERSONALIZADO.has(periciaCodigo)) {
      throw new BadRequestException(
        'Itens personalizados nao podem beneficiar Luta ou Pontaria.',
      );
    }

    await validarPericiaExiste(
      db,
      periciaCodigo,
      'A pericia escolhida para o item personalizado e invalida.',
    );

    resultado.periciaCodigo = periciaCodigo;
  } else {
    delete resultado.periciaCodigo;
  }

  const funcoesAdicionaisAtivas = itemTemFuncaoAdicional({
    modificacoes: options?.modificacoes ?? [],
    estado,
  });

  if (!funcoesAdicionaisAtivas) {
    delete resultado.funcoesAdicionaisPericias;
    return resultado;
  }

  const funcoesAdicionaisPericias = extrairFuncoesAdicionaisDoEstado(estado);
  if (funcoesAdicionaisPericias.length === 0) {
    throw new BadRequestException(
      'A modificacao Funcao Adicional exige ao menos uma pericia extra.',
    );
  }

  const periciaBaseBonificada = normalizarPericiaCodigo(
    options?.periciaBaseBonificada,
  );
  const periciasUnicas = new Set<string>();

  for (const periciaCodigo of funcoesAdicionaisPericias) {
    if (CODIGOS_PERICIAS_PROIBIDAS_ITEM_PERSONALIZADO.has(periciaCodigo)) {
      throw new BadRequestException(
        'Funcao Adicional nao pode beneficiar Luta ou Pontaria.',
      );
    }

    if (resultado.periciaCodigo && periciaCodigo === resultado.periciaCodigo) {
      throw new BadRequestException(
        'Funcao Adicional nao pode repetir a pericia principal do item.',
      );
    }

    if (periciaBaseBonificada && periciaCodigo === periciaBaseBonificada) {
      throw new BadRequestException(
        'Funcao Adicional nao pode escolher a mesma pericia base do acessorio.',
      );
    }

    if (periciasUnicas.has(periciaCodigo)) {
      throw new BadRequestException(
        'Funcao Adicional nao pode repetir a mesma pericia extra no mesmo item.',
      );
    }

    await validarPericiaExiste(
      db,
      periciaCodigo,
      'A pericia escolhida para Funcao Adicional e invalida.',
    );

    periciasUnicas.add(periciaCodigo);
  }

  resultado.funcoesAdicionaisPericias = Array.from(periciasUnicas);
  return resultado;
}
