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
exports.AddMembroDto = void 0;
const class_validator_1 = require("class-validator");
const PAPEIS_CAMPANHA = ['MESTRE', 'JOGADOR', 'OBSERVADOR'];
class AddMembroDto {
    usuarioId;
    papel;
}
exports.AddMembroDto = AddMembroDto;
__decorate([
    (0, class_validator_1.IsInt)({ message: 'usuarioId deve ser inteiro' }),
    (0, class_validator_1.Min)(1, { message: 'usuarioId deve ser maior que zero' }),
    __metadata("design:type", Number)
], AddMembroDto.prototype, "usuarioId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(PAPEIS_CAMPANHA, {
        message: 'Papel deve ser MESTRE, JOGADOR ou OBSERVADOR',
    }),
    __metadata("design:type", String)
], AddMembroDto.prototype, "papel", void 0);
//# sourceMappingURL=add-membro.dto.js.map