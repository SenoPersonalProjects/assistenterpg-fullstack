// src/usuario/usuario.controller.ts

import {
  Controller,
  Get,
  Patch,
  Delete,
  Request,
  Body,
  UseGuards,
  Header,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // ✅ NOVO
import { UsuarioService } from './usuario.service';
import { AtualizarPreferenciasDto } from './dto/atualizar-preferencias.dto';
import { AlterarSenhaDto } from './dto/alterar-senha.dto';
import { ExcluirContaDto } from './dto/excluir-conta.dto';

@Controller('usuarios')
@UseGuards(JwtAuthGuard) // ✅ NOVO: Aplicar guard em todo o controller
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get('me')
  async getMe(@Request() req: { user: { id: number } }) {
    const usuario = await this.usuarioService.buscarPorId(req.user.id);
    const { senhaHash, ...usuarioSemSenha } = usuario;
    void senhaHash;
    return usuarioSemSenha;
  }

  @Get('me/estatisticas')
  async obterEstatisticas(@Request() req: { user: { id: number } }) {
    return this.usuarioService.obterEstatisticas(req.user.id);
  }

  @Get('me/preferencias')
  async obterPreferencias(@Request() req: { user: { id: number } }) {
    return this.usuarioService.obterPreferencias(req.user.id);
  }

  @Patch('me/preferencias')
  async atualizarPreferencias(
    @Request() req: { user: { id: number } },
    @Body() dto: AtualizarPreferenciasDto,
  ) {
    return this.usuarioService.atualizarPreferencias(req.user.id, dto);
  }

  @Patch('me/senha')
  async alterarSenha(
    @Request() req: { user: { id: number } },
    @Body() dto: AlterarSenhaDto,
  ) {
    return this.usuarioService.alterarSenha(req.user.id, dto);
  }

  @Get('me/exportar')
  @Header('Content-Type', 'application/json')
  @Header(
    'Content-Disposition',
    'attachment; filename="dados-assistenterpg.json"',
  )
  async exportarDados(@Request() req: { user: { id: number } }) {
    return this.usuarioService.exportarDados(req.user.id);
  }

  @Delete('me')
  async excluirConta(
    @Request() req: { user: { id: number } },
    @Body() body: ExcluirContaDto,
  ) {
    return this.usuarioService.excluirConta(req.user.id, body.senha);
  }
}
