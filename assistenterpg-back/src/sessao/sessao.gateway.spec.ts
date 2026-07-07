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

function criarSocket(
  data: SocketTeste['data'] = {},
  id = 'socket-1',
): SocketTeste {
  const disconnectMock = jest.fn();
  const emitMock = jest.fn();
  const joinMock = jest.fn();
  return {
    id,
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

function configurarServer(gateway: SessaoGateway) {
  const emitMock = jest.fn();
  const toMock = jest.fn().mockReturnValue({ emit: emitMock });
  (gateway as unknown as { server: { to: jest.Mock } }).server = {
    to: toMock,
  };
  return { emitMock, toMock };
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

  it('emite erro fatal quando o token esta ausente no handshake', async () => {
    const client = criarSocket();
    client.handshake.headers.cookie = '';

    await gateway.handleConnection(client);

    expect(client.emitMock).toHaveBeenCalledWith(
      'sessao:erro',
      expect.objectContaining({
        code: 'AUTH_AUSENTE',
        fatal: true,
      }),
    );
    expect(client.disconnectMock).toHaveBeenCalledWith(true);
  });

  it('emite erro fatal quando o token e invalido no handshake', async () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error('token invalido');
    });
    const client = criarSocket();

    await gateway.handleConnection(client);

    expect(client.emitMock).toHaveBeenCalledWith(
      'sessao:erro',
      expect.objectContaining({
        code: 'AUTH_INVALIDA',
        fatal: true,
      }),
    );
    expect(client.disconnectMock).toHaveBeenCalledWith(true);
  });

  it('rejeita conexão quando o JWT não possui sid', async () => {
    jwtService.verify.mockReturnValue({ sub: 7 });
    const client = criarSocket();

    await gateway.handleConnection(client);

    expect(client.emitMock).toHaveBeenCalledWith(
      'sessao:erro',
      expect.objectContaining({
        code: 'AUTH_INVALIDA',
        fatal: true,
      }),
    );
    expect(client.disconnectMock).toHaveBeenCalledWith(true);
    expect(authSessionService.validarSessaoAccess).not.toHaveBeenCalled();
    expect(client.data).toEqual({});
  });

  it('emite erro fatal quando a sessão do handshake foi revogada', async () => {
    jwtService.verify.mockReturnValue({ sub: 7, sid: 11 });
    authSessionService.validarSessaoAccess.mockRejectedValue(
      new Error('revogada'),
    );
    const client = criarSocket();

    await gateway.handleConnection(client);

    expect(client.emitMock).toHaveBeenCalledWith(
      'sessao:erro',
      expect.objectContaining({
        code: 'SESSAO_INVALIDA',
        fatal: true,
      }),
    );
    expect(client.disconnectMock).toHaveBeenCalledWith(true);
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

    expect(resultado).toEqual({
      ok: false,
      code: 'SESSAO_INVALIDA',
      fatal: true,
    });
    expect(authSessionService.validarSessaoAccess).toHaveBeenCalledWith(11, 7);
    expect(sessaoService.validarAcessoSessao).not.toHaveBeenCalled();
    expect(client.emitMock).toHaveBeenCalledWith(
      'sessao:erro',
      expect.objectContaining({
        code: 'SESSAO_INVALIDA',
        fatal: true,
      }),
    );
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

    expect(client.emitMock).toHaveBeenCalledWith(
      'sessao:erro',
      expect.objectContaining({
        code: 'SESSAO_INVALIDA',
        fatal: true,
      }),
    );
    expect(client.disconnectMock).toHaveBeenCalledWith(true);
  });

  it('emite ACESSO_NEGADO quando o usuário tenta entrar em sessão sem permissão', async () => {
    sessaoService.validarAcessoSessao.mockRejectedValue(new Error('negado'));
    const client = criarSocket({ sessaoId: 11, usuarioId: 7 });

    const resultado = await gateway.handleJoinSala(client, {
      campanhaId: 1,
      sessaoId: 2,
    });

    expect(resultado).toEqual({
      ok: false,
      code: 'ACESSO_NEGADO',
      fatal: true,
    });
    expect(sessaoService.validarAcessoSessao).toHaveBeenCalledWith(1, 2, 7);
    expect(client.joinMock).not.toHaveBeenCalled();
    expect(client.emitMock).toHaveBeenCalledWith(
      'sessao:erro',
      expect.objectContaining({
        code: 'ACESSO_NEGADO',
        fatal: true,
      }),
    );
  });

  it('registra presença no join e emite snapshot da sala', async () => {
    const { emitMock, toMock } = configurarServer(gateway);
    const client = criarSocket({ sessaoId: 11, usuarioId: 7 });

    const resultado = await gateway.handleJoinSala(client, {
      campanhaId: 1,
      sessaoId: 2,
    });

    expect(client.joinMock).toHaveBeenCalledWith('sessao:1:2');
    expect(resultado).toEqual({
      ok: true,
      presenca: expect.objectContaining({
        campanhaId: 1,
        sessaoId: 2,
        onlineUsuarioIds: [7],
      }),
    });
    expect(client.emitMock).toHaveBeenCalledWith(
      'sessao:joined',
      expect.objectContaining({
        campanhaId: 1,
        sessaoId: 2,
        presenca: expect.objectContaining({ onlineUsuarioIds: [7] }),
      }),
    );
    expect(toMock).toHaveBeenCalledWith('sessao:1:2');
    expect(emitMock).toHaveBeenCalledWith(
      'sessao:presenca',
      expect.objectContaining({ onlineUsuarioIds: [7] }),
    );
  });

  it('sincroniza snapshot sob demanda sem duplicar presença do mesmo socket', async () => {
    configurarServer(gateway);
    const client = criarSocket({ sessaoId: 11, usuarioId: 7 });

    await gateway.handleJoinSala(client, {
      campanhaId: 1,
      sessaoId: 2,
    });
    const resultado = await gateway.handleSyncSala(client, {
      campanhaId: 1,
      sessaoId: 2,
    });

    expect(resultado).toEqual({
      ok: true,
      presenca: expect.objectContaining({
        campanhaId: 1,
        sessaoId: 2,
        onlineUsuarioIds: [7],
      }),
    });
  });

  it('mantém usuário online enquanto houver outra conexão ativa', async () => {
    const { emitMock } = configurarServer(gateway);
    const primeiraAba = criarSocket({ sessaoId: 11, usuarioId: 7 }, 'socket-1');
    const segundaAba = criarSocket({ sessaoId: 11, usuarioId: 7 }, 'socket-2');

    await gateway.handleJoinSala(primeiraAba, { campanhaId: 1, sessaoId: 2 });
    await gateway.handleJoinSala(segundaAba, { campanhaId: 1, sessaoId: 2 });
    gateway.handleDisconnect(primeiraAba);

    expect(emitMock).toHaveBeenLastCalledWith(
      'sessao:presenca',
      expect.objectContaining({ onlineUsuarioIds: [7] }),
    );
  });

  it('limpa presença antes de desconectar sessão inválida', async () => {
    const { emitMock } = configurarServer(gateway);
    const primeiraAba = criarSocket({ sessaoId: 11, usuarioId: 7 }, 'socket-1');
    const segundaAba = criarSocket({ sessaoId: 11, usuarioId: 7 }, 'socket-2');

    await gateway.handleJoinSala(primeiraAba, { campanhaId: 1, sessaoId: 2 });
    await gateway.handleJoinSala(segundaAba, { campanhaId: 1, sessaoId: 2 });
    authSessionService.validarSessaoAccess.mockRejectedValueOnce(
      new Error('revogada'),
    );

    const resultado = await gateway.handleSyncSala(primeiraAba, {
      campanhaId: 1,
      sessaoId: 2,
    });
    emitMock.mockClear();
    gateway.handleDisconnect(segundaAba);

    expect(resultado).toEqual({
      ok: false,
      code: 'SESSAO_INVALIDA',
      fatal: true,
    });
    expect(primeiraAba.disconnectMock).toHaveBeenCalledWith(true);
    expect(emitMock).not.toHaveBeenCalled();
  });
});
