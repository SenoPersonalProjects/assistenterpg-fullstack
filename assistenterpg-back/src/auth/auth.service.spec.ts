import { RoleUsuario, TipoTokenAuth } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import { CredenciaisInvalidasException } from 'src/common/exceptions/auth.exception';
import { UsuarioService } from 'src/usuario/usuario.service';
import { AuthMailService } from './auth-mail.service';
import { AuthSessionService } from './auth-session.service';
import { AuthTokenService } from './auth-token.service';
import { AuthService } from './auth.service';

type UsuarioServiceMock = {
  criarUsuario: jest.Mock;
  buscarPorEmail: jest.Mock;
  buscarPorEmailOpcional: jest.Mock;
  atualizarSenhaHash: jest.Mock;
  marcarEmailComoVerificado: jest.Mock;
};

type AuthTokenServiceMock = {
  gerarToken: jest.Mock;
  consumirToken: jest.Mock;
  invalidarTokensAtivos: jest.Mock;
};

type AuthMailServiceMock = {
  enviarRecuperacaoSenha: jest.Mock;
  enviarVerificacaoEmail: jest.Mock;
};

type AuthSessionServiceMock = {
  criarSessao: jest.Mock;
};

describe('AuthService', () => {
  let service: AuthService;
  let usuarioService: UsuarioServiceMock;
  let authTokenService: AuthTokenServiceMock;
  let authMailService: AuthMailServiceMock;
  let authSessionService: AuthSessionServiceMock;

  beforeEach(() => {
    usuarioService = {
      criarUsuario: jest.fn(),
      buscarPorEmail: jest.fn(),
      buscarPorEmailOpcional: jest.fn(),
      atualizarSenhaHash: jest.fn(),
      marcarEmailComoVerificado: jest.fn(),
    };

    authTokenService = {
      gerarToken: jest.fn(),
      consumirToken: jest.fn(),
      invalidarTokensAtivos: jest.fn(),
    };

    authMailService = {
      enviarRecuperacaoSenha: jest.fn().mockResolvedValue(undefined),
      enviarVerificacaoEmail: jest.fn().mockResolvedValue(undefined),
    };

    authSessionService = {
      criarSessao: jest.fn().mockResolvedValue({ csrfToken: 'csrf-token' }),
    };

    service = new AuthService(
      usuarioService as unknown as UsuarioService,
      authTokenService as unknown as AuthTokenService,
      authMailService as unknown as AuthMailService,
      authSessionService as unknown as AuthSessionService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('cria sessao por cookie no login sem retornar access token', async () => {
    const usuario = {
      id: 1,
      email: 'usuario@example.com',
      apelido: 'Usuario',
      role: RoleUsuario.USUARIO,
      emailVerificadoEm: new Date(),
    };
    const request = { get: jest.fn(), ip: '127.0.0.1' };
    const response = { cookie: jest.fn() };

    const resposta = await service.login(
      usuario,
      true,
      request as unknown as Request,
      response as unknown as Response,
    );

    expect(authSessionService.criarSessao).toHaveBeenCalledWith(
      usuario,
      true,
      request,
      response,
    );
    expect(resposta).toEqual({
      usuario: {
        id: usuario.id,
        email: usuario.email,
        apelido: usuario.apelido,
        role: usuario.role,
        emailVerificado: true,
      },
    });
    expect(resposta).not.toHaveProperty('access_token');
  });

  it('usa a mesma excecao publica para email inexistente e senha errada', async () => {
    usuarioService.buscarPorEmail.mockRejectedValueOnce(
      new Error('usuario inexistente'),
    );

    await expect(
      service.validarUsuario('naoexiste@example.com', 'senha1234'),
    ).rejects.toBeInstanceOf(CredenciaisInvalidasException);

    const senhaHash = await bcrypt.hash('senha-correta', 4);
    usuarioService.buscarPorEmail.mockResolvedValueOnce({
      id: 1,
      email: 'usuario@example.com',
      apelido: 'Usuario',
      senhaHash,
      role: RoleUsuario.USUARIO,
      emailVerificadoEm: new Date(),
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });

    await expect(
      service.validarUsuario('usuario@example.com', 'senha-errada'),
    ).rejects.toBeInstanceOf(CredenciaisInvalidasException);
  });

  it('nao enumera email no fluxo de recuperacao de senha', async () => {
    usuarioService.buscarPorEmailOpcional.mockResolvedValueOnce(null);

    const respostaInexistente = await service.solicitarRecuperacaoSenha(
      'naoexiste@example.com',
    );

    authTokenService.invalidarTokensAtivos.mockResolvedValue(undefined);
    authTokenService.gerarToken.mockResolvedValue({
      token: 'token-recuperacao',
      expiraEm: new Date(),
    });
    usuarioService.buscarPorEmailOpcional.mockResolvedValueOnce({
      id: 1,
      email: 'usuario@example.com',
      apelido: 'Usuario',
    });

    const respostaExistente = await service.solicitarRecuperacaoSenha(
      'usuario@example.com',
    );

    expect(respostaExistente).toEqual(respostaInexistente);
    expect(authTokenService.gerarToken).toHaveBeenCalledWith(
      1,
      TipoTokenAuth.RECUPERACAO_SENHA,
      expect.any(Number),
    );
  });

  it('nao enumera email no reenvio de verificacao', async () => {
    usuarioService.buscarPorEmailOpcional.mockResolvedValueOnce(null);

    const respostaInexistente = await service.reenviarVerificacaoEmail(
      'naoexiste@example.com',
    );

    usuarioService.buscarPorEmailOpcional.mockResolvedValueOnce({
      id: 1,
      email: 'verificado@example.com',
      apelido: 'Usuario',
      emailVerificadoEm: new Date(),
    });

    const respostaVerificado = await service.reenviarVerificacaoEmail(
      'verificado@example.com',
    );

    expect(respostaVerificado).toEqual(respostaInexistente);
    expect(authMailService.enviarVerificacaoEmail).not.toHaveBeenCalled();
  });
});
