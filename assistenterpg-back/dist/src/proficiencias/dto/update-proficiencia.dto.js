"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProficienciaDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_proficiencia_dto_1 = require("./create-proficiencia.dto");
class UpdateProficienciaDto extends (0, mapped_types_1.PartialType)(create_proficiencia_dto_1.CreateProficienciaDto) {
}
exports.UpdateProficienciaDto = UpdateProficienciaDto;
//# sourceMappingURL=update-proficiencia.dto.js.map