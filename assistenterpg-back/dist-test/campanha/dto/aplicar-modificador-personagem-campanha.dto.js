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
exports.AplicarModificadorPersonagemCampanhaDto = void 0;
const class_validator_1 = require("class-validator");
const personagem_campanha_campo_modificador_const_1 = require("./personagem-campanha-campo-modificador.const");
class AplicarModificadorPersonagemCampanhaDto {
    campo;
    valor;
    nome;
    descricao;
    sessaoId;
    cenaId;
}
exports.AplicarModificadorPersonagemCampanhaDto = AplicarModificadorPersonagemCampanhaDto;
__decorate([
    (0, class_validator_1.IsEnum)(personagem_campanha_campo_modificador_const_1.CAMPOS_MODIFICADOR_PERSONAGEM_CAMPANHA, {
        message: `campo deve ser um dos valores: ${personagem_campanha_campo_modificador_const_1.CAMPOS_MODIFICADOR_PERSONAGEM_CAMPANHA.join(', ')}`,
    }),
    __metadata("design:type", String)
], AplicarModificadorPersonagemCampanhaDto.prototype, "campo", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'valor deve ser inteiro' }),
    (0, class_validator_1.NotEquals)(0, { message: 'valor nao pode ser zero' }),
    (0, class_validator_1.Min)(-9999, { message: 'valor deve ser maior ou igual a -9999' }),
    __metadata("design:type", Number)
], AplicarModificadorPersonagemCampanhaDto.prototype, "valor", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'nome deve ser texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'nome e obrigatorio' }),
    (0, class_validator_1.MaxLength)(80, { message: 'nome deve ter no maximo 80 caracteres' }),
    __metadata("design:type", String)
], AplicarModificadorPersonagemCampanhaDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'descricao deve ser texto' }),
    (0, class_validator_1.MaxLength)(500, { message: 'descricao deve ter no maximo 500 caracteres' }),
    __metadata("design:type", String)
], AplicarModificadorPersonagemCampanhaDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'sessaoId deve ser inteiro' }),
    (0, class_validator_1.Min)(1, { message: 'sessaoId deve ser maior ou igual a 1' }),
    __metadata("design:type", Number)
], AplicarModificadorPersonagemCampanhaDto.prototype, "sessaoId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'cenaId deve ser inteiro' }),
    (0, class_validator_1.Min)(1, { message: 'cenaId deve ser maior ou igual a 1' }),
    __metadata("design:type", Number)
], AplicarModificadorPersonagemCampanhaDto.prototype, "cenaId", void 0);
//# sourceMappingURL=aplicar-modificador-personagem-campanha.dto.js.map