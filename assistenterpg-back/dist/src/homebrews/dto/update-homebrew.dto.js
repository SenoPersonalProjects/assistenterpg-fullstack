"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateHomebrewDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_homebrew_dto_1 = require("./create-homebrew.dto");
class UpdateHomebrewDto extends (0, mapped_types_1.PartialType)(create_homebrew_dto_1.CreateHomebrewDto) {
}
exports.UpdateHomebrewDto = UpdateHomebrewDto;
//# sourceMappingURL=update-homebrew.dto.js.map