"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCondicaoDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_condicao_dto_1 = require("./create-condicao.dto");
class UpdateCondicaoDto extends (0, mapped_types_1.PartialType)(create_condicao_dto_1.CreateCondicaoDto) {
}
exports.UpdateCondicaoDto = UpdateCondicaoDto;
//# sourceMappingURL=update-condicao.dto.js.map