import {
  Body,
  Controller,
  Get,
  HttpStatus,
  INestApplication,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IsString, MinLength } from 'class-validator';
import request from 'supertest';
import { App } from 'supertest/types';
import { BaseException } from '../exceptions/base.exception';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { HttpExceptionFilter } from './http-exception.filter';

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
  @Get('quebra')
  quebra() {
    throw new Error('erro inesperado de inventario');
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
});
