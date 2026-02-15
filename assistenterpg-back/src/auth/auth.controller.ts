// src/auth/auth.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsuarioService } from '../usuario/usuario.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usuarioService: UsuarioService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const usuario = await this.usuarioService.criarUsuario(
      dto.apelido,
      dto.email,
      dto.senha,
    );
    return usuario;
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const usuario = await this.authService.validarUsuario(
      dto.email,
      dto.senha,
    );
    return this.authService.login(usuario);
  }
}
