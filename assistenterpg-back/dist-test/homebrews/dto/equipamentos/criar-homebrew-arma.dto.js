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
exports.HomebrewArmaDto = exports.DanoArmaDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const equipamento_base_dto_1 = require("../base/equipamento-base.dto");
class DanoArmaDto {
    empunhadura;
    tipoDano;
    rolagem;
    valorFlat;
}
exports.DanoArmaDto = DanoArmaDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.EmpunhaduraArma),
    __metadata("design:type", String)
], DanoArmaDto.prototype, "empunhadura", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(client_1.TipoDano),
    __metadata("design:type", String)
], DanoArmaDto.prototype, "tipoDano", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DanoArmaDto.prototype, "rolagem", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], DanoArmaDto.prototype, "valorFlat", void 0);
class HomebrewArmaDto extends equipamento_base_dto_1.EquipamentoBaseDto {
    proficienciaArma;
    empunhaduras;
    tipoArma;
    subtipoDistancia;
    agil;
    danos;
    criticoValor;
    criticoMultiplicador;
    alcance;
    tipoMunicaoCodigo;
    habilidadeEspecial;
}
exports.HomebrewArmaDto = HomebrewArmaDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(client_1.ProficienciaArma),
    __metadata("design:type", String)
], HomebrewArmaDto.prototype, "proficienciaArma", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(client_1.EmpunhaduraArma, { each: true }),
    __metadata("design:type", Array)
], HomebrewArmaDto.prototype, "empunhaduras", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(client_1.TipoArma),
    __metadata("design:type", String)
], HomebrewArmaDto.prototype, "tipoArma", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SubtipoArmaDistancia),
    __metadata("design:type", String)
], HomebrewArmaDto.prototype, "subtipoDistancia", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], HomebrewArmaDto.prototype, "agil", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DanoArmaDto),
    __metadata("design:type", Array)
], HomebrewArmaDto.prototype, "danos", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], HomebrewArmaDto.prototype, "criticoValor", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], HomebrewArmaDto.prototype, "criticoMultiplicador", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(client_1.AlcanceArma),
    __metadata("design:type", String)
], HomebrewArmaDto.prototype, "alcance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HomebrewArmaDto.prototype, "tipoMunicaoCodigo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HomebrewArmaDto.prototype, "habilidadeEspecial", void 0);
//# sourceMappingURL=criar-homebrew-arma.dto.js.map