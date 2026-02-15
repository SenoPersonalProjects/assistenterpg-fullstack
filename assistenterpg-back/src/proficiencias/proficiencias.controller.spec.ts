import { Test, TestingModule } from '@nestjs/testing';
import { ProficienciasController } from './proficiencias.controller';

describe('ProficienciasController', () => {
  let controller: ProficienciasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProficienciasController],
    }).useMocker(() => ({})).compile();

    controller = module.get<ProficienciasController>(ProficienciasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
