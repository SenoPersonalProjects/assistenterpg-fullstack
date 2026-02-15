import { Test, TestingModule } from '@nestjs/testing';
import { ModificacoesService } from './modificacoes.service';

describe('ModificacoesService', () => {
  let service: ModificacoesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModificacoesService],
    }).useMocker(() => ({})).compile();

    service = module.get<ModificacoesService>(ModificacoesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
