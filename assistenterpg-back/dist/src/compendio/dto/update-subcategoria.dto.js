"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSubcategoriaDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_subcategoria_dto_1 = require("./create-subcategoria.dto");
class UpdateSubcategoriaDto extends (0, mapped_types_1.PartialType)(create_subcategoria_dto_1.CreateSubcategoriaDto) {
}
exports.UpdateSubcategoriaDto = UpdateSubcategoriaDto;
//# sourceMappingURL=update-subcategoria.dto.js.map