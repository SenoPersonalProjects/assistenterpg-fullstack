import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { StatusContaUsuario } from '@prisma/client';
import {
  TokenInvalidoException,
  UsuarioTokenNaoEncontradoException,
} from 'src/common/exceptions/auth.exception';
import { UsuarioNaoEncontradoException } from 'src/common/exceptions/usuario.exception';
import { UsuarioService } from '../usuario/usuario.service';
import { AuthSessionService } from './auth-session.service';
import {
  AUTH_ACCESS_COOKIE,
  getCookieValue,
  isBearerFallbackEnabled,
  resolveJwtSecret,
} from './auth-security.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly authSessionService: AuthSessionService,
    configService: ConfigService,
  ) {
    const bearerExtractor = ExtractJwt.fromAuthHeaderAsBearerToken();
    super({
      jwtFromRequest: (request: Request) => {
        const cookieToken = getCookieValue(request, AUTH_ACCESS_COOKIE);
        if (cookieToken) return cookieToken;
        return isBearerFallbackEnabled(configService)
          ? bearerExtractor(request)
          : null;
      },
      ignoreExpiration: false,
      secretOrKey: resolveJwtSecret(configService),
    });
  }

  async validate(payload: { sub: number; email: string; sid?: number }) {
    if (!Number.isInteger(payload.sid)) {
      throw new TokenInvalidoException('JWT sem sid');
    }

    try {
      await this.authSessionService.validarSessaoAccess(
        payload.sid as number,
        payload.sub,
      );
    } catch {
      throw new TokenInvalidoException('Sessão inválida ou expirada');
    }

    let usuario;
    try {
      usuario = await this.usuarioService.buscarPorId(payload.sub);
    } catch (error) {
      if (error instanceof UsuarioNaoEncontradoException) {
        throw new UsuarioTokenNaoEncontradoException(payload.sub);
      }
      throw error;
    }

    if (
      usuario.status !== StatusContaUsuario.ATIVA ||
      !usuario.emailVerificadoEm
    ) {
      throw new TokenInvalidoException('Conta inativa');
    }

    return {
      id: usuario.id,
      email: usuario.email,
      apelido: usuario.apelido,
      role: usuario.role,
      sid: payload.sid,
    };
  }
}
