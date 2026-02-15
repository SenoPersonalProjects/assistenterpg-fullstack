import { Test, TestingModule } from '@nestjs/testing';
import { TecnicasAmaldicoadasService } from './tecnicas-amaldicoadas.service';

describe('TecnicasAmaldicoadasService', () => {
  let service: TecnicasAmaldicoadasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TecnicasAmaldicoadasService],
    }).useMocker(() => ({})).compile();

    service = module.get<TecnicasAmaldicoadasService>(TecnicasAmaldicoadasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
