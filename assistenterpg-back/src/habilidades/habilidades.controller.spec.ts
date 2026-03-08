import { Test, TestingModule } from '@nestjs/testing';
import { HabilidadesController } from './habilidades.controller';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { AdminGuard } from '../auth/guards/admin.guard';

describe('HabilidadesController', () => {
  let controller: HabilidadesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HabilidadesController],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<HabilidadesController>(HabilidadesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should declare JWT guard at controller level', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      HabilidadesController,
    ) as unknown[] | undefined;

    expect(Array.isArray(guards)).toBe(true);
    expect(guards).toHaveLength(1);
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

      expect(guards).toHaveLength(1);
      expect(guards[0]).toBe(AdminGuard);
    }
  });
});
