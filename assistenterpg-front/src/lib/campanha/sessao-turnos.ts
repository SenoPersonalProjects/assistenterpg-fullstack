import { criarErroUsuario } from '../api/error-handler';
import type { UserErrorState } from '../types';

const MENSAGEM_TIMEOUT_EFEITOS_TURNO =
  'A sessão demorou para processar efeitos automáticos. Tente novamente.';

export function criarErroControleTurno(error: unknown): UserErrorState {
  const erroUsuario = criarErroUsuario(error);
  if (erroUsuario.code === 'DB_P2028') {
    return {
      ...erroUsuario,
      message: MENSAGEM_TIMEOUT_EFEITOS_TURNO,
    };
  }

  return erroUsuario;
}
