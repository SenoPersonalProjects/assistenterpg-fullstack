import { Test, TestingModule } from '@nestjs/testing';
import { HabilidadesService } from './habilidades.service';

describe('HabilidadesService', () => {
  let service: HabilidadesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HabilidadesService],
    })
      .useMocker(() => ({}))
      .compile();

    service = module.get<HabilidadesService>(HabilidadesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
