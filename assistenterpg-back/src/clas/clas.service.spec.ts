import { Test, TestingModule } from '@nestjs/testing';
import { ClasService } from './clas.service';

describe('ClasService', () => {
  let service: ClasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClasService],
    })
      .useMocker(() => ({}))
      .compile();

    service = module.get<ClasService>(ClasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
