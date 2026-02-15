import { Test, TestingModule } from '@nestjs/testing';
import { TiposGrauService } from './tipos-grau.service';

describe('TiposGrauService', () => {
  let service: TiposGrauService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TiposGrauService],
    }).useMocker(() => ({})).compile();

    service = module.get<TiposGrauService>(TiposGrauService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
