// src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.errors.ts
import { Prisma } from '@prisma/client';
import { handlePrismaError } from 'src/common/exceptions/database.exception';

export function tratarErroPrisma(error: unknown): void {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientValidationError
  ) {
    handlePrismaError(error);
  }
}
