// src/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioService } from '../usuario/usuario.service';
import { RoleUsuario } from '@prisma/client';

// ✅ IMPORTAR EXCEÇÕES CUSTOMIZADAS
import { CredenciaisInvalidasException } from 'src/common/exceptions/auth.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * ✅ REFATORADO: Validação segura sem revelar se email existe
   */
  async validarUsuario(email: string, senha: string) {
    try {
      // ✅ Buscar usuário (pode lançar UsuarioEmailNaoEncontradoException)
      const usuario = await this.usuarioService.buscarPorEmail(email);

      // ✅ Validar senha
      const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);

      if (!senhaValida) {
        // ✅ SEGURANÇA: Mesma mensagem genérica
        throw new CredenciaisInvalidasException();
      }

      // ✅ Retornar usuário sem senhaHash
      const { senhaHash, ...usuarioSemSenha } = usuario;
      void senhaHash;
      return usuarioSemSenha;
    } catch {
      // ✅ SEGURANÇA: Transformar qualquer erro em "Credenciais inválidas"
      // Isso previne user enumeration (atacante não sabe se email existe)
      throw new CredenciaisInvalidasException();
    }
  }

  /**
   * ✅ ATUALIZADO: Aceitar e retornar role
   */
  async login(usuario: {
    id: number;
    email: string;
    apelido: string;
    role: RoleUsuario;
  }) {
    const payload = { sub: usuario.id, email: usuario.email };
    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        apelido: usuario.apelido,
        role: usuario.role,
      },
    };
  }
}
