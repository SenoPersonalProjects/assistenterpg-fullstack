"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateArtigoDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_artigo_dto_1 = require("./create-artigo.dto");
class UpdateArtigoDto extends (0, mapped_types_1.PartialType)(create_artigo_dto_1.CreateArtigoDto) {
}
exports.UpdateArtigoDto = UpdateArtigoDto;
//# sourceMappingURL=update-artigo.dto.js.map