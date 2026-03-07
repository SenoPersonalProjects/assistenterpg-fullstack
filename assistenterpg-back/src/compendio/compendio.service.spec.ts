import { Test, TestingModule } from '@nestjs/testing';
import { CompendioService } from './compendio.service';

describe('CompendioService', () => {
  let service: CompendioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompendioService],
    })
      .useMocker(() => ({}))
      .compile();

    service = module.get<CompendioService>(CompendioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
