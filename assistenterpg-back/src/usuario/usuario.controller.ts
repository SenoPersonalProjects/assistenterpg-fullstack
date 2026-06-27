// src/usuario/usuario.controller.ts

import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Request,
  Body,
  UseGuards,
  Header,
  BadRequestException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // ✅ NOVO
import { AuthService } from '../auth/auth.service';
import { AuthSessionService } from '../auth/auth-session.service';
import { SecurityRateLimit } from 'src/common/security/security-rate-limit.decorator';
import { GoogleOAuthService } from 'src/google/google-oauth.service';
import { UsuarioService } from './usuario.service';
import { AtualizarPreferenciasDto } from './dto/atualizar-preferencias.dto';
import { AlterarSenhaDto } from './dto/alterar-senha.dto';
import { ExcluirContaDto } from './dto/excluir-conta.dto';
import { AlterarEmailDto } from './dto/alterar-email.dto';
import { DesativarContaDto } from './dto/desativar-conta.dto';

@Controller('usuarios')
@UseGuards(JwtAuthGuard) // ✅ NOVO: Aplicar guard em todo o controller
export class UsuarioController {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly authService: AuthService,
    private readonly authSessionService: AuthSessionService,
    private readonly googleOAuthService: GoogleOAuthService,
  ) {}

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

  @Get('me/integracoes/google')
  async obterIntegracaoGoogle(@Request() req: { user: { id: number } }) {
    return this.googleOAuthService.obterStatus(req.user.id);
  }

  @Delete('me/integracoes/google')
  @SecurityRateLimit('googleOAuthUserAction')
  async desvincularGoogle(@Request() req: { user: { id: number } }) {
    return this.googleOAuthService.desvincular(req.user.id);
  }

  @Delete('me/integracoes/google/calendar')
  @SecurityRateLimit('googleOAuthUserAction')
  async desautorizarGoogleCalendar(@Request() req: { user: { id: number } }) {
    return this.googleOAuthService.desautorizarCalendar(req.user.id);
  }

  @Patch('me/preferencias')
  async atualizarPreferencias(
    @Request() req: { user: { id: number } },
    @Body() dto: AtualizarPreferenciasDto,
  ) {
    return this.usuarioService.atualizarPreferencias(req.user.id, dto);
  }

  @Patch('me/senha')
  @SecurityRateLimit('changePassword')
  async alterarSenha(
    @Request() req: { user: { id: number } },
    @Body() dto: AlterarSenhaDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.alterarSenha(req.user.id, dto);
    this.authSessionService.limparCookies(response);
    return result;
  }

  @Patch('me/email')
  @SecurityRateLimit('changeEmail')
  async alterarEmail(
    @Request() req: { user: { id: number } },
    @Body() dto: AlterarEmailDto,
  ) {
    return this.authService.solicitarAlteracaoEmail(req.user.id, dto);
  }

  @Post('me/desativar')
  @SecurityRateLimit('deactivateAccount')
  async desativarConta(
    @Request() req: { user: { id: number } },
    @Body() dto: DesativarContaDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.desativarConta(
      req.user.id,
      dto.senhaAtual,
    );
    this.authSessionService.limparCookies(response);
    return result;
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
  @SecurityRateLimit('deleteAccount')
  async excluirConta(
    @Request() req: { user: { id: number } },
    @Body() body: ExcluirContaDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const senhaAtual = body.senhaAtual ?? body.senha;
    if (!senhaAtual) {
      throw new BadRequestException('senhaAtual é obrigatória');
    }
    const result = await this.authService.excluirConta(req.user.id, senhaAtual);
    this.authSessionService.limparCookies(response);
    return result;
  }
}
