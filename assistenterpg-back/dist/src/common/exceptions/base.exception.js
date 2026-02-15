"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseException = void 0;
const common_1 = require("@nestjs/common");
class BaseException extends common_1.HttpException {
    code;
    details;
    field;
    timestamp;
    constructor(message, status, code, details, field) {
        super({
            statusCode: status,
            message,
            code: code || 'UNKNOWN_ERROR',
            details,
            field,
            timestamp: new Date().toISOString(),
        }, status);
        this.code = code || 'UNKNOWN_ERROR';
        this.details = details;
        this.field = field;
        this.timestamp = new Date().toISOString();
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.BaseException = BaseException;
//# sourceMappingURL=base.exception.js.map