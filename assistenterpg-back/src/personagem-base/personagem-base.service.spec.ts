import { Test, TestingModule } from '@nestjs/testing';
import { PersonagemBaseService } from './personagem-base.service';

describe('PersonagemBaseService', () => {
  let service: PersonagemBaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersonagemBaseService],
    }).useMocker(() => ({})).compile();

    service = module.get<PersonagemBaseService>(PersonagemBaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
