import { Test, TestingModule } from '@nestjs/testing';
import { CompendioController } from './compendio.controller';

describe('CompendioController', () => {
  let controller: CompendioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompendioController],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<CompendioController>(CompendioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
