import { Test, TestingModule } from '@nestjs/testing';
import { ProficienciasController } from './proficiencias.controller';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { AdminGuard } from '../auth/guards/admin.guard';

describe('ProficienciasController', () => {
  let controller: ProficienciasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProficienciasController],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<ProficienciasController>(ProficienciasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should require JWT on controller level', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      ProficienciasController,
    ) as unknown;

    expect(Array.isArray(guards)).toBe(true);
    if (!Array.isArray(guards)) return;

    expect(guards).toHaveLength(1);
    expect(typeof guards[0]).toBe('function');
  });

  it('should not add extra guards on read routes', () => {
    const readMethods = ['findAll', 'findOne'] as const;

    for (const methodName of readMethods) {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        controller[methodName],
      ) as unknown;

      expect(guards).toBeUndefined();
    }
  });

  it('should require AdminGuard on write routes', () => {
    const writeMethods = ['create', 'update', 'remove'] as const;

    for (const methodName of writeMethods) {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        controller[methodName],
      ) as unknown;

      expect(Array.isArray(guards)).toBe(true);
      if (!Array.isArray(guards)) continue;

      expect(guards).toEqual([AdminGuard]);
    }
  });
});
