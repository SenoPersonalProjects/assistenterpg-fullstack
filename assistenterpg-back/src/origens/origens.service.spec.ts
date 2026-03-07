import { Test, TestingModule } from '@nestjs/testing';
import { OrigensService } from './origens.service';

describe('OrigensService', () => {
  let service: OrigensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrigensService],
    })
      .useMocker(() => ({}))
      .compile();

    service = module.get<OrigensService>(OrigensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
