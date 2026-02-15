import { Test, TestingModule } from '@nestjs/testing';
import { CondicoesService } from './condicoes.service';

describe('CondicoesService', () => {
  let service: CondicoesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CondicoesService],
    }).useMocker(() => ({})).compile();

    service = module.get<CondicoesService>(CondicoesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
