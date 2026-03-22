"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizarJsonOuNull = normalizarJsonOuNull;
exports.normalizarJsonOpcional = normalizarJsonOpcional;
const client_1 = require("@prisma/client");
function normalizarJsonOuNull(value) {
    if (value === undefined || value === null) {
        return client_1.Prisma.JsonNull;
    }
    return value;
}
function normalizarJsonOpcional(value) {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return client_1.Prisma.JsonNull;
    }
    return value;
}
//# sourceMappingURL=tecnicas-amaldicoadas.engine.js.map