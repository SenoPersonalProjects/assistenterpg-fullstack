// src/main.ts

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

function isPortInUseError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'EADDRINUSE'
  );
}

async function listenWithPortFallback(
  app: Awaited<ReturnType<typeof NestFactory.create>>,
  logger: Logger,
  preferredPort: number,
): Promise<number> {
  const autoRetryFlag = process.env.PORT_AUTO_RETRY;
  const isDevLike = process.env.NODE_ENV !== 'production';
  const autoRetry =
    autoRetryFlag === 'true' || (isDevLike && autoRetryFlag !== 'false');

  const retryMax = Number(process.env.PORT_AUTO_RETRY_MAX ?? 10);
  const maxAttempts = autoRetry ? Math.max(1, retryMax) : 1;

  let currentPort = preferredPort;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await app.listen(currentPort);
      return currentPort;
    } catch (error: unknown) {
      const isPortInUse = isPortInUseError(error);
      const hasNextAttempt = attempt < maxAttempts;

      if (isPortInUse && hasNextAttempt) {
        logger.warn(
          `Porta ${currentPort} em uso. Tentando ${currentPort + 1}...`,
        );
        currentPort += 1;
        continue;
      }

      if (isPortInUse) {
        logger.error(
          `Nao foi possivel iniciar a API: porta ${currentPort} em uso.`,
        );
        logger.error(
          'Defina PORT para outra porta ou finalize o processo que ocupa essa porta.',
        );
      }

      throw error;
    }
  }

  throw new Error('Falha ao iniciar aplicacao: sem portas disponiveis.');
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Register fallback first and specific HTTP handler last.
  // Nest applies global filters in reverse order of registration.
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  app.useGlobalInterceptors(new LoggingInterceptor(), new TimeoutInterceptor());

  const preferredPortRaw = Number(process.env.PORT ?? 3000);
  const preferredPort = Number.isFinite(preferredPortRaw)
    ? preferredPortRaw
    : 3000;

  const enableSwagger = process.env.SWAGGER_ENABLED !== 'false';
  const apiVersion = process.env.API_VERSION || 'v1';

  if (enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('AssistenteRPG API')
      .setDescription(
        'Contrato oficial da API do backend do AssistenteRPG para integracao com o front.',
      )
      .setVersion(apiVersion)
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Informe o token JWT como Bearer token.',
        },
        'bearer',
      )
      .build();

    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, swaggerDocument, {
      swaggerOptions: {
        persistAuthorization: true,
      },
      jsonDocumentUrl: 'docs/openapi.json',
    });

    logger.log('Swagger habilitado em /docs e /docs/openapi.json.');
    logger.log(`Porta preferencial configurada: ${preferredPort}.`);
  }

  const activePort = await listenWithPortFallback(app, logger, preferredPort);

  logger.log(`Aplicacao rodando em: http://localhost:${activePort}`);
  logger.log(`Swagger UI: http://localhost:${activePort}/docs`);
  logger.log(`OpenAPI JSON: http://localhost:${activePort}/docs/openapi.json`);
  logger.log(`CORS habilitado para: ${corsOrigins.join(', ')}`);
  logger.log('Sistema de tratamento de erros ativado.');
}

void bootstrap();
