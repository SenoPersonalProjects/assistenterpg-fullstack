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
exports.FiltrarHomebrewsDto = void 0;
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
class FiltrarHomebrewsDto {
    nome;
    tipo;
    status;
    usuarioId;
    apenasPublicados;
    pagina;
    limite;
}
exports.FiltrarHomebrewsDto = FiltrarHomebrewsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FiltrarHomebrewsDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoHomebrewConteudo),
    __metadata("design:type", String)
], FiltrarHomebrewsDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.StatusPublicacao),
    __metadata("design:type", String)
], FiltrarHomebrewsDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FiltrarHomebrewsDto.prototype, "usuarioId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(parseBooleanQueryValue),
    __metadata("design:type", Boolean)
], FiltrarHomebrewsDto.prototype, "apenasPublicados", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FiltrarHomebrewsDto.prototype, "pagina", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FiltrarHomebrewsDto.prototype, "limite", void 0);
//# sourceMappingURL=filtrar-homebrews.dto.js.map