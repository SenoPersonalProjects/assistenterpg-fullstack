import { Test, TestingModule } from '@nestjs/testing';
import { TecnicasAmaldicoadasController } from './tecnicas-amaldicoadas.controller';
import { GUARDS_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JsonImportGuide } from '../common/json-import/json-import-guide.types';
import { TecnicasAmaldicoadasService } from './tecnicas-amaldicoadas.service';

describe('TecnicasAmaldicoadasController', () => {
  let controller: TecnicasAmaldicoadasController;
  let service: jest.Mocked<
    Pick<TecnicasAmaldicoadasService, 'getGuiaImportacaoJson'>
  >;

  const guia = {
    schema: 'tecnicas-amaldicoadas.import.v1',
    schemaVersion: 1,
    descricao: 'Guia de técnicas',
    regras: [],
    exportTypes: ['tecnicas'],
    campos: [],
    exemplos: { minimo: {}, completo: {} },
    referencias: [],
  } satisfies JsonImportGuide;

  beforeEach(async () => {
    service = {
      getGuiaImportacaoJson: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TecnicasAmaldicoadasController],
      providers: [
        {
          provide: TecnicasAmaldicoadasService,
          useValue: service,
        },
      ],
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

  it('exposes the JSON import guide route before dynamic id routes', async () => {
    service.getGuiaImportacaoJson.mockResolvedValue(guia);

    await expect(controller.getGuiaImportacaoJson()).resolves.toBe(guia);

    const routeHandler = Reflect.get(
      controller,
      'getGuiaImportacaoJson',
    ) as unknown;
    expect(Reflect.getMetadata(PATH_METADATA, routeHandler)).toBe(
      'importar-json/guia',
    );
    expect(service.getGuiaImportacaoJson).toHaveBeenCalledWith();
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
      'getGuiaImportacaoJson',
      'exportarJson',
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
      'importarJson',
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
