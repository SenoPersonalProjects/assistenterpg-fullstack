import { Test, TestingModule } from '@nestjs/testing';
import { SuplementosService } from './suplementos.service';

describe('SuplementosService', () => {
  let service: SuplementosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuplementosService],
    })
      .useMocker(() => ({}))
      .compile();

    service = module.get<SuplementosService>(SuplementosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
