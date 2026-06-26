import { Injectable, Logger } from '@nestjs/common';
import {
  Prisma,
  RoleUsuario,
  StatusContaUsuario,
  TipoTokenAuth,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import {
  AuthEmailNaoVerificadoException,
  AuthTokenInvalidoOuExpiradoException,
  CredenciaisInvalidasException,
} from 'src/common/exceptions/auth.exception';
import {
  UsuarioEmailDuplicadoException,
  UsuarioNaoEncontradoException,
  UsuarioSenhaIncorretaException,
} from 'src/common/exceptions/usuario.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import type { AlterarEmailDto } from 'src/usuario/dto/alterar-email.dto';
import type { AlterarSenhaDto } from 'src/usuario/dto/alterar-senha.dto';
import { UsuarioService } from '../usuario/usuario.service';
import { AuthMailService } from './auth-mail.service';
import { AuthSessionService } from './auth-session.service';
import { AuthTokenService } from './auth-token.service';
import { RegisterDto } from './dto/register.dto';

const MENSAGEM_REGISTRO =
  'Se o cadastro puder ser realizado, enviaremos um link de verificação.';
const MENSAGEM_RECUPERACAO =
  'Se o email existir, enviaremos as instruções de recuperação.';
const MENSAGEM_REENVIO_VERIFICACAO =
  'Se o email existir e ainda não estiver verificado, enviaremos um novo link de verificação.';
const DEFAULT_ACCOUNT_DELETION_GRACE_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;
const SENHA_FICTICIA_HASH = bcrypt.hashSync(
  'assistenterpg-dummy-auth-password',
  10,
);

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
    private readonly authTokenService: AuthTokenService,
    private readonly authMailService: AuthMailService,
    private readonly authSessionService: AuthSessionService,
    private readonly prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto) {
    const email = this.normalizarEmail(dto.email);
    const senhaHash = await bcrypt.hash(dto.senha, 10);
    const tokenData = this.authTokenService.gerarTokenSeguro(
      this.obterVerificacaoTokenTtlMinutos(),
    );
    const agora = new Date();
    const expiraEm = new Date(
      agora.getTime() + this.obterRegistroPendenteTtlHoras() * 60 * 60 * 1000,
    );

    let registro: {
      id: number;
      email: string;
      apelido: string;
      tokenExpiraEm: Date;
    } | null = null;
    try {
      registro = await this.prisma.$transaction(async (tx) => {
        const [usuarioExistente, pendenteExistente, alteracaoEmailExistente] =
          await Promise.all([
            tx.usuario.findUnique({ where: { email }, select: { id: true } }),
            tx.registroPendenteUsuario.findUnique({
              where: { email },
              select: { id: true, expiraEm: true },
            }),
            tx.alteracaoEmailPendente.findUnique({
              where: { novoEmail: email },
              select: { id: true },
            }),
          ]);

        if (
          usuarioExistente ||
          alteracaoEmailExistente ||
          (pendenteExistente && pendenteExistente.expiraEm > agora)
        ) {
          return null;
        }

        if (pendenteExistente) {
          return tx.registroPendenteUsuario.update({
            where: { id: pendenteExistente.id },
            data: {
              apelido: dto.apelido,
              senhaHash,
              tokenHash: tokenData.tokenHash,
              tokenExpiraEm: tokenData.expiraEm,
              expiraEm,
            },
            select: {
              id: true,
              email: true,
              apelido: true,
              tokenExpiraEm: true,
            },
          });
        }

        return tx.registroPendenteUsuario.create({
          data: {
            email,
            apelido: dto.apelido,
            senhaHash,
            tokenHash: tokenData.tokenHash,
            tokenExpiraEm: tokenData.expiraEm,
            expiraEm,
          },
          select: {
            id: true,
            email: true,
            apelido: true,
            tokenExpiraEm: true,
          },
        });
      });
    } catch (error) {
      if (!this.ehConflitoUnico(error)) throw error;
    }

    if (registro) {
      this.enviarEmailVerificacaoPendente(
        registro.email,
        registro.apelido,
        tokenData.token,
        registro.tokenExpiraEm,
      );
    }

    return { mensagem: MENSAGEM_REGISTRO };
  }

  async validarUsuario(
    email: string,
    senha: string,
  ): Promise<UsuarioAutenticavel> {
    const usuario = await this.usuarioService.buscarPorEmailOpcional(
      this.normalizarEmail(email),
    );
    const senhaValida = await bcrypt.compare(
      senha,
      usuario?.senhaHash ?? SENHA_FICTICIA_HASH,
    );

    if (
      !usuario ||
      !senhaValida ||
      usuario.status !== StatusContaUsuario.ATIVA
    ) {
      throw new CredenciaisInvalidasException();
    }
    if (!usuario.emailVerificadoEm) {
      throw new AuthEmailNaoVerificadoException();
    }

    const { senhaHash, status, ...usuarioSemSenha } = usuario;
    void senhaHash;
    void status;
    return usuarioSemSenha;
  }

  async login(
    usuario: UsuarioAutenticavel,
    rememberMe: boolean,
    request: Request,
    response: Response,
  ) {
    await this.authSessionService.criarSessao(
      usuario,
      rememberMe,
      request,
      response,
    );
    return {
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
    const usuario = await this.usuarioService.buscarPorEmailOpcional(
      this.normalizarEmail(email),
    );

    if (
      !usuario ||
      usuario.status !== StatusContaUsuario.ATIVA ||
      !usuario.emailVerificadoEm
    ) {
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

    void this.authMailService
      .enviarRecuperacaoSenha({
        email: usuario.email,
        apelido: usuario.apelido,
        linkRecuperacao: this.montarLinkFront('/auth/reset-password', token),
        expiraEm,
      })
      .catch((error) => this.logMailError('recuperação de senha', error));

    return { mensagem: MENSAGEM_RECUPERACAO };
  }

  async redefinirSenha(token: string, novaSenha: string) {
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    await this.prisma.$transaction(async (tx) => {
      const consumido = await this.authTokenService.consumirTokenEmTransacao(
        tx,
        token,
        TipoTokenAuth.RECUPERACAO_SENHA,
      );
      const usuario = await tx.usuario.findUnique({
        where: { id: consumido.usuarioId },
        select: { status: true, emailVerificadoEm: true },
      });
      if (
        !usuario ||
        usuario.status !== StatusContaUsuario.ATIVA ||
        !usuario.emailVerificadoEm
      ) {
        throw new AuthTokenInvalidoOuExpiradoException();
      }

      await tx.usuario.update({
        where: { id: consumido.usuarioId },
        data: { senhaHash: novaSenhaHash, senhaGeradaPorOAuth: false },
      });
      await tx.authToken.updateMany({
        where: { usuarioId: consumido.usuarioId, usadoEm: null },
        data: { usadoEm: new Date() },
      });
      await this.revogarSessoesEmTransacao(
        tx,
        consumido.usuarioId,
        'RESET_SENHA',
      );
    });

    return { mensagem: 'Senha redefinida com sucesso.' };
  }

  async verificarEmail(token: string) {
    const tokenHash = this.authTokenService.hashToken(token);
    const agora = new Date();
    const promovido = await this.prisma.$transaction(async (tx) => {
      const pendente = await tx.registroPendenteUsuario.findUnique({
        where: { tokenHash },
      });
      if (
        !pendente ||
        pendente.tokenExpiraEm <= agora ||
        pendente.expiraEm <= agora
      ) {
        return false;
      }

      const consumo = await tx.registroPendenteUsuario.deleteMany({
        where: {
          id: pendente.id,
          tokenHash,
          tokenExpiraEm: { gt: agora },
          expiraEm: { gt: agora },
        },
      });
      if (consumo.count === 0) {
        throw new AuthTokenInvalidoOuExpiradoException();
      }

      await tx.usuario.create({
        data: {
          apelido: pendente.apelido,
          email: pendente.email,
          senhaHash: pendente.senhaHash,
          emailVerificadoEm: agora,
          status: StatusContaUsuario.ATIVA,
        },
      });
      return true;
    });

    if (!promovido) {
      await this.verificarEmailLegado(token);
    }

    return { mensagem: 'Email verificado com sucesso.' };
  }

  async reenviarVerificacaoEmail(email: string) {
    const emailNormalizado = this.normalizarEmail(email);
    const agora = new Date();
    const tokenData = this.authTokenService.gerarTokenSeguro(
      this.obterVerificacaoTokenTtlMinutos(),
    );
    const pendente = await this.prisma.registroPendenteUsuario.findUnique({
      where: { email: emailNormalizado },
    });

    if (pendente && pendente.expiraEm > agora) {
      const atualizado = await this.prisma.registroPendenteUsuario.updateMany({
        where: { id: pendente.id, expiraEm: { gt: agora } },
        data: {
          tokenHash: tokenData.tokenHash,
          tokenExpiraEm: tokenData.expiraEm,
        },
      });
      if (atualizado.count > 0) {
        this.enviarEmailVerificacaoPendente(
          pendente.email,
          pendente.apelido,
          tokenData.token,
          tokenData.expiraEm,
        );
      }
      return { mensagem: MENSAGEM_REENVIO_VERIFICACAO };
    }

    const usuario =
      await this.usuarioService.buscarPorEmailOpcional(emailNormalizado);
    if (
      usuario &&
      usuario.status === StatusContaUsuario.ATIVA &&
      !usuario.emailVerificadoEm
    ) {
      await this.enviarEmailVerificacaoLegado(
        usuario.id,
        usuario.email,
        usuario.apelido,
      );
    }

    return { mensagem: MENSAGEM_REENVIO_VERIFICACAO };
  }

  async alterarSenha(usuarioId: number, dto: AlterarSenhaDto) {
    const usuario = await this.buscarUsuarioAtivoComSenha(usuarioId);
    await this.validarSenhaAtual(
      usuario.senhaHash,
      dto.senhaAtual,
      'alteracao',
    );
    const novaSenhaHash = await bcrypt.hash(dto.novaSenha, 10);

    await this.prisma.$transaction(async (tx) => {
      await tx.usuario.update({
        where: { id: usuarioId },
        data: { senhaHash: novaSenhaHash, senhaGeradaPorOAuth: false },
      });
      await tx.authToken.updateMany({
        where: { usuarioId, usadoEm: null },
        data: { usadoEm: new Date() },
      });
      await this.revogarSessoesEmTransacao(tx, usuarioId, 'ALTERACAO_SENHA');
    });

    return { mensagem: 'Senha alterada com sucesso.' };
  }

  async solicitarAlteracaoEmail(usuarioId: number, dto: AlterarEmailDto) {
    const usuario = await this.buscarUsuarioAtivoComSenha(usuarioId);
    await this.validarSenhaAtual(
      usuario.senhaHash,
      dto.senhaAtual,
      'alteracao',
    );
    const novoEmail = this.normalizarEmail(dto.novoEmail);
    if (novoEmail === usuario.email) {
      throw new UsuarioEmailDuplicadoException(novoEmail);
    }

    const tokenData = this.authTokenService.gerarTokenSeguro(
      this.obterAlteracaoEmailTokenTtlMinutos(),
    );
    try {
      await this.prisma.$transaction(async (tx) => {
        const [existente, registroPendente] = await Promise.all([
          tx.usuario.findUnique({
            where: { email: novoEmail },
            select: { id: true },
          }),
          tx.registroPendenteUsuario.findUnique({
            where: { email: novoEmail },
            select: { expiraEm: true },
          }),
        ]);
        if (
          existente ||
          (registroPendente && registroPendente.expiraEm > new Date())
        ) {
          throw new UsuarioEmailDuplicadoException(novoEmail);
        }

        await tx.alteracaoEmailPendente.upsert({
          where: { usuarioId },
          update: {
            novoEmail,
            tokenHash: tokenData.tokenHash,
            tokenExpiraEm: tokenData.expiraEm,
          },
          create: {
            usuarioId,
            novoEmail,
            tokenHash: tokenData.tokenHash,
            tokenExpiraEm: tokenData.expiraEm,
          },
        });
      });
    } catch (error) {
      if (this.ehConflitoUnico(error)) {
        throw new UsuarioEmailDuplicadoException(novoEmail);
      }
      throw error;
    }

    void this.authMailService
      .enviarConfirmacaoAlteracaoEmail({
        email: novoEmail,
        apelido: usuario.apelido,
        linkVerificacao: this.montarLinkFront(
          '/auth/verify-email-change',
          tokenData.token,
        ),
        expiraEm: tokenData.expiraEm,
      })
      .catch((error) => this.logMailError('alteração de email', error));

    return { mensagem: 'Enviamos uma confirmação para o novo email.' };
  }

  async confirmarAlteracaoEmail(token: string) {
    const tokenHash = this.authTokenService.hashToken(token);
    const agora = new Date();
    await this.prisma.$transaction(async (tx) => {
      const pendente = await tx.alteracaoEmailPendente.findUnique({
        where: { tokenHash },
        include: {
          usuario: {
            select: { id: true, status: true },
          },
        },
      });
      if (
        !pendente ||
        pendente.tokenExpiraEm <= agora ||
        pendente.usuario.status !== StatusContaUsuario.ATIVA
      ) {
        throw new AuthTokenInvalidoOuExpiradoException();
      }

      const consumo = await tx.alteracaoEmailPendente.deleteMany({
        where: {
          id: pendente.id,
          tokenHash,
          tokenExpiraEm: { gt: agora },
        },
      });
      if (consumo.count === 0) {
        throw new AuthTokenInvalidoOuExpiradoException();
      }

      const usuarioComNovoEmail = await tx.usuario.findUnique({
        where: { email: pendente.novoEmail },
        select: { id: true },
      });
      if (
        usuarioComNovoEmail &&
        usuarioComNovoEmail.id !== pendente.usuarioId
      ) {
        throw new UsuarioEmailDuplicadoException(pendente.novoEmail);
      }

      await tx.usuario.update({
        where: { id: pendente.usuarioId },
        data: {
          email: pendente.novoEmail,
          emailVerificadoEm: agora,
        },
      });
      await tx.authToken.updateMany({
        where: { usuarioId: pendente.usuarioId, usadoEm: null },
        data: { usadoEm: agora },
      });
      await this.revogarSessoesEmTransacao(
        tx,
        pendente.usuarioId,
        'ALTERACAO_EMAIL',
      );
    });

    return { mensagem: 'Email alterado com sucesso. Entre novamente.' };
  }

  async desativarConta(usuarioId: number, senhaAtual: string) {
    const usuario = await this.buscarUsuarioAtivoComSenha(usuarioId);
    await this.validarSenhaAtual(usuario.senhaHash, senhaAtual, 'alteracao');
    const agora = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.usuario.update({
        where: { id: usuarioId },
        data: {
          status: StatusContaUsuario.DESATIVADA,
          desativadoEm: agora,
          exclusaoSolicitadaEm: null,
          exclusaoAgendadaPara: null,
          excluidoEm: null,
        },
      });
      await tx.authToken.updateMany({
        where: { usuarioId, usadoEm: null },
        data: { usadoEm: agora },
      });
      await tx.alteracaoEmailPendente.deleteMany({ where: { usuarioId } });
      await this.revogarSessoesEmTransacao(tx, usuarioId, 'CONTA_DESATIVADA');
    });

    return { mensagem: 'Conta desativada. Você pode reativá-la pelo login.' };
  }

  async reativarConta(email: string, senha: string) {
    const emailNormalizado = this.normalizarEmail(email);
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: emailNormalizado },
      select: {
        id: true,
        senhaHash: true,
        status: true,
        emailVerificadoEm: true,
        exclusaoAgendadaPara: true,
      },
    });
    const senhaValida = await bcrypt.compare(
      senha,
      usuario?.senhaHash ?? SENHA_FICTICIA_HASH,
    );
    if (
      !usuario ||
      !senhaValida ||
      !usuario.emailVerificadoEm ||
      !this.contaPodeSerReativada(usuario.status, usuario.exclusaoAgendadaPara)
    ) {
      throw new CredenciaisInvalidasException();
    }

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        status: StatusContaUsuario.ATIVA,
        desativadoEm: null,
        exclusaoSolicitadaEm: null,
        exclusaoAgendadaPara: null,
        excluidoEm: null,
      },
    });
    return { mensagem: 'Conta reativada. Faça login para continuar.' };
  }

  async excluirConta(usuarioId: number, senhaAtual: string) {
    const usuario = await this.buscarUsuarioAtivoComSenha(usuarioId);
    await this.validarSenhaAtual(usuario.senhaHash, senhaAtual, 'exclusao');
    const agora = new Date();
    const exclusaoAgendadaPara = new Date(
      agora.getTime() + this.obterExclusaoContaGraceDays() * DAY_MS,
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.usuario.update({
        where: { id: usuarioId },
        data: {
          status: StatusContaUsuario.PENDENTE_EXCLUSAO,
          desativadoEm: agora,
          exclusaoSolicitadaEm: agora,
          exclusaoAgendadaPara,
          excluidoEm: null,
        },
      });
      await tx.alteracaoEmailPendente.deleteMany({ where: { usuarioId } });
      await tx.authToken.deleteMany({ where: { usuarioId } });
      await this.revogarSessoesEmTransacao(
        tx,
        usuarioId,
        'CONTA_EXCLUSAO_PENDENTE',
      );
    });

    return {
      mensagem:
        'Exclusão da conta agendada. Você pode reativá-la em até 90 dias.',
      exclusaoAgendadaPara: exclusaoAgendadaPara.toISOString(),
    };
  }

  private async verificarEmailLegado(token: string) {
    await this.prisma.$transaction(async (tx) => {
      const consumido = await this.authTokenService.consumirTokenEmTransacao(
        tx,
        token,
        TipoTokenAuth.VERIFICACAO_EMAIL,
      );
      await tx.usuario.update({
        where: { id: consumido.usuarioId },
        data: {
          emailVerificadoEm: new Date(),
          status: StatusContaUsuario.ATIVA,
        },
      });
      await this.authTokenService.invalidarTokensAtivosEmTransacao(
        tx,
        consumido.usuarioId,
        TipoTokenAuth.VERIFICACAO_EMAIL,
      );
      await this.revogarSessoesEmTransacao(
        tx,
        consumido.usuarioId,
        'VERIFICACAO_EMAIL',
      );
    });
  }

  private async enviarEmailVerificacaoLegado(
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

    try {
      await this.authMailService.enviarVerificacaoEmail({
        email,
        apelido,
        linkVerificacao: this.montarLinkFront('/auth/verify-email', token),
        expiraEm,
      });
    } catch (error) {
      this.logMailError('verificação de email legada', error);
    }
  }

  private enviarEmailVerificacaoPendente(
    email: string,
    apelido: string,
    token: string,
    expiraEm: Date,
  ) {
    void this.authMailService
      .enviarVerificacaoEmail({
        email,
        apelido,
        linkVerificacao: this.montarLinkFront('/auth/verify-email', token),
        expiraEm,
      })
      .catch((error) => this.logMailError('verificação de email', error));
  }

  private async buscarUsuarioAtivoComSenha(usuarioId: number) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id: usuarioId, status: StatusContaUsuario.ATIVA },
      select: {
        id: true,
        apelido: true,
        email: true,
        senhaHash: true,
      },
    });
    if (!usuario) throw new UsuarioNaoEncontradoException(usuarioId);
    return usuario;
  }

  private async validarSenhaAtual(
    senhaHash: string,
    senhaAtual: string,
    contexto: 'alteracao' | 'exclusao',
  ) {
    if (!(await bcrypt.compare(senhaAtual, senhaHash))) {
      throw new UsuarioSenhaIncorretaException(contexto);
    }
  }

  private async revogarSessoesEmTransacao(
    tx: Prisma.TransactionClient,
    usuarioId: number,
    motivo: string,
  ) {
    await tx.sessaoAutenticacao.updateMany({
      where: { usuarioId, revogadaEm: null },
      data: { revogadaEm: new Date(), revogacaoMotivo: motivo },
    });
  }

  private montarLinkFront(path: string, token: string) {
    const base = (process.env.FRONTEND_URL ?? 'http://localhost:3001').replace(
      /\/$/,
      '',
    );
    return `${base}${path}?token=${encodeURIComponent(token)}`;
  }

  private obterResetTokenTtlMinutos() {
    return this.obterNumeroPositivo('AUTH_RESET_TOKEN_TTL_MINUTES', 30);
  }

  private obterVerificacaoTokenTtlMinutos() {
    return this.obterNumeroPositivo('AUTH_VERIFY_TOKEN_TTL_MINUTES', 1440);
  }

  private obterAlteracaoEmailTokenTtlMinutos() {
    return this.obterNumeroPositivo('AUTH_EMAIL_CHANGE_TOKEN_TTL_MINUTES', 30);
  }

  private obterRegistroPendenteTtlHoras() {
    return this.obterNumeroPositivo('AUTH_PENDING_REGISTRATION_TTL_HOURS', 168);
  }

  private obterExclusaoContaGraceDays() {
    return this.obterNumeroPositivo(
      'AUTH_ACCOUNT_DELETION_GRACE_DAYS',
      DEFAULT_ACCOUNT_DELETION_GRACE_DAYS,
    );
  }

  private obterNumeroPositivo(key: string, fallback: number) {
    const valor = Number(process.env[key] ?? fallback);
    return Number.isFinite(valor) && valor > 0 ? valor : fallback;
  }

  private normalizarEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private contaPodeSerReativada(
    status: StatusContaUsuario,
    exclusaoAgendadaPara: Date | null,
  ) {
    if (status === StatusContaUsuario.DESATIVADA) return true;
    return (
      status === StatusContaUsuario.PENDENTE_EXCLUSAO &&
      exclusaoAgendadaPara !== null &&
      exclusaoAgendadaPara > new Date()
    );
  }

  private ehConflitoUnico(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }

  private logMailError(contexto: string, error: unknown) {
    this.logger.error(
      `Falha ao enviar email de ${contexto}.`,
      error instanceof Error ? error.stack : undefined,
    );
  }
}
