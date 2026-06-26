import { RoleUsuario, StatusContaUsuario, TipoTokenAuth } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import {
  AuthEmailNaoVerificadoException,
  CredenciaisInvalidasException,
} from 'src/common/exceptions/auth.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsuarioService } from 'src/usuario/usuario.service';
import { AuthMailService } from './auth-mail.service';
import { AuthSessionService } from './auth-session.service';
import { AuthTokenService } from './auth-token.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => {
  const actual = jest.requireActual<typeof import('bcrypt')>('bcrypt');
  return {
    ...actual,
    compare: jest.fn((data: string | Buffer, encrypted: string) =>
      actual.compare(data, encrypted),
    ),
  };
});

type UsuarioServiceMock = {
  buscarPorEmailOpcional: jest.Mock;
};

type AuthTokenServiceMock = {
  gerarToken: jest.Mock;
  consumirTokenEmTransacao: jest.Mock;
  invalidarTokensAtivos: jest.Mock;
  invalidarTokensAtivosEmTransacao: jest.Mock;
  gerarTokenSeguro: jest.Mock;
  hashToken: jest.Mock;
};

type AuthMailServiceMock = {
  enviarRecuperacaoSenha: jest.Mock;
  enviarVerificacaoEmail: jest.Mock;
  enviarConfirmacaoAlteracaoEmail: jest.Mock;
};

type AuthSessionServiceMock = {
  criarSessao: jest.Mock;
};

type PrismaMock = {
  usuario: {
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  registroPendenteUsuario: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
    deleteMany: jest.Mock;
  };
  alteracaoEmailPendente: {
    findUnique: jest.Mock;
    upsert: jest.Mock;
    deleteMany: jest.Mock;
  };
  authToken: {
    updateMany: jest.Mock;
    deleteMany: jest.Mock;
  };
  sessaoAutenticacao: {
    updateMany: jest.Mock;
  };
  $transaction: jest.Mock;
};

const EMAIL_VERIFICADO_EM = new Date('2026-01-01T00:00:00.000Z');

describe('AuthService', () => {
  let service: AuthService;
  let usuarioService: UsuarioServiceMock;
  let authTokenService: AuthTokenServiceMock;
  let authMailService: AuthMailServiceMock;
  let authSessionService: AuthSessionServiceMock;
  let prisma: PrismaMock;

  beforeEach(() => {
    usuarioService = {
      buscarPorEmailOpcional: jest.fn(),
    };
    authTokenService = {
      gerarToken: jest.fn(),
      consumirTokenEmTransacao: jest.fn(),
      invalidarTokensAtivos: jest.fn(),
      invalidarTokensAtivosEmTransacao: jest.fn(),
      gerarTokenSeguro: jest.fn().mockReturnValue({
        token: 'token-seguro',
        tokenHash: 'hash-token-seguro',
        expiraEm: new Date(Date.now() + 60_000),
      }),
      hashToken: jest.fn((token: string) => `hash:${token}`),
    };
    authMailService = {
      enviarRecuperacaoSenha: jest.fn().mockResolvedValue(undefined),
      enviarVerificacaoEmail: jest.fn().mockResolvedValue(undefined),
      enviarConfirmacaoAlteracaoEmail: jest.fn().mockResolvedValue(undefined),
    };
    authSessionService = {
      criarSessao: jest.fn().mockResolvedValue({ csrfToken: 'csrf-token' }),
    };
    prisma = {
      usuario: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      registroPendenteUsuario: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      alteracaoEmailPendente: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        deleteMany: jest.fn(),
      },
      authToken: {
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      sessaoAutenticacao: {
        updateMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    service = new AuthService(
      usuarioService as unknown as UsuarioService,
      authTokenService as unknown as AuthTokenService,
      authMailService as unknown as AuthMailService,
      authSessionService as unknown as AuthSessionService,
      prisma as unknown as PrismaService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function usuarioAtivo(overrides: Record<string, unknown> = {}) {
    return {
      id: 1,
      email: 'usuario@example.com',
      apelido: 'Usuario',
      senhaHash: 'hash-senha',
      role: RoleUsuario.USUARIO,
      status: StatusContaUsuario.ATIVA,
      emailVerificadoEm: EMAIL_VERIFICADO_EM,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
      ...overrides,
    };
  }

  it('cria sessao por cookie no login sem retornar access token', async () => {
    const usuario = usuarioAtivo();
    const request = { get: jest.fn(), ip: '127.0.0.1' };
    const response = { cookie: jest.fn() };

    const resposta = await service.login(
      usuario,
      true,
      request as unknown as Request,
      response as unknown as Response,
    );

    expect(authSessionService.criarSessao).toHaveBeenCalledWith(
      usuario,
      true,
      request,
      response,
    );
    expect(resposta.usuario).toEqual({
      id: usuario.id,
      email: usuario.email,
      apelido: usuario.apelido,
      role: usuario.role,
      emailVerificado: true,
    });
    expect(resposta).not.toHaveProperty('access_token');
  });

  it('cria somente pre-registro normalizado e responde genericamente', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);
    prisma.registroPendenteUsuario.findUnique.mockResolvedValue(null);
    prisma.registroPendenteUsuario.create.mockImplementation(({ data }) => ({
      id: 10,
      email: data.email,
      apelido: data.apelido,
      tokenExpiraEm: data.tokenExpiraEm,
    }));

    const resposta = await service.register({
      apelido: 'Novo',
      email: ' NOVO@EXAMPLE.COM ',
      senha: 'senha-segura',
    });

    expect(prisma.usuario.create).not.toHaveBeenCalled();
    expect(prisma.registroPendenteUsuario.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'novo@example.com',
          apelido: 'Novo',
          senhaHash: expect.any(String),
          tokenHash: 'hash-token-seguro',
        }),
      }),
    );
    expect(authMailService.enviarVerificacaoEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'novo@example.com',
        linkVerificacao: expect.stringContaining('token=token-seguro'),
      }),
    );
    expect(resposta.mensagem).toContain('link');
  });

  it('nao sobrescreve pre-registro ainda ativo', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);
    prisma.registroPendenteUsuario.findUnique.mockResolvedValue({
      id: 10,
      expiraEm: new Date(Date.now() + 60_000),
    });

    const resposta = await service.register({
      apelido: 'Tentativa',
      email: 'novo@example.com',
      senha: 'outra-senha',
    });

    expect(prisma.registroPendenteUsuario.create).not.toHaveBeenCalled();
    expect(prisma.registroPendenteUsuario.update).not.toHaveBeenCalled();
    expect(authMailService.enviarVerificacaoEmail).not.toHaveBeenCalled();
    expect(resposta.mensagem).toContain('link');
  });

  it('promove pre-registro verificado para Usuario em transacao', async () => {
    prisma.registroPendenteUsuario.findUnique.mockResolvedValue({
      id: 10,
      email: 'novo@example.com',
      apelido: 'Novo',
      senhaHash: 'hash-senha',
      tokenHash: 'hash:token-promocao',
      tokenExpiraEm: new Date(Date.now() + 60_000),
      expiraEm: new Date(Date.now() + 120_000),
    });
    prisma.registroPendenteUsuario.deleteMany.mockResolvedValue({ count: 1 });

    await service.verificarEmail('token-promocao');

    expect(prisma.registroPendenteUsuario.deleteMany).toHaveBeenCalledWith({
      where: {
        id: 10,
        tokenHash: 'hash:token-promocao',
        tokenExpiraEm: { gt: expect.any(Date) },
        expiraEm: { gt: expect.any(Date) },
      },
    });
    expect(prisma.usuario.create).toHaveBeenCalledWith({
      data: {
        apelido: 'Novo',
        email: 'novo@example.com',
        senhaHash: 'hash-senha',
        emailVerificadoEm: expect.any(Date),
        status: StatusContaUsuario.ATIVA,
      },
    });
    expect(authTokenService.consumirTokenEmTransacao).not.toHaveBeenCalled();
  });

  it('mantem fallback transacional para verificacao legada', async () => {
    prisma.registroPendenteUsuario.findUnique.mockResolvedValue(null);
    authTokenService.consumirTokenEmTransacao.mockResolvedValue({
      usuarioId: 7,
    });

    await service.verificarEmail('token-legado');

    expect(authTokenService.consumirTokenEmTransacao).toHaveBeenCalledWith(
      prisma,
      'token-legado',
      TipoTokenAuth.VERIFICACAO_EMAIL,
    );
    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: {
        emailVerificadoEm: expect.any(Date),
        status: StatusContaUsuario.ATIVA,
      },
    });
    expect(
      authTokenService.invalidarTokensAtivosEmTransacao,
    ).toHaveBeenCalledWith(prisma, 7, TipoTokenAuth.VERIFICACAO_EMAIL);
    expect(prisma.sessaoAutenticacao.updateMany).toHaveBeenCalledWith({
      where: { usuarioId: 7, revogadaEm: null },
      data: {
        revogadaEm: expect.any(Date),
        revogacaoMotivo: 'VERIFICACAO_EMAIL',
      },
    });
  });

  it('executa bcrypt ficticio quando email nao existe', async () => {
    usuarioService.buscarPorEmailOpcional.mockResolvedValue(null);
    const compareMock = jest.mocked(bcrypt.compare);
    compareMock.mockClear();

    await expect(
      service.validarUsuario('naoexiste@example.com', 'senha1234'),
    ).rejects.toBeInstanceOf(CredenciaisInvalidasException);

    expect(compareMock).toHaveBeenCalledWith(
      'senha1234',
      expect.stringMatching(/^\$2[aby]\$/),
    );
  });

  it('diferencia conta ativa nao verificada sem expor senhaHash', async () => {
    const senhaHash = await bcrypt.hash('senha-correta', 4);
    usuarioService.buscarPorEmailOpcional.mockResolvedValue(
      usuarioAtivo({ senhaHash, emailVerificadoEm: null }),
    );

    await expect(
      service.validarUsuario('usuario@example.com', 'senha-correta'),
    ).rejects.toBeInstanceOf(AuthEmailNaoVerificadoException);
  });

  it.each([
    ['inexistente', null],
    ['desativado', usuarioAtivo({ status: StatusContaUsuario.DESATIVADA })],
    ['nao verificado', usuarioAtivo({ emailVerificadoEm: null })],
  ])(
    'forgot-password nao gera token para usuario %s',
    async (_cenario, usuario) => {
      usuarioService.buscarPorEmailOpcional.mockResolvedValue(usuario);

      const resposta = await service.solicitarRecuperacaoSenha(
        'usuario@example.com',
      );

      expect(authTokenService.gerarToken).not.toHaveBeenCalled();
      expect(authMailService.enviarRecuperacaoSenha).not.toHaveBeenCalled();
      expect(resposta.mensagem).toContain('email');
    },
  );

  it('forgot-password gera token apenas para conta ativa e verificada', async () => {
    usuarioService.buscarPorEmailOpcional.mockResolvedValue(usuarioAtivo());
    authTokenService.gerarToken.mockResolvedValue({
      token: 'token-recuperacao',
      expiraEm: new Date(Date.now() + 60_000),
    });

    await service.solicitarRecuperacaoSenha('usuario@example.com');

    expect(authTokenService.invalidarTokensAtivos).toHaveBeenCalledWith(
      1,
      TipoTokenAuth.RECUPERACAO_SENHA,
    );
    expect(authTokenService.gerarToken).toHaveBeenCalledWith(
      1,
      TipoTokenAuth.RECUPERACAO_SENHA,
      expect.any(Number),
    );
    expect(authMailService.enviarRecuperacaoSenha).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'usuario@example.com',
        linkRecuperacao: expect.stringContaining('token=token-recuperacao'),
      }),
    );
  });

  it('reset consome token, invalida irmaos e revoga sessoes na mesma transacao', async () => {
    authTokenService.consumirTokenEmTransacao.mockResolvedValue({
      usuarioId: 8,
    });
    prisma.usuario.findUnique.mockResolvedValue({
      status: StatusContaUsuario.ATIVA,
      emailVerificadoEm: EMAIL_VERIFICADO_EM,
    });

    await service.redefinirSenha('token-reset', 'nova-senha-segura');

    expect(authTokenService.consumirTokenEmTransacao).toHaveBeenCalledWith(
      prisma,
      'token-reset',
      TipoTokenAuth.RECUPERACAO_SENHA,
    );
    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: 8 },
      data: { senhaHash: expect.any(String), senhaGeradaPorOAuth: false },
    });
    expect(prisma.authToken.updateMany).toHaveBeenCalledWith({
      where: { usuarioId: 8, usadoEm: null },
      data: { usadoEm: expect.any(Date) },
    });
    expect(prisma.sessaoAutenticacao.updateMany).toHaveBeenCalledWith({
      where: { usuarioId: 8, revogadaEm: null },
      data: {
        revogadaEm: expect.any(Date),
        revogacaoMotivo: 'RESET_SENHA',
      },
    });
  });

  it('troca senha autenticada e revoga tokens e sessoes', async () => {
    const senhaHash = await bcrypt.hash('senha-atual', 4);
    prisma.usuario.findFirst.mockResolvedValue(usuarioAtivo({ senhaHash }));

    await service.alterarSenha(1, {
      senhaAtual: 'senha-atual',
      novaSenha: 'nova-senha-segura',
    });

    expect(prisma.usuario.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1, status: StatusContaUsuario.ATIVA },
      }),
    );
    expect(prisma.authToken.updateMany).toHaveBeenCalledWith({
      where: { usuarioId: 1, usadoEm: null },
      data: { usadoEm: expect.any(Date) },
    });
    expect(prisma.sessaoAutenticacao.updateMany).toHaveBeenCalledWith({
      where: { usuarioId: 1, revogadaEm: null },
      data: {
        revogadaEm: expect.any(Date),
        revogacaoMotivo: 'ALTERACAO_SENHA',
      },
    });
  });

  it('solicita mudanca de email somente apos validar senha atual', async () => {
    const senhaHash = await bcrypt.hash('senha-atual', 4);
    prisma.usuario.findFirst.mockResolvedValue(usuarioAtivo({ senhaHash }));
    prisma.usuario.findUnique.mockResolvedValue(null);

    await service.solicitarAlteracaoEmail(1, {
      novoEmail: ' NOVO@EXAMPLE.COM ',
      senhaAtual: 'senha-atual',
    });

    expect(prisma.alteracaoEmailPendente.upsert).toHaveBeenCalledWith({
      where: { usuarioId: 1 },
      update: {
        novoEmail: 'novo@example.com',
        tokenHash: 'hash-token-seguro',
        tokenExpiraEm: expect.any(Date),
      },
      create: {
        usuarioId: 1,
        novoEmail: 'novo@example.com',
        tokenHash: 'hash-token-seguro',
        tokenExpiraEm: expect.any(Date),
      },
    });
    expect(
      authMailService.enviarConfirmacaoAlteracaoEmail,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'novo@example.com',
        linkVerificacao: expect.stringContaining('token=token-seguro'),
      }),
    );
  });

  it('confirma novo email e revoga todos os acessos', async () => {
    prisma.alteracaoEmailPendente.findUnique.mockResolvedValue({
      id: 4,
      usuarioId: 1,
      novoEmail: 'novo@example.com',
      tokenExpiraEm: new Date(Date.now() + 60_000),
      usuario: { id: 1, status: StatusContaUsuario.ATIVA },
    });
    prisma.alteracaoEmailPendente.deleteMany.mockResolvedValue({ count: 1 });

    await service.confirmarAlteracaoEmail('token-email');

    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        email: 'novo@example.com',
        emailVerificadoEm: expect.any(Date),
      },
    });
    expect(prisma.authToken.updateMany).toHaveBeenCalledWith({
      where: { usuarioId: 1, usadoEm: null },
      data: { usadoEm: expect.any(Date) },
    });
    expect(prisma.sessaoAutenticacao.updateMany).toHaveBeenCalledWith({
      where: { usuarioId: 1, revogadaEm: null },
      data: {
        revogadaEm: expect.any(Date),
        revogacaoMotivo: 'ALTERACAO_EMAIL',
      },
    });
  });

  it('desativa e permite reativar apenas conta desativada com senha valida', async () => {
    const senhaHash = await bcrypt.hash('senha-atual', 4);
    prisma.usuario.findFirst.mockResolvedValue(usuarioAtivo({ senhaHash }));

    await service.desativarConta(1, 'senha-atual');

    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        status: StatusContaUsuario.DESATIVADA,
        desativadoEm: expect.any(Date),
        exclusaoSolicitadaEm: null,
        exclusaoAgendadaPara: null,
        excluidoEm: null,
      },
    });
    expect(prisma.sessaoAutenticacao.updateMany).toHaveBeenCalledWith({
      where: { usuarioId: 1, revogadaEm: null },
      data: {
        revogadaEm: expect.any(Date),
        revogacaoMotivo: 'CONTA_DESATIVADA',
      },
    });

    prisma.usuario.update.mockClear();
    prisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      senhaHash,
      status: StatusContaUsuario.DESATIVADA,
      emailVerificadoEm: EMAIL_VERIFICADO_EM,
      exclusaoAgendadaPara: null,
    });

    await service.reativarConta(' USUARIO@EXAMPLE.COM ', 'senha-atual');

    expect(prisma.usuario.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'usuario@example.com' } }),
    );
    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        status: StatusContaUsuario.ATIVA,
        desativadoEm: null,
        exclusaoSolicitadaEm: null,
        exclusaoAgendadaPara: null,
        excluidoEm: null,
      },
    });
  });

  it('agenda exclusao por 90 dias e preserva credenciais para reativacao', async () => {
    const senhaHash = await bcrypt.hash('senha-atual', 4);
    prisma.usuario.findFirst.mockResolvedValue(usuarioAtivo({ senhaHash }));

    const resposta = await service.excluirConta(1, 'senha-atual');

    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        status: StatusContaUsuario.PENDENTE_EXCLUSAO,
        desativadoEm: expect.any(Date),
        exclusaoSolicitadaEm: expect.any(Date),
        exclusaoAgendadaPara: expect.any(Date),
        excluidoEm: null,
      }),
    });
    expect(prisma.usuario.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: expect.stringMatching(/^excluido-/),
        }),
      }),
    );
    expect(prisma.alteracaoEmailPendente.deleteMany).toHaveBeenCalledWith({
      where: { usuarioId: 1 },
    });
    expect(prisma.authToken.deleteMany).toHaveBeenCalledWith({
      where: { usuarioId: 1 },
    });
    expect(prisma.sessaoAutenticacao.updateMany).toHaveBeenCalledWith({
      where: { usuarioId: 1, revogadaEm: null },
      data: {
        revogadaEm: expect.any(Date),
        revogacaoMotivo: 'CONTA_EXCLUSAO_PENDENTE',
      },
    });
    expect(resposta).toHaveProperty('exclusaoAgendadaPara');
    expect(prisma).not.toHaveProperty('usuario.delete');
  });

  it('reativa conta pendente de exclusao antes do prazo', async () => {
    const senhaHash = await bcrypt.hash('senha-atual', 4);
    prisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      senhaHash,
      status: StatusContaUsuario.PENDENTE_EXCLUSAO,
      emailVerificadoEm: EMAIL_VERIFICADO_EM,
      exclusaoAgendadaPara: new Date(Date.now() + 60_000),
    });

    await service.reativarConta('usuario@example.com', 'senha-atual');

    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        status: StatusContaUsuario.ATIVA,
        desativadoEm: null,
        exclusaoSolicitadaEm: null,
        exclusaoAgendadaPara: null,
        excluidoEm: null,
      },
    });
  });

  it('nao reativa conta pendente de exclusao vencida', async () => {
    const senhaHash = await bcrypt.hash('senha-atual', 4);
    prisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      senhaHash,
      status: StatusContaUsuario.PENDENTE_EXCLUSAO,
      emailVerificadoEm: EMAIL_VERIFICADO_EM,
      exclusaoAgendadaPara: new Date(Date.now() - 60_000),
    });

    await expect(
      service.reativarConta('usuario@example.com', 'senha-atual'),
    ).rejects.toBeInstanceOf(CredenciaisInvalidasException);
  });

  it('rejeita login de conta desativada com excecao generica', async () => {
    const senhaHash = await bcrypt.hash('senha-correta', 4);
    usuarioService.buscarPorEmailOpcional.mockResolvedValue(
      usuarioAtivo({ senhaHash, status: StatusContaUsuario.DESATIVADA }),
    );

    await expect(
      service.validarUsuario('usuario@example.com', 'senha-correta'),
    ).rejects.toBeInstanceOf(CredenciaisInvalidasException);
  });
});
