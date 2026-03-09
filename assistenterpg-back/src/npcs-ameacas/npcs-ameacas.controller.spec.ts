import { Test, TestingModule } from '@nestjs/testing';
import { NpcsAmeacasController } from './npcs-ameacas.controller';

describe('NpcsAmeacasController', () => {
  let controller: NpcsAmeacasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NpcsAmeacasController],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<NpcsAmeacasController>(NpcsAmeacasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
