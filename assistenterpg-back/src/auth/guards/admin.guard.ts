// src/auth/guards/admin.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { RoleUsuario } from '@prisma/client';

// ✅ IMPORTAR EXCEÇÕES CUSTOMIZADAS
import {
  UsuarioNaoAutenticadoException,
  AcessoNegadoException,
} from 'src/common/exceptions/auth.exception';

type RequestComRole = {
  user?: {
    role?: RoleUsuario;
  };
};

/**
 * Guard simplificado que permite apenas ADMIN
 * ✅ REFATORADO: Usar exceções customizadas
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest<RequestComRole>();

    // ✅ Se não há usuário autenticado
    if (!user) {
      throw new UsuarioNaoAutenticadoException();
    }

    // ✅ Se usuário não é ADMIN
    if (user.role !== RoleUsuario.ADMIN) {
      throw new AcessoNegadoException('recurso administrativo', 'ADMIN');
    }

    return true;
  }
}
