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
exports.FiltrarEquipamentosDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const parseBooleanQueryValue = ({ value, obj, key, }) => {
    const rawValue = obj && typeof key === 'string' && key.length > 0 ? obj[key] : value;
    if (rawValue === undefined || rawValue === null || rawValue === '') {
        return undefined;
    }
    if (typeof rawValue === 'boolean') {
        return rawValue;
    }
    if (typeof rawValue === 'string') {
        const normalized = rawValue.trim().toLowerCase();
        if (['1', 'true', 'yes', 'on'].includes(normalized)) {
            return true;
        }
        if (['0', 'false', 'no', 'off'].includes(normalized)) {
            return false;
        }
    }
    return rawValue;
};
class FiltrarEquipamentosDto {
    tipo;
    fontes;
    suplementoId;
    complexidadeMaldicao;
    proficienciaArma;
    proficienciaProtecao;
    alcance;
    tipoAcessorio;
    categoria;
    apenasAmaldicoados;
    busca;
    pagina = 1;
    limite = 20;
}
exports.FiltrarEquipamentosDto = FiltrarEquipamentosDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoEquipamento),
    __metadata("design:type", String)
], FiltrarEquipamentosDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(client_1.TipoFonte, { each: true }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string')
            return value.split(',');
        return value;
    }),
    __metadata("design:type", Array)
], FiltrarEquipamentosDto.prototype, "fontes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FiltrarEquipamentosDto.prototype, "suplementoId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ComplexidadeMaldicao),
    __metadata("design:type", String)
], FiltrarEquipamentosDto.prototype, "complexidadeMaldicao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ProficienciaArma),
    __metadata("design:type", String)
], FiltrarEquipamentosDto.prototype, "proficienciaArma", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ProficienciaProtecao),
    __metadata("design:type", String)
], FiltrarEquipamentosDto.prototype, "proficienciaProtecao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AlcanceArma),
    __metadata("design:type", String)
], FiltrarEquipamentosDto.prototype, "alcance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoAcessorio),
    __metadata("design:type", String)
], FiltrarEquipamentosDto.prototype, "tipoAcessorio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(4),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FiltrarEquipamentosDto.prototype, "categoria", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(parseBooleanQueryValue),
    __metadata("design:type", Boolean)
], FiltrarEquipamentosDto.prototype, "apenasAmaldicoados", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FiltrarEquipamentosDto.prototype, "busca", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FiltrarEquipamentosDto.prototype, "pagina", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FiltrarEquipamentosDto.prototype, "limite", void 0);
//# sourceMappingURL=filtrar-equipamentos.dto.js.map