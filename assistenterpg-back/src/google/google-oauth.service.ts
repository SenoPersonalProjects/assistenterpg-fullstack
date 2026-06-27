import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ModoOAuthState,
  Prisma,
  ProvedorOAuth,
  RoleUsuario,
  StatusContaUsuario,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { CodeChallengeMethod, OAuth2Client } from 'google-auth-library';
import { PrismaService } from 'src/prisma/prisma.service';
import { GoogleTokenCryptoService } from './google-token-crypto.service';

const DEFAULT_GOOGLE_OAUTH_SCOPES = ['openid', 'email', 'profile'];
const DEFAULT_GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
];
export const GOOGLE_CALENDAR_EVENTS_SCOPE =
  'https://www.googleapis.com/auth/calendar.events';
const DEFAULT_STATE_TTL_MINUTES = 10;
const OAUTH_ONLY_PASSWORD_BYTES = 48;

export type GoogleOAuthPublicMode = 'login' | 'register';
export type GoogleOAuthCallbackResult = {
  usuario?: {
    id: number;
    email: string;
    apelido: string;
    role: RoleUsuario;
    emailVerificadoEm: Date | null;
  };
  redirectPath: string;
  modo: ModoOAuthState;
};

type GoogleProfile = {
  sub: string;
  email: string;
  emailNormalizado: string;
  emailVerificado: boolean;
  nome: string | null;
  avatarUrl: string | null;
};

type TokenFields = {
  accessToken?: string | null;
  refreshToken?: string | null;
  expiryDate?: number | null;
  scopes: string[];
};

@Injectable()
export class GoogleOAuthService {
  private readonly logger = new Logger(GoogleOAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly tokenCrypto: GoogleTokenCryptoService,
  ) {}

  async criarUrlPublica(
    mode: GoogleOAuthPublicMode,
    redirectPath?: string,
  ): Promise<string> {
    return this.criarUrlAutorizacao({
      modo:
        mode === 'register' ? ModoOAuthState.REGISTER : ModoOAuthState.LOGIN,
      redirectPath,
    });
  }

  async criarUrlVinculo(
    usuarioId: number,
    sid: number | undefined,
    redirectPath?: string,
  ): Promise<string> {
    return this.criarUrlAutorizacao({
      modo: ModoOAuthState.LINK,
      usuarioId,
      sid,
      redirectPath,
    });
  }

  async criarUrlCalendar(
    usuarioId: number,
    sid: number | undefined,
    redirectPath?: string,
  ): Promise<string> {
    return this.criarUrlAutorizacao({
      modo: ModoOAuthState.CALENDAR,
      usuarioId,
      sid,
      redirectPath,
    });
  }

  async processarCallback(
    code: string,
    state: string,
  ): Promise<GoogleOAuthCallbackResult> {
    this.assertGoogleEnabled();
    if (!code || !state) {
      throw new BadRequestException({
        code: 'GOOGLE_OAUTH_CALLBACK_INVALID',
        message: 'Callback Google inválido.',
      });
    }

    const oauthState = await this.consumirState(state);
    const codeVerifier = this.tokenCrypto.decrypt(
      oauthState.codeVerifierCriptografado,
    );
    const client = this.criarClient();
    const { tokens } = await client.getToken({ code, codeVerifier });
    client.setCredentials(tokens);

    if (!tokens.id_token) {
      throw new UnauthorizedException({
        code: 'GOOGLE_ID_TOKEN_MISSING',
        message: 'Google não retornou token de identidade.',
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: this.obterClientId(),
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException({
        code: 'GOOGLE_PROFILE_INVALID',
        message: 'Perfil Google inválido.',
      });
    }

    const profile: GoogleProfile = {
      sub: payload.sub,
      email: payload.email,
      emailNormalizado: this.normalizarEmail(payload.email),
      emailVerificado: payload.email_verified === true,
      nome: payload.name ?? null,
      avatarUrl: payload.picture ?? null,
    };
    if (!profile.emailVerificado) {
      throw new UnauthorizedException({
        code: 'GOOGLE_EMAIL_NOT_VERIFIED',
        message: 'O email da conta Google não está verificado.',
      });
    }

    const tokenFields: TokenFields = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date,
      scopes: this.normalizarScopes(tokens.scope, oauthState.scopes),
    };

    if (
      oauthState.modo === ModoOAuthState.LINK ||
      oauthState.modo === ModoOAuthState.CALENDAR
    ) {
      if (!oauthState.usuarioId) {
        throw new BadRequestException({
          code: 'GOOGLE_OAUTH_STATE_USER_MISSING',
          message: 'Estado OAuth não está associado a uma conta.',
        });
      }
      await this.vincularUsuarioExistente(
        oauthState.usuarioId,
        profile,
        tokenFields,
        oauthState.modo === ModoOAuthState.CALENDAR,
      );

      return {
        redirectPath: oauthState.redirectPath ?? '/configuracoes',
        modo: oauthState.modo,
      };
    }

    const usuario = await this.vincularOuCriarUsuario(profile, tokenFields);
    return {
      usuario,
      redirectPath: oauthState.redirectPath ?? '/home',
      modo: oauthState.modo,
    };
  }

  async obterStatus(usuarioId: number) {
    const [identidade, credencial] = await Promise.all([
      this.prisma.usuarioOAuthIdentidade.findFirst({
        where: { usuarioId, provider: ProvedorOAuth.GOOGLE },
        orderBy: { atualizadoEm: 'desc' },
        select: {
          email: true,
          nome: true,
          avatarUrl: true,
          emailVerificado: true,
          ultimoLoginEm: true,
          atualizadoEm: true,
        },
      }),
      this.prisma.usuarioGoogleCredencial.findUnique({
        where: { usuarioId },
        select: {
          refreshTokenCriptografado: true,
          calendarAutorizadoEm: true,
          revogadoEm: true,
          ultimoErro: true,
          scopes: true,
        },
      }),
    ]);
    const calendarScopes = this.jsonArrayToStrings(credencial?.scopes);
    const possuiScopeCalendar = calendarScopes.includes(
      GOOGLE_CALENDAR_EVENTS_SCOPE,
    );
    const possuiCredencialOffline = Boolean(
      credencial?.refreshTokenCriptografado,
    );
    const calendarAutorizado = Boolean(
      identidade &&
      credencial?.calendarAutorizadoEm &&
      !credencial.revogadoEm &&
      possuiCredencialOffline &&
      possuiScopeCalendar,
    );
    const precisaReautorizarCalendar = Boolean(
      identidade && credencial?.calendarAutorizadoEm && !calendarAutorizado,
    );

    return {
      conectado: Boolean(identidade),
      email: identidade?.email ?? null,
      nome: identidade?.nome ?? null,
      avatarUrl: identidade?.avatarUrl ?? null,
      emailVerificado: identidade?.emailVerificado ?? false,
      ultimoLoginEm: identidade?.ultimoLoginEm?.toISOString() ?? null,
      atualizadoEm: identidade?.atualizadoEm?.toISOString() ?? null,
      calendarAutorizado,
      calendarAutorizadoEm:
        credencial?.calendarAutorizadoEm?.toISOString() ?? null,
      calendarScopes,
      calendarErro: credencial?.ultimoErro ?? null,
      precisaReautorizarCalendar,
      ultimoErro: credencial?.ultimoErro ?? null,
      scopes: calendarScopes,
      googleOAuthEnabled: this.googleEnabled(),
    };
  }

  async desautorizarCalendar(usuarioId: number) {
    const credencial = await this.prisma.usuarioGoogleCredencial.findUnique({
      where: { usuarioId },
      select: {
        refreshTokenCriptografado: true,
        accessTokenCriptografado: true,
        scopes: true,
      },
    });
    const scopes = this.jsonArrayToStrings(credencial?.scopes).filter(
      (scope) => scope !== GOOGLE_CALENDAR_EVENTS_SCOPE,
    );

    let erroRevogacao: string | null = null;
    const tokenCriptografado =
      credencial?.refreshTokenCriptografado ??
      credencial?.accessTokenCriptografado ??
      null;

    if (tokenCriptografado) {
      try {
        await this.revogarTokenGoogle(
          this.tokenCrypto.decrypt(tokenCriptografado),
        );
      } catch (error) {
        erroRevogacao = 'Falha ao revogar permiss\u00e3o no Google.';
        this.logger.warn(
          `Falha ao revogar permiss\u00e3o Calendar do usu\u00e1rio ${usuarioId}: ${this.resumirErroRevogacao(error)}`,
        );
      }
    }

    await this.prisma.usuarioGoogleCredencial.updateMany({
      where: { usuarioId },
      data: {
        refreshTokenCriptografado: null,
        accessTokenCriptografado: null,
        accessTokenExpiraEm: null,
        scopes,
        calendarAutorizadoEm: null,
        revogadoEm: new Date(),
        ultimoErro: erroRevogacao,
      },
    });

    return {
      mensagem:
        'Google Calendar desautorizado. Sua conta Google continua vinculada.',
    };
  }

  async desvincular(usuarioId: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { senhaGeradaPorOAuth: true },
    });
    if (!usuario) {
      throw new BadRequestException({
        code: 'GOOGLE_UNLINK_USER_NOT_FOUND',
        message: 'Usuário não encontrado.',
      });
    }
    if (usuario.senhaGeradaPorOAuth) {
      throw new ForbiddenException({
        code: 'GOOGLE_UNLINK_PASSWORD_REQUIRED',
        message:
          'Defina uma senha local antes de desvincular sua conta Google.',
      });
    }

    await this.prisma.$transaction([
      this.prisma.usuarioOAuthIdentidade.deleteMany({
        where: { usuarioId, provider: ProvedorOAuth.GOOGLE },
      }),
      this.prisma.usuarioGoogleCredencial.deleteMany({ where: { usuarioId } }),
    ]);

    return { mensagem: 'Conta Google desvinculada com sucesso.' };
  }

  private async criarUrlAutorizacao(input: {
    modo: ModoOAuthState;
    usuarioId?: number;
    sid?: number;
    redirectPath?: string;
  }): Promise<string> {
    this.assertGoogleEnabled();
    const state = randomBytes(32).toString('base64url');
    const codeVerifier = randomBytes(64).toString('base64url');
    const scopes =
      input.modo === ModoOAuthState.CALENDAR
        ? this.obterScopesCalendar()
        : this.obterScopesOAuth();
    const expiraEm = new Date(
      Date.now() + this.obterStateTtlMinutos() * 60_000,
    );

    await this.prisma.oAuthState.create({
      data: {
        stateHash: this.hashState(state),
        modo: input.modo,
        usuarioId: input.usuarioId,
        sid: input.sid,
        redirectPath: this.normalizarRedirectPath(input.redirectPath),
        scopes,
        codeVerifierCriptografado: this.tokenCrypto.encrypt(codeVerifier),
        expiraEm,
      },
    });

    return this.criarClient().generateAuthUrl({
      access_type:
        input.modo === ModoOAuthState.CALENDAR ? 'offline' : undefined,
      scope: scopes,
      state,
      include_granted_scopes: true,
      prompt:
        input.modo === ModoOAuthState.CALENDAR ? 'consent' : 'select_account',
      code_challenge: this.criarCodeChallenge(codeVerifier),
      code_challenge_method: CodeChallengeMethod.S256,
    });
  }

  private async consumirState(state: string) {
    const stateHash = this.hashState(state);
    const agora = new Date();
    const oauthState = await this.prisma.oAuthState.findUnique({
      where: { stateHash },
    });
    if (!oauthState || oauthState.expiraEm <= agora || oauthState.consumidoEm) {
      throw new BadRequestException({
        code: 'GOOGLE_OAUTH_STATE_INVALID',
        message: 'Estado OAuth inválido ou expirado.',
      });
    }

    const consumo = await this.prisma.oAuthState.updateMany({
      where: {
        id: oauthState.id,
        stateHash,
        expiraEm: { gt: agora },
        consumidoEm: null,
      },
      data: { consumidoEm: agora },
    });
    if (consumo.count === 0) {
      throw new BadRequestException({
        code: 'GOOGLE_OAUTH_STATE_REUSED',
        message: 'Estado OAuth já foi consumido.',
      });
    }

    return oauthState;
  }

  private async vincularOuCriarUsuario(
    profile: GoogleProfile,
    tokens: TokenFields,
  ) {
    const agora = new Date();

    return this.prisma.$transaction(async (tx) => {
      const identidadeExistente = await tx.usuarioOAuthIdentidade.findUnique({
        where: {
          provider_providerUserId: {
            provider: ProvedorOAuth.GOOGLE,
            providerUserId: profile.sub,
          },
        },
        include: { usuario: true },
      });

      if (identidadeExistente) {
        const usuario = identidadeExistente.usuario;
        this.assertContaGooglePodeAcessar(usuario.status);
        await this.atualizarIdentidadeTx(
          tx,
          usuario.id,
          profile,
          tokens.scopes,
          agora,
        );
        await this.salvarTokensTx(tx, usuario.id, tokens, false);
        return this.toUsuarioAutenticavel(usuario, agora);
      }

      const usuarioPorEmail = await tx.usuario.findUnique({
        where: { email: profile.emailNormalizado },
      });

      if (usuarioPorEmail) {
        this.assertContaGooglePodeAcessar(usuarioPorEmail.status);
        await tx.usuario.update({
          where: { id: usuarioPorEmail.id },
          data: {
            emailVerificadoEm: usuarioPorEmail.emailVerificadoEm ?? agora,
          },
        });
        await this.atualizarIdentidadeTx(
          tx,
          usuarioPorEmail.id,
          profile,
          tokens.scopes,
          agora,
        );
        await this.salvarTokensTx(tx, usuarioPorEmail.id, tokens, false);
        return this.toUsuarioAutenticavel(usuarioPorEmail, agora);
      }

      const senhaHash = await bcrypt.hash(
        randomBytes(OAUTH_ONLY_PASSWORD_BYTES).toString('base64url'),
        10,
      );
      const criado = await tx.usuario.create({
        data: {
          apelido: this.resolverApelido(profile),
          email: profile.emailNormalizado,
          senhaHash,
          senhaGeradaPorOAuth: true,
          emailVerificadoEm: agora,
          status: StatusContaUsuario.ATIVA,
        },
      });
      await this.atualizarIdentidadeTx(
        tx,
        criado.id,
        profile,
        tokens.scopes,
        agora,
      );
      await this.salvarTokensTx(tx, criado.id, tokens, false);
      return this.toUsuarioAutenticavel(criado, agora);
    });
  }

  private async vincularUsuarioExistente(
    usuarioId: number,
    profile: GoogleProfile,
    tokens: TokenFields,
    autorizarCalendar: boolean,
  ) {
    const agora = new Date();
    await this.prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.findUnique({ where: { id: usuarioId } });
      if (!usuario || usuario.status !== StatusContaUsuario.ATIVA) {
        throw new ForbiddenException({
          code: 'GOOGLE_LINK_ACCOUNT_INACTIVE',
          message: 'A conta atual não pode vincular Google.',
        });
      }

      const identidadeExistente = await tx.usuarioOAuthIdentidade.findUnique({
        where: {
          provider_providerUserId: {
            provider: ProvedorOAuth.GOOGLE,
            providerUserId: profile.sub,
          },
        },
        select: { usuarioId: true },
      });
      if (identidadeExistente && identidadeExistente.usuarioId !== usuarioId) {
        throw new ForbiddenException({
          code: 'GOOGLE_ACCOUNT_ALREADY_LINKED',
          message: 'Esta conta Google já está vinculada a outro usuário.',
        });
      }

      const usuarioMesmoEmail = await tx.usuario.findUnique({
        where: { email: profile.emailNormalizado },
        select: { id: true },
      });
      if (usuarioMesmoEmail && usuarioMesmoEmail.id !== usuarioId) {
        throw new ForbiddenException({
          code: 'GOOGLE_EMAIL_BELONGS_TO_ANOTHER_USER',
          message: 'O email da conta Google pertence a outro usuário.',
        });
      }

      await this.atualizarIdentidadeTx(
        tx,
        usuarioId,
        profile,
        tokens.scopes,
        agora,
      );
      await this.salvarTokensTx(tx, usuarioId, tokens, autorizarCalendar);
    });
  }

  private async atualizarIdentidadeTx(
    tx: Prisma.TransactionClient,
    usuarioId: number,
    profile: GoogleProfile,
    scopes: string[],
    agora: Date,
  ) {
    await tx.usuarioOAuthIdentidade.upsert({
      where: {
        provider_providerUserId: {
          provider: ProvedorOAuth.GOOGLE,
          providerUserId: profile.sub,
        },
      },
      update: {
        usuarioId,
        email: profile.email,
        emailNormalizado: profile.emailNormalizado,
        emailVerificado: profile.emailVerificado,
        nome: profile.nome,
        avatarUrl: profile.avatarUrl,
        scopes,
        ultimoLoginEm: agora,
      },
      create: {
        usuarioId,
        provider: ProvedorOAuth.GOOGLE,
        providerUserId: profile.sub,
        email: profile.email,
        emailNormalizado: profile.emailNormalizado,
        emailVerificado: profile.emailVerificado,
        nome: profile.nome,
        avatarUrl: profile.avatarUrl,
        scopes,
        ultimoLoginEm: agora,
      },
    });
  }

  private async salvarTokensTx(
    tx: Prisma.TransactionClient,
    usuarioId: number,
    tokens: TokenFields,
    autorizarCalendar: boolean,
  ) {
    if (
      !tokens.accessToken &&
      !tokens.refreshToken &&
      tokens.scopes.length === 0
    ) {
      return;
    }

    const data: Prisma.UsuarioGoogleCredencialUpdateInput = {
      scopes: tokens.scopes,
      revogadoEm: null,
      ultimoErro: null,
      ...(tokens.accessToken
        ? {
            accessTokenCriptografado: this.tokenCrypto.encrypt(
              tokens.accessToken,
            ),
          }
        : {}),
      ...(tokens.refreshToken
        ? {
            refreshTokenCriptografado: this.tokenCrypto.encrypt(
              tokens.refreshToken,
            ),
          }
        : {}),
      ...(tokens.expiryDate
        ? { accessTokenExpiraEm: new Date(tokens.expiryDate) }
        : {}),
      ...(autorizarCalendar ? { calendarAutorizadoEm: new Date() } : {}),
    };

    await tx.usuarioGoogleCredencial.upsert({
      where: { usuarioId },
      update: data,
      create: {
        usuario: { connect: { id: usuarioId } },
        scopes: tokens.scopes,
        revogadoEm: null,
        ultimoErro: null,
        refreshTokenCriptografado: tokens.refreshToken
          ? this.tokenCrypto.encrypt(tokens.refreshToken)
          : undefined,
        accessTokenCriptografado: tokens.accessToken
          ? this.tokenCrypto.encrypt(tokens.accessToken)
          : undefined,
        accessTokenExpiraEm: tokens.expiryDate
          ? new Date(tokens.expiryDate)
          : undefined,
        calendarAutorizadoEm: autorizarCalendar ? new Date() : undefined,
      },
    });
  }

  private assertContaGooglePodeAcessar(status: StatusContaUsuario) {
    if (status !== StatusContaUsuario.ATIVA) {
      throw new ForbiddenException({
        code: 'GOOGLE_ACCOUNT_INACTIVE',
        message: 'Esta conta não pode acessar com Google.',
      });
    }
  }

  private toUsuarioAutenticavel(
    usuario: {
      id: number;
      email: string;
      apelido: string;
      role: RoleUsuario;
      emailVerificadoEm: Date | null;
    },
    agora: Date,
  ) {
    return {
      id: usuario.id,
      email: usuario.email,
      apelido: usuario.apelido,
      role: usuario.role,
      emailVerificadoEm: usuario.emailVerificadoEm ?? agora,
    };
  }

  private criarClient(): OAuth2Client {
    return new OAuth2Client(
      this.obterClientId(),
      this.obterClientSecret(),
      this.obterCallbackUrl(),
    );
  }

  private googleEnabled(): boolean {
    return this.configService.get<string>('GOOGLE_OAUTH_ENABLED') === 'true';
  }

  private assertGoogleEnabled(): void {
    if (!this.googleEnabled()) {
      throw new ServiceUnavailableException({
        code: 'GOOGLE_OAUTH_DISABLED',
        message: 'Login com Google não está habilitado.',
      });
    }
  }

  private obterClientId(): string {
    return this.getRequiredConfig('GOOGLE_OAUTH_CLIENT_ID');
  }

  private obterClientSecret(): string {
    return this.getRequiredConfig('GOOGLE_OAUTH_CLIENT_SECRET');
  }

  private obterCallbackUrl(): string {
    return this.getRequiredConfig('GOOGLE_OAUTH_CALLBACK_URL');
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key)?.trim();
    if (!value) {
      throw new ServiceUnavailableException({
        code: 'GOOGLE_OAUTH_CONFIG_MISSING',
        message: `Configuração ${key} ausente.`,
      });
    }
    return value;
  }

  private obterScopesOAuth(): string[] {
    return this.parseScopes(
      this.configService.get<string>('GOOGLE_OAUTH_SCOPES'),
      DEFAULT_GOOGLE_OAUTH_SCOPES,
    );
  }

  private obterScopesCalendar(): string[] {
    return [
      ...new Set([
        ...this.obterScopesOAuth(),
        ...this.parseScopes(
          this.configService.get<string>('GOOGLE_CALENDAR_SCOPES'),
          DEFAULT_GOOGLE_CALENDAR_SCOPES,
        ),
      ]),
    ];
  }

  private parseScopes(value: string | undefined, fallback: string[]): string[] {
    const scopes = (value ?? '')
      .split(/[,\s]+/)
      .map((scope) => scope.trim())
      .filter(Boolean);
    return scopes.length > 0 ? scopes : fallback;
  }

  private async revogarTokenGoogle(token: string): Promise<void> {
    const response = await fetch('https://oauth2.googleapis.com/revoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ token }),
    });
    if (!response.ok) {
      throw new Error(`Google revoke retornou status ${response.status}`);
    }
  }

  private resumirErroRevogacao(error: unknown): string {
    if (!(error instanceof Error)) return 'erro';
    const status = error.message.match(/status\s+\d{3}/i)?.[0];
    if (status) return status;
    return error.name || 'erro';
  }

  private normalizarScopes(
    scopeText: string | null | undefined,
    fallback: Prisma.JsonValue | null,
  ): string[] {
    const scopes = this.parseScopes(scopeText ?? undefined, []);
    if (scopes.length > 0) return scopes;
    return this.jsonArrayToStrings(fallback);
  }

  private jsonArrayToStrings(
    value: Prisma.JsonValue | null | undefined,
  ): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === 'string');
  }

  private obterStateTtlMinutos(): number {
    const value = Number(
      this.configService.get<string>('GOOGLE_OAUTH_STATE_TTL_MINUTES') ??
        DEFAULT_STATE_TTL_MINUTES,
    );
    return Number.isFinite(value) && value > 0
      ? value
      : DEFAULT_STATE_TTL_MINUTES;
  }

  private normalizarEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private resolverApelido(profile: GoogleProfile): string {
    const nome = profile.nome?.trim();
    if (nome) return nome.slice(0, 80);
    return profile.emailNormalizado.split('@')[0].slice(0, 80);
  }

  private normalizarRedirectPath(path: string | undefined): string {
    if (!path || !path.startsWith('/') || path.startsWith('//')) {
      return '/home';
    }
    return path.slice(0, 512);
  }

  private hashState(state: string): string {
    return createHash('sha256').update(state).digest('hex');
  }

  private criarCodeChallenge(codeVerifier: string): string {
    return createHash('sha256').update(codeVerifier).digest('base64url');
  }
}
