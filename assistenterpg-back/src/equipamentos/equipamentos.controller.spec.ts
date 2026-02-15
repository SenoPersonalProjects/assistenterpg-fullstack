import { Test, TestingModule } from '@nestjs/testing';
import { EquipamentosController } from './equipamentos.controller';

describe('EquipamentosController', () => {
  let controller: EquipamentosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EquipamentosController],
    }).useMocker(() => ({})).compile();

    controller = module.get<EquipamentosController>(EquipamentosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
