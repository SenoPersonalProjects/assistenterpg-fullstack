// src/tecnicas-amaldicoadas/engine/tecnicas-amaldicoadas.engine.ts
import { Prisma } from '@prisma/client';

export function normalizarJsonOuNull(
  value: unknown,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
  if (value === undefined || value === null) {
    return Prisma.JsonNull;
  }

  return value as Prisma.InputJsonValue;
}

export function normalizarJsonOpcional(
  value: unknown,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return Prisma.JsonNull;
  }

  return value as Prisma.InputJsonValue;
}
