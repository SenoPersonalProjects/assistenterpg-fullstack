"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const timeout_interceptor_1 = require("./common/interceptors/timeout.interceptor");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3001')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter(), new all_exceptions_filter_1.AllExceptionsFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new timeout_interceptor_1.TimeoutInterceptor());
    const port = process.env.PORT ?? 3000;
    const enableSwagger = process.env.SWAGGER_ENABLED !== 'false';
    const apiVersion = process.env.API_VERSION || 'v1';
    if (enableSwagger) {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle('AssistenteRPG API')
            .setDescription('Contrato oficial da API do backend do AssistenteRPG para integração com o front.')
            .setVersion(apiVersion)
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Informe o token JWT como Bearer token.',
        }, 'bearer')
            .build();
        const swaggerDocument = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup('docs', app, swaggerDocument, {
            swaggerOptions: {
                persistAuthorization: true,
            },
            jsonDocumentUrl: 'docs/openapi.json',
        });
        logger.log(`📘 Swagger habilitado em: http://localhost:${port}/docs`);
        logger.log(`📄 OpenAPI JSON em: http://localhost:${port}/docs/openapi.json`);
    }
    await app.listen(port);
    logger.log(`🚀 Aplicação rodando em: http://localhost:${port}`);
    logger.log(`📡 CORS habilitado para: ${corsOrigins.join(', ')}`);
    logger.log('🛡️ Sistema de tratamento de erros ativado');
}
void bootstrap();
//# sourceMappingURL=main.js.map