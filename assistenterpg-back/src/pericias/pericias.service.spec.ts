import { Test, TestingModule } from '@nestjs/testing';
import { PericiasService } from './pericias.service';

describe('PericiasService', () => {
  let service: PericiasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PericiasService],
    })
      .useMocker(() => ({}))
      .compile();

    service = module.get<PericiasService>(PericiasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
