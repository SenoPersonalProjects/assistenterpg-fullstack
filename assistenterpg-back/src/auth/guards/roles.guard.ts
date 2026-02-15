// src/auth/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleUsuario } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

// ✅ IMPORTAR EXCEÇÕES CUSTOMIZADAS
import {
  UsuarioNaoAutenticadoException,
  AcessoNegadoException,
} from 'src/common/exceptions/auth.exception';

/**
 * Guard que verifica se o usuário tem a role necessária
 * ✅ REFATORADO: Usar exceções customizadas
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1️⃣ Buscar roles requeridas do metadata
    const requiredRoles = this.reflector.getAllAndOverride<RoleUsuario[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2️⃣ Se não há roles definidas, permite acesso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 3️⃣ Buscar usuário da requisição (já injetado pelo JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // 4️⃣ Se não há usuário, nega acesso
    if (!user) {
      throw new UsuarioNaoAutenticadoException();
    }

    // 5️⃣ Verifica se o usuário tem alguma das roles requeridas
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new AcessoNegadoException(
        'este recurso',
        requiredRoles.join(' ou '),
      );
    }

    return true;
  }
}
