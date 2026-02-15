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
exports.HomebrewFerramentaAmaldicoadaDto = exports.ProtecaoAmaldicoadaDto = exports.ArmaAmaldicoadaDto = exports.ArtefatoAmaldicoadoDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const equipamento_base_dto_1 = require("../base/equipamento-base.dto");
const criar_homebrew_arma_dto_1 = require("./criar-homebrew-arma.dto");
const criar_homebrew_protecao_dto_1 = require("./criar-homebrew-protecao.dto");
class ArtefatoAmaldicoadoDto {
    tipoBase;
    proficienciaRequerida;
    efeito;
    custoUso;
    manutencao;
}
exports.ArtefatoAmaldicoadoDto = ArtefatoAmaldicoadoDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ArtefatoAmaldicoadoDto.prototype, "tipoBase", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ArtefatoAmaldicoadoDto.prototype, "proficienciaRequerida", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ArtefatoAmaldicoadoDto.prototype, "efeito", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ArtefatoAmaldicoadoDto.prototype, "custoUso", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ArtefatoAmaldicoadoDto.prototype, "manutencao", void 0);
class ArmaAmaldicoadaDto {
    tipoBase;
    proficienciaRequerida;
    efeito;
    dadosArma;
}
exports.ArmaAmaldicoadaDto = ArmaAmaldicoadaDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ArmaAmaldicoadaDto.prototype, "tipoBase", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ArmaAmaldicoadaDto.prototype, "proficienciaRequerida", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ArmaAmaldicoadaDto.prototype, "efeito", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => criar_homebrew_arma_dto_1.HomebrewArmaDto),
    __metadata("design:type", criar_homebrew_arma_dto_1.HomebrewArmaDto)
], ArmaAmaldicoadaDto.prototype, "dadosArma", void 0);
class ProtecaoAmaldicoadaDto {
    tipoBase;
    proficienciaRequerida;
    efeito;
    dadosProtecao;
}
exports.ProtecaoAmaldicoadaDto = ProtecaoAmaldicoadaDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProtecaoAmaldicoadaDto.prototype, "tipoBase", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProtecaoAmaldicoadaDto.prototype, "proficienciaRequerida", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProtecaoAmaldicoadaDto.prototype, "efeito", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => criar_homebrew_protecao_dto_1.HomebrewProtecaoDto),
    __metadata("design:type", criar_homebrew_protecao_dto_1.HomebrewProtecaoDto)
], ProtecaoAmaldicoadaDto.prototype, "dadosProtecao", void 0);
class HomebrewFerramentaAmaldicoadaDto extends equipamento_base_dto_1.EquipamentoBaseDto {
    tipoAmaldicoado;
    armaAmaldicoada;
    protecaoAmaldicoada;
    artefatoAmaldicoado;
}
exports.HomebrewFerramentaAmaldicoadaDto = HomebrewFerramentaAmaldicoadaDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(client_1.TipoAmaldicoado),
    __metadata("design:type", String)
], HomebrewFerramentaAmaldicoadaDto.prototype, "tipoAmaldicoado", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ArmaAmaldicoadaDto),
    __metadata("design:type", ArmaAmaldicoadaDto)
], HomebrewFerramentaAmaldicoadaDto.prototype, "armaAmaldicoada", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ProtecaoAmaldicoadaDto),
    __metadata("design:type", ProtecaoAmaldicoadaDto)
], HomebrewFerramentaAmaldicoadaDto.prototype, "protecaoAmaldicoada", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ArtefatoAmaldicoadoDto),
    __metadata("design:type", ArtefatoAmaldicoadoDto)
], HomebrewFerramentaAmaldicoadaDto.prototype, "artefatoAmaldicoado", void 0);
//# sourceMappingURL=criar-homebrew-ferramenta-amaldicoada.dto.js.map