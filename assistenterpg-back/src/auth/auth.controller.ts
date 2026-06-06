// src/auth/auth.controller.ts
import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { SecurityRateLimit } from 'src/common/security/security-rate-limit.decorator';
import { AuthService } from './auth.service';
import { AuthSessionService } from './auth-session.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationEmailDto } from './dto/resend-verification-email.dto';
import { ReactivateAccountDto } from './dto/reactivate-account.dto';
import { VerifyEmailChangeDto } from './dto/verify-email-change.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  @Post('register')
  @SecurityRateLimit('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @SecurityRateLimit('login')
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const usuario = await this.authService.validarUsuario(dto.email, dto.senha);
    return this.authService.login(
      usuario,
      Boolean(dto.rememberMe),
      request,
      response,
    );
  }

  @Get('csrf')
  async csrf(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authSessionService.emitirCsrf(request, response);
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authSessionService.renovarSessao(request, response);
  }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authSessionService.revogarSessao(request, response);
    return { mensagem: 'Sessão encerrada.' };
  }

  @Post('forgot-password')
  @SecurityRateLimit('forgotPassword')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.solicitarRecuperacaoSenha(dto.email);
  }

  @Post('reset-password')
  @SecurityRateLimit('resetPassword')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.redefinirSenha(
      dto.token,
      dto.novaSenha,
    );
    this.authSessionService.limparCookies(response);
    return result;
  }

  @Post('verify-email')
  @SecurityRateLimit('verifyEmail')
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.verificarEmail(dto.token);
    this.authSessionService.limparCookies(response);
    return result;
  }

  @Post('resend-verification-email')
  @SecurityRateLimit('resendVerificationEmail')
  async resendVerificationEmail(@Body() dto: ResendVerificationEmailDto) {
    return this.authService.reenviarVerificacaoEmail(dto.email);
  }

  @Post('verify-email-change')
  @SecurityRateLimit('verifyEmailChange')
  async verifyEmailChange(
    @Body() dto: VerifyEmailChangeDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.confirmarAlteracaoEmail(dto.token);
    this.authSessionService.limparCookies(response);
    return result;
  }

  @Post('reactivate-account')
  @SecurityRateLimit('reactivateAccount')
  async reactivateAccount(@Body() dto: ReactivateAccountDto) {
    return this.authService.reativarConta(dto.email, dto.senha);
  }
}
