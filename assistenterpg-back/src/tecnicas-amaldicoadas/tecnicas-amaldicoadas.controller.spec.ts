import { Test, TestingModule } from '@nestjs/testing';
import { TecnicasAmaldicoadasController } from './tecnicas-amaldicoadas.controller';

describe('TecnicasAmaldicoadasController', () => {
  let controller: TecnicasAmaldicoadasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TecnicasAmaldicoadasController],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<TecnicasAmaldicoadasController>(
      TecnicasAmaldicoadasController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
