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
exports.AtualizarItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
function parseIntSemFallback(value) {
    if (value === undefined || value === null || value === '')
        return undefined;
    if (typeof value === 'number')
        return value;
    if (typeof value === 'string') {
        const normalized = value.trim();
        if (normalized === '')
            return undefined;
        if (!/^[+-]?\d+$/.test(normalized))
            return value;
        return parseInt(normalized, 10);
    }
    return value;
}
function parseBooleanSemFallback(value) {
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (normalized === '')
            return undefined;
        if (normalized === 'true' || normalized === '1')
            return true;
        if (normalized === 'false' || normalized === '0')
            return false;
        return value;
    }
    if (typeof value === 'number') {
        if (value === 1)
            return true;
        if (value === 0)
            return false;
        return value;
    }
    if (typeof value === 'boolean')
        return value;
    if (value === undefined || value === null || value === '')
        return undefined;
    return value;
}
class AtualizarItemDto {
    quantidade;
    equipado;
    nomeCustomizado;
    notas;
}
exports.AtualizarItemDto = AtualizarItemDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Transform)(({ value, obj }) => parseIntSemFallback(obj?.quantidade ?? value)),
    __metadata("design:type", Number)
], AtualizarItemDto.prototype, "quantidade", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value, obj }) => parseBooleanSemFallback(obj?.equipado ?? value)),
    __metadata("design:type", Boolean)
], AtualizarItemDto.prototype, "equipado", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AtualizarItemDto.prototype, "nomeCustomizado", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AtualizarItemDto.prototype, "notas", void 0);
//# sourceMappingURL=atualizar-item.dto.js.map