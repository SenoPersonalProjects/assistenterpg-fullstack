// src/auth/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { RoleUsuario } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Decorator para definir roles permitidas em uma rota
 * @example
 * @Roles(RoleUsuario.ADMIN)
 * @Roles(RoleUsuario.ADMIN, RoleUsuario.USUARIO)
 */
export const Roles = (...roles: RoleUsuario[]) => SetMetadata(ROLES_KEY, roles);
