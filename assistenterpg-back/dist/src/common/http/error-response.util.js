"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorBase = createErrorBase;
exports.normalizeHttpExceptionPayload = normalizeHttpExceptionPayload;
const common_1 = require("@nestjs/common");
const CODE_BY_STATUS = {
    [common_1.HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
    [common_1.HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
    [common_1.HttpStatus.FORBIDDEN]: 'FORBIDDEN',
    [common_1.HttpStatus.NOT_FOUND]: 'NOT_FOUND',
    [common_1.HttpStatus.CONFLICT]: 'CONFLICT',
    [common_1.HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
    [common_1.HttpStatus.TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
    [common_1.HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_ERROR',
    [common_1.HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
    [common_1.HttpStatus.GATEWAY_TIMEOUT]: 'GATEWAY_TIMEOUT',
};
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function toStringValue(value) {
    return typeof value === 'string' ? value : undefined;
}
function toStringOrStringArray(value) {
    if (typeof value === 'string')
        return value;
    if (Array.isArray(value) &&
        value.every((entry) => typeof entry === 'string')) {
        return value;
    }
    return undefined;
}
function statusLabel(statusCode) {
    const enumLabel = common_1.HttpStatus[statusCode];
    if (typeof enumLabel !== 'string')
        return 'Error';
    return enumLabel
        .toLowerCase()
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}
function inferFieldFromValidationMessages(message) {
    for (const validationMessage of message) {
        const eachMatch = validationMessage.match(/^each value in ([A-Za-z0-9_.[\]-]+)\s/);
        if (eachMatch?.[1]) {
            return eachMatch[1];
        }
        const directMatch = validationMessage.match(/^([A-Za-z0-9_.[\]-]+)\s(?:must|should|cannot|has|is)\b/);
        if (directMatch?.[1]) {
            return directMatch[1];
        }
    }
    return undefined;
}
function defaultCodeFor(statusCode, message) {
    if (isValidationLikeBadRequest(statusCode, message)) {
        return 'VALIDATION_ERROR';
    }
    return CODE_BY_STATUS[statusCode] ?? 'HTTP_EXCEPTION';
}
function isValidationLikeBadRequest(statusCode, message) {
    if (statusCode !== 400)
        return false;
    if (Array.isArray(message))
        return true;
    const normalized = message.toLowerCase();
    return (normalized.includes('validation failed') ||
        normalized.includes('numeric string is expected'));
}
function getPath(request) {
    if (typeof request.originalUrl === 'string' &&
        request.originalUrl.length > 0) {
        return request.originalUrl;
    }
    return request.url;
}
function createErrorBase(request, traceId, statusCode) {
    return {
        statusCode,
        timestamp: new Date().toISOString(),
        path: getPath(request),
        method: request.method,
        traceId,
    };
}
function normalizeHttpExceptionPayload(statusCode, response, fallbackMessage, baseException) {
    const responseRecord = isRecord(response) ? response : undefined;
    const message = typeof response === 'string'
        ? response
        : responseRecord
            ? (toStringOrStringArray(responseRecord.message) ?? fallbackMessage)
            : fallbackMessage;
    const explicitCode = responseRecord
        ? toStringValue(responseRecord.code)
        : undefined;
    const explicitError = responseRecord
        ? toStringValue(responseRecord.error)
        : undefined;
    const detailsFromResponse = responseRecord
        ? responseRecord.details
        : undefined;
    const fieldFromResponse = responseRecord
        ? toStringValue(responseRecord.field)
        : undefined;
    let details = detailsFromResponse;
    if (details === undefined &&
        isValidationLikeBadRequest(statusCode, message)) {
        details = {
            validationErrors: Array.isArray(message) ? message : [message],
        };
    }
    return {
        code: baseException?.code ??
            explicitCode ??
            defaultCodeFor(statusCode, message),
        error: explicitError ?? statusLabel(statusCode),
        message,
        details: baseException?.details ?? details,
        field: baseException?.field ??
            fieldFromResponse ??
            (isValidationLikeBadRequest(statusCode, message)
                ? inferFieldFromValidationMessages(Array.isArray(message) ? message : [message])
                : undefined),
    };
}
//# sourceMappingURL=error-response.util.js.map