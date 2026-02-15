import { Test, TestingModule } from '@nestjs/testing';
import { PericiasController } from './pericias.controller';

describe('PericiasController', () => {
  let controller: PericiasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PericiasController],
    }).useMocker(() => ({})).compile();

    controller = module.get<PericiasController>(PericiasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
