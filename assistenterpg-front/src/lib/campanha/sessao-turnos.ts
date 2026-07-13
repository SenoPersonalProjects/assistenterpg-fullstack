import { criarErroUsuario } from '../api/error-handler';
import type { ControleTurnoSessaoCampanhaPayload } from '../api/campanhas';
import type { SessaoCampanhaDetalhe, UserErrorState } from '../types';

const MENSAGEM_TIMEOUT_EFEITOS_TURNO =
  'A sessão demorou para processar efeitos automáticos. Tente novamente.';

export function montarPrecondicaoControleTurno(
  detalhe: {
    rodadaAtual: SessaoCampanhaDetalhe['rodadaAtual'];
    iniciativa: Pick<SessaoCampanhaDetalhe['iniciativa'], 'indiceAtual'>;
    iniciativaAlternada?: {
      ativo: boolean;
      ladoAtualId: number | null;
    } | null;
  },
): ControleTurnoSessaoCampanhaPayload {
  if (detalhe.iniciativaAlternada?.ativo) {
    return {
      rodadaEsperada: detalhe.rodadaAtual ?? 1,
      ladoAtualIdEsperado:
        detalhe.iniciativaAlternada.ladoAtualId ?? undefined,
    };
  }

  return {
    rodadaEsperada: detalhe.rodadaAtual ?? 1,
    indiceTurnoEsperado: detalhe.iniciativa.indiceAtual ?? 0,
  };
}

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
