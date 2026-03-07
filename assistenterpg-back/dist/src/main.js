"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const timeout_interceptor_1 = require("./common/interceptors/timeout.interceptor");
async function listenWithPortFallback(app, logger, preferredPort) {
    const autoRetryFlag = process.env.PORT_AUTO_RETRY;
    const isDevLike = process.env.NODE_ENV !== 'production';
    const autoRetry = autoRetryFlag === 'true' || (isDevLike && autoRetryFlag !== 'false');
    const retryMax = Number(process.env.PORT_AUTO_RETRY_MAX ?? 10);
    const maxAttempts = autoRetry ? Math.max(1, retryMax) : 1;
    let currentPort = preferredPort;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            await app.listen(currentPort);
            return currentPort;
        }
        catch (error) {
            const isPortInUse = error?.code === 'EADDRINUSE';
            const hasNextAttempt = attempt < maxAttempts;
            if (isPortInUse && hasNextAttempt) {
                logger.warn(`Porta ${currentPort} em uso. Tentando ${currentPort + 1}...`);
                currentPort += 1;
                continue;
            }
            if (isPortInUse) {
                logger.error(`Nao foi possivel iniciar a API: porta ${currentPort} em uso.`);
                logger.error('Defina PORT para outra porta ou finalize o processo que ocupa essa porta.');
            }
            throw error;
        }
    }
    throw new Error('Falha ao iniciar aplicacao: sem portas disponiveis.');
}
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
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter(), new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new timeout_interceptor_1.TimeoutInterceptor());
    const preferredPortRaw = Number(process.env.PORT ?? 3000);
    const preferredPort = Number.isFinite(preferredPortRaw) ? preferredPortRaw : 3000;
    const enableSwagger = process.env.SWAGGER_ENABLED !== 'false';
    const apiVersion = process.env.API_VERSION || 'v1';
    if (enableSwagger) {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle('AssistenteRPG API')
            .setDescription('Contrato oficial da API do backend do AssistenteRPG para integracao com o front.')
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
//# sourceMappingURL=main.js.map