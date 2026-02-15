"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateModificacaoDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_modificacao_dto_1 = require("./create-modificacao.dto");
class UpdateModificacaoDto extends (0, mapped_types_1.PartialType)(create_modificacao_dto_1.CreateModificacaoDto) {
}
exports.UpdateModificacaoDto = UpdateModificacaoDto;
//# sourceMappingURL=update-modificacao.dto.js.map