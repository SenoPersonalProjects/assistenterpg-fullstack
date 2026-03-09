import { Test, TestingModule } from '@nestjs/testing';

import { CampanhaController } from './campanha.controller';
import { CampanhaService } from './campanha.service';

describe('CampanhaController', () => {
  let controller: CampanhaController;

  const campanhaServiceMock = {
    criarCampanha: jest.fn(),
    listarMinhasCampanhas: jest.fn(),
    buscarPorIdParaUsuario: jest.fn(),
    excluirCampanha: jest.fn(),
    listarMembros: jest.fn(),
    adicionarMembro: jest.fn(),
    listarPersonagensCampanha: jest.fn(),
    vincularPersonagemBase: jest.fn(),
    atualizarRecursosPersonagemCampanha: jest.fn(),
    listarModificadoresPersonagemCampanha: jest.fn(),
    aplicarModificadorPersonagemCampanha: jest.fn(),
    desfazerModificadorPersonagemCampanha: jest.fn(),
    listarHistoricoPersonagemCampanha: jest.fn(),
    criarConvitePorEmail: jest.fn(),
    listarConvitesPendentesPorUsuario: jest.fn(),
    aceitarConvite: jest.fn(),
    recusarConvite: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampanhaController],
      providers: [
        {
          provide: CampanhaService,
          useValue: campanhaServiceMock,
        },
      ],
    }).compile();

    controller = module.get<CampanhaController>(CampanhaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('deve encaminhar criacao de convite para o service', async () => {
    campanhaServiceMock.criarConvitePorEmail.mockResolvedValue({ id: 1 });

    const req = { user: { id: 33 } };
    const dto = { email: 'jogador@teste.com', papel: 'JOGADOR' as const };

    await controller.criarConvite(9, req, dto);

    expect(campanhaServiceMock.criarConvitePorEmail).toHaveBeenCalledWith(
      9,
      33,
      'jogador@teste.com',
      'JOGADOR',
    );
  });

  it('deve encaminhar listagem de convites pendentes para o service', async () => {
    campanhaServiceMock.listarConvitesPendentesPorUsuario.mockResolvedValue([]);

    await controller.listarConvitesPendentes({ user: { id: 77 } });

    expect(
      campanhaServiceMock.listarConvitesPendentesPorUsuario,
    ).toHaveBeenCalledWith(77);
  });

  it('deve encaminhar aceite de convite para o service', async () => {
    campanhaServiceMock.aceitarConvite.mockResolvedValue({ id: 5 });

    await controller.aceitarConvite('ABC123', { user: { id: 12 } });

    expect(campanhaServiceMock.aceitarConvite).toHaveBeenCalledWith(
      'ABC123',
      12,
    );
  });

  it('deve encaminhar recusa de convite para o service', async () => {
    campanhaServiceMock.recusarConvite.mockResolvedValue({ id: 5 });

    await controller.recusarConvite('ABC123', { user: { id: 12 } });

    expect(campanhaServiceMock.recusarConvite).toHaveBeenCalledWith(
      'ABC123',
      12,
    );
  });

  it('deve encaminhar vinculo de personagem-base para o service', async () => {
    campanhaServiceMock.vincularPersonagemBase.mockResolvedValue({ id: 88 });

    await controller.vincularPersonagemCampanha(
      7,
      { user: { id: 3 } },
      { personagemBaseId: 42 },
    );

    expect(campanhaServiceMock.vincularPersonagemBase).toHaveBeenCalledWith(
      7,
      3,
      42,
    );
  });

  it('deve encaminhar aplicacao de modificador para o service', async () => {
    campanhaServiceMock.aplicarModificadorPersonagemCampanha.mockResolvedValue({
      modificador: { id: 1 },
    });

    await controller.aplicarModificadorPersonagemCampanha(
      2,
      9,
      { user: { id: 10 } },
      { campo: 'EA_MAX', valor: -20, nome: 'Maldicao', descricao: 'Teste' },
    );

    expect(
      campanhaServiceMock.aplicarModificadorPersonagemCampanha,
    ).toHaveBeenCalledWith(2, 9, 10, {
      campo: 'EA_MAX',
      valor: -20,
      nome: 'Maldicao',
      descricao: 'Teste',
    });
  });
});
