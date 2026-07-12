import { describe, expect, it } from 'vitest';
import { resolverEstadoAmizadeParticipante } from './amizade-participantes';

describe('resolverEstadoAmizadeParticipante', () => {
  it('identifica o proprio usuario', () => {
    expect(
      resolverEstadoAmizadeParticipante({
        participanteUsuarioId: 4,
        usuarioAtualId: 4,
      }),
    ).toBe('proprio');
  });

  it('identifica amigo existente', () => {
    expect(
      resolverEstadoAmizadeParticipante({
        participanteUsuarioId: 9,
        usuarioAtualId: 4,
        amigoIds: new Set([9]),
      }),
    ).toBe('amigo');
  });

  it('identifica solicitacao enviada', () => {
    expect(
      resolverEstadoAmizadeParticipante({
        participanteUsuarioId: 9,
        usuarioAtualId: 4,
        solicitacoesEnviadasIds: new Set([9]),
      }),
    ).toBe('solicitacao-enviada');
  });

  it('identifica solicitacao recebida', () => {
    expect(
      resolverEstadoAmizadeParticipante({
        participanteUsuarioId: 9,
        usuarioAtualId: 4,
        solicitacoesRecebidasIds: new Set([9]),
      }),
    ).toBe('solicitacao-recebida');
  });

  it('marca usuario sem relacionamento como adicionavel', () => {
    expect(
      resolverEstadoAmizadeParticipante({
        participanteUsuarioId: 9,
        usuarioAtualId: 4,
      }),
    ).toBe('adicionavel');
  });
});
