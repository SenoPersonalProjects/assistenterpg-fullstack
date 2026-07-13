import { Test, TestingModule } from '@nestjs/testing';
import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { SessaoController } from './sessao.controller';
import { SessaoService } from './sessao.service';
import { SessaoGateway } from './sessao.gateway';
import { SessaoActivationService } from './sessao-activation.service';

describe('SessaoController', () => {
  let controller: SessaoController;

  const sessaoServiceMock = {
    listarSessoesCampanha: jest.fn(),
    criarSessaoCampanha: jest.fn(),
    buscarDetalheSessao: jest.fn(),
    listarChatSessao: jest.fn(),
    listarEventosSessao: jest.fn(),
    enviarMensagemChatSessao: jest.fn(),
    avancarTurnoSessao: jest.fn(),
    voltarTurnoSessao: jest.fn(),
    pularTurnoSessao: jest.fn(),
    atualizarOrdemIniciativaSessao: jest.fn(),
    encerrarSessaoCampanha: jest.fn(),
    atualizarCenaSessao: jest.fn(),
    adicionarNpcSessao: jest.fn(),
    atualizarNpcSessao: jest.fn(),
    removerNpcSessao: jest.fn(),
    desfazerEventoSessao: jest.fn(),
    listarRegrasOpcionaisSessao: jest.fn(),
    atualizarRegraOpcionalSessao: jest.fn(),
    ajustarInspiracaoSessao: jest.fn(),
    gastarInspiracaoSessao: jest.fn(),
    atualizarEncontroSocialSessao: jest.fn(),
    atualizarEscaladaDadosSessao: jest.fn(),
  };

  const sessaoGatewayMock = {
    emitirSessaoAtualizada: jest.fn(),
  };

  const sessaoActivationServiceMock = {
    processarVencidasComFallbackLazy: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessaoController],
      providers: [
        {
          provide: SessaoService,
          useValue: sessaoServiceMock,
        },
        {
          provide: SessaoGateway,
          useValue: sessaoGatewayMock,
        },
        {
          provide: SessaoActivationService,
          useValue: sessaoActivationServiceMock,
        },
      ],
    }).compile();

    controller = module.get<SessaoController>(SessaoController);
  });

  const obterRota = (methodName: keyof SessaoController) => {
    const handler = Reflect.get(SessaoController.prototype, methodName) as
      | ((...args: unknown[]) => unknown)
      | undefined;

    return {
      method: handler
        ? Reflect.getMetadata(METHOD_METADATA, handler)
        : undefined,
      path: handler ? Reflect.getMetadata(PATH_METADATA, handler) : undefined,
    };
  };

  it('deve registrar PATCH e POST separados para mecanicas de sessao', () => {
    expect(obterRota('atualizarEncontroSocialSessao')).toEqual({
      method: RequestMethod.PATCH,
      path: ':sessaoId/mecanicas/social/encontros',
    });
    expect(obterRota('criarEncontroSocialSessao')).toEqual({
      method: RequestMethod.POST,
      path: ':sessaoId/mecanicas/social/encontros',
    });
    expect(obterRota('atualizarEscaladaDadosSessao')).toEqual({
      method: RequestMethod.PATCH,
      path: ':sessaoId/mecanicas/escalada',
    });
    expect(obterRota('criarEscaladaDadosSessao')).toEqual({
      method: RequestMethod.POST,
      path: ':sessaoId/mecanicas/escalada',
    });
  });

  it('deve encaminhar criação de sessão para o service', async () => {
    sessaoServiceMock.criarSessaoCampanha.mockResolvedValue({ id: 1 });

    await controller.criarSessaoCampanha(
      7,
      { user: { id: 3 } },
      { titulo: 'S1' },
    );

    expect(sessaoServiceMock.criarSessaoCampanha).toHaveBeenCalledWith(7, 3, {
      titulo: 'S1',
    });
  });

  it('deve encaminhar listagem de chat para o service', async () => {
    sessaoServiceMock.listarChatSessao.mockResolvedValue([]);

    await controller.listarChatSessao(
      7,
      12,
      { user: { id: 3 } },
      { afterId: 44 },
    );

    expect(sessaoServiceMock.listarChatSessao).toHaveBeenCalledWith(
      7,
      12,
      3,
      44,
    );
  });

  it('deve encaminhar listagem de eventos da sessão para o service', async () => {
    sessaoServiceMock.listarEventosSessao.mockResolvedValue([]);

    await controller.listarEventosSessao(
      7,
      12,
      { user: { id: 3 } },
      { limit: 30, incluirChat: false },
    );

    expect(sessaoServiceMock.listarEventosSessao).toHaveBeenCalledWith(
      7,
      12,
      3,
      { limit: 30, incluirChat: false },
    );
  });

  it('deve encaminhar encerramento de sessão para o service', async () => {
    sessaoServiceMock.encerrarSessaoCampanha.mockResolvedValue({ id: 12 });

    await controller.encerrarSessaoCampanha(7, 12, { user: { id: 3 } });

    expect(sessaoServiceMock.encerrarSessaoCampanha).toHaveBeenCalledWith(
      7,
      12,
      3,
    );
    expect(sessaoGatewayMock.emitirSessaoAtualizada).toHaveBeenCalledWith(
      7,
      12,
      'SESSAO_ENCERRADA',
    );
  });

  it('deve emitir evento ao enviar mensagem de chat', async () => {
    sessaoServiceMock.enviarMensagemChatSessao.mockResolvedValue({ id: 55 });

    await controller.enviarMensagemChatSessao(
      7,
      12,
      { user: { id: 3 } },
      { mensagem: 'ola' },
    );

    expect(sessaoServiceMock.enviarMensagemChatSessao).toHaveBeenCalledWith(
      7,
      12,
      3,
      { mensagem: 'ola' },
    );
    expect(sessaoGatewayMock.emitirSessaoAtualizada).toHaveBeenCalledWith(
      7,
      12,
      'CHAT_NOVA',
    );
  });

  it('não emite realtime quando mutação é rejeitada pelo service', async () => {
    sessaoServiceMock.enviarMensagemChatSessao.mockRejectedValue(
      new Error('sessão encerrada'),
    );

    await expect(
      controller.enviarMensagemChatSessao(
        7,
        12,
        { user: { id: 3 } },
        { mensagem: 'ola' },
      ),
    ).rejects.toThrow('sessão encerrada');

    expect(sessaoGatewayMock.emitirSessaoAtualizada).not.toHaveBeenCalled();
  });

  it('deve emitir evento ao atualizar cena', async () => {
    sessaoServiceMock.atualizarCenaSessao.mockResolvedValue({ id: 12 });

    await controller.atualizarCenaSessao(
      7,
      12,
      { user: { id: 3 } },
      { tipo: 'COMBATE' },
    );

    expect(sessaoServiceMock.atualizarCenaSessao).toHaveBeenCalledWith(
      7,
      12,
      3,
      { tipo: 'COMBATE' },
    );
    expect(sessaoGatewayMock.emitirSessaoAtualizada).toHaveBeenCalledWith(
      7,
      12,
      'CENA_ATUALIZADA',
    );
  });

  it('deve emitir evento ao voltar turno', async () => {
    sessaoServiceMock.voltarTurnoSessao.mockResolvedValue({ id: 12 });

    await controller.voltarTurnoSessao(7, 12, { user: { id: 3 } });

    expect(sessaoServiceMock.voltarTurnoSessao).toHaveBeenCalledWith(7, 12, 3);
    expect(sessaoGatewayMock.emitirSessaoAtualizada).toHaveBeenCalledWith(
      7,
      12,
      'TURNO_RECUADO',
    );
  });

  it('deve emitir evento ao pular turno', async () => {
    sessaoServiceMock.pularTurnoSessao.mockResolvedValue({ id: 12 });

    await controller.pularTurnoSessao(7, 12, { user: { id: 3 } });

    expect(sessaoServiceMock.pularTurnoSessao).toHaveBeenCalledWith(7, 12, 3);
    expect(sessaoGatewayMock.emitirSessaoAtualizada).toHaveBeenCalledWith(
      7,
      12,
      'TURNO_PULADO',
    );
  });

  it('deve emitir evento ao atualizar ordem de iniciativa', async () => {
    sessaoServiceMock.atualizarOrdemIniciativaSessao.mockResolvedValue({
      id: 12,
    });

    await controller.atualizarOrdemIniciativaSessao(
      7,
      12,
      { user: { id: 3 } },
      {
        ordem: [
          { tipoParticipante: 'PERSONAGEM', id: 20 },
          { tipoParticipante: 'NPC', id: 44 },
        ],
        indiceTurnoAtual: 1,
      },
    );

    expect(
      sessaoServiceMock.atualizarOrdemIniciativaSessao,
    ).toHaveBeenCalledWith(7, 12, 3, {
      ordem: [
        { tipoParticipante: 'PERSONAGEM', id: 20 },
        { tipoParticipante: 'NPC', id: 44 },
      ],
      indiceTurnoAtual: 1,
    });
    expect(sessaoGatewayMock.emitirSessaoAtualizada).toHaveBeenCalledWith(
      7,
      12,
      'ORDEM_INICIATIVA_ATUALIZADA',
    );
  });

  it('deve desfazer evento da sessão e emitir notificacao realtime', async () => {
    sessaoServiceMock.desfazerEventoSessao.mockResolvedValue({ id: 12 });

    await controller.desfazerEventoSessao(
      7,
      12,
      99,
      { user: { id: 3 } },
      { motivo: 'erro de mesa' },
    );

    expect(sessaoServiceMock.desfazerEventoSessao).toHaveBeenCalledWith(
      7,
      12,
      99,
      3,
      'erro de mesa',
    );
    expect(sessaoGatewayMock.emitirSessaoAtualizada).toHaveBeenCalledWith(
      7,
      12,
      'SESSAO_EVENTO_DESFEITO',
    );
  });

  it('deve listar regras opcionais da sessao', async () => {
    sessaoServiceMock.listarRegrasOpcionaisSessao.mockResolvedValue({});

    await controller.listarRegrasOpcionaisSessao(7, 12, { user: { id: 3 } });

    expect(sessaoServiceMock.listarRegrasOpcionaisSessao).toHaveBeenCalledWith(
      7,
      12,
      3,
    );
  });

  it('deve emitir evento ao atualizar regra opcional', async () => {
    const dto = { chave: 'INSPIRACAO' as const, ativo: true };
    sessaoServiceMock.atualizarRegraOpcionalSessao.mockResolvedValue({});

    await controller.atualizarRegraOpcionalSessao(
      7,
      12,
      { user: { id: 3 } },
      dto,
    );

    expect(sessaoServiceMock.atualizarRegraOpcionalSessao).toHaveBeenCalledWith(
      7,
      12,
      3,
      dto,
    );
    expect(sessaoGatewayMock.emitirSessaoAtualizada).toHaveBeenCalledWith(
      7,
      12,
      'REGRA_OPCIONAL_ATUALIZADA',
    );
  });

  it('deve emitir evento ao ajustar inspiracao', async () => {
    const dto = { delta: 1 };
    sessaoServiceMock.ajustarInspiracaoSessao.mockResolvedValue({});

    await controller.ajustarInspiracaoSessao(
      7,
      12,
      44,
      { user: { id: 3 } },
      dto,
    );

    expect(sessaoServiceMock.ajustarInspiracaoSessao).toHaveBeenCalledWith(
      7,
      12,
      44,
      3,
      dto,
    );
    expect(sessaoGatewayMock.emitirSessaoAtualizada).toHaveBeenCalledWith(
      7,
      12,
      'INSPIRACAO_AJUSTADA',
    );
  });

  it('deve emitir evento ao gastar inspiracao', async () => {
    const dto = { custo: 1, efeito: 'BONUS_5' as const };
    sessaoServiceMock.gastarInspiracaoSessao.mockResolvedValue({});

    await controller.gastarInspiracaoSessao(
      7,
      12,
      44,
      { user: { id: 3 } },
      dto,
    );

    expect(sessaoServiceMock.gastarInspiracaoSessao).toHaveBeenCalledWith(
      7,
      12,
      44,
      3,
      dto,
    );
    expect(sessaoGatewayMock.emitirSessaoAtualizada).toHaveBeenCalledWith(
      7,
      12,
      'INSPIRACAO_GASTA',
    );
  });

  it('deve emitir evento ao atualizar encontro social', async () => {
    const dto = { alvos: [] };
    sessaoServiceMock.atualizarEncontroSocialSessao.mockResolvedValue({});

    await controller.atualizarEncontroSocialSessao(
      7,
      12,
      { user: { id: 3 } },
      dto,
    );

    expect(
      sessaoServiceMock.atualizarEncontroSocialSessao,
    ).toHaveBeenCalledWith(7, 12, 3, dto);
    expect(sessaoGatewayMock.emitirSessaoAtualizada).toHaveBeenCalledWith(
      7,
      12,
      'ENCONTRO_SOCIAL_ATUALIZADO',
    );
  });

  it('deve emitir evento ao atualizar escalada de dados', async () => {
    const dto = { ativaNesteCombate: true, rodadaInicio: 1 };
    sessaoServiceMock.atualizarEscaladaDadosSessao.mockResolvedValue({});

    await controller.atualizarEscaladaDadosSessao(
      7,
      12,
      { user: { id: 3 } },
      dto,
    );

    expect(sessaoServiceMock.atualizarEscaladaDadosSessao).toHaveBeenCalledWith(
      7,
      12,
      3,
      dto,
    );
    expect(sessaoGatewayMock.emitirSessaoAtualizada).toHaveBeenCalledWith(
      7,
      12,
      'ESCALADA_DADOS_ATUALIZADA',
    );
  });
});
