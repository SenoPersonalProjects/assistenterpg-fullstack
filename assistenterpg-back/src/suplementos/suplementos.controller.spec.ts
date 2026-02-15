import { Test, TestingModule } from '@nestjs/testing';
import { SuplementosController } from './suplementos.controller';

describe('SuplementosController', () => {
  let controller: SuplementosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuplementosController],
    }).useMocker(() => ({})).compile();

    controller = module.get<SuplementosController>(SuplementosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
