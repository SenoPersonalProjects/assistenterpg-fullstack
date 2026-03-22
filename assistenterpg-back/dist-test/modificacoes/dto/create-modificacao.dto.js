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
exports.CreateModificacaoDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateModificacaoDto {
    codigo;
    nome;
    descricao;
    tipo;
    incrementoEspacos;
    restricoes;
    efeitosMecanicos;
    fonte;
    suplementoId;
    equipamentosCompatíveisIds;
}
exports.CreateModificacaoDto = CreateModificacaoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(3, { message: 'Código deve ter no mínimo 3 caracteres' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Código deve ter no máximo 50 caracteres' }),
    __metadata("design:type", String)
], CreateModificacaoDto.prototype, "codigo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(3, { message: 'Nome deve ter no mínimo 3 caracteres' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Nome deve ter no máximo 100 caracteres' }),
    __metadata("design:type", String)
], CreateModificacaoDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000, { message: 'Descrição deve ter no máximo 1000 caracteres' }),
    __metadata("design:type", String)
], CreateModificacaoDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.TipoModificacao, {
        message: `Tipo deve ser: ${Object.values(client_1.TipoModificacao).join(', ')}`,
    }),
    __metadata("design:type", String)
], CreateModificacaoDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateModificacaoDto.prototype, "incrementoEspacos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateModificacaoDto.prototype, "restricoes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateModificacaoDto.prototype, "efeitosMecanicos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoFonte),
    __metadata("design:type", String)
], CreateModificacaoDto.prototype, "fonte", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateModificacaoDto.prototype, "suplementoId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsInt)({ each: true }),
    __metadata("design:type", Array)
], CreateModificacaoDto.prototype, "equipamentosCompat\u00EDveisIds", void 0);
//# sourceMappingURL=create-modificacao.dto.js.map