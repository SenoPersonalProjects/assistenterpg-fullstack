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
exports.AplicarCondicaoSessaoDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const DURACAO_MODOS = ['ATE_REMOVER', 'RODADAS', 'TURNOS_ALVO'];
class AplicarCondicaoSessaoDto {
    condicaoId;
    alvoTipo;
    personagemSessaoId;
    npcSessaoId;
    duracaoModo;
    duracaoValor;
    origemDescricao;
    observacao;
}
exports.AplicarCondicaoSessaoDto = AplicarCondicaoSessaoDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AplicarCondicaoSessaoDto.prototype, "condicaoId", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['PERSONAGEM', 'NPC']),
    __metadata("design:type", String)
], AplicarCondicaoSessaoDto.prototype, "alvoTipo", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((dto) => dto.alvoTipo === 'PERSONAGEM'),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AplicarCondicaoSessaoDto.prototype, "personagemSessaoId", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((dto) => dto.alvoTipo === 'NPC'),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AplicarCondicaoSessaoDto.prototype, "npcSessaoId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(DURACAO_MODOS),
    __metadata("design:type", String)
], AplicarCondicaoSessaoDto.prototype, "duracaoModo", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((dto) => dto.duracaoModo === 'RODADAS' || dto.duracaoModo === 'TURNOS_ALVO'),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' && value.trim().length > 0 ? Number(value) : value),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AplicarCondicaoSessaoDto.prototype, "duracaoValor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], AplicarCondicaoSessaoDto.prototype, "origemDescricao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], AplicarCondicaoSessaoDto.prototype, "observacao", void 0);
//# sourceMappingURL=aplicar-condicao-sessao.dto.js.map