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
exports.CreateHabilidadeTecnicaDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateHabilidadeTecnicaDto {
    tecnicaId;
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
    custoSustentacaoEA;
    custoSustentacaoPE;
    testesExigidos;
    criticoValor;
    criticoMultiplicador;
    danoFlat;
    danoFlatTipo;
    dadosDano;
    escalonaPorGrau;
    grauTipoGrauCodigo;
    escalonamentoCustoEA;
    escalonamentoCustoPE;
    escalonamentoTipo;
    escalonamentoEfeito;
    escalonamentoDano;
    efeito;
    ordem;
}
exports.CreateHabilidadeTecnicaDto = CreateHabilidadeTecnicaDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateHabilidadeTecnicaDto.prototype, "tecnicaId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHabilidadeTecnicaDto.prototype, "codigo", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHabilidadeTecnicaDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHabilidadeTecnicaDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateHabilidadeTecnicaDto.prototype, "requisitos", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(client_1.TipoExecucao),
    __metadata("design:type", String)
], CreateHabilidadeTecnicaDto.prototype, "execucao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AreaEfeito),
    __metadata("design:type", String)
], CreateHabilidadeTecnicaDto.prototype, "area", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHabilidadeTecnicaDto.prototype, "alcance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHabilidadeTecnicaDto.prototype, "alvo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHabilidadeTecnicaDto.prototype, "duracao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHabilidadeTecnicaDto.prototype, "resistencia", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHabilidadeTecnicaDto.prototype, "dtResistencia", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateHabilidadeTecnicaDto.prototype, "custoPE", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateHabilidadeTecnicaDto.prototype, "custoEA", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateHabilidadeTecnicaDto.prototype, "custoSustentacaoEA", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateHabilidadeTecnicaDto.prototype, "custoSustentacaoPE", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateHabilidadeTecnicaDto.prototype, "testesExigidos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateHabilidadeTecnicaDto.prototype, "criticoValor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateHabilidadeTecnicaDto.prototype, "criticoMultiplicador", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateHabilidadeTecnicaDto.prototype, "danoFlat", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoDano),
    __metadata("design:type", String)
], CreateHabilidadeTecnicaDto.prototype, "danoFlatTipo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateHabilidadeTecnicaDto.prototype, "dadosDano", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateHabilidadeTecnicaDto.prototype, "escalonaPorGrau", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHabilidadeTecnicaDto.prototype, "grauTipoGrauCodigo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateHabilidadeTecnicaDto.prototype, "escalonamentoCustoEA", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateHabilidadeTecnicaDto.prototype, "escalonamentoCustoPE", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoEscalonamentoHabilidade),
    __metadata("design:type", String)
], CreateHabilidadeTecnicaDto.prototype, "escalonamentoTipo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateHabilidadeTecnicaDto.prototype, "escalonamentoEfeito", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateHabilidadeTecnicaDto.prototype, "escalonamentoDano", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHabilidadeTecnicaDto.prototype, "efeito", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateHabilidadeTecnicaDto.prototype, "ordem", void 0);
//# sourceMappingURL=create-habilidade-tecnica.dto.js.map