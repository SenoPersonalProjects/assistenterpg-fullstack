import { Test, TestingModule } from '@nestjs/testing';
import { SessaoController } from './sessao.controller';
import { SessaoService } from './sessao.service';
import { SessaoGateway } from './sessao.gateway';

describe('SessaoController', () => {
  let controller: SessaoController;

  const sessaoServiceMock = {
    listarSessoesCampanha: jest.fn(),
    criarSessaoCampanha: jest.fn(),
    buscarDetalheSessao: jest.fn(),
    listarChatSessao: jest.fn(),
    enviarMensagemChatSessao: jest.fn(),
    avancarTurnoSessao: jest.fn(),
    encerrarSessaoCampanha: jest.fn(),
    atualizarCenaSessao: jest.fn(),
    adicionarNpcSessao: jest.fn(),
    atualizarNpcSessao: jest.fn(),
    removerNpcSessao: jest.fn(),
  };

  const sessaoGatewayMock = {
    emitirSessaoAtualizada: jest.fn(),
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
      ],
    }).compile();

    controller = module.get<SessaoController>(SessaoController);
  });

  it('deve encaminhar criacao de sessao para o service', async () => {
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

  it('deve encaminhar encerramento de sessao para o service', async () => {
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
      'ola',
    );
    expect(sessaoGatewayMock.emitirSessaoAtualizada).toHaveBeenCalledWith(
      7,
      12,
      'CHAT_NOVA',
    );
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
});
