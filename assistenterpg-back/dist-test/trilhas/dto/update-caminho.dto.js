"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCaminhoDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_caminho_dto_1 = require("./create-caminho.dto");
class UpdateCaminhoDto extends (0, mapped_types_1.PartialType)(create_caminho_dto_1.CreateCaminhoDto) {
}
exports.UpdateCaminhoDto = UpdateCaminhoDto;
//# sourceMappingURL=update-caminho.dto.js.map