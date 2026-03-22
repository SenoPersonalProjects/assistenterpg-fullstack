"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseException = void 0;
exports.handlePrismaError = handlePrismaError;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
const client_1 = require("@prisma/client");
class DatabaseException extends base_exception_1.BaseException {
    constructor(message, code, details) {
        super(message, common_1.HttpStatus.INTERNAL_SERVER_ERROR, code, details);
    }
}
exports.DatabaseException = DatabaseException;
function getErrorMessage(error) {
    if (error instanceof Error)
        return error.message;
    if (typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string') {
        return error.message;
    }
    return 'Erro desconhecido';
}
function handlePrismaError(error) {
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002': {
                const fields = error.meta?.target;
                throw new DatabaseException(`Registro duplicado: ${fields?.join(', ') || 'campo único'}`, 'DB_UNIQUE_VIOLATION', { fields, value: error.meta });
            }
            case 'P2003':
                throw new DatabaseException('Referência inválida: registro relacionado não existe', 'DB_FOREIGN_KEY_VIOLATION', { field: error.meta?.field_name });
            case 'P2025':
                throw new DatabaseException('Registro não encontrado', 'DB_RECORD_NOT_FOUND', { cause: error.meta?.cause });
            case 'P2014':
                throw new DatabaseException('Violação de relação obrigatória', 'DB_REQUIRED_RELATION', { relation: error.meta?.relation_name });
            default:
                throw new DatabaseException(`Erro de banco de dados: ${error.message}`, `DB_${error.code}`, { meta: error.meta });
        }
    }
    if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        throw new DatabaseException('Erro de validação no banco de dados', 'DB_VALIDATION_ERROR', { message: error.message });
    }
    throw new DatabaseException('Erro interno no banco de dados', 'DB_INTERNAL_ERROR', { message: getErrorMessage(error) });
}
//# sourceMappingURL=database.exception.js.map