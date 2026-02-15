// src/auth/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuarioService } from '../usuario/usuario.service';

import { UsuarioTokenNaoEncontradoException } from 'src/common/exceptions/auth.exception';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usuarioService: UsuarioService,
    configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret && configService.get<string>('NODE_ENV') === 'production') {
      throw new Error('JWT_SECRET é obrigatório em produção');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret || 'dev-secret',
    });
  }

  async validate(payload: { sub: number; email: string }) {
    try {
      const usuario = await this.usuarioService.buscarPorId(payload.sub);

      return {
        id: usuario.id,
        email: usuario.email,
        apelido: usuario.apelido,
        role: usuario.role,
      };
    } catch {
      throw new UsuarioTokenNaoEncontradoException(payload.sub);
    }
  }
}
