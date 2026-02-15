import { Test, TestingModule } from '@nestjs/testing';
import { CondicoesController } from './condicoes.controller';

describe('CondicoesController', () => {
  let controller: CondicoesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CondicoesController],
    }).useMocker(() => ({})).compile();

    controller = module.get<CondicoesController>(CondicoesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
