// src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

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

  app.useGlobalFilters(new HttpExceptionFilter(), new AllExceptionsFilter());

  app.useGlobalInterceptors(new LoggingInterceptor(), new TimeoutInterceptor());

  const port = process.env.PORT ?? 3000;
  const enableSwagger = process.env.SWAGGER_ENABLED !== 'false';
  const apiVersion = process.env.API_VERSION || 'v1';

  if (enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('AssistenteRPG API')
      .setDescription(
        'Contrato oficial da API do backend do AssistenteRPG para integração com o front.',
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

    logger.log(`📘 Swagger habilitado em: http://localhost:${port}/docs`);
    logger.log(
      `📄 OpenAPI JSON em: http://localhost:${port}/docs/openapi.json`,
    );
  }

  await app.listen(port);

  logger.log(`🚀 Aplicação rodando em: http://localhost:${port}`);
  logger.log(`📡 CORS habilitado para: ${corsOrigins.join(', ')}`);
  logger.log('🛡️ Sistema de tratamento de erros ativado');
}
void bootstrap();
