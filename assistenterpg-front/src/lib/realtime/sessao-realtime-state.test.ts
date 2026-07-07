import { describe, expect, it } from 'vitest';
import {
  erroSessaoFatal,
  normalizarOnlineUsuarioIds,
  snapshotPertenceSessao,
} from './sessao-realtime-state';

describe('sessao realtime state helpers', () => {
  it('identifica erros fatais de acesso/autenticacao', () => {
    expect(erroSessaoFatal({ code: 'ACESSO_NEGADO' })).toBe(true);
    expect(erroSessaoFatal({ code: 'JOIN_INVALIDO' })).toBe(true);
    expect(erroSessaoFatal({ code: 'TIMEOUT_TRANSITORIO' })).toBe(false);
    expect(erroSessaoFatal(null)).toBe(false);
  });

  it('valida snapshot da sessao correta', () => {
    const snapshot = {
      campanhaId: 10,
      sessaoId: 20,
      onlineUsuarioIds: [3],
      em: new Date().toISOString(),
    };

    expect(snapshotPertenceSessao(snapshot, 10, 20)).toBe(true);
    expect(snapshotPertenceSessao(snapshot, 10, 21)).toBe(false);
    expect(
      snapshotPertenceSessao(
        { ...snapshot, onlineUsuarioIds: undefined as unknown as number[] },
        10,
        20,
      ),
    ).toBe(false);
  });

  it('normaliza ids online removendo duplicados e valores invalidos', () => {
    expect(normalizarOnlineUsuarioIds([4, 2, 4, '3', 1.5, 1])).toEqual([1, 2, 4]);
    expect(normalizarOnlineUsuarioIds(null)).toEqual([]);
  });
});
