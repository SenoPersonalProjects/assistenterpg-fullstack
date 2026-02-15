import { Test, TestingModule } from '@nestjs/testing';
import { AlinhamentosController } from './alinhamentos.controller';

describe('AlinhamentosController', () => {
  let controller: AlinhamentosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlinhamentosController],
    }).useMocker(() => ({})).compile();

    controller = module.get<AlinhamentosController>(AlinhamentosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
