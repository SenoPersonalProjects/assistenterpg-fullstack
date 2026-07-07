import { describe, expect, it } from 'vitest';
import {
  criarEstadoSessaoRealtimeInicial,
  erroSessaoFatal,
  marcarSessaoRealtimeOnline,
  marcarSessaoRealtimePolling,
  marcarSessaoRealtimeReconectando,
  normalizarOnlineUsuarioIds,
  snapshotPertenceSessao,
} from './sessao-realtime-state';

describe('sessao realtime state helpers', () => {
  it('identifica erros fatais de acesso/autenticacao', () => {
    expect(erroSessaoFatal({ code: 'ACESSO_NEGADO' })).toBe(true);
    expect(erroSessaoFatal({ code: 'AUTH_AUSENTE' })).toBe(true);
    expect(erroSessaoFatal({ code: 'JOIN_INVALIDO' })).toBe(true);
    expect(erroSessaoFatal({ code: 'ERRO_DESCONHECIDO', fatal: true })).toBe(true);
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

  it('marca online com snapshot confirmado da sala', () => {
    const estado = marcarSessaoRealtimeOnline(
      criarEstadoSessaoRealtimeInicial(),
      {
        campanhaId: 10,
        sessaoId: 20,
        onlineUsuarioIds: [8, 7, 8],
        em: new Date().toISOString(),
      },
      10,
      20,
    );

    expect(estado).toEqual({
      socketConectado: true,
      realtimeStatus: 'online',
      onlineUsuarioIds: [7, 8],
    });
  });

  it('mantem snapshot em erro transitorio e fallback para polling', () => {
    const estadoOnline = {
      socketConectado: true,
      realtimeStatus: 'online' as const,
      onlineUsuarioIds: [7, 8],
    };
    const reconectando = marcarSessaoRealtimeReconectando(estadoOnline);
    const polling = marcarSessaoRealtimePolling(reconectando);

    expect(reconectando).toEqual({
      socketConectado: false,
      realtimeStatus: 'reconnecting',
      onlineUsuarioIds: [7, 8],
    });
    expect(polling).toEqual({
      socketConectado: false,
      realtimeStatus: 'polling',
      onlineUsuarioIds: [7, 8],
    });
  });

  it('limpa presença local no estado inicial usado pelo cleanup', () => {
    expect(criarEstadoSessaoRealtimeInicial()).toEqual({
      socketConectado: false,
      realtimeStatus: 'polling',
      onlineUsuarioIds: [],
    });
  });
});
