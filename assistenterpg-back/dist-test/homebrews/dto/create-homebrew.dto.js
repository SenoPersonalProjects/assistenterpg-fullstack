"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateHomebrewDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const create_homebrew_base_dto_1 = require("./base/create-homebrew-base.dto");
class CreateHomebrewDto extends create_homebrew_base_dto_1.CreateHomebrewBaseDto {
    tipo;
    dados;
}
exports.CreateHomebrewDto = CreateHomebrewDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(client_1.TipoHomebrewConteudo),
    __metadata("design:type", String)
], CreateHomebrewDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], CreateHomebrewDto.prototype, "dados", void 0);
//# sourceMappingURL=create-homebrew.dto.js.map