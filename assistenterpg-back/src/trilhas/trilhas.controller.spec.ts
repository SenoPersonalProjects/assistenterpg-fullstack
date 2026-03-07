import { Test, TestingModule } from '@nestjs/testing';
import { TrilhasController } from './trilhas.controller';

describe('TrilhasController', () => {
  let controller: TrilhasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrilhasController],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<TrilhasController>(TrilhasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
