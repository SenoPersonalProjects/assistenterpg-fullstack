import {
  Body,
  Controller,
  Get,
  HttpStatus,
  INestApplication,
  Param,
  ParseIntPipe,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { HttpExceptionFilter } from './http-exception.filter';
import { CreateArtigoDto } from '../../compendio/dto/create-artigo.dto';
import { ConsultarInfoGrausTreinamentoDto } from '../../personagem-base/dto/consultar-graus-treinamento.dto';
import { CreateTrilhaDto } from '../../trilhas/dto/create-trilha.dto';
import { CreateClasseDto } from '../../classes/dto/create-classe.dto';
import { CreateClaDto } from '../../clas/dto/create-cla.dto';
import { CreateOrigemDto } from '../../origens/dto/create-origem.dto';
import { FilterHabilidadeDto } from '../../habilidades/dto/filter-habilidade.dto';
import { CreateHabilidadeDto } from '../../habilidades/dto/create-habilidade.dto';
import { FiltrarModificacoesDto } from '../../modificacoes/dto/filtrar-modificacoes.dto';
import { CreateModificacaoDto } from '../../modificacoes/dto/create-modificacao.dto';
import { CreateProficienciaDto } from '../../proficiencias/dto/create-proficiencia.dto';
import { CreateTipoGrauDto } from '../../tipos-grau/dto/create-tipo-grau.dto';
import { CreateCondicaoDto } from '../../condicoes/dto/create-condicao.dto';

@Controller('compendio')
class CompendioErroContratoController {
  @Get('artigos')
  listarArtigos(
    @Query('subcategoriaId', new ParseIntPipe({ optional: true }))
    subcategoriaId?: number,
  ) {
    return { ok: true, subcategoriaId };
  }

  @Post('artigos')
  criarArtigo(@Body() body: CreateArtigoDto) {
    return { ok: true, body };
  }
}

@Controller('personagens-base')
class PersonagensBaseErroContratoController {
  @Get('tecnicas-disponiveis')
  listarTecnicasDisponiveis(
    @Query('claId', ParseIntPipe) claId: number,
    @Query('origemId', new ParseIntPipe({ optional: true }))
    origemId?: number,
  ) {
    return { ok: true, claId, origemId };
  }

  @Get('graus-treinamento/info')
  consultarInfoGrausTreinamento(
    @Query() query: ConsultarInfoGrausTreinamentoDto,
  ) {
    return { ok: true, query };
  }
}

@Controller('trilhas')
class TrilhasErroContratoController {
  @Get()
  listar(
    @Query('classeId', new ParseIntPipe({ optional: true })) classeId?: number,
  ) {
    return { ok: true, classeId };
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return { ok: true, id };
  }

  @Post()
  criar(@Body() body: CreateTrilhaDto) {
    return { ok: true, body };
  }
}

@Controller('classes')
class ClassesErroContratoController {
  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return { ok: true, id };
  }

  @Post()
  criar(@Body() body: CreateClasseDto) {
    return { ok: true, body };
  }
}

@Controller('clas')
class ClasErroContratoController {
  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return { ok: true, id };
  }

  @Post()
  criar(@Body() body: CreateClaDto) {
    return { ok: true, body };
  }
}

@Controller('origens')
class OrigensErroContratoController {
  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return { ok: true, id };
  }

  @Post()
  criar(@Body() body: CreateOrigemDto) {
    return { ok: true, body };
  }
}

@Controller('habilidades')
class HabilidadesErroContratoController {
  @Get()
  listar(@Query() filtros: FilterHabilidadeDto) {
    return { ok: true, filtros };
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return { ok: true, id };
  }

  @Post()
  criar(@Body() body: CreateHabilidadeDto) {
    return { ok: true, body };
  }
}

@Controller('modificacoes')
class ModificacoesErroContratoController {
  @Get()
  listar(@Query() filtros: FiltrarModificacoesDto) {
    return { ok: true, filtros };
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return { ok: true, id };
  }

  @Post()
  criar(@Body() body: CreateModificacaoDto) {
    return { ok: true, body };
  }
}

@Controller('pericias')
class PericiasErroContratoController {
  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return { ok: true, id };
  }
}

@Controller('proficiencias')
class ProficienciasErroContratoController {
  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return { ok: true, id };
  }

  @Post()
  criar(@Body() body: CreateProficienciaDto) {
    return { ok: true, body };
  }
}

@Controller('tipos-grau')
class TiposGrauErroContratoController {
  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return { ok: true, id };
  }

  @Post()
  criar(@Body() body: CreateTipoGrauDto) {
    return { ok: true, body };
  }
}

@Controller('condicoes')
class CondicoesErroContratoController {
  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return { ok: true, id };
  }

  @Post()
  criar(@Body() body: CreateCondicaoDto) {
    return { ok: true, body };
  }
}

type ValidationExpectation = {
  path: string;
  method: string;
  messageIncludes: string;
  field?: string;
};

function asBody(value: unknown): Record<string, unknown> {
  return value as Record<string, unknown>;
}

function assertValidationErrorContract(
  body: Record<string, unknown>,
  expectation: ValidationExpectation,
) {
  const details = asBody(body.details);
  const validationErrors = details.validationErrors;

  expect(body.code).toBe('VALIDATION_ERROR');
  expect(body.error).toBe('Bad Request');
  if (expectation.field === undefined) {
    expect(body.field).toBeUndefined();
  } else {
    expect(body.field).toBe(expectation.field);
  }
  expect(Array.isArray(validationErrors)).toBe(true);
  if (!Array.isArray(validationErrors)) {
    throw new Error('validationErrors deve ser array');
  }
  expect(
    validationErrors.some((msg) =>
      String(msg).includes(expectation.messageIncludes),
    ),
  ).toBe(true);
  expect(body.path).toBe(expectation.path);
  expect(body.method).toBe(expectation.method);
}

describe('ErrorContractModules (integration)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [
        CompendioErroContratoController,
        PersonagensBaseErroContratoController,
        TrilhasErroContratoController,
        ClassesErroContratoController,
        ClasErroContratoController,
        OrigensErroContratoController,
        HabilidadesErroContratoController,
        ModificacoesErroContratoController,
        PericiasErroContratoController,
        ProficienciasErroContratoController,
        TiposGrauErroContratoController,
        CondicoesErroContratoController,
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

  it('should return VALIDATION_ERROR for invalid compendio query param', async () => {
    const response = await request(app.getHttpServer())
      .get('/compendio/artigos?subcategoriaId=abc')
      .expect(HttpStatus.BAD_REQUEST);

    assertValidationErrorContract(asBody(response.body), {
      path: '/compendio/artigos?subcategoriaId=abc',
      method: 'GET',
      messageIncludes: 'numeric string is expected',
    });
  });

  it('should return VALIDATION_ERROR with field for invalid compendio create payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/compendio/artigos')
      .send({
        codigo: 'ARTIGO_TESTE',
        titulo: 'Artigo Teste',
        conteudo: 'Conteudo teste',
        subcategoriaId: 'abc',
      })
      .expect(HttpStatus.BAD_REQUEST);

    assertValidationErrorContract(asBody(response.body), {
      field: 'subcategoriaId',
      path: '/compendio/artigos',
      method: 'POST',
      messageIncludes: 'subcategoriaId',
    });
  });

  it('should return VALIDATION_ERROR for invalid personagens-base claId query', async () => {
    const response = await request(app.getHttpServer())
      .get('/personagens-base/tecnicas-disponiveis?claId=abc')
      .expect(HttpStatus.BAD_REQUEST);

    assertValidationErrorContract(asBody(response.body), {
      path: '/personagens-base/tecnicas-disponiveis?claId=abc',
      method: 'GET',
      messageIncludes: 'numeric string is expected',
    });
  });

  it('should return VALIDATION_ERROR for invalid personagens-base origemId query', async () => {
    const response = await request(app.getHttpServer())
      .get('/personagens-base/tecnicas-disponiveis?claId=1&origemId=abc')
      .expect(HttpStatus.BAD_REQUEST);

    assertValidationErrorContract(asBody(response.body), {
      path: '/personagens-base/tecnicas-disponiveis?claId=1&origemId=abc',
      method: 'GET',
      messageIncludes: 'numeric string is expected',
    });
  });

  it('should return VALIDATION_ERROR with field for invalid personagens-base graus info query', async () => {
    const response = await request(app.getHttpServer())
      .get('/personagens-base/graus-treinamento/info?nivel=0&intelecto=1')
      .expect(HttpStatus.BAD_REQUEST);

    assertValidationErrorContract(asBody(response.body), {
      field: 'nivel',
      path: '/personagens-base/graus-treinamento/info?nivel=0&intelecto=1',
      method: 'GET',
      messageIncludes: 'nivel',
    });
  });

  it('should return VALIDATION_ERROR for invalid trilhas classeId query', async () => {
    const response = await request(app.getHttpServer())
      .get('/trilhas?classeId=abc')
      .expect(HttpStatus.BAD_REQUEST);

    assertValidationErrorContract(asBody(response.body), {
      path: '/trilhas?classeId=abc',
      method: 'GET',
      messageIncludes: 'numeric string is expected',
    });
  });

  it('should return VALIDATION_ERROR with field for invalid trilhas create payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/trilhas')
      .send({
        classeId: 'abc',
        nome: 'Trilha Teste',
      })
      .expect(HttpStatus.BAD_REQUEST);

    assertValidationErrorContract(asBody(response.body), {
      field: 'classeId',
      path: '/trilhas',
      method: 'POST',
      messageIncludes: 'classeId',
    });
  });

  it('should return VALIDATION_ERROR for invalid classes id param', async () => {
    const response = await request(app.getHttpServer())
      .get('/classes/abc')
      .expect(HttpStatus.BAD_REQUEST);

    assertValidationErrorContract(asBody(response.body), {
      path: '/classes/abc',
      method: 'GET',
      messageIncludes: 'numeric string is expected',
    });
  });

  it('should return VALIDATION_ERROR with field for invalid classes create payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/classes')
      .send({
        nome: 'Classe Teste',
        suplementoId: 'abc',
      })
      .expect(HttpStatus.BAD_REQUEST);

    assertValidationErrorContract(asBody(response.body), {
      field: 'suplementoId',
      path: '/classes',
      method: 'POST',
      messageIncludes: 'suplementoId',
    });
  });

  it('should return VALIDATION_ERROR for invalid clas id param', async () => {
    const response = await request(app.getHttpServer())
      .get('/clas/abc')
      .expect(HttpStatus.BAD_REQUEST);

    assertValidationErrorContract(asBody(response.body), {
      path: '/clas/abc',
      method: 'GET',
      messageIncludes: 'numeric string is expected',
    });
  });

  it('should return VALIDATION_ERROR with field for invalid clas create payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/clas')
      .send({
        nome: 'Cla Teste',
        grandeCla: true,
        suplementoId: 'abc',
      })
      .expect(HttpStatus.BAD_REQUEST);

    assertValidationErrorContract(asBody(response.body), {
      field: 'suplementoId',
      path: '/clas',
      method: 'POST',
      messageIncludes: 'suplementoId',
    });
  });

  it('should return VALIDATION_ERROR for invalid origens id param', async () => {
    const response = await request(app.getHttpServer())
      .get('/origens/abc')
      .expect(HttpStatus.BAD_REQUEST);

    assertValidationErrorContract(asBody(response.body), {
      path: '/origens/abc',
      method: 'GET',
      messageIncludes: 'numeric string is expected',
    });
  });

  it('should return VALIDATION_ERROR with field for invalid origens create payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/origens')
      .send({
        nome: 'Origem Teste',
        suplementoId: 'abc',
      })
      .expect(HttpStatus.BAD_REQUEST);

    assertValidationErrorContract(asBody(response.body), {
      field: 'suplementoId',
      path: '/origens',
      method: 'POST',
      messageIncludes: 'suplementoId',
    });
  });

  it('should return VALIDATION_ERROR with field for invalid habilidades query', async () => {
    const response = await request(app.getHttpServer())
      .get('/habilidades?pagina=0')
      .expect(HttpStatus.BAD_REQUEST);

    assertValidationErrorContract(asBody(response.body), {
      field: 'pagina',
      path: '/habilidades?pagina=0',
      method: 'GET',
      messageIncludes: 'pagina',
    });
  });

  it('should return VALIDATION_ERROR with field for invalid habilidades create payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/habilidades')
      .send({
        nome: 'Habilidade Teste',
        tipo: 'PODER_GENERICO',
        suplementoId: 'abc',
      })
      .expect(HttpStatus.BAD_REQUEST);

    assertValidationErrorContract(asBody(response.body), {
      field: 'suplementoId',
      path: '/habilidades',
      method: 'POST',
      messageIncludes: 'suplementoId',
    });
  });

  it('should return VALIDATION_ERROR with field for invalid modificacoes query', async () => {
    const response = await request(app.getHttpServer())
      .get('/modificacoes?pagina=0')
      .expect(HttpStatus.BAD_REQUEST);

    assertValidationErrorContract(asBody(response.body), {
      field: 'pagina',
      path: '/modificacoes?pagina=0',
      method: 'GET',
      messageIncludes: 'pagina',
    });
  });

  it('should return VALIDATION_ERROR with field for invalid modificacoes create payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/modificacoes')
      .send({
        codigo: 'MOD_TESTE',
        nome: 'Modificacao Teste',
        tipo: 'ACESSORIO',
        incrementoEspacos: 1,
        suplementoId: 'abc',
      })
      .expect(HttpStatus.BAD_REQUEST);

    assertValidationErrorContract(asBody(response.body), {
      field: 'suplementoId',
      path: '/modificacoes',
      method: 'POST',
      messageIncludes: 'suplementoId',
    });
  });

  it('should return VALIDATION_ERROR for invalid pericias id param', async () => {
    const response = await request(app.getHttpServer())
      .get('/pericias/abc')
      .expect(HttpStatus.BAD_REQUEST);

    assertValidationErrorContract(asBody(response.body), {
      path: '/pericias/abc',
      method: 'GET',
      messageIncludes: 'numeric string is expected',
    });
  });

  it('should return VALIDATION_ERROR for invalid proficiencias id param', async () => {
    const response = await request(app.getHttpServer())
      .get('/proficiencias/abc')
      .expect(HttpStatus.BAD_REQUEST);

    assertValidationErrorContract(asBody(response.body), {
      path: '/proficiencias/abc',
      method: 'GET',
      messageIncludes: 'numeric string is expected',
    });
  });

  it('should return VALIDATION_ERROR with field for invalid proficiencias create payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/proficiencias')
      .send({
        codigo: 'PROF_TESTE',
        nome: 'A',
        tipo: 'ARMA',
        categoria: 'COMBATE',
      })
      .expect(HttpStatus.BAD_REQUEST);

    assertValidationErrorContract(asBody(response.body), {
      field: 'nome',
      path: '/proficiencias',
      method: 'POST',
      messageIncludes: 'nome',
    });
  });

  it('should return VALIDATION_ERROR for invalid tipos-grau id param', async () => {
    const response = await request(app.getHttpServer())
      .get('/tipos-grau/abc')
      .expect(HttpStatus.BAD_REQUEST);

    assertValidationErrorContract(asBody(response.body), {
      path: '/tipos-grau/abc',
      method: 'GET',
      messageIncludes: 'numeric string is expected',
    });
  });

  it('should return VALIDATION_ERROR with field for invalid tipos-grau create payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/tipos-grau')
      .send({
        codigo: 'GRAU_TESTE',
        nome: 'A',
      })
      .expect(HttpStatus.BAD_REQUEST);

    assertValidationErrorContract(asBody(response.body), {
      field: 'nome',
      path: '/tipos-grau',
      method: 'POST',
      messageIncludes: 'nome',
    });
  });

  it('should return VALIDATION_ERROR for invalid condicoes id param', async () => {
    const response = await request(app.getHttpServer())
      .get('/condicoes/abc')
      .expect(HttpStatus.BAD_REQUEST);

    assertValidationErrorContract(asBody(response.body), {
      path: '/condicoes/abc',
      method: 'GET',
      messageIncludes: 'numeric string is expected',
    });
  });

  it('should return VALIDATION_ERROR with field for invalid condicoes create payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/condicoes')
      .send({
        nome: 'Condicao Teste',
        descricao: 'curta',
      })
      .expect(HttpStatus.BAD_REQUEST);

    assertValidationErrorContract(asBody(response.body), {
      path: '/condicoes',
      method: 'POST',
      messageIncludes: 'Descrição',
    });
  });
});
