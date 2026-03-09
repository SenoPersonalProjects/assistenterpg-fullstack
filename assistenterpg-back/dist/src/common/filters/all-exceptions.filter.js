"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const database_exception_1 = require("../exceptions/database.exception");
const base_exception_1 = require("../exceptions/base.exception");
const error_response_util_1 = require("../http/error-response.util");
const request_trace_util_1 = require("../http/request-trace.util");
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function parseDbError(error) {
    if (error instanceof Error) {
        const code = isRecord(error) && typeof error.code === 'string'
            ? error.code
            : undefined;
        const details = isRecord(error) ? error.details : undefined;
        return {
            code,
            message: error.message,
            details,
            stack: error.stack,
            name: error.name,
        };
    }
    if (isRecord(error)) {
        const code = typeof error.code === 'string' ? error.code : undefined;
        const message = typeof error.message === 'string'
            ? error.message
            : 'Erro de banco de dados';
        const details = error.details;
        const name = typeof error.name === 'string' ? error.name : undefined;
        return { code, message, details, name };
    }
    return { message: 'Erro de banco de dados' };
}
function buildHttpErrorResponse(exception, request, traceId) {
    const status = exception.getStatus();
    const payload = (0, error_response_util_1.normalizeHttpExceptionPayload)(status, exception.getResponse(), exception.message, exception instanceof base_exception_1.BaseException ? exception : undefined);
    const response = {
        ...(0, error_response_util_1.createErrorBase)(request, traceId, status),
        ...payload,
    };
    if (process.env.NODE_ENV === 'development') {
        response.stack = exception.stack;
        response.errorType = exception.name;
    }
    return response;
}
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger = new common_1.Logger(AllExceptionsFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const traceId = (0, request_trace_util_1.getOrCreateTraceId)(request, response);
        if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError ||
            exception instanceof client_1.Prisma.PrismaClientValidationError) {
            try {
                (0, database_exception_1.handlePrismaError)(exception);
            }
            catch (dbError) {
                if (dbError instanceof common_1.HttpException) {
                    const dbResponse = buildHttpErrorResponse(dbError, request, traceId);
                    this.logger.error(`[traceId=${traceId}] [${request.method}] ${request.originalUrl ?? request.url} - Status: ${dbResponse.statusCode}`, JSON.stringify(dbResponse, null, 2));
                    return response.status(dbResponse.statusCode).json(dbResponse);
                }
                const erro = parseDbError(dbError);
                this.logger.error(`[traceId=${traceId}] Database Error: ${erro.message}`, erro.stack ?? '');
                const dbResponse = {
                    ...(0, error_response_util_1.createErrorBase)(request, traceId, common_1.HttpStatus.INTERNAL_SERVER_ERROR),
                    code: erro.code ?? 'DB_ERROR',
                    error: 'Internal Server Error',
                    message: erro.message,
                    details: erro.details,
                };
                if (process.env.NODE_ENV === 'development') {
                    dbResponse.stack = erro.stack;
                    dbResponse.errorType = erro.name ?? 'DatabaseError';
                }
                return response
                    .status(common_1.HttpStatus.INTERNAL_SERVER_ERROR)
                    .json(dbResponse);
            }
        }
        if (exception instanceof common_1.HttpException) {
            const httpResponse = buildHttpErrorResponse(exception, request, traceId);
            this.logger.error(`[traceId=${traceId}] [${request.method}] ${request.originalUrl ?? request.url} - Status: ${httpResponse.statusCode}`, JSON.stringify(httpResponse, null, 2));
            return response.status(httpResponse.statusCode).json(httpResponse);
        }
        const status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const errorResponse = {
            ...(0, error_response_util_1.createErrorBase)(request, traceId, status),
            code: 'INTERNAL_ERROR',
            error: 'Internal Server Error',
            message: 'Erro interno no servidor',
        };
        if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
            errorResponse.stack = exception.stack;
            errorResponse.errorType = exception.name;
            errorResponse.details = { message: exception.message };
        }
        this.logger.error(`[traceId=${traceId}] Unhandled Exception`, exception instanceof Error ? exception.stack : '');
        response.status(status).json(errorResponse);
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map