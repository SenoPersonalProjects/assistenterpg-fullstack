"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const request_trace_util_1 = require("../http/request-trace.util");
const SENSITIVE_KEYS = new Set([
    'senha',
    'senhaAtual',
    'novaSenha',
    'password',
    'token',
    'access_token',
    'authorization',
]);
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function redactSensitive(value) {
    if (Array.isArray(value)) {
        return value.map((entry) => redactSensitive(entry));
    }
    if (!isRecord(value)) {
        return value;
    }
    const result = {};
    for (const [key, entry] of Object.entries(value)) {
        if (SENSITIVE_KEYS.has(key)) {
            result[key] = '[REDACTED]';
            continue;
        }
        result[key] = redactSensitive(entry);
    }
    return result;
}
function getErrorStatus(error) {
    if (!isRecord(error))
        return 500;
    const typedError = error;
    if (typeof typedError.getStatus === 'function') {
        return typedError.getStatus();
    }
    if (typeof typedError.status === 'number') {
        return typedError.status;
    }
    if (typeof typedError.statusCode === 'number') {
        return typedError.statusCode;
    }
    if (isRecord(typedError.response)) {
        const responseStatus = typedError.response.statusCode;
        if (typeof responseStatus === 'number') {
            return responseStatus;
        }
    }
    return 500;
}
function getErrorMessage(error) {
    if (error instanceof Error)
        return error.message;
    if (!isRecord(error))
        return 'Erro desconhecido';
    const typedError = error;
    if (typeof typedError.message === 'string') {
        return typedError.message;
    }
    if (isRecord(typedError.response)) {
        const responseMessage = typedError.response.message;
        if (typeof responseMessage === 'string')
            return responseMessage;
        if (Array.isArray(responseMessage))
            return responseMessage.join(', ');
    }
    return 'Erro desconhecido';
}
let LoggingInterceptor = class LoggingInterceptor {
    logger = new common_1.Logger('HTTP');
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const traceId = (0, request_trace_util_1.getOrCreateTraceId)(request, response);
        const method = request.method;
        const url = request.originalUrl ?? request.url;
        const query = request.query;
        const params = request.params;
        const userAgent = request.get('user-agent') || '';
        const now = Date.now();
        this.logger.log(`[traceId=${traceId}] -> [${method}] ${url} | Query: ${JSON.stringify(query)} | Params: ${JSON.stringify(params)} | UserAgent: ${userAgent}`);
        if (process.env.NODE_ENV === 'development' && method !== 'GET') {
            const safeBody = redactSensitive(request.body);
            this.logger.debug(`[traceId=${traceId}] Body: ${JSON.stringify(safeBody)}`);
        }
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                const responseTime = Date.now() - now;
                this.logger.log(`[traceId=${traceId}] <- [${method}] ${url} | Status: ${response.statusCode} | Time: ${responseTime}ms`);
            },
            error: (error) => {
                const responseTime = Date.now() - now;
                this.logger.error(`[traceId=${traceId}] <- [${method}] ${url} | Status: ${getErrorStatus(error)} | Time: ${responseTime}ms | Error: ${getErrorMessage(error)}`);
            },
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map