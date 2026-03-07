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
exports.CreateOrigemDto = exports.OrigemPericiaDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class OrigemPericiaDto {
    periciaId;
    tipo;
    grupoEscolha;
}
exports.OrigemPericiaDto = OrigemPericiaDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], OrigemPericiaDto.prototype, "periciaId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['FIXA', 'ESCOLHA'], {
        message: 'Tipo deve ser FIXA ou ESCOLHA',
    }),
    __metadata("design:type", String)
], OrigemPericiaDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], OrigemPericiaDto.prototype, "grupoEscolha", void 0);
class CreateOrigemDto {
    nome;
    descricao;
    requisitosTexto;
    requerGrandeCla;
    requerTecnicaHeriditaria;
    bloqueiaTecnicaHeriditaria;
    fonte;
    suplementoId;
    pericias;
    habilidadesIds;
}
exports.CreateOrigemDto = CreateOrigemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(3, { message: 'Nome deve ter no minimo 3 caracteres' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Nome deve ter no maximo 100 caracteres' }),
    __metadata("design:type", String)
], CreateOrigemDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000, { message: 'Descricao deve ter no maximo 2000 caracteres' }),
    __metadata("design:type", String)
], CreateOrigemDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateOrigemDto.prototype, "requisitosTexto", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateOrigemDto.prototype, "requerGrandeCla", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateOrigemDto.prototype, "requerTecnicaHeriditaria", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateOrigemDto.prototype, "bloqueiaTecnicaHeriditaria", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoFonte),
    __metadata("design:type", String)
], CreateOrigemDto.prototype, "fonte", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateOrigemDto.prototype, "suplementoId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OrigemPericiaDto),
    __metadata("design:type", Array)
], CreateOrigemDto.prototype, "pericias", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsInt)({ each: true }),
    __metadata("design:type", Array)
], CreateOrigemDto.prototype, "habilidadesIds", void 0);
//# sourceMappingURL=create-origem.dto.js.map