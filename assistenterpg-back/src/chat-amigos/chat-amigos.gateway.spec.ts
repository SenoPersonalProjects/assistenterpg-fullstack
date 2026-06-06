import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Socket } from 'socket.io';
import { PresencaGateway } from 'src/amizades/presenca.gateway';
import { PresencaService } from 'src/amizades/presenca.service';
import { AUTH_ACCESS_COOKIE } from 'src/auth/auth-security.config';
import { AuthSessionService } from 'src/auth/auth-session.service';
import { ChatAmigosGateway } from './chat-amigos.gateway';

type SocketTeste = Socket & {
  data: { sessaoId?: number; usuarioId?: number };
  disconnectMock: jest.Mock;
};

function criarSocket(data: SocketTeste['data'] = {}): SocketTeste {
  const disconnectMock = jest.fn();
  return {
    id: 'socket-1',
    data,
    disconnect: disconnectMock,
    disconnectMock,
    handshake: {
      auth: {},
      headers: { cookie: `${AUTH_ACCESS_COOKIE}=access-token` },
      query: {},
    },
    join: jest.fn(),
  } as unknown as SocketTeste;
}

describe('ChatAmigosGateway', () => {
  let authSessionService: { validarSessaoAccess: jest.Mock };
  let configService: { get: jest.Mock };
  let jwtService: { verify: jest.Mock };
  let presencaService: {
    registrarConexao: jest.Mock;
    removerConexao: jest.Mock;
  };
  let gateway: ChatAmigosGateway;

  beforeEach(() => {
    authSessionService = { validarSessaoAccess: jest.fn().mockResolvedValue() };
    configService = { get: jest.fn().mockReturnValue('1') };
    jwtService = { verify: jest.fn() };
    presencaService = {
      registrarConexao: jest.fn().mockReturnValue(false),
      removerConexao: jest
        .fn()
        .mockReturnValue({ mudouStatus: false, usuarioId: undefined }),
    };
    gateway = new ChatAmigosGateway(
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
      authSessionService as unknown as AuthSessionService,
      presencaService as unknown as PresencaService,
      {
        emitirSnapshotsParaUsuarioEAmigos: jest.fn(),
      } as unknown as PresencaGateway,
    );
  });

  afterEach(() => {
    gateway.onModuleDestroy();
    jest.useRealTimers();
  });

  it('rejeita conexão quando o JWT não possui sid', async () => {
    jwtService.verify.mockReturnValue({ sub: 7 });
    const client = criarSocket();

    await gateway.handleConnection(client);

    expect(client.disconnectMock).toHaveBeenCalledWith(true);
    expect(presencaService.registrarConexao).not.toHaveBeenCalled();
  });

  it('revalida sessão antes de sincronizar chat', async () => {
    const client = criarSocket({ sessaoId: 11, usuarioId: 7 });

    const resultado = await gateway.handleSync(client);

    expect(resultado).toEqual({ ok: true });
    expect(authSessionService.validarSessaoAccess).toHaveBeenCalledWith(11, 7);
    expect(client.disconnectMock).not.toHaveBeenCalled();
  });

  it('desconecta sessão revogada antes de sincronizar chat', async () => {
    authSessionService.validarSessaoAccess.mockRejectedValue(
      new Error('revogada'),
    );
    const client = criarSocket({ sessaoId: 11, usuarioId: 7 });

    const resultado = await gateway.handleSync(client);

    expect(resultado).toEqual({ ok: false });
    expect(client.disconnectMock).toHaveBeenCalledWith(true);
  });

  it('desconecta sessão revogada na rechecagem periódica', async () => {
    jest.useFakeTimers();
    authSessionService.validarSessaoAccess
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('revogada'));
    jwtService.verify.mockReturnValue({ sub: 7, sid: 11 });
    const client = criarSocket();

    await gateway.handleConnection(client);
    gateway.afterInit();
    await jest.advanceTimersByTimeAsync(1000);

    expect(client.disconnectMock).toHaveBeenCalledWith(true);
  });
});
