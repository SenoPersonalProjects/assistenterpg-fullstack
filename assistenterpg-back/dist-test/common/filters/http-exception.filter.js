"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("../exceptions/base.exception");
const error_response_util_1 = require("../http/error-response.util");
const request_trace_util_1 = require("../http/request-trace.util");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    logger = new common_1.Logger(HttpExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception.getStatus();
        const traceId = (0, request_trace_util_1.getOrCreateTraceId)(request, response);
        const payload = (0, error_response_util_1.normalizeHttpExceptionPayload)(status, exception.getResponse(), exception.message, exception instanceof base_exception_1.BaseException ? exception : undefined);
        const errorResponse = {
            ...(0, error_response_util_1.createErrorBase)(request, traceId, status),
            ...payload,
        };
        if (process.env.NODE_ENV === 'development') {
            errorResponse.stack = exception.stack;
            errorResponse.errorType = exception.name;
        }
        this.logger.error(`[traceId=${traceId}] [${request.method}] ${request.originalUrl ?? request.url} - Status: ${status}`, JSON.stringify(errorResponse, null, 2));
        response.status(status).json(errorResponse);
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)(common_1.HttpException)
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map