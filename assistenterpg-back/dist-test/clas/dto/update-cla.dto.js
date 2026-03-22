"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateClaDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_cla_dto_1 = require("./create-cla.dto");
class UpdateClaDto extends (0, mapped_types_1.PartialType)(create_cla_dto_1.CreateClaDto) {
}
exports.UpdateClaDto = UpdateClaDto;
//# sourceMappingURL=update-cla.dto.js.map