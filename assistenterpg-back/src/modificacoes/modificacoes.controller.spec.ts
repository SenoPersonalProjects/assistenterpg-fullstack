import { Test, TestingModule } from '@nestjs/testing';
import { ModificacoesController } from './modificacoes.controller';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { AdminGuard } from '../auth/guards/admin.guard';

describe('ModificacoesController', () => {
  let controller: ModificacoesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModificacoesController],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<ModificacoesController>(ModificacoesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should require JWT on read routes', () => {
    const readMethods = [
      'listar',
      'buscarPorId',
      'buscarCompatíveis',
    ] as const;

    for (const methodName of readMethods) {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        controller[methodName],
      );

      expect(guards).toHaveLength(1);
      expect(typeof guards[0]).toBe('function');
    }
  });

  it('should require JWT+Admin on write routes', () => {
    const writeMethods = ['create', 'update', 'remove'] as const;

    for (const methodName of writeMethods) {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        controller[methodName],
      );

      expect(guards).toHaveLength(2);
      expect(typeof guards[0]).toBe('function');
      expect(guards[1]).toBe(AdminGuard);
    }
  });
});
