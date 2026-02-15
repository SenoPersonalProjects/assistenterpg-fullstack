import { Test, TestingModule } from '@nestjs/testing';
import { HomebrewsService } from './homebrews.service';

describe('HomebrewsService', () => {
  let service: HomebrewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HomebrewsService],
    }).useMocker(() => ({})).compile();

    service = module.get<HomebrewsService>(HomebrewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
