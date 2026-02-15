import { Test, TestingModule } from '@nestjs/testing';
import { ClasController } from './clas.controller';

describe('ClasController', () => {
  let controller: ClasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClasController],
    }).useMocker(() => ({})).compile();

    controller = module.get<ClasController>(ClasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
