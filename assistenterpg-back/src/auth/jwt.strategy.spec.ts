import { ConfigService } from '@nestjs/config';
import { StatusContaUsuario } from '@prisma/client';
import {
  TokenInvalidoException,
  UsuarioTokenNaoEncontradoException,
} from 'src/common/exceptions/auth.exception';
import { UsuarioNaoEncontradoException } from 'src/common/exceptions/usuario.exception';
import { UsuarioService } from 'src/usuario/usuario.service';
import { AuthSessionService } from './auth-session.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usuarioService: { buscarPorId: jest.Mock };
  let authSessionService: { validarSessaoAccess: jest.Mock };

  beforeEach(() => {
    usuarioService = {
      buscarPorId: jest.fn(),
    };
    authSessionService = {
      validarSessaoAccess: jest.fn().mockResolvedValue(undefined),
    };
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') return 'test-secret';
        if (key === 'NODE_ENV') return 'test';
        return undefined;
      }),
    };

    strategy = new JwtStrategy(
      usuarioService as unknown as UsuarioService,
      authSessionService as unknown as AuthSessionService,
      configService as unknown as ConfigService,
    );
  });

  it('rejeita JWT sem sid antes de consultar usuario', async () => {
    await expect(
      strategy.validate({ sub: 7, email: 'usuario@example.com' }),
    ).rejects.toBeInstanceOf(TokenInvalidoException);

    expect(authSessionService.validarSessaoAccess).not.toHaveBeenCalled();
    expect(usuarioService.buscarPorId).not.toHaveBeenCalled();
  });

  it('valida sid e retorna identidade apenas para conta ativa e verificada', async () => {
    usuarioService.buscarPorId.mockResolvedValue({
      id: 7,
      email: 'usuario@example.com',
      apelido: 'Usuario',
      role: 'USUARIO',
      status: StatusContaUsuario.ATIVA,
      emailVerificadoEm: new Date(),
    });

    await expect(
      strategy.validate({ sub: 7, email: 'usuario@example.com', sid: 11 }),
    ).resolves.toEqual({
      id: 7,
      email: 'usuario@example.com',
      apelido: 'Usuario',
      role: 'USUARIO',
      sid: 11,
    });
    expect(authSessionService.validarSessaoAccess).toHaveBeenCalledWith(11, 7);
  });

  it('rejeita sessao revogada com token invalido', async () => {
    authSessionService.validarSessaoAccess.mockRejectedValue(
      new Error('sessao revogada'),
    );

    await expect(
      strategy.validate({ sub: 7, email: 'usuario@example.com', sid: 11 }),
    ).rejects.toBeInstanceOf(TokenInvalidoException);
    expect(usuarioService.buscarPorId).not.toHaveBeenCalled();
  });

  it('mantem o erro especifico somente quando o usuario do token nao existe', async () => {
    usuarioService.buscarPorId.mockRejectedValue(
      new UsuarioNaoEncontradoException(7),
    );

    await expect(
      strategy.validate({ sub: 7, email: 'usuario@example.com', sid: 11 }),
    ).rejects.toBeInstanceOf(UsuarioTokenNaoEncontradoException);
  });
});
