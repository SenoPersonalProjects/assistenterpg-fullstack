import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoleUsuario, TipoTokenAuth } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  AuthEmailNaoVerificadoException,
  CredenciaisInvalidasException,
} from 'src/common/exceptions/auth.exception';
import { RegisterDto } from './dto/register.dto';
import { UsuarioService } from '../usuario/usuario.service';
import { AuthTokenService } from './auth-token.service';
import { AuthMailService } from './auth-mail.service';

const MENSAGEM_RECUPERACAO =
  'Se o email existir, enviaremos as instrucoes de recuperacao.';
const MENSAGEM_REENVIO_VERIFICACAO =
  'Se o email existir e ainda nao estiver verificado, enviaremos um novo link de verificacao.';

type UsuarioAutenticavel = {
  id: number;
  email: string;
  apelido: string;
  role: RoleUsuario;
  emailVerificadoEm: Date | null;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
    private readonly authTokenService: AuthTokenService,
    private readonly authMailService: AuthMailService,
  ) {}

  async register(dto: RegisterDto) {
    const email = this.normalizarEmail(dto.email);

    const usuario = await this.usuarioService.criarUsuario(
      dto.apelido,
      email,
      dto.senha,
    );

    await this.enviarEmailVerificacao(usuario.id, usuario.email, usuario.apelido);

    return usuario;
  }

  async validarUsuario(email: string, senha: string): Promise<UsuarioAutenticavel> {
    let usuario: Awaited<ReturnType<UsuarioService['buscarPorEmail']>>;

    try {
      usuario = await this.usuarioService.buscarPorEmail(this.normalizarEmail(email));
    } catch {
      throw new CredenciaisInvalidasException();
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new CredenciaisInvalidasException();
    }

    if (!usuario.emailVerificadoEm) {
      throw new AuthEmailNaoVerificadoException();
    }

    const { senhaHash, ...usuarioSemSenha } = usuario;
    void senhaHash;
    return usuarioSemSenha;
  }

  async login(usuario: {
    id: number;
    email: string;
    apelido: string;
    role: RoleUsuario;
    emailVerificadoEm?: Date | null;
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
        emailVerificado: Boolean(usuario.emailVerificadoEm),
      },
    };
  }

  async solicitarRecuperacaoSenha(email: string) {
    const emailNormalizado = this.normalizarEmail(email);
    const usuario = await this.usuarioService.buscarPorEmailOpcional(emailNormalizado);

    if (!usuario) {
      return { mensagem: MENSAGEM_RECUPERACAO };
    }

    await this.authTokenService.invalidarTokensAtivos(
      usuario.id,
      TipoTokenAuth.RECUPERACAO_SENHA,
    );

    const { token, expiraEm } = await this.authTokenService.gerarToken(
      usuario.id,
      TipoTokenAuth.RECUPERACAO_SENHA,
      this.obterResetTokenTtlMinutos(),
    );

    const linkRecuperacao = this.montarLinkFront(
      '/auth/reset-password',
      token,
    );

    try {
      await this.authMailService.enviarRecuperacaoSenha({
        email: usuario.email,
        apelido: usuario.apelido,
        linkRecuperacao,
        expiraEm,
      });
    } catch (error) {
      this.logger.error(
        `Falha ao enviar email de recuperacao para usuarioId=${usuario.id}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    return { mensagem: MENSAGEM_RECUPERACAO };
  }

  async redefinirSenha(token: string, novaSenha: string) {
    const tokenConsumido = await this.authTokenService.consumirToken(
      token,
      TipoTokenAuth.RECUPERACAO_SENHA,
    );

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
    await this.usuarioService.atualizarSenhaHash(
      tokenConsumido.usuarioId,
      novaSenhaHash,
    );

    await this.authTokenService.invalidarTokensAtivos(
      tokenConsumido.usuarioId,
      TipoTokenAuth.RECUPERACAO_SENHA,
    );

    return { mensagem: 'Senha redefinida com sucesso.' };
  }

  async verificarEmail(token: string) {
    const tokenConsumido = await this.authTokenService.consumirToken(
      token,
      TipoTokenAuth.VERIFICACAO_EMAIL,
    );

    await this.usuarioService.marcarEmailComoVerificado(tokenConsumido.usuarioId);

    await this.authTokenService.invalidarTokensAtivos(
      tokenConsumido.usuarioId,
      TipoTokenAuth.VERIFICACAO_EMAIL,
    );

    return { mensagem: 'Email verificado com sucesso.' };
  }

  async reenviarVerificacaoEmail(email: string) {
    const emailNormalizado = this.normalizarEmail(email);
    const usuario = await this.usuarioService.buscarPorEmailOpcional(emailNormalizado);

    if (!usuario || usuario.emailVerificadoEm) {
      return { mensagem: MENSAGEM_REENVIO_VERIFICACAO };
    }

    await this.enviarEmailVerificacao(usuario.id, usuario.email, usuario.apelido);

    return { mensagem: MENSAGEM_REENVIO_VERIFICACAO };
  }

  private async enviarEmailVerificacao(
    usuarioId: number,
    email: string,
    apelido: string,
  ) {
    await this.authTokenService.invalidarTokensAtivos(
      usuarioId,
      TipoTokenAuth.VERIFICACAO_EMAIL,
    );

    const { token, expiraEm } = await this.authTokenService.gerarToken(
      usuarioId,
      TipoTokenAuth.VERIFICACAO_EMAIL,
      this.obterVerificacaoTokenTtlMinutos(),
    );

    const linkVerificacao = this.montarLinkFront('/auth/verify-email', token);

    try {
      await this.authMailService.enviarVerificacaoEmail({
        email,
        apelido,
        linkVerificacao,
        expiraEm,
      });
    } catch (error) {
      this.logger.error(
        `Falha ao enviar email de verificacao para usuarioId=${usuarioId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private montarLinkFront(path: string, token: string) {
    const base = (process.env.FRONTEND_URL ?? 'http://localhost:3001').replace(
      /\/$/,
      '',
    );
    return `${base}${path}?token=${encodeURIComponent(token)}`;
  }

  private obterResetTokenTtlMinutos() {
    const valor = Number(process.env.AUTH_RESET_TOKEN_TTL_MINUTES ?? 30);
    return Number.isFinite(valor) && valor > 0 ? valor : 30;
  }

  private obterVerificacaoTokenTtlMinutos() {
    const valor = Number(process.env.AUTH_VERIFY_TOKEN_TTL_MINUTES ?? 1440);
    return Number.isFinite(valor) && valor > 0 ? valor : 1440;
  }

  private normalizarEmail(email: string) {
    return email.trim().toLowerCase();
  }
}
