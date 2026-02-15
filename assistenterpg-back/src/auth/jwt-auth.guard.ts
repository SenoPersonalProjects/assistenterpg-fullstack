// src/auth/jwt-auth.guard.ts

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard padrão para rotas autenticadas
 * Usa a JwtStrategy para validar o token
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
