// src/common/exceptions/usuario.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';

// ============================================================================
// USUÁRIO - EXCEÇÕES
// ============================================================================

export class UsuarioNaoEncontradoException extends BaseException {
  constructor(identificador?: string | number) {
    super(
      'Usuário não encontrado',
      HttpStatus.NOT_FOUND,
      'USUARIO_NOT_FOUND',
      { identificador },
    );
  }
}

export class UsuarioEmailDuplicadoException extends BusinessException {
  constructor(email: string) {
    super(
      'Email já está em uso',
      'USUARIO_EMAIL_DUPLICADO',
      { email },
    );
  }
}

// ✅ CORRIGIDO
export class UsuarioSenhaIncorretaException extends BaseException {
  constructor(contexto: 'login' | 'alteracao' | 'exclusao' = 'login') {
    const mensagens = {
      login: 'Credenciais inválidas',
      alteracao: 'Senha atual incorreta',
      exclusao: 'Senha incorreta',
    };

    super(
      mensagens[contexto],
      HttpStatus.UNAUTHORIZED,
      'USUARIO_SENHA_INCORRETA',
      { contexto },
    );
  }
}

export class UsuarioEmailNaoEncontradoException extends BaseException {
  constructor(email: string) {
    super(
      'Usuário com esse email não encontrado',
      HttpStatus.NOT_FOUND,
      'USUARIO_EMAIL_NOT_FOUND',
      { email },
    );
  }
}

export class UsuarioApelidoNaoEncontradoException extends BaseException {
  constructor(apelido: string) {
    super(
      'Usuário com esse apelido não encontrado',
      HttpStatus.NOT_FOUND,
      'USUARIO_APELIDO_NOT_FOUND',
      { apelido },
    );
  }
}
