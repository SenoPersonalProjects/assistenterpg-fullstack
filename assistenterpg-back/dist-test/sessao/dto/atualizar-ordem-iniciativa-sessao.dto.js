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
exports.AtualizarOrdemIniciativaSessaoDto = exports.OrdemIniciativaItemDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class OrdemIniciativaItemDto {
    tipoParticipante;
    id;
}
exports.OrdemIniciativaItemDto = OrdemIniciativaItemDto;
__decorate([
    (0, class_validator_1.IsIn)(['PERSONAGEM', 'NPC'], {
        message: 'tipoParticipante deve ser PERSONAGEM ou NPC',
    }),
    __metadata("design:type", String)
], OrdemIniciativaItemDto.prototype, "tipoParticipante", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'id deve ser inteiro' }),
    (0, class_validator_1.Min)(1, { message: 'id deve ser maior que zero' }),
    __metadata("design:type", Number)
], OrdemIniciativaItemDto.prototype, "id", void 0);
class AtualizarOrdemIniciativaSessaoDto {
    ordem;
    indiceTurnoAtual;
}
exports.AtualizarOrdemIniciativaSessaoDto = AtualizarOrdemIniciativaSessaoDto;
__decorate([
    (0, class_validator_1.IsArray)({ message: 'ordem deve ser uma lista' }),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'ordem deve ter ao menos um participante' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OrdemIniciativaItemDto),
    __metadata("design:type", Array)
], AtualizarOrdemIniciativaSessaoDto.prototype, "ordem", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'indiceTurnoAtual deve ser inteiro' }),
    (0, class_validator_1.Min)(0, { message: 'indiceTurnoAtual nao pode ser negativo' }),
    __metadata("design:type", Number)
], AtualizarOrdemIniciativaSessaoDto.prototype, "indiceTurnoAtual", void 0);
//# sourceMappingURL=atualizar-ordem-iniciativa-sessao.dto.js.map