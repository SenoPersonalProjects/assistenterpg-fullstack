import { Test, TestingModule } from '@nestjs/testing';
import { ModificacoesController } from './modificacoes.controller';

describe('ModificacoesController', () => {
  let controller: ModificacoesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModificacoesController],
    }).useMocker(() => ({})).compile();

    controller = module.get<ModificacoesController>(ModificacoesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
