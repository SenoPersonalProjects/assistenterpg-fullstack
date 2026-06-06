import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Socket } from 'socket.io';
import { AUTH_ACCESS_COOKIE } from 'src/auth/auth-security.config';
import { AuthSessionService } from 'src/auth/auth-session.service';
import { SessaoGateway } from './sessao.gateway';
import { SessaoService } from './sessao.service';

type SocketTeste = Socket & {
  data: { sessaoId?: number; usuarioId?: number };
  disconnectMock: jest.Mock;
  emitMock: jest.Mock;
  joinMock: jest.Mock;
};

function criarSocket(data: SocketTeste['data'] = {}): SocketTeste {
  const disconnectMock = jest.fn();
  const emitMock = jest.fn();
  const joinMock = jest.fn();
  return {
    id: 'socket-1',
    data,
    disconnect: disconnectMock,
    disconnectMock,
    emit: emitMock,
    emitMock,
    handshake: {
      auth: {},
      headers: { cookie: `${AUTH_ACCESS_COOKIE}=access-token` },
      query: {},
    },
    join: joinMock,
    joinMock,
  } as unknown as SocketTeste;
}

describe('SessaoGateway', () => {
  let authSessionService: { validarSessaoAccess: jest.Mock };
  let configService: { get: jest.Mock };
  let jwtService: { verify: jest.Mock };
  let sessaoService: { validarAcessoSessao: jest.Mock };
  let gateway: SessaoGateway;

  beforeEach(() => {
    authSessionService = { validarSessaoAccess: jest.fn().mockResolvedValue() };
    configService = { get: jest.fn().mockReturnValue('1') };
    jwtService = { verify: jest.fn() };
    sessaoService = { validarAcessoSessao: jest.fn().mockResolvedValue() };
    gateway = new SessaoGateway(
      sessaoService as unknown as SessaoService,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
      authSessionService as unknown as AuthSessionService,
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
    expect(authSessionService.validarSessaoAccess).not.toHaveBeenCalled();
    expect(client.data).toEqual({});
  });

  it('armazena sid e usuário após validar a sessão da conexão', async () => {
    jwtService.verify.mockReturnValue({ sub: 7, sid: 11 });
    const client = criarSocket();

    await gateway.handleConnection(client);

    expect(authSessionService.validarSessaoAccess).toHaveBeenCalledWith(11, 7);
    expect(client.data).toEqual({ sessaoId: 11, usuarioId: 7 });
    expect(client.disconnectMock).not.toHaveBeenCalled();
  });

  it('revalida sessão antes do evento e desconecta quando ela foi revogada', async () => {
    authSessionService.validarSessaoAccess.mockRejectedValue(
      new Error('revogada'),
    );
    const client = criarSocket({ sessaoId: 11, usuarioId: 7 });

    const resultado = await gateway.handleJoinSala(client, {
      campanhaId: 1,
      sessaoId: 2,
    });

    expect(resultado).toEqual({ ok: false });
    expect(authSessionService.validarSessaoAccess).toHaveBeenCalledWith(11, 7);
    expect(sessaoService.validarAcessoSessao).not.toHaveBeenCalled();
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

  it('emite ACESSO_NEGADO quando o usuário tenta entrar em sessão sem permissão', async () => {
    sessaoService.validarAcessoSessao.mockRejectedValue(new Error('negado'));
    const client = criarSocket({ sessaoId: 11, usuarioId: 7 });

    const resultado = await gateway.handleJoinSala(client, {
      campanhaId: 1,
      sessaoId: 2,
    });

    expect(resultado).toEqual({ ok: false });
    expect(sessaoService.validarAcessoSessao).toHaveBeenCalledWith(1, 2, 7);
    expect(client.joinMock).not.toHaveBeenCalled();
    expect(client.emitMock).toHaveBeenCalledWith('sessao:erro', {
      code: 'ACESSO_NEGADO',
    });
  });
});
