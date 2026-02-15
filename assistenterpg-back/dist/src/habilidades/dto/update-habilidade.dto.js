"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateHabilidadeDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_habilidade_dto_1 = require("./create-habilidade.dto");
class UpdateHabilidadeDto extends (0, mapped_types_1.PartialType)(create_habilidade_dto_1.CreateHabilidadeDto) {
}
exports.UpdateHabilidadeDto = UpdateHabilidadeDto;
//# sourceMappingURL=update-habilidade.dto.js.map