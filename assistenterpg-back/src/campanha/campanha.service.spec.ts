import { Test, TestingModule } from '@nestjs/testing';
import { CampanhaService } from './campanha.service';

describe('CampanhaService', () => {
  let service: CampanhaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CampanhaService],
    }).useMocker(() => ({})).compile();

    service = module.get<CampanhaService>(CampanhaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
