import { Test, TestingModule } from '@nestjs/testing';
import { ProficienciasService } from './proficiencias.service';

describe('ProficienciasService', () => {
  let service: ProficienciasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProficienciasService],
    }).useMocker(() => ({})).compile();

    service = module.get<ProficienciasService>(ProficienciasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
