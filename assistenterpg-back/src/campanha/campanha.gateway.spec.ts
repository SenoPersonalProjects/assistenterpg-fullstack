import type { Socket } from 'socket.io';
import { CampanhaGateway } from './campanha.gateway';
import { AUTH_ACCESS_COOKIE } from 'src/auth/auth-security.config';

function criarSocket(data: Record<string, number> = {}) {
  return {
    id: 'socket-campanha',
    data,
    handshake: {
      headers: { cookie: `${AUTH_ACCESS_COOKIE}=token` },
      auth: {},
      query: {},
    },
    emit: jest.fn(),
    join: jest.fn(),
    disconnect: jest.fn(),
  } as unknown as Socket & {
    emit: jest.Mock;
    join: jest.Mock;
    disconnect: jest.Mock;
    data: { sessaoId?: number; usuarioId?: number };
  };
}

describe('CampanhaGateway', () => {
  const acesso = { garantirAcesso: jest.fn().mockResolvedValue({}) };
  const jwt = { verify: jest.fn().mockReturnValue({ sub: 7, sid: 11 }) };
  const config = { get: jest.fn().mockReturnValue('30') };
  const auth = { validarSessaoAccess: jest.fn().mockResolvedValue(undefined) };

  beforeEach(() => jest.clearAllMocks());

  it('autentica, revalida e entra somente na sala da campanha autorizada', async () => {
    const gateway = new CampanhaGateway(
      acesso as never,
      jwt as never,
      config as never,
      auth as never,
    );
    const socket = criarSocket();
    await gateway.handleConnection(socket as never);
    const resposta = await gateway.entrar(socket as never, { campanhaId: 3 });
    expect(auth.validarSessaoAccess).toHaveBeenCalledWith(11, 7);
    expect(acesso.garantirAcesso).toHaveBeenCalledWith(3, 7);
    expect(socket.join).toHaveBeenCalledWith('campanha:3');
    expect(resposta).toEqual({ ok: true, campanhaId: 3 });
  });

  it('emite atualizacao e giro apenas para a sala da campanha', () => {
    const gateway = new CampanhaGateway(
      acesso as never,
      jwt as never,
      config as never,
      auth as never,
    );
    const emit = jest.fn();
    const to = jest.fn().mockReturnValue({ emit });
    (gateway as unknown as { server: { to: jest.Mock } }).server = { to };
    gateway.emitirRoletaAtualizada(4, 'PRESET_ATUALIZADO');
    gateway.emitirGiro(4, { giro: { animacaoId: '1:2' } });
    expect(to).toHaveBeenCalledWith('campanha:4');
    expect(emit).toHaveBeenCalledWith(
      'campanha:roleta-atualizada',
      expect.objectContaining({ campanhaId: 4 }),
    );
    expect(emit).toHaveBeenCalledWith(
      'campanha:roleta-giro',
      expect.objectContaining({ campanhaId: 4 }),
    );
  });
});
