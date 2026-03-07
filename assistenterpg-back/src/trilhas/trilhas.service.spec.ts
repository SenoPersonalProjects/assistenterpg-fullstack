import { Test, TestingModule } from '@nestjs/testing';
import { TrilhasService } from './trilhas.service';

describe('TrilhasService', () => {
  let service: TrilhasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrilhasService],
    })
      .useMocker(() => ({}))
      .compile();

    service = module.get<TrilhasService>(TrilhasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
