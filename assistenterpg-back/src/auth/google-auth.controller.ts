import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import {
  GoogleOAuthService,
  type GoogleOAuthPublicMode,
} from 'src/google/google-oauth.service';
import { SecurityRateLimit } from 'src/common/security/security-rate-limit.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthSessionService } from './auth-session.service';

type AuthenticatedRequest = Request & {
  user?: {
    id: number;
    sid?: number;
  };
};

@Controller('auth/google')
export class GoogleAuthController {
  constructor(
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly authSessionService: AuthSessionService,
    private readonly configService: ConfigService,
  ) {}

  @Get('start')
  @SecurityRateLimit('googleOAuthStart')
  async start(
    @Res() response: Response,
    @Query('mode') mode: GoogleOAuthPublicMode = 'login',
    @Query('redirect') redirect?: string,
  ) {
    const url = await this.googleOAuthService.criarUrlPublica(
      mode === 'register' ? 'register' : 'login',
      redirect,
    );
    return response.redirect(url);
  }

  @Post('link/start')
  @UseGuards(JwtAuthGuard)
  @SecurityRateLimit('googleOAuthUserAction')
  async startLink(
    @Req() request: AuthenticatedRequest,
    @Query('redirect') redirect?: string,
  ) {
    const url = await this.googleOAuthService.criarUrlVinculo(
      request.user?.id as number,
      request.user?.sid,
      redirect,
    );
    return { url };
  }

  @Post('calendar/start')
  @UseGuards(JwtAuthGuard)
  @SecurityRateLimit('googleOAuthUserAction')
  async startCalendar(
    @Req() request: AuthenticatedRequest,
    @Query('redirect') redirect?: string,
  ) {
    const url = await this.googleOAuthService.criarUrlCalendar(
      request.user?.id as number,
      request.user?.sid,
      redirect,
    );
    return { url };
  }

  @Get('callback')
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Req() request: Request,
    @Res({ passthrough: false }) response: Response,
  ) {
    try {
      const result = await this.googleOAuthService.processarCallback(
        code ?? '',
        state ?? '',
      );

      if (result.usuario) {
        await this.authSessionService.criarSessao(
          result.usuario,
          true,
          request,
          response,
        );
      }

      const redirectUrl = this.montarRedirectFront(result.redirectPath, {
        google: result.modo.toLowerCase(),
        status: 'success',
      });
      return response.redirect(redirectUrl);
    } catch (error) {
      const redirectUrl = this.montarRedirectFront('/auth/login', {
        google: 'error',
        code: this.extrairCodigoErro(error),
      });
      return response.redirect(redirectUrl);
    }
  }

  private montarRedirectFront(
    path: string,
    params: Record<string, string>,
  ): string {
    const base = (
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3001'
    ).replace(/\/$/, '');
    const normalizedPath =
      path.startsWith('/') && !path.startsWith('//') ? path : '/home';
    const url = new URL(`${base}${normalizedPath}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return url.toString();
  }

  private extrairCodigoErro(error: unknown): string {
    if (this.possuiGetResponse(error)) {
      const response = error.getResponse();
      if (
        typeof response === 'object' &&
        response !== null &&
        'code' in response &&
        typeof response.code === 'string'
      ) {
        return response.code;
      }
    }
    return 'GOOGLE_OAUTH_ERROR';
  }

  private possuiGetResponse(
    error: unknown,
  ): error is { getResponse: () => unknown } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'getResponse' in error &&
      typeof (error as { getResponse?: unknown }).getResponse === 'function'
    );
  }
}
