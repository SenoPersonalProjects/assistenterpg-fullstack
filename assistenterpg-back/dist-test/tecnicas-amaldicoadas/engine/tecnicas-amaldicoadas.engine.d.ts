import { Prisma } from '@prisma/client';
export declare function normalizarJsonOuNull(value: unknown): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
export declare function normalizarJsonOpcional(value: unknown): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined;
