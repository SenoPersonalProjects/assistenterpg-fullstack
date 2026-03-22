"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tratarErroPrisma = tratarErroPrisma;
const client_1 = require("@prisma/client");
const database_exception_1 = require("src/common/exceptions/database.exception");
function tratarErroPrisma(error) {
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError ||
        error instanceof client_1.Prisma.PrismaClientValidationError) {
        (0, database_exception_1.handlePrismaError)(error);
    }
}
//# sourceMappingURL=tecnicas-amaldicoadas.errors.js.map