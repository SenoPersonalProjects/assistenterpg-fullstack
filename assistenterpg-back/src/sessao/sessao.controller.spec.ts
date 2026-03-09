import { Test, TestingModule } from '@nestjs/testing';
import { SessaoController } from './sessao.controller';
import { SessaoService } from './sessao.service';

describe('SessaoController', () => {
  let controller: SessaoController;

  const sessaoServiceMock = {
    listarSessoesCampanha: jest.fn(),
    criarSessaoCampanha: jest.fn(),
    buscarDetalheSessao: jest.fn(),
    listarChatSessao: jest.fn(),
    enviarMensagemChatSessao: jest.fn(),
    avancarTurnoSessao: jest.fn(),
    atualizarCenaSessao: jest.fn(),
    adicionarNpcSessao: jest.fn(),
    atualizarNpcSessao: jest.fn(),
    removerNpcSessao: jest.fn(),
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
});
