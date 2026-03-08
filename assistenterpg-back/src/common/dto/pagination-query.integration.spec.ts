import {
  Controller,
  Get,
  HttpStatus,
  INestApplication,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AllExceptionsFilter } from '../filters/all-exceptions.filter';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { PaginationQueryDto } from './pagination-query.dto';

@Controller('paginacao')
class PaginacaoTesteController {
  @Get()
  listar(@Query() query: PaginationQueryDto) {
    return {
      page: query.page,
      limit: query.limit,
      pageType: typeof query.page,
      limitType: typeof query.limit,
    };
  }
}

describe('PaginationQueryDto (integration)', () => {
  let app: INestApplication<App>;

  function asBody(value: unknown): Record<string, unknown> {
    return value as Record<string, unknown>;
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PaginacaoTesteController],
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

  it('accepts valid query values and converts them to number', async () => {
    const response = await request(app.getHttpServer())
      .get('/paginacao?page=2&limit=10')
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      page: 2,
      limit: 10,
      pageType: 'number',
      limitType: 'number',
    });
  });

  it('allows empty pagination query', async () => {
    const response = await request(app.getHttpServer())
      .get('/paginacao')
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      pageType: 'undefined',
      limitType: 'undefined',
    });
  });

  it('rejects page below 1 with VALIDATION_ERROR', async () => {
    const response = await request(app.getHttpServer())
      .get('/paginacao?page=0&limit=10')
      .expect(HttpStatus.BAD_REQUEST);

    const body = asBody(response.body);
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(body.message)).toBe(true);
    expect(asBody(body.details)).toHaveProperty('validationErrors');
  });

  it('rejects limit above 100 with VALIDATION_ERROR', async () => {
    const response = await request(app.getHttpServer())
      .get('/paginacao?page=1&limit=101')
      .expect(HttpStatus.BAD_REQUEST);

    const body = asBody(response.body);
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(body.message)).toBe(true);
    expect(asBody(body.details)).toHaveProperty('validationErrors');
  });

  it('rejects non-integer page values', async () => {
    const response = await request(app.getHttpServer())
      .get('/paginacao?page=abc&limit=5')
      .expect(HttpStatus.BAD_REQUEST);

    const body = asBody(response.body);
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(body.message)).toBe(true);
  });
});
