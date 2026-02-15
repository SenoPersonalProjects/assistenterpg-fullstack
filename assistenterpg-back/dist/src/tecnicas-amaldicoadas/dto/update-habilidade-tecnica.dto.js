"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateHabilidadeTecnicaDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_habilidade_tecnica_dto_1 = require("./create-habilidade-tecnica.dto");
class UpdateHabilidadeTecnicaDto extends (0, mapped_types_1.PartialType)((0, mapped_types_1.OmitType)(create_habilidade_tecnica_dto_1.CreateHabilidadeTecnicaDto, ['tecnicaId', 'codigo'])) {
}
exports.UpdateHabilidadeTecnicaDto = UpdateHabilidadeTecnicaDto;
//# sourceMappingURL=update-habilidade-tecnica.dto.js.map