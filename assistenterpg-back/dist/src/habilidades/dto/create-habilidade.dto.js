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
exports.CreateHabilidadeDto = exports.EfeitoGrauDto = exports.TipoHabilidade = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
var TipoHabilidade;
(function (TipoHabilidade) {
    TipoHabilidade["RECURSO_CLASSE"] = "RECURSO_CLASSE";
    TipoHabilidade["EFEITO_GRAU"] = "EFEITO_GRAU";
    TipoHabilidade["PODER_GENERICO"] = "PODER_GENERICO";
    TipoHabilidade["MECANICA_ESPECIAL"] = "MECANICA_ESPECIAL";
    TipoHabilidade["HABILIDADE_ORIGEM"] = "HABILIDADE_ORIGEM";
    TipoHabilidade["HABILIDADE_TRILHA"] = "HABILIDADE_TRILHA";
    TipoHabilidade["ESCOLA_TECNICA"] = "ESCOLA_TECNICA";
})(TipoHabilidade || (exports.TipoHabilidade = TipoHabilidade = {}));
class EfeitoGrauDto {
    tipoGrauCodigo;
    valor;
    escalonamentoPorNivel;
}
exports.EfeitoGrauDto = EfeitoGrauDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EfeitoGrauDto.prototype, "tipoGrauCodigo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], EfeitoGrauDto.prototype, "valor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], EfeitoGrauDto.prototype, "escalonamentoPorNivel", void 0);
class CreateHabilidadeDto {
    nome;
    descricao;
    tipo;
    origem;
    requisitos;
    mecanicasEspeciais;
    fonte;
    suplementoId;
    efeitosGrau;
}
exports.CreateHabilidadeDto = CreateHabilidadeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(3, { message: 'Nome deve ter no minimo 3 caracteres' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Nome deve ter no maximo 100 caracteres' }),
    __metadata("design:type", String)
], CreateHabilidadeDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000, { message: 'Descricao deve ter no maximo 1000 caracteres' }),
    __metadata("design:type", String)
], CreateHabilidadeDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TipoHabilidade, {
        message: `Tipo deve ser: ${Object.values(TipoHabilidade).join(', ')}`,
    }),
    __metadata("design:type", String)
], CreateHabilidadeDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateHabilidadeDto.prototype, "origem", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateHabilidadeDto.prototype, "requisitos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateHabilidadeDto.prototype, "mecanicasEspeciais", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoFonte),
    __metadata("design:type", String)
], CreateHabilidadeDto.prototype, "fonte", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateHabilidadeDto.prototype, "suplementoId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => EfeitoGrauDto),
    __metadata("design:type", Array)
], CreateHabilidadeDto.prototype, "efeitosGrau", void 0);
//# sourceMappingURL=create-habilidade.dto.js.map