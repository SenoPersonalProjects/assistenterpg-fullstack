"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTrilhaDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_trilha_dto_1 = require("./create-trilha.dto");
class UpdateTrilhaDto extends (0, mapped_types_1.PartialType)(create_trilha_dto_1.CreateTrilhaDto) {
}
exports.UpdateTrilhaDto = UpdateTrilhaDto;
//# sourceMappingURL=update-trilha.dto.js.map