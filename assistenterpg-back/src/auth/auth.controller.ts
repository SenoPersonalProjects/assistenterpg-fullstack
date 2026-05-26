// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AUTH_THROTTLE_LIMITS } from './auth-security.config';
import { AuthSessionService } from './auth-session.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationEmailDto } from './dto/resend-verification-email.dto';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  @Post('register')
  @Throttle(AUTH_THROTTLE_LIMITS.register)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Throttle(AUTH_THROTTLE_LIMITS.login)
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
  @Throttle(AUTH_THROTTLE_LIMITS.forgotPassword)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.solicitarRecuperacaoSenha(dto.email);
  }

  @Post('reset-password')
  @Throttle(AUTH_THROTTLE_LIMITS.resetPassword)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.redefinirSenha(dto.token, dto.novaSenha);
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verificarEmail(dto.token);
  }

  @Post('resend-verification-email')
  @Throttle(AUTH_THROTTLE_LIMITS.resendVerificationEmail)
  async resendVerificationEmail(@Body() dto: ResendVerificationEmailDto) {
    return this.authService.reenviarVerificacaoEmail(dto.email);
  }
}
