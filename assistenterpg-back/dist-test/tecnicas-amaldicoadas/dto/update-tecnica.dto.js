"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTecnicaDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_tecnica_dto_1 = require("./create-tecnica.dto");
class UpdateTecnicaDto extends (0, mapped_types_1.PartialType)((0, mapped_types_1.OmitType)(create_tecnica_dto_1.CreateTecnicaDto, ['codigo'])) {
}
exports.UpdateTecnicaDto = UpdateTecnicaDto;
//# sourceMappingURL=update-tecnica.dto.js.map