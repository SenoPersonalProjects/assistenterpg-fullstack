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
exports.HomebrewProtecaoDto = exports.ReducaoDanoDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const equipamento_base_dto_1 = require("../base/equipamento-base.dto");
class ReducaoDanoDto {
    tipoReducao;
    valor;
}
exports.ReducaoDanoDto = ReducaoDanoDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(client_1.TipoReducaoDano),
    __metadata("design:type", String)
], ReducaoDanoDto.prototype, "tipoReducao", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ReducaoDanoDto.prototype, "valor", void 0);
class HomebrewProtecaoDto extends equipamento_base_dto_1.EquipamentoBaseDto {
    proficienciaProtecao;
    tipoProtecao;
    bonusDefesa;
    penalidadeCarga;
    reducoesDano;
}
exports.HomebrewProtecaoDto = HomebrewProtecaoDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(client_1.ProficienciaProtecao),
    __metadata("design:type", String)
], HomebrewProtecaoDto.prototype, "proficienciaProtecao", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(client_1.TipoProtecao),
    __metadata("design:type", String)
], HomebrewProtecaoDto.prototype, "tipoProtecao", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], HomebrewProtecaoDto.prototype, "bonusDefesa", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], HomebrewProtecaoDto.prototype, "penalidadeCarga", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReducaoDanoDto),
    __metadata("design:type", Array)
], HomebrewProtecaoDto.prototype, "reducoesDano", void 0);
//# sourceMappingURL=criar-homebrew-protecao.dto.js.map