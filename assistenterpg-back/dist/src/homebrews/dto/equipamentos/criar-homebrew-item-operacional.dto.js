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
exports.HomebrewItemOperacionalDto = void 0;
const class_validator_1 = require("class-validator");
const equipamento_base_dto_1 = require("../base/equipamento-base.dto");
class HomebrewItemOperacionalDto extends equipamento_base_dto_1.EquipamentoBaseDto {
    periciaBonificada;
    bonusPericia;
    efeito;
}
exports.HomebrewItemOperacionalDto = HomebrewItemOperacionalDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HomebrewItemOperacionalDto.prototype, "periciaBonificada", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], HomebrewItemOperacionalDto.prototype, "bonusPericia", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HomebrewItemOperacionalDto.prototype, "efeito", void 0);
//# sourceMappingURL=criar-homebrew-item-operacional.dto.js.map