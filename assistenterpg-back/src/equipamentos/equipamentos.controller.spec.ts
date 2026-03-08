import { Test, TestingModule } from '@nestjs/testing';
import { EquipamentosController } from './equipamentos.controller';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { GUARDS_METADATA } from '@nestjs/common/constants';

describe('EquipamentosController', () => {
  let controller: EquipamentosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EquipamentosController],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<EquipamentosController>(EquipamentosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should require JWT+Admin on write routes', () => {
    const writeMethods = ['criar', 'atualizar', 'deletar'] as const;

    for (const methodName of writeMethods) {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        controller[methodName],
      );

      expect(guards).toEqual([JwtAuthGuard, AdminGuard]);
    }
  });

  it('should keep read routes public', () => {
    const readMethods = ['listar', 'buscarPorId', 'buscarPorCodigo'] as const;

    for (const methodName of readMethods) {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        controller[methodName],
      );

      expect(guards).toBeUndefined();
    }
  });
});
