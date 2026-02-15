import { Test, TestingModule } from '@nestjs/testing';
import { PersonagemBaseController } from './personagem-base.controller';

describe('PersonagemBaseController', () => {
  let controller: PersonagemBaseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonagemBaseController],
    }).useMocker(() => ({})).compile();

    controller = module.get<PersonagemBaseController>(PersonagemBaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
