"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NpcAmeacaNaoEncontradaException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
class NpcAmeacaNaoEncontradaException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('NPC/Ameaca nao encontrado', common_1.HttpStatus.NOT_FOUND, 'NPC_AMEACA_NOT_FOUND', { identificador });
    }
}
exports.NpcAmeacaNaoEncontradaException = NpcAmeacaNaoEncontradaException;
//# sourceMappingURL=npc-ameaca.exception.js.map