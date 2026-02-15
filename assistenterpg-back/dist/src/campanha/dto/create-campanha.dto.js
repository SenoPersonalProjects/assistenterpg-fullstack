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
exports.CreateCampanhaDto = void 0;
const class_validator_1 = require("class-validator");
class CreateCampanhaDto {
    nome;
    descricao;
}
exports.CreateCampanhaDto = CreateCampanhaDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'O nome deve ser um texto' }),
    (0, class_validator_1.MinLength)(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
    (0, class_validator_1.MaxLength)(100, { message: 'O nome deve ter no máximo 100 caracteres' }),
    __metadata("design:type", String)
], CreateCampanhaDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'A descrição deve ser um texto' }),
    (0, class_validator_1.MaxLength)(500, { message: 'A descrição deve ter no máximo 500 caracteres' }),
    __metadata("design:type", String)
], CreateCampanhaDto.prototype, "descricao", void 0);
//# sourceMappingURL=create-campanha.dto.js.map