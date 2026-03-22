"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularEspacosInventarioBase = calcularEspacosInventarioBase;
exports.calcularAtributoBaseInventario = calcularAtributoBaseInventario;
function calcularEspacosInventarioBase(atributoBase) {
    if (!Number.isFinite(atributoBase) || atributoBase <= 0)
        return 2;
    return atributoBase * 5;
}
function calcularAtributoBaseInventario(params) {
    const intelecto = params.somarIntelecto ? (params.intelecto ?? 0) : 0;
    return params.forca + intelecto;
}
//# sourceMappingURL=inventario-capacidade.js.map