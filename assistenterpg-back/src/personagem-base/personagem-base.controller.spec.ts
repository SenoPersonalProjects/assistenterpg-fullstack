import { Test, TestingModule } from '@nestjs/testing';
import { PATH_METADATA } from '@nestjs/common/constants';
import { JsonImportGuide } from '../common/json-import/json-import-guide.types';
import { PersonagemBaseController } from './personagem-base.controller';
import { PersonagemBaseService } from './personagem-base.service';

describe('PersonagemBaseController', () => {
  let controller: PersonagemBaseController;
  let service: jest.Mocked<
    Pick<PersonagemBaseService, 'getGuiaImportacaoJson'>
  >;

  const guia = {
    schema: 'assistenterpg.personagem-base',
    schemaVersion: 1,
    descricao: 'Guia de personagem-base',
    regras: [],
    exportTypes: ['personagem-base'],
    campos: [],
    exemplos: { minimo: {}, completo: {} },
    referencias: [],
  } satisfies JsonImportGuide;

  beforeEach(async () => {
    service = {
      getGuiaImportacaoJson: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonagemBaseController],
      providers: [
        {
          provide: PersonagemBaseService,
          useValue: service,
        },
      ],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<PersonagemBaseController>(PersonagemBaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('exposes the JSON import guide route before dynamic id routes', async () => {
    service.getGuiaImportacaoJson.mockResolvedValue(guia);

    await expect(
      controller.getGuiaImportacaoJson({ user: { id: 42 } }),
    ).resolves.toBe(guia);

    const routeHandler = Reflect.get(
      controller,
      'getGuiaImportacaoJson',
    ) as unknown;
    expect(Reflect.getMetadata(PATH_METADATA, routeHandler)).toBe(
      'importar-json/guia',
    );
    expect(service.getGuiaImportacaoJson).toHaveBeenCalledWith(42);
  });
});
