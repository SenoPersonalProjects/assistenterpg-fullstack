import { BadRequestException } from '@nestjs/common';

type PrismaPericiaLookup = {
  pericia: {
    findUnique(args: {
      where: { codigo: string };
      select: { codigo: true };
    }): Promise<{ codigo: string } | null>;
  };
};

export const CODIGOS_EQUIPAMENTOS_PERICIA_PERSONALIZADA = new Set([
  'UTENSILIO_PERSONALIZADO',
  'VESTIMENTA_PERSONALIZADA',
]);

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

function extrairPericiaCodigoDoEstado(estado: unknown): string | null {
  if (!isRecord(estado)) return null;

  const periciaCodigo = estado.periciaCodigo;
  if (typeof periciaCodigo !== 'string') return null;

  const codigoNormalizado = periciaCodigo.trim().toUpperCase();
  return codigoNormalizado.length > 0 ? codigoNormalizado : null;
}

export async function validarENormalizarEstadoItemPersonalizado(
  db: PrismaPericiaLookup,
  equipamento: { codigo: string | null | undefined },
  estado: unknown,
): Promise<unknown> {
  if (!equipamentoUsaPericiaPersonalizada(equipamento)) {
    return estado;
  }

  const periciaCodigo = extrairPericiaCodigoDoEstado(estado);

  if (!periciaCodigo) {
    throw new BadRequestException(
      'Itens personalizados exigem a seleção de uma perícia beneficiada.',
    );
  }

  if (CODIGOS_PERICIAS_PROIBIDAS_ITEM_PERSONALIZADO.has(periciaCodigo)) {
    throw new BadRequestException(
      'Itens personalizados não podem beneficiar Luta ou Pontaria.',
    );
  }

  const periciaExiste = await db.pericia.findUnique({
    where: { codigo: periciaCodigo },
    select: { codigo: true },
  });

  if (!periciaExiste) {
    throw new BadRequestException(
      'A perícia escolhida para o item personalizado é inválida.',
    );
  }

  return {
    ...(isRecord(estado) ? estado : {}),
    periciaCodigo,
  };
}
