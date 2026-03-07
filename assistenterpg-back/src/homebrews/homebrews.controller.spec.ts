import { Test, TestingModule } from '@nestjs/testing';
import { HomebrewsController } from './homebrews.controller';

describe('HomebrewsController', () => {
  let controller: HomebrewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomebrewsController],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<HomebrewsController>(HomebrewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
