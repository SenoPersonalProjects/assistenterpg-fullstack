"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSuplementoDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_suplemento_dto_1 = require("./create-suplemento.dto");
class UpdateSuplementoDto extends (0, mapped_types_1.PartialType)((0, mapped_types_1.OmitType)(create_suplemento_dto_1.CreateSuplementoDto, ['codigo'])) {
}
exports.UpdateSuplementoDto = UpdateSuplementoDto;
//# sourceMappingURL=update-suplemento.dto.js.map