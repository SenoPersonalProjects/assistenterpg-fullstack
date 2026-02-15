import { Test, TestingModule } from '@nestjs/testing';
import { TiposGrauController } from './tipos-grau.controller';

describe('TiposGrauController', () => {
  let controller: TiposGrauController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiposGrauController],
    }).useMocker(() => ({})).compile();

    controller = module.get<TiposGrauController>(TiposGrauController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
