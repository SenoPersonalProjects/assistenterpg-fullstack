// src/campanha/engine/campanha.engine.ts
import {
  CampoPersonagemCampanhaNumerico,
  CampoRecursoAtual,
  PrismaUniqueErrorLike,
} from './campanha.engine.types';

export function lerCampoNumerico(
  personagem: Record<string, number | null>,
  campo: CampoPersonagemCampanhaNumerico | CampoRecursoAtual,
): number {
  const valor = personagem[campo];
  if (typeof valor !== 'number' || Number.isNaN(valor)) return 0;
  return valor;
}

export function clamp(valor: number, minimo: number, maximo: number): number {
  return Math.max(minimo, Math.min(maximo, valor));
}

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function gerarCodigoConvite(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function isUniqueConstraintViolation(
  error: unknown,
  campos: string[],
): boolean {
  const prismaError = error as PrismaUniqueErrorLike;
  if (prismaError?.code !== 'P2002') return false;

  const target = prismaError?.meta?.target;
  const targetValues = Array.isArray(target)
    ? target.map((value) => String(value))
    : typeof target === 'string'
      ? [target]
      : [];

  if (targetValues.length === 0) return false;

  return campos.every((campo) =>
    targetValues.some(
      (targetValue) => targetValue === campo || targetValue.includes(campo),
    ),
  );
}
