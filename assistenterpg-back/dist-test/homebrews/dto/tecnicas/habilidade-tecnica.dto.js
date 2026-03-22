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
exports.HabilidadeTecnicaDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const shared_tecnica_dto_1 = require("./shared-tecnica.dto");
const variacao_habilidade_dto_1 = require("./variacao-habilidade.dto");
class HabilidadeTecnicaDto {
    codigo;
    nome;
    descricao;
    requisitos;
    execucao;
    area;
    alcance;
    alvo;
    duracao;
    resistencia;
    dtResistencia;
    custoPE;
    custoEA;
    testesExigidos;
    criticoValor;
    criticoMultiplicador;
    danoFlat;
    danoFlatTipo;
    dadosDano;
    escalonaPorGrau;
    grauTipoGrauCodigo;
    escalonamentoCustoEA;
    escalonamentoDano;
    efeito;
    variacoes;
    ordem;
}
exports.HabilidadeTecnicaDto = HabilidadeTecnicaDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HabilidadeTecnicaDto.prototype, "codigo", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HabilidadeTecnicaDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HabilidadeTecnicaDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], HabilidadeTecnicaDto.prototype, "requisitos", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(client_1.TipoExecucao),
    __metadata("design:type", String)
], HabilidadeTecnicaDto.prototype, "execucao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AreaEfeito),
    __metadata("design:type", String)
], HabilidadeTecnicaDto.prototype, "area", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HabilidadeTecnicaDto.prototype, "alcance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HabilidadeTecnicaDto.prototype, "alvo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HabilidadeTecnicaDto.prototype, "duracao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HabilidadeTecnicaDto.prototype, "resistencia", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HabilidadeTecnicaDto.prototype, "dtResistencia", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], HabilidadeTecnicaDto.prototype, "custoPE", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], HabilidadeTecnicaDto.prototype, "custoEA", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], HabilidadeTecnicaDto.prototype, "testesExigidos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], HabilidadeTecnicaDto.prototype, "criticoValor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], HabilidadeTecnicaDto.prototype, "criticoMultiplicador", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], HabilidadeTecnicaDto.prototype, "danoFlat", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoDano),
    __metadata("design:type", String)
], HabilidadeTecnicaDto.prototype, "danoFlatTipo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => shared_tecnica_dto_1.DadoDanoDto),
    __metadata("design:type", Array)
], HabilidadeTecnicaDto.prototype, "dadosDano", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], HabilidadeTecnicaDto.prototype, "escalonaPorGrau", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HabilidadeTecnicaDto.prototype, "grauTipoGrauCodigo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], HabilidadeTecnicaDto.prototype, "escalonamentoCustoEA", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => shared_tecnica_dto_1.EscalonamentoDanoDto),
    __metadata("design:type", shared_tecnica_dto_1.EscalonamentoDanoDto)
], HabilidadeTecnicaDto.prototype, "escalonamentoDano", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HabilidadeTecnicaDto.prototype, "efeito", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => variacao_habilidade_dto_1.VariacaoHabilidadeDto),
    __metadata("design:type", Array)
], HabilidadeTecnicaDto.prototype, "variacoes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], HabilidadeTecnicaDto.prototype, "ordem", void 0);
//# sourceMappingURL=habilidade-tecnica.dto.js.map