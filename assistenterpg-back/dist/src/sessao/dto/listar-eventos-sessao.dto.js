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
exports.ListarEventosSessaoDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class ListarEventosSessaoDto {
    limit;
    incluirChat;
}
exports.ListarEventosSessaoDto = ListarEventosSessaoDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === undefined || value === null || value === '')
            return undefined;
        const numero = Number(value);
        return Number.isNaN(numero) ? value : numero;
    }),
    (0, class_validator_1.IsInt)({ message: 'limit deve ser inteiro' }),
    (0, class_validator_1.Min)(1, { message: 'limit deve ser maior que zero' }),
    (0, class_validator_1.Max)(200, { message: 'limit deve ser menor ou igual a 200' }),
    __metadata("design:type", Number)
], ListarEventosSessaoDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === undefined || value === null || value === '')
            return undefined;
        if (typeof value === 'boolean')
            return value;
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    (0, class_validator_1.IsBoolean)({ message: 'incluirChat deve ser booleano' }),
    __metadata("design:type", Boolean)
], ListarEventosSessaoDto.prototype, "incluirChat", void 0);
//# sourceMappingURL=listar-eventos-sessao.dto.js.map