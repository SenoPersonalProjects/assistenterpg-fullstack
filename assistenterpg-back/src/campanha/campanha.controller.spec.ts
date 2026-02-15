import { Test, TestingModule } from '@nestjs/testing';
import { CampanhaController } from './campanha.controller';

describe('CampanhaController', () => {
  let controller: CampanhaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampanhaController],
    }).useMocker(() => ({})).compile();

    controller = module.get<CampanhaController>(CampanhaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
