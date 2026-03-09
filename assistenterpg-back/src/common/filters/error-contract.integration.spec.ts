import {
  Body,
  Controller,
  HttpCode,
  Get,
  HttpStatus,
  INestApplication,
  ParseIntPipe,
  Patch,
  Post,
  Param,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IsString, MinLength } from 'class-validator';
import request from 'supertest';
import { App } from 'supertest/types';
import { BaseException } from '../exceptions/base.exception';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { HttpExceptionFilter } from './http-exception.filter';
import { AdicionarItemDto } from '../../inventario/dto/adicionar-item.dto';
import { AplicarModificacaoDto } from '../../inventario/dto/aplicar-modificacao.dto';
import { AtualizarItemDto } from '../../inventario/dto/atualizar-item.dto';
import { RemoverModificacaoDto } from '../../inventario/dto/remover-modificacao.dto';
import { FiltrarEquipamentosDto } from '../../equipamentos/dto/filtrar-equipamentos.dto';
import { CriarEquipamentoDto } from '../../equipamentos/dto/criar-equipamento.dto';
import { FiltrarSuplementosDto } from '../../suplementos/dto/filtrar-suplementos.dto';
import { CreateSuplementoDto } from '../../suplementos/dto/create-suplemento.dto';
import { FiltrarHomebrewsDto } from '../../homebrews/dto/filtrar-homebrews.dto';
import { CreateHomebrewDto } from '../../homebrews/dto/create-homebrew.dto';

class CriarCampanhaTesteDto {
  @IsString()
  @MinLength(3)
  nome!: string;
}

@Controller('campanhas')
class CampanhasErroTesteController {
  @Post()
  criar(@Body() body: CriarCampanhaTesteDto) {
    return { ok: true, nome: body.nome };
  }

  @Get(':id')
  buscar(@Param('id') id: string) {
    throw new BaseException(
      'Campanha nao encontrada',
      HttpStatus.NOT_FOUND,
      'CAMPANHA_NOT_FOUND',
      { campanhaId: Number(id) },
      'campanhaId',
    );
  }
}

@Controller('personagens-base')
class PersonagensErroTesteController {
  @Get('negado')
  negado() {
    throw new BaseException(
      'Acesso negado ao personagem',
      HttpStatus.UNPROCESSABLE_ENTITY,
      'PERSONAGEM_BASE_ACESSO_NEGADO',
      { personagemId: 10 },
      'personagemId',
    );
  }
}

@Controller('inventario')
class InventarioErroTesteController {
  @Post('validar')
  @HttpCode(HttpStatus.UNPROCESSABLE_ENTITY)
  validarEspaco() {
    throw new BaseException(
      'Espaco insuficiente no inventario',
      HttpStatus.UNPROCESSABLE_ENTITY,
      'INVENTARIO_ESPACOS_INSUFICIENTES',
      { espacosDisponiveis: 0, espacosNecessarios: 2 },
      'espacosDisponiveis',
    );
  }

  @Get('quebra')
  quebra() {
    throw new Error('erro inesperado de inventario');
  }

  @Post('adicionar')
  adicionarItem(@Body() body: AdicionarItemDto) {
    return { ok: true, body };
  }

  @Post('aplicar-modificacao')
  aplicarModificacao(@Body() body: AplicarModificacaoDto) {
    return { ok: true, body };
  }

  @Post('remover-modificacao')
  removerModificacao(@Body() body: RemoverModificacaoDto) {
    return { ok: true, body };
  }

  @Get('personagem/:personagemBaseId')
  buscarInventario(
    @Param('personagemBaseId', ParseIntPipe) personagemBaseId: number,
  ) {
    return { ok: true, personagemBaseId };
  }

  @Patch('item/:itemId')
  atualizarItem(
    @Param('itemId') itemId: string,
    @Body() body: AtualizarItemDto,
  ) {
    return { ok: true, itemId: Number(itemId), body };
  }
}

@Controller('equipamentos')
class EquipamentosErroTesteController {
  @Get()
  listar(@Query() filtros: FiltrarEquipamentosDto) {
    return { ok: true, filtros };
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return { ok: true, id };
  }

  @Post()
  criar(@Body() body: CriarEquipamentoDto) {
    return { ok: true, body };
  }
}

@Controller('suplementos')
class SuplementosErroTesteController {
  @Get()
  listar(@Query() filtros: FiltrarSuplementosDto) {
    return { ok: true, filtros };
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return { ok: true, id };
  }

  @Post()
  criar(@Body() body: CreateSuplementoDto) {
    return { ok: true, body };
  }
}

@Controller('homebrews')
class HomebrewsErroTesteController {
  @Get()
  listar(@Query() filtros: FiltrarHomebrewsDto) {
    return { ok: true, filtros };
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return { ok: true, id };
  }

  @Post()
  criar(@Body() body: CreateHomebrewDto) {
    return { ok: true, body };
  }
}

describe('ErrorContract (integration)', () => {
  let app: INestApplication<App>;

  function asBody(value: unknown): Record<string, unknown> {
    return value as Record<string, unknown>;
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [
        CampanhasErroTesteController,
        PersonagensErroTesteController,
        InventarioErroTesteController,
        EquipamentosErroTesteController,
        SuplementosErroTesteController,
        HomebrewsErroTesteController,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return VALIDATION_ERROR and preserve x-request-id', async () => {
    const customTrace = 'trace-integration-001';

    const response = await request(app.getHttpServer())
      .post('/campanhas')
      .set('x-request-id', customTrace)
      .send({})
      .expect(HttpStatus.BAD_REQUEST);

    const body = asBody(response.body);

    expect(response.headers['x-request-id']).toBe(customTrace);
    expect(body.traceId).toBe(customTrace);
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toBe('Bad Request');
    expect(Array.isArray(body.message)).toBe(true);
    expect(asBody(body.details)).toHaveProperty('validationErrors');
  });

  it('should return BaseException domain payload', async () => {
    const response = await request(app.getHttpServer())
      .get('/personagens-base/negado')
      .expect(HttpStatus.UNPROCESSABLE_ENTITY);

    const body = asBody(response.body);

    expect(body.code).toBe('PERSONAGEM_BASE_ACESSO_NEGADO');
    expect(body.error).toBe('Unprocessable Entity');
    expect(body.message).toBe('Acesso negado ao personagem');
    expect(body.field).toBe('personagemId');
    expect(body.details).toEqual({ personagemId: 10 });
  });

  it('should return 404 domain payload for campanhas', async () => {
    const response = await request(app.getHttpServer())
      .get('/campanhas/404')
      .expect(HttpStatus.NOT_FOUND);

    const body = asBody(response.body);

    expect(body.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(body.code).toBe('CAMPANHA_NOT_FOUND');
    expect(body.error).toBe('Not Found');
    expect(body.message).toBe('Campanha nao encontrada');
    expect(body.field).toBe('campanhaId');
    expect(body.details).toEqual({ campanhaId: 404 });
    expect(body.path).toBe('/campanhas/404');
    expect(body.method).toBe('GET');
  });

  it('should return 422 domain payload for inventario validations', async () => {
    const response = await request(app.getHttpServer())
      .post('/inventario/validar')
      .expect(HttpStatus.UNPROCESSABLE_ENTITY);

    const body = asBody(response.body);

    expect(body.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body.code).toBe('INVENTARIO_ESPACOS_INSUFICIENTES');
    expect(body.error).toBe('Unprocessable Entity');
    expect(body.message).toBe('Espaco insuficiente no inventario');
    expect(body.field).toBe('espacosDisponiveis');
    expect(body.details).toEqual({
      espacosDisponiveis: 0,
      espacosNecessarios: 2,
    });
    expect(body.path).toBe('/inventario/validar');
    expect(body.method).toBe('POST');
  });

  it('should generate and echo x-request-id when header is missing', async () => {
    const response = await request(app.getHttpServer())
      .get('/campanhas/999')
      .expect(HttpStatus.NOT_FOUND);

    const body = asBody(response.body);
    const responseTrace = response.headers['x-request-id'];

    expect(typeof responseTrace).toBe('string');
    if (typeof responseTrace !== 'string') {
      throw new Error('x-request-id ausente no response');
    }
    expect(responseTrace.length).toBeGreaterThan(10);
    expect(body.traceId).toBe(responseTrace);
    expect(body.code).toBe('CAMPANHA_NOT_FOUND');
  });

  it('should return INTERNAL_ERROR for unexpected exceptions', async () => {
    const response = await request(app.getHttpServer())
      .get('/inventario/quebra')
      .expect(HttpStatus.INTERNAL_SERVER_ERROR);

    const body = asBody(response.body);

    expect(body.code).toBe('INTERNAL_ERROR');
    expect(body.error).toBe('Internal Server Error');
    expect(body.message).toBe('Erro interno no servidor');
    expect(typeof body.traceId).toBe('string');
  });

  it('should return VALIDATION_ERROR with field for invalid inventario patch payload', async () => {
    const response = await request(app.getHttpServer())
      .patch('/inventario/item/10')
      .send({ quantidade: '3abc' })
      .expect(HttpStatus.BAD_REQUEST);

    const body = asBody(response.body);
    const details = asBody(body.details);
    const validationErrors = details.validationErrors;

    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toBe('Bad Request');
    expect(body.field).toBe('quantidade');
    expect(Array.isArray(validationErrors)).toBe(true);
    if (!Array.isArray(validationErrors)) {
      throw new Error('validationErrors deve ser array');
    }
    expect(
      validationErrors.some((msg) => String(msg).includes('quantidade')),
    ).toBe(true);
    expect(body.path).toBe('/inventario/item/10');
    expect(body.method).toBe('PATCH');
  });

  it('should return VALIDATION_ERROR with field for invalid inventario add boolean payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/inventario/adicionar')
      .send({
        personagemBaseId: 1,
        equipamentoId: 2,
        equipado: 'talvez',
      })
      .expect(HttpStatus.BAD_REQUEST);

    const body = asBody(response.body);
    const details = asBody(body.details);
    const validationErrors = details.validationErrors;

    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toBe('Bad Request');
    expect(body.field).toBe('equipado');
    expect(Array.isArray(validationErrors)).toBe(true);
    if (!Array.isArray(validationErrors)) {
      throw new Error('validationErrors deve ser array');
    }
    expect(
      validationErrors.some((msg) => String(msg).includes('equipado')),
    ).toBe(true);
    expect(body.path).toBe('/inventario/adicionar');
    expect(body.method).toBe('POST');
  });

  it('should return VALIDATION_ERROR with field for invalid inventario add quantidade payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/inventario/adicionar')
      .send({
        personagemBaseId: 1,
        equipamentoId: 2,
        quantidade: '2abc',
      })
      .expect(HttpStatus.BAD_REQUEST);

    const body = asBody(response.body);
    const details = asBody(body.details);
    const validationErrors = details.validationErrors;

    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toBe('Bad Request');
    expect(body.field).toBe('quantidade');
    expect(Array.isArray(validationErrors)).toBe(true);
    if (!Array.isArray(validationErrors)) {
      throw new Error('validationErrors deve ser array');
    }
    expect(
      validationErrors.some((msg) => String(msg).includes('quantidade')),
    ).toBe(true);
    expect(body.path).toBe('/inventario/adicionar');
    expect(body.method).toBe('POST');
  });

  it('should return VALIDATION_ERROR with field for invalid inventario aplicar-modificacao payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/inventario/aplicar-modificacao')
      .send({
        itemId: 'item-invalido',
        modificacaoId: 2,
      })
      .expect(HttpStatus.BAD_REQUEST);

    const body = asBody(response.body);
    const details = asBody(body.details);
    const validationErrors = details.validationErrors;

    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toBe('Bad Request');
    expect(body.field).toBe('itemId');
    expect(Array.isArray(validationErrors)).toBe(true);
    if (!Array.isArray(validationErrors)) {
      throw new Error('validationErrors deve ser array');
    }
    expect(validationErrors.some((msg) => String(msg).includes('itemId'))).toBe(
      true,
    );
    expect(body.path).toBe('/inventario/aplicar-modificacao');
    expect(body.method).toBe('POST');
  });

  it('should return VALIDATION_ERROR with field for invalid inventario remover-modificacao payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/inventario/remover-modificacao')
      .send({
        itemId: 1,
        modificacaoId: 'mod-invalida',
      })
      .expect(HttpStatus.BAD_REQUEST);

    const body = asBody(response.body);
    const details = asBody(body.details);
    const validationErrors = details.validationErrors;

    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toBe('Bad Request');
    expect(body.field).toBe('modificacaoId');
    expect(Array.isArray(validationErrors)).toBe(true);
    if (!Array.isArray(validationErrors)) {
      throw new Error('validationErrors deve ser array');
    }
    expect(
      validationErrors.some((msg) => String(msg).includes('modificacaoId')),
    ).toBe(true);
    expect(body.path).toBe('/inventario/remover-modificacao');
    expect(body.method).toBe('POST');
  });

  it('should return VALIDATION_ERROR for invalid inventario personagem id param', async () => {
    const response = await request(app.getHttpServer())
      .get('/inventario/personagem/abc')
      .expect(HttpStatus.BAD_REQUEST);

    const body = asBody(response.body);
    const details = asBody(body.details);
    const validationErrors = details.validationErrors;

    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toBe('Bad Request');
    expect(body.field).toBeUndefined();
    expect(Array.isArray(validationErrors)).toBe(true);
    if (!Array.isArray(validationErrors)) {
      throw new Error('validationErrors deve ser array');
    }
    expect(
      validationErrors.some((msg) =>
        String(msg).includes('numeric string is expected'),
      ),
    ).toBe(true);
    expect(body.path).toBe('/inventario/personagem/abc');
    expect(body.method).toBe('GET');
  });

  it('should return VALIDATION_ERROR with field for invalid equipamentos query boolean', async () => {
    const response = await request(app.getHttpServer())
      .get('/equipamentos?apenasAmaldicoados=talvez')
      .expect(HttpStatus.BAD_REQUEST);

    const body = asBody(response.body);
    const details = asBody(body.details);
    const validationErrors = details.validationErrors;

    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toBe('Bad Request');
    expect(body.field).toBe('apenasAmaldicoados');
    expect(Array.isArray(validationErrors)).toBe(true);
    if (!Array.isArray(validationErrors)) {
      throw new Error('validationErrors deve ser array');
    }
    expect(
      validationErrors.some((msg) =>
        String(msg).includes('apenasAmaldicoados'),
      ),
    ).toBe(true);
    expect(body.path).toBe('/equipamentos?apenasAmaldicoados=talvez');
    expect(body.method).toBe('GET');
  });

  it('should return VALIDATION_ERROR with field for invalid equipamentos create payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/equipamentos')
      .send({
        codigo: 'EQP_TESTE',
        nome: 'Equipamento Teste',
        tipo: 'ARMA',
        suplementoId: 'abc',
      })
      .expect(HttpStatus.BAD_REQUEST);

    const body = asBody(response.body);
    const details = asBody(body.details);
    const validationErrors = details.validationErrors;

    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toBe('Bad Request');
    expect(body.field).toBe('suplementoId');
    expect(Array.isArray(validationErrors)).toBe(true);
    if (!Array.isArray(validationErrors)) {
      throw new Error('validationErrors deve ser array');
    }
    expect(
      validationErrors.some((msg) => String(msg).includes('suplementoId')),
    ).toBe(true);
    expect(body.path).toBe('/equipamentos');
    expect(body.method).toBe('POST');
  });

  it('should return VALIDATION_ERROR for invalid equipamentos id param', async () => {
    const response = await request(app.getHttpServer())
      .get('/equipamentos/abc')
      .expect(HttpStatus.BAD_REQUEST);

    const body = asBody(response.body);
    const details = asBody(body.details);
    const validationErrors = details.validationErrors;

    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toBe('Bad Request');
    expect(body.field).toBeUndefined();
    expect(Array.isArray(validationErrors)).toBe(true);
    if (!Array.isArray(validationErrors)) {
      throw new Error('validationErrors deve ser array');
    }
    expect(
      validationErrors.some((msg) =>
        String(msg).includes('numeric string is expected'),
      ),
    ).toBe(true);
    expect(body.path).toBe('/equipamentos/abc');
    expect(body.method).toBe('GET');
  });

  it('should return VALIDATION_ERROR with field for invalid suplementos query boolean', async () => {
    const response = await request(app.getHttpServer())
      .get('/suplementos?apenasAtivos=talvez')
      .expect(HttpStatus.BAD_REQUEST);

    const body = asBody(response.body);
    const details = asBody(body.details);
    const validationErrors = details.validationErrors;

    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toBe('Bad Request');
    expect(body.field).toBe('apenasAtivos');
    expect(Array.isArray(validationErrors)).toBe(true);
    if (!Array.isArray(validationErrors)) {
      throw new Error('validationErrors deve ser array');
    }
    expect(
      validationErrors.some((msg) => String(msg).includes('apenasAtivos')),
    ).toBe(true);
    expect(body.path).toBe('/suplementos?apenasAtivos=talvez');
    expect(body.method).toBe('GET');
  });

  it('should return VALIDATION_ERROR with field for invalid suplementos create payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/suplementos')
      .send({
        codigo: 'SUP_TESTE',
        nome: 'Suplemento Teste',
        icone: 'nao-e-url',
      })
      .expect(HttpStatus.BAD_REQUEST);

    const body = asBody(response.body);
    const details = asBody(body.details);
    const validationErrors = details.validationErrors;

    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toBe('Bad Request');
    expect(body.field).toBe('icone');
    expect(Array.isArray(validationErrors)).toBe(true);
    if (!Array.isArray(validationErrors)) {
      throw new Error('validationErrors deve ser array');
    }
    expect(validationErrors.some((msg) => String(msg).includes('icone'))).toBe(
      true,
    );
    expect(body.path).toBe('/suplementos');
    expect(body.method).toBe('POST');
  });

  it('should return VALIDATION_ERROR for invalid suplementos id param', async () => {
    const response = await request(app.getHttpServer())
      .get('/suplementos/abc')
      .expect(HttpStatus.BAD_REQUEST);

    const body = asBody(response.body);
    const details = asBody(body.details);
    const validationErrors = details.validationErrors;

    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toBe('Bad Request');
    expect(body.field).toBeUndefined();
    expect(Array.isArray(validationErrors)).toBe(true);
    if (!Array.isArray(validationErrors)) {
      throw new Error('validationErrors deve ser array');
    }
    expect(
      validationErrors.some((msg) =>
        String(msg).includes('numeric string is expected'),
      ),
    ).toBe(true);
    expect(body.path).toBe('/suplementos/abc');
    expect(body.method).toBe('GET');
  });

  it('should return VALIDATION_ERROR with field for invalid homebrews query page', async () => {
    const response = await request(app.getHttpServer())
      .get('/homebrews?pagina=0')
      .expect(HttpStatus.BAD_REQUEST);

    const body = asBody(response.body);
    const details = asBody(body.details);
    const validationErrors = details.validationErrors;

    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toBe('Bad Request');
    expect(body.field).toBe('pagina');
    expect(Array.isArray(validationErrors)).toBe(true);
    if (!Array.isArray(validationErrors)) {
      throw new Error('validationErrors deve ser array');
    }
    expect(validationErrors.some((msg) => String(msg).includes('pagina'))).toBe(
      true,
    );
    expect(body.path).toBe('/homebrews?pagina=0');
    expect(body.method).toBe('GET');
  });

  it('should return VALIDATION_ERROR with field for invalid homebrews create payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/homebrews')
      .send({
        nome: 'Homebrew Teste',
        tipo: 'TIPO_INVALIDO',
        dados: {},
      })
      .expect(HttpStatus.BAD_REQUEST);

    const body = asBody(response.body);
    const details = asBody(body.details);
    const validationErrors = details.validationErrors;

    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toBe('Bad Request');
    expect(body.field).toBe('tipo');
    expect(Array.isArray(validationErrors)).toBe(true);
    if (!Array.isArray(validationErrors)) {
      throw new Error('validationErrors deve ser array');
    }
    expect(validationErrors.some((msg) => String(msg).includes('tipo'))).toBe(
      true,
    );
    expect(body.path).toBe('/homebrews');
    expect(body.method).toBe('POST');
  });

  it('should return VALIDATION_ERROR for invalid homebrews id param', async () => {
    const response = await request(app.getHttpServer())
      .get('/homebrews/abc')
      .expect(HttpStatus.BAD_REQUEST);

    const body = asBody(response.body);
    const details = asBody(body.details);
    const validationErrors = details.validationErrors;

    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toBe('Bad Request');
    expect(body.field).toBeUndefined();
    expect(Array.isArray(validationErrors)).toBe(true);
    if (!Array.isArray(validationErrors)) {
      throw new Error('validationErrors deve ser array');
    }
    expect(
      validationErrors.some((msg) =>
        String(msg).includes('numeric string is expected'),
      ),
    ).toBe(true);
    expect(body.path).toBe('/homebrews/abc');
    expect(body.method).toBe('GET');
  });
});
