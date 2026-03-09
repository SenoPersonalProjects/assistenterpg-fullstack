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
exports.FiltrarTecnicasDto = void 0;
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
class FiltrarTecnicasDto {
    nome;
    codigo;
    tipo;
    hereditaria;
    claId;
    claNome;
    fonte;
    suplementoId;
    incluirHabilidades;
    incluirClas;
}
exports.FiltrarTecnicasDto = FiltrarTecnicasDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FiltrarTecnicasDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FiltrarTecnicasDto.prototype, "codigo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoTecnicaAmaldicoada),
    __metadata("design:type", String)
], FiltrarTecnicasDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(parseBooleanQueryValue),
    __metadata("design:type", Boolean)
], FiltrarTecnicasDto.prototype, "hereditaria", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FiltrarTecnicasDto.prototype, "claId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FiltrarTecnicasDto.prototype, "claNome", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoFonte),
    __metadata("design:type", String)
], FiltrarTecnicasDto.prototype, "fonte", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FiltrarTecnicasDto.prototype, "suplementoId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(parseBooleanQueryValue),
    __metadata("design:type", Boolean)
], FiltrarTecnicasDto.prototype, "incluirHabilidades", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(parseBooleanQueryValue),
    __metadata("design:type", Boolean)
], FiltrarTecnicasDto.prototype, "incluirClas", void 0);
//# sourceMappingURL=filtrar-tecnicas.dto.js.map