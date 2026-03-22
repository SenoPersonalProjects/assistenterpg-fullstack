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
exports.UpdateVariacaoHabilidadeDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class UpdateVariacaoHabilidadeDto {
    nome;
    descricao;
    substituiCustos;
    custoPE;
    custoEA;
    custoSustentacaoEA;
    custoSustentacaoPE;
    execucao;
    area;
    alcance;
    alvo;
    duracao;
    resistencia;
    dtResistencia;
    criticoValor;
    criticoMultiplicador;
    danoFlat;
    danoFlatTipo;
    dadosDano;
    escalonaPorGrau;
    escalonamentoCustoEA;
    escalonamentoCustoPE;
    escalonamentoTipo;
    escalonamentoEfeito;
    escalonamentoDano;
    efeitoAdicional;
    requisitos;
    ordem;
}
exports.UpdateVariacaoHabilidadeDto = UpdateVariacaoHabilidadeDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVariacaoHabilidadeDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVariacaoHabilidadeDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateVariacaoHabilidadeDto.prototype, "substituiCustos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateVariacaoHabilidadeDto.prototype, "custoPE", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateVariacaoHabilidadeDto.prototype, "custoEA", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateVariacaoHabilidadeDto.prototype, "custoSustentacaoEA", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateVariacaoHabilidadeDto.prototype, "custoSustentacaoPE", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoExecucao),
    __metadata("design:type", String)
], UpdateVariacaoHabilidadeDto.prototype, "execucao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AreaEfeito),
    __metadata("design:type", String)
], UpdateVariacaoHabilidadeDto.prototype, "area", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVariacaoHabilidadeDto.prototype, "alcance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVariacaoHabilidadeDto.prototype, "alvo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVariacaoHabilidadeDto.prototype, "duracao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVariacaoHabilidadeDto.prototype, "resistencia", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVariacaoHabilidadeDto.prototype, "dtResistencia", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateVariacaoHabilidadeDto.prototype, "criticoValor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateVariacaoHabilidadeDto.prototype, "criticoMultiplicador", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateVariacaoHabilidadeDto.prototype, "danoFlat", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoDano),
    __metadata("design:type", String)
], UpdateVariacaoHabilidadeDto.prototype, "danoFlatTipo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateVariacaoHabilidadeDto.prototype, "dadosDano", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateVariacaoHabilidadeDto.prototype, "escalonaPorGrau", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateVariacaoHabilidadeDto.prototype, "escalonamentoCustoEA", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateVariacaoHabilidadeDto.prototype, "escalonamentoCustoPE", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoEscalonamentoHabilidade),
    __metadata("design:type", String)
], UpdateVariacaoHabilidadeDto.prototype, "escalonamentoTipo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateVariacaoHabilidadeDto.prototype, "escalonamentoEfeito", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateVariacaoHabilidadeDto.prototype, "escalonamentoDano", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVariacaoHabilidadeDto.prototype, "efeitoAdicional", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateVariacaoHabilidadeDto.prototype, "requisitos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateVariacaoHabilidadeDto.prototype, "ordem", void 0);
//# sourceMappingURL=update-variacao.dto.js.map