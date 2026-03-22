"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateClasseDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_classe_dto_1 = require("./create-classe.dto");
class UpdateClasseDto extends (0, mapped_types_1.PartialType)(create_classe_dto_1.CreateClasseDto) {
}
exports.UpdateClasseDto = UpdateClasseDto;
//# sourceMappingURL=update-classe.dto.js.map