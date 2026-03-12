// lib/types/auth.types.ts
/**
 * Types relacionados à autenticação e sessão
 */

export type LoginResponse = {
  access_token: string;
  usuario: {
    id: number;
    apelido: string;
    email: string;
    role: string;
    emailVerificado: boolean;
  };
};
