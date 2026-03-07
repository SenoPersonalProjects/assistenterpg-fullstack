import { Test, TestingModule } from '@nestjs/testing';
import { OrigensController } from './origens.controller';

describe('OrigensController', () => {
  let controller: OrigensController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrigensController],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<OrigensController>(OrigensController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
