"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lerCampoNumerico = lerCampoNumerico;
exports.clamp = clamp;
exports.normalizarEmail = normalizarEmail;
exports.gerarCodigoConvite = gerarCodigoConvite;
exports.isUniqueConstraintViolation = isUniqueConstraintViolation;
function lerCampoNumerico(personagem, campo) {
    const valor = personagem[campo];
    if (typeof valor !== 'number' || Number.isNaN(valor))
        return 0;
    return valor;
}
function clamp(valor, minimo, maximo) {
    return Math.max(minimo, Math.min(maximo, valor));
}
function normalizarEmail(email) {
    return email.trim().toLowerCase();
}
function gerarCodigoConvite() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}
function isUniqueConstraintViolation(error, campos) {
    const prismaError = error;
    if (prismaError?.code !== 'P2002')
        return false;
    const target = prismaError?.meta?.target;
    const targetValues = Array.isArray(target)
        ? target.map((value) => String(value))
        : typeof target === 'string'
            ? [target]
            : [];
    if (targetValues.length === 0)
        return false;
    return campos.every((campo) => targetValues.some((targetValue) => targetValue === campo || targetValue.includes(campo)));
}
//# sourceMappingURL=campanha.engine.js.map