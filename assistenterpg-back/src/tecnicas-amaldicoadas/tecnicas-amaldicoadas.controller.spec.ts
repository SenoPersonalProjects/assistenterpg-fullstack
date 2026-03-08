import { Test, TestingModule } from '@nestjs/testing';
import { TecnicasAmaldicoadasController } from './tecnicas-amaldicoadas.controller';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { AdminGuard } from '../auth/guards/admin.guard';

describe('TecnicasAmaldicoadasController', () => {
  let controller: TecnicasAmaldicoadasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TecnicasAmaldicoadasController],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<TecnicasAmaldicoadasController>(
      TecnicasAmaldicoadasController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should require JWT on controller level', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      TecnicasAmaldicoadasController,
    ) as unknown;

    expect(Array.isArray(guards)).toBe(true);
    if (!Array.isArray(guards)) return;

    expect(guards).toHaveLength(1);
    expect(typeof guards[0]).toBe('function');
  });

  it('should not add extra guards on read routes', () => {
    const readMethods = [
      'findAllTecnicas',
      'findTecnicaByCodigo',
      'findTecnicasByCla',
      'findOneTecnica',
      'findAllHabilidades',
      'findOneHabilidade',
      'findAllVariacoes',
      'findOneVariacao',
    ] as const;

    for (const methodName of readMethods) {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        controller[methodName],
      ) as unknown;

      expect(guards).toBeUndefined();
    }
  });

  it('should require AdminGuard on write routes', () => {
    const writeMethods = [
      'createTecnica',
      'updateTecnica',
      'removeTecnica',
      'createHabilidade',
      'updateHabilidade',
      'removeHabilidade',
      'createVariacao',
      'updateVariacao',
      'removeVariacao',
    ] as const;

    for (const methodName of writeMethods) {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        controller[methodName],
      ) as unknown;

      expect(guards).toEqual([AdminGuard]);
    }
  });
});
