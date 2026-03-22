"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateTraceId = getOrCreateTraceId;
const crypto_1 = require("crypto");
function normalizeHeaderValue(value) {
    if (Array.isArray(value)) {
        const first = value.find((entry) => typeof entry === 'string' && entry.trim().length > 0);
        return first?.trim() ?? '';
    }
    if (typeof value === 'string') {
        return value.trim();
    }
    return '';
}
function getOrCreateTraceId(request, response) {
    const requestWithTraceId = request;
    if (typeof requestWithTraceId.traceId === 'string' &&
        requestWithTraceId.traceId.trim().length > 0) {
        const existing = requestWithTraceId.traceId.trim();
        if (response) {
            response.setHeader('x-request-id', existing);
        }
        return existing;
    }
    const incomingHeader = normalizeHeaderValue(request.header('x-request-id'));
    const traceId = incomingHeader || (0, crypto_1.randomUUID)();
    requestWithTraceId.traceId = traceId;
    if (response) {
        response.setHeader('x-request-id', traceId);
    }
    return traceId;
}
//# sourceMappingURL=request-trace.util.js.map